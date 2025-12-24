"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import api from "@/lib/axios";

export default function ExecutePaypalPayment() {
    const router = useRouter();
    const { orderId } = router.query; // get orderId from URL
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!orderId) return;

        const executePayment = async () => {
            const params = new URLSearchParams(window.location.search);
            const paymentID = params.get("paymentId");
            const payerID = params.get("PayerID");

            if (!paymentID || !payerID) {
                Swal.fire({
                    icon: "error",
                    title: "Payment Failed",
                    text: "Missing PayPal payment information.",
                });
                setLoading(false);
                return;
            }

            try {
                const response = await api.post(
                    `/api/paypal/execute/${orderId}/`,
                    { paymentID, payerID }
                );

                if (response.data.success) {
                    Swal.fire({
                        icon: "success",
                        title: "Payment Successful",
                        text: response.data.message,
                    }).then(() => {
                        localStorage.removeItem("checkout_item");
                        router.push("/thank-you"); // redirect to thank you page
                    });
                }
            } catch (error) {
                console.error(error);
                Swal.fire({
                    icon: "error",
                    title: "Payment Failed",
                    text:
                        error.response?.data?.message ||
                        "Failed to execute PayPal payment.",
                });
            } finally {
                setLoading(false);
            }
        };

        executePayment();
    }, [orderId, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            {loading ? (
                <p className="text-lg font-medium">Processing your payment...</p>
            ) : (
                <p className="text-lg font-medium">Payment processed.</p>
            )}
        </div>
    );
}

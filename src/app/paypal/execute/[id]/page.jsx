"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import api from "@/lib/axios";

export default function ExecutePaypalPayment() {
    const { id } = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const paymentID = searchParams.get("paymentId"); // frontend param from PayPal
        const payerID = searchParams.get("PayerID");
        console.log(payerID, paymentID)

        if (!paymentID || !payerID) {
            Swal.fire({
                icon: "error",
                title: "Payment Failed",
                text: "Missing PayPal payment information.",
            });
            setLoading(false);
            return;
        }

        const executePayment = async () => {
            try {
                // ✅ Send as POST with exact key names backend expects
                const response = await api.post(
                    `/api/paypal/execute/${id}/`,
                    {
                        paymentID, // must match backend key
                        payerID,   // must match backend key
                    }
                );

                console.log("PayPal execute response:", response.data);

                if (response.data.success) {
                    await Swal.fire({
                        icon: "success",
                        title: "Payment Successful",
                        text: response.data.message,
                    });

                    localStorage.removeItem("checkout_item");
                    router.replace("/thank-you");
                } else {
                    throw new Error(response.data.message || "Payment failed");
                }
            } catch (error) {
                console.error(error);
                Swal.fire({
                    icon: "error",
                    title: "Payment Failed",
                    text:
                        error.response?.data?.message ||
                        error.message ||
                        "Failed to execute PayPal payment.",
                });
                router.replace("/checkout");
            } finally {
                setLoading(false);
            }
        };

        executePayment();
    }, [id, searchParams, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <p className="text-lg font-medium">
                {loading ? "Processing your payment..." : "Payment processed."}
            </p>
        </div>
    );
}

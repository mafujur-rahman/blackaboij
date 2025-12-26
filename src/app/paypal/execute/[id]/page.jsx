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

    // Cancel payment helper
    const cancelPayment = async (message = "Payment cancelled") => {
        try {
            const token = localStorage.getItem("auth_token");

            const res = await api.get(`/api/paypal/cancel/${id}/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            await Swal.fire({
                icon: "error",
                title: "Payment Cancelled",
                text: res.data?.message || message,
            });
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Payment Cancelled",
                text: message,
            });
        } finally {
            router.replace("/");
        }
    };

    useEffect(() => {
        if (!id) return;

        const paymentID = searchParams.get("paymentId");
        const payerID = searchParams.get("PayerID");

        if (!paymentID || !payerID) {
            setLoading(false);
            cancelPayment("Missing PayPal payment information.");
            return;
        }

        const executePayment = async () => {
            try {
                const response = await api.post(
                    `/api/paypal/execute/${id}/`,
                    {
                        paymentID,
                        payerID,
                    }
                );

                if (response.data.success) {
                    await Swal.fire({
                        icon: "success",
                        title: "Payment Successful",
                        text: response.data.message,
                    });

                    localStorage.removeItem("checkout_item");
                    router.replace("/thank-you");
                } else {
                    throw new Error(response.data.message);
                }
            } catch (error) {
                console.error(error);
                await cancelPayment(
                    error.response?.data?.message ||
                    "Failed to execute PayPal payment."
                );
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

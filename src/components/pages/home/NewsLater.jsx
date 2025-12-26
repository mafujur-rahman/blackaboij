"use client";

import AnimatedButton from '@/components/utils/AnimatedButton';
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import api from '@/lib/axios';

const Newsletter = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;

        setIsSubmitting(true);

        Swal.fire({
            title: 'Subscribing...',
            text: 'Please wait',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        try {
            const res = await api.post(
                '/api/newsletter/create-newsletter/',
                { email }
            );

            Swal.close();

            if (res.data?.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Subscribed!',
                    text: res.data.message || 'Thank you for subscribing!',
                    confirmButtonColor: '#000',
                });
                setEmail('');
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops!',
                    text: res.data?.message || 'Something went wrong.',
                });
            }
        } catch (error) {
            Swal.close();
            Swal.fire({
                icon: 'error',
                title: 'Failed',
                text:
                    error?.response?.data?.message ||
                    'Failed to subscribe. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="my-12.5 xl:mb-25 px-4 bg-[#e2e8f0] py-16">
            <div className="max-w-4xl mx-auto text-center">

                <h2 className="text-[20px] md:text-[30px] font-bold text-black mb-4">
                    Newsletter
                </h2>

                <p className="text-sm md:text-base text-gray-700 mb-8">
                    Subscribe to receive updates, access to exclusive deals, and more.
                </p>

                <form onSubmit={handleSubmit} className="flex justify-center">
                    <div className="flex flex-col md:flex-row w-full max-w-sm sm:max-w-md">

                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isSubmitting}
                            className="flex-grow py-3 px-4 mb-2 md:mb-0 md:mr-2 lg:mr-4 text-gray-700 border border-gray-400 focus:outline-none"
                        />

                        <AnimatedButton
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 w-full md:w-auto rounded md:rounded-r-lg"
                            variant="black"
                        >
                            {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                        </AnimatedButton>

                    </div>
                </form>
            </div>
        </section>
    );
};

export default Newsletter;

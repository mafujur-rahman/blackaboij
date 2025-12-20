"use client";
import AnimatedButton from '@/components/utils/AnimatedButton';
import React, { useState } from 'react';

const Newsletter = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('');

        setTimeout(() => {
            if (email.includes('@') && email.includes('.')) {
                setMessage('Thank you for subscribing! Check your email for confirmation.');
                setEmail('');
            } else {
                setMessage('Please enter a valid email address.');
            }
            setIsSubmitting(false);
        }, 1500);
    };

    return (
        <section className="my-12.5 xl:mb-25 px-4 bg-[#e2e8f0] py-16">
            <div className="max-w-4xl mx-auto text-center">

                {/* Newsletter Heading */}
                <h2 className="text-[20px] md:text-[30px] font-bold text-black mb-4">
                    Newsletter
                </h2>

                {/* Subtitle/Description */}
                <p className="text-sm md:text-base text-gray-700 mb-8">
                    Subscribe to receive updates, access to exclusive deals, and more.
                </p>

                <form onSubmit={handleSubmit} className="flex justify-center">
                    <div className="flex flex-col md:flex-row w-full max-w-sm sm:max-w-md">

                        {/* Email Input */}
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="flex-grow py-3 px-4 mb-2 md:mb-0 md:mr-2 lg:mr-4  text-gray-700 leading-tight focus:outline-none border border-gray-400 "
                            disabled={isSubmitting}
                        />

                        {/* Subscribe Button */}
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


                {/* Feedback Message */}
                {message && (
                    <p className={`mt-4 text-sm ${message.includes('Thank you') ? 'text-green-600' : 'text-red-600'}`}>
                        {message}
                    </p>
                )}

            </div>
        </section>
    );
};

export default Newsletter;

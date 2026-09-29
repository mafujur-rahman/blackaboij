"use client"
import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import Swal from 'sweetalert2';

const ContactForm = () => {
    const form = useRef();
    const [loading, setLoading] = useState(false);

    const sendEmail = (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(form.current);

        const templateParams = {
            user_name: formData.get('user_name'),
            user_email: formData.get('user_email'),
            subject: formData.get('subject'),
            message: formData.get('message'),
            // reply_to is important so replies go to the sender
            reply_to: formData.get('user_email'),
        };

        emailjs
            .send(
                'service_yquye5x',
                'template_b4ht8vg',
                templateParams,
                'OoZP5Z8FR4WQ9bq2Q'
            )
            .then(
                (result) => {
                    console.log(result.text);
                    Swal.fire({
                        icon: 'success',
                        title: 'Message Sent!',
                        text: 'Thank you for reaching out. We will get back to you soon.',
                        confirmButtonColor: '#000000',
                    });
                    form.current.reset();
                },
                (error) => {
                    console.log(error.text);
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Failed to send the message, please try again.',
                        confirmButtonColor: '#000000',
                    });
                }
            )
            .finally(() => setLoading(false));
    };

    return (
        <section className="bg-white text-black p-4 sm:p-8 md:p-12 lg:p-16">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">

                <div className="flex flex-col space-y-8">
                    <h2 className="text-[30px] md:text-[36px] font-bold mb-4">
                        Contact Us
                    </h2>

                    <div>
                        <h3 className="text-[20px] font-bold mb-2">Our Address</h3>
                        <p className="text-[16px] text-gray-700">
                            20 Allée des Piboules résidence les Belenos 13800 Istres
                        </p>
                    </div>

                    <div>
                        <h3 className="text-[20px] font-bold mb-2">Contact Information</h3>
                        <p className="text-[16px] text-gray-700">
                            Email:
                            <a href="mailto:info@blackaboli.com" className="text-black hover:text-gray-700 underline ml-1">
                                info@blackaboij.com
                            </a>
                        </p>
                        <p className="text-[16px] text-gray-700">
                            Phone:
                            <a href="tel:+33662023969" className="text-black hover:text-gray-700 underline ml-1">
                                +33662023969
                            </a>
                        </p>
                    </div>
                </div>

                <div className="flex flex-col space-y-6">
                    <form ref={form} onSubmit={sendEmail} className="w-full">

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <input
                                type="text"
                                name="user_name"
                                placeholder="Full Name"
                                className="w-full bg-white border border-gray-300 p-3 text-black placeholder-gray-600 focus:outline-none focus:border-gray-500 transition duration-150"
                                aria-label="Full Name"
                                required
                            />
                            <input
                                type="email"
                                name="user_email"
                                placeholder="Email Address"
                                className="w-full bg-white border border-gray-300 p-3 text-black placeholder-gray-600 focus:outline-none focus:border-gray-500 transition duration-150"
                                aria-label="Email Address"
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <input
                                type="text"
                                name="subject"
                                placeholder="Subject"
                                className="w-full bg-white border border-gray-300 p-3 text-black placeholder-gray-600 focus:outline-none focus:border-gray-500 transition duration-150"
                                aria-label="Subject"
                                required
                            />
                        </div>

                        <div className="mb-8">
                            <textarea
                                name="message"
                                placeholder="Your Message"
                                rows="7"
                                className="w-full bg-white border border-gray-300 p-3 text-black placeholder-gray-600 focus:outline-none focus:border-gray-500 resize-none transition duration-150"
                                aria-label="Your Message"
                                required
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white font-semibold py-4 px-6 uppercase tracking-wider cursor-pointer focus:outline-none focus:ring-4 focus:ring-black focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Sending...' : 'Send Message'}
                        </button>

                    </form>
                </div>

            </div>
        </section>
    );
};

export default ContactForm;
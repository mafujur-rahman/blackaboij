import React, { useRef } from 'react';
import emailjs from '@emailjs/browser';

const ContactForm = () => {
    const form = useRef();

    const sendEmail = (e) => {
        e.preventDefault();

        emailjs
            .sendForm(
                'service_gcir5du',
                'template_opbg8c4',
                form.current,
                'jagOtaVpcfoeFf8Ow'
            )
            .then(
                (result) => {
                    console.log(result.text);
                    alert('Message sent successfully!');
                    form.current.reset();
                },
                (error) => {
                    console.log(error.text);
                    alert('Failed to send the message, please try again.');
                }
            );
    };

    return (
        <section className="bg-white text-black p-4 sm:p-8 md:p-12 lg:p-16">

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">

                <div className="flex flex-col space-y-8">

                    <h2 className="text-[30px] md:text-[36px] font-bold mb-4">
                        Contact Us
                    </h2>

                    {/* Our Address */}
                    <div>
                        <h3 className="text-[20px] font-bold mb-2">
                            Our Address
                        </h3>
                        <p className="text-[16px] text-gray-700">
                            20 Allée des Piboules résidence les Belenos 13800 Istres
                        </p>
                    </div>

                    {/* Contact Information */}
                    <div>
                        <h3 className="text-[20px] font-bold mb-2">
                            Contact Information
                        </h3>
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

                {/* === RIGHT COLUMN: Contact Form === */}
                <div className="flex flex-col space-y-6">
                    <form ref={form} onSubmit={sendEmail} className="w-full">

                        {/* Full Name and Email Address (Side-by-side on large screens) */}
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

                        {/* Subject */}
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

                        {/* Your Message */}
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

                        {/* Send Message Button */}
                        <button
                            type="submit"
                            className="w-full bg-black text-white font-semibold py-4 px-6 uppercase tracking-wider  cursor-pointer focus:outline-none focus:ring-4 focus:ring-black focus:ring-opacity-50"
                        >
                            Send Message
                        </button>

                    </form>
                </div>

            </div>
        </section>
    );
};

export default ContactForm;
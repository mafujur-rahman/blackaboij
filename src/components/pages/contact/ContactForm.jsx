import React from 'react';

const ContactForm = () => {
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
                    <form className="w-full">

                        {/* Full Name and Email Address (Side-by-side on large screens) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <input
                                type="text"
                                placeholder="Full Name"
                                className="w-full bg-white border border-gray-300 p-3 text-black placeholder-gray-600 focus:outline-none focus:border-gray-500 transition duration-150"
                                aria-label="Full Name"
                            />
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="w-full bg-white border border-gray-300 p-3 text-black placeholder-gray-600 focus:outline-none focus:border-gray-500 transition duration-150"
                                aria-label="Email Address"
                            />
                        </div>

                        {/* Subject */}
                        <div className="mb-6">
                            <input
                                type="text"
                                placeholder="Subject"
                                className="w-full bg-white border border-gray-300 p-3 text-black placeholder-gray-600 focus:outline-none focus:border-gray-500 transition duration-150"
                                aria-label="Subject"
                            />
                        </div>

                        {/* Your Message */}
                        <div className="mb-8">
                            <textarea
                                placeholder="Your Message"
                                rows="7"
                                className="w-full bg-white border border-gray-300 p-3 text-black placeholder-gray-600 focus:outline-none focus:border-gray-500 resize-none transition duration-150"
                                aria-label="Your Message"
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
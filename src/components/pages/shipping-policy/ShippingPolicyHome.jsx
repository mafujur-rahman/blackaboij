import React from 'react';
import { FiTruck, FiMapPin, FiMail, FiClock, FiGlobe, FiPackage, FiDollarSign, FiAlertTriangle, FiInfo, FiPhone } from "react-icons/fi";

const ShippingPolicyHome = () => {
    return (
        <div className='bg-gray-200 py-12.5'>
            <div className="px-4 lg:px-12 xl:container xl:mx-auto xl:px-0 py-12.5 bg-white shadow-xl rounded-lg">
                <div className="space-y-10 text-gray-800 px-4 lg:px-8">

                    {/* Header */}
                    <div className="space-y-2 text-center">
                        <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
                            <FiTruck className="text-4xl" />
                            Shipping Policy
                        </h1>
                        <p className="text-base text-gray-500">
                            Last Updated: <span className="font-medium">October 29, 2024</span>
                        </p>
                    </div>

                    {/* Shipping Destinations */}
                    <section className="space-y-3">
                        <h2 className="text-2xl font-semibold flex items-center gap-2">
                            <FiGlobe /> Shipping Destinations
                        </h2>
                        <ul className="list-disc pl-5 space-y-2 text-lg">
                            <li><span className="font-medium">Domestic:</span> We ship throughout France.</li>
                            <li><span className="font-medium">International:</span> Available for select destinations. Fees and delivery times vary.</li>
                        </ul>
                    </section>

                    {/* Processing Time */}
                    <section className="space-y-3">
                        <h2 className="text-2xl font-semibold flex items-center gap-2">
                            <FiClock /> Processing Time
                        </h2>
                        <p className="text-lg leading-relaxed">
                            Orders are processed within <span className="font-medium">1–3 business days</span>
                            after payment confirmation. Delays may occur during peak seasons.
                        </p>
                    </section>

                    {/* Shipping Options */}
                    <section className="space-y-3">
                        <h2 className="text-2xl font-semibold flex items-center gap-2">
                            <FiTruck /> Shipping Options & Delivery Times
                        </h2>
                        <p className="text-lg leading-relaxed">
                            Delivery times vary based on destination, carrier delays, or customs processing.
                        </p>
                        <div className="flex items-start gap-2 bg-gray-100 p-3 rounded-md text-lg">
                            <FiInfo className="mt-1" />
                            <p>
                                <span className="font-medium">Express shipping</span> is available in select regions
                                and may incur additional costs.
                            </p>
                        </div>
                    </section>

                    {/* Shipping Costs */}
                    <section className="space-y-3">
                        <h2 className="text-2xl font-semibold flex items-center gap-2">
                            <FiDollarSign /> Shipping Costs
                        </h2>
                        <ul className="list-disc pl-5 space-y-2 text-lg">
                            <li>
                                <span className="font-medium">France:</span> Free standard shipping on orders over €XX.
                                Fees apply to smaller orders.
                            </li>
                            <li>
                                <span className="font-medium">International:</span> Calculated at checkout based on
                                destination and order weight.
                            </li>
                        </ul>
                    </section>

                    {/* Tracking */}
                    <section className="space-y-3">
                        <h2 className="text-2xl font-semibold flex items-center gap-2">
                            <FiPackage /> Tracking Information
                        </h2>
                        <p className="text-lg leading-relaxed">
                            Once shipped, you’ll receive a confirmation email with a tracking link.
                        </p>
                    </section>

                    {/* Customs */}
                    <section className="space-y-3">
                        <h2 className="text-2xl font-semibold flex items-center gap-2">
                            <FiGlobe /> Customs & Duties
                        </h2>
                        <p className="text-lg leading-relaxed">
                            International orders may be subject to customs fees or import duties.
                            <span className="font-medium"> blackaboij</span> is not responsible for these charges.
                        </p>
                    </section>

                    {/* Incorrect Address */}
                    <section className="space-y-3">
                        <h2 className="text-2xl font-semibold flex items-center gap-2">
                            <FiAlertTriangle /> Incorrect Address
                        </h2>
                        <p className="text-lg leading-relaxed">
                            Please ensure your shipping address is correct at checkout.
                            Re-shipping fees may apply for returned packages.
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="space-y-3">
                        <h2 className="text-2xl font-semibold flex items-center gap-2">
                            <FiPhone /> Contact Us
                        </h2>

                        <div className="space-y-2 text-lg bg-gray-200 py-4 px-3 rounded-lg">
                            <p className="font-medium">blackaboij</p>

                            <p className="flex items-center gap-2">
                                <FiMapPin className="text-xl" />
                                <span>13800 Istres, France</span>
                            </p>

                            <p className="flex items-center gap-2">
                                <FiMail className="text-xl" />
                                <a
                                    href="mailto:blackaboij@gmail.com"
                                    className="underline hover:text-black"
                                >
                                    blackaboij@gmail.com
                                </a>
                            </p>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
};

export default ShippingPolicyHome;

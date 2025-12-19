import React from 'react';
import { FiFileText, FiHome, FiPackage, FiMail, FiDollarSign, FiTruck, FiRefreshCw, FiAlertCircle, FiShield, FiLock, FiSlash, FiRepeat, FiPhone, FiMapPin } from "react-icons/fi";

const TermsConditionsHome = () => {
    return (
        <div className='bg-gray-200 py-12.5'>
            <div className="px-4 lg:px-12 xl:px-12.5 py-12.5 bg-white shadow-xl rounded-lg">
                <div className="space-y-10 text-gray-800 px-4 lg:px-8">

                    {/* Header */}
                    <div className="space-y-2 text-center">
                        <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
                            <FiFileText className="text-4xl" />
                            Terms and Conditions
                        </h1>
                        <p className="text-base text-gray-500">
                            Last Updated: <span className="font-medium">10-29-2024</span>
                        </p>
                    </div>

                    {/* 1. General Information */}
                    <section className="space-y-3">
                        <h2 className="text-2xl font-semibold flex items-center gap-2">
                            <FiHome /> 1. General Information
                        </h2>
                        <p className="text-lg leading-relaxed">
                            Welcome to <span className="font-medium">blackaboij</span>! These Terms and Conditions govern
                            your use of our website and the purchase of products from us. By using our website,
                            you agree to these terms.
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-lg">
                            <li><span className="font-medium">Company Name:</span> blackaboij</li>
                            <li><span className="font-medium">Business Address:</span> 13800 Istres, France</li>
                            <li><span className="font-medium">Contact Email:</span> blackaboij@gmail.com</li>
                            <li><span className="font-medium">Applicable Law:</span> French law and EU e-commerce regulations</li>
                        </ul>
                    </section>

                    {/* 2. Product Information */}
                    <section className="space-y-3">
                        <h2 className="text-2xl font-semibold flex items-center gap-2">
                            <FiPackage /> 2. Product Information
                        </h2>
                        <p className="text-lg leading-relaxed">
                            We strive to provide accurate descriptions and images for our products
                            (including t-shirts, pants, hoodies, shoes, and accessories).
                            Minor color or appearance variations may occur due to screen settings
                            or production differences and do not qualify for refunds.
                        </p>
                    </section>

                    {/* 3. Orders and Acceptance */}
                    <section className="space-y-3">
                        <h2 className="text-2xl font-semibold flex items-center gap-2">
                            <FiMail /> 3. Orders and Acceptance
                        </h2>
                        <ul className="list-disc pl-5 space-y-2 text-lg">
                            <li>
                                After placing an order, you will receive a confirmation email
                                summarizing your items and prices.
                            </li>
                            <li>
                                We reserve the right to refuse or cancel an order due to pricing errors,
                                stock limitations, or other valid reasons. If canceled, you will be notified
                                and refunded.
                            </li>
                        </ul>
                    </section>

                    {/* 4. Prices and Payment */}
                    <section className="space-y-3">
                        <h2 className="text-2xl font-semibold flex items-center gap-2">
                            <FiDollarSign /> 4. Prices and Payment
                        </h2>
                        <ul className="list-disc pl-5 space-y-2 text-lg">
                            <li>
                                <span className="font-medium">Prices:</span> Listed in applicable currency and include VAT
                                as required by French law. Shipping fees are calculated at checkout.
                            </li>
                            <li>
                                <span className="font-medium">Payment Methods:</span> We accept major credit cards and other
                                secure payment options.
                            </li>
                            <li>
                                <span className="font-medium">Promotions:</span> Discounts are subject to specific terms
                                and may not be combined unless stated.
                            </li>
                        </ul>
                    </section>

                    {/* 5. Shipping and Delivery */}
                    <section className="space-y-3">
                        <h2 className="text-2xl font-semibold flex items-center gap-2">
                            <FiTruck /> 5. Shipping and Delivery
                        </h2>
                        <ul className="list-disc pl-5 space-y-2 text-lg">
                            <li>Estimated delivery times are shown at checkout.</li>
                            <li>Shipping fees are calculated based on destination and order weight.</li>
                            <li>
                                We are not liable for delays caused by third-party carriers or customs issues.
                                Please contact us for lost or damaged packages.
                            </li>
                        </ul>
                    </section>

                    {/* 6. Returns */}
                    <section className="space-y-3">
                        <h2 className="text-2xl font-semibold flex items-center gap-2">
                            <FiRefreshCw /> 6. Returns and Refunds
                        </h2>
                        <p className="text-lg">
                            For information regarding returns and refunds, please review our Return Policy.
                        </p>
                    </section>

                    {/* 7. Limitation of Liability */}
                    <section className="space-y-3">
                        <h2 className="text-2xl font-semibold flex items-center gap-2">
                            <FiAlertCircle /> 7. Limitation of Liability
                        </h2>
                        <p className="text-lg leading-relaxed">
                            blackaboij is not responsible for any indirect, incidental, or consequential damages
                            arising from the use of our website or products, to the extent permitted by law.
                        </p>
                    </section>

                    {/* 8. Intellectual Property */}
                    <section className="space-y-3">
                        <h2 className="text-2xl font-semibold flex items-center gap-2">
                            <FiShield /> 8. Intellectual Property
                        </h2>
                        <p className="text-lg leading-relaxed">
                            All content, including images, text, graphics, and logos, is the property of blackaboij.
                            You may not reproduce or distribute any content without permission.
                        </p>
                    </section>

                    {/* 9. Privacy */}
                    <section className="space-y-3">
                        <h2 className="text-2xl font-semibold flex items-center gap-2">
                            <FiLock /> 9. Privacy Policy
                        </h2>
                        <p className="text-lg">
                            Please refer to our Privacy Policy for details on how we collect and protect your data.
                        </p>
                    </section>

                    {/* 10. User Conduct */}
                    <section className="space-y-3">
                        <h2 className="text-2xl font-semibold flex items-center gap-2">
                            <FiSlash /> 10. User Conduct
                        </h2>
                        <ul className="list-disc pl-5 space-y-2 text-lg">
                            <li>Do not disrupt or misuse our website.</li>
                            <li>Do not provide false information when placing orders.</li>
                            <li>Do not reproduce or exploit any part of our website or products.</li>
                        </ul>
                    </section>

                    {/* 11. Changes */}
                    <section className="space-y-3">
                        <h2 className="text-2xl font-semibold flex items-center gap-2">
                            <FiRepeat /> 11. Changes to Terms and Conditions
                        </h2>
                        <p className="text-lg">
                            We may update these Terms and Conditions from time to time.
                            Please review this page periodically.
                        </p>
                    </section>

                    {/* 12. Contact */}
                    <section className="space-y-3">
                        <h2 className="text-2xl font-semibold flex items-center gap-2">
                            <FiPhone /> 12. Contact Us
                        </h2>
                        <div className="space-y-2 text-lg bg-gray-200 py-4 px-3 rounded-lg">
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

export default TermsConditionsHome;

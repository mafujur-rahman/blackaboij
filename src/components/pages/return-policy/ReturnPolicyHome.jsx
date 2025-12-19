import React from 'react';
import { FiPackage, FiFileText, FiCheckCircle, FiTruck, FiRefreshCw, FiTool, FiPhone, FiMapPin, FiMail } from "react-icons/fi";

const ReturnPolicyHome = () => {
    return (
        <div className='bg-gray-200 py-12.5'>
            <div className="px-4 lg:px-12 xl:px-12.5 py-12.5 bg-white shadow-xl rounded-lg">
                <div className="space-y-10 text-gray-800 px-4 lg:px-8">

                    {/* Header */}
                    <div className="space-y-2 text-center">
                        <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
                            <FiPackage className="text-4xl" />
                            Return Policy
                        </h1>
                        <p className="text-base text-gray-500">
                            Last Updated: <span className="font-medium">10-29-2024</span>
                        </p>
                    </div>

                    {/* 1. Overview */}
                    <section className="space-y-3">
                        <h2 className="text-2xl font-semibold flex items-center gap-2">
                            <FiFileText /> 1. Overview
                        </h2>
                        <p className="text-lg leading-relaxed">
                            At <span className="font-medium">blackaboij</span>, we want you to be completely satisfied
                            with your purchase. If you’re not fully happy, you may return your items within the
                            specified time frame under the conditions outlined below.
                        </p>
                    </section>

                    {/* 2. Eligibility */}
                    <section className="space-y-3">
                        <h2 className="text-2xl font-semibold flex items-center gap-2">
                            <FiCheckCircle /> 2. Eligibility for Returns
                        </h2>
                        <ul className="list-disc pl-5 space-y-2 text-lg">
                            <li>Items can be returned within 14 days of receiving your order, per French consumer laws.</li>
                            <li>Items must be unused, in original condition, with all tags and packaging intact.</li>
                            <li>
                                Personalized products or final sale items may not be eligible.
                                Please check the product description for exclusions.
                            </li>
                        </ul>
                    </section>

                    {/* 3. Return Process */}
                    <section className="space-y-3">
                        <h2 className="text-2xl font-semibold flex items-center gap-2">
                            <FiTruck /> 3. Return Process
                        </h2>
                        <p className="text-lg">
                            To initiate a return, please follow these steps:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-lg">
                            <li>
                                Contact Customer Support at{" "}
                                <a
                                    href="mailto:blackaboij@gmail.com"
                                    className="font-medium underline hover:text-black"
                                >
                                    blackaboij@gmail.com
                                </a>{" "}
                                within 14 days and provide your order details.
                            </li>
                            <li>
                                Securely package the items with the original packing slip or proof of purchase.
                            </li>
                            <li>
                                Ship items to the address provided in return instructions.
                                Return shipping costs are your responsibility unless the item was incorrect
                                or defective.
                            </li>
                        </ul>
                    </section>

                    {/* 4. Refunds */}
                    <section className="space-y-3">
                        <h2 className="text-2xl font-semibold flex items-center gap-2">
                            <FiRefreshCw /> 4. Refunds
                        </h2>
                        <p className="text-lg leading-relaxed">
                            Once your return is received and inspected, you will be notified of approval or rejection.
                            Approved refunds will be processed to the original payment method within
                            <span className="font-medium"> 7–14 business days</span>.
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-lg">
                            <li>
                                <span className="font-medium">Shipping fees:</span> Non-refundable unless the item was
                                incorrect or defective.
                            </li>
                            <li>
                                <span className="font-medium">Exchanges:</span> Please return the original item and
                                place a new order for size or color changes.
                            </li>
                        </ul>
                    </section>

                    {/* 5. Damaged Items */}
                    <section className="space-y-3">
                        <h2 className="text-2xl font-semibold flex items-center gap-2">
                            <FiTool /> 5. Damaged or Defective Items
                        </h2>
                        <p className="text-lg leading-relaxed">
                            If your item arrives damaged or defective, notify us within
                            <span className="font-medium"> 7 days </span>
                            of receipt. We will arrange a replacement or refund at no extra cost.
                        </p>
                    </section>

                    {/* 6. Contact */}
                    <section className="space-y-3">
                        <h2 className="text-2xl font-semibold flex items-center gap-2">
                            <FiPhone /> 6. Contact Us
                        </h2>
                        <p className="text-lg">
                            For questions or assistance with your return, contact us:
                        </p>

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

export default ReturnPolicyHome;

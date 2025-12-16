"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { IoLogoFacebook, IoLogoInstagram, IoLogoYoutube } from "react-icons/io5";
import { IoIosArrowUp } from "react-icons/io";
import { FaPinterest } from "react-icons/fa6";

const socialLinks = [
    { icon: IoLogoFacebook, href: "https://www.facebook.com/BBOIJ", label: "Facebook" },
    { icon: FaPinterest, href: "https://fr.pinterest.com/blackaboij/", label: "Pinterest" },
    { icon: IoLogoInstagram, href: "https://www.instagram.com/accounts/login/?next=%2Fblackaboij_%2F&source=omni_redirect", label: "Instagram" },
    { icon: IoLogoYoutube, href: "https://www.blackaboij.com/", label: "YouTube" },
];

const FooterLink = ({ href, children }) => (
    <Link
        href={href}
        className="text-gray-400 hover:text-white transition-colors duration-200 block mb-2 last:mb-0"
    >
        {children}
    </Link>
);

const Footer = () => {
    return (
        <footer className="bg-black text-white pt-10 pb-4 md:pt-16">
            <div className="px-4 lg:px-12 xl:container xl:mx-auto xl:px-0">
                {/* Logo Section */}
                <div className="text-center mb-10">
                    <Link href="/" className="inline-block">
                        <Image
                            src="/images/logo.png"
                            alt="BlackaboiJ Logo"
                            width={180}
                            height={50}
                            className="object-contain"
                        />
                    </Link>
                </div>

                {/* Main Links Grid */}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4 md:gap-4 lg:gap-16 text-lg">
                    {/* COLLECTIONS */}
                    <div>
                        <h3 className="uppercase text-white font-semibold mb-4 tracking-wider">
                            COLLECTIONS
                        </h3>
                        <nav className="text-lg">
                            <FooterLink href="/men/men-collection">Men</FooterLink>
                            <FooterLink href="/women/women-collection">Women</FooterLink>
                            <FooterLink href="/accessories">Accessories</FooterLink>
                        </nav>
                    </div>

                    {/* MORE */}
                    <div>
                        <h3 className="uppercase text-white font-semibold mb-4 tracking-wider">
                            MORE
                        </h3>
                        <nav>
                            <FooterLink href="/">Home</FooterLink>
                            <FooterLink href="/contact">Contact</FooterLink>
                        </nav>
                    </div>

                    {/* INFORMATION */}
                    <div>
                        <h3 className="uppercase text-white font-semibold mb-4 tracking-wider">
                            INFORMATION
                        </h3>
                        <nav>
                            <FooterLink href="/return-policy">Return Policy</FooterLink>
                            <FooterLink href="/terms-conditions">
                                Terms of Conditions
                            </FooterLink>
                            <FooterLink href="/shipping-policy">Shipping Policy</FooterLink>
                        </nav>
                    </div>

                    {/* SOCIAL */}
                    <div>
                        <h3 className="uppercase text-white font-semibold mb-4 tracking-wider">
                            SOCIAL
                        </h3>
                        <p className="text-gray-400 mb-4">Stay connected</p>
                        <div className="flex space-x-3 justify-start">
                            {socialLinks.map((item, index) => (
                                <a
                                    key={index}
                                    href={item.href}
                                    aria-label={item.label}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-white transition-colors duration-200"
                                >
                                    <item.icon size={22} />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Copyright Section */}
                <div className="mt-12 pt-4 border-t border-white/50 text-center">
                    <p className="text-sm text-gray-300">Copyright &copy; 2025 BlackaboiJ</p>
                </div>
            </div>

            {/* Scroll to Top Button */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="fixed bottom-4 right-4 bg-white text-black p-3 rounded-full shadow-lg hover:bg-gray-200 transition-colors z-50"
                aria-label="Scroll to top"
                title="Scroll to top"
            >
                <IoIosArrowUp size={28} />
            </button>
        </footer>
    );
};

export default Footer;

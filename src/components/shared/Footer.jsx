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
    <Link href={href} className="text-white transition-colors duration-200 block mb-2 last:mb-0">
        {children}
    </Link>
);

const Footer = () => {
    return (
        <footer className="bg-black text-white pt-10 pb-4 md:pt-16">
            <div className="px-4 lg:px-12">
                {/* Logo Section */}
                <div className="text-center mb-10">
                    <Link href="/" className="inline-block">
                        <Image
                            src="/images/new-logo.png"
                            alt="BlackaboiJ Logo"
                            width={180}
                            height={50}
                            className="object-contain"
                        />
                    </Link>
                </div>

                <div className="flex flex-col md:flex-row justify-between gap-8 text-[16px]">
                    {/* Column 1: Collections */}
                    <div className="">
                        <h3 className="uppercase text-white font-semibold mb-4 tracking-wider">COLLECTIONS</h3>
                        <nav className="text-[15px]">
                            <FooterLink href="/men/men-collection">Men</FooterLink>
                            <FooterLink href="/women/women-collection">Women</FooterLink>
                            <FooterLink href="/accessories">Accessories</FooterLink>
                        </nav>
                    </div>

                    {/* Column 2: More */}
                    <div className="">
                        <h3 className="uppercase text-white font-semibold mb-4 tracking-wider">MORE</h3>
                        <nav>
                            <FooterLink href="/">Home</FooterLink>
                            <FooterLink href="/contact">Contact</FooterLink>
                        </nav>
                    </div>

                    {/* Column 3: Information */}
                    <div className="">
                        <h3 className="uppercase text-white font-semibold mb-4 tracking-wider">INFORMATION</h3>
                        <nav>
                            <FooterLink href="/return-policy">Return Policy</FooterLink>
                            <FooterLink href="/terms-conditions">Terms of Conditions</FooterLink>
                            <FooterLink href="/shipping-policy">Shipping Policy</FooterLink>
                        </nav>
                    </div>

                    {/* Column 4: Social */}
                    <div className=" flex flex-col">
                        <h3 className="uppercase text-white font-semibold mb-4 tracking-wider">SOCIAL</h3>
                        <p className="text-white mb-4">Stay connected</p>
                        <div className="flex justify-start gap-2">
                            {socialLinks.map((item, index) => (
                                <a
                                    key={index}
                                    href={item.href}
                                    aria-label={item.label}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-white transition-colors duration-200"
                                >
                                    <item.icon size={22} />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>


                {/* Copyright */}
                <div className="mt-12 pt-4 text-center">
                    <p className="text-sm text-gray-300">Copyright &copy; {new Date().getFullYear()} Blackaboij</p>
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

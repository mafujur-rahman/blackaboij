// "use client";

// import React from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { IoLogoFacebook, IoLogoInstagram, IoLogoYoutube } from "react-icons/io5";
// import { IoIosArrowUp } from "react-icons/io";
// import { FaPinterest } from "react-icons/fa6";

// const socialLinks = [
//     { icon: IoLogoFacebook, href: "https://www.facebook.com/BBOIJ", label: "Facebook" },
//     { icon: FaPinterest, href: "https://fr.pinterest.com/blackaboij/", label: "Pinterest" },
//     { icon: IoLogoInstagram, href: "https://www.instagram.com/accounts/login/?next=%2Fblackaboij_%2F&source=omni_redirect", label: "Instagram" },
//     { icon: IoLogoYoutube, href: "https://www.blackaboij.com/", label: "YouTube" },
// ];

// const FooterLink = ({ href, children }) => (
//     <Link href={href} className="text-white transition-colors duration-200 block mb-2 last:mb-0">
//         {children}
//     </Link>
// );

// const Footer = () => {
//     return (
//         <footer className="bg-black text-white pt-10 pb-4 md:pt-16">
//             <div className="px-4 lg:px-12 xl:px-24 2xl:px-48">
//                 {/* Logo Section */}
//                 <div className="text-center mb-10">
//                     <Link href="/" className="inline-block">
//                         <Image
//                             src="/images/new-logo.png"
//                             alt="BlackaboiJ Logo"
//                             width={180}
//                             height={50}
//                             className="object-contain"
//                         />
//                     </Link>
//                 </div>

//                 <div className="flex flex-col md:flex-row justify-between gap-8 text-[16px]">
//                     {/* Column 1: Collections */}
//                     <div className="">
//                         <h3 className="uppercase text-white font-semibold mb-4 tracking-wider">COLLECTIONS</h3>
//                         <nav className="text-[15px]">
//                             <FooterLink href="/men/men-collection">Men</FooterLink>
//                             <FooterLink href="/women/women-collection">Women</FooterLink>
//                             <FooterLink href="/accessories">Accessories</FooterLink>
//                         </nav>
//                     </div>

//                     {/* Column 2: More */}
//                     <div className="">
//                         <h3 className="uppercase text-white font-semibold mb-4 tracking-wider">MORE</h3>
//                         <nav>
//                             <FooterLink href="/">Home</FooterLink>
//                             <FooterLink href="/contact">Contact</FooterLink>
//                         </nav>
//                     </div>

//                     {/* Column 3: Information */}
//                     <div className="">
//                         <h3 className="uppercase text-white font-semibold mb-4 tracking-wider">INFORMATION</h3>
//                         <nav>
//                             <FooterLink href="/return-policy">Return Policy</FooterLink>
//                             <FooterLink href="/terms-conditions">Terms of Conditions</FooterLink>
//                             <FooterLink href="/shipping-policy">Shipping Policy</FooterLink>
//                         </nav>
//                     </div>

//                     {/* Column 4: Social */}
//                     <div className=" flex flex-col">
//                         <h3 className="uppercase text-white font-semibold mb-4 tracking-wider">SOCIAL</h3>
//                         <p className="text-white mb-4">Stay connected</p>
//                         <div className="flex justify-start gap-2">
//                             {socialLinks.map((item, index) => (
//                                 <a
//                                     key={index}
//                                     href={item.href}
//                                     aria-label={item.label}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     className="text-white transition-colors duration-200"
//                                 >
//                                     <item.icon size={22} />
//                                 </a>
//                             ))}
//                         </div>
//                     </div>
//                 </div>


//                 {/* Copyright */}
//                 <div className="mt-12 pt-4 text-center">
//                     <p className="text-sm text-gray-300">Copyright &copy; {new Date().getFullYear()} Blackaboij Designed & Developed by Graphitricks</p> 
//                 </div>
//             </div>

//             {/* Scroll to Top Button */}
//             <button
//                 onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
//                 className="fixed bottom-4 right-4 bg-white text-black p-3 rounded-full shadow-lg hover:bg-gray-200 transition-colors z-50"
//                 aria-label="Scroll to top"
//                 title="Scroll to top"
//             >
//                 <IoIosArrowUp size={28} />
//             </button>
//         </footer>
//     );
// };

// export default Footer;

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FaTwitter, FaPinterestP, FaInstagram } from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="bg-black text-white pt-10 pb-4 md:pt-16 w-full">
            <div className="px-4 lg:px-12 xl:px-24 2xl:px-48">
                
                {/* Top Section with Horizontal Lines and Centered Brand */}
                <div className="flex items-center justify-between mb-16">
                    <div className="flex-1 border-t border-white/20"></div>
                    <div className="mx-6 text-center">
                        <Link href="/" className="inline-block">
                            <Image
                                src="/images/new-logo.png"
                                alt="BlackaboiJ Logo"
                                width={180}
                                height={50}
                                className="object-contain brightness-0 invert"
                            />
                        </Link>
                    </div>
                    <div className="flex-1 border-t border-white/20"></div>
                </div>

                {/* Main 3-Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start ">
                    
                    {/* Left Column: Navigation Links (Now Collections) */}
                    <div className="flex flex-col space-y-4 text-left md:text-left">
                        <Link href="/men/men-collection" className="text-lg uppercase tracking-[0.2em] text-white/70 font-light hover:text-white transition-colors duration-300">
                            MEN
                        </Link>
                        <Link href="/women/women-collection" className="text-lg uppercase tracking-[0.2em] text-white/70 font-light hover:text-white transition-colors duration-300">
                            WOMEN
                        </Link>
                        <Link href="/accessories" className="text-lg uppercase tracking-[0.2em] text-white/70 font-light hover:text-white transition-colors duration-300">
                            ACCESSORIES
                        </Link>
                        <Link href="/contact" className="text-lg uppercase tracking-[0.2em] text-white/70 font-light hover:text-white transition-colors duration-300">
                            CONTACT
                        </Link>
                    </div>

                    {/* Center Column: Social Icons, Divider, and Newsletter */}
                    <div className="flex flex-col items-center text-center">
                        {/* Social Icons */}
                        <div className="flex items-center space-x-6 mb-8 text-white">
                            <a href="https://www.facebook.com/BBOIJ" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-white/60 transition-colors duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                            </a>
                            <a href="https://fr.pinterest.com/blackaboij/" target="_blank" rel="noopener noreferrer" aria-label="Pinterest" className="hover:text-white/60 transition-colors duration-300">
                                <FaPinterestP size={18} />
                            </a>
                            <a href="https://www.instagram.com/accounts/login/?next=%2Fblackaboij_%2F&source=omni_redirect" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-white/60 transition-colors duration-300">
                                <FaInstagram size={18} />
                            </a>
                            <a href="https://www.blackaboij.com/" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="hover:text-white/60 transition-colors duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                </svg>
                            </a>
                        </div>

                        {/* Vertical Line */}
                        <div className="w-[1px] h-12 bg-white/20 mb-8"></div>

                        {/* Weekly Newsletter Header */}
                        <h3 className="text-lg uppercase tracking-[0.2em] font-light text-white/70 mb-4">
                            WEEKLY NEWSLETTER
                        </h3>

                        {/* Newsletter Form Box */}
                        <div className="w-full max-w-[280px] border border-white/30 flex flex-col">
                            <input
                                type="email"
                                placeholder="NAME@EMAIL.COM"
                                className="w-full py-2.5 px-3 text-center text-sm tracking-[0.15em] placeholder-white/50 text-white bg-transparent focus:outline-none border-b border-white/30"
                            />
                            <button
                                type="button"
                                className="w-full py-2.5 text-center text-sm tracking-[0.2em] bg-white text-black cursor-pointer hover:bg-white/90 transition-colors duration-300"
                            >
                                SUBSCRIBE
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Navigation Links (Now Information) */}
                    <div className="flex flex-col space-y-4 text-left md:text-right">
                        <Link href="/return-policy" className="text-lg uppercase tracking-[0.2em] text-white/70 font-light hover:text-white transition-colors duration-300">
                            RETURN POLICY
                        </Link>
                        <Link href="/terms-conditions" className="text-lg uppercase tracking-[0.2em] text-white/70 font-light hover:text-white transition-colors duration-300">
                            TERMS OF CONDITIONS
                        </Link>
                        <Link href="/shipping-policy" className="text-lg uppercase tracking-[0.2em] text-white/70 font-light hover:text-white transition-colors duration-300">
                            SHIPPING POLICY
                        </Link>
                    </div>

                </div>

                {/* Bottom Copyright */}
                <div className="text-center mt-20">
                    <p className="text-sm tracking-[0.15em] text-white/50 font-light">
                        &copy; {new Date().getFullYear()} Blackaboij Designed & Developed by Graphitricks
                    </p>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
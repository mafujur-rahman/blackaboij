"use client";
import Image from "next/image";
import { IoLogoFacebook, IoLogoInstagram, IoLogoYoutube } from "react-icons/io5";
import { FaPinterest } from "react-icons/fa6";
import AnimatedButton from "@/components/utils/AnimatedButton";

const SOCIAL_LINKS = [
    { icon: IoLogoFacebook, href: "https://www.facebook.com/BBOIJ", label: "Facebook" },
    { icon: FaPinterest, href: "https://fr.pinterest.com/blackaboij/", label: "Pinterest" },
    { icon: IoLogoInstagram, href: "https://www.instagram.com/accounts/login/?next=%2Fblackaboij_%2F&source=omni_redirect", label: "Instagram" },
    { icon: IoLogoYoutube, href: "https://www.blackaboij.com/", label: "YouTube" },
];

const SocialLink = ({ icon: Icon, href, label }) => {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="text-2xl lg:text-3xl text-gray-300 hover:text-white transition-colors duration-300"
        >
            <Icon />
        </a>
    );
};


const Banner = () => {
    return (
        <section className="relative h-screen w-full bg-black" role="banner">
            {/* Background Image */}
            <div className="absolute inset-0">
                <Image
                    src="/images/banner.webp"
                    alt="Two people wearing black and gray streetwear hoodies"
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover opacity-70"
                />
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex h-full flex-col items-center justify-center p-4 text-white">
                <h1 className="mb-8 md:mb-10 text-center text-2xl md:text-4xl xl:text-[80px] font-normal">
                    LIFE IS MADE OF CHOICE
                </h1>

                <div className="flex gap-4 flex-row sm:gap-6">
                    <AnimatedButton variant="black">Shop Men</AnimatedButton>
                    <AnimatedButton variant="black">Shop Women</AnimatedButton>
                </div>
            </div>

            {/* Social Media Sidebar (NOT FIXED) */}
            <aside
                className="absolute right-10 top-[75%] md:top-[60%] z-20  -translate-y-1/2 flex-col space-y-3 md:space-y-6 text-white flex"
                aria-label="Social media links"
            >
                {SOCIAL_LINKS.map((link) => (
                    <SocialLink key={link.label} {...link} />
                ))}
            </aside>

        </section>
    );
};

export default Banner;

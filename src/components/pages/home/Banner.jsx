"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { IoLogoFacebook, IoLogoInstagram, IoLogoYoutube } from "react-icons/io5";
import { FaPinterest } from "react-icons/fa6";
import AnimatedButton from "@/components/utils/AnimatedButton";
import Link from "next/link";

const SOCIAL_LINKS = [
    { icon: IoLogoFacebook, href: "https://www.facebook.com/BBOIJ", label: "Facebook" },
    { icon: FaPinterest, href: "https://fr.pinterest.com/blackaboij/", label: "Pinterest" },
    { icon: IoLogoInstagram, href: "https://www.instagram.com/accounts/login/?next=%2Fblackaboij_%2F", label: "Instagram" },
    { icon: IoLogoYoutube, href: "https://www.blackaboij.com/", label: "YouTube" },
];

const BG_IMAGES = [
    "/images/banner7.jpeg",
    "/images/top-slide.png",
    "/images/banner8.jpeg",
];

const SocialLink = ({ icon: Icon, href, label }) => (
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

const Banner = () => {
    const imgARef = useRef(null);
    const imgBRef = useRef(null);

    const indexRef = useRef(0);
    const isAnimating = useRef(false);

    useEffect(() => {
        const slide = () => {
            if (isAnimating.current) return;
            isAnimating.current = true;

            const currentIndex = indexRef.current;
            const nextIndex = (currentIndex + 1) % BG_IMAGES.length;

            const imgA = imgARef.current;
            const imgB = imgBRef.current;

            // Set next image
            imgB.style.backgroundImage = `url(${BG_IMAGES[nextIndex]})`;

            gsap.set(imgB, { xPercent: 100 });

            gsap.timeline({
                defaults: { duration: 1.4, ease: "power4.inOut" },
                onComplete: () => {
                    // Swap roles
                    imgA.style.backgroundImage = `url(${BG_IMAGES[nextIndex]})`;

                    gsap.set(imgA, { xPercent: 0 });
                    gsap.set(imgB, { xPercent: 100 });

                    indexRef.current = nextIndex;
                    isAnimating.current = false;
                },
            })
                .to(imgA, { xPercent: -100 })
                .to(imgB, { xPercent: 0 }, "<");
        };

        const interval = setInterval(slide, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative h-screen w-full overflow-hidden bg-black" role="banner">
            {/* 🔥 Background Slider */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div
                    ref={imgARef}
                    className="absolute inset-0 bg-cover bg-top opacity-70"
                    style={{ backgroundImage: `url(${BG_IMAGES[0]})` }}
                />
                <div
                    ref={imgBRef}
                    className="absolute inset-0 bg-cover bg-top opacity-70"
                />

            </div>

            {/* 🔥 Main Content */}
            <div className="relative z-10 flex h-full flex-col items-center justify-center p-4 text-white">
                <h1 className="mb-8 md:mb-10 text-center text-2xl md:text-4xl xl:text-[80px] font-normal ">
                    LIFE IS MADE OF CHOICE
                </h1>

                <div className="flex gap-4 sm:gap-6">
                    <Link href="/men/men-collection">
                        <AnimatedButton variant="black">Shop Men</AnimatedButton>
                    </Link>
                    <Link href="/women/women-collection">
                        <AnimatedButton variant="black">Shop Women</AnimatedButton>
                    </Link>
                </div>
            </div>

            {/* 🔥 Social Sidebar */}
            <aside
                className="absolute right-10 top-[75%] md:top-[60%] z-20 -translate-y-1/2 flex flex-col space-y-3 md:space-y-6 text-white"
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

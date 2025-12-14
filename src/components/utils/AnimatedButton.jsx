"use client";
import { useRef } from "react";
import gsap from "gsap";

const AnimatedButton = ({ children, variant = "white" }) => {
    const overlayRef = useRef(null);
    const textRef = useRef(null);
    const tl = useRef(null);

    // Determine colors based on variant
    const isWhite = variant === "white";
    const bgColor = isWhite ? "bg-white" : "bg-black";
    const textColor = isWhite ? "#000" : "#fff";
    const overlayColor = isWhite ? "bg-black" : "bg-white";
    const hoverTextColor = isWhite ? "#fff" : "#000";

    const handleEnter = () => {
        if (tl.current) tl.current.kill();

        tl.current = gsap.timeline();

        // Step 1: Fill vertically instantly
        tl.current.to(overlayRef.current, {
            scaleY: 1,
            duration: 0.1,
            transformOrigin: "center center",
        });

        // Step 2: Expand horizontally from center
        tl.current.to(
            overlayRef.current,
            {
                scaleX: 1.1,
                duration: 0.8,
                ease: "expo.out",
                transformOrigin: "center center",
            },
            "-=0.05"
        );

        // Change text color on hover
        tl.current.to(
            textRef.current,
            {
                color: hoverTextColor,
                duration: 0.25,
                ease: "power2.out",
            },
            "-=0.5"
        );
    };

    const handleLeave = () => {
        if (tl.current) tl.current.kill();

        tl.current = gsap.timeline();

        // Reset text color
        tl.current.to(textRef.current, {
            color: textColor,
            duration: 0.2,
            ease: "power2.out",
        });

        // Collapse overlay
        tl.current.to(
            overlayRef.current,
            {
                scaleX: 0,
                scaleY: 0,
                duration: 0.6,
                ease: "expo.inOut",
                transformOrigin: "center center",
            },
            "-=0.1"
        );
    };

    return (
        <button
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            className={`relative overflow-hidden ${bgColor} px-8 py-2 md:px-10 md:py-3 text-[12px] md:text-[16px] font-normal md:font-bold`}
        >
            {/* Overlay */}
            <span
                ref={overlayRef}
                className={`absolute left-0 top-0 w-full h-full ${overlayColor} scale-0 origin-center`}
            />

            {/* Button Text */}
            <span ref={textRef} className="relative z-10" style={{ color: textColor }}>
                {children}
            </span>
        </button>
    );
};

export default AnimatedButton;

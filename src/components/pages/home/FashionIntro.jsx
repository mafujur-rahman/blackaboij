"use client";

export default function FashionIntro() {
    return (
        <section className="relative w-full overflow-hidden bg-[#f7f7f7]">
            <video
                className="block h-auto w-full object-cover"
                autoPlay
                loop
                muted
                playsInline
            >
                <source src="/images/intro.mp4" type="video/mp4" />
            </video>
        </section>
    );
}
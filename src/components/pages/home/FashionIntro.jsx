"use client";

const imagePills = {
    black:
        "/images/14.png",

    cream:
        "/images/banner-5.JPG",

    formal:
        "/images/15.png",
};

export default function FashionIntro() {
    return (
        <section className="relative w-full overflow-hidden bg-[#f7f7f7]">
            {/* Subtle background shapes */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-20 top-[-120px] h-[420px] w-[420px] rounded-full bg-white/70 blur-3xl" />

                <div className="absolute right-[-100px] top-[40px] h-[420px] w-[420px] rounded-full bg-white/70 blur-3xl" />

                <div className="absolute left-[28%] bottom-[-180px] h-[350px] w-[500px] rounded-full bg-white/60 blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative mx-auto flex min-h-[650px] w-full max-w-[1767px] items-center justify-center px-6 py-24 sm:px-10 md:px-16 lg:px-20">
                <div
                    className="
            w-full
            max-w-[1200px]
            text-center
            text-[34px]
            font-normal
            leading-[1.7]
            tracking-[-1.4px]

            sm:text-[38px]
            sm:leading-[1.65]

            md:text-[42px]
            md:leading-[1.65]

            lg:text-[48px]
            lg:leading-[1.62]

            xl:text-[51px]
            xl:leading-[1.6]
          "
                >
                    <p>
                        Elevate your fashion game with our expertly curated
                        collection of{" "}
                        <strong className="font-bold">high-end</strong>{" "}
                        <ImagePill src={imagePills.black} /> pieces. Discover the
                        <br className="hidden lg:block" />
                        outfit{" "}
                        <ImagePill src={imagePills.cream} />{" "}
                        <strong className="font-bold">perfect outfit</strong> for any
                        occasion,
                        <br className="hidden lg:block" />
                        from casual to{" "}
                        <ImagePill src={imagePills.formal} />{" "}
                        <strong className="font-bold">formal.</strong>
                    </p>
                </div>
            </div>
        </section>
    );
}

/* Image pill */
function ImagePill({ src }) {
    return (
        <span
            className="
        relative
        mx-[5px]
        inline-block
        h-[54px]
        w-[170px]
        translate-y-[7px]
        overflow-hidden
        rounded-full
        align-middle

        sm:h-[57px]
        sm:w-[180px]

        md:h-[60px]
        md:w-[190px]

        lg:h-[64px]
        lg:w-[200px]
      "
        >
            <img
                src={src}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
            />
        </span>
    );
}
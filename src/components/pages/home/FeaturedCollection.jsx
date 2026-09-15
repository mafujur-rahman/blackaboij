"use client";
import Image from "next/image";

const FeaturedCollection = () => {
  return (
    <section className="relative w-full overflow-hidden bg-black">
      <div className="relative w-full">
        <Image
          src="/images/friday-slide.png"
          alt="Gallery image"
          width={1920}
          height={1080}
          className="w-full h-auto object-cover"
          priority
        />
      </div>
    </section>
  );
};

export default FeaturedCollection;
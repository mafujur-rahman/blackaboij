"use client";

import AnimatedButton from "@/components/utils/AnimatedButton";
import Image from "next/image";

const ContactBanner = () => {
  const address =
    "20 Allée des Piboules résidence les Belenos 13800 Istres";

  const openGoogleMap = () => {
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address
    )}`;
    window.open(mapUrl, "_blank");
  };

  return (
    <div className="relative w-full h-96 md:h-125 lg:h-140 xl:h-180 overflow-hidden flex items-center justify-center">

      {/* Background Image */}
      <Image
        src="/images/store.png"
        alt="Our Shopping Mall"
        fill
        priority
        className="object-cover"
      />

      {/* Black Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Content */}
      <div className="relative z-10 text-center text-white p-4">
        <h1 className="text-2xl md:text-4xl xl:text-[80px] font-normal mb-6">
          Our Shopping Mall
        </h1>

        {/* CTA Button */}
        <div onClick={openGoogleMap}>
          <AnimatedButton variant="black">
            Find Our Stores
          </AnimatedButton>
        </div>
      </div>
    </div>
  );
};

export default ContactBanner;

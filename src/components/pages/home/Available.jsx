"use client";

import AnimatedButton from "@/components/utils/AnimatedButton";
import Image from "next/image";
import Link from "next/link";

const Available = () => {
  return (
    <div className="relative w-full h-96 md:h-125 overflow-hidden bg-black flex items-center justify-center">

      {/* Background Image */}
      <Image
        src="/images/black-shade.jpg"
        alt="All shades of black available."
        fill
        priority
        className="object-cover opacity-70"
      />

      {/* Content */}
      <div className="relative z-10 text-center text-white p-4">
        <h1 className="text-2xl md:text-4xl xl:text-[80px] font-normal mb-6">
          All shades of black available.
        </h1>

        {/* Navigable Button */}
        <Link href="/men/men-collection">
          <AnimatedButton variant="black">
            Shop Collections
          </AnimatedButton>
        </Link>
      </div>
    </div>
  );
};

export default Available;

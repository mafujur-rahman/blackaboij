"use client"
import AnimatedButton from '@/components/utils/AnimatedButton';
import Image from 'next/image';

const FridaySale = (props) => {
  return (
    <div className="relative w-full mt-[50px] h-96 md:h-[500px] overflow-hidden bg-black flex items-center justify-center">

      {/* Background Image Container with Overlay */}
      <Image
        src='/images/friday-sale-2.png'
        alt="Black Friday Sale Background - Dark aesthetic with various objects"
        fill
        style={{ objectFit: 'cover' }}
        priority
        className="opacity-70"
      />

      {/* Content Container (Text and Button) */}
      <div className="relative z-10 text-center text-white p-4">

        {/* Subheader */}
        <p className="text-xs xl:text-lg tracking-widest uppercase mb-2 sm:text-sm">
          Up to 60% OFF on selected items
        </p>

        {/* Main Headline */}
        <h1 className="text-2xl md:text-4xl xl:text-[80px] font-normal mb-6">
          Black Friday Sale
        </h1>

        {/* Call-to-Action Button */}
        <AnimatedButton variant="white">Shop Now</AnimatedButton>

      </div>
    </div>
  );
};

export default FridaySale;
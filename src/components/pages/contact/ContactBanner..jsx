"use client"
import AnimatedButton from '@/components/utils/AnimatedButton';
import Image from 'next/image';

const ContactBanner = ( ) => {
  return (
    <div className="relative w-full h-96 md:h-125 lg:h-140 xl:h-180 overflow-hidden bg-black flex items-center justify-center">
      
      {/* Background Image Container with Overlay */}
      <Image
        src='/images/store.png'
        alt="Our Shopping Mall"
        fill 
        priority 
        className="opacity-90 object-cover" 
      />
      
      {/* Content Container (Text and Button) */}
      <div className="relative z-10 text-center text-white p-4">

        {/* Main Headline */}
        <h1 className="text-2xl md:text-4xl xl:text-[80px] font-normal mb-6">
          Our Shopping Mall
        </h1>
        
        {/* Call-to-Action Button */}
        <AnimatedButton variant="black">Find Our Stores</AnimatedButton>

      </div>
    </div>
  );
};

export default ContactBanner;
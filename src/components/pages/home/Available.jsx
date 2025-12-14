"use client"
import AnimatedButton from '@/components/utils/AnimatedButton';
import Image from 'next/image';

const Available = (props) => {
  return (
    <div className="relative w-full mt-25 h-96 md:h-125 overflow-hidden bg-black flex items-center justify-center">
      
      {/* Background Image Container with Overlay */}
      <Image
        src='/images/black-shade.jpg'
        alt="All shades of black available."
        fill 
        style={{ objectFit: 'cover' }}
        priority 
        className="opacity-70" 
      />
      
      {/* Content Container (Text and Button) */}
      <div className="relative z-10 text-center text-white p-4">

        {/* Main Headline */}
        <h1 className="text-2xl md:text-4xl xl:text-[80px] font-normal mb-6">
          All shades of black available.
        </h1>
        
        {/* Call-to-Action Button */}
        <AnimatedButton variant="black">Shop Collections</AnimatedButton>

      </div>
    </div>
  );
};

export default Available;
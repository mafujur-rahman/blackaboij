"use client"
import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import AnimatedButton from '@/components/utils/AnimatedButton';
import Link from 'next/link';

const SALE_IMAGES = [
  '/images/banner1.JPG',
  '/images/bottom-slide.png',
  '/images/banner3.JPG',
];

const FridaySale = () => {
  const imgARef = useRef(null);
  const imgBRef = useRef(null);
  const indexRef = useRef(0);
  const isAnimating = useRef(false);

  // Initialize images on mount
  useEffect(() => {
    if (imgARef.current) {
      imgARef.current.style.backgroundImage = `url(${SALE_IMAGES[0]})`;
    }
  }, []);

  // Auto-slide effect
  useEffect(() => {
    const slide = () => {
      if (isAnimating.current || SALE_IMAGES.length <= 1) return;
      isAnimating.current = true;

      const currentIndex = indexRef.current;
      const nextIndex = (currentIndex + 1) % SALE_IMAGES.length;

      const imgA = imgARef.current;
      const imgB = imgBRef.current;

      // Set next image
      if (imgB) {
        imgB.style.backgroundImage = `url(${SALE_IMAGES[nextIndex]})`;
      }

      gsap.set(imgB, { xPercent: 100 });

      gsap.timeline({
        defaults: { duration: 1.4, ease: "power4.inOut" },
        onComplete: () => {
          // Swap roles
          if (imgA) {
            imgA.style.backgroundImage = `url(${SALE_IMAGES[nextIndex]})`;
          }

          gsap.set(imgA, { xPercent: 0 });
          gsap.set(imgB, { xPercent: 100 });

          indexRef.current = nextIndex;
          isAnimating.current = false;
        },
      })
        .to(imgA, { xPercent: -100 })
        .to(imgB, { xPercent: 0 }, "<");
    };

    // Auto-slide interval
    const interval = setInterval(slide, 5000);

    return () => clearInterval(interval);
  }, []);

  // Manual navigation functions
  const goToNextSlide = () => {
    if (isAnimating.current || SALE_IMAGES.length <= 1) return;
    
    // Trigger the slide function
    const slideFunction = () => {
      isAnimating.current = true;

      const currentIndex = indexRef.current;
      const nextIndex = (currentIndex + 1) % SALE_IMAGES.length;

      const imgA = imgARef.current;
      const imgB = imgBRef.current;

      if (imgB) {
        imgB.style.backgroundImage = `url(${SALE_IMAGES[nextIndex]})`;
      }

      gsap.set(imgB, { xPercent: 100 });

      gsap.timeline({
        defaults: { duration: 1.4, ease: "power4.inOut" },
        onComplete: () => {
          if (imgA) {
            imgA.style.backgroundImage = `url(${SALE_IMAGES[nextIndex]})`;
          }

          gsap.set(imgA, { xPercent: 0 });
          gsap.set(imgB, { xPercent: 100 });

          indexRef.current = nextIndex;
          isAnimating.current = false;
        },
      })
        .to(imgA, { xPercent: -100 })
        .to(imgB, { xPercent: 0 }, "<");
    };

    slideFunction();
  };

  const goToPrevSlide = () => {
    if (isAnimating.current || SALE_IMAGES.length <= 1) return;
    
    isAnimating.current = true;

    const currentIndex = indexRef.current;
    const prevIndex = (currentIndex - 1 + SALE_IMAGES.length) % SALE_IMAGES.length;

    const imgA = imgARef.current;
    const imgB = imgBRef.current;

    if (imgB) {
      imgB.style.backgroundImage = `url(${SALE_IMAGES[prevIndex]})`;
    }

    gsap.set(imgB, { xPercent: -100 });

    gsap.timeline({
      defaults: { duration: 1.4, ease: "power4.inOut" },
      onComplete: () => {
        if (imgA) {
          imgA.style.backgroundImage = `url(${SALE_IMAGES[prevIndex]})`;
        }

        gsap.set(imgA, { xPercent: 0 });
        gsap.set(imgB, { xPercent: -100 });

        indexRef.current = prevIndex;
        isAnimating.current = false;
      },
    })
      .to(imgA, { xPercent: 100 })
      .to(imgB, { xPercent: 0 }, "<");
  };

  return (
    <div className="relative w-full mt-[50px] h-96 md:h-[800px] overflow-hidden bg-black flex items-center justify-center">
      {/* Background Image Slider Container */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div
          ref={imgARef}
          className="absolute inset-0 bg-cover bg-top opacity-70"
          style={{ 
            backgroundImage: `url(${SALE_IMAGES[0]})`,
            backgroundPosition: 'top center'
          }}
        />
        <div
          ref={imgBRef}
          className="absolute inset-0 bg-cover bg-top opacity-70"
          style={{ backgroundPosition: 'top center' }}
        />
      </div>

      {/* Navigation Buttons for Slider */}
      {SALE_IMAGES.length > 1 && (
        <>
          <button
            onClick={goToPrevSlide}
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 p-2 text-white hover:text-gray-300 transition-colors duration-300"
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={goToNextSlide}
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 p-2 text-white hover:text-gray-300 transition-colors duration-300"
            aria-label="Next slide"
          >
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {/* Slide Indicators */}
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 space-x-2">
            {SALE_IMAGES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === indexRef.current ? 'w-8 bg-white' : 'w-2 bg-white/50'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}

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

        {/* Navigable Button */}
        <Link href="/shop">
          <AnimatedButton variant="black">
            Shop Collections
          </AnimatedButton>
        </Link>
      </div>
    </div>
  );
};

export default FridaySale;
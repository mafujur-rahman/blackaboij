"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const GALLERY_IMAGES = [
  "/images/3.png",
  "/images/18.png",
  "/images/8.png",
  "/images/2.png",
];

const GalleryGrid = () => {
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const revealFrom = ["top", "bottom", "top", "bottom"];

      cardRefs.current.forEach((card, i) => {
        if (!card) return;

        const img = card.querySelector(".card-img");
        const from = revealFrom[i];

        // --- Curtain wipe reveal ---
        gsap.fromTo(
          card,
          {
            clipPath:
              from === "top"
                ? "inset(0% 0% 100% 0%)"
                : "inset(100% 0% 0% 0%)",
          },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.4,
            ease: "power4.inOut",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );

        // --- Softer parallax zoom, ends before section leaves ---
        if (img) {
          gsap.fromTo(
            img,
            { scale: 1.12, y: from === "top" ? 25 : -25 },
            {
              scale: 1,
              y: 0,
              ease: "none",
              scrollTrigger: {
                trigger: sectionRef.current,   // trigger on WHOLE section
                start: "top bottom",           // begins when section enters
                end: "bottom 40%",          // ends when section is centered
                scrub: 1.2,
                markers: false,
              },
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-black py-10 md:py-16"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 px-2 md:px-4">
        {GALLERY_IMAGES.map((src, i) => (
          <div
            key={i}
            ref={(el) => (cardRefs.current[i] = el)}
            className="relative w-full aspect-[3/4] overflow-hidden bg-neutral-900 will-change-[clip-path]"
          >
            <div
              className="card-img absolute inset-0 bg-cover bg-center bg-no-repeat will-change-transform"
              style={{ backgroundImage: `url(${src})` }}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default GalleryGrid;
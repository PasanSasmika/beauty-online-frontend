'use client';

import { motion, useScroll, useSpring } from "framer-motion";
import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import Contact from "@/components/sections/Contact";
import Testimonials from "@/components/sections/Testimonials";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import Footer from "@/components/layout/Footer";
import BrandMarquee from "@/components/sections/BrandMarquee";

export default function Home() {
  const { scrollYProgress } = useScroll();
  
  
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <main className="relative">
      <motion.div
        className="fixed top-0 left-0 right-0 h-2 bg-[#ee3f5c] origin-left z-50"
        style={{ scaleX }}
      />

      <Hero />
      <Features />
      <Contact />
      <Testimonials/>
      <BrandMarquee/>
      <WhyChooseUs/>
      <Footer/>
    </main>
  );
}
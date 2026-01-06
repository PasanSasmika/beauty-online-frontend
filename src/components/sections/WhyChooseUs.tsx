'use client';

import { motion } from 'framer-motion';
import { Leaf, Award, Sparkles, ArrowRight, Coins, Bike, WalletCards } from 'lucide-react';
import Image from 'next/image';

const features = [
  {
    icon: Leaf,
    title: "100% Authentic Products",
    description: "We guarantee only genuine, original skincare and beauty products from trusted brands no fakes, no compromises."
  },
  {
    icon: Coins,
    title: "Affordable Prices for Everyone",
    description: "High-quality skincare doesn’t have to break the bank. Enjoy premium products at competitive, wallet-friendly prices."
  },
  {
    icon: Bike,
    title: "Nationwide Delivery",
    description: "No matter where you are in Sri Lanka, we’ll deliver straight to your door safely and quickly."
  },
  {
    icon: WalletCards,
    title: "Flexible Payment Options",
    description: "Choose what works for you: Cash on Delivery, Online Transfer, or Bank Deposit shopping made easy and secure."
  }
];

export default function WhyChooseUs() {
  return (
    <section className="relative w-full py-24 lg:py-32 overflow-hidden">
      
      {/* --- BACKGROUND IMAGE WITH PARALLAX FEEL --- */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/image.jpg" // Make sure to add a relevant image to public/images/
          alt="Spa Oils and Ingredients"
          fill
          className="object-cover"
          priority
        />
        
        <div className="absolute inset-0 bg-gradient-to-r from-[#000000]/90 to-[#000000]/40" />
      </div>

      <div className="container relative z-10 mx-auto px-6 md:px-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          
          <div className="text-white space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-5xl md:text-7xl font-medium leading-tight mb-6">
                Why Choose <br />
                <span className="text-[#D6CFC4] italic">Us?</span>
              </h2>
              <p className="text-lg md:text-xl text-stone-200 max-w-lg leading-relaxed font-light">
                Our cruelty-free, eco-friendly, and high-performance products are designed for every skin type.
                 We believe in beauty that nurtures, protects, and inspires confidence.
              </p>
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="group flex items-center gap-3 text-[#D6CFC4] hover:text-white transition-colors"
            >
            </motion.button>
          </div>

          {/* --- RIGHT SIDE: Floating Glass Cards --- */}
          <div className="flex flex-col gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 p-6 md:p-8 rounded-2xl shadow-xl hover:bg-white/15 transition-all"
              >
                <div className="flex items-start gap-6">
                  
                  <div className="p-3 bg-[#FAF9F6] rounded-full text-[#000000] shrink-0">
                    <feature.icon size={24} strokeWidth={1.5} />
                  </div>
                  
                  
                  <div>
                    <h3 className="text-xl  text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-stone-300 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-[#FAF9F6] overflow-hidden">
      <div className="container mx-auto px-6 md:px-20 pt-24 pb-12 grid lg:grid-cols-12 gap-12 items-center z-10">
        
        {/* Text Content */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          <h1 className="text-4xl md:text-5xl  lg:text-6xl font-bold text-[#2D241E] leading-[1.15]">
            Where Elegance <br />
            <span className="text-[#8B9B86]">Truly Meets Radiance</span>
          </h1>

          <p className="text-lg md:text-xl text-stone-600 max-w-lg leading-relaxed font-medium opacity-90">
            Step into a world of beauty and sophistication. Relax, rejuvenate, and let our curated treatments elevate your mind, body, and spirit.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <button className="flex items-center gap-2 bg-[#8B9B86] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#7A8E74] transition-colors shadow-lg">
             View Collections<ArrowRight className="w-5 h-5" />
            </button>
            <button className="bg-transparent border-2 border-[#2D241E] px-8 py-4 rounded-full font-semibold text-[#2D241E] hover:bg-[#2D241E] hover:text-white transition-colors">
              Contact Us
            </button>
          </div>
        </div>

        {/* Image Section */}
        <div className="lg:col-span-5 relative mt-12 lg:mt-0">
          <div className="relative w-full max-w-md mx-auto h-[450px] md:h-[550px]">
            
            {/* Decorative Background */}
            <div className="absolute inset-0 bg-[#EBE5D9] rounded-[30px] rotate-6 scale-[1.03] origin-bottom-right z-0 shadow-lg"></div>
            
            {/* Image */}
            <div className="relative w-full h-full rounded-[30px] overflow-hidden shadow-2xl z-10">
              <Image
                src="/image.jpg"
                alt="Radiant skin"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Divider */}
      <div className="absolute bottom-10 left-0 w-full h-[1px] bg-stone-200 hidden md:block" />
    </section>
  );
}

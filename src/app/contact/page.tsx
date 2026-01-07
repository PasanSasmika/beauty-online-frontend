'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Loader2, Plus } from 'lucide-react';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // 1. Capture Form Data
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message'),
    };

    try {
      // 2. Send to Backend
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        alert("Message sent! We'll get back to you shortly.");
        (e.target as HTMLFormElement).reset(); // Clear form
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to send message');
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-32 pb-24 px-6 md:px-20">
      
      {/* 1. HEADER SECTION */}
      <div className="text-center max-w-3xl mx-auto mb-20">
        <span className="text-[#ee3f5c] font-bold tracking-[0.2em] text-xs uppercase mb-4 block">
          Get In Touch
        </span>
        <h1 className="text-5xl md:text-6xl font-bold text-[#2D241E] mb-6">
          We're here to help.
        </h1>
        <p className="text-lg text-stone-500 leading-relaxed">
          Whether you have a question about our products, shipping, or just want to say hello, our team is ready to assist you.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 mb-24">
        
        {/* 2. LEFT: CONTACT DETAILS (Sticky) */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-stone-100">
            <h3 className="text-2xl font-bold text-[#ee3f5c] mb-8">Contact Information</h3>
            
            <div className="space-y-8">
              <ContactItem 
                icon={<Phone size={24} />} 
                label="Call Us" 
                value="+94 71 953 3118" 
                sub="Mon-Fri from 8am to 5pm"
              />
              <div className="w-full h-px bg-[#ee3f5c]" />
              <ContactItem 
                icon={<Mail size={24} />} 
                label="Email Us" 
                value="skincare.lk@gmail.com" 
                sub="We usually reply within 24 hours"
              />
              <div className="w-full h-px bg-[#ee3f5c]" />
              <ContactItem 
                icon={<MapPin size={24} />} 
                label="Visit Us" 
                value="Malabe, Colombo, Sri Lanka" 
                sub="Online Store HQ"
              />
            </div>
          </div>

          {/* Social Proof / Extra Note */}
          <div className="p-8 bg-[#ee3f5c] rounded-[2rem] text-[#FAF9F6] text-center md:text-left">
            <h4 className="text-xl font-bold mb-2">Need immediate assistance?</h4>
            <p className="text-[#EBE5D9]/80 text-sm mb-4">Chat with our support team directly via WhatsApp for faster responses.</p>
            <button className="text-sm font-bold uppercase tracking-wider border-b border-white/30 pb-1 hover:text-white hover:border-white transition-colors">
              Chat on WhatsApp &rarr;
            </button>
          </div>
        </div>

        {/* 3. RIGHT: CONTACT FORM */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-7"
        >
          <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-lg border border-stone-100">
            <h3 className="text-2xl font-bold text-[#ee3f5c] mb-8">Send a Message</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#2D241E] uppercase tracking-wider">Name</label>
                  {/* Added name="name" */}
                  <input required name="name" placeholder="Jane Doe" className="w-full p-4 bg-[#FAF9F6] border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#2D241E] focus:border-transparent outline-none transition-all placeholder-stone-400" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#2D241E] uppercase tracking-wider">Email</label>
                  {/* Added name="email" */}
                  <input required name="email" type="email" placeholder="jane@example.com" className="w-full p-4 bg-[#FAF9F6] border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#2D241E] focus:border-transparent outline-none transition-all placeholder-stone-400" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#2D241E] uppercase tracking-wider">Subject</label>
                {/* Added name="subject" */}
                <select name="subject" className="w-full p-4 bg-[#FAF9F6] border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#2D241E] outline-none transition-all text-stone-600 appearance-none">
                  <option>Order Inquiry</option>
                  <option>Product Question</option>
                  <option>Collaboration</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#2D241E] uppercase tracking-wider">Message</label>
                {/* Added name="message" */}
                <textarea required name="message" rows={6} placeholder="How can we help you?" className="w-full p-4 bg-[#FAF9F6] border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#2D241E] outline-none transition-all resize-none placeholder-stone-400"></textarea>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#ee3f5c] text-white py-5 rounded-xl font-bold text-lg hover:bg-[#da203f] transition-all flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl hover:-translate-y-1 disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin" /> : <><Send size={20} /> Send Message</>}
              </button>
            </form>
          </div>
        </motion.div>

      </div>

      {/* 4. LARGE FAQ SECTION */}
      <div className="max-w-4xl mx-auto border-t border-stone-200 pt-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#2D241E]">Frequently Asked Questions</h2>
        </div>
        
        <div className="space-y-4">
          <FAQItem 
            question="Do you deliver island-wide?" 
            answer="Yes! We deliver to any address in Sri Lanka within 2-4 working days. Delivery is free for orders over LKR 10,000." 
          />
          <FAQItem 
            question="Are your products authentic?" 
            answer="Absolutely. We have a zero-tolerance policy for fakes. We source directly from authorized distributors and manufacturers globally to guarantee 100% authenticity." 
          />
          <FAQItem 
            question="What is your return policy?" 
            answer="We accept returns for damaged or incorrect items within 7 days of delivery. Please contact our support team with photos of the issue." 
          />
          <FAQItem 
            question="Can I pay using Koko?" 
            answer="Yes, we support Koko installments for eligible products. You can split your payment into 3 interest-free installments at checkout." 
          />
        </div>
      </div>

    </div>
  );
}

// --- HELPER COMPONENTS ---

function ContactItem({ icon, label, value, sub }: { icon: any, label: string, value: string, sub: string }) {
  return (
    <div className="flex items-start gap-5">
      <div className="p-4 bg-[#FAF9F6] rounded-2xl text-[#2D241E] shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-xl font-medium text-[#2D241E] mb-1">{value}</p>
        <p className="text-sm text-stone-500">{sub}</p>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden transition-all hover:shadow-md">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <span className="text-lg font-bold text-[#2D241E]">{question}</span>
        <span className={`p-2 rounded-full bg-[#FAF9F6] text-[#2D241E] transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>
          <Plus size={20} />
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 text-stone-600 leading-relaxed border-t border-stone-50 pt-4">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
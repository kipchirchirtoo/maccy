'use client';

import React, { useState } from 'react';
import { MapPin, Phone, Mail, Navigation, Heart, CheckCircle2 } from 'lucide-react';
import { useShop } from '@/context/ShopContext';

const MAPS_URL = 'https://maps.google.com/?q=Total+Petrol+Station+Maasai+Mara+University+Junction+Narok';
const EMAIL = 'gladyskirorei6@gmail.com';

export function AboutSection() {
  const { submitEnquiry } = useShop();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim() || (!phone.trim() && !email.trim())) return;
    submitEnquiry({ name: name.trim(), phone: phone.trim() || undefined, email: email.trim() || undefined, message: message.trim() });
    setSent(true);
    setName(''); setPhone(''); setEmail(''); setMessage('');
  };

  const input = 'w-full bg-[#fcf8f1] border border-[#2a26291f] rounded-xl px-4 py-2.5 text-sm text-[#2a2629] focus:border-[#6b1429] outline-hidden';

  return (
    <>
      {/* About */}
      <section id="story" className="py-20 sm:py-28 bg-[#fcf8f1] border-t border-[#2a262914]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f3ebdd] text-[#6b1429] text-xs font-medium">
            <Heart className="w-3.5 h-3.5" /> About MACCY COLLECTIONS
          </div>
          <h2 className="text-4xl sm:text-5xl leading-tight">
            A woman-owned <span className="italic font-serif">Kenyan business.</span>
          </h2>
          <p className="text-base sm:text-lg text-[#4a4347] leading-relaxed">
            MACCY COLLECTIONS is a woman-owned Kenyan fashion and lifestyle business. We offer men&apos;s fashion, shoes and footwear, gifts, curio products, fashion accessories, African-inspired pieces and custom tailoring.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 sm:py-24 bg-[#f3ebdd] border-t border-[#2a262914]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <h2 className="text-4xl sm:text-5xl leading-tight">
              Contact <span className="italic font-serif">us.</span>
            </h2>
            <div className="space-y-4 text-[#2a2629]">
              <a href="https://wa.me/254722907700" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:underline">
                <span className="w-10 h-10 rounded-full bg-white border border-[#2a26291f] flex items-center justify-center"><Phone className="w-4 h-4 text-[#6b1429]" /></span>
                WhatsApp: 0722 907 700
              </a>
              <a href={`mailto:${EMAIL}`} className="flex items-center gap-3 hover:underline">
                <span className="w-10 h-10 rounded-full bg-white border border-[#2a26291f] flex items-center justify-center"><Mail className="w-4 h-4 text-[#6b1429]" /></span>
                {EMAIL}
              </a>
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-white border border-[#2a26291f] flex items-center justify-center shrink-0"><MapPin className="w-4 h-4 text-[#6b1429]" /></span>
                Total Petrol Station, near Maasai Mara University junction
              </div>
            </div>
            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="shade-button-primary inline-flex items-center gap-2 px-6 py-3 text-sm">
              <Navigation className="w-4 h-4" /> Open in Google Maps
            </a>
          </div>

          <form onSubmit={handleSubmit} className="shade-card p-6 sm:p-8 space-y-4">
            {sent ? (
              <div className="text-center space-y-3 py-8">
                <CheckCircle2 className="w-10 h-10 text-[#1f9d3a] mx-auto" />
                <p className="font-medium">Thank you, your message has been received.</p>
                <button type="button" onClick={() => setSent(false)} className="shade-button-secondary px-5 py-2 text-sm">Send another</button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-[#6b1429]">Send us a message</h3>
                <input className={input} placeholder="Your name *" required value={name} onChange={(e) => setName(e.target.value)} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input className={input} type="tel" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  <input className={input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <textarea className={input} rows={4} placeholder="Your message *" required value={message} onChange={(e) => setMessage(e.target.value)} />
                <p className="text-xs text-[#8d8388]">Please give a phone number or an email so we can reply.</p>
                <button type="submit" className="shade-button-primary px-6 py-3 text-sm w-full">Send message</button>
              </>
            )}
          </form>
        </div>
      </section>
    </>
  );
}

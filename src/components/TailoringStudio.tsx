'use client';

import React, { useState } from 'react';
import { useShop } from '@/context/ShopContext';
import {
  Scissors,
  Upload,
  CheckCircle2,
  Phone,
  Ruler,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Shirt,
  Palette,
} from 'lucide-react';
import { TailoringRequest } from '@/types';

type FitPref = 'standard' | 'slim' | 'relaxed' | 'in_person_fitting';

const STEPS = [
  { title: 'About you', hint: 'Who is it for and what do you need?' },
  { title: 'Fit & measurements', hint: 'Size, colour, budget and your measurements.' },
  { title: 'Your design', hint: 'Show us the look you have in mind.' },
];

const FITS: { id: FitPref; label: string; note: string }[] = [
  { id: 'standard', label: 'Standard', note: 'Classic, comfortable fit' },
  { id: 'slim', label: 'Slim', note: 'Closer to the body' },
  { id: 'relaxed', label: 'Relaxed', note: 'Roomy and flowing' },
  { id: 'in_person_fitting', label: 'Measure me in person', note: 'Skip measurements for now' },
];

const GARMENT_SUGGESTIONS = ['Shirt', 'Trousers', 'Suit', 'Dress', 'Kaftan', 'Skirt', 'Other'];

const MEASURES: { key: string; label: string; placeholder: string }[] = [
  { key: 'chest', label: 'Chest / bust', placeholder: '40' },
  { key: 'shoulders', label: 'Shoulders', placeholder: '19' },
  { key: 'sleeveLength', label: 'Sleeve length', placeholder: '26' },
  { key: 'waist', label: 'Waist', placeholder: '34' },
  { key: 'hips', label: 'Hips', placeholder: '38' },
  { key: 'inseam', label: 'Inseam', placeholder: '32' },
  { key: 'height', label: 'Height', placeholder: '5 ft 10 in' },
];

// Shrink uploaded photos so they fit in browser storage
function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, 1000 / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

const inputCls =
  'w-full bg-white border border-[#2a26291f] rounded-xl px-4 py-3 text-sm text-[#2a2629] placeholder:text-[#8d8388]/70 outline-hidden focus:border-[#6b1429] focus:ring-4 focus:ring-[#6b1429]/10 transition';
const labelCls = 'block text-sm font-medium text-[#2a2629] mb-1.5';

export function TailoringStudio() {
  const { createTailoringRequest, getWhatsAppTailoringUrl } = useShop();

  const [step, setStep] = useState(0);
  const [error, setError] = useState('');

  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [garmentType, setGarmentType] = useState('');
  const [occasion, setOccasion] = useState('');
  const [eventDate, setEventDate] = useState('');

  const [size, setSize] = useState('');
  const [colour, setColour] = useState('');
  const [fabricChoice, setFabricChoice] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [fittingPreference, setFittingPreference] = useState<FitPref>('standard');
  const [measures, setMeasures] = useState<Record<string, string>>({});

  const [additionalDetails, setAdditionalDetails] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [createdRequest, setCreatedRequest] = useState<TailoringRequest | null>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      setImagePreview(await resizeImage(file));
    } catch (err) {
      console.error('Error handling image upload:', err);
      setError('We could not read that image. Please try another one.');
    } finally {
      setIsUploading(false);
    }
  };

  const goNext = () => {
    if (step === 0 && (!clientName.trim() || !phone.trim())) {
      setError('Please enter your name and phone number so we can reach you.');
      return;
    }
    setError('');
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setError('');
    setStep((s) => Math.max(s - 1, 0));
  };

  const reset = () => {
    setCreatedRequest(null);
    setStep(0);
    setImagePreview('');
    setClientName(''); setPhone(''); setEmail('');
    setGarmentType(''); setOccasion(''); setEventDate('');
    setSize(''); setColour(''); setFabricChoice(''); setBudgetRange('');
    setMeasures({}); setAdditionalDetails('');
    setFittingPreference('standard');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < STEPS.length - 1) {
      goNext();
      return;
    }
    if (!clientName.trim() || !phone.trim()) {
      setStep(0);
      setError('Please enter your name and phone number so we can reach you.');
      return;
    }
    const inch = (v?: string) => (v && v.trim() ? v.trim() : undefined);
    const request = createTailoringRequest({
      clientName: clientName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      garmentType,
      occasion,
      eventDate,
      fabricChoice,
      size,
      colour,
      measurements: {
        chest: inch(measures.chest),
        shoulders: inch(measures.shoulders),
        sleeveLength: inch(measures.sleeveLength),
        waist: inch(measures.waist),
        hips: inch(measures.hips),
        inseam: inch(measures.inseam),
        height: inch(measures.height),
        fittingPreference,
        notes: additionalDetails,
      },
      inspirationImageUrl: imagePreview,
      additionalDetails,
      budgetRange,
    });
    setCreatedRequest(request);
  };

  return (
    <section id="tailoring" className="py-20 sm:py-28 bg-[#f3ebdd] border-t border-[#2a262914]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#2a26291a] text-xs font-medium text-[#6b1429]">
            <Scissors className="w-3.5 h-3.5" /> Custom tailoring
          </div>
          <h2 className="text-4xl sm:text-5xl leading-[1.1]">
            Made to measure, <span className="italic font-serif">designed just for you.</span>
          </h2>
          <p className="text-base text-[#4a4347] leading-relaxed">
            Tell us what you would like made. It takes about three minutes, and you can add more details on WhatsApp later.
          </p>
        </div>

        {createdRequest ? (
          /* Success */
          <div className="max-w-xl mx-auto bg-white border border-[#2a262914] rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-[0_8px_30px_rgba(42,38,41,0.06)]">
            <div className="w-16 h-16 rounded-full bg-[#1f9d3a]/10 text-[#1f9d3a] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl">
                Thank you, <span className="italic font-serif">{createdRequest.clientName.split(' ')[0]}.</span>
              </h3>
              <p className="text-sm text-[#5f565a]">Your request has been received. Keep this reference code to check its status:</p>
              <div className="inline-block bg-[#f3ebdd] text-[#6b1429] font-mono text-xl font-bold px-6 py-2.5 rounded-xl">
                {createdRequest.requestNumber}
              </div>
            </div>
            <p className="text-sm text-[#5f565a] max-w-sm mx-auto leading-relaxed">
              Send the details on WhatsApp to start the conversation. You can track progress anytime with “Track Order” at the top of the page.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={getWhatsAppTailoringUrl(createdRequest)}
                target="_blank"
                rel="noopener noreferrer"
                className="shade-button-primary w-full sm:w-auto px-6 py-3 text-sm flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" /> Send details on WhatsApp
              </a>
              <button onClick={reset} className="shade-button-secondary w-full sm:w-auto px-6 py-3 text-sm">
                New request
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: progress + help (sticky) */}
            <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-4">
              <div className="bg-white border border-[#2a262914] rounded-3xl p-6 space-y-1 shadow-[0_8px_30px_rgba(42,38,41,0.05)]">
                <h3 className="text-sm font-semibold text-[#6b1429] pb-3">How it works</h3>
                {STEPS.map((s, i) => {
                  const done = i < step;
                  const active = i === step;
                  return (
                    <button
                      key={s.title}
                      type="button"
                      onClick={() => i < step && setStep(i)}
                      className={`w-full flex gap-4 text-left rounded-2xl p-3 transition ${active ? 'bg-[#f3ebdd]' : ''} ${i < step ? 'cursor-pointer hover:bg-[#f3ebdd]/60' : 'cursor-default'}`}
                    >
                      <span
                        className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm font-semibold border ${
                          done
                            ? 'bg-[#6b1429] border-[#6b1429] text-white'
                            : active
                            ? 'bg-white border-[#6b1429] text-[#6b1429]'
                            : 'bg-white border-[#2a262925] text-[#8d8388]'
                        }`}
                      >
                        {done ? <Check className="w-4 h-4" /> : i + 1}
                      </span>
                      <span className="space-y-0.5">
                        <span className={`block text-sm font-semibold ${active || done ? 'text-[#2a2629]' : 'text-[#8d8388]'}`}>{s.title}</span>
                        <span className="block text-xs text-[#5f565a] leading-relaxed">{s.hint}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="bg-[#6b1429] text-white rounded-3xl p-6 space-y-3">
                <p className="font-serif text-xl" style={{ fontStyle: 'normal' }}>Prefer to talk it through?</p>
                <p className="text-sm text-white/80 leading-relaxed">Message us on WhatsApp and we will help you work out what to order.</p>
                <a
                  href="https://wa.me/254722907700"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-[#6b1429] text-sm font-medium px-5 py-2.5 rounded-full hover:bg-[#f3ebdd] transition"
                >
                  <Phone className="w-4 h-4" /> 0722 907 700
                </a>
              </div>
            </aside>

            {/* Right: step form */}
            <form
              onSubmit={handleSubmit}
              className="lg:col-span-8 bg-white border border-[#2a262914] rounded-3xl shadow-[0_8px_30px_rgba(42,38,41,0.06)] overflow-hidden"
            >
              {/* Progress bar */}
              <div className="h-1.5 bg-[#f3ebdd]">
                <div className="h-full bg-[#6b1429] transition-all duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
              </div>

              <div className="p-6 sm:p-10 space-y-8">
                <div>
                  <p className="text-xs font-medium text-[#8d8388]">Step {step + 1} of {STEPS.length}</p>
                  <h3 className="text-2xl sm:text-3xl text-[#6b1429] font-serif font-medium tracking-tight">{STEPS[step].title}</h3>
                </div>

                {/* STEP 1 */}
                {step === 0 && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className={labelCls}>Full name <span className="text-[#6b1429]">*</span></label>
                        <input className={inputCls} placeholder="Your name" value={clientName} onChange={(e) => setClientName(e.target.value)} />
                      </div>
                      <div>
                        <label className={labelCls}>Phone / WhatsApp <span className="text-[#6b1429]">*</span></label>
                        <input className={inputCls} type="tel" placeholder="07xx xxx xxx" value={phone} onChange={(e) => setPhone(e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Email <span className="text-[#8d8388] font-normal">(optional)</span></label>
                      <input className={inputCls} type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>

                    <div>
                      <label className={labelCls}><Shirt className="inline w-4 h-4 mr-1.5 -mt-0.5 text-[#6b1429]" />What would you like made?</label>
                      <input className={inputCls} list="garment-suggestions" placeholder="e.g. Shirt, Dress, Suit" value={garmentType} onChange={(e) => setGarmentType(e.target.value)} />
                      <datalist id="garment-suggestions">
                        {GARMENT_SUGGESTIONS.map((g) => <option key={g} value={g} />)}
                      </datalist>
                      <div className="flex flex-wrap gap-2 pt-3">
                        {GARMENT_SUGGESTIONS.map((g) => (
                          <button
                            type="button"
                            key={g}
                            onClick={() => setGarmentType(g)}
                            className={`px-3.5 py-1.5 rounded-full text-xs border transition ${garmentType === g ? 'bg-[#6b1429] text-white border-[#6b1429]' : 'bg-white text-[#4a4347] border-[#2a262922] hover:border-[#6b1429]'}`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className={labelCls}>Occasion <span className="text-[#8d8388] font-normal">(optional)</span></label>
                        <input className={inputCls} placeholder="e.g. Wedding, graduation" value={occasion} onChange={(e) => setOccasion(e.target.value)} />
                      </div>
                      <div>
                        <label className={labelCls}>Needed by <span className="text-[#8d8388] font-normal">(deadline)</span></label>
                        <input className={inputCls} type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2 */}
                {step === 1 && (
                  <div className="space-y-7">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      <div>
                        <label className={labelCls}>Size</label>
                        <input className={inputCls} placeholder="e.g. M or 42" value={size} onChange={(e) => setSize(e.target.value)} />
                      </div>
                      <div>
                        <label className={labelCls}><Palette className="inline w-4 h-4 mr-1.5 -mt-0.5 text-[#6b1429]" />Colour</label>
                        <input className={inputCls} placeholder="e.g. Burgundy" value={colour} onChange={(e) => setColour(e.target.value)} />
                      </div>
                      <div>
                        <label className={labelCls}>Budget</label>
                        <input className={inputCls} placeholder="e.g. KSh 8,000" value={budgetRange} onChange={(e) => setBudgetRange(e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Fabric <span className="text-[#8d8388] font-normal">(optional, or bring your own)</span></label>
                      <input className={inputCls} placeholder="Fabric you have in mind" value={fabricChoice} onChange={(e) => setFabricChoice(e.target.value)} />
                    </div>

                    <div>
                      <label className={labelCls}>How would you like it to fit?</label>
                      <div className="grid grid-cols-2 gap-3">
                        {FITS.map((f) => (
                          <button
                            type="button"
                            key={f.id}
                            onClick={() => setFittingPreference(f.id)}
                            className={`text-left p-4 rounded-2xl border transition ${
                              fittingPreference === f.id ? 'border-[#6b1429] bg-[#6b1429]/5 ring-4 ring-[#6b1429]/10' : 'border-[#2a262922] hover:border-[#6b1429]/60'
                            }`}
                          >
                            <span className="block text-sm font-semibold text-[#2a2629]">{f.label}</span>
                            <span className="block text-xs text-[#5f565a] mt-0.5">{f.note}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {fittingPreference !== 'in_person_fitting' ? (
                      <div className="bg-[#fcf8f1] border border-[#2a262912] rounded-2xl p-5 space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-[#2a2629]">
                          <Ruler className="w-4 h-4 text-[#6b1429]" /> Your measurements <span className="font-normal text-[#8d8388]">(in inches, fill what you know)</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {MEASURES.map((m) => (
                            <div key={m.key}>
                              <label className="block text-xs text-[#5f565a] mb-1">{m.label}</label>
                              <input
                                className={inputCls + ' !py-2.5'}
                                placeholder={m.placeholder}
                                value={measures[m.key] || ''}
                                onChange={(e) => setMeasures({ ...measures, [m.key]: e.target.value })}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-[#5f565a] bg-[#fcf8f1] border border-[#2a262912] rounded-2xl p-5">
                        No problem. We will arrange to take your measurements in person.
                      </p>
                    )}
                  </div>
                )}

                {/* STEP 3 */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <label className={labelCls}>Inspiration photo <span className="text-[#8d8388] font-normal">(optional)</span></label>
                      <div className="relative border-2 border-dashed border-[#2a262930] hover:border-[#6b1429] rounded-2xl bg-[#fcf8f1] transition-colors">
                        {!imagePreview && (
                          <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                        )}
                        {imagePreview ? (
                          <div className="p-4 flex items-center gap-4">
                            <img src={imagePreview} alt="Inspiration preview" className="w-24 h-24 object-cover rounded-xl border border-[#2a262920]" />
                            <div className="flex-1 space-y-2">
                              <p className="text-sm font-medium text-[#1f9d3a] flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Photo attached</p>
                              <button type="button" onClick={() => setImagePreview('')} className="text-xs text-[#6b1429] hover:underline flex items-center gap-1">
                                <X className="w-3 h-3" /> Remove
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="py-10 text-center space-y-2 pointer-events-none">
                            <span className="w-12 h-12 rounded-full bg-white border border-[#2a262920] flex items-center justify-center mx-auto">
                              <Upload className="w-5 h-5 text-[#6b1429]" />
                            </span>
                            <p className="text-sm font-medium text-[#2a2629]">{isUploading ? 'Preparing image…' : 'Click to upload a photo'}</p>
                            <p className="text-xs text-[#8d8388]">A picture, sketch or screenshot of the style you like</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Describe your design</label>
                      <textarea
                        rows={4}
                        className={inputCls}
                        placeholder="Describe the style, details, lining, length… anything that helps us understand your idea."
                        value={additionalDetails}
                        onChange={(e) => setAdditionalDetails(e.target.value)}
                      />
                    </div>

                    {/* Summary */}
                    <div className="bg-[#fcf8f1] border border-[#2a262912] rounded-2xl p-5">
                      <p className="text-sm font-semibold text-[#2a2629] pb-3">Your request</p>
                      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        {[
                          ['Name', clientName],
                          ['Phone', phone],
                          ['Garment', garmentType],
                          ['Size', size],
                          ['Colour', colour],
                          ['Budget', budgetRange],
                          ['Needed by', eventDate],
                          ['Fit', FITS.find((f) => f.id === fittingPreference)?.label],
                        ].map(([k, v]) => (
                          <div key={k as string} className="flex flex-col">
                            <dt className="text-xs text-[#8d8388]">{k}</dt>
                            <dd className="text-[#2a2629]">{v || '—'}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </div>
                )}

                {error && (
                  <p role="alert" className="text-sm text-[#b3261e] bg-[#b3261e]/8 border border-[#b3261e]/20 rounded-xl px-4 py-3">
                    {error}
                  </p>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-2">
                  {step > 0 ? (
                    <button type="button" onClick={goBack} className="shade-button-secondary px-5 py-3 text-sm flex items-center gap-2">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                  ) : (
                    <span />
                  )}
                  {step < STEPS.length - 1 ? (
                    <button type="submit" className="shade-button-primary px-7 py-3 text-sm flex items-center gap-2">
                      Continue <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button type="submit" className="shade-button-primary px-7 py-3 text-sm flex items-center gap-2">
                      Submit request <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}

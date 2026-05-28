import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  MapPin, Clock, Shield, Star, CheckCircle2, 
  Sparkles, Menu, X, ArrowRight, ArrowLeft,
  Heart, Award, Compass,
  MessageSquare, Search, SlidersHorizontal,
  Sun, Moon, Home, Stethoscope, Image as ImageIcon, MessageCircle, Calendar,
  Download, User, Phone, Mail, FileText
} from 'lucide-react';
// @ts-ignore
import confetti from 'canvas-confetti';

/* ─── LOGO COMPONENT ─────────────────────────────────── */
function HairHavenLogo({ className = "", size = 40 }: { className?: string; size?: number }) {
  return (
    <div className={className} style={{ width:`${size}px`, height:`${size}px`, borderRadius:'50%', overflow:'hidden', border:'2px solid var(--green-primary)', display:'inline-flex', alignItems:'center', justifyContent:'center', background:'var(--surface-card)', flexShrink:0 }}>
      <img src="/logo.png" alt="Hair Haven Logo" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
    </div>
  );
}

/* ─── NORWOOD STAGE VISUAL ────────────────────────────── */
function NorwoodStageVisual({ stage }: { stage: number }) {
  return (
    <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', borderRadius:'12px' }}>
      <img src={`/norwood${stage}.png`} alt={`Norwood Stage ${stage}`} style={{ width:'100%', height:'100%', objectFit:'contain', display:'block' }} />
    </div>
  );
}

/* ─── MAGICAL BACKGROUND ORBS ────────────────────────── */
function MagicalOrbs() {
  return (
    <div className="orb-container" aria-hidden="true">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
    </div>
  );
}

/* ─── TYPES ───────────────────────────────────────────── */
interface NorwoodStage {
  stage: number; name: string; description: string;
  grafts: string; priceRange: string; basePrice: number;
  density: string; duration: string; recovery: string;
}
interface Testimonial {
  id: number; name: string; rating: number; quote: string;
  tag: string; date?: string; daysAgo?: number;
}

/* ─── DATA ────────────────────────────────────────────── */
const norwoodStages: NorwoodStage[] = [
  { stage:1, name:"Minimal Hair Loss (Stage 1)", description:"Optimal hair density. Full, healthy hairline with no active recession. No surgical restoration needed.", grafts:"0 Grafts", priceRange:"₹0", basePrice:0, density:"Optimal", duration:"N/A", recovery:"N/A" },
  { stage:2, name:"Minor Receding Temples (Stage 2)", description:"Slight recession at the temples. Perfect stage for preventive care or growth PRP sessions to stop further thinning.", grafts:"500 - 1,000", priceRange:"₹21,000 - ₹25,000", basePrice:21000, density:"High", duration:"2 - 3 Hours", recovery:"3 - 5 Days" },
  { stage:3, name:"M-Shaped Receding Hairline (Stage 3)", description:"Clear M or V-shaped temple recession. This is the baseline stage for starting a successful FUE hairline restoration.", grafts:"1,200 - 1,800", priceRange:"₹30,000 (Base)", basePrice:30000, density:"Good", duration:"4 - 5 Hours", recovery:"7 Days" },
  { stage:4, name:"Receding Front & Crown Thinning (Stage 4)", description:"Deep frontal recession combined with a distinct thinning spot at the crown (vertex). Requires targeted FUE packing.", grafts:"2,000 - 2,800", priceRange:"₹35,000 - ₹40,000", basePrice:35000, density:"Moderate", duration:"5 - 6 Hours", recovery:"7 - 10 Days" },
  { stage:5, name:"Advanced Hair Loss (Stage 5)", description:"Frontal balding and crown bald zones are separated by only a very narrow bridge of hair. Dense graft packing required.", grafts:"2,800 - 3,500", priceRange:"₹40,000 - ₹45,000", basePrice:40000, density:"Moderate", duration:"6 - 7 Hours", recovery:"10 Days" },
  { stage:6, name:"Severe Hair Loss / Merged Zones (Stage 6)", description:"The dividing bridge of hair is completely gone. Front and back bald areas merge. Requires extensive full-head reconstruction.", grafts:"3,500 - 4,500", priceRange:"₹45,000 (Base)", basePrice:45000, density:"Requires Evaluation", duration:"7 - 8 Hours", recovery:"10 - 14 Days" },
  { stage:7, name:"Extreme Balding / Horseshoe (Stage 7)", description:"Most severe hair loss. Only a narrow strip of hair remains around the sides and back. Requires precise scientific mapping.", grafts:"4,500+", priceRange:"₹45,000+ (Custom)", basePrice:45000, density:"Low Donor Density", duration:"8+ Hours (Split sessions)", recovery:"14 Days" }
];

const services = {
  surgical: [
    { title:"FUE Hair Transplant", desc:"In this modern technique, healthy hair grafts are carefully taken from the donor area and implanted into bald areas. It is minimally invasive, leaves no major scars, provides natural-looking density, and has a faster recovery time.", price:"Starting from ₹21,000", features:["Minimally Invasive","No Major Scars","Natural Density","Fast Recovery Time"] },
    { title:"BioSapphire FUE Technique", desc:"An advanced FUE hair transplant variant utilizing precise sapphire blades instead of steel to create micro-channels. This ensures superior graft placement, higher density, accelerated healing, and extremely natural results.", price:"Starting from ₹31,000", features:["Advanced FUE Variant","Precise Sapphire Micro-Channels","Superior Graft Density","Rapid Scalp Healing"] }
  ],
  lasers: [
    { title:"PRP Therapy (Platelet Rich Plasma)", desc:"A non-surgical hair treatment in which the patient's own plasma is injected into the scalp to strengthen hair roots, reduce hair fall, improve blood circulation, and stimulate natural hair growth.", price:"₹2,000 / session", features:["Non-Surgical Option","Strengthens Hair Roots","Reduces Hair Fall","Stimulates Hair Growth"] },
    { title:"GFC Therapy (Growth Factor Concentrate)", desc:"An advanced regenerative treatment that uses concentrated growth factors from the patient's blood to nourish hair follicles, improve hair thickness, control hair fall, and promote healthier hair growth.", price:"₹4,500 / session", features:["Advanced Regenerative","Nourishes Follicles","Improves Thickness","Promotes Healthier Growth"] }
  ],
  dermatology: [
    { title:"Beard Transplant", desc:"A specialized procedure for men who want a fuller and well-shaped beard. Hair grafts are implanted carefully to give a dense, natural, and permanent beard look.", price:"Custom Pricing", features:["Fuller Beard Look","Careful Implanting","Dense & Natural","Permanent Growth"] },
    { title:"Eyebrow Transplant", desc:"A cosmetic procedure designed to restore thin or uneven eyebrows by implanting natural hair grafts for a fuller, properly shaped, and natural appearance.", price:"Custom Pricing", features:["Restores Thin Brows","Properly Shaped","Fuller & Natural","Directional Placement"] }
  ]
};

const testimonials: Testimonial[] = [
  { id:1, name:"Manmohan Singh", rating:5, quote:"That was the best experience of my life, it gave me new life, thank you hair haven, the best staff and people treating.", tag:"Attentive Care", date:"1 week ago", daysAgo:7 },
  { id:2, name:"Kalsotra Aman", rating:5, quote:"Excellent treatment, accurate diagnosis. Hair Haven offers excellent customer service and easy booking. The staff provides gentle care.", tag:"Easy Booking", date:"2 weeks ago", daysAgo:14 },
  { id:3, name:"Neevad Kumar", rating:5, quote:"Easy booking, great customer service. I had an excellent experience with Hair Haven. Booking an appointment was very easy. The customer service was top tier.", tag:"Good Supervision", date:"3 weeks ago", daysAgo:21 },
  { id:4, name:"Shubam Sakolia", rating:5, quote:"I recently visited Hair Haven in Channi Himmat, and I must say, it was a delightful experience! The ambiance is wonderful and the results are amazing.", tag:"Speedy Recovery", date:"1 month ago", daysAgo:30 },
  { id:5, name:"Saleem", rating:5, quote:"I am really satisfied with the behaviour of staff members and work, especially Shazia mam and Rimpy mam... my results are very good. I'm very happy.", tag:"Attentive Care", date:"2 months ago", daysAgo:60 },
  { id:6, name:"Sunny", rating:5, quote:"I recently underwent a hair transplant treatment here. The staff is very friendly, I'm very happy, thank you team. Great customer service.", tag:"Reasonably Priced", date:"2 months ago", daysAgo:65 },
  { id:7, name:"Vishwa Nath", rating:5, quote:"Clean & hygienic, sterilized equipment. As far as the result is concerned it is very good. Hair Haven clinic provided me good facilities and the staff is too good.", tag:"Clean & Hygienic", date:"3 months ago", daysAgo:90 },
  { id:8, name:"Jannu", rating:5, quote:"Best clinic in Jammu. 100% result in Hair Haven transplant. Reasonably priced and subsidies available.", tag:"Reasonably Priced", date:"4 months ago", daysAgo:120 }
];

const reviewTags = ["All","Clean & Hygienic","Reasonably Priced","Speedy Recovery","Easy Booking","Good Supervision","Attentive Care"];

const treatments = [
  { value:"FUE Hair Transplant", label:"FUE Hair Transplant", category:"Surgical", desc:"Premium hair restoration with micro-graft extraction", icon:"🏥" },
  { value:"BioSapphire FUE Technique", label:"BioSapphire FUE Technique", category:"Surgical", desc:"Advanced sapphire blade FUE for higher density", icon:"💎" },
  { value:"PRP Therapy (Platelet-Rich Plasma)", label:"PRP Therapy", category:"Non-Surgical", desc:"Platelet-rich autologous growth factor treatment", icon:"💉" },
  { value:"GFC Therapy", label:"GFC Therapy", category:"Non-Surgical", desc:"Concentrated growth factors for hair thickness", icon:"🔬" },
  { value:"Beard Transplant", label:"Beard Transplant", category:"Specialized", desc:"Fuller, permanent beard restoration", icon:"🧔" },
  { value:"General Hair Loss Consultation", label:"Hair Loss Consultation", category:"Diagnostics", desc:"Scalp evaluation and Norwood stage mapping", icon:"🔍" }
];

const timeSlots = [
  { value:"10:00 AM", label:"10:00 AM", period:"Morning" },
  { value:"11:30 AM", label:"11:30 AM", period:"Morning" },
  { value:"01:00 PM", label:"01:00 PM", period:"Afternoon" },
  { value:"03:00 PM", label:"03:00 PM", period:"Afternoon" },
  { value:"04:30 PM", label:"04:30 PM", period:"Evening" }
];

/* ═══════════════════════════════════════════════════════
   CONSULTATION PAGE COMPONENT
═══════════════════════════════════════════════════════ */
function ConsultationPage({
  onBack,
  selectedNorwood,
  includePRPSessions,
  includeScreening,
  initialService = 'FUE Hair Transplant',
}: {
  onBack: () => void;
  selectedNorwood: number;
  includePRPSessions: number;
  includeScreening: boolean;
  initialService?: string;
}) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName:'', phone:'', email:'', service: initialService,
    date:'', time:'', notes:'', hadPriorConsultation:'no', bloodSugarCheck:'no'
  });
  const [ticket, setTicket] = useState<any>(null);

  const calcPrice = () => {
    let base = 0;
    if (form.service === 'FUE Hair Transplant') base = norwoodStages[selectedNorwood - 1].basePrice || 21000;
    else if (form.service === 'BioSapphire FUE Technique') base = 31000;
    else if (form.service.includes('PRP')) base = 2000;
    else if (form.service.includes('GFC')) base = 4500;
    else if (form.service.includes('Beard') || form.service.includes('Eyebrow')) base = 25000;
    let extra = 0;
    if (['FUE Hair Transplant','BioSapphire FUE Technique'].includes(form.service)) {
      extra += includePRPSessions * 2000;
      if (includeScreening) extra += 999;
    }
    return base + extra;
  };

  const handleSubmit = () => {
    const ticketId = 'HH-' + Math.floor(100000 + Math.random() * 900000);
    const t = { id: ticketId, ...form, priceEstimate: calcPrice() };
    setTicket(t);
    setStep(4);
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });

    // WhatsApp alert
    setTimeout(() => {
      const msg = `🌿 *HAIR HAVEN — NEW APPOINTMENT*\n━━━━━━━━━━━━━━━━━━━\n👤 *Patient:* ${t.fullName}\n📞 *Phone:* ${t.phone}\n💉 *Treatment:* ${t.service}\n📅 *Date:* ${t.date} at ${t.time}\n💳 *Estimate:* ₹${t.priceEstimate.toLocaleString('en-IN')}\n━━━━━━━━━━━━━━━━━━━\n✨ Please confirm within 2 hours.`;
      window.open(`https://wa.me/918899708659?text=${encodeURIComponent(msg)}`, '_blank');
    }, 1000);
  };

  const stepLabels = ['Contact', 'Treatment', 'Schedule'];
  const estimatedPrice = calcPrice();

  return (
    <div className="consultation-page">
      {/* Orbs are already rendered globally in App */}

      {/* Header */}
      <div className="consult-header">
        <button onClick={onBack} className="consult-back-btn" title="Back to Home">
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <div className="consult-header-brand">
          <HairHavenLogo size={36} />
          <div>
            <div style={{ fontWeight:800, fontSize:'1rem', fontFamily:'var(--font-display)', color:'var(--text-primary)' }}>Hair Haven</div>
            <div style={{ fontSize:'0.65rem', color:'var(--gemini-purple)', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase' }}>Book Consultation</div>
          </div>
        </div>
        <div style={{ width:'60px' }} />
      </div>

      <div className="consult-body">
        {step < 4 ? (
          <>
            {/* Price estimator pill always visible */}
            {estimatedPrice > 0 && (
              <div className="consult-price-pill">
                <span style={{ fontSize:'0.75rem', color:'var(--text-tertiary)', fontWeight:600 }}>Estimated:</span>
                <span style={{ fontSize:'1rem', fontWeight:900, color:'var(--green-primary)' }}>₹{estimatedPrice.toLocaleString('en-IN')}</span>
              </div>
            )}

            {/* Stepper */}
            <div className="consult-stepper">
              {stepLabels.map((label, i) => {
                const n = i + 1;
                const isActive = step === n;
                const isDone = step > n;
                return (
                  <React.Fragment key={n}>
                    <div className={`consult-step ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
                      onClick={() => isDone && setStep(n)} style={{ cursor: isDone ? 'pointer' : 'default' }}>
                      <div className="consult-step-circle">{isDone ? <CheckCircle2 size={16}/> : n}</div>
                      <span className="consult-step-label">{label}</span>
                    </div>
                    {i < 2 && <div className={`consult-step-line ${step > n ? 'filled' : ''}`} />}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Step 1: Contact */}
            {step === 1 && (
              <div className="consult-step-content fade-in-up">
                <div className="consult-section-title">
                  <span className="consult-section-icon">👤</span>
                  Your Contact Details
                </div>
                <div className="consult-form-grid">
                  <div className="consult-field">
                    <label className="consult-label">Full Name *</label>
                    <div className="consult-input-wrapper">
                      <User size={18} className="consult-input-icon" />
                      <input type="text" placeholder="Enter your complete name" className="consult-input"
                        value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} />
                    </div>
                  </div>
                  <div className="consult-field">
                    <label className="consult-label">Phone Number *</label>
                    <div className="consult-input-wrapper">
                      <Phone size={18} className="consult-input-icon" />
                      <input type="tel" placeholder="+91 88997 08659" className="consult-input"
                        value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                    </div>
                  </div>
                  <div className="consult-field" style={{ gridColumn: '1 / -1' }}>
                    <label className="consult-label">Email Address (Optional)</label>
                    <div className="consult-input-wrapper">
                      <Mail size={18} className="consult-input-icon" />
                      <input type="email" placeholder="patient@example.com" className="consult-input"
                        value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                    </div>
                  </div>
                </div>
                <button className="consult-next-btn btn btn-primary" onClick={() => {
                  if (!form.fullName.trim() || !form.phone.trim()) {
                    alert('Please fill your name and phone number.');
                    return;
                  }
                  setStep(2);
                }}>
                  Select Treatment <ArrowRight size={18} style={{ marginLeft:'8px' }} />
                </button>
              </div>
            )}

            {/* Step 2: Treatment */}
            {step === 2 && (
              <div className="consult-step-content fade-in-up">
                <div className="consult-section-title">
                  <span className="consult-section-icon">💉</span>
                  Choose Your Treatment
                </div>
                <div className="consult-treatment-grid">
                  {treatments.map(t => {
                    let priceText = "";
                    if (t.value === 'FUE Hair Transplant') priceText = "Starting from ₹21,000";
                    else if (t.value === 'BioSapphire FUE Technique') priceText = "Starting from ₹31,000";
                    else if (t.value.includes('PRP')) priceText = "₹2,000 / session";
                    else if (t.value.includes('GFC')) priceText = "₹4,500 / session";
                    else if (t.value.includes('Beard') || t.value.includes('Eyebrow')) priceText = "Starting from ₹25,000";
                    else priceText = "Free Evaluation";

                    return (
                      <div key={t.value}
                        className={`consult-treatment-card ${form.service === t.value ? 'active' : ''}`}
                        onClick={() => setForm({...form, service: t.value})}>
                        <div className="consult-treatment-icon">{t.icon}</div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:800, fontSize:'0.95rem', color:'var(--text-primary)', marginBottom:'2px' }}>{t.label}</div>
                          <div style={{ fontSize:'0.75rem', color:'var(--text-secondary)', marginBottom:'6px', lineHeight:'1.4' }}>{t.desc}</div>
                          <div style={{ fontSize:'0.82rem', fontWeight:800, color:'var(--green-primary)' }}>{priceText}</div>
                        </div>
                        <span className="consult-category-pill">{t.category}</span>
                        {form.service === t.value && (
                          <div className="consult-check"><CheckCircle2 size={18} color="var(--green-primary)" /></div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="consult-prior-q">
                  <div className="consult-prior-header">
                    <span style={{ fontSize:'1.1rem' }}>🙋‍♂️</span>
                    <div className="consult-label">Had a hair transplant before?</div>
                  </div>
                  <div style={{ display:'flex', gap:'12px', marginTop:'12px' }}>
                    {['yes','no'].map(val => (
                      <button key={val} type="button"
                        className={`consult-yesno-btn ${form.hadPriorConsultation === val ? 'active' : ''}`}
                        onClick={() => setForm({...form, hadPriorConsultation: val})}>
                        {val === 'yes' ? '✅ Yes, Prior Transplant' : '❌ No, First Time'}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display:'flex', gap:'12px', marginTop:'24px' }}>
                  <button className="btn btn-secondary flex-1" onClick={() => setStep(1)}><ArrowLeft size={16} style={{ marginRight:'6px' }} /> Back</button>
                  <button className="btn btn-primary flex-1" onClick={() => setStep(3)}>Choose Schedule <ArrowRight size={16} style={{ marginLeft:'6px' }} /></button>
                </div>
              </div>
            )}

            {/* Step 3: Schedule */}
            {step === 3 && (
              <div className="consult-step-content fade-in-up">
                <div className="consult-section-title">
                  <span className="consult-section-icon">📅</span>
                  Pick a Date & Time
                </div>

                <div className="consult-field">
                  <label className="consult-label">Preferred Date</label>
                  <div className="consult-input-wrapper">
                    <Calendar size={18} className="consult-input-icon" />
                    <input type="date" className="consult-input" style={{ fontWeight:700, paddingLeft:'46px' }}
                      value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                  </div>
                </div>

                <div className="consult-field" style={{ marginTop:'20px' }}>
                  <label className="consult-label">Preferred Time Slot</label>
                  <div className="consult-timeslot-grid">
                    {timeSlots.map(ts => {
                      const isMorning = ts.period === 'Morning';
                      const isAfternoon = ts.period === 'Afternoon';
                      return (
                        <div key={ts.value}
                          className={`consult-timeslot ${form.time === ts.value ? 'active' : ''}`}
                          onClick={() => setForm({...form, time: ts.value})}>
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', fontWeight:800, fontSize:'0.95rem', color:'var(--text-primary)' }}>
                            {isMorning ? '🌅' : isAfternoon ? '☀️' : '🌇'} {ts.value}
                          </div>
                          <div style={{ fontSize:'0.7rem', color:'var(--text-tertiary)', marginTop:'2px', fontWeight:700, textTransform:'uppercase' }}>{ts.period}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="consult-field" style={{ marginTop:'20px' }}>
                  <label className="consult-label">Additional Notes (Optional)</label>
                  <div className="consult-input-wrapper">
                    <FileText size={18} className="consult-input-icon" style={{ top:'22px' }} />
                    <textarea rows={3} placeholder="Any scalp concerns, allergies, medications, or surgical history..."
                      className="consult-input" style={{ resize:'none', paddingLeft:'46px' }}
                      value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
                  </div>
                </div>

                <label className={`consult-checkbox-card ${form.bloodSugarCheck === 'yes' ? 'active' : ''}`} style={{ marginTop:'24px' }}>
                  <input type="checkbox" checked={form.bloodSugarCheck === 'yes'}
                    onChange={e => setForm({...form, bloodSugarCheck: e.target.checked ? 'yes' : 'no'})}
                    style={{ accentColor:'var(--green-primary)', width:'20px', height:'20px', cursor:'pointer' }} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:800, color:'var(--text-primary)', fontSize:'0.9rem' }}>Include on-site Blood Sugar Safety Screening</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--text-secondary)', marginTop:'2px' }}>Highly recommended for diabetic patients or transplants over 2000 grafts.</div>
                  </div>
                  <span className="badge badge-gradient">🛡️ Safety First</span>
                </label>

                <div style={{ display:'flex', gap:'12px', marginTop:'28px' }}>
                  <button className="btn btn-secondary flex-1" onClick={() => setStep(2)}><ArrowLeft size={16} style={{ marginRight:'6px' }} /> Back</button>
                  <button className="btn btn-primary flex-1"
                    disabled={!form.date || !form.time}
                    style={{ opacity:(!form.date || !form.time) ? 0.6 : 1 }}
                    onClick={handleSubmit}>
                    Confirm & Generate Pass 🎉
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Step 4: Success */
          <div className="consult-step-content fade-in-up" style={{ textAlign:'center' }}>
            <div style={{ width:'72px', height:'72px', borderRadius:'50%', background:'rgba(11,167,89,0.12)', color:'var(--green-primary)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
              <CheckCircle2 size={38} />
            </div>
            <h2 style={{ color:'var(--green-primary)', fontFamily:'var(--font-display)', marginBottom:'8px' }}>Appointment Scheduled!</h2>
            <p style={{ color:'var(--text-secondary)', fontSize:'0.9rem', marginBottom:'28px' }}>
              Your exclusive care pass has been generated. Our specialists have been notified.
            </p>

            <div className="consult-ticket">
              <div className="consult-ticket-header">
                <HairHavenLogo size={40} />
                <div>
                  <div style={{ fontWeight:900, fontSize:'1.1rem', color:'var(--text-primary)' }}>Hair Haven Clinic</div>
                  <div style={{ fontSize:'0.75rem', color:'var(--text-tertiary)' }}>Channi Himmat, Jammu</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:'0.7rem', color:'var(--text-tertiary)' }}>Booking ID</div>
                  <div style={{ fontWeight:800, color:'var(--green-primary)', fontSize:'0.9rem' }}>{ticket?.id}</div>
                </div>
              </div>
              <div className="consult-ticket-divider" />
              <div className="consult-ticket-grid">
                <div><div className="consult-ticket-label">Patient</div><div className="consult-ticket-value">{ticket?.fullName}</div></div>
                <div><div className="consult-ticket-label">Treatment</div><div className="consult-ticket-value">{ticket?.service}</div></div>
                <div><div className="consult-ticket-label">Date</div><div className="consult-ticket-value">{ticket?.date}</div></div>
                <div><div className="consult-ticket-label">Time</div><div className="consult-ticket-value">{ticket?.time}</div></div>
              </div>
              <div className="consult-ticket-divider" />
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div className="consult-ticket-label">Estimated Cost</div>
                  <div style={{ fontSize:'1.8rem', fontWeight:900, color:'var(--green-primary)' }}>₹{ticket?.priceEstimate?.toLocaleString('en-IN')}</div>
                </div>
                <span className="badge badge-gradient">Pay at Clinic</span>
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginTop:'24px' }}>
              <button className="btn btn-primary w-100"
                style={{ background:'#25d366', boxShadow:'0 8px 24px rgba(37,211,102,0.3)' }}
                onClick={() => {
                  const msg = `🌿 *HAIR HAVEN — APPOINTMENT CONFIRMED*\n━━━━━━━━━━━━━━━━━━━\n👤 *Patient:* ${ticket?.fullName}\n📞 *Phone:* ${ticket?.phone}\n💉 *Treatment:* ${ticket?.service}\n📅 *Date:* ${ticket?.date} at ${ticket?.time}\n💳 *Estimate:* ₹${ticket?.priceEstimate?.toLocaleString('en-IN')}\n━━━━━━━━━━━━━━━━━━━\n✅ Booking ID: ${ticket?.id}`;
                  window.open(`https://wa.me/918899708659?text=${encodeURIComponent(msg)}`, '_blank');
                }}>
                <MessageSquare size={18} style={{ marginRight:'8px' }} />
                Alert Clinic via WhatsApp
              </button>
              <div style={{ display:'flex', gap:'12px' }}>
                <button className="btn btn-secondary flex-1" onClick={() => { setStep(1); setTicket(null); setForm({ fullName:'', phone:'', email:'', service:'FUE Hair Transplant', date:'', time:'', notes:'', hadPriorConsultation:'no', bloodSugarCheck:'no' }); }}>
                  Book Another
                </button>
                <button className="btn btn-secondary flex-1" onClick={() => window.print()}>Print Pass</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════ */

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

const SYSTEM_PROMPT = `You are "Haven", the ultra-advanced, empathetic, and expert Personal AI Hair Restoration Consultant for Hair Haven, the premier hair transplant clinic in Jammu.

Your purpose is to answer any hair transplant and hair restoration questions with clinical precision, immense warm hospitality, and 100% factual accuracy based on Hair Haven's offerings.

### HAIR HAVEN CLINIC DETAILS:
- Address: 606/B, Sector 3, Channi Himmat, Jammu - 180015, J&K.
- Contact Number / WhatsApp: +91 88997 08659 (Patients can book by clicking "Book Consultation" or clicking the WhatsApp alert).
- Timings: 10:00 AM to 06:00 PM, Open 7 Days a week (Monday to Sunday).
- Facilities: State-of-the-art sterile clinic, premium surgical rooms, diagnostic tools, free on-site parking.

### TREATMENTS & PRICING:
1. Surgical Treatments:
   - FUE Hair Transplant: Modern technique where healthy grafts are extracted individually from the donor area (usually back of head) and implanted. Minimally invasive, no major scars, natural density, fast recovery. Starting from ₹21,000.
   - BioSapphire FUE Technique: Advanced FUE using premium sapphire blades to make micro-channels. Superior graft density, rapid scalp healing, extremely natural. Starting from ₹31,000.
2. Non-Surgical Growth Treatments:
   - PRP Therapy (Platelet Rich Plasma): Injecting own platelets into scalp to strengthen hair roots, reduce hair fall, and stimulate growth. ₹2,000 / session.
   - GFC Therapy (Growth Factor Concentrate): Advanced regenerative treatment using concentrated growth factors from patient's blood. Nourishes follicles, improves thickness, controls hair fall. ₹4,500 / session.
3. Specialized Transplants:
   - Beard Transplant: Fuller, dense, natural beard restoration. Custom pricing.
   - Eyebrow Transplant: Restore thin/uneven brows with directional graft placement. Custom pricing.

### NORWOOD SCALE & SURGICAL PLANNING (GRAFTS & COSTS):
Help patients estimate their hair loss stage and cost:
- Stage 1: Minimal hair loss. No transplant needed. Preventive PRP/GFC recommended.
- Stage 2: Minor temple receding. 500 - 1,000 grafts. Starting from ₹21,000 to ₹25,000.
- Stage 3: Clear M/V-shaped hairline recession. 1,200 - 1,800 grafts. Starting from ₹30,000 (Base).
- Stage 4: Receding front & crown thinning. 2,000 - 2,800 grafts. Starting from ₹35,000 to ₹40,000.
- Stage 5: Advanced hair loss (thin bridge between front & crown). 2,800 - 3,500 grafts. Starting from ₹40,000 to ₹45,000.
- Stage 6: Severe hair loss (merged front & crown). 3,500 - 4,500 grafts. Starting from ₹45,000 (Base).
- Stage 7: Extreme balding (narrow horseshoe band remaining). 4,500+ grafts. Custom quote, starting from ₹45,000+.

### OUR SUPPORTIVE TEAM:
- Clinical Director: Dr. Suby Kakkar (MBBS, E. Dermatology, Germany, Ex-Consultant Max Hospital Delhi. Highly experienced in advanced dermatological therapies).
- Master Technician: Maxon Epstin (Hair Transplant & PRP Specialist, expert in hair extraction, PRP growth therapies, and surgical support).
- Senior Implanter: Kashish Gupta (Skilled in precise graft placement and natural hair line work with years of hands-on expertise).
- Patient Care Coordinator: Ronika Bhardwaj (Manages post-transplant recovery logs, patient check-ups, and guides incoming clinical leads).
- Certified Clinical Staff: Shazia mam and Rimpy mam (renowned by patients for their attentive care, friendly behavior, and excellent work supervision).

### RECOVERY & POST-CARE RULES:
- Recovery Timeline: 3-5 days for temple work, 7-10 days for crown. Scalp heals completely in 10-14 days. New hair starts growing in 3-4 months, full density achieved in 8-12 months.
- Immediate Post-Care: Avoid scratching, sleeping directly on the grafts for the first 3 days, avoid heavy workouts for 10 days, and use the prescribed saline spray and mild shampoo.

### STYLE & BEHAVIOR:
- Be warm, highly supportive, and professional. Use bullet points for structured information (e.g., costs, recovery steps).
- Promote Hair Haven's booking pass tool and WhatsApp integration! If a patient expresses interest in booking, guide them to click the "Book" button in the navigation bar or use the "Book Consultation" page.
- Keep answers concise, highly informative, and easy to read. Never use placeholders.
- Speak about Hair Haven's 100% success rate, subsidies, and high patient satisfaction (e.g., Manmohan Singh, Saleem, and Sunny's 5-star reviews!).`;

function AIChatbot({ onBookNow }: { onBookNow: () => void }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('hh_chat_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved chat messages', e);
      }
    }
    return [
      {
        role: 'assistant',
        content: `👋 Hello! I am **Haven**, your personal AI Hair Restoration expert at Hair Haven. 🌿\n\nI can help you estimate your required hair grafts, check treatment pricing, learn about our doctor-led procedures, or explain the FUE recovery process.\n\nWhat can I assist you with today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('hh_chat_messages', JSON.stringify(messages));
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    if (trimmed === 'BOOK_NOW_TRIGGER') {
      setChatOpen(false);
      onBookNow();
      return;
    }

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessages = [
      ...messages,
      { role: 'user' as const, content: trimmed, timestamp: userTime }
    ];
    setMessages(newMessages);
    setInputText('');
    setIsTyping(true);

    try {
      const apiMessages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        ...newMessages.map(m => ({ role: m.role, content: m.content }))
      ];

      const clientApiKey = import.meta.env.VITE_GROQ_API_KEY;
      let assistantReply = '';

      if (clientApiKey) {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${clientApiKey}`
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: apiMessages,
            temperature: 0.5,
            max_tokens: 1024
          })
        });
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `Groq API responded with status ${response.status}`);
        }
        const data = await response.json();
        assistantReply = data.choices[0].message.content;
      } else {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ messages: apiMessages })
        });
        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Server responded with status ${response.status}: ${errText}`);
        }
        const data = await response.json();
        assistantReply = data.content;
      }

      const assistantTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [
        ...prev,
        { role: 'assistant' as const, content: assistantReply, timestamp: assistantTime }
      ]);
    } catch (error: any) {
      console.error("Chat error:", error);
      const assistantTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant' as const, 
          content: `⚠️ Sorry, I encountered an issue connecting to my hair transplant knowledge system. Please check your internet connection or try again. \n\n*Error: ${error.message || 'Unknown network error'}*`, 
          timestamp: assistantTime 
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear your conversation history?")) {
      const resetMessages: ChatMessage[] = [
        {
          role: 'assistant',
          content: `👋 Conversation reset! I am **Haven**, your personal AI Hair Restoration expert. \n\nHow can I help you today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      setMessages(resetMessages);
      localStorage.removeItem('hh_chat_messages');
    }
  };

  const suggestions = [
    { label: '📅 Book Online Pass', text: 'BOOK_NOW_TRIGGER' },
    { label: '🧮 Estimate Grafts & Cost', text: 'How many grafts do I need and what is the cost of hair transplant?' },
    { label: '💎 FUE vs Sapphire FUE', text: 'What is the difference between standard FUE and BioSapphire FUE technique?' },
    { label: '💉 GFC vs PRP Cost', text: 'What are the pricing details for GFC and PRP therapy sessions?' },
    { label: '👨‍⚕️ Meet Dr. Suby Kakkar', text: 'Tell me about Clinical Director Dr. Suby Kakkar and the supportive staff.' }
  ];

  return (
    <>
      <button 
        onClick={() => setChatOpen(!chatOpen)}
        className="chatbot-fab"
        title="Consult Haven AI"
      >
        <span className="chatbot-fab-sparkles">✨</span>
        {chatOpen ? (
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </button>

      {chatOpen && (
        <div className="chatbot-window-container">
          <div className="chatbot-window">
            <div className="chatbot-header">
              <div className="chatbot-header-info">
                <div className="chatbot-avatar-container">
                  <span style={{ fontSize: '1.2rem' }}>🌿</span>
                  <div className="chatbot-status-dot"></div>
                </div>
                <div>
                  <div className="chatbot-header-title">Haven AI</div>
                  <div className="chatbot-header-subtitle">
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
                    Active Now
                  </div>
                </div>
              </div>
              <div className="chatbot-header-actions">
                <button 
                  onClick={handleClear}
                  className="chatbot-header-btn"
                  title="Clear Chat History"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
                <button 
                  onClick={() => setChatOpen(false)}
                  className="chatbot-header-btn"
                  title="Minimize Chat"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="12" x2="6" y2="12"></line>
                  </svg>
                </button>
              </div>
            </div>

            <div className="chatbot-body" style={{ position: 'relative' }}>
            <div className={`thinking-orb-container ${isTyping ? 'visible' : ''}`}>
              <div className="thinking-orb-aura"></div>
              <div className="thinking-orb-core"></div>
            </div>
              {messages.map((m, idx) => (
                <div key={idx} className={`chat-msg ${m.role}`}>
                  <div className="chat-bubble">
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      {m.content.split('\n').map((line, lIdx) => {
                        let content: React.ReactNode = line;
                        
                        if (line.includes('**')) {
                          const parts = line.split('**');
                          content = parts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx}>{part}</strong> : part);
                        }

                        if (line.trim().startsWith('- ')) {
                          return (
                            <div key={lIdx} style={{ display: 'flex', gap: '8px', marginLeft: '8px', margin: '4px 0' }}>
                              <span>•</span>
                              <span>{content}</span>
                            </div>
                          );
                        }

                        if (line.trim().startsWith('###')) {
                          return <h4 key={lIdx} style={{ margin: '12px 0 6px 0', fontSize: '0.92rem', fontWeight: 800, color: 'var(--green-deep)' }}>{line.replace('###', '').trim()}</h4>;
                        }

                        return <p key={lIdx} style={{ margin: '0 0 8px 0', lineHeight: 1.5 }}>{content}</p>;
                      })}
                    </div>
                  </div>
                  <div className="chat-msg-time">{m.timestamp}</div>
                </div>
              ))}
              {isTyping && (
                <div className="chat-msg assistant">
                  <div className="chat-bubble" style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="typing-indicator">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chatbot-input-container">
              {messages.length === 1 && (
                <div className="chatbot-suggestions">
                  {suggestions.map((s, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleSend(s.text)}
                      className="chatbot-suggestion-pill"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
              
              <div className="chatbot-input-row">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSend(inputText);
                  }}
                  placeholder="Ask Haven about hair transplant..."
                  className="chatbot-input"
                  disabled={isTyping}
                />
                <button 
                  onClick={() => handleSend(inputText)}
                  disabled={!inputText.trim() || isTyping}
                  className="chatbot-send-btn"
                  title="Send Message"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>
              <div className="chatbot-disclaimer">
                🌿 AI Assistant — Book a clinical consult for full diagnostics.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  /* ── Page Routing ── */
  const [currentPage, setCurrentPage] = useState<'home' | 'consultation'>('home');
  const [selectedService, setSelectedService] = useState('FUE Hair Transplant');

  /* ── Nav & Scroll ── */
  const [activeTab, setActiveTab] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  /* ── Dark Mode ── */
  const [isDarkMode, setIsDarkMode] = useState(() => document.body.classList.contains('dark-mode'));

  /* ── Calculator ── */
  const [selectedNorwood, setSelectedNorwood] = useState(3);
  const [includePRPSessions, setIncludePRPSessions] = useState(0);
  const [includeScreening, setIncludeScreening] = useState(true);
  const [useBioSapphire, setUseBioSapphire] = useState(false);

  /* ── Reviews ── */
  const [selectedReviewTag, setSelectedReviewTag] = useState('All');
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [reviewSortOrder, setReviewSortOrder] = useState('relevant');

  /* ── Gallery Swiper ── */
  const [currentSwiperIndex, setCurrentSwiperIndex] = useState(0);
  const swiperImages = useMemo(() => [
    '/image.png','/image copy.png','/image copy 2.png','/image copy 3.png',
    '/image copy 4.png','/image copy 5.png','/image copy 6.png','/image copy 7.png'
  ], []);

  /* ── Typewriter ── */
  const phrases = useMemo(() => [
    "Natural Hair Restoration","Precision FUE Transplants","Artistic Hairline Design",
    "Premium Graft Implantation","Vibrant & Dense Results","Science-Backed Hair Growth"
  ], []);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  /* ── PWA Install ── */
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [pwaInstalled, setPwaInstalled] = useState(false);

  /* ─────────────────────────────────────────────── */

  useEffect(() => {
    if (isDarkMode) document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');
  }, [isDarkMode]);

  // Swiper auto-play
  useEffect(() => {
    const iv = setInterval(() => setCurrentSwiperIndex(p => (p + 1) % swiperImages.length), 3000);
    return () => clearInterval(iv);
  }, [swiperImages.length]);

  // Preload images
  useEffect(() => {
    for (let i = 1; i <= 7; i++) { const img = new Image(); img.src = `/norwood${i}.png`; }
    swiperImages.forEach(src => { const img = new Image(); img.src = src; });
  }, [swiperImages]);

  // Scroll handler
  useEffect(() => {
    const onScroll = () => {
      setScrollY(window.scrollY);
      const el = document.documentElement;
      setScrollProgress(Math.min((window.scrollY / (el.scrollHeight - el.clientHeight)) * 100, 100));
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Typewriter
  useEffect(() => {
    let timer: number;
    const handleType = () => {
      const fullText = phrases[phraseIdx];
      if (!isDeleting) {
        const next = fullText.slice(0, displayText.length + 1);
        setDisplayText(next);
        if (next === fullText) { setIsDeleting(true); setTypingSpeed(2000); }
        else setTypingSpeed(80);
      } else {
        const next = fullText.slice(0, displayText.length - 1);
        setDisplayText(next);
        if (next === '') { setIsDeleting(false); setPhraseIdx(p => (p + 1) % phrases.length); setTypingSpeed(500); }
        else setTypingSpeed(45);
      }
    };
    timer = window.setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, phraseIdx, typingSpeed, phrases]);

  // PWA install prompt
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
      // Show modal for first-time users
      const hasSeenInstall = localStorage.getItem('hh_pwa_seen');
      if (!hasSeenInstall) {
        setTimeout(() => setShowInstallModal(true), 3000);
        localStorage.setItem('hh_pwa_seen', '1');
      }
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    window.addEventListener('appinstalled', () => { setPwaInstalled(true); setShowInstallBanner(false); setDeferredPrompt(null); });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const triggerInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') { setPwaInstalled(true); setShowInstallBanner(false); }
    setDeferredPrompt(null);
    setShowInstallModal(false);
  }, [deferredPrompt]);

  // Filtered reviews
  const filteredTestimonials = useMemo(() => {
    let result = [...testimonials];
    if (selectedReviewTag !== 'All') result = result.filter(t => t.tag === selectedReviewTag);
    if (reviewSearchQuery.trim()) {
      const q = reviewSearchQuery.toLowerCase();
      result = result.filter(t => t.name.toLowerCase().includes(q) || t.quote.toLowerCase().includes(q) || t.tag.toLowerCase().includes(q));
    }
    if (reviewSortOrder === 'newest') result.sort((a, b) => (a.daysAgo || 0) - (b.daysAgo || 0));
    else if (reviewSortOrder === 'highest') result.sort((a, b) => b.rating - a.rating);
    else result.sort((a, b) => a.id - b.id);
    return result;
  }, [selectedReviewTag, reviewSearchQuery, reviewSortOrder]);

  const currentNorwoodInfo = norwoodStages[selectedNorwood - 1];

  const calculateCalculatorPrice = () => {
    let base = norwoodStages[selectedNorwood - 1].basePrice;
    let extra = includePRPSessions * 2000;
    if (includeScreening) extra += 999;
    if (useBioSapphire) extra += 10000;
    return base + extra;
  };

  const handleBookScroll = () => {
    setSelectedService('FUE Hair Transplant');
    setCurrentPage('consultation');
  };
  const handleBookService = (service: string) => {
    setSelectedService(service);
    setCurrentPage('consultation');
  };

  const navTabs = [
    { id:'home', label:'Home', icon: Home },
    { id:'services', label:'Treatments', icon: Stethoscope },
    { id:'gallery', label:'Gallery', icon: ImageIcon },
    { id:'reviews', label:'Reviews', icon: MessageCircle },
    { id:'consultation', label:'Book', icon: Calendar },
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <MagicalOrbs />

      {/* PWA Install Banner */}
      {showInstallBanner && !pwaInstalled && (
        <div className="pwa-banner">
          <div className="pwa-banner-left">
            <HairHavenLogo size={32} />
            <div>
              <div style={{ fontWeight:700, fontSize:'0.88rem', color:'var(--text-primary)' }}>Install Hair Haven App</div>
              <div style={{ fontSize:'0.72rem', color:'var(--text-secondary)' }}>Add to home screen for quick access</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
            <button className="btn btn-primary btn-sm" onClick={triggerInstall} style={{ padding:'8px 16px', fontSize:'0.78rem' }}>
              <Download size={14} style={{ marginRight:'4px' }} /> Install
            </button>
            <button onClick={() => setShowInstallBanner(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-tertiary)', padding:'4px' }}>
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* PWA Install Modal (first-time) */}
      {showInstallModal && (
        <div className="pwa-modal-overlay" onClick={() => setShowInstallModal(false)}>
          <div className="pwa-modal" onClick={e => e.stopPropagation()}>
            <button className="pwa-modal-close" onClick={() => setShowInstallModal(false)}><X size={18} /></button>
            <HairHavenLogo size={64} className="pwa-modal-logo" />
            <h3 style={{ fontFamily:'var(--font-display)', color:'var(--text-primary)', marginBottom:'8px' }}>Install Hair Haven</h3>
            <p style={{ color:'var(--text-secondary)', fontSize:'0.88rem', lineHeight:'1.6', marginBottom:'24px', textAlign:'center' }}>
              Get instant access to book consultations, explore treatments, and track your hair restoration journey — right from your home screen.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px', width:'100%' }}>
              <button className="btn btn-primary w-100 pulse-button" onClick={triggerInstall}>
                <Download size={18} style={{ marginRight:'8px' }} />
                Add to Home Screen
              </button>
              <button className="btn btn-secondary w-100" onClick={() => setShowInstallModal(false)}>
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      {currentPage === 'home' ? (
        <>
          {/* Top Bar */}
          <nav className={`glass-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container py-4 flex justify-between align-center" style={{ minHeight:'70px' }}>

          {/* Dark Mode Toggle */}
          <button onClick={() => setIsDarkMode(!isDarkMode)}
            style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-primary)', display:'flex', alignItems:'center', padding:'8px', borderRadius:'50%' }}
            title="Toggle Dark Mode">
            {isDarkMode ? <Sun size={20} color="var(--green-primary)" /> : <Moon size={20} color="var(--green-deep)" />}
          </button>

          {/* Center Logo */}
          <a href="#home" className="flex align-center gap-3" style={{ textDecoration:'none', position:'absolute', left:'50%', transform:'translateX(-50%)' }}>
            <HairHavenLogo size={40} />
            <div className="flex flex-col">
              <span style={{ fontSize:'1.25rem', fontWeight:800, color:'var(--text-primary)', fontFamily:'var(--font-display)', letterSpacing:'-0.02em', lineHeight:1.1 }}>Hair Haven</span>
              <span style={{ fontSize:'0.65rem', fontWeight:700, color:'var(--gemini-purple)', letterSpacing:'0.1em', textTransform:'uppercase' }}>Transplant Clinic</span>
            </div>
          </a>

          {/* Desktop nav links */}
          <div className="desktop-only-flex gap-4">
            {[
              { href:'#services', label:'Treatments' },
              { href:'#calculator', label:'Calculator' },
              { href:'#gallery', label:'Gallery' },
              { href:'#reviews', label:'Reviews' },
            ].map(n => (
              <a key={n.href} href={n.href} className="nav-link" onClick={() => scrollToSection(n.href.slice(1))}>{n.label}</a>
            ))}
            <button onClick={handleBookScroll} className="btn btn-primary btn-sm pulse-button">Book Consultation</button>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-only-block"
            style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-primary)' }}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-nav-drawer">
            <a href="#home" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>🏠 Home</a>
            <a href="#services" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>💉 Treatments</a>
            <a href="#team" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>👨‍⚕️ Expert Team</a>
            <a href="#calculator" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>🧮 Calculator</a>
            <a href="#gallery" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>📸 Gallery</a>
            <a href="#reviews" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>⭐ Reviews</a>
            <a href="#map" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>📍 Location</a>
            <div className="mobile-nav-divider" />
            <button onClick={() => { setCurrentPage('consultation'); setMobileMenuOpen(false); }} className="btn btn-primary" style={{ width:'100%', marginTop:'8px' }}>
              Book Free Consultation
            </button>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="btn btn-secondary" style={{ width:'100%', marginTop:'8px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        )}
      </nav>

      {/* Scroll Progress */}
      <div style={{ position:'fixed', top:0, left:0, height:'3px', width:`${scrollProgress}%`, background:'linear-gradient(90deg, var(--green-deep) 0%, var(--green-primary) 60%, #22d3ee 100%)', zIndex:10000, transition:'width 0.1s linear', borderRadius:'0 2px 2px 0', boxShadow:'0 0 8px rgba(11,167,89,0.5)' }} />

      {/* ── HERO ── */}
      <section id="home" className="pt-20 py-24 flex align-center" style={{ minHeight:'90vh', position:'relative' }}>
        <div className="container grid grid-cols-2 align-center gap-12 flex-col-mobile">
          <div className="fade-in-up flex flex-col align-start-desktop align-center-mobile text-center-mobile" style={{ animationDelay:'0.1s', alignSelf:'center', paddingTop:'48px' }}>
            <div className="badge badge-gradient mb-4">
              <Sparkles size={14} style={{ marginRight:'8px', color:'var(--gemini-purple)' }} />
              Premium Hair Restoration in Jammu
            </div>
            <h1 className="hero-title mb-6" style={{ minHeight:'2.4em' }}>
              The Art & Science of <br className="mobile-only-block" /><span className="text-gemini-gradient">{displayText}</span><span className="typewriter-cursor"></span>
            </h1>
            <p className="text-lg text-secondary-color mb-8" style={{ lineHeight:'1.7', maxWidth:'540px' }}>
              Welcome to <strong>Hair Haven</strong>, Jammu's premier aesthetic surgical center.
              We combine advanced Follicular Unit Extraction (FUE) graft techniques and growth-factor therapies
              to craft customized, natural-looking hairlines that restore both density and confidence.
            </p>
            <div className="flex gap-4 flex-wrap mb-8 justify-center-mobile">
              <button onClick={handleBookScroll} className="btn btn-primary">
                Consult Our Team <ArrowRight size={16} style={{ marginLeft:'8px' }} />
              </button>
              <a href="#calculator" className="btn btn-secondary">Estimate Hair Grafts</a>
            </div>
            <div className="flex gap-8 flex-wrap py-4 justify-center-mobile" style={{ borderTop:'1px solid var(--border-light)', width:'100%' }}>
              <div className="flex align-center gap-3">
                <div style={{ display:'flex', color:'#ffb627' }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#ffb627" color="#ffb627" />)}
                </div>
                <div>
                  <div style={{ fontWeight:800, fontSize:'1.1rem' }}>4.9 / 5 Stars</div>
                  <div style={{ fontSize:'0.8rem', color:'var(--text-tertiary)' }}>191+ Verified Reviews</div>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'rgba(11,167,89,0.1)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--gemini-blue)' }}>
                  <Shield size={20} />
                </div>
                <div>
                  <div style={{ fontWeight:800, fontSize:'1.1rem' }}>100% Sterile OT</div>
                  <div style={{ fontSize:'0.8rem', color:'var(--text-tertiary)' }}>Certified Safety Standards</div>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="glass-card p-8 flex flex-col justify-center graphic-pattern fade-in-up" style={{ minHeight:'400px', animationDelay:'0.3s' }}>
            <div style={{ background:'linear-gradient(135deg, rgba(11,167,89,0.04) 0%, rgba(110,231,183,0.04) 100%)', borderRadius:'32px', padding:'40px', border:'1px solid rgba(255,255,255,0.8)', marginBottom:'24px', boxShadow:'0 24px 50px -12px rgba(11,167,89,0.1)', position:'relative', overflow:'hidden', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
              <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', opacity:0.15, backgroundSize:'20px 20px', backgroundImage:'radial-gradient(rgba(11,167,89,0.3) 1px, transparent 1px)' }} />
              <div className="logo-bg-glow" style={{ position:'absolute', width:'160px', height:'160px', borderRadius:'50%', background:'rgba(11,167,89,0.12)', zIndex:0 }} />
              <div style={{ zIndex:1, filter:'drop-shadow(0 20px 30px rgba(11,167,89,0.15))', animation:'logo-float 4s infinite ease-in-out' }}>
                <HairHavenLogo size={180} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <Shield size={14} color="#0ba759" />, label:'Safety', value:'100% Sterile OT' },
                { icon: <Sparkles size={14} color="#0ba759" />, label:'Surgical Tech', value:'Advanced FUE' },
                { icon: <Star size={14} color="#ffb627" />, label:'Google Rating', value:'4.9★ on Google' },
                { icon: <Heart size={14} color="#0ba759" />, label:'Patients', value:'1000+ Treated' },
              ].map((item, i) => (
                <div key={i} style={{ background:'rgba(255,255,255,0.65)', padding:'16px', borderRadius:'20px', border:'1px solid var(--border-glass)', boxShadow:'var(--shadow-sm)', backdropFilter:'blur(10px)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
                    {item.icon}
                    <span style={{ fontSize:'0.72rem', color:'var(--text-tertiary)', textTransform:'uppercase', fontWeight:700, letterSpacing:'0.05em' }}>{item.label}</span>
                  </div>
                  <div style={{ fontSize:'0.92rem', fontWeight:700, color:'var(--text-primary)' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* ── TREATMENT PROCESS ── */}
      <section id="process" className="py-24" style={{ position:'relative', borderTop:'1px solid var(--border-light)', background: 'linear-gradient(to bottom, var(--surface-bg), rgba(11,167,89,0.02))' }}>
        <div className="container">
          <div className="text-center mb-16">
            <div className="badge badge-gradient mb-3">The Procedure</div>
            <h2 className="text-4xl mb-4">Our Treatment Process</h2>
            <p className="text-lg text-secondary-color" style={{ maxWidth:'640px', margin:'0 auto' }}>
              We follow a rigorous, step-by-step scientific approach to ensure maximum graft survival, natural aesthetics, and a smooth recovery.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-6 flex-col-mobile">
            {[
              { step: '01', title: 'Local Anesthesia', desc: 'Painless administration of local anesthesia for a comfortable procedure.', image: '/process-1.png' },
              { step: '02', title: 'Harvest from Donor Area', desc: 'Precise and careful extraction of healthy hair follicles from the donor zone.', image: '/process-2.png' },
              { step: '03', title: 'Implantation of The Grafts', desc: 'Strategic placement of grafts at the correct angle to match natural hair growth.', image: '/process-3.png' },
              { step: '04', title: 'Result', desc: 'Natural-looking, dense hair growth and complete restoration of your confidence.', image: '/process-4.png' }
            ].map((p, i) => (
              <div key={i} className="glass-card p-6 flex flex-col align-center text-center" style={{ position: 'relative', overflow: 'hidden', borderTop: '4px solid var(--green-primary)' }}>
                <div style={{ position: 'absolute', top: '-5px', right: '-10px', fontSize: '6rem', fontWeight: 900, color: 'var(--green-primary)', opacity: 0.05, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{p.step}</div>
                <div style={{ width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(11,167,89,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', zIndex: 1, padding: '10px' }}>
                  <img src={p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', zIndex: 1 }}>{p.title}</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, zIndex: 1 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="py-24" style={{ position:'relative' }}>
        <div className="container">
          <div className="text-center mb-16">
            <div className="badge badge-gradient mb-3">Our Clinical Offerings</div>
            <h2 className="text-4xl mb-4">Complete Dermal & Hair Services Menu</h2>
            <p className="text-lg text-secondary-color" style={{ maxWidth:'640px', margin:'0 auto' }}>
              From state-of-the-art FUE surgical restoration to advanced dermatological laser procedures.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8 flex-col-mobile">
            {/* Surgical */}
            <div className="flex flex-col gap-6">
              <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:'rgba(66,133,244,0.1)', color:'var(--gemini-blue)', display:'flex', alignItems:'center', justifyContent:'center' }}><Award size={20} /></div>
                <h3 className="text-xl">Hair Transplants</h3>
              </div>
              {services.surgical.map((srv, i) => (
                <div key={i} className="glass-card p-6 flex flex-col" style={{ gap:'16px' }}>
                  <div>
                    <div className="flex justify-between align-center flex-wrap gap-2 mb-2">
                      <h4 className="font-semibold text-lg" style={{ lineHeight:'1.3' }}>{srv.title}</h4>
                      <span className="badge" style={{ fontSize:'0.75rem', borderColor:'rgba(11,167,89,0.2)', color:'var(--green-deep)', fontWeight:700 }}>{srv.price}</span>
                    </div>
                    <p style={{ fontSize:'0.875rem', color:'var(--text-secondary)', lineHeight:'1.5' }}>{srv.desc}</p>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'6px', marginTop:'auto' }}>
                    {srv.features.slice(0,3).map((f, fi) => (
                      <div key={fi} style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'0.8rem', color:'var(--text-secondary)' }}>
                        <CheckCircle2 size={12} color="var(--green-primary)" /><span>{f}</span>
                      </div>
                    ))}
                    <button onClick={() => handleBookService(srv.title)} className={`btn w-100 ${srv.title.includes('Transplant') ? 'btn-primary' : 'btn-secondary'} btn-sm`} style={{ marginTop:'8px' }}>
                      {srv.title.includes('Transplant') ? 'Reserve Transplant Slot' : 'Book Session'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Non-Surgical */}
            <div className="flex flex-col gap-6">
              <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:'rgba(11,167,89,0.1)', color:'var(--green-deep)', display:'flex', alignItems:'center', justifyContent:'center' }}><Sparkles size={20} /></div>
                <h3 className="text-xl">Non-Surgical Therapies</h3>
              </div>
              {services.lasers.map((srv, i) => (
                <div key={i} className="glass-card p-6 flex flex-col" style={{ gap:'16px' }}>
                  <div>
                    <div className="flex justify-between align-center flex-wrap gap-2 mb-2">
                      <h4 className="font-semibold text-lg">{srv.title}</h4>
                      <span className="badge" style={{ fontSize:'0.75rem', borderColor:'rgba(11,167,89,0.2)', color:'var(--green-primary)', fontWeight:700 }}>{srv.price}</span>
                    </div>
                    <p style={{ fontSize:'0.875rem', color:'var(--text-secondary)', lineHeight:'1.5' }}>{srv.desc}</p>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'6px', marginTop:'auto' }}>
                    {srv.features.slice(0,3).map((f, fi) => (
                      <div key={fi} style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'0.8rem', color:'var(--text-secondary)' }}>
                        <CheckCircle2 size={12} color="var(--green-primary)" /><span>{f}</span>
                      </div>
                    ))}
                    <button onClick={() => handleBookService(srv.title)} className="btn btn-secondary btn-sm w-100" style={{ marginTop:'8px' }}>Book Growth Session</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Specialized */}
            <div className="flex flex-col gap-6">
              <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:'rgba(11,167,89,0.1)', color:'var(--green-deep)', display:'flex', alignItems:'center', justifyContent:'center' }}><Heart size={20} /></div>
                <h3 className="text-xl">Specialized Transplants</h3>
              </div>
              {services.dermatology.map((srv, i) => (
                <div key={i} className="glass-card p-6 flex flex-col" style={{ gap:'16px' }}>
                  <div>
                    <div className="flex justify-between align-center flex-wrap gap-2 mb-2">
                      <h4 className="font-semibold text-lg">{srv.title}</h4>
                      <span className="badge" style={{ fontSize:'0.75rem', borderColor:'rgba(11,167,89,0.2)', color:'var(--green-mid)', fontWeight:700 }}>{srv.price}</span>
                    </div>
                    <p style={{ fontSize:'0.875rem', color:'var(--text-secondary)', lineHeight:'1.5' }}>{srv.desc}</p>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'6px', marginTop:'auto' }}>
                    {srv.features.slice(0,3).map((f, fi) => (
                      <div key={fi} style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'0.8rem', color:'var(--text-secondary)' }}>
                        <CheckCircle2 size={12} color="var(--green-primary)" /><span>{f}</span>
                      </div>
                    ))}
                    <button onClick={() => handleBookService(srv.title)} className="btn btn-secondary btn-sm w-100" style={{ marginTop:'8px' }}>Book Clinical Treatment</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section id="team" className="py-24" style={{ position:'relative' }}>
        <div className="container">
          
          {/* ── FOUNDER PROFILE ── */}
          <div className="mb-20 text-center flex flex-col align-center" style={{ maxWidth: '700px', margin: '0 auto 80px' }}>
            <div style={{ width: '180px', height: '180px', borderRadius: '50%', overflow: 'hidden', border: '4px solid var(--green-primary)', margin: '0 auto 24px', boxShadow: '0 12px 32px rgba(11,167,89,0.15)' }}>
              <img src="/founder.png" alt="Mr. Harish Kalsotra" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>Mr. Harish Kalsotra</h3>
            <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--green-primary)', marginBottom: '24px' }}>(Founder & Client Relations Executive)</p>
            <div style={{ position: 'relative', padding: '0 24px' }}>
              <span style={{ fontSize: '3rem', color: 'var(--border-light)', position: 'absolute', top: '-15px', left: '-10px', fontFamily: 'Georgia, serif', lineHeight: 1 }}>"</span>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: '1.7', position: 'relative', zIndex: 1 }}>
                Dedicated to helping clients regain confidence through advanced hair restoration solutions and personalized care.
              </p>
              <span style={{ fontSize: '3rem', color: 'var(--border-light)', position: 'absolute', bottom: '-35px', right: '-10px', fontFamily: 'Georgia, serif', lineHeight: 1 }}>"</span>
            </div>
          </div>

          <div className="text-center mb-16">
            <div className="badge badge-gradient mb-3">Expert Care Specialists</div>
            <h2 className="text-4xl mb-4">Meet Our Supportive Team</h2>
            <p className="text-lg text-secondary-color" style={{ maxWidth:'640px', margin:'0 auto' }}>
              Your hair restoration journey is supported by certified medical professionals, precision implanters, and dedicated recovery support leads.
            </p>
          </div>
          <div className="grid grid-cols-4 gap-6 flex-col-mobile">
            {[
              { initials:'SK', role:'Clinical Director', name:'Dr. Suby Kakkar', qual:'MBBS, E. Dermatology, Germany', bio:'Ex Consultant: Max Hospital Delhi. Highly experienced in advanced dermatological therapies.' },
              { initials:'ME', role:'Master Technician', name:'Maxon Epstin', qual:'Hair Transplant & PRP Specialist', bio:'Expert in hair extraction, PRP growth therapies, and advanced surgical support procedures.' },
              { initials:'KG', role:'Senior Implanter', name:'Kashish Gupta', qual:'Experienced Implanter', bio:'Skilled in precise graft implantation and natural hairline work with years of hands-on expertise.' },
              { initials:'RB', role:'Follow-Ups & Leads', name:'Ronika Bhardwaj', qual:'Patient Care Coordinator', bio:'Manages post-transplant recovery logs, patient check-ups, and guides incoming clinical leads.' },
            ].map((m, i) => (
              <div key={i} className="glass-card p-6 flex flex-col align-center text-center" style={{ gap:'12px' }}>
                <div style={{ width:'80px', height:'80px', borderRadius:'50%', background:'linear-gradient(135deg, rgba(11,167,89,0.1) 0%, rgba(34,197,94,0.02) 100%)', border:'2px solid rgba(11,167,89,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.6rem', fontWeight:800, color:'var(--green-deep)', fontFamily:'var(--font-display)', boxShadow:'0 8px 24px rgba(11,167,89,0.06)', marginBottom:'6px' }}>
                  {m.initials}
                </div>
                <span className="badge badge-gradient" style={{ fontSize:'0.7rem', padding:'3px 10px' }}>{m.role}</span>
                <h4 style={{ fontSize:'1.1rem', fontWeight:800, color:'var(--text-primary)' }}>{m.name}</h4>
                <p style={{ fontSize:'0.82rem', fontWeight:600, color:'var(--text-secondary)' }}>{m.qual}</p>
                <p style={{ fontSize:'0.75rem', color:'var(--text-tertiary)', lineHeight:'1.4' }}>{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NORWOOD CALCULATOR ── */}
      <section id="calculator" className="py-24" style={{ borderTop:'1px solid var(--border-light)', borderBottom:'1px solid var(--border-light)' }}>
        <div className="container">
          <div className="text-center mb-16">
            <div className="badge badge-gradient mb-3">Surgical Planning Tool</div>
            <h2 className="text-4xl mb-4">Interactive Norwood Graft Estimator</h2>
            <p className="text-lg text-secondary-color" style={{ maxWidth:'640px', margin:'0 auto' }}>
              Select your current hair loss stage to see estimated grafts, timings, and pricing.
            </p>
          </div>
          <div className="grid grid-cols-12 gap-8 flex-col-mobile align-center">
            <div className="glass-card p-8 col-span-7 flex flex-col gap-6">
              <div className="flex justify-between align-center mb-2">
                <span className="font-semibold" style={{ fontSize:'1.1rem' }}>Norwood Scale Selection:</span>
                <span style={{ fontSize:'1.75rem', fontWeight:600, color:'var(--gemini-purple)', fontFamily:'var(--font-display)' }}>Stage {selectedNorwood}</span>
              </div>
              <div className="norwood-grid mb-6">
                {norwoodStages.map(s => (
                  <div key={s.stage} onClick={() => setSelectedNorwood(s.stage)} className={`norwood-card ${selectedNorwood === s.stage ? 'active' : ''}`}>
                    <span className="norwood-number">N{s.stage}</span>
                    <span className="norwood-label">{s.stage===1?'Normal':s.stage===3?'FUE':s.stage===6?'Full':`Stage ${s.stage}`}</span>
                  </div>
                ))}
              </div>
              <div className="mb-4" style={{ padding:'0 8px' }}>
                <input type="range" min="1" max="7" value={selectedNorwood} onChange={e => setSelectedNorwood(parseInt(e.target.value))} className="norwood-slider" />
              </div>
              <div style={{ background:'rgba(15,23,42,0.01)', borderRadius:'24px', padding:'32px 24px', border:'1.5px solid var(--border-light)', display:'flex', flexDirection:'column', gap:'24px', alignItems:'center', textAlign:'center' }}>
                <div style={{ background:'var(--surface-card)', borderRadius:'16px', border:'1.5px solid var(--border-light)', padding:'12px', height:'140px', width:'140px', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--shadow-sm)' }}>
                  <NorwoodStageVisual stage={selectedNorwood} />
                </div>
                <div>
                  <div className="badge badge-gradient mb-3" style={{ fontSize:'0.7rem' }}>Stage {selectedNorwood} Scalp Pattern</div>
                  <h4 className="font-semibold text-lg mb-2" style={{ color:'var(--text-primary)', fontFamily:'var(--font-display)' }}>{currentNorwoodInfo.name}</h4>
                  <p style={{ fontSize:'0.88rem', color:'var(--text-secondary)', lineHeight:'1.6', maxWidth:'480px', margin:'0 auto' }}>{currentNorwoodInfo.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label:'Estimated Grafts', val:currentNorwoodInfo.grafts, col:'var(--gemini-blue)' },
                  { label:'Donor Density', val:currentNorwoodInfo.density, col:'var(--gemini-purple)' },
                  { label:'Procedure Duration', val:currentNorwoodInfo.duration, col:'var(--text-primary)' },
                  { label:'Recovery Timeline', val:currentNorwoodInfo.recovery, col:'var(--text-primary)' },
                ].map(s => (
                  <div key={s.label} style={{ background:'var(--surface-card)', padding:'16px', borderRadius:'16px', border:'1px solid var(--border-light)' }}>
                    <div style={{ fontSize:'0.75rem', color:'var(--text-tertiary)', textTransform:'uppercase', fontWeight:600 }}>{s.label}</div>
                    <div style={{ fontSize:'1.2rem', fontWeight:800, color:s.col, marginTop:'4px' }}>{s.val}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-8 col-span-5 flex flex-col justify-between" style={{ minHeight:'450px' }}>
              <div>
                <h3 className="text-2xl mb-6">Procedural Billing Estimate</h3>
                <div style={{ background:'linear-gradient(135deg, rgba(66,133,244,0.04) 0%, rgba(155,81,224,0.04) 100%)', borderRadius:'20px', padding:'24px', border:'1px solid rgba(155,81,224,0.1)', marginBottom:'24px', textAlign:'center' }}>
                  <span style={{ fontSize:'0.8rem', color:'var(--text-tertiary)', textTransform:'uppercase', fontWeight:600 }}>Estimated Cost</span>
                  <div style={{ fontSize:'2.5rem', fontWeight:800, color:'var(--text-primary)', margin:'8px 0' }}>
                    {currentNorwoodInfo.stage === 1 ? '₹0' : `₹${calculateCalculatorPrice().toLocaleString('en-IN')}`}
                  </div>
                  <span className="badge badge-gradient" style={{ fontSize:'0.75rem' }}>
                    {currentNorwoodInfo.stage === 1 ? 'No Treatment Needed' : 'Estimated Base Price'}
                  </span>
                </div>
                {currentNorwoodInfo.stage > 1 && (
                  <div className="flex flex-col gap-4">
                    <h4 className="font-semibold text-secondary-color" style={{ fontSize:'0.9rem' }}>Tailor Your Care Package:</h4>
                    <div>
                      <label style={{ fontSize:'0.85rem', fontWeight:600, color:'var(--text-secondary)', marginBottom:'8px', display:'block' }}>PRP Recovery Sessions:</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[0,1,3,5].map(c => (
                          <button key={c} onClick={() => setIncludePRPSessions(c)} style={{ padding:'8px', borderRadius:'10px', border:'1px solid', borderColor: includePRPSessions===c?'var(--gemini-purple)':'var(--border-light)', background: includePRPSessions===c?'rgba(155,81,224,0.05)':'var(--surface-card)', color: includePRPSessions===c?'var(--gemini-purple)':'var(--text-secondary)', fontWeight:600, fontSize:'0.8rem', cursor:'pointer' }}>
                            {c === 0 ? 'None' : `${c}x`}
                          </button>
                        ))}
                      </div>
                      <span style={{ fontSize:'0.7rem', color:'var(--text-tertiary)', marginTop:'6px', display:'block' }}>+₹2,000/session</span>
                    </div>
                    <label style={{ display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', fontSize:'0.85rem', color:'var(--text-secondary)' }}>
                      <input type="checkbox" checked={useBioSapphire} onChange={e => setUseBioSapphire(e.target.checked)} style={{ accentColor:'var(--green-primary)', width:'16px', height:'16px' }} />
                      <span>Upgrade to BioSapphire FUE (+₹10,000)</span>
                    </label>
                    <label style={{ display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', fontSize:'0.85rem', color:'var(--text-secondary)' }}>
                      <input type="checkbox" checked={includeScreening} onChange={e => setIncludeScreening(e.target.checked)} style={{ accentColor:'var(--green-primary)', width:'16px', height:'16px' }} />
                      <span>Include Pre-Surgical Screening (₹999)</span>
                    </label>
                  </div>
                )}
              </div>
              {currentNorwoodInfo.stage > 1 ? (
                <button onClick={handleBookScroll} className="btn btn-primary w-100 mt-6" style={{ width:'100%', marginTop:'24px' }}>
                  Pre-Book This Estimation <ArrowRight size={16} style={{ marginLeft:'8px' }} />
                </button>
              ) : (
                <div style={{ fontSize:'0.85rem', color:'var(--text-tertiary)', textAlign:'center', marginTop:'24px' }}>
                  No restoration required. Reach out for preventive PRP or scalp care.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section id="gallery" className="py-24" style={{ position:'relative' }}>
        <div className="container">
          <div className="text-center mb-16">
            <div className="badge badge-gradient mb-3">📸 Real Patient Showcases</div>
            <h2 className="text-4xl mb-4">Curated Results From Instagram</h2>
            <p className="text-lg text-secondary-color" style={{ maxWidth:'640px', margin:'0 auto' }}>
              Handpicked transformations shared from our official Instagram feed. Real outcomes from FUE surgical restoration.
            </p>
          </div>
          <div style={{ display:'flex', justifyContent:'center' }}>
            <div className="glass-card flex flex-col cursor-pointer" onClick={() => window.open('https://instagram.com/hairhaventransplantclinic', '_blank')}
              style={{ width:'100%', maxWidth:'580px', background:'var(--surface-card)', border:'1.5px solid var(--border-light)', borderRadius:'32px', padding:'32px', transition:'all 0.4s ease', textAlign:'left' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'20px', marginBottom:'24px' }}>
                <div style={{ width:'76px', height:'76px', borderRadius:'50%', background:'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', padding:'3px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <div style={{ width:'100%', height:'100%', borderRadius:'50%', background:'var(--surface-card)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', border:'2px solid var(--surface-card)' }}>
                    <HairHavenLogo size={70} />
                  </div>
                </div>
                <div>
                  <h3 style={{ fontSize:'1.25rem', fontWeight:800, color:'var(--text-primary)', display:'flex', alignItems:'center', gap:'6px', fontFamily:'var(--font-display)', margin:0 }}>
                    hairhaventransplantclinic
                    <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:'15px', height:'15px', borderRadius:'50%', background:'#0095f6', color:'#fff', fontSize:'0.55rem', fontWeight:900 }}>✓</span>
                  </h3>
                  <span style={{ fontSize:'0.8rem', color:'var(--green-deep)', fontWeight:700 }}>Hair Restoration Clinic • Jammu, J&K</span>
                  <div style={{ display:'flex', gap:'16px', marginTop:'4px', fontSize:'0.82rem' }}>
                    <span><strong>146</strong> posts</span>
                    <span><strong>1,917</strong> followers</span>
                    <span><strong>84</strong> following</span>
                  </div>
                </div>
              </div>
              <div style={{ borderTop:'1px solid var(--border-light)', paddingTop:'20px', marginBottom:'24px' }}>
                <p style={{ fontSize:'0.88rem', color:'var(--text-primary)', fontWeight:600, marginBottom:'6px' }}>Hair Haven Transplant Clinic</p>
                <p style={{ fontSize:'0.85rem', color:'var(--text-secondary)', lineHeight:'1.65' }}>
                  💚 Hair Haven — Premium Hair Restoration & Laser Center<br />
                  📍 606/B, Sector 3, Channi Himmat, Jammu<br />
                  👨‍⚕️ Consultant: Dr. Suby Kakkar (MBBS, MD Dermatology)<br />
                  💉 FUE Hair Transplant | PRP Therapy | Laser Hair Removal<br />
                  🌟 Jammu's Most Trusted Hair Clinic — 4.9★ on Google
                </p>
              </div>

              {/* Auto-Swiping Photo Card */}
              <div style={{ position:'relative', width:'100%', aspectRatio:'4/3', borderRadius:'16px', overflow:'hidden', background:'var(--bg-secondary)', marginBottom:'20px' }}>
                {swiperImages.map((src, idx) => (
                  <img key={src} src={src} alt={`Patient Transformation ${idx+1}`}
                    style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'contain', padding:'8px', opacity:currentSwiperIndex===idx?1:0, transform:currentSwiperIndex===idx?'scale(1)':'scale(1.02)', transition:'opacity 0.8s ease, transform 0.8s ease' }} />
                ))}
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)', pointerEvents:'none' }} />
                <div style={{ position:'absolute', bottom:'16px', left:'16px', right:'16px', color:'#ffffff', textShadow:'0 2px 4px rgba(0,0,0,0.5)' }}>
                  <div style={{ fontSize:'0.85rem', fontWeight:800 }}>Before & After Case {currentSwiperIndex+1}</div>
                  <div style={{ fontSize:'0.72rem', opacity:0.88, marginTop:'2px' }}>FUE Transplant / PRP Restoration Result</div>
                </div>
              </div>

              <div style={{ display:'flex', justifyContent:'center', gap:'6px', marginBottom:'20px' }}>
                {swiperImages.map((_, idx) => (
                  <button key={idx} onClick={e => { e.stopPropagation(); setCurrentSwiperIndex(idx); }}
                    style={{ width:'8px', height:'8px', borderRadius:'50%', background:currentSwiperIndex===idx?'var(--green-primary)':'var(--text-tertiary)', opacity:currentSwiperIndex===idx?1:0.4, border:'none', cursor:'pointer', padding:0, transition:'all 0.3s ease' }} />
                ))}
              </div>

              <button onClick={e => { e.stopPropagation(); window.open('https://instagram.com/hairhaventransplantclinic', '_blank'); }}
                className="btn btn-primary w-100"
                style={{ background:'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)', border:'none', color:'#ffffff', boxShadow:'0 8px 24px rgba(225,48,108,0.25)', fontWeight:800 }}>
                Open Instagram Feed
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section id="reviews" className="py-24" style={{ borderTop:'1px solid var(--border-light)', borderBottom:'1px solid var(--border-light)' }}>
        <div className="container">
          <div className="grid grid-cols-12 gap-8 flex-col-mobile mb-12 align-center">
            <div className="col-span-5">
              <div className="badge badge-gradient mb-3" style={{ display:'inline-flex', alignItems:'center', gap:'6px' }}>
                <span style={{ color:'#4285F4', fontWeight:900 }}>G</span>oogle Verified Reviews
              </div>
              <h2 className="text-4xl mb-4">What Our Clients Say</h2>
              <p className="text-lg text-secondary-color" style={{ lineHeight:'1.6' }}>
                Explore 100% original, verified Google Business reviews of Hair Haven Jammu.
              </p>
            </div>
            <div className="col-span-7 flex flex-col gap-6">
              {/* Google Rating Card */}
              <div className="glass-card" style={{ padding:'28px 32px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'20px' }}>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', flexShrink:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      <svg viewBox="0 0 24 24" width="26" height="26">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span style={{ fontSize:'3rem', fontWeight:900, color:'var(--text-primary)', lineHeight:'1', fontFamily:'var(--font-display)' }}>4.9</span>
                    </div>
                    <div style={{ display:'flex', color:'#ffb627', gap:'2px' }}>
                      {[...Array(5)].map((_,i) => <Star key={i} size={13} fill="#ffb627" color="#ffb627" />)}
                    </div>
                    <div style={{ fontSize:'0.7rem', color:'var(--text-tertiary)', fontWeight:600, whiteSpace:'nowrap' }}>168 Reviews · Google</div>
                  </div>
                  <div style={{ width:'1px', alignSelf:'stretch', background:'var(--border-light)', flexShrink:0 }} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:800, fontSize:'0.95rem', color:'var(--text-primary)', marginBottom:'2px' }}>Hair Haven</div>
                    <div style={{ fontSize:'0.78rem', color:'var(--text-secondary)', marginBottom:'10px' }}>Hair transplantation clinic in Jammu, J&K · <span style={{ color:'var(--green-deep)', fontWeight:700 }}>Open</span></div>
                    <button onClick={() => window.open('https://share.google/91xZaADhSuWDBvWCC', '_blank')}
                      style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'8px 14px', borderRadius:'20px', background:'rgba(66,133,244,0.08)', border:'1px solid rgba(66,133,244,0.25)', color:'#4285F4', fontWeight:700, fontSize:'0.75rem', cursor:'pointer' }}>
                      ✏️ Write a Review
                    </button>
                  </div>
                </div>
                <div style={{ height:'1px', background:'var(--border-light)', marginBottom:'16px' }} />
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px 24px' }}>
                  {[
                    { label:'Cleanliness & Hygiene', value:'98% Positive' },
                    { label:'Graft Survival Rate', value:'99.2% Success' },
                    { label:'Staff Professionalism', value:'5 / 5 Stars' },
                    { label:'Post-Op Supervision', value:'Highly Rated' }
                  ].map(s => (
                    <div key={s.label} style={{ display:'flex', flexDirection:'column', gap:'2px' }}>
                      <span style={{ fontSize:'0.72rem', color:'var(--text-tertiary)', fontWeight:500 }}>{s.label}</span>
                      <span style={{ fontSize:'0.82rem', fontWeight:800, color:'var(--green-deep)' }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Search & Sort */}
          <div style={{ background:'var(--surface-glass)', border:'1.5px solid var(--border-light)', borderRadius:'20px', padding:'16px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'16px', marginBottom:'32px' }} className="flex-col-mobile">
            <div style={{ position:'relative', flex:1, width:'100%' }}>
              <Search size={16} color="var(--text-tertiary)" style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)' }} />
              <input type="text" placeholder="Search reviews (e.g. staff, hygiene, transplant)..." value={reviewSearchQuery}
                onChange={e => setReviewSearchQuery(e.target.value)}
                style={{ width:'100%', padding:'12px 16px 12px 42px', borderRadius:'12px', border:'1px solid var(--border-light)', background:'var(--surface-card)', color:'var(--text-primary)', fontSize:'0.875rem', fontFamily:'var(--font-ui)', outline:'none' }} />
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', flexShrink:0 }}>
              <SlidersHorizontal size={14} color="var(--text-secondary)" />
              <select value={reviewSortOrder} onChange={e => setReviewSortOrder(e.target.value)}
                style={{ padding:'10px 16px', borderRadius:'12px', border:'1px solid var(--border-light)', background:'var(--surface-card)', fontSize:'0.85rem', fontWeight:600, color:'var(--text-primary)', outline:'none', cursor:'pointer' }}>
                <option value="relevant">Most Relevant</option>
                <option value="highest">Highest Rating</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="filter-slider-container">
            <div className="filter-slider">
              {reviewTags.map(tag => (
                <button key={tag} onClick={() => setSelectedReviewTag(tag)} className={`filter-pill ${selectedReviewTag===tag?'active':''}`} style={{ flexShrink:0 }}>{tag}</button>
              ))}
            </div>
          </div>

          {/* Review Cards */}
          {filteredTestimonials.length > 0 ? (
            <div className="grid grid-cols-3 gap-8 flex-col-mobile">
              {filteredTestimonials.slice(0,9).map(review => (
                <div key={review.id} className="glass-card p-6 flex flex-col justify-between" style={{ position:'relative', minHeight:'240px', border:'1.5px solid var(--border-light)', background:'var(--surface-card)' }}>
                  <div style={{ position:'absolute', bottom:'16px', right:'16px', opacity:0.1 }}>
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                        <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'linear-gradient(135deg, var(--green-pale) 0%, rgba(11,167,89,0.05) 100%)', color:'var(--green-deep)', fontWeight:800, fontSize:'0.8rem', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(11,167,89,0.15)' }}>
                          {review.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}
                        </div>
                        <div>
                          <span style={{ fontSize:'0.85rem', fontWeight:700, color:'var(--text-primary)', display:'flex', alignItems:'center', gap:'3px' }}>
                            {review.name}
                            <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:'10px', height:'10px', borderRadius:'50%', background:'#4285f4', color:'#fff', fontSize:'0.45rem', fontWeight:900 }}>✓</span>
                          </span>
                          <span style={{ fontSize:'0.65rem', color:'var(--text-tertiary)' }}>Google Review</span>
                        </div>
                      </div>
                      <span style={{ fontSize:'0.68rem', color:'var(--text-tertiary)' }}>{review.date}</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'10px' }}>
                      <span style={{ fontSize:'0.85rem', fontWeight:800, color:'var(--text-primary)' }}>{review.rating.toFixed(1)}</span>
                      <div style={{ display:'flex', color:'#ffb627' }}>
                        {[...Array(review.rating)].map((_,i) => <Star key={i} size={11} fill="#ffb627" color="#ffb627" />)}
                      </div>
                    </div>
                    <div style={{ height:'1.2px', background:'rgba(0,0,0,0.06)', width:'100%', margin:'12px 0' }} />
                    <p style={{ fontSize:'0.875rem', color:'var(--text-secondary)', lineHeight:'1.65', textAlign:'left' }}>"{review.quote}"</p>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'4px', marginTop:'14px', borderTop:'1px solid rgba(0,0,0,0.03)', paddingTop:'10px' }}>
                    <span style={{ display:'inline-block', width:'6px', height:'6px', borderRadius:'50%', background:'var(--green-primary)' }} />
                    <span style={{ fontSize:'0.68rem', color:'var(--green-deep)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.02em' }}>{review.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding:'48px', borderRadius:'24px', border:'1.5px solid var(--border-light)', background:'var(--surface-card)', textAlign:'center', color:'var(--text-secondary)' }}>
              🔍 No reviews matched your search. Try searching for "hygiene", "FUE" or "PRP".
            </div>
          )}

          <div style={{ display:'flex', justifyContent:'center', gap:'16px', flexWrap:'wrap', marginTop:'48px' }}>
            <button onClick={() => window.open('https://share.google/91xZaADhSuWDBvWCC', '_blank')} className="btn btn-primary flex align-center gap-2" style={{ padding:'14px 28px' }}>
              <svg viewBox="0 0 24 24" width="16" height="16" style={{ display:'block' }}>
                <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Write a Google Review
            </button>
            <button onClick={() => window.open('https://maps.app.goo.gl/QFGD7kxLjtaQFP739', '_blank')} className="btn btn-secondary flex align-center gap-2" style={{ padding:'14px 28px' }}>
              <MapPin size={16} color="var(--green-primary)" /> View on Maps
            </button>
          </div>
        </div>
      </section>

      {/* ── MAP ── */}
      <section id="map" className="py-24 map-section">
        <div className="container">
          <div className="text-center mb-16">
            <div className="badge badge-gradient mb-3">📍 Visit Our Clinic</div>
            <h2 className="text-4xl mb-4">Location & Direct Navigation</h2>
            <p className="text-lg text-secondary-color" style={{ maxWidth:'640px', margin:'0 auto' }}>
              Located in the heart of Jammu at Channi Himmat. Click the map to start GPS navigation.
            </p>
          </div>
          <div className="map-wrapper">
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3356.5684347712395!2d74.8765251!3d32.7059000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391e85b54a3a83eb%3A0x5f9d84ca705aefbb!2sHair%20Haven!5e0!3m2!1sen!2sin!4v1716000000000!5m2!1sen!2sin"
              className="map-iframe" allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Hair Haven Location Map" />
            <div className="map-directions-card">
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px' }}>
                <MapPin size={18} color="var(--green-primary)" />
                <span style={{ fontSize:'0.75rem', color:'var(--text-tertiary)', textTransform:'uppercase', fontWeight:800, letterSpacing:'0.05em' }}>Clinic Landmark</span>
              </div>
              <h3 className="text-xl mb-4" style={{ fontWeight:800 }}>Hair Haven Clinic</h3>
              <p style={{ fontSize:'0.9rem', color:'var(--text-secondary)', lineHeight:'1.6', marginBottom:'20px' }}>
                606/B, Sector 3, Channi Himmat, Jammu.<br />
                <span style={{ fontStyle:'italic', fontSize:'0.85rem' }}>Opposite Kashmir Flavours Restaurant</span>
              </p>
              <div style={{ borderTop:'1px solid var(--border-light)', paddingTop:'16px', marginBottom:'24px' }}>
                <div style={{ fontSize:'0.8rem', color:'var(--text-secondary)', marginBottom:'8px' }}><strong>Hours:</strong> 10:00 AM - 06:00 PM (Daily)</div>
                <div style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}><strong>Parking:</strong> Free On-Site Parking</div>
              </div>
              <button onClick={() => window.open('https://maps.app.goo.gl/QFGD7kxLjtaQFP739', '_blank')} className="btn btn-primary w-100 flex align-center justify-center gap-2 pulse-button" style={{ background:'linear-gradient(135deg, var(--green-deep) 0%, var(--green-primary) 100%)', border:'1px solid rgba(11,167,89,0.18)', boxShadow:'0 8px 24px rgba(11,167,89,0.25)', padding:'14px 20px', fontWeight:800 }}>
                <Compass size={18} /> Start GPS Navigation
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:'var(--surface-card)', borderTop:'1px solid var(--border-light)', position:'relative', zIndex:5, paddingBottom:'100px' }} className="py-16">
        <div className="container">
          <div className="grid grid-cols-3 gap-8 flex-col-mobile mb-12">
            <div className="flex flex-col gap-4">
              <h4 className="font-semibold text-lg" style={{ color:'var(--text-primary)' }}>Clinic Location</h4>
              <div className="flex align-center gap-3">
                <MapPin size={20} color="var(--gemini-purple)" style={{ flexShrink:0 }} />
                <span style={{ fontSize:'0.9rem', color:'var(--text-secondary)', lineHeight:'1.5' }}>606/B, Sector 3, Channi Himmat,<br />Jammu - 180015, J&K</span>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="font-semibold text-lg" style={{ color:'var(--text-primary)' }}>Operational Hours</h4>
              <div className="flex align-center gap-3">
                <Clock size={20} color="var(--gemini-blue)" style={{ flexShrink:0 }} />
                <span style={{ fontSize:'0.9rem', color:'var(--text-secondary)' }}>Monday - Sunday: 10:00 AM – 06:00 PM</span>
              </div>
              <span className="badge badge-gradient" style={{ fontSize:'0.75rem', width:'fit-content' }}>Open 7 Days a Week</span>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="font-semibold text-lg" style={{ color:'var(--text-primary)' }}>Transit & Parking</h4>
              <div className="flex align-center gap-3">
                <Compass size={20} color="var(--gemini-pink)" style={{ flexShrink:0 }} />
                <span style={{ fontSize:'0.9rem', color:'var(--text-secondary)', lineHeight:'1.5' }}>Easily accessible via public transport, e-rickshaws, and private cabs.</span>
              </div>
            </div>
          </div>
          <div style={{ borderTop:'1px solid var(--border-light)', paddingTop:'32px', display:'flex', justifyContent:'space-between', alignItems:'center' }} className="flex-col-mobile gap-4 text-center">
            <div>
              <span style={{ fontWeight:800, fontSize:'1rem', color:'var(--text-primary)' }}>Hair Haven</span>
              <span style={{ fontSize:'0.85rem', color:'var(--text-tertiary)' }}> © {new Date().getFullYear()} Transplant Clinic. All rights reserved.</span>
            </div>
            <div style={{ display:'flex', gap:'16px', fontSize:'0.85rem' }}>
              <a href="#services" style={{ color:'var(--text-tertiary)', textDecoration:'none' }} className="nav-link">Privacy Policy</a>
              <a href="#map" style={{ color:'var(--text-tertiary)', textDecoration:'none' }} className="nav-link">Find Us</a>
            </div>
          </div>
        </div>
      </footer>
        </>
      ) : (
        <ConsultationPage
          onBack={() => {
            setCurrentPage('home');
            setActiveTab('home');
          }}
          selectedNorwood={selectedNorwood}
          includePRPSessions={includePRPSessions}
          includeScreening={includeScreening}
          initialService={selectedService}
        />
      )}

      {/* ── BOTTOM NAVIGATION (Instagram Style) ── */}
      <nav className="bottom-nav">
        {navTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;
          const isBook = tab.id === 'consultation';
          return (
            <button
              key={tab.id}
              className={`bottom-nav-item ${isActive ? 'active' : ''} ${isBook ? 'book' : ''}`}
              onClick={() => {
                setActiveTab(tab.id);
                if (isBook) {
                  setCurrentPage('consultation');
                } else {
                  setCurrentPage('home');
                  setTimeout(() => scrollToSection(tab.id), 50);
                }
              }}
            >
              {isBook ? (
                <div className="bottom-nav-book-icon">
                  <Icon size={22} />
                </div>
              ) : (
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              )}
              <span>{tab.label}</span>
              {isActive && !isBook && <div className="bottom-nav-dot" />}
            </button>
          );
        })}
      </nav>

      {/* Scroll Progress Bar */}
      <div style={{ position:'fixed', top:0, left:0, height:'3px', width:`${scrollProgress}%`, background:'linear-gradient(90deg, var(--green-deep) 0%, var(--green-primary) 60%, #22d3ee 100%)', zIndex:10000, transition:'width 0.1s linear', borderRadius:'0 2px 2px 0', boxShadow:'0 0 8px rgba(11,167,89,0.5)' }} />

      {/* WhatsApp FAB */}
      <div style={{ position:'fixed', bottom:'100px', right:'20px', zIndex:900, display:'flex', flexDirection:'column', alignItems:'center', gap:'10px' }}>
        {scrollY > 400 && (
          <button onClick={() => window.scrollTo({ top:0, behavior:'smooth' })} title="Back to top"
            style={{ width:'44px', height:'44px', borderRadius:'50%', background:'var(--surface-card)', border:'1.5px solid var(--border-light)', boxShadow:'0 4px 16px rgba(0,0,0,0.10)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-secondary)' }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6"/></svg>
          </button>
        )}
        <AIChatbot onBookNow={() => { setCurrentPage('consultation'); setActiveTab('consultation'); }} />
        <a href="https://wa.me/918899708659?text=Hello%20Hair%20Haven%2C%20I%20would%20like%20to%20book%20a%20consultation." target="_blank" rel="noopener noreferrer" title="Chat on WhatsApp"
          style={{ width:'56px', height:'56px', borderRadius:'50%', background:'#25D366', boxShadow:'0 4px 20px rgba(37,211,102,0.45)', display:'flex', alignItems:'center', justifyContent:'center', textDecoration:'none', animation:'pulse-wa 2.5s infinite' }}>
          <svg viewBox="0 0 24 24" width="28" height="28" fill="#ffffff">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
      </div>
    </>
  );
}

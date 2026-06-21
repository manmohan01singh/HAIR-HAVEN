import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Phone, MapPin, Search, Calendar, ChevronRight, CheckCircle, Clock, Star, MessageCircle, ArrowRight, Play, Pause, ChevronLeft, Volume2, VolumeX, Menu, X, ArrowUpRight, Copy, LogOut, Heart, Award, Compass, MessageSquare, SlidersHorizontal, Sun, Moon, Home, Stethoscope, Image as ImageIcon, Download, User, Mail, FileText, Settings, Plus, CheckCircle2, Sparkles, ArrowLeft, Shield } from 'lucide-react';
// @ts-ignore
import confetti from 'canvas-confetti';
import { 
  signInWithGoogle, signOutUser, onAuthChange, saveUserToFirestore, 
  getUserDoc, saveMedicalProfileToFirestore, isAdminUser,
  subscribeToGallery, subscribeToClinicSettings, saveBookingToFirestore,
  subscribeToReviews, updateClinicSettings, uploadGalleryImage, handleRedirectSignIn
} from './firebase';
import AdminPanel from './AdminPanel';
import type { User as FirebaseUser } from 'firebase/auth';

/* ─── LOGO COMPONENT ─────────────────────────────────── */
function HairHavenLogo({ className = "", size = 40, logoUrl = '/logo.png', isAdminEditMode = false }: { className?: string; size?: number; logoUrl?: string; isAdminEditMode?: boolean }) {
  const content = <img src={logoUrl} alt="Hair Haven Logo" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />;

  if (isAdminEditMode && size > 50) {
    return (
      <div className={className} style={{ width:`${size}px`, height:`${size}px`, borderRadius:'50%', overflow:'hidden', border:'2px solid var(--green-primary)', display:'inline-flex', alignItems:'center', justifyContent:'center', background:'var(--surface-card)', flexShrink:0 }}>
        <InlineImageEdit value={logoUrl} field="logoUrl" isActive={isAdminEditMode}>
          {content}
        </InlineImageEdit>
      </div>
    );
  }

  return (
    <div className={className} style={{ width:`${size}px`, height:`${size}px`, borderRadius:'50%', overflow:'hidden', border:'2px solid var(--green-primary)', display:'inline-flex', alignItems:'center', justifyContent:'center', background:'var(--surface-card)', flexShrink:0 }}>
      {content}
    </div>
  );
}

/* ─── ADMIN INLINE EDITOR ────────────────────────────── */
function InlineEdit({
  value, field, isActive, multiline = false, number = false,
  className = '', style = {}, children, onChange
}: {
  value: string | number; field: string; isActive: boolean;
  multiline?: boolean; number?: boolean;
  className?: string; style?: React.CSSProperties; children?: React.ReactNode;
  onChange?: (value: string) => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(String(value));
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => { setDraft(String(value)); }, [value]);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDraft(String(value));
    setEditing(true);
  };

  const handleSave = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.stopPropagation();
    setSaving(true);
    try {
      await updateClinicSettings({ [field]: number ? Number(draft) : draft });
      onChange?.(String(draft));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) { console.error(err); }
    setSaving(false);
    setEditing(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(false);
    setDraft(String(value));
  };

  if (!isActive) return <>{children ?? value}</>;

  return (
    <span
      className={className}
      style={{
        position: 'relative',
        display: 'inline',
        outline: editing ? '2px solid rgba(128,90,213,0.7)' : '1.5px dashed rgba(128,90,213,0.4)',
        outlineOffset: '3px',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'outline 0.2s',
        ...style
      }}
      title="✎ Click to edit"
    >
      {editing && (
        <span style={{
          position: 'absolute', top: '-68px', left: 0, zIndex: 999999,
          display: 'flex', gap: '6px', alignItems: 'center',
          background: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(20px)',
          border: '1.5px solid rgba(128,90,213,0.35)',
          borderRadius: '14px', padding: '8px 10px',
          boxShadow: '0 8px 32px rgba(128,90,213,0.22)',
          minWidth: '220px', whiteSpace: 'nowrap'
        }}>
          {multiline ? (
            <textarea
              autoFocus
              value={draft}
              onChange={e => setDraft(e.target.value)}
              style={{
                fontSize: '0.8rem', padding: '6px 8px',
                border: '1px solid rgba(128,90,213,0.3)', borderRadius: '8px',
                outline: 'none', resize: 'vertical', minHeight: '70px', width: '200px',
                fontFamily: 'var(--font-body)', color: '#1a1a2e', background: '#fff'
              }}
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <input
              autoFocus
              type={number ? 'number' : 'text'}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSave(e as any);
                if (e.key === 'Escape') handleCancel(e as any);
              }}
              style={{
                fontSize: '0.82rem', padding: '6px 10px',
                border: '1px solid rgba(128,90,213,0.3)', borderRadius: '8px',
                outline: 'none', minWidth: '160px',
                fontFamily: 'var(--font-body)', color: '#1a1a2e', background: '#fff'
              }}
              onClick={e => e.stopPropagation()}
            />
          )}
          <button onClick={handleSave} disabled={saving} style={{
            padding: '7px 14px',
            background: saving ? '#ccc' : 'linear-gradient(135deg, #7c3aed, #a855f7)',
            color: '#fff', border: 'none', borderRadius: '8px',
            cursor: 'pointer', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0
          }}>
            {saving ? '…' : saved ? '✓ Saved!' : 'Save'}
          </button>
          <button onClick={handleCancel} style={{
            padding: '7px 10px',
            background: 'rgba(239,68,68,0.1)', color: '#ef4444',
            border: 'none', borderRadius: '8px',
            cursor: 'pointer', fontWeight: 800, fontSize: '0.82rem', flexShrink: 0
          }}>✕</button>
        </span>
      )}
      <span onClick={handleOpen} style={{ display: 'inline', position: 'relative' }}>
        {children ?? value}
        {!editing && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '16px', height: '16px',
            background: 'rgba(128,90,213,0.18)',
            borderRadius: '4px',
            fontSize: '10px', color: '#7c3aed',
            marginLeft: '4px', verticalAlign: 'middle', flexShrink: 0
          }}>✎</span>
        )}
      </span>
    </span>
  );
}

/* ─── ADMIN INLINE IMAGE EDITOR ──────────────────────── */
function InlineImageEdit({
  value, field, isActive,
  style = {}, children
}: {
  value: string; field: string; isActive: boolean;
  style?: React.CSSProperties; children: React.ReactElement;
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (!isActive) return;
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadGalleryImage(file);
      await updateClinicSettings({ [field]: url });
    } catch (err) {
      console.error(err);
      alert("Failed to upload image. Please try again.");
    }
    setUploading(false);
  };

  if (!isActive) return children;

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'relative',
        display: 'inline-block',
        cursor: 'pointer',
        outline: '2.5px dashed rgba(128,90,213,0.7)',
        outlineOffset: '2px',
        borderRadius: '12px',
        transition: 'all 0.2s',
        ...style
      }}
      title="📷 Click to change image"
    >
      {children}
      <div style={{
        position: 'absolute',
        bottom: '8px',
        right: '8px',
        background: 'rgba(30,10,60,0.85)',
        backdropFilter: 'blur(4px)',
        border: '1px solid rgba(168,85,247,0.5)',
        color: '#fff',
        borderRadius: '50%',
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        fontSize: '14px',
        zIndex: 10
      }}>
        {uploading ? '⏳' : '📷'}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
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
  showToast,
  logoUrl
}: {
  onBack: () => void;
  selectedNorwood: number;
  includePRPSessions: number;
  includeScreening: boolean;
  initialService?: string;
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  logoUrl?: string;
}) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName:'', phone:'', email:'', service: initialService || 'FUE Hair Transplant',
    date:'', time:'', notes:'', hadPriorConsultation:'no', bloodSugarCheck:'no'
  });
  const [ticket, setTicket] = useState<any>(null);

  // JS #26: LocalStorage-based draft recovery for booking form
  useEffect(() => {
    const savedDraft = localStorage.getItem('hh_booking_draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setForm(prev => ({ ...prev, ...parsed }));
        showToast("Restored your previous consultation draft details!", "info");
      } catch (e) {
        console.error("Draft load error", e);
      }
    }
  }, []);

  // Save draft on changes
  useEffect(() => {
    localStorage.setItem('hh_booking_draft', JSON.stringify(form));
  }, [form]);

  const calcPrice = () => {
    let base = 0;
    if (form.service === 'FUE Hair Transplant') base = norwoodStages[selectedNorwood - 1].basePrice || 21000;
    else if (form.service === 'BioSapphire FUE Technique') base = 31000;
    else if (form.service && form.service.includes('PRP')) base = 2000;
    else if (form.service && form.service.includes('GFC')) base = 4500;
    else if (form.service && (form.service.includes('Beard') || form.service.includes('Eyebrow'))) base = 25000;
    let extra = 0;
    if (form.service && ['FUE Hair Transplant','BioSapphire FUE Technique'].includes(form.service)) {
      extra += includePRPSessions * 2000;
      if (includeScreening) extra += 999;
    }
    return base + extra;
  };

  const handleSubmit = () => {
    const ticketId = 'HH-' + Math.floor(100000 + Math.random() * 900000);
    const t = { id: ticketId, ...form, priceEstimate: calcPrice() };

    // Write booking details directly to Firestore (real-time queue)
    saveBookingToFirestore({
      fullName: form.fullName,
      phone: form.phone,
      email: form.email,
      service: form.service,
      date: form.date,
      time: form.time,
      notes: form.notes,
      hadPriorConsultation: form.hadPriorConsultation,
      bloodSugarCheck: form.bloodSugarCheck,
      priceEstimate: `₹${t.priceEstimate.toLocaleString('en-IN')}`,
      graftsEstimate: norwoodStages[selectedNorwood - 1].grafts,
      status: 'Pending'
    }).then(() => {
      setTicket(t);
      setStep(4);
      localStorage.removeItem('hh_booking_draft'); // Clear draft
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });

      // WhatsApp alert
      setTimeout(() => {
        const msg = `🌿 *HAIR HAVEN — NEW APPOINTMENT*\n━━━━━━━━━━━━━━━━━━━\n👤 *Patient:* ${t.fullName}\n📞 *Phone:* ${t.phone}\n💉 *Treatment:* ${t.service}\n📅 *Date:* ${t.date} at ${t.time}\n💳 *Estimate:* ₹${t.priceEstimate.toLocaleString('en-IN')}\n━━━━━━━━━━━━━━━━━━━\n✨ Please confirm within 2 hours.`;
        window.open(`https://wa.me/918899708659?text=${encodeURIComponent(msg)}`, '_blank');
      }, 1000);
    }).catch(err => {
      console.error(err);
      showToast("Submission failed. Check your connection & try again.", "warning");
    });
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
          <HairHavenLogo size={36} logoUrl={logoUrl} />
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
                    showToast('Please fill your name and phone number.', 'warning');
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
                <HairHavenLogo size={40} logoUrl={logoUrl} />
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

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
}

const SYSTEM_PROMPT = `You are "Aman", the ultra-advanced, empathetic, and expert Personal AI Hair Restoration Consultant for Hair Haven, the premier hair transplant clinic in Jammu.

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

// Import the premium Aman chatbot CSS
import './aman-chatbot.css';

function AIChatbot({ 
  onBookNow, 
  currentUser, 
  userMedicalProfile, 
  onProfileUpdate,
  chatOpen,
  setChatOpen,
  showToast,
  clinicSettings,
  logoUrl,
  isAdminEditMode
}: { 
  onBookNow: () => void; 
  currentUser?: FirebaseUser | null; 
  userMedicalProfile?: any; 
  onProfileUpdate?: (updated: any) => void;
  chatOpen: boolean;
  setChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  clinicSettings: any;
  logoUrl?: string;
  isAdminEditMode: boolean;
}) {


  const userName = useMemo(() => {
    if (currentUser) {
      if (currentUser.displayName) return currentUser.displayName;
      if (currentUser.email) {
        const namePart = currentUser.email.split('@')[0];
        return namePart
          .split(/[\._-]/)
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ');
      }
    }
    return 'Guest';
  }, [currentUser]);
  const [chatState, setChatState] = useState<'idle' | 'thinking' | 'replying'>('idle');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('hh_chat_messages');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return [];
  });
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Dynamic greeting sync once profile / user details are loaded (if new session)
  useEffect(() => {
    if (messages.length <= 1) {
      const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      let greeting = `👋 Hello! I'm **Aman**, your personal AI Hair Restoration expert at Hair Haven. 🌿\n\nI can help you estimate your required hair grafts, check treatment pricing, learn about our specialist team, or walk you through the FUE recovery process.\n\nHow can I assist you today?`;
      
      if (currentUser && userMedicalProfile) {
        if (userMedicalProfile.fullName || userMedicalProfile.age) {
          greeting = `👋 Welcome back, **${userMedicalProfile.fullName || userName}**! I'm **Aman**, your personal AI Hair Restoration assistant. 🌿\n\nI remember you are a **${userMedicalProfile.age || '28'}**-year-old patient. I have your Norwood **Stage ${userMedicalProfile.stage || 3}** file securely recorded.\n\nHow can I help you with your hair restoration journey today?`;
        } else {
          greeting = `👋 Hello **${userName}**! I'm **Aman**, your personal AI Hair Restoration assistant. 🌿\n\nI know your name is **${userName}** from your Google account. To help me customize your clinical hair file and graft estimates, could you please tell me your **full name, age, and gender**? Also, feel free to tell me if you have any hair loss concerns or prior treatments tried!`;
        }
      }
      
      setMessages([{
        role: 'assistant',
        content: greeting,
        timestamp: ts
      }]);
    }
  }, [currentUser, userMedicalProfile]);

  // Voice & attachment states
  const [speakingText, setSpeakingText] = useState<string | null>(null);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Chat sessions (history)
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try { return JSON.parse(localStorage.getItem('hh_chat_sessions') || '[]'); } catch { return []; }
  });
  const [currentSessionId, setCurrentSessionId] = useState<string>(() =>
    localStorage.getItem('hh_current_session_id') || ('session_' + Date.now())
  );
  const [showSidebar, setShowSidebar] = useState(false);

  // Stop speech on close
  useEffect(() => {
    return () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); };
  }, [chatOpen]);

  // Persist sessions whenever messages change
  useEffect(() => {
    const hasUserMsg = messages.some(m => m.role === 'user');
    if (!hasUserMsg) return;
    const firstUserMsg = messages.find(m => m.role === 'user');
    const title = firstUserMsg
      ? firstUserMsg.content.replace(/^📎.*?\]\s*/,'').slice(0, 42) + (firstUserMsg.content.length > 42 ? '…' : '')
      : 'New Chat';
    setSessions(prev => {
      const idx = prev.findIndex(s => s.id === currentSessionId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], messages, title };
        return updated;
      }
      return [{ id: currentSessionId, title, messages, createdAt: Date.now() }, ...prev];
    });
    localStorage.setItem('hh_chat_messages', JSON.stringify(messages));
  }, [messages, currentSessionId]);

  useEffect(() => {
    localStorage.setItem('hh_chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  const startNewChat = () => {
    // Explicitly save the previous session if it contains user messages
    const hasUserMsg = messages.some(m => m.role === 'user');
    if (hasUserMsg) {
      const firstUserMsg = messages.find(m => m.role === 'user');
      const title = firstUserMsg
        ? firstUserMsg.content.replace(/^📎.*?\]\s*/,'').slice(0, 42) + (firstUserMsg.content.length > 42 ? '…' : '')
        : 'New Chat';
      setSessions(prev => {
        const idx = prev.findIndex(s => s.id === currentSessionId);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], messages, title };
          return updated;
        }
        return [{ id: currentSessionId, title, messages, createdAt: Date.now() }, ...prev];
      });
    }

    const newId = 'session_' + Date.now();
    let greeting = `✨ New conversation! I'm **Aman**, ready to help. 🌿\n\nWhat would you like to know about Hair Haven?`;
    if (currentUser && userMedicalProfile) {
      if (userMedicalProfile.fullName || userMedicalProfile.age) {
        greeting = `✨ New conversation! Welcome back, **${userMedicalProfile.fullName || userName}**! I'm **Aman**, ready to help. 🌿\n\nI remember you are a **${userMedicalProfile.age || '28'}**-year-old patient. I have your Norwood **Stage ${userMedicalProfile.stage || 3}** file securely recorded. How can I help you with your hair restoration today?`;
      } else {
        greeting = `✨ New conversation! Hello **${userName}**! I'm **Aman**, ready to help. 🌿\n\nI know your name is **${userName}** from your Google account. To personalize your clinical hair file, could you please tell me your **full name, age, and gender**? Or ask me anything about grafts and costs!`;
      }
    }

    setMessages([{
      role: 'assistant',
      content: greeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setCurrentSessionId(newId);
    localStorage.setItem('hh_current_session_id', newId);
    setChatState('idle');
    setShowSidebar(false);
    setInputText('');
  };

  const loadSession = (session: ChatSession) => {
    setMessages(session.messages);
    setCurrentSessionId(session.id);
    localStorage.setItem('hh_current_session_id', session.id);
    setShowSidebar(false);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) startNewChat();
  };

  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) { showToast("Text-to-speech not supported in this browser.", "warning"); return; }
    if (speakingText === text) {
      window.speechSynthesis.cancel();
      setSpeakingText(null);
    } else {
      window.speechSynthesis.cancel();
      const clean = text.replace(/[\*\_#]/g, '').replace(/[👋🌿✨📅💉🧮💎⚠️]/gu, '');
      const utt = new SpeechSynthesisUtterance(clean);
      utt.lang = 'en-IN';
      utt.onend = () => setSpeakingText(null);
      utt.onerror = () => setSpeakingText(null);
      window.speechSynthesis.speak(utt);
      setSpeakingText(text);
    }
  };

  const startVoiceSearch = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { showToast("Voice input requires Google Chrome or Safari.", "warning"); return; }
    const rec = new SR();
    rec.continuous = false;
    rec.lang = 'en-IN';
    rec.interimResults = false;
    rec.onstart = () => setIsListeningVoice(true);
    rec.onresult = (e: any) => { setInputText(e.results[0][0].transcript); setIsListeningVoice(false); };
    rec.onerror = () => setIsListeningVoice(false);
    rec.onend = () => setIsListeningVoice(false);
    rec.start();
  };

  const handlePlusClick = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setAttachedFile(f); e.target.value = ''; }
  };

  useEffect(() => {
    document.body.classList.toggle('aman-chat-open', chatOpen);
    return () => document.body.classList.remove('aman-chat-open');
  }, [chatOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const simulateTyping = (fullText: string, onComplete: () => void) => {
    // 1. Check for PROFILE_UPDATE comment block
    const match = fullText.match(/<!-- PROFILE_UPDATE:\s*({.*?})\s*-->/);
    let displayText = fullText;
    let profileUpdateData: any = null;

    if (match) {
      try {
        profileUpdateData = JSON.parse(match[1]);
        // Strip the block from the text to display so it remains hidden
        displayText = fullText.replace(/<!-- PROFILE_UPDATE:\s*({.*?})\s*-->/g, '').trim();
      } catch (e) {
        console.error("Error parsing profile update comment:", e);
      }
    }

    setChatState('replying');
    setIsTyping(true);
    const words = displayText.split(' ');
    let text = '';
    let idx = 0;
    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { role: 'assistant' as const, content: '', timestamp: ts }]);
    const iv = setInterval(() => {
      if (idx < words.length) {
        text += (idx === 0 ? '' : ' ') + words[idx];
        setMessages(prev => {
          const list = [...prev];
          list[list.length - 1] = { ...list[list.length - 1], content: text };
          return list;
        });
        idx++;
      } else {
        clearInterval(iv);
        setIsTyping(false);
        setChatState('idle');

        // 2. Perform profile update if user is logged in
        if (profileUpdateData && currentUser && userMedicalProfile) {
          const updatedProfile = {
            ...userMedicalProfile,
            fullName: profileUpdateData.fullName || userMedicalProfile.fullName || '',
            age: profileUpdateData.age || userMedicalProfile.age || '',
            gender: profileUpdateData.gender || userMedicalProfile.gender || '',
            primaryConcerns: profileUpdateData.primaryConcerns || userMedicalProfile.primaryConcerns || '',
            priorTreatments: profileUpdateData.priorTreatments || userMedicalProfile.priorTreatments || '',
            medicalConditions: profileUpdateData.medicalConditions || userMedicalProfile.medicalConditions || '',
          };

          if (profileUpdateData.stage) {
            const detectedStage = parseInt(profileUpdateData.stage);
            if (!isNaN(detectedStage)) {
              updatedProfile.stage = detectedStage;
            }
          }

          if (profileUpdateData.primaryConcerns || profileUpdateData.stage || profileUpdateData.age) {
            updatedProfile.aiAssessment = `Aman AI Assessment: Patient is a ${updatedProfile.age || '28'}-year-old ${updatedProfile.gender || 'male'}. Norwood Stage ${updatedProfile.stage || 3} pattern hair loss. Discussed concern: ${updatedProfile.primaryConcerns}. Previous treatments tried: ${updatedProfile.priorTreatments}. Highly suitable candidate for FUE Restore or BioSapphire FUE technique.`;
          }

          saveMedicalProfileToFirestore(currentUser.uid, updatedProfile).then(() => {
            if (onProfileUpdate) {
              onProfileUpdate(updatedProfile);
            }
            console.log("Firestore: Chat memory sync update successful!");
          });
        }

        onComplete();
      }
    }, 38);
  };

  const handleSend = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed && !attachedFile) return;

    if (trimmed === 'BOOK_NOW_TRIGGER') {
      onBookNow();
      setChatOpen(false);
      return;
    }

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let displayContent = trimmed;
    if (attachedFile) {
      displayContent = `📎 [Attached: ${attachedFile.name}] ${trimmed}`.trim();
    }

    const newMessages = [
      ...messages,
      { role: 'user' as const, content: displayContent, timestamp: userTime }
    ];
    setMessages(newMessages);
    setInputText('');
    
    // Grab copy of attached file and clear state immediately
    const currentAttachment = attachedFile;
    setAttachedFile(null);
    
    setIsTyping(true);
    setChatState('thinking'); // Teal gradient at top-left active while network request is pending

    try {
      let attachmentInstructions = "";
      if (currentAttachment) {
        attachmentInstructions = `\n\n### PATIENT ATTACHMENT DETAILS:\n- Attached File: ${currentAttachment.name}\n- Type: ${currentAttachment.type || 'Scalp Image'}\n\nSPECIAL DIRECTIVE:\n- The patient has attached/uploaded their scalp photo or clinical document ("${currentAttachment.name}").\n- Simulate an advanced dermoscopic/microscopic hair restoration analysis of their attached scalp photo.\n- Describe their donor zone as robust and mention graft yield density (e.g. high density of 2-hair and 3-hair follicular units).\n- Offer highly personalized and custom clinical FUE solutions based on this simulated scalp analysis.`;
      }

      const dynamicPrompt = currentUser && userMedicalProfile
        ? `${SYSTEM_PROMPT}

### CURRENT LOGGED-IN CLINIC PATIENT FILE:
- Account Email: ${currentUser.email || ''}
- Clinic Registration Date: ${userMedicalProfile.firstConsultationDate || 'First time logged in today'}
- Patient Full Name: ${userMedicalProfile.fullName || userName}
- Age: ${userMedicalProfile.age || 'Not set'}
- Gender: ${userMedicalProfile.gender || 'Not set'}
- Norwood Hair Loss Stage: Stage ${userMedicalProfile.stage || 3}
- Primary Hair Concerns: ${userMedicalProfile.primaryConcerns || 'Temple recession & hairline balding'}
- Prior Treatments Tried: ${userMedicalProfile.priorTreatments || 'None'}
- Clinical Conditions / Notes: ${userMedicalProfile.medicalConditions || 'None'}
- Custom Medical Consultation Notes: ${userMedicalProfile.consultationNotes || 'No specific notes.'}
- Specialist AI Clinical Assessment Summary: ${userMedicalProfile.aiAssessment || 'No custom assessment yet.'}${attachmentInstructions}

### DYNAMIC CONTEXTUAL INSTRUCTIONS:
1. Address the patient warmly by their full name (${userMedicalProfile.fullName || userName}) and show deep, personalized clinical interest.
2. Directly reference their Norwood Stage ${userMedicalProfile.stage || 3} and primary concerns (${userMedicalProfile.primaryConcerns || 'their hair loss'}) when offering advice or pricing details.
3. If their Age or Gender is known, use that for professional clinical context (e.g. as a ${userMedicalProfile.age || '28'}-year-old ${userMedicalProfile.gender || 'male'}).
4. Offer custom clinical FUE solutions based on their Norwood pattern stage. For example: Norwood Stage ${userMedicalProfile.stage || 3} needs 1,200 - 1,800 grafts, FUE starting at ₹21,000, and Sapphire FUE starting at ₹31,000.
5. Emphasize that their file is securely recorded in our Firestore medical records.

### CRITICAL PROFILE MEMORY DIRECTIVE:
- When the patient shares or updates their personal info (such as their full name, age, gender, hair concerns, prior treatments, or clinical conditions), you MUST append a hidden comment block at the very end of your response:
<!-- PROFILE_UPDATE: { "fullName": "...", "age": "...", "gender": "...", "primaryConcerns": "...", "priorTreatments": "...", "medicalConditions": "..." } -->
- Fill in only the details they shared or updated in the current turn. Keep the JSON strictly formatted and inside the HTML comment block. This is parsed by the client to update their Firestore file.`
        : `${SYSTEM_PROMPT}

- Context: Patient is currently browsing as a guest. Direct them to sign in or calculate their Norwood hair loss stage using our visual calculator on the home dashboard.`;

      const apiMessages = [
        { role: 'system' as const, content: dynamicPrompt },
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

      // Stream the response with word-by-word typewriter effect
      simulateTyping(assistantReply, () => {
        // Complete callback
      });

    } catch (error: any) {
      console.error("Chat error:", error);
      const assistantTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setIsTyping(false);
      setChatState('idle');
      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant' as const, 
          content: `⚠️ Sorry, I encountered an issue connecting to my hair transplant knowledge system. Please check your internet connection or try again. \n\n*Error: ${error.message || 'Unknown network error'}*`, 
          timestamp: assistantTime 
        }
      ]);
    }
  };

  const handleClear = () => {
    if (window.confirm("Clear all your conversation history with Aman?")) {
      const resetMessages: ChatMessage[] = [
        {
          role: 'assistant',
          content: `✨ Conversation cleared! I'm **Aman**, ready to help you again. 🌿\n\nWhat would you like to know about Hair Haven?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      setMessages(resetMessages);
      setSessions([]);
      setChatState('idle');
      localStorage.removeItem('hh_chat_messages');
      localStorage.removeItem('hh_chat_sessions');
      const newId = 'session_' + Date.now();
      setCurrentSessionId(newId);
      localStorage.setItem('hh_current_session_id', newId);
      setShowSidebar(false);
    }
  };

  const suggestions = [
    { label: '📅 Book Online Pass', text: 'BOOK_NOW_TRIGGER' },
    { label: '🧮 Estimate Grafts & Cost', text: 'How many grafts do I need and what is the cost of hair transplant?' },
    { label: '💎 FUE vs Sapphire FUE', text: 'What is the difference between standard FUE and BioSapphire FUE technique?' },
    { label: '💉 GFC vs PRP Cost', text: 'What are the pricing details for GFC and PRP therapy sessions?' },
    { label: '👨‍⚕️ Meet Dr. Suby Kakkar', text: 'Tell me about Clinical Director Dr. Suby Kakkar and the supportive staff.' }
  ];

  const showWelcomeScreen = messages.length <= 1;

  return (
    <>

      {chatOpen && (
        <div className="chatbot-window-container">
          <div className={`chatbot-window gemini-theme state-${chatState}`}>

            {/* Alive gradient layer */}
            <div className="gemini-alive-gradient-layer" />

            {/* ── HEADER: back button on left, history button on right ── */}
            <div className="chatbot-header" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="chatbot-header-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px' }}>
                
                {/* Left: Back button */}
                <button 
                  onClick={() => setChatOpen(false)}
                  style={{ 
                    background: 'rgba(0, 0, 0, 0.05)', 
                    border: 'none', 
                    color: 'var(--text-primary)', 
                    width: '38px', 
                    height: '38px', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}
                  title="Back to clinic"
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                </button>

                {/* Right: History/Hamburger button */}
                <button 
                  onClick={() => setShowSidebar(true)}
                  style={{ 
                    background: 'rgba(0, 0, 0, 0.05)', 
                    border: 'none', 
                    color: 'var(--text-primary)', 
                    width: '38px', 
                    height: '38px', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}
                  title="Conversation history"
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                </button>

              </div>
            </div>

            {/* ── GEMINI SIDEBAR (slide-in from left) ── */}
            {showSidebar && (
              <div className="aman-sidebar-overlay" onClick={() => setShowSidebar(false)}>
                <div className="aman-sidebar" onClick={e => e.stopPropagation()}>
                  {/* Sidebar header */}
                  <div className="aman-sidebar-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
                        <path d="M12 2C12 7.5 7.5 12 2 12C7.5 12 12 16.5 12 22C12 16.5 16.5 12 22 12C16.5 12 12 7.5 12 2Z" fill="url(#sb-grad)" />
                        <defs><linearGradient id="sb-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#4285f4" /><stop offset="100%" stopColor="#34d399" /></linearGradient></defs>
                      </svg>
                      <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.3rem', fontWeight: 700, color: '#1f1f1f' }}>Aman</span>
                    </div>
                    <button className="chatbot-header-icon-btn" onClick={() => setShowSidebar(false)} title="Close sidebar">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>

                  {/* New notebook / start fresh */}
                  <button className="aman-sidebar-new-btn" onClick={startNewChat}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                    New Conversation
                  </button>

                  {/* Recent sessions label */}
                  {sessions.length > 0 && (
                    <div className="aman-sidebar-section-label">Recent</div>
                  )}

                  {/* Sessions list */}
                  <div className="aman-sidebar-sessions">
                    {sessions.length === 0 ? (
                      <div style={{ padding: '16px', color: '#9aa0a6', fontSize: '0.85rem', textAlign: 'center' }}>No previous conversations yet</div>
                    ) : (
                      sessions.map(session => (
                        <div
                          key={session.id}
                          className={`aman-sidebar-item ${session.id === currentSessionId ? 'active' : ''}`}
                          onClick={() => loadSession(session)}
                        >
                          <span className="aman-sidebar-item-title">{session.title}</span>
                          <button
                            className="aman-sidebar-item-delete"
                            onClick={(e) => deleteSession(session.id, e)}
                            title="Delete"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {sessions.length > 0 && (
                    <button 
                      onClick={handleClear} 
                      style={{
                        margin: '12px 16px',
                        padding: '8px 12px',
                        background: 'transparent',
                        border: '1px solid rgba(220, 38, 38, 0.25)',
                        borderRadius: '16px',
                        color: '#dc2626',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.2s',
                        zIndex: 10
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(220, 38, 38, 0.05)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                      Clear All History
                    </button>
                  )}

                  {/* User profile at bottom */}
                  <div className="aman-sidebar-footer">
                    {currentUser?.photoURL ? (
                      <img src={currentUser.photoURL} alt={userName} referrerPolicy="no-referrer" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(11,167,89,0.35)' }} />
                    ) : (
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(11,167,89,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={18} color="var(--green-primary)" />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1f1f1f', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</div>
                      {currentUser && <div style={{ fontSize: '0.72rem', color: '#9aa0a6' }}>{currentUser.email}</div>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── CHAT BODY ── */}
            <div className="chatbot-body" style={{ position: 'relative' }}>

              {/* Siri/Gemini-like Premium Bouncing Typing Indicator overlay */}
              <div className={`aman-orb-overlay${isTyping ? ' visible' : ''}`}>
                <div className="aman-thinking-bubble">
                  <div className="aman-thinking-dot dot-1" />
                  <div className="aman-thinking-dot dot-2" />
                  <div className="aman-thinking-dot dot-3" />
                  <span className="aman-thinking-text">Aman is thinking…</span>
                </div>
              </div>

              {showWelcomeScreen ? (
                <div className="gemini-welcome-container">
                  {/* Doctor avatar flies in from bottom-right when chat opens */}
                  <div className="gemini-logo-wrapper doctor-chatbot-avatar-wrapper">
                    <div className="doctor-chatbot-avatar-ring" />
                    <img
                      src='/doctor-avatar.png'
                      alt='Aman AI Doctor'
                      className="doctor-chatbot-avatar-img"
                    />
                    {/* Gemini star sparkle overlay */}
                    <div style={{
                      position: 'absolute',
                      bottom: '-4px',
                      right: '-4px',
                      width: '28px',
                      height: '28px',
                      background: 'linear-gradient(135deg, #4285f4, #9b51e0)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(66,133,244,0.5)',
                      border: '2px solid #fff'
                    }}>
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
                        <path d="M12 2C12 7.5 7.5 12 2 12C7.5 12 12 16.5 12 22C12 16.5 16.5 12 22 12C16.5 12 12 7.5 12 2Z" fill="#ffffff" />
                      </svg>
                    </div>
                  </div>
                  <h1 className="gemini-welcome-text">Your move, {userName}!</h1>
                  <p style={{ fontSize: '0.8rem', color: '#9aa0a6', marginTop: '4px', textAlign: 'center' }}>Aman is ready to help you ✨</p>
                </div>
              ) : (
                <div className="gemini-feed-container">
                  {messages.map((m, idx) => (
                    <div key={idx} className={`gemini-msg-row ${m.role}`}>
                      {m.role === 'assistant' ? (
                        <div className="gemini-assistant-message">
                          <div className="gemini-assistant-avatar-column">
                            <svg className="gemini-sparkle-inline-icon" viewBox="0 0 24 24" fill="none">
                              <path d="M12 2C12 7.5 7.5 12 2 12C7.5 12 12 16.5 12 22C12 16.5 16.5 12 22 12C16.5 12 12 7.5 12 2Z" fill="url(#gsi)" />
                              <defs><linearGradient id="gsi" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#4285f4" /><stop offset="35%" stopColor="#9b51e0" /><stop offset="70%" stopColor="#ef4444" /><stop offset="100%" stopColor="#f59e0b" /></linearGradient></defs>
                            </svg>
                          </div>
                          <div className="gemini-assistant-text-content">
                            <div className="gemini-parsed-markdown">
                              {m.content.split('\n').map((line, lIdx) => {
                                let content: React.ReactNode = line;
                                if (line.includes('**')) {
                                  const parts = line.split('**');
                                  content = parts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx}>{part}</strong> : part);
                                }
                                if (line.trim().startsWith('- ')) return (
                                  <div key={lIdx} className="gemini-markdown-list-item">
                                    <span className="gemini-list-bullet">•</span><span>{content}</span>
                                  </div>
                                );
                                if (line.trim().startsWith('###')) return <h4 key={lIdx} className="gemini-markdown-h3">{line.replace('###', '').trim()}</h4>;
                                return <p key={lIdx} className="gemini-markdown-paragraph">{content}</p>;
                              })}
                            </div>

                            <div className="gemini-message-actions-bar">
                              <div className="gemini-left-actions">
                                <button className="gemini-msg-action-btn" title="Good response"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></svg></button>
                                <button className="gemini-msg-action-btn" title="Bad response"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm12-5h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" /></svg></button>
                                <button className="gemini-msg-action-btn" title="Copy" onClick={() => navigator.clipboard.writeText(m.content)}><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg></button>
                              </div>
                              <div className="gemini-right-actions">
                                <button
                                  className={`gemini-msg-action-btn ${speakingText === m.content ? 'is-speaking' : ''}`}
                                  title={speakingText === m.content ? "Stop" : "Read aloud"}
                                  onClick={() => handleSpeak(m.content)}
                                >
                                  {speakingText === m.content ? (
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><rect x="9" y="9" width="6" height="6" /></svg>
                                  ) : (
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
                                  )}
                                </button>
                              </div>
                            </div>

                            <div className="gemini-message-disclaimer">Aman AI · Verify clinical details with our specialist.</div>
                          </div>
                        </div>
                      ) : (
                        <div className="gemini-user-message">
                          <div className="gemini-user-bubble">{m.content}</div>
                        </div>
                      )}
                    </div>
                  ))}

                  {isTyping && (
                    <div className="gemini-msg-row assistant typing">
                      <div className="gemini-assistant-message">
                        <div className="gemini-assistant-avatar-column">
                          <svg className="gemini-sparkle-inline-icon pulse-animation" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2C12 7.5 7.5 12 2 12C7.5 12 12 16.5 12 22C12 16.5 16.5 12 22 12C16.5 12 12 7.5 12 2Z" fill="url(#gst)" />
                            <defs><linearGradient id="gst" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#4285f4" stopOpacity="0.5" /><stop offset="100%" stopColor="#34d399" stopOpacity="0.5" /></linearGradient></defs>
                          </svg>
                        </div>
                        <div className="gemini-assistant-text-content">
                          <div className="gemini-typing-capsule">
                            <div className="gemini-typing-wave"><span className="gemini-typing-dot" /><span className="gemini-typing-dot" /><span className="gemini-typing-dot" /></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ── BOTTOM INPUT ── */}
            <div className="chatbot-input-container">
              <div className="gemini-suggestions-scroll-wrapper">
                <div className="gemini-suggestions-row">
                  {suggestions.map((s, idx) => (
                    <button key={idx} onClick={() => handleSend(s.text)} className="gemini-suggestion-capsule-pill">{s.label}</button>
                  ))}
                </div>
              </div>

              {attachedFile && (
                <div className="gemini-attachment-pill">
                  <span>📎 {attachedFile.name}</span>
                  <button onClick={() => setAttachedFile(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0 4px' }} title="Remove"><X size={12} /></button>
                </div>
              )}

              <div className="chatbot-input-row">
                <div className="gemini-input-capsule">
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*,application/pdf,text/plain" />
                  <button className="gemini-capsule-btn gemini-btn-plus" title="Attach file" onClick={handlePlusClick}>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  </button>

                  <input
                    type="text"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSend(inputText); }}
                    placeholder="Ask Aman..."
                    className="chatbot-input"
                    disabled={isTyping}
                  />

                  <button
                    className={`gemini-capsule-btn gemini-btn-mic ${isListeningVoice ? 'voice-active' : ''}`}
                    title={isListeningVoice ? "Listening…" : "Voice input"}
                    onClick={startVoiceSearch}
                  >
                    {isListeningVoice ? (
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="12" y1="2" x2="12" y2="22" /><line x1="17" y1="5" x2="17" y2="19" /><line x1="7" y1="5" x2="7" y2="19" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="22" />
                      </svg>
                    )}
                  </button>
                </div>

                <div className="gemini-action-circle-wrap">
                  {isTyping ? (
                    <button onClick={() => { setIsTyping(false); setChatState('idle'); }} className="gemini-circle-btn gemini-btn-stop" title="Stop generating">
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><rect x="5" y="5" width="14" height="14" rx="2" /></svg>
                    </button>
                  ) : inputText.trim() || attachedFile ? (
                    <button onClick={() => handleSend(inputText)} className="gemini-circle-btn gemini-btn-send" title="Send">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                    </button>
                  ) : (
                    <button className="gemini-circle-btn gemini-btn-waveform" title="Voice mode" onClick={startVoiceSearch}>
                      <div className="waveform-bar-indicator"><span /><span /><span /></div>
                    </button>
                  )}
                </div>
              </div>

              <div className="chatbot-disclaimer">🌿 Aman AI · For full diagnostics, book a clinical consultation.</div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  /* ── Page Routing ── */
  const [currentPage, setCurrentPage] = useState<'home' | 'consultation' | 'admin'>('home');
  const [selectedService, setSelectedService] = useState('FUE Hair Transplant');
  const [chatOpen, setChatOpen] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'info' | 'warning' }[]>([]);
  
  const showToast = useCallback((message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = 'toast_' + Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  /* ── Nav & Scroll ── */
  const [activeTab, setActiveTab] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookScroll = () => {
    // If the calculator is on the home page, scroll to it.
    if (currentPage !== 'home') {
      setCurrentPage('home');
      setTimeout(() => scrollToSection('calculator'), 100);
    } else {
      scrollToSection('calculator');
    }
  };

  /* ── Dark Mode ── */
  const [isDarkMode, setIsDarkMode] = useState(() => document.body.classList.contains('dark-mode'));

  /* ── Calculator ── */
  const [selectedNorwood, setSelectedNorwood] = useState(3);
  const [includePRPSessions, setIncludePRPSessions] = useState(0);
  const [includeScreening, setIncludeScreening] = useState(true);
  const [useBioSapphire, setUseBioSapphire] = useState(false);

  const currentNorwoodInfo = norwoodStages[selectedNorwood - 1];

  const calculateCalculatorPrice = () => {
    const base = norwoodStages[selectedNorwood - 1].basePrice;
    let extra = includePRPSessions * 2000;
    if (includeScreening) extra += 999;
    if (useBioSapphire) extra += 10000;
    return base + extra;
  };

  const handleBookService = (service: string) => {
    setSelectedService(service);
    setCurrentPage('consultation');
    setActiveTab('consultation');
  };

  const navTabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'services', label: 'Treatments', icon: Stethoscope },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'reviews', label: 'Reviews', icon: MessageCircle },
    { id: 'consultation', label: 'Book', icon: Calendar },
  ];

  /* ── Profile & UI Helpers ── */
  const [profileSaving, setProfileSaving] = useState(false);
  const [pushSimulated, setPushSimulated] = useState(false);
  const [adminTime, setAdminTime] = useState(() => new Date().toLocaleTimeString());
  const slotsCount = 3;

  useEffect(() => {
    const timer = setInterval(() => {
      setAdminTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  /* ── Real-Time Data (Firestore Subscriptions) ── */
  const [dbGallery, setDbGallery] = useState<any[]>([]);
  const [dbReviews, setDbReviews] = useState<any[]>([]);
  const [clinicSettings, setClinicSettings] = useState<any>({
    announcementBanner: "🌟 Premium BioSapphire FUE Hair Restoration — Book now for up to 30% Off!",
    isAnnouncementActive: true,
    whatsappNumber: "+919876543210",
    slotsAvailable: 3,
    specialOffer: "Limited slots remaining for this week!"
  });

  /* ── Dynamic Layout & UI States ── */
  const [galleryViewMode, setGalleryViewMode] = useState<'swiper' | 'slider'>('swiper');
  const [pullProgress, setPullProgress] = useState(0);
  const [statsRating, setStatsRating] = useState(0);
  const [statsReviews, setStatsReviews] = useState(0);
  const [showAnnouncementPill, setShowAnnouncementPill] = useState(true);

  /* ── Admin Edit Mode ── */
  const [isAdminEditMode, setIsAdminEditMode] = useState(false);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);
  const [passcodeShaking, setPasscodeShaking] = useState(false);

  // Auto-dismiss announcement pill after 3 seconds
  useEffect(() => {
    if (clinicSettings.isAnnouncementActive && clinicSettings.announcementBanner) {
      const timer = setTimeout(() => {
        setShowAnnouncementPill(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [clinicSettings.isAnnouncementActive, clinicSettings.announcementBanner]);

  /* ── Before-After Slider ── */
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const sliderRef = React.useRef<HTMLDivElement>(null);

  const handleSliderMove = useCallback((clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(pct);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDraggingSlider) return;
    handleSliderMove(e.touches[0].clientX);
  }, [isDraggingSlider, handleSliderMove]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingSlider) return;
    handleSliderMove(e.clientX);
  }, [isDraggingSlider, handleSliderMove]);

  const handleMouseUp = useCallback(() => {
    setIsDraggingSlider(false);
  }, []);

  useEffect(() => {
    if (isDraggingSlider) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDraggingSlider, handleMouseMove, handleMouseUp, handleTouchMove]);

  /* ── Reviews ── */
  const [selectedReviewTag, setSelectedReviewTag] = useState('All');
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [reviewSortOrder, setReviewSortOrder] = useState('relevant');

  /* ── Gallery Swiper ── */
  const [currentSwiperIndex, setCurrentSwiperIndex] = useState(0);
  const swiperImages = useMemo(() => {
    if (dbGallery.length > 0) {
      return dbGallery.map(img => img.url);
    }
    return [
      '/image.png','/image copy.png','/image copy 2.png','/image copy 3.png',
      '/image copy 4.png','/image copy 5.png','/image copy 6.png','/image copy 7.png'
    ];
  }, [dbGallery]);

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

  /* ── Firebase Auth & Patient Profile ── */
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const userName = useMemo(() => {
    if (currentUser) {
      if (currentUser.displayName) return currentUser.displayName;
      if (currentUser.email) {
        const namePart = currentUser.email.split('@')[0];
        return namePart
          .split(/[\._-]/)
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ');
      }
    }
    return 'Guest';
  }, [currentUser]);
  const [authLoading, setAuthLoading] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);
  const [userMedicalProfile, setUserMedicalProfile] = useState<any>(null);

  /* ─────────────────────────────────────────────── */

  useEffect(() => {
    if (isDarkMode) document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');
  }, [isDarkMode]);

  // Firebase persistent auth listener + Firestore Sync
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setCurrentUser(user);
      if (user) {
        saveUserToFirestore(user);
      }
    });
    // Handle redirect sign-in result (for mobile Google auth flow)
    handleRedirectSignIn().then((user) => {
      if (user) {
        saveUserToFirestore(user);
        setCurrentPage('home');
        setShowProfileDrawer(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch patient medical profile from Firestore on auth change
  useEffect(() => {
    if (!currentUser) {
      setUserMedicalProfile(null);
      return;
    }
    const loadProfile = async () => {
      const data = await getUserDoc(currentUser.uid);
      if (data && data.medicalProfile) {
        setUserMedicalProfile(data.medicalProfile);
      }
    };
    loadProfile();
  }, [currentUser]);

  // JS #21: Real-time Firebase listener for gallery images
  useEffect(() => {
    const unsubGallery = subscribeToGallery((images) => {
      setDbGallery(images.filter(img => img.isActive));
    });
    return () => unsubGallery();
  }, []);

  // JS #22: Real-time Firebase listener for clinic settings & dynamic styling application
  useEffect(() => {
    const unsubSettings = subscribeToClinicSettings((settings) => {
      if (settings) {
        setClinicSettings(settings);
        
        // Apply color theme dynamically
        const root = document.documentElement;
        if (settings.colorTheme === 'Sapphire Blue') {
          root.style.setProperty('--green-primary', '#1d4ed8'); // royal blue
          root.style.setProperty('--green-deep', '#1e3a8a');
          root.style.setProperty('--green-mid', '#3b82f6');
          root.style.setProperty('--green-pale', '#eff6ff');
          root.style.setProperty('--green-light', '#bfdbfe');
        } else if (settings.colorTheme === 'Amethyst Purple') {
          root.style.setProperty('--green-primary', '#7c3aed'); // purple
          root.style.setProperty('--green-deep', '#4c1d95');
          root.style.setProperty('--green-mid', '#8b5cf6');
          root.style.setProperty('--green-pale', '#f5f3ff');
          root.style.setProperty('--green-light', '#ddd6fe');
        } else {
          // Emerald Green (default)
          root.style.setProperty('--green-primary', '#0ba759');
          root.style.setProperty('--green-deep', '#077a3f');
          root.style.setProperty('--green-mid', '#10b981');
          root.style.setProperty('--green-pale', '#eefdf4');
          root.style.setProperty('--green-light', '#a7f3d0');
        }

        // Apply font theme dynamically
        if (settings.fontTheme === 'Playfair Display') {
          root.style.setProperty('--font-display', "'Playfair Display', serif");
        } else if (settings.fontTheme === 'Cinzel') {
          root.style.setProperty('--font-display', "'Cinzel', serif");
        } else {
          root.style.setProperty('--font-display', "'Outfit', sans-serif");
        }
      }
    });
    return () => unsubSettings();
  }, []);

  // JS #23: Real-time Firebase listener for verified patient reviews
  useEffect(() => {
    const unsubReviews = subscribeToReviews((revs) => {
      setDbReviews(revs.filter(r => r.isVisible !== false));
    });
    return () => unsubReviews();
  }, []);

  // JS #30: Stats counter animation (countUp) when Home tab loads
  useEffect(() => {
    if (activeTab === 'home') {
      setStatsRating(0);
      setStatsReviews(0);
      let rVal = 0;
      let cVal = 0;
      const timerRating = setInterval(() => {
        rVal += 0.1;
        if (rVal >= 4.9) {
          setStatsRating(4.9);
          clearInterval(timerRating);
        } else {
          setStatsRating(parseFloat(rVal.toFixed(1)));
        }
      }, 30);
      const timerReviews = setInterval(() => {
        cVal += 5;
        if (cVal >= 191) {
          setStatsReviews(191);
          clearInterval(timerReviews);
        } else {
          setStatsReviews(cVal);
        }
      }, 25);
      return () => {
        clearInterval(timerRating);
        clearInterval(timerReviews);
      };
    }
  }, [activeTab]);

  // JS #32: Pull-to-refresh mobile gesture simulated scroll listener
  useEffect(() => {
    let startY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
      }
    };
    const handleTouchMovePull = (e: TouchEvent) => {
      if (startY === 0 || window.scrollY > 0) return;
      const currentY = e.touches[0].clientY;
      const pull = currentY - startY;
      if (pull > 0 && pull < 150) {
        setPullProgress(Math.floor((pull / 150) * 100));
      }
    };
    const handleTouchEnd = () => {
      if (pullProgress >= 90) {
        showToast("Page refreshed! Syncing database configurations...", "success");
        // Trigger brief visual refresh
        const scrollBar = document.querySelector('.pull-refresh-bar') as HTMLElement;
        if (scrollBar) {
          scrollBar.style.width = '100%';
          setTimeout(() => {
            setPullProgress(0);
          }, 800);
        }
      } else {
        setPullProgress(0);
      }
      startY = 0;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMovePull, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMovePull);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullProgress, showToast]);

  // JS #33: SessionStorage auto-save for Norwood Calculator state
  useEffect(() => {
    const savedNorwood = sessionStorage.getItem('hh_calculator_norwood');
    if (savedNorwood) {
      const val = parseInt(savedNorwood);
      if (!isNaN(val)) setSelectedNorwood(val);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem('hh_calculator_norwood', selectedNorwood.toString());
  }, [selectedNorwood]);

  // JS #29: Push Notification Request & Simulation
  const requestPushPermission = () => {
    if (!('Notification' in window)) {
      showToast("Web Push is not supported in this PWA fallback mode.", "warning");
      return;
    }
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        showToast("Web Push Notifications enabled successfully! 🔔", "success");
        // Simulated welcome push
        new Notification("Hair Haven Clinic", {
          body: "Thank you for enabling push alerts! Get real-time queue confirmations directly here.",
          icon: "/logo.png"
        });
      } else {
        showToast("Push notifications permission denied.", "info");
      }
    });
  };

  const handleGoogleLogin = async () => {
    try {
      setAuthLoading(true);
      const user = await signInWithGoogle();
      if (user) {
        await saveUserToFirestore(user);
        const data = await getUserDoc(user.uid);
        if (data && data.medicalProfile) {
          setUserMedicalProfile(data.medicalProfile);
        }
        setCurrentPage('home');
        setShowProfileDrawer(false);
      }
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      // 'redirect_initiated' is not a real error — it means the mobile redirect was triggered
      if (error.message === 'redirect_initiated') return;
      if (error.code !== 'auth/popup-closed-by-user') {
        const errorMessage = error.message || 'Please try again.';
        showToast(`Sign-in failed: ${errorMessage}`, 'warning');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setShowProfileDrawer(false);
    } catch (error) {
      console.error('Sign-out error:', error);
    }
  };

  const handleCopyUid = (uid: string) => {
    navigator.clipboard.writeText(uid);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

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

  // JS #1: Intersection Observer — scroll-triggered reveal animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal-on-scroll').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [activeTab]);

  // JS #2: Card tilt effect on mouse move (desktop)
  useEffect(() => {
    const cards = document.querySelectorAll('.glass-card');
    const handleMouseMove = (e: MouseEvent) => {
      const card = (e.currentTarget as HTMLElement);
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotateX = ((y - cy) / cy) * -5;
      const rotateY = ((x - cx) / cx) * 5;
      card.style.transform = `translateY(-5px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };
    const handleMouseLeave = (e: MouseEvent) => {
      (e.currentTarget as HTMLElement).style.transform = '';
    };
    cards.forEach((card) => {
      card.addEventListener('mousemove', handleMouseMove as any);
      card.addEventListener('mouseleave', handleMouseLeave as any);
    });
    return () => {
      cards.forEach((card) => {
        card.removeEventListener('mousemove', handleMouseMove as any);
        card.removeEventListener('mouseleave', handleMouseLeave as any);
      });
    };
  }, [activeTab]);

  // JS #3: Keyboard shortcut — press 'B' to open booking, 'C' to open chat, ESC to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'b' || e.key === 'B') {
        setCurrentPage('consultation'); setActiveTab('consultation');
      }
      if (e.key === 'c' || e.key === 'C') {
        setChatOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setChatOpen(false);
        setShowProfileDrawer(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // JS #4: Theme auto-detect (prefers-color-scheme)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('hh_theme');
    if (!savedTheme) {
      setIsDarkMode(mediaQuery.matches);
    }
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('hh_theme')) setIsDarkMode(e.matches);
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // JS #5: Save dark mode preference
  useEffect(() => {
    localStorage.setItem('hh_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // JS #6: Page visibility API — pause animations when tab hidden
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        document.body.classList.add('tab-hidden');
      } else {
        document.body.classList.remove('tab-hidden');
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // JS #7: Mouse cursor glow trail effect (subtle)
  useEffect(() => {
    if (window.innerWidth <= 768) return; // Skip on mobile
    const trail = document.createElement('div');
    trail.id = 'cursor-glow';
    trail.style.cssText = `
      position: fixed; pointer-events: none; z-index: 99999;
      width: 20px; height: 20px; border-radius: 50%;
      background: radial-gradient(circle, rgba(11,167,89,0.25) 0%, transparent 70%);
      transform: translate(-50%, -50%);
      transition: left 0.08s ease, top 0.08s ease;
      left: -100px; top: -100px;
    `;
    document.body.appendChild(trail);
    const moveTrail = (e: MouseEvent) => {
      trail.style.left = e.clientX + 'px';
      trail.style.top = e.clientY + 'px';
    };
    window.addEventListener('mousemove', moveTrail, { passive: true });
    return () => {
      window.removeEventListener('mousemove', moveTrail);
      trail.remove();
    };
  }, []);

  // JS #8: Smooth anchor link interception
  useEffect(() => {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector((link as HTMLAnchorElement).hash);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }, [activeTab]);

  // JS #9: Battery status awareness (dim orbs to save power)
  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        if (battery.level < 0.2) {
          document.body.classList.add('low-battery');
        }
        battery.addEventListener('levelchange', () => {
          if (battery.level < 0.2) document.body.classList.add('low-battery');
          else document.body.classList.remove('low-battery');
        });
      }).catch(() => {});
    }
  }, []);

  // JS #10: Network status indicator
  useEffect(() => {
    const handleOffline = () => showToast('You are offline. Some features may not work.', 'warning');
    const handleOnline = () => showToast('Back online! ✅', 'success');
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [showToast]);

  // JS #11: Chat open body class management
  useEffect(() => {
    if (chatOpen) {
      document.body.classList.add('aman-chat-open');
    } else {
      document.body.classList.remove('aman-chat-open');
    }
    return () => document.body.classList.remove('aman-chat-open');
  }, [chatOpen]);

  // JS #12: Lazy load images with IntersectionObserver
  useEffect(() => {
    const imgs = document.querySelectorAll('img[data-src]');
    const imgObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || '';
          img.classList.add('loaded');
          imgObserver.unobserve(img);
        }
      });
    }, { threshold: 0.01 });
    imgs.forEach(img => imgObserver.observe(img));
    return () => imgObserver.disconnect();
  }, [activeTab]);

  // JS #13: Touch swipe detection for gallery
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const handleTouchStartSwipe = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  }, []);
  const handleTouchEndSwipe = useCallback((e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) setCurrentSwiperIndex(p => (p + 1) % swiperImages.length);
      else setCurrentSwiperIndex(p => (p - 1 + swiperImages.length) % swiperImages.length);
    }
    setTouchStart(null);
  }, [touchStart, swiperImages.length]);

  // JS #14: Haptic feedback simulation on critical actions
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns: Record<string, number[]> = {
        light: [10],
        medium: [20],
        heavy: [30, 10, 30]
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  // JS #15: Active tab change with haptic + scroll reset
  const handleTabChange = useCallback((tabId: string) => {
    triggerHaptic('light');
    setActiveTab(tabId);
    if (tabId === 'consultation') {
      setCurrentPage('consultation');
    } else {
      setCurrentPage('home');
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [triggerHaptic]);

  // JS #16: Dynamic page title update
  useEffect(() => {
    const titles: Record<string, string> = {
      home: 'Hair Haven — Premium Hair Restoration in Jammu',
      services: 'Treatments & Services — Hair Haven',
      gallery: 'Before & After Gallery — Hair Haven',
      reviews: 'Patient Reviews — Hair Haven',
      consultation: 'Book Consultation — Hair Haven',
    };
    document.title = titles[activeTab] || 'Hair Haven';
  }, [activeTab]);

  // JS #17: Performance monitoring with PerformanceObserver (log CLS, LCP)
  useEffect(() => {
    if (!('PerformanceObserver' in window)) return;
    try {
      const po = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (entry.entryType === 'largest-contentful-paint') {
            // LCP tracked silently for monitoring
          }
        });
      });
      po.observe({ type: 'largest-contentful-paint', buffered: true });
      return () => po.disconnect();
    } catch {
      return () => {};
    }
  }, []);

  // JS #18: Auto-dismiss profile drawer on outside touch (mobile)
  useEffect(() => {
    const handleBodyTap = (e: TouchEvent) => {
      const drawer = document.querySelector('.profile-drawer');
      if (showProfileDrawer && drawer && !drawer.contains(e.target as Node)) {
        setShowProfileDrawer(false);
      }
    };
    document.addEventListener('touchstart', handleBodyTap, { passive: true });
    return () => document.removeEventListener('touchstart', handleBodyTap);
  }, [showProfileDrawer]);

  // JS #20: Share API integration
  const handleShareClinic = useCallback(async () => {
    const shareData = {
      title: 'Hair Haven — Premium Hair Restoration in Jammu',
      text: 'Book your free hair consultation at Hair Haven. Advanced FUE techniques, 100% sterile OT, 4.9★ rated.',
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard! 📋', 'success');
    }
  }, [showToast]);

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
    const activeReviews = dbReviews.length > 0 ? dbReviews : testimonials;
    let result = [...activeReviews];
    if (selectedReviewTag !== 'All') result = result.filter(t => t.tag === selectedReviewTag);
    if (reviewSearchQuery.trim()) {
      const q = reviewSearchQuery.toLowerCase();
      result = result.filter(t => t.name.toLowerCase().includes(q) || t.quote.toLowerCase().includes(q) || t.tag.toLowerCase().includes(q));
    }
    if (reviewSortOrder === 'newest') {
      result.sort((a, b) => {
        const timeA = a.createdAt?.seconds || (Date.now() / 1000) - (a.daysAgo || 0) * 86400;
        const timeB = b.createdAt?.seconds || (Date.now() / 1000) - (b.daysAgo || 0) * 86400;
        return timeB - timeA;
      });
    }
    else if (reviewSortOrder === 'highest') result.sort((a, b) => b.rating - a.rating);
    else result.sort((a, b) => (a.order || a.id) - (b.order || b.id));
    return result;
  }, [dbReviews, selectedReviewTag, reviewSearchQuery, reviewSortOrder]);

  return (
    <>
      <MagicalOrbs />

      {/* Clickable Doctor Avatar (FAB) — hides with animation when chatbot opens */}
      <div 
        onClick={() => { if (!isAdminEditMode) setChatOpen(prev => !prev); }}
        style={{
          position: 'fixed',
          bottom: '160px',
          right: '-20px',
          zIndex: 10010,
          cursor: 'pointer',
          transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          opacity: chatOpen ? 0 : 1,
          transform: chatOpen ? 'translateX(120px) scale(0.5)' : 'translateX(0) scale(1)',
          pointerEvents: chatOpen ? 'none' : 'auto',
        }}
        className="doctor-floating-btn"
        title="Chat with Aman AI Assistant"
      >
        <InlineImageEdit value={clinicSettings.doctorAvatarUrl || '/doctor-avatar.png'} field="doctorAvatarUrl" isActive={isAdminEditMode}>
          <img
            src={clinicSettings.doctorAvatarUrl || '/doctor-avatar.png'}
            alt='Aman AI'
            style={{
              width: '85px',
              height: '85px',
              objectFit: 'contain',
              filter: 'none',
              transition: 'transform 0.3s ease',
            }}
          />
        </InlineImageEdit>
        {/* AI badge */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '8px',
          background: 'linear-gradient(135deg, var(--green-primary), var(--green-deep))',
          borderRadius: '99px',
          padding: '2px 7px',
          fontSize: '0.55rem',
          fontWeight: 800,
          color: '#fff',
          letterSpacing: '0.04em',
          boxShadow: '0 2px 8px rgba(11,167,89,0.4)',
          pointerEvents: 'none'
        }}>AI</div>
      </div>


      {/* Profile & Navigation Sidebar Drawer ("Open Everything") */}
      {showProfileDrawer && (
        <>
          {/* Backdrop overlay */}
          <div className="drawer-backdrop" onClick={() => setShowProfileDrawer(false)} />

          {/* Sidebar Drawer */}
          <div className="profile-drawer">
            {/* Header */}
            <div className="drawer-header">
              <div className="flex align-center gap-2">
                <HairHavenLogo size={32} logoUrl={clinicSettings.logoUrl || '/logo.png'} isAdminEditMode={isAdminEditMode} />
                <div className="flex flex-col">
                  <span style={{ fontSize:'1rem', fontWeight:800, color:'var(--text-primary)', fontFamily:'var(--font-display)', lineHeight:1.1 }}>Hair Haven</span>
                  <span style={{ fontSize:'0.55rem', fontWeight:700, color:'var(--gemini-purple)', letterSpacing:'0.05em', textTransform:'uppercase' }}>Transplant Clinic</span>
                </div>
              </div>
              <button 
                onClick={() => setShowProfileDrawer(false)}
                style={{ background:'rgba(11,167,89,0.08)', border:'none', borderRadius:'50%', width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-secondary)', cursor:'pointer', transition:'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(11,167,89,0.15)'; e.currentTarget.style.color = 'var(--green-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(11,167,89,0.08)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="drawer-content">
              {/* Profile Card Section */}
              {currentUser ? (
                <div style={{ 
                  background: 'linear-gradient(135deg, rgba(11, 167, 89, 0.08) 0%, rgba(34, 197, 94, 0.03) 100%)', 
                  border: '1.5px solid rgba(11, 167, 89, 0.15)', 
                  borderRadius: '24px', 
                  padding: '20px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '16px',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'relative',
                  overflow: 'hidden',
                  flexShrink: 0
                }}>
                  {/* Decorative background accent */}
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, var(--green-deep) 0%, var(--green-primary) 100%)' }} />

                  {/* Horizontal User Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', zIndex: 1 }}>
                    {/* Avatar */}
                    <div style={{ 
                      width: '60px', 
                      height: '60px', 
                      borderRadius: '50%', 
                      border: '2.5px solid #ffffff', 
                      boxShadow: '0 4px 12px rgba(11,167,89,0.2)', 
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--surface-card)',
                      flexShrink: 0
                    }}>
                      {currentUser.photoURL ? (
                        <img src={currentUser.photoURL} alt={userName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                      ) : (
                        <User size={24} color="var(--green-primary)" />
                      )}
                    </div>

                    {/* Text info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden', textAlign: 'left' }}>
                      <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {userName}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {currentUser.email}
                      </p>
                    </div>
                  </div>

                  {/* Badges / ID row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', zIndex: 1 }}>
                    <span className="badge badge-gradient" style={{ fontSize: '0.68rem', padding: '4px 10px', border: '1px solid rgba(11,167,89,0.25)', borderRadius: '10px', boxShadow: '0 2px 8px rgba(11,167,89,0.05)' }}>
                      ✨ VIP Member
                    </span>
                    
                    <div 
                      onClick={() => handleCopyUid(currentUser.uid)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        background: 'var(--surface-card)', 
                        border: '1px solid var(--border-light)', 
                        borderRadius: '10px', 
                        padding: '4px 10px', 
                        fontSize: '0.68rem', 
                        color: 'var(--text-secondary)', 
                        cursor: 'pointer', 
                        fontWeight: 600,
                        transition: 'all 0.2s'
                      }}
                      title="Click to copy UID"
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--green-primary)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-light)'}
                    >
                      <Copy size={10} color="var(--green-primary)" />
                      <span style={{ fontFamily: 'monospace' }}>
                        ID: {currentUser.uid.slice(0, 8)}...
                      </span>
                      {copiedUid && <span style={{ color: 'var(--green-primary)', fontWeight: 800, marginLeft: '4px' }}>Copied!</span>}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ 
                  background: 'linear-gradient(135deg, rgba(11, 167, 89, 0.04) 0%, rgba(34, 197, 94, 0.01) 100%)', 
                  border: '1.5px dashed rgba(11, 167, 89, 0.2)', 
                  borderRadius: '24px', 
                  padding: '24px 20px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '16px',
                  position: 'relative',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(11,167,89,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px dashed var(--green-primary)' }}>
                    <User size={22} color="var(--green-primary)" />
                  </div>
                  <div style={{ zIndex: 1, textAlign: 'center' }}>
                    <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>Welcome to Hair Haven</h4>
                    <p style={{ margin: '6px 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>Sign in to synchronize your bookings, consultation estimates, and custom treatment plan.</p>
                  </div>
                  
                  {/* Google Login Button */}
                  <button 
                    onClick={handleGoogleLogin} 
                    disabled={authLoading}
                    style={{ 
                      width: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '10px', 
                      background: 'var(--surface-card)', 
                      border: '1.5px solid var(--border-light)', 
                      borderRadius: '14px', 
                      padding: '11px', 
                      cursor: 'pointer', 
                      fontWeight: 700, 
                      fontSize: '0.82rem', 
                      color: 'var(--text-primary)', 
                      boxShadow: 'var(--shadow-xs)', 
                      transition: 'all 0.2s', 
                      zIndex: 1 
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(11,167,89,0.3)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.boxShadow = 'var(--shadow-xs)'; }}
                  >
                    {authLoading ? (
                      <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid var(--border-light)', borderTopColor: 'var(--green-primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    )}
                    {authLoading ? 'Signing in...' : 'Sign in with Google'}
                  </button>
                </div>
              )}

              {/* Medical Clinic File Card */}
              {currentUser && userMedicalProfile && (
                <div style={{ 
                  background:'rgba(255, 255, 255, 0.45)', 
                  border:'1px solid rgba(11, 167, 89, 0.12)', 
                  borderRadius:'24px', 
                  padding:'20px', 
                  display:'flex', 
                  flexDirection:'column', 
                  gap:'14px',
                  boxShadow:'var(--shadow-sm)',
                  transition:'all 0.3s ease',
                  flexShrink: 0
                }} className="drawer-medical-card">
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', borderBottom:'1px solid rgba(11,167,89,0.08)', paddingBottom:'10px' }}>
                    <div style={{ width:'28px', height:'28px', borderRadius:'8px', background:'rgba(11,167,89,0.08)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--green-primary)' }}>
                      <FileText size={16} />
                    </div>
                    <span style={{ fontSize:'0.88rem', fontWeight:800, color:'var(--text-primary)', fontFamily:'var(--font-display)' }}>📋 Hair Clinic File</span>
                  </div>

                  <div style={{ display:'flex', flexDirection:'column', gap:'10px', fontSize:'0.82rem', textAlign: 'left' }}>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={{ color:'var(--text-tertiary)' }}>Patient Name:</span>
                      <span style={{ fontWeight:700, color:'var(--text-primary)' }}>{userMedicalProfile.fullName || userName}</span>
                    </div>

                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={{ color:'var(--text-tertiary)' }}>Age / Gender:</span>
                      <span style={{ fontWeight:700, color:'var(--text-primary)' }}>
                        {userMedicalProfile.age ? `${userMedicalProfile.age} yrs` : 'Not set'} • {userMedicalProfile.gender || 'Not set'}
                      </span>
                    </div>

                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={{ color:'var(--text-tertiary)' }}>First Visit:</span>
                      <span style={{ fontWeight:700, color:'var(--text-secondary)' }}>{userMedicalProfile.firstConsultationDate}</span>
                    </div>

                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ color:'var(--text-tertiary)' }}>Norwood Loss Stage:</span>
                      <span className="badge badge-gradient" style={{ fontSize:'0.75rem', fontWeight:800, padding:'2px 8px', borderRadius: '10px' }}>
                        Stage {userMedicalProfile.stage}
                      </span>
                    </div>

                    <div style={{ display:'flex', flexDirection:'column', gap:'4px', marginTop:'4px' }}>
                      <span style={{ color:'var(--text-tertiary)' }}>Primary Concern:</span>
                      <span style={{ fontWeight:700, color:'var(--text-primary)', background:'rgba(11,167,89,0.04)', padding:'6px 10px', borderRadius:'8px', border: '1px solid rgba(11,167,89,0.06)' }}>{userMedicalProfile.primaryConcerns}</span>
                    </div>

                    <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                      <span style={{ color:'var(--text-tertiary)' }}>Prior Treatments:</span>
                      <span style={{ fontWeight:700, color:'var(--text-secondary)', background:'var(--bg-secondary)', padding:'6px 10px', borderRadius:'8px', border: '1px solid var(--border-light)' }}>{userMedicalProfile.priorTreatments}</span>
                    </div>

                    <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                      <span style={{ color:'var(--text-tertiary)' }}>Clinical Conditions:</span>
                      <span style={{ fontWeight:700, color:'var(--text-secondary)', background:'var(--bg-secondary)', padding:'6px 10px', borderRadius:'8px', border: '1px solid var(--border-light)' }}>{userMedicalProfile.medicalConditions}</span>
                    </div>
                  </div>

                  {/* AI Specialist Assessment */}
                  <div style={{ 
                    background:'linear-gradient(135deg, rgba(11, 167, 89, 0.05) 0%, rgba(34, 197, 94, 0.01) 100%)',
                    border:'1.5px dashed rgba(11, 167, 89, 0.2)',
                    borderRadius:'14px',
                    padding:'12px',
                    fontSize:'0.78rem',
                    color:'var(--text-secondary)',
                    lineHeight:'1.4',
                    position:'relative',
                    textAlign: 'left'
                  }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'4px', color:'var(--green-primary)', fontWeight:800, fontSize:'0.75rem' }}>
                      <Sparkles size={12} className="pulse-button" />
                      <span>AI Specialist Assessment</span>
                    </div>
                    {userMedicalProfile.aiAssessment}
                  </div>

                  {/* Edit File Button */}
                  <button 
                    onClick={() => {
                      const name = window.prompt("Enter your full name:", userMedicalProfile.fullName || userName);
                      const age = window.prompt("Enter your age:", userMedicalProfile.age || "");
                      const gender = window.prompt("Enter your gender (e.g. Male, Female, Other):", userMedicalProfile.gender || "");
                      const concerns = window.prompt("Enter your primary hair concerns (e.g. Receding hairline, temple hair loss):", userMedicalProfile.primaryConcerns);
                      const prior = window.prompt("Enter prior treatments tried (e.g. PRP, Minoxidil, none):", userMedicalProfile.priorTreatments);
                      const conditions = window.prompt("Enter any medical conditions or checks (e.g. Blood Sugar normal, none):", userMedicalProfile.medicalConditions);
                      const stagePrompt = window.prompt("Enter your Norwood Hair Loss Stage (1 to 7):", userMedicalProfile.stage.toString());
                      
                      const newStage = parseInt(stagePrompt || "3");
                      if (name !== null || age !== null || gender !== null || concerns !== null || prior !== null || conditions !== null || !isNaN(newStage)) {
                        const updated = {
                          ...userMedicalProfile,
                          fullName: name !== null ? name : (userMedicalProfile.fullName || userName),
                          age: age !== null ? age : (userMedicalProfile.age || ""),
                          gender: gender !== null ? gender : (userMedicalProfile.gender || ""),
                          primaryConcerns: concerns !== null ? concerns : userMedicalProfile.primaryConcerns,
                          priorTreatments: prior !== null ? prior : userMedicalProfile.priorTreatments,
                          medicalConditions: conditions !== null ? conditions : userMedicalProfile.medicalConditions,
                          stage: isNaN(newStage) ? userMedicalProfile.stage : newStage,
                          aiAssessment: `Patient is a ${age || userMedicalProfile.age || '28'}-year-old ${gender || userMedicalProfile.gender || 'male'}. Norwood Stage ${isNaN(newStage) ? userMedicalProfile.stage : newStage} pattern hair loss presenting ${concerns || userMedicalProfile.primaryConcerns}. Prior treatments tried: ${prior || userMedicalProfile.priorTreatments}. Highly suitable candidate for FUE Hair Restoration or BioSapphire FUE technique.`
                        };
                        setProfileSaving(true);
                        saveMedicalProfileToFirestore(currentUser.uid, updated).then(() => {
                          setUserMedicalProfile(updated);
                          setProfileSaving(false);
                          showToast("Hair Clinic File saved successfully to Firestore!", "success");
                        });
                      }
                    }}
                    disabled={profileSaving}
                    style={{ 
                      width:'100%', 
                      background:'none', 
                      border:'1.5px solid var(--green-primary)', 
                      color:'var(--green-primary)', 
                      borderRadius:'10px', 
                      padding:'8px 12px', 
                      cursor:'pointer', 
                      fontWeight:800, 
                      fontSize:'0.82rem',
                      display:'flex',
                      alignItems:'center',
                      justifyContent:'center',
                      gap:'6px',
                      transition:'all 0.2s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(11,167,89,0.06)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                  >
                    {profileSaving ? 'Saving File...' : '✏️ Edit Clinic File'}
                  </button>
                </div>
              )}

              {/* Navigation Menu */}
              <div className="drawer-nav-menu">
                <div style={{ padding:'0 16px 8px 16px', fontSize:'0.72rem', fontWeight:800, color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                  Navigation & Services
                </div>
                {[
                  { id:'home', label:'Home Dashboard', icon: Home, isHome: true },
                  { id:'services', label:'Treatments & Services', icon: Stethoscope },
                  { id:'calculator', label:'Stage Calculator', icon: SlidersHorizontal },
                  { id:'gallery', label:'Before & Afters', icon: ImageIcon },
                  { id:'reviews', label:'Patient Reviews', icon: Star },
                  { id:'map', label:'Location & Contact', icon: MapPin },
                ].map(item => {
                  const Icon = item.icon;
                  const isActive = currentPage === 'home' && activeTab === item.id;
                  return (
                    <div 
                      key={item.id}
                      className={`drawer-nav-item ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        setShowProfileDrawer(false);
                        if (item.isHome) {
                          setCurrentPage('home');
                          setActiveTab('home');
                          window.scrollTo({ top:0, behavior:'smooth' });
                        } else {
                          setCurrentPage('home');
                          setActiveTab(item.id);
                          setTimeout(() => scrollToSection(item.id), 100);
                        }
                      }}
                    >
                      <div className="drawer-nav-icon">
                        <Icon size={16} />
                      </div>
                      <span>{item.label}</span>
                    </div>
                  );
                })}
                
                {/* Passcode-Protected Admin Access button */}
                <div 
                  className={`drawer-nav-item ${currentPage === 'admin' ? 'active' : ''}`}
                  onClick={() => {
                    setShowProfileDrawer(false);
                    setPasscodeInput('');
                    setPasscodeError(false);
                    setShowPasscodeModal(true);
                  }}
                  style={{ 
                    marginTop:'12px', 
                    background: isAdminEditMode ? 'rgba(128,90,213,0.14)' : 'rgba(128, 90, 213, 0.06)', 
                    border: isAdminEditMode ? '1.5px solid rgba(128,90,213,0.6)' : '1.5px dashed rgba(128, 90, 213, 0.35)', 
                    borderRadius:'12px',
                    color:'var(--gemini-purple)' 
                  }}
                >
                  <div className="drawer-nav-icon" style={{ color:'var(--gemini-purple)' }}>
                    <Settings size={16} />
                  </div>
                  <span style={{ fontWeight:800 }}>
                    {isAdminEditMode ? '🟣 Edit Mode Active' : '🔐 Client Admin Panel'}
                  </span>
                </div>

              </div>

              {/* Preferences Card (Theme Switcher) */}
              <div className="drawer-control-card">
                <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                  <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:'rgba(11,167,89,0.08)', color:'var(--green-primary)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
                  </div>
                  <div className="flex flex-col">
                    <span style={{ fontSize:'0.85rem', fontWeight:700, color:'var(--text-primary)' }}>Dark Appearance</span>
                    <span style={{ fontSize:'0.7rem', color:'var(--text-tertiary)' }}>Optimize battery & style</span>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={isDarkMode} 
                    onChange={() => setIsDarkMode(!isDarkMode)} 
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              {/* Push Notifications Card */}
              <div className="drawer-control-card" style={{ marginTop: '10px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                  <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:'rgba(11,167,89,0.08)', color:'var(--green-primary)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  </div>
                  <div className="flex flex-col">
                    <span style={{ fontSize:'0.85rem', fontWeight:700, color:'var(--text-primary)' }}>Push Alerts {pushSimulated && ' (OK)'}</span>
                    <span style={{ fontSize:'0.7rem', color:'var(--text-tertiary)' }}>Simulated booking updates</span>
                  </div>
                </div>
                <button 
                  onClick={requestPushPermission}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '6px 12px', fontSize: '0.75rem', fontWeight: 800 }}
                >
                  Enable
                </button>
              </div>

              {/* Booking CTA Button */}
              <button 
                onClick={() => {
                  setShowProfileDrawer(false);
                  handleBookScroll();
                }} 
                className="btn btn-primary pulse-button" 
                style={{ width:'100%', padding:'12px', borderRadius:'14px', fontSize:'0.88rem', fontWeight:800, marginTop:'8px', flexShrink: 0 }}
              >
                Book Free Consultation
              </button>

              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textAlign: 'center', marginTop: '12px' }}>
                Local Time: {adminTime}
              </div>

              {/* Sign Out (at the bottom) */}
              {currentUser && (
                <button 
                  onClick={handleSignOut}
                  style={{ 
                    width:'100%', 
                    display:'flex', 
                    alignItems:'center', 
                    justifyContent:'center', 
                    gap:'10px', 
                    background:'rgba(239,68,68,0.08)', 
                    border:'1.5px dashed rgba(239,68,68,0.3)', 
                    borderRadius:'14px', 
                    padding:'12px', 
                    cursor:'pointer', 
                    color:'#ef4444', 
                    fontWeight:800, 
                    fontSize:'0.88rem',
                    transition:'all 0.2s',
                    marginTop:'auto',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.14)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                >
                  <LogOut size={16} />
                  <span>Sign Out Account</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* PWA Install Banner */}
      {showInstallBanner && !pwaInstalled && (
        <div className="pwa-banner">
          <div className="pwa-banner-left">
            <HairHavenLogo size={32} logoUrl={clinicSettings.logoUrl || '/logo.png'} isAdminEditMode={isAdminEditMode} />
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
            <HairHavenLogo size={64} className="pwa-modal-logo" logoUrl={clinicSettings.logoUrl || '/logo.png'} isAdminEditMode={isAdminEditMode} />
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

      {/* UI #16: Pull to Refresh Indicator Bar */}
      <div className="pull-refresh-bar" style={{ width: `${pullProgress}%` }} />

      {currentPage === 'home' ? (
        <div>
          {(showAnnouncementPill || isAdminEditMode) && clinicSettings.isAnnouncementActive && clinicSettings.announcementBanner && (
            <div className="floating-announcement-pill" onClick={!isAdminEditMode ? () => handleBookScroll() : undefined}>
              <span className="floating-announcement-dot" />
              <span className="floating-announcement-text">
                <InlineEdit value={clinicSettings.announcementBanner} field="announcementBanner" isActive={isAdminEditMode}>
                  {clinicSettings.announcementBanner}
                </InlineEdit>
              </span>
              {!isAdminEditMode && <span className="floating-announcement-cta">Book →</span>}
            </div>
          )}
          {/* Top Bar */}
          <nav className={`glass-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container py-4 flex justify-between align-center" style={{ minHeight:'70px' }}>

          {/* Top-Left Profile Icon Button */}
          <button 
            onClick={() => setShowProfileDrawer(true)}
            style={{ 
              background:'none', 
              border: currentUser ? '2px solid var(--green-primary)' : '1.5px solid var(--border-light)', 
              borderRadius:'50%', 
              padding:0, 
              cursor:'pointer', 
              width:'38px', 
              height:'38px', 
              overflow:'hidden', 
              display:'flex', 
              alignItems:'center', 
              justifyContent:'center',
              boxShadow: currentUser ? '0 0 10px rgba(11,167,89,0.25)' : 'var(--shadow-xs)',
              transition:'all 0.3s ease',
              position:'relative'
            }}
            title={currentUser ? (currentUser.displayName || 'My Profile') : 'Open Menu & Profile'}
          >
            {currentUser ? (
              currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt={currentUser.displayName || 'User'} style={{ width:'100%', height:'100%', objectFit:'cover' }} referrerPolicy="no-referrer" />
              ) : (
                <div style={{ width:'100%', height:'100%', background:'rgba(11,167,89,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <User size={18} color="var(--green-primary)" />
                </div>
              )
            ) : (
              <User size={18} color="var(--text-secondary)" />
            )}
            {currentUser && (
              <span style={{ 
                position:'absolute', 
                bottom:'1px', 
                right:'1px', 
                width:'8px', 
                height:'8px', 
                background:'#22c55e', 
                border:'1.5px solid var(--bg-primary)', 
                borderRadius:'50%',
                boxShadow:'0 0 4px #22c55e'
              }} />
            )}
          </button>

          {/* Center Logo */}
          <a 
            href="#home" 
            className="flex align-center gap-3" 
            style={{ textDecoration:'none', position:'absolute', left:'50%', transform:'translateX(-50%)' }}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
          >
            <HairHavenLogo size={40} logoUrl={clinicSettings.logoUrl || '/logo.png'} isAdminEditMode={isAdminEditMode} />
            <div className="flex flex-col">
              <span style={{ fontSize:'1.25rem', fontWeight:800, color:'var(--text-primary)', fontFamily:'var(--font-display)', letterSpacing:'-0.02em', lineHeight:1.1 }}>Hair Haven</span>
              <span style={{ fontSize:'0.65rem', fontWeight:700, color:'var(--gemini-purple)', letterSpacing:'0.1em', textTransform:'uppercase' }}>Transplant Clinic</span>
            </div>
          </a>

          {/* Right side: desktop nav + admin shortcut */}
          <div className="flex align-center gap-3">
            <div className="desktop-only-flex gap-4">
              {[
                { id:'services', label:'Treatments' },
                { id:'calculator', label:'Calculator' },
                { id:'gallery', label:'Gallery' },
                { id:'reviews', label:'Reviews' },
              ].map(n => {
                const isActive = (n.id === 'calculator' && activeTab === 'home') || activeTab === n.id;
                return (
                  <a 
                    key={n.id} 
                    href={`#${n.id}`} 
                    className={`nav-link ${isActive ? 'active' : ''}`} 
                    onClick={(e) => {
                      e.preventDefault();
                      if (n.id === 'calculator') {
                        setActiveTab('home');
                        setTimeout(() => scrollToSection('calculator'), 50);
                      } else {
                        setActiveTab(n.id);
                        window.scrollTo({ top: 0, behavior: 'instant' });
                      }
                    }}
                  >
                    {n.label}
                  </a>
                );
              })}
              <button onClick={handleBookScroll} className="btn btn-primary btn-sm pulse-button">Book Consultation</button>
            </div>
            
            {/* WhatsApp Icon Button — visible on all devices, aligned inside the navbar */}
            <a href="https://wa.me/918899708659?text=Hello%20Hair%20Haven%2C%20I%20would%20like%20to%20book%20a%20consultation." target="_blank" rel="noopener noreferrer" title="Chat on WhatsApp"
              className="haptic-btn"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: '#25D366',
                boxShadow: '0 4px 12px rgba(37,211,102,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                flexShrink: 0
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="#ffffff">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>

            {/* Admin shortcut — visible only to whitelisted admins on mobile too */}
            {currentUser && isAdminUser(currentUser.email) && (
              <button
                onClick={() => { setCurrentPage('admin'); }}
                title="Admin Panel"
                style={{
                  width: '34px', height: '34px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(128,90,213,0.12), rgba(128,90,213,0.06))',
                  border: '1.5px solid rgba(128,90,213,0.35)',
                  color: 'var(--gemini-purple)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s', flexShrink: 0,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(128,90,213,0.18)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(128,90,213,0.12), rgba(128,90,213,0.06))'; }}
              >
                <Settings size={15} />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Scroll Progress */}
      <div style={{ position:'fixed', top:0, left:0, height:'3px', width:`${scrollProgress}%`, background:'linear-gradient(90deg, var(--green-deep) 0%, var(--green-primary) 60%, #22d3ee 100%)', zIndex:10000, transition:'width 0.1s linear', borderRadius:'0 2px 2px 0', boxShadow:'0 0 8px rgba(11,167,89,0.5)' }} />

      {activeTab === 'home' && (
        <div className="fade-in-tab" style={{ paddingTop: '40px' }}>
          {/* ── HERO ── */}
      <section id="home" className="pt-6 py-24 flex align-center" style={{ minHeight:'90vh', position:'relative' }}>
        <div className="container grid grid-cols-2 align-center gap-12 flex-col-mobile">
          <div className="fade-in-up flex flex-col align-start-desktop align-center-mobile text-center-mobile" style={{ animationDelay:'0.1s', alignSelf:'center', paddingTop:'10px' }}>
            <div className="badge badge-gradient mb-4">
              <Sparkles size={14} style={{ marginRight:'8px', color:'var(--gemini-purple)' }} />
              <InlineEdit
                value={clinicSettings.heroBadge || 'Premium Hair Restoration in Jammu'}
                field="heroBadge"
                isActive={isAdminEditMode}
              >
                {clinicSettings.heroBadge || 'Premium Hair Restoration in Jammu'}
              </InlineEdit>
            </div>
            <h1 className="hero-title mb-6" style={{ minHeight:'2.4em' }}>
              The Art & Science of <br className="mobile-only-block" /><span className="text-gemini-gradient">{displayText}</span><span className="typewriter-cursor"></span>
            </h1>
            <p className="text-lg text-secondary-color mb-8" style={{ lineHeight:'1.7', maxWidth:'540px' }}>
              <InlineEdit
                value={clinicSettings.heroDescription || "Welcome to Hair Haven, Jammu's premier aesthetic surgical center. We combine advanced Follicular Unit Extraction (FUE) graft techniques and growth-factor therapies to craft customized, natural-looking hairlines that restore both density and confidence."}
                field="heroDescription"
                isActive={isAdminEditMode}
                multiline={true}
              />
            </p>
            <div className="flex gap-4 flex-wrap mb-4 justify-center-mobile">
              <button onClick={handleBookScroll} className="btn btn-primary ripple-btn haptic-btn">
                Consult Our Team <ArrowRight size={16} style={{ marginLeft:'8px' }} />
              </button>
              <a href="#calculator" className="btn btn-secondary ripple-btn">Estimate Hair Grafts</a>
            </div>
            {/* Limited slots urgency banner */}
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'24px', padding:'8px 14px', background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.2)', borderRadius:'12px', width:'fit-content' }} className="justify-center-mobile">
              <span style={{ fontSize:'1rem' }}>🔥</span>
              <span style={{ fontSize:'0.8rem', color:'#92400e', fontWeight:700 }}>Only <InlineEdit value={clinicSettings.slotsAvailable ?? slotsCount} field="slotsAvailable" isActive={isAdminEditMode} number={true}><span style={{ color:'#d97706', fontWeight:800 }}>{clinicSettings.slotsAvailable || slotsCount}</span></InlineEdit> free consultation slots left today</span>
            </div>
            <div className="flex gap-8 flex-wrap py-4 justify-center-mobile" style={{ borderTop:'1px solid var(--border-light)', width:'100%' }}>
              <div className="flex align-center gap-3">
                <div style={{ display:'flex', color:'#ffb627' }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#ffb627" color="#ffb627" />)}
                </div>
                <div>
                  <div className="animate-stat-glow" style={{ fontWeight:800, fontSize:'1.1rem' }}>{statsRating || 4.9} / 5 Stars</div>
                  <div style={{ fontSize:'0.8rem', color:'var(--text-tertiary)' }}>{statsReviews || 191}+ Verified Reviews</div>
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
                <HairHavenLogo size={180} logoUrl={clinicSettings.logoUrl || '/logo.png'} isAdminEditMode={isAdminEditMode} />
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
        </div>
      )}

      {/* ── SERVICES ── */}
      {activeTab === 'services' && (
        <div className="fade-in-tab" style={{ paddingTop: '80px' }}>
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
        </div>
      )}

      {/* ── TEAM ── */}
      {activeTab === 'home' && (
        <div className="fade-in-tab">
          <section id="team" className="py-24" style={{ position:'relative' }}>
        <div className="container">
          
          {/* ── FOUNDER PROFILE ── */}
          <div className="mb-20 text-center flex flex-col align-center" style={{ maxWidth: '700px', margin: '0 auto 80px' }}>
            <div style={{ width: '180px', height: '180px', borderRadius: '50%', overflow: 'hidden', border: '4px solid var(--green-primary)', margin: '0 auto 24px', boxShadow: '0 12px 32px rgba(11,167,89,0.15)' }}>
              <img src={clinicSettings.founderImageUrl || '/founder.png'} alt={clinicSettings.founderName || 'Founder'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>{clinicSettings.founderName || "Mr. Harish Kalsotra"}</h3>
            <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--green-primary)', marginBottom: '24px' }}>{clinicSettings.founderRole || "(Founder & Client Relations Executive)"}</p>
            <div style={{ position: 'relative', padding: '0 24px' }}>
              <span style={{ fontSize: '3rem', color: 'var(--border-light)', position: 'absolute', top: '-15px', left: '-10px', fontFamily: 'Georgia, serif', lineHeight: 1 }}>"</span>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: '1.7', position: 'relative', zIndex: 1 }}>
                {clinicSettings.founderQuote || "Dedicated to helping clients regain confidence through advanced hair restoration solutions and personalized care."}
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
        </div>
      )}

      {/* ── GALLERY ── */}
      {activeTab === 'gallery' && (
        <div className="fade-in-tab" style={{ paddingTop: '80px' }}>
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
                    <HairHavenLogo size={70} logoUrl={clinicSettings.logoUrl || '/logo.png'} isAdminEditMode={isAdminEditMode} />
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
                <p style={{ fontSize:'0.85rem', color:'var(--text-secondary)', lineHeight:'1.65' }}>
                  💚 Hair Haven — Premium Hair Restoration &amp; Laser Center<br />
                  📍 606/B, Sector 3, Channi Himmat, Jammu<br />
                  👨‍⚕️ Consultant: Dr. Suby Kakkar (MBBS, MD Dermatology)<br />
                  💉 FUE Hair Transplant | PRP Therapy | Laser Hair Removal<br />
                  🌟 Jammu's Most Trusted Hair Clinic — 4.9★ on Google
                </p>
              </div>

              {/* View Mode Toggle */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
                <span style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--text-secondary)' }}>
                  {galleryViewMode === 'slider' ? '⬅️ Drag to Compare' : `Case ${currentSwiperIndex + 1} / ${swiperImages.length}`}
                </span>
                <button
                  onClick={e => { e.stopPropagation(); setGalleryViewMode(v => v === 'swiper' ? 'slider' : 'swiper'); }}
                  style={{ fontSize:'0.72rem', fontWeight:800, padding:'4px 10px', borderRadius:'8px', border:'1px solid var(--border-light)', background:'var(--surface-card)', color:'var(--text-secondary)', cursor:'pointer' }}
                >
                  {galleryViewMode === 'slider' ? '🖼 Swipe Mode' : '↔ Compare Mode'}
                </button>
              </div>

              {galleryViewMode === 'slider' ? (
                <div
                  ref={sliderRef}
                  className="before-after-slider-container"
                  style={{ marginBottom:'20px', cursor:'ew-resize' }}
                  onMouseDown={e => { e.preventDefault(); setIsDraggingSlider(true); handleSliderMove(e.clientX); }}
                  onTouchStart={e => { setIsDraggingSlider(true); handleSliderMove(e.touches[0].clientX); }}
                >
                  <img src={swiperImages[0] || '/image.png'} alt="Before Treatment" className="before-after-image" style={{ objectFit:'cover' }} />
                  <div style={{ position:'absolute', inset:0, overflow:'hidden', width:`${sliderPosition}%` }}>
                    <img src={swiperImages[Math.min(1, swiperImages.length - 1)] || '/image copy.png'} alt="After Treatment" style={{ position:'absolute', top:0, left:0, width:`${100 / (sliderPosition/100)}%`, height:'100%', objectFit:'cover', maxWidth:'none' }} />
                  </div>
                  <div className="before-after-slider-divider" style={{ left:`calc(${sliderPosition}% - 1.5px)` }}>
                    <div className="before-after-slider-handle">↔</div>
                  </div>
                  <span className="before-after-label before">Before</span>
                  <span className="before-after-label after">After</span>
                </div>
              ) : (
                <>
                  <div style={{ position:'relative', width:'100%', aspectRatio:'4/3', borderRadius:'16px', overflow:'hidden', background:'var(--bg-secondary)', marginBottom:'12px' }}
                    onTouchStart={handleTouchStartSwipe}
                    onTouchEnd={handleTouchEndSwipe}
                  >
                    {swiperImages.map((src, idx) => (
                      <img key={src} src={src} alt={`Patient Transformation ${idx+1}`}
                        style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'contain', padding:'8px', opacity:currentSwiperIndex===idx?1:0, transform:currentSwiperIndex===idx?'scale(1)':'scale(1.02)', transition:'opacity 0.8s ease, transform 0.8s ease' }} />
                    ))}
                    <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)', pointerEvents:'none' }} />
                    <div style={{ position:'absolute', bottom:'16px', left:'16px', right:'16px', color:'#ffffff', textShadow:'0 2px 4px rgba(0,0,0,0.5)' }}>
                      <h3 style={{ fontSize:'0.85rem', fontWeight:800 }}>
                        {dbGallery[currentSwiperIndex]?.caption || `Before & After Case ${currentSwiperIndex+1}`}
                      </h3>
                      <div style={{ fontSize:'0.72rem', opacity:0.88, marginTop:'2px' }}>
                        {dbGallery[currentSwiperIndex]?.category || 'FUE Transplant / PRP Restoration Result'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display:'flex', justifyContent:'center', gap:'6px', marginBottom:'16px' }}>
                    {swiperImages.map((_, idx) => (
                      <button key={idx} onClick={e => { e.stopPropagation(); setCurrentSwiperIndex(idx); }}
                        style={{ width: currentSwiperIndex===idx ? '20px' : '8px', height:'8px', borderRadius:'4px', background:currentSwiperIndex===idx?'var(--green-primary)':'var(--text-tertiary)', opacity:currentSwiperIndex===idx?1:0.4, border:'none', cursor:'pointer', padding:0, transition:'all 0.3s ease' }} />
                    ))}
                  </div>
                </>
              )}

              <button onClick={e => { e.stopPropagation(); window.open('https://instagram.com/hairhaventransplantclinic', '_blank'); }}
                className="btn btn-primary w-100"
                style={{ background:'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)', border:'none', color:'#ffffff', boxShadow:'0 8px 24px rgba(225,48,108,0.25)', fontWeight:800 }}>
                Open Instagram Feed
              </button>
            </div>
          </div>
        </div>
      </section>
        </div>
      )}


      {/* ── REVIEWS ── */}
      {activeTab === 'reviews' && (
        <div className="fade-in-tab" style={{ paddingTop: '80px' }}>
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
                          {review.name.split(' ').map((n: string) => n[0]).join('').substring(0,2).toUpperCase()}
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
        </div>
      )}

      {/* ── MAP ── */}
      {activeTab === 'home' && (
        <div className="fade-in-tab">
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
        </div>
      )}

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
            <div style={{ display:'flex', gap:'16px', fontSize:'0.85rem', alignItems:'center' }}>
              <a href="#services" style={{ color:'var(--text-tertiary)', textDecoration:'none' }} className="nav-link">Privacy Policy</a>
              <a href="#map" style={{ color:'var(--text-tertiary)', textDecoration:'none' }} className="nav-link">Find Us</a>
              <button
                onClick={handleShareClinic}
                style={{ background:'rgba(11,167,89,0.08)', border:'1px solid rgba(11,167,89,0.15)', borderRadius:'10px', padding:'6px 14px', fontSize:'0.82rem', color:'var(--green-deep)', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', transition:'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(11,167,89,0.14)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(11,167,89,0.08)'}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                Share
              </button>
            </div>
          </div>
        </div>
      </footer>
        </div>
      ) : currentPage === 'admin' ? (
        <AdminPanel
          onBack={() => {
            setCurrentPage('home');
            setActiveTab('home');
          }}
          showToast={showToast}
        />
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
          showToast={showToast}
          logoUrl={clinicSettings.logoUrl || '/logo.png'}
        />
      )}

      {/* ── BOTTOM NAVIGATION (Ultra Bar) ── */}
      <nav className="bottom-nav">
        {navTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              className={`bottom-nav-item haptic-btn ${isActive ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span>{tab.label}</span>
              {isActive && <div className="bottom-nav-dot" />}
            </button>
          );
        })}
      </nav>

      {/* Scroll Progress Bar */}
      <div style={{ position:'fixed', top:0, left:0, height:'3px', width:`${scrollProgress}%`, background:'linear-gradient(90deg, var(--green-deep) 0%, var(--green-primary) 60%, #22d3ee 100%)', zIndex:10000, transition:'width 0.1s linear', borderRadius:'0 2px 2px 0', boxShadow:'0 0 8px rgba(11,167,89,0.5)' }} />



      {/* Chatbot FAB + window — bottom RIGHT */}
      <div style={{ position:'fixed', bottom:'95px', right:'20px', zIndex:10005, display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'10px' }}>
        {scrollY > 400 && (
          <button onClick={() => window.scrollTo({ top:0, behavior:'smooth' })} title="Back to top"
            style={{ width:'44px', height:'44px', borderRadius:'50%', background:'var(--surface-card)', border:'1.5px solid var(--border-light)', boxShadow:'0 4px 16px rgba(0,0,0,0.10)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-secondary)' }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6"/></svg>
          </button>
        )}
        <AIChatbot 
          onBookNow={() => { setCurrentPage('consultation'); setActiveTab('consultation'); }} 
          currentUser={currentUser} 
          userMedicalProfile={userMedicalProfile} 
          onProfileUpdate={setUserMedicalProfile}
          chatOpen={chatOpen}
          setChatOpen={setChatOpen}
          showToast={showToast}
          clinicSettings={clinicSettings}
          logoUrl={clinicSettings.logoUrl || '/logo.png'}
          isAdminEditMode={isAdminEditMode}
        />
      </div>



      {/* ── ADMIN PASSCODE MODAL ── */}
      {showPasscodeModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 999999,
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px'
          }}
          onClick={() => { setShowPasscodeModal(false); setPasscodeInput(''); setPasscodeError(false); }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--surface-card)',
              borderRadius: '24px',
              padding: '36px 32px',
              width: '100%', maxWidth: '380px',
              boxShadow: '0 32px 80px rgba(128,90,213,0.2), 0 0 0 1px rgba(128,90,213,0.15)',
              border: '1px solid rgba(128,90,213,0.2)',
              animation: 'fade-in-up 0.25s ease',
              position: 'relative'
            }}
          >
            <button
              onClick={() => { setShowPasscodeModal(false); setPasscodeInput(''); setPasscodeError(false); }}
              style={{ position:'absolute', top:'16px', right:'16px', background:'none', border:'none', cursor:'pointer', color:'var(--text-tertiary)', padding:'4px' }}
            ><X size={18} /></button>

            {/* Lock Icon */}
            <div style={{ width:'60px', height:'60px', borderRadius:'18px', background:'linear-gradient(135deg, rgba(128,90,213,0.15), rgba(168,85,247,0.08))', border:'1px solid rgba(128,90,213,0.25)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', fontSize:'28px' }}>🔐</div>

            <h3 style={{ textAlign:'center', fontWeight:800, fontSize:'1.25rem', color:'var(--text-primary)', marginBottom:'6px' }}>Admin Access</h3>
            <p style={{ textAlign:'center', fontSize:'0.82rem', color:'var(--text-secondary)', marginBottom:'24px' }}>Enter your admin passcode to unlock visual editing controls</p>

            {/* Passcode Dots Input */}
            <div style={{ position:'relative', marginBottom:'14px' }}>
              <input
                type="password"
                value={passcodeInput}
                onChange={e => { setPasscodeInput(e.target.value); setPasscodeError(false); }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    if (passcodeInput === 'waheguru001') {
                      setShowPasscodeModal(false);
                      setPasscodeInput('');
                      setPasscodeError(false);
                      setIsAdminEditMode(true);
                      showToast('🎨 Visual Edit Mode activated! Click any ✎ to edit.', 'success');
                    } else {
                      setPasscodeError(true);
                      setPasscodeShaking(true);
                      setTimeout(() => setPasscodeShaking(false), 600);
                    }
                  }
                }}
                autoFocus
                placeholder="Enter passcode…"
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  fontSize: '1rem',
                  fontFamily: 'monospace',
                  letterSpacing: '0.3em',
                  border: passcodeError ? '2px solid #ef4444' : '1.5px solid rgba(128,90,213,0.3)',
                  borderRadius: '14px',
                  outline: 'none',
                  background: passcodeError ? 'rgba(239,68,68,0.04)' : 'rgba(128,90,213,0.04)',
                  color: 'var(--text-primary)',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  animation: passcodeShaking ? 'shake 0.5s ease' : 'none'
                }}
              />
              {passcodeError && (
                <p style={{ color:'#ef4444', fontSize:'0.75rem', textAlign:'center', marginTop:'8px', fontWeight:600 }}>❌ Incorrect passcode. Please try again.</p>
              )}
            </div>

            <button
              onClick={() => {
                if (passcodeInput === 'waheguru001') {
                  setShowPasscodeModal(false);
                  setPasscodeInput('');
                  setPasscodeError(false);
                  setIsAdminEditMode(true);
                  showToast('🎨 Visual Edit Mode activated! Click any ✎ to edit.', 'success');
                } else {
                  setPasscodeError(true);
                  setPasscodeShaking(true);
                  setTimeout(() => setPasscodeShaking(false), 600);
                }
              }}
              style={{
                width: '100%', padding: '14px',
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                color: '#fff', border: 'none', borderRadius: '14px',
                fontSize: '0.95rem', fontWeight: 800, cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(128,90,213,0.25)',
                transition: 'all 0.2s'
              }}
            >Unlock Admin Editor</button>

            <div style={{ textAlign:'center', marginTop:'16px', fontSize:'0.72rem', color:'var(--text-tertiary)' }}>🛡️ Admin-only access · Hair Haven Clinic</div>
          </div>
        </div>
      )}

      {/* ── ADMIN EDIT TOOLBAR ── */}
      {isAdminEditMode && (
        <div style={{
          position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 99998, display: 'flex', alignItems: 'center', gap: '10px',
          background: 'rgba(30,10,60,0.92)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(168,85,247,0.4)',
          borderRadius: '50px', padding: '10px 18px',
          boxShadow: '0 8px 32px rgba(128,90,213,0.35)',
          animation: 'fade-in-up 0.3s ease'
        }}>
          <span style={{ fontSize:'18px' }}>🎨</span>
          <span style={{ fontSize:'0.8rem', fontWeight:700, color:'#e9d5ff', letterSpacing:'0.03em' }}>Admin Edit Mode</span>
          <span style={{ width:'1px', height:'18px', background:'rgba(255,255,255,0.15)' }} />
          <span style={{ fontSize:'0.72rem', color:'rgba(233,213,255,0.65)' }}>Click ✎ on any text to edit it live</span>
          <span style={{ width:'1px', height:'18px', background:'rgba(255,255,255,0.15)' }} />
          <button
            onClick={() => { setCurrentPage('admin'); }}
            style={{
              padding: '6px 14px', background: 'rgba(128,90,213,0.3)',
              color: '#e9d5ff', border: '1px solid rgba(168,85,247,0.4)',
              borderRadius: '20px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700
            }}
          >⚙️ Full Panel</button>
          <button
            onClick={() => {
              setIsAdminEditMode(false);
              showToast('Edit mode deactivated.', 'info');
            }}
            style={{
              padding: '6px 14px', background: 'rgba(239,68,68,0.15)',
              color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '20px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700
            }}
          >✕ Exit</button>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="toast-container" style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 100050, display: 'flex', flexDirection: 'column', gap: '10px', width: '90%', maxWidth: '380px', pointerEvents: 'none' }}>
        {toasts.map(t => (
          <div key={t.id} className={`toast-card toast-${t.type}`} style={{ pointerEvents: 'auto' }}>
            <div className="toast-content">
              {t.type === 'success' && (
                <svg className="toast-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              )}
              {t.type === 'info' && (
                <svg className="toast-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
              )}
              {t.type === 'warning' && (
                <svg className="toast-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
              )}
              <span className="toast-message">{t.message}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

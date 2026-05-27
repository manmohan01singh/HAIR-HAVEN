import React, { useState, useEffect } from 'react';
import { 
  MapPin, Clock, Shield, Star, CheckCircle2, 
  Sparkles, Menu, X, ArrowRight, 
  ChevronLeft, ChevronRight, Heart, Info, Award, Compass,
  MessageSquare
} from 'lucide-react';
// @ts-ignore
import confetti from 'canvas-confetti';

// Hair Haven Official Logo Component (Circular cropped PNG with premium luxury gold border)
function HairHavenLogo({ className = "", size = 40 }: { className?: string; size?: number }) {
  return (
    <div 
      className={className} 
      style={{ 
        width: `${size}px`, 
        height: `${size}px`, 
        borderRadius: '50%', 
        overflow: 'hidden', 
        border: '1.8px solid var(--gold-light)', 
        display: 'inline-flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: '#ffffff', 
        boxShadow: 'var(--shadow-sm), 0 0 10px rgba(212, 175, 55, 0.1)',
        boxSizing: 'border-box',
        flexShrink: 0
      }}
    >
      <img 
        src="/logo.png" 
        alt="Hair Haven Logo" 
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover',
          display: 'block'
        }} 
      />
    </div>
  );
}

// Types & Interfaces
interface NorwoodStage {
  stage: number;
  name: string;
  description: string;
  grafts: string;
  priceRange: string;
  basePrice: number;
  density: string;
  duration: string;
  recovery: string;
}

interface Testimonial {
  id: number;
  name: string;
  rating: number;
  quote: string;
  tag: string;
}

// Data Sets
const norwoodStages: NorwoodStage[] = [
  {
    stage: 1,
    name: "Minimal Hair Loss",
    description: "No significant hair loss. Healthy hairline. No surgical intervention is recommended at this stage.",
    grafts: "0 Grafts",
    priceRange: "₹0",
    basePrice: 0,
    density: "Optimal",
    duration: "N/A",
    recovery: "N/A"
  },
  {
    stage: 2,
    name: "Minor Receding Temples",
    description: "Slight recession at the temples. Best managed early with growth-factor PRP therapies or preventive care.",
    grafts: "500 - 1,000",
    priceRange: "₹15,000 - ₹20,000",
    basePrice: 15000,
    density: "High",
    duration: "2 - 3 Hours",
    recovery: "3 - 5 Days"
  },
  {
    stage: 3,
    name: "Moderate Temple Recession (V-Shape)",
    description: "Distinct V or M-shaped temple recession. This is the baseline stage for starting a surgical FUE restoration.",
    grafts: "1,200 - 1,800",
    priceRange: "₹30,000 (Base)",
    basePrice: 30000,
    density: "Good",
    duration: "4 - 5 Hours",
    recovery: "7 Days"
  },
  {
    stage: 4,
    name: "Recessed Hairline & Crown Thinning",
    description: "Deep frontal recession plus a distinct thinning spot at the crown (vertex). Requires targeted FUE packing.",
    grafts: "2,000 - 2,800",
    priceRange: "₹35,000 - ₹40,000",
    basePrice: 35000,
    density: "Moderate",
    duration: "5 - 6 Hours",
    recovery: "7 - 10 Days"
  },
  {
    stage: 5,
    name: "Advanced Pattern Hair Loss",
    description: "Recession merges, leaving only a thin bridge separating the hairline and crown. Highly dense graft packing required.",
    grafts: "2,800 - 3,500",
    priceRange: "₹40,000 - ₹45,000",
    basePrice: 40000,
    density: "Moderate",
    duration: "6 - 7 Hours",
    recovery: "10 Days"
  },
  {
    stage: 6,
    name: "Severe Hair Loss (Merged Zones)",
    description: "The separating bridge is gone. Front and back bald zones merge into a single area. Requires full-head reconstruction.",
    grafts: "3,500 - 4,500",
    priceRange: "₹45,000 (Base)",
    basePrice: 45000,
    density: "Requires Evaluation",
    duration: "7 - 8 Hours",
    recovery: "10 - 14 Days"
  },
  {
    stage: 7,
    name: "Extreme Horseshoe Hair Loss",
    description: "Most severe stage. Only a narrow donor band remains at the back and sides. Requires precise, scientific mapping.",
    grafts: "4,500+",
    priceRange: "₹45,000+ (Custom)",
    basePrice: 45000,
    density: "Low Donor Density",
    duration: "8+ Hours (Split sessions)",
    recovery: "14 Days"
  }
];

const services = {
  surgical: [
    {
      title: "FUE Hair Transplant",
      desc: "Follicular Unit Extraction involving extracting individual hair follicles from a donor zone and transplanting them into balding areas under local anesthesia.",
      price: "From ₹30,000",
      features: ["No Linear Scarring", "Local Anesthesia", "Natural Hairline Design", "High Graft Survival Rate"]
    },
    {
      title: "PRP Therapy (Platelet-Rich Plasma)",
      desc: "A non-surgical therapeutic option where a patient's own blood is drawn, spun down to isolate growth-factor-rich platelets, and micro-injected into the scalp to stimulate thinning hair follicles.",
      price: "₹5,000 / session",
      features: ["Non-Surgical", "Autologous Growth Factors", "Minimal Downtime", "Strengthens Thinning Follicles"]
    },
    {
      title: "General Hair Loss Consultations",
      desc: "Complete hair and scalp evaluations to chart out pattern baldness stages and configure customized treatment maps.",
      price: "Free Promotional Offer",
      features: ["Scalp Analysis", "Graft Requirement Mapping", "Medical History Review", "Alopecia Stage Diagnostics"]
    }
  ],
  lasers: [
    {
      title: "Laser Scar Removal",
      desc: "Corrective laser resurfacing to minimize or eliminate deep scars, returning standard dermal texture.",
      price: "Custom Pricing",
      features: ["Precision Laser Tech", "Stimulates Collagen", "Safe & Effective", "Multiple Sessions Available"]
    },
    {
      title: "Laser Mole Removal",
      desc: "Precision aesthetic removal of unwanted dermal moles with advanced cautery and high-frequency lasers.",
      price: "Custom Pricing",
      features: ["Scarless Extraction", "Quick Procedure", "Sterile Equipment", "Minimal Recovery"]
    },
    {
      title: "General Cosmetic Surgery",
      desc: "Minor skin-surface corrections, contouring, and aesthetic micro-procedures.",
      price: "Custom Pricing",
      features: ["Aesthetic Enhancements", "Minimally Invasive", "Daycare Procedures", "Local Anesthesia"]
    }
  ],
  dermatology: [
    {
      title: "Skin Rejuvenation & Facials",
      desc: "Medical-grade therapies targeted at reversing skin dullness, pigment correction, and deep pore cleansing.",
      price: "From ₹2,500",
      features: ["Volumetric Glow", "Deep Cleansing", "Anti-Aging Effect", "Dermatologist Supervised"]
    },
    {
      title: "Skin Allergy Treatments",
      desc: "Diagnostic tracking and alleviation of chronic contact or systemic skin allergies.",
      price: "From ₹1,200",
      features: ["Allergen Identification", "Symptom Alleviation", "Targeted Prescription", "Preventative Counsel"]
    },
    {
      title: "Pre-Surgical Screening",
      desc: "Basic on-site diagnostic metrics such as Blood Sugar Tests to evaluate a patient's immediate safety profile before surgical extractions.",
      price: "Included in Package",
      features: ["Blood Sugar Level Test", "Vital Monitoring", "Medical Safety Approval", "Co-morbidity Assessment"]
    }
  ]
};

const staffMembers = [
  {
    name: "Shazia Mam",
    role: "Clinical Care Specialist",
    specialties: ["FUE Assistance", "OT Preparation", "Patient Prep", "Surgical Support"],
    bio: "Explicitly highlighted across patient logs for providing exemplary clinical care, behavioral warmth, and direct execution/support during hair procedures.",
    avatarPath: "/shazia_avatar.png"
  },
  {
    name: "Rimpy Mam",
    role: "Post-Transplant Care Specialist",
    specialties: ["Graft Checkups", "Wound Dressings", "Patient Recovery Support", "Post-op Counseling"],
    bio: "Frequently named alongside Shazia for her highly professional behavior, gentle handling during recovery check-ups, and post-transplant care.",
    avatarPath: "/rimpy_avatar.png"
  },
  {
    name: "Rajesh",
    role: "Patient Support Lead",
    specialties: ["Consultation Booking", "Logistics Coordination", "Patient Comfort", "Follow-ups"],
    bio: "Noted in medical summaries for exceptional patient-side support and guiding patients comfortably through their hair transplant journeys.",
    avatarPath: "/rajesh_avatar.png"
  }
];

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Kalsotra Aman",
    rating: 5,
    quote: "Excellent treatment, accurate diagnosis. Hair Haven offers excellent customer service and easy booking. The staff provides gentle care.",
    tag: "Easy Booking"
  },
  {
    id: 2,
    name: "Neevad Kumar",
    rating: 5,
    quote: "Easy booking, great customer service. I had an excellent experience with Hair Haven. Booking an appointment was very easy. The customer service was top tier.",
    tag: "Good Supervision"
  },
  {
    id: 3,
    name: "Shubam Sakolia",
    rating: 5,
    quote: "Speedy recovery. I recently visited Hair Haven in Channi Himmat, and I must say, it was a delightful experience! The ambiance is wonderful.",
    tag: "Speedy Recovery"
  },
  {
    id: 4,
    name: "Saleem",
    rating: 5,
    quote: "I am really satisfied with the behaviour of staff members and work, especially Shazia mam and rimpy mam... my results are very good. I'm very happy.",
    tag: "Attentive Care"
  },
  {
    id: 5,
    name: "Sunny",
    rating: 5,
    quote: "Great customer service, subsidies available. I recently underwent a hair transplant treatment here. The staff is very friendly, I'm very happy, thank you team.",
    tag: "Reasonably Priced"
  },
  {
    id: 6,
    name: "Vishwa Nath",
    rating: 5,
    quote: "Clean & hygienic, sterilized equipment. As far as the result is concerned is very good. Hair Haven clinic provided me good facilities and the staff is too good.",
    tag: "Clean & Hygienic"
  },
  {
    id: 7,
    name: "Jannu",
    rating: 5,
    quote: "Reasonably priced, subsidies available. Best clinic in Jammu. 100% result in Hair Haven transplant.",
    tag: "Reasonably Priced"
  }
];

const reviewTags = ["All", "Clean & Hygienic", "Reasonably Priced", "Speedy Recovery", "Easy Booking", "Good Supervision", "Attentive Care"];

const treatments = [
  { value: "FUE Hair Transplant", label: "FUE Hair Transplant", category: "Surgical", desc: "Premium hair restoration with micro-graft extraction", icon: "🏥" },
  { value: "PRP Therapy (Platelet-Rich Plasma)", label: "PRP Therapy", category: "Non-Surgical", desc: "Platelet-rich autologous growth factor treatment", icon: "💉" },
  { value: "Skin Rejuvenation & Facials", label: "Skin Rejuvenation Facials", category: "Dermal Care", desc: "Medical facials and pore cleansing", icon: "✨" },
  { value: "Skin Allergy Consultation", label: "Skin Allergy Consultation", category: "Diagnostics", desc: "Diagnostic testing and allergy relief programs", icon: "🔬" },
  { value: "General Hair Loss Consultation", label: "General Hair Loss Consultation", category: "Diagnostics", desc: "Scalp evaluation and stage mapping", icon: "🔍" }
];

const timeSlots = [
  { value: "10:00 AM", label: "10:00 AM", period: "Morning Slot" },
  { value: "11:30 AM", label: "11:30 AM", period: "Morning Slot" },
  { value: "01:00 PM", label: "01:00 PM", period: "Afternoon Slot" },
  { value: "03:00 PM", label: "03:00 PM", period: "Afternoon Slot" },
  { value: "04:30 PM", label: "04:30 PM", period: "Evening Slot" }
];

export default function App() {
  // Navigation & Menu States
  const [activeSection, setActiveSection] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Graft Calculator States
  const [selectedNorwood, setSelectedNorwood] = useState(3);
  const [includePRPSessions, setIncludePRPSessions] = useState(0); // 0, 1, 3, 5
  const [includeScreening, setIncludeScreening] = useState(true);

  // Reviews States
  const [selectedReviewTag, setSelectedReviewTag] = useState('All');
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  
  // Parallax Scroll State
  const [scrollY, setScrollY] = useState(0);

  // Booking Form States

  const [bookingStep, setBookingStep] = useState(1);

  const handleBookScroll = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const el = document.getElementById('booking');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookService = (serviceValue: string) => {
    setBookingForm(prev => ({ ...prev, service: serviceValue }));
    if (bookingStep === 4) {
      setBookingStep(1);
      setBookingTicket(null);
    }
    const el = document.getElementById('booking');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };
  const [bookingForm, setBookingForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    service: 'FUE Hair Transplant',
    date: '',
    time: '',
    notes: '',
    hadPriorConsultation: 'no',
    bloodSugarCheck: 'no'
  });
  const [bookingTicket, setBookingTicket] = useState<any>(null);

  // SMS Notification States
  const [smsStatus, setSmsStatus] = useState<'idle' | 'sending' | 'success' | 'failed'>('idle');
  const [smsLogs, setSmsLogs] = useState<string[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState<any>(null);

  // Scroll spy & event handling
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sendSMSNotification = async (ticket: any) => {
    setSmsLogs([]);
    setSmsStatus('sending');
    setShowToast(true);
    setToastMessage({
      title: 'Initiating WhatsApp Alert',
      message: `Connecting to secure WhatsApp gateway...`,
      status: 'sending'
    });

    const addLog = (log: string) => {
      setSmsLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${log}`]);
    };

    const ownerPhone = '+918899421483';

    addLog(`Preparing premium notification message...`);
    addLog(`Target Clinic Owner Number: ${ownerPhone}`);

    // Create the premium formatted message body!
    const messageBody = `🌿 *HAIR HAVEN CLINIC ALERT* 🌿
━━━━━━━━━━━━━━━━━━━
🏥 *NEW CLINICAL APPOINTMENT*

👤 *PATIENT DETAILS*
  • *Name:* ${ticket.fullName}
  • *Phone:* ${ticket.phone}
  • *Prior Transplant:* ${ticket.hadPriorConsultation === 'yes' ? 'Yes' : 'No'}

💉 *TREATMENT PROFILE*
  • *Specialty:* ${ticket.service}
  • *Norwood Stage:* Stage ${selectedNorwood}
  • *Grafts Estimated:* ${norwoodStages[selectedNorwood - 1].grafts}

📅 *SCHEDULING*
  • *Date:* ${ticket.date}
  • *Slot:* ${ticket.time || 'Default Slot'}

📋 *CLINICAL SCREENING*
  • *Pre-Surgical Screening:* ${includeScreening ? 'Included (₹999)' : 'Not Included'}
  • *PRP Recovery Sessions:* ${includePRPSessions > 0 ? `${includePRPSessions} Sessions` : 'None'}
  • *On-site Blood Sugar Test:* ${ticket.bloodSugarCheck === 'yes' ? 'Yes' : 'No'}
  • *Case Notes:* ${ticket.notes || 'None'}

💳 *BILLING SUMMARY*
  • *Estimated Cost:* ₹${ticket.priceEstimate.toLocaleString('en-IN')}
  • *Payment Status:* Pay at Clinic

━━━━━━━━━━━━━━━━━━━
✨ *Prepared by Hair Haven Support Team*`;

    setTimeout(() => {
      addLog(`Formulating premium clinical payload...`);
    }, 400);

    setTimeout(() => {
      addLog(`WhatsApp encoded URL compiled successfully.`);
    }, 800);

    setTimeout(() => {
      addLog(`Opening direct WhatsApp link...`);
      setSmsStatus('success');
      setToastMessage({
        title: 'WhatsApp Alert Prepared!',
        message: `Direct WhatsApp message has been successfully generated for owner (+91 88994 21483).`,
        status: 'success'
      });
      
      const encodedText = encodeURIComponent(messageBody);
      const waUrl = `https://wa.me/918899421483?text=${encodedText}`;
      window.open(waUrl, '_blank');
    }, 1200);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate simulated ticket
    const ticketId = 'HH-' + Math.floor(100000 + Math.random() * 900000);
    const completedTicket = {
      id: ticketId,
      ...bookingForm,
      priceEstimate: calculateBookingPrice()
    };
    
    setBookingTicket(completedTicket);
    setBookingStep(4);

    // Send SMS Notification to Owner
    sendSMSNotification(completedTicket);
    
    // Trigger confetti!
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  const calculateBookingPrice = () => {
    // Find matching base service price
    let base = 0;
    if (bookingForm.service === 'FUE Hair Transplant') {
      base = norwoodStages[selectedNorwood - 1].basePrice || 30000;
    } else if (bookingForm.service.includes('PRP')) {
      base = 5000;
    } else if (bookingForm.service.includes('Skin Rejuvenation')) {
      base = 2500;
    } else if (bookingForm.service.includes('Allergy')) {
      base = 1200;
    }
    
    let extra = 0;
    if (bookingForm.service === 'FUE Hair Transplant') {
      extra += includePRPSessions * 5000;
      if (includeScreening) extra += 999;
    }
    return base + extra;
  };

  const currentNorwoodInfo = norwoodStages[selectedNorwood - 1];

  // Filtered reviews
  const filteredTestimonials = selectedReviewTag === 'All'
    ? testimonials
    : testimonials.filter(t => t.tag === selectedReviewTag);

  const handleNextReview = () => {
    setTestimonialIndex((prev) => (prev + 1) % filteredTestimonials.length);
  };

  const handlePrevReview = () => {
    setTestimonialIndex((prev) => (prev - 1 + filteredTestimonials.length) % filteredTestimonials.length);
  };

  // Reset review index when filter changes
  useEffect(() => {
    setTestimonialIndex(0);
  }, [selectedReviewTag]);

  return (
    <>
      {/* Premium Soft Green Orbs with Parallax */}
      <div className="orb-container" style={{ transform: `translateY(${scrollY * 0.1}px)` }}>
        <div className="orb orb-green-1"></div>
        <div className="orb orb-green-2"></div>
      </div>

      {/* Header / Navbar */}
      <nav className={`glass-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container py-4 flex justify-between align-center">
          <a href="#home" className="flex align-center gap-3" style={{ textDecoration: 'none' }}>
            <HairHavenLogo size={42} />
            <div className="flex flex-col">
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                Hair Haven
              </span>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--gemini-purple)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Transplant Clinic
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="flex align-center gap-8" style={{ display: 'none', WebkitBoxAlign: 'center' }}>
            {/* Standard responsive check handled below in inline style */}
          </div>

          <div className="desktop-only-flex">
            <a href="#home" onClick={() => setActiveSection('home')} className={`nav-link ${activeSection === 'home' ? 'active' : ''}`}>Home</a>
            <a href="#services" onClick={() => setActiveSection('services')} className={`nav-link ${activeSection === 'services' ? 'active' : ''}`}>Treatments</a>
            <a href="#calculator" onClick={() => setActiveSection('calculator')} className={`nav-link ${activeSection === 'calculator' ? 'active' : ''}`}>Graft Calculator</a>
            <a href="#team" onClick={() => setActiveSection('team')} className={`nav-link ${activeSection === 'team' ? 'active' : ''}`}>Our Team</a>
            <a href="#reviews" onClick={() => setActiveSection('reviews')} className={`nav-link ${activeSection === 'reviews' ? 'active' : ''}`}>Reviews</a>
            <button onClick={handleBookScroll} className="btn btn-primary btn-sm pulse-button">Book Consultation</button>
          </div>

          {/* Mobile Menu Icon */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-primary)'
            }}
            className="mobile-only-block"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-nav-drawer">
            <a href="#home" onClick={() => { setActiveSection('home'); setMobileMenuOpen(false); }} className={`mobile-nav-link ${activeSection === 'home' ? 'active' : ''}`}>Home</a>
            <a href="#services" onClick={() => { setActiveSection('services'); setMobileMenuOpen(false); }} className={`mobile-nav-link ${activeSection === 'services' ? 'active' : ''}`}>Treatments</a>
            <a href="#calculator" onClick={() => { setActiveSection('calculator'); setMobileMenuOpen(false); }} className={`mobile-nav-link ${activeSection === 'calculator' ? 'active' : ''}`}>Graft Calculator</a>
            <a href="#team" onClick={() => { setActiveSection('team'); setMobileMenuOpen(false); }} className={`mobile-nav-link ${activeSection === 'team' ? 'active' : ''}`}>Our Team</a>
            <a href="#reviews" onClick={() => { setActiveSection('reviews'); setMobileMenuOpen(false); }} className={`mobile-nav-link ${activeSection === 'reviews' ? 'active' : ''}`}>Reviews</a>
            <div className="mobile-nav-divider"></div>
            <button onClick={(e) => { handleBookScroll(e); setMobileMenuOpen(false); }} className="btn btn-primary btn-sm text-center w-100">Book Consultation</button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-20 py-24 flex align-center" style={{ minHeight: '90vh', position: 'relative' }}>
        <div className="container grid grid-cols-2 align-center gap-12 flex-col-mobile">
          <div className="fade-in-up flex flex-col align-start-desktop align-center-mobile text-center-mobile" style={{ animationDelay: '0.1s', alignSelf: 'center', paddingTop: '48px' }}>
            <div className="badge badge-gradient mb-4">
              <Sparkles size={14} className="mr-2" style={{ marginRight: '8px', color: 'var(--gemini-purple)' }} />
              Premium Hair Restoration in Jammu
            </div>
            
            <h1 className="hero-title mb-6">
              The Art & Science of <span className="text-gemini-gradient">Natural Hair</span> Restoration
            </h1>
            
            <p className="text-lg text-secondary-color mb-8" style={{ lineHeight: '1.7', maxWidth: '540px' }}>
              Welcome to <strong>Hair Haven</strong>, Jammu’s premier aesthetic surgical center. 
              We combine advanced Follicular Unit Extraction (FUE) graft techniques and growth-factor therapies 
              to craft customized, natural-looking hairlines that restore both density and confidence.
            </p>

            <div className="flex gap-4 flex-wrap mb-8 justify-center-mobile">
              <button onClick={handleBookScroll} className="btn btn-primary">
                Consult Our Team <ArrowRight size={16} style={{ marginLeft: '8px' }} />
              </button>
              <a href="#calculator" className="btn btn-secondary">
                Estimate Hair Grafts
              </a>
            </div>

            {/* Quick trust metrics */}
            <div className="flex gap-8 flex-wrap py-4 justify-center-mobile" style={{ borderTop: '1px solid var(--border-light)', width: '100%' }}>
              <div className="flex align-center gap-3">
                <div style={{ display: 'flex', color: '#ffb627' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="#ffb627" color="#ffb627" />
                  ))}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>4.8 / 5 Stars</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>191+ Verified Reviews</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(66, 133, 244, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--gemini-blue)'
                }}>
                  <Shield size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>100% Sterile OT</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Certified Safety Standards</div>
                </div>
              </div>
            </div>
          </div>
                        {/* Hero Visual Block with Premium Steady Logo & Interactive Badges */}
          <div className="glass-card p-8 flex flex-col justify-center graphic-pattern fade-in-up" 
               style={{ minHeight: '400px', animationDelay: '0.3s' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(11, 167, 89, 0.03) 0%, rgba(110, 231, 183, 0.03) 100%)',
              borderRadius: '32px',
              padding: '40px',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              marginBottom: '24px',
              boxShadow: '0 24px 50px -12px rgba(11, 167, 89, 0.1)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Subtle tech background grids */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0.15,
                backgroundSize: '20px 20px',
                backgroundImage: 'radial-gradient(rgba(11, 167, 89, 0.3) 1px, transparent 1px)'
              }}></div>
              
              {/* Glowing ring behind logo with active CSS pulse animation */}
              <div className="logo-bg-glow" style={{
                position: 'absolute',
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                background: 'rgba(11, 167, 89, 0.15)',
                zIndex: 0
              }}></div>

              {/* Floating SVG Logo of Hair Haven */}
              <div style={{ 
                zIndex: 1, 
                filter: 'drop-shadow(0 20px 30px rgba(11, 167, 89, 0.15))',
                animation: 'logo-float 4s infinite ease-in-out'
              }}>
                <HairHavenLogo size={180} />
              </div>
            </div>

            {/* Premium details overlay badges */}
            <div className="grid grid-cols-2 gap-4">
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.65)', 
                padding: '16px', 
                borderRadius: '20px', 
                border: '1px solid var(--border-glass)',
                boxShadow: 'var(--shadow-sm)',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Shield size={14} color="#0ba759" />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Safety</span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>100% Sterile OT</div>
              </div>

              <div style={{ 
                background: 'rgba(255, 255, 255, 0.65)', 
                padding: '16px', 
                borderRadius: '20px', 
                border: '1px solid var(--border-glass)',
                boxShadow: 'var(--shadow-sm)',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Sparkles size={14} color="#0ba759" />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Surgical Tech</span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Advanced FUE</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services / Treatments Section */}
      <section id="services" className="py-24" style={{ position: 'relative' }}>
        <div className="container">
          <div className="text-center mb-16">
            <div className="badge badge-gradient mb-3">Our Clinical Offerings</div>
            <h2 className="text-4xl mb-4">Complete Dermal & Hair Services Menu</h2>
            <p className="text-lg text-secondary-color" style={{ maxWidth: '640px', margin: '0 auto' }}>
              From state-of-the-art FUE surgical restoration to advanced dermatological laser procedures, 
              discover treatments managed with surgical precision and detailed patient safety.
            </p>
          </div>

          {/* Tabs / Accordions structured by specialty */}
          <div className="grid grid-cols-3 gap-8 flex-col-mobile">
            
            {/* Surgical Hair Restoration Column */}
            <div className="flex flex-col gap-6">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(66, 133, 244, 0.1)',
                  color: 'var(--gemini-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Award size={20} />
                </div>
                <h3 className="text-xl">Hair Restoration</h3>
              </div>

              {services.surgical.map((srv, idx) => (
                <div 
                  key={idx} 
                  className={`glass-card p-6 flex flex-col justify-between ${srv.title === 'FUE Hair Transplant' ? 'card-vip-gold' : ''}`} 
                  style={{ minHeight: '310px' }}
                >
                  <div>
                    <div className="flex justify-between align-center mb-3">
                      <h4 className="font-semibold text-lg" style={{ paddingRight: srv.title === 'FUE Hair Transplant' ? '90px' : '0px' }}>{srv.title}</h4>
                      <span className="badge" style={{ fontSize: '0.75rem', borderColor: srv.title === 'FUE Hair Transplant' ? 'var(--gold-light)' : 'rgba(66, 133, 244, 0.2)', color: srv.title === 'FUE Hair Transplant' ? 'var(--gold-dark)' : 'var(--gemini-blue)', fontWeight: 700 }}>{srv.price}</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>{srv.desc}</p>
                  </div>
                  
                  <div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                      {srv.features.slice(0, 3).map((feat, fidx) => (
                        <div key={fidx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <CheckCircle2 size={12} color={srv.title === 'FUE Hair Transplant' ? 'var(--gold-dark)' : 'var(--gemini-blue)'} />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                    
                    <button 
                      onClick={() => handleBookService(srv.title === 'PRP Therapy (Platelet-Rich Plasma)' ? 'PRP Therapy (Platelet-Rich Plasma)' : srv.title)}
                      className={`btn w-100 ${srv.title === 'FUE Hair Transplant' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                      style={{ marginTop: 'auto' }}
                    >
                      {srv.title === 'FUE Hair Transplant' ? 'Reserve Transplant Slot' : srv.title.includes('PRP') ? 'Book PRP Session' : 'Book Free Evaluation'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Aesthetic Lasers Column */}
            <div className="flex flex-col gap-6">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(155, 81, 224, 0.1)',
                  color: 'var(--gemini-purple)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Sparkles size={20} />
                </div>
                <h3 className="text-xl">Aesthetic Lasers</h3>
              </div>

              {services.lasers.map((srv, idx) => (
                <div key={idx} className="glass-card p-6 flex flex-col justify-between card-laser-premium" style={{ minHeight: '310px' }}>
                  <div>
                    <div className="flex justify-between align-center mb-3">
                      <h4 className="font-semibold text-lg">{srv.title}</h4>
                      <span className="badge" style={{ fontSize: '0.75rem', borderColor: 'rgba(155, 81, 224, 0.2)', color: 'var(--gemini-purple)', fontWeight: 700 }}>{srv.price}</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>{srv.desc}</p>
                  </div>

                  <div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                      {srv.features.slice(0, 3).map((feat, fidx) => (
                        <div key={fidx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <CheckCircle2 size={12} color="var(--gemini-purple)" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                    
                    <button 
                      onClick={() => handleBookService(srv.title)}
                      className="btn btn-secondary btn-sm w-100"
                    >
                      Book Laser Service
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* General Dermatology Column */}
            <div className="flex flex-col gap-6">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(208, 21, 105, 0.1)',
                  color: 'var(--gemini-pink)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Heart size={20} />
                </div>
                <h3 className="text-xl">Dermatology</h3>
              </div>

              {services.dermatology.map((srv, idx) => (
                <div key={idx} className="glass-card p-6 flex flex-col justify-between card-dermatology-premium" style={{ minHeight: '310px' }}>
                  <div>
                    <div className="flex justify-between align-center mb-3">
                      <h4 className="font-semibold text-lg">{srv.title}</h4>
                      <span className="badge" style={{ fontSize: '0.75rem', borderColor: 'rgba(208, 21, 105, 0.2)', color: 'var(--gemini-pink)', fontWeight: 700 }}>{srv.price}</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>{srv.desc}</p>
                  </div>

                  <div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                      {srv.features.slice(0, 3).map((feat, fidx) => (
                        <div key={fidx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <CheckCircle2 size={12} color="var(--gemini-pink)" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                    
                    <button 
                      onClick={() => handleBookService(srv.title)}
                      className="btn btn-secondary btn-sm w-100"
                    >
                      Book Clinical Treatment
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* Consultation Booking Section (Inline Multi-Step Wizard) */}
      <section id="booking" className="py-24" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Ambient background glow inside section */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '300px',
          height: '300px',
          background: 'rgba(212, 175, 55, 0.08)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          pointerEvents: 'none'
        }}></div>

        <div className="container flex justify-center" style={{ position: 'relative', zIndex: 2 }}>
          <div className="glass-card p-8 flex flex-col gap-6 w-100" 
               style={{ 
                 width: '100%', 
                 maxWidth: '850px', 
                 border: '1.5px solid rgba(212, 175, 55, 0.35)', 
                 background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 252, 249, 0.95) 100%)',
                 boxShadow: 'var(--shadow-xl), 0 0 0 1px rgba(212, 175, 55, 0.1), 0 20px 50px rgba(11, 167, 89, 0.08)'
               }}>
            
            {/* Header */}
            <div className="text-center mb-4">
              <div className="badge badge-gradient mb-3" style={{ background: 'rgba(212, 175, 55, 0.07)', borderColor: 'rgba(212, 175, 55, 0.25)', color: 'var(--gold-dark)', fontWeight: 800 }}>
                ✨ VIP Private Diagnostics & Restoration
              </div>
              <h2 className="text-3xl font-decorative mb-1" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.02em', fontWeight: 800 }}>
                Secure Clinical Appointment
              </h2>
              <p className="text-sm text-secondary-color" style={{ maxWidth: '500px', margin: '0 auto', lineHeight: '1.5' }}>
                Pre-book your diagnostic slot with our clinical care specialists. No waiting queues at Channi Himmat, Jammu.
              </p>
            </div>

            {/* Stepper Wizard Indicator */}
            {bookingStep < 4 && (
              <div className="stepper-premium" style={{ marginBottom: '24px' }}>
                <div className="stepper-line">
                  <div 
                    className="stepper-line-fill" 
                    style={{ width: `${((bookingStep - 1) / 2) * 100}%` }}
                  ></div>
                </div>

                {/* Step 1 */}
                <div 
                  className={`stepper-step ${bookingStep === 1 ? 'active' : ''} ${bookingStep > 1 ? 'completed' : ''}`}
                  onClick={() => bookingStep > 1 && setBookingStep(1)}
                  style={{ cursor: bookingStep > 1 ? 'pointer' : 'default' }}
                >
                  <div className="stepper-circle">
                    {bookingStep > 1 ? '✓' : '1'}
                  </div>
                  <span className="stepper-label">Contact</span>
                </div>

                {/* Step 2 */}
                <div 
                  className={`stepper-step ${bookingStep === 2 ? 'active' : ''} ${bookingStep > 2 ? 'completed' : ''}`}
                  onClick={() => bookingStep > 2 && setBookingStep(2)}
                  style={{ cursor: bookingStep > 2 ? 'pointer' : 'default' }}
                >
                  <div className="stepper-circle">
                    {bookingStep > 2 ? '✓' : '2'}
                  </div>
                  <span className="stepper-label">Treatment</span>
                </div>

                {/* Step 3 */}
                <div 
                  className={`stepper-step ${bookingStep === 3 ? 'active' : ''}`}
                >
                  <div className="stepper-circle">3</div>
                  <span className="stepper-label">Schedule</span>
                </div>
              </div>
            )}

            {/* Step Content */}
            {bookingStep === 1 && (
              <div className="flex flex-col gap-6">
                <div className="form-group-premium">
                  <label className="form-label-premium">Patient Full Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Enter your complete name" 
                    className="form-input-premium" 
                    value={bookingForm.fullName}
                    onChange={(e) => setBookingForm({...bookingForm, fullName: e.target.value})}
                  />
                </div>

                <div className="form-group-premium">
                  <label className="form-label-premium">Contact Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    placeholder="e.g. +91 88994 21483" 
                    className="form-input-premium" 
                    value={bookingForm.phone}
                    onChange={(e) => setBookingForm({...bookingForm, phone: e.target.value})}
                  />
                </div>

                <div className="form-group-premium">
                  <label className="form-label-premium">Email Address (Optional)</label>
                  <input 
                    type="email" 
                    placeholder="e.g. patient@example.com" 
                    className="form-input-premium" 
                    value={bookingForm.email}
                    onChange={(e) => setBookingForm({...bookingForm, email: e.target.value})}
                  />
                </div>

                <button 
                  type="button" 
                  className="btn btn-primary mt-4" 
                  style={{ width: '100%' }}
                  onClick={() => {
                    if (bookingForm.fullName.trim() && bookingForm.phone.trim()) {
                      setBookingStep(2);
                    } else {
                      alert("Please fill out your Name and Phone number before proceeding.");
                    }
                  }}
                >
                  Configure Specialty Treatment <ArrowRight size={16} style={{ marginLeft: '8px' }} />
                </button>
              </div>
            )}

            {bookingStep === 2 && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <label className="form-label-premium">Select Treatment Specialty</label>
                  <div className="flex flex-col gap-3" style={{ maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
                    {treatments.map((t) => (
                      <div 
                        key={t.value}
                        onClick={() => setBookingForm({...bookingForm, service: t.value})}
                        className={`treatment-card-premium ${bookingForm.service === t.value ? 'active' : ''}`}
                      >
                        <span style={{ fontSize: '1.6rem' }}>{t.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div className="flex justify-between align-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{t.label}</span>
                            <span className="badge badge-gradient" style={{ fontSize: '0.65rem', padding: '3px 8px' }}>{t.category}</span>
                          </div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px', textAlign: 'left' }}>{t.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="form-label-premium">Have you had a hair transplant before?</label>
                  <div className="flex gap-4">
                    {['yes', 'no'].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setBookingForm({...bookingForm, hadPriorConsultation: val})}
                        style={{
                          padding: '14px 20px',
                          borderRadius: '12px',
                          border: '2px solid',
                          borderColor: bookingForm.hadPriorConsultation === val ? 'var(--green-primary)' : 'var(--border-light)',
                          background: bookingForm.hadPriorConsultation === val ? 'rgba(11, 167, 89, 0.05)' : '#ffffff',
                          color: bookingForm.hadPriorConsultation === val ? 'var(--green-deep)' : 'var(--text-secondary)',
                          fontWeight: 700,
                          fontSize: '0.88rem',
                          cursor: 'pointer',
                          flex: 1,
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {val === 'yes' ? 'Yes, I Had Prior Transplant' : 'No, This is My First'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <label 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px', 
                      cursor: 'pointer', 
                      fontSize: '0.88rem', 
                      color: 'var(--text-secondary)',
                      background: 'rgba(255, 255, 255, 0.5)',
                      padding: '14px 18px',
                      borderRadius: '16px',
                      border: '1.5px solid var(--border-light)'
                    }} 
                  >
                    <input 
                      type="checkbox" 
                      checked={bookingForm.bloodSugarCheck === 'yes'}
                      onChange={(e) => setBookingForm({...bookingForm, bloodSugarCheck: e.target.checked ? 'yes' : 'no'})}
                      style={{ accentColor: 'var(--green-primary)', width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Include on-site Blood Sugar test (Safety Screening)</span>
                  </label>
                </div>

                <div className="flex gap-4 mt-2">
                  <button type="button" className="btn btn-secondary flex-1" onClick={() => setBookingStep(1)}>
                    Back
                  </button>
                  <button type="button" className="btn btn-primary flex-1" onClick={() => setBookingStep(3)}>
                    Select Slot <ArrowRight size={16} style={{ marginLeft: '8px' }} />
                  </button>
                </div>
              </div>
            )}

            {bookingStep === 3 && (
              <div className="flex flex-col gap-6">
                <div className="form-group-premium">
                  <label className="form-label-premium">Select Appointment Date</label>
                  <input 
                    type="date" 
                    required
                    className="form-input-premium" 
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm({...bookingForm, date: e.target.value})}
                    style={{ fontWeight: 700 }}
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <label className="form-label-premium">Select Preferred Time Slot</label>
                  <div className="grid grid-cols-2 gap-3">
                    {timeSlots.map((ts) => (
                      <div 
                        key={ts.value}
                        onClick={() => setBookingForm({...bookingForm, time: ts.value})}
                        className={`time-slot-card-premium ${bookingForm.time === ts.value ? 'active' : ''}`}
                      >
                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{ts.value}</div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{ts.period}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group-premium">
                  <label className="form-label-premium">Additional Scalp or Care Notes (Optional)</label>
                  <textarea 
                    rows={2} 
                    placeholder="Mention any scalp concerns, skin allergies, medications, or surgical history..." 
                    className="form-input-premium" 
                    style={{ resize: 'none', borderRadius: '16px' }}
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
                  />
                </div>

                <div className="flex gap-4 mt-2">
                  <button type="button" className="btn btn-secondary flex-1" onClick={() => setBookingStep(2)}>
                    Back
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary flex-1"
                    disabled={!bookingForm.date || !bookingForm.time}
                    style={{ opacity: (!bookingForm.date || !bookingForm.time) ? 0.65 : 1 }}
                    onClick={handleBookingSubmit}
                  >
                    Confirm & Generate Pass
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Success Pass */}
            {bookingStep === 4 && bookingTicket && (
              <div className="flex flex-col gap-6 align-center">
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(11, 167, 89, 0.1)',
                  color: 'var(--green-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '4px'
                }}>
                  <CheckCircle2 size={32} />
                </div>

                <h3 className="text-2xl text-center font-decorative" style={{ color: 'var(--green-deep)', fontFamily: 'var(--font-display)', fontWeight: 800, marginTop: '-10px' }}>
                  Diagnostics Scheduled!
                </h3>
                <p className="text-secondary-color text-center" style={{ fontSize: '0.85rem', marginTop: '-12px', lineHeight: '1.5' }}>
                  Your exclusive care pass has been generated. Specialists <strong>Shazia Mam</strong>, <strong>Rimpy Mam</strong>, and support lead <strong>Rajesh</strong> have been alerted of your booking.
                </p>

                {/* Perforated VIP Clinical Pass */}
                <div className="ticket-premium w-100 flex flex-col gap-4" style={{ width: '100%' }}>
                  <div className="ticket-watermark">HAVEN</div>
                  
                  <div className="flex justify-between align-center" style={{ borderBottom: '1px dashed rgba(212, 175, 55, 0.25)', paddingBottom: '14px' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Access ID</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{bookingTicket.id}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Clinic Unit</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 750, color: 'var(--text-primary)' }}>Channi Himmat, Jammu</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4" style={{ fontSize: '0.85rem', zIndex: 2, position: 'relative' }}>
                    <div>
                      <div style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Patient</div>
                      <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>{bookingTicket.fullName}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Diagnostics Map</div>
                      <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>{bookingTicket.service}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Preferred Date</div>
                      <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>{bookingTicket.date}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Time Slot</div>
                      <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>{bookingTicket.time}</div>
                    </div>
                  </div>

                  <div className="ticket-divider-premium"></div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.85rem',
                    zIndex: 2,
                    position: 'relative'
                  }}>
                    <div>
                      <div style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Estimated Pricing</div>
                      <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--green-deep)', marginTop: '2px' }}>
                        ₹{bookingTicket.priceEstimate.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <span className="badge badge-gradient" style={{ fontSize: '0.7rem', borderColor: 'rgba(212, 175, 55, 0.3)', color: 'var(--gold-dark)', background: 'rgba(212, 175, 55, 0.05)', fontWeight: 700 }}>
                      Pay at Clinic
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 w-100 mt-2" style={{ width: '100%' }}>
                  <div className="flex gap-3 w-100">
                    <button 
                      type="button" 
                      className="btn btn-secondary flex-1" 
                      style={{ padding: '12px' }}
                      onClick={() => {
                        setBookingStep(1);
                        setBookingForm({
                          fullName: '',
                          phone: '',
                          email: '',
                          service: 'FUE Hair Transplant',
                          date: '',
                          time: '',
                          notes: '',
                          hadPriorConsultation: 'no',
                          bloodSugarCheck: 'no'
                        });
                        setBookingTicket(null);
                      }}
                    >
                      Book Another Slot
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary flex-1"
                      style={{ padding: '12px' }}
                      onClick={() => window.print()}
                    >
                      Print Pass
                    </button>
                  </div>

                  <button 
                    type="button"
                    className="btn btn-primary w-100 flex align-center justify-center gap-2 pulse-button"
                    style={{
                      background: '#25d366',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 8px 24px rgba(37, 211, 102, 0.3)',
                      padding: '14px 20px',
                      fontSize: '1rem',
                      fontWeight: 800
                    }}
                    onClick={() => {
                      const ownerPhone = '918899421483';
                      const messageBody = `🌿 *HAIR HAVEN CLINIC - SECURE RESERVATION* 🌿
━━━━━━━━━━━━━━━━━━━━━━━━━━
🏥 *NEW CLINICAL APPOINTMENT REGISTERED*

👤 *PATIENT PROFILE*
  • *Full Name:* ${bookingTicket.fullName}
  • *Phone Number:* ${bookingTicket.phone}
  • *Email Address:* ${bookingTicket.email || 'Not Provided'}
  • *Prior Hair Transplant:* ${bookingTicket.hadPriorConsultation === 'yes' ? 'Yes (Requires Special Donor Analysis)' : 'No (First-time Restorative Treatment)'}

💉 *TREATMENT DESIGN*
  • *Selected Specialty:* ${bookingTicket.service}
  • *Norwood Baldness Stage:* Stage ${selectedNorwood}
  • *Estimated Graft Requirement:* ${norwoodStages[selectedNorwood - 1].grafts} Grafts
  • *Donor Density Expectation:* ${norwoodStages[selectedNorwood - 1].density}

📅 *SCHEDULING SUMMARY*
  • *Preferred Date:* ${bookingTicket.date}
  • *Preferred Time Slot:* ${bookingTicket.time}
  • *Allocated Care Coordinator:* Rajesh (Patient Support Lead)

📋 *CLINICAL CHECKLIST & RECOVERY*
  • *Pre-Surgical Screening:* ${includeScreening ? 'Yes - Complete Diagnostic Package (₹999)' : 'No - Scalp-Only Evaluation'}
  • *PRP Healing Sessions:* ${includePRPSessions > 0 ? `${includePRPSessions} Sessions Included (+₹${(includePRPSessions * 5000).toLocaleString('en-IN')})` : 'None Selected'}
  • *On-site Blood Sugar Test:* ${bookingTicket.bloodSugarCheck === 'yes' ? 'Yes (Mandatory Safety Screening)' : 'No'}
  • *Clinical Case Notes:* ${bookingTicket.notes || 'None provided by patient'}

💳 *ESTIMATED FINANCIALS*
  • *Base Treatment Cost:* ₹${norwoodStages[selectedNorwood - 1].basePrice.toLocaleString('en-IN')}
  • *Total Estimate (incl. add-ons):* ₹${bookingTicket.priceEstimate.toLocaleString('en-IN')}
  • *Payment Terms:* Pay at Clinic (Cash / UPI / Cards)

━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ *System Alert: Please reach out to the patient within 2 hours to confirm their clinical slot.*`;
                      const encodedText = encodeURIComponent(messageBody);
                      const waUrl = `https://wa.me/${ownerPhone}?text=${encodedText}`;
                      window.open(waUrl, '_blank');
                    }}
                  >
                    <MessageSquare size={18} style={{ marginRight: '6px' }} />
                    <span>Confirm & Alert Owner via WhatsApp</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* Norwood scale Interactive Graft & Cost Calculator */}
      <section id="calculator" className="py-24 bg-secondary-color" style={{ background: 'rgba(248, 250, 252, 0.4)', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          <div className="text-center mb-16">
            <div className="badge badge-gradient mb-3">Surgical Planning Tool</div>
            <h2 className="text-4xl mb-4">Interactive Norwood Graft Estimator</h2>
            <p className="text-lg text-secondary-color" style={{ maxWidth: '640px', margin: '0 auto' }}>
              Slide the index to select your current hair loss stage based on the standard Norwood scale, 
              and review estimated graft metrics, clinical timings, and direct pricing guides.
            </p>
          </div>

          <div className="grid grid-cols-12 gap-8 flex-col-mobile align-center">
            
            {/* Left Column: Interactive Slider and Details */}
            <div className="glass-card p-8 col-span-7 flex flex-col gap-6">
              <div className="flex justify-between align-center mb-2">
                <span className="font-semibold" style={{ fontSize: '1.1rem' }}>Norwood Scale Selection:</span>
                <span style={{
                  fontSize: '1.75rem',
                  fontWeight: 600,
                  color: 'var(--gemini-purple)',
                  fontFamily: 'var(--font-display)'
                }}>
                  Stage {selectedNorwood}
                </span>
              </div>

              {/* iOS Style Grid Cards Selection */}
              <div className="norwood-grid mb-6">
                {norwoodStages.map((stageInfo) => (
                  <div
                    key={stageInfo.stage}
                    onClick={() => setSelectedNorwood(stageInfo.stage)}
                    className={`norwood-card ${selectedNorwood === stageInfo.stage ? 'active' : ''}`}
                  >
                    <span className="norwood-number">N{stageInfo.stage}</span>
                    <span className="norwood-label">
                      {stageInfo.stage === 1 ? 'Normal' : stageInfo.stage === 3 ? 'FUE' : stageInfo.stage === 6 ? 'Full' : `Stage ${stageInfo.stage}`}
                    </span>
                  </div>
                ))}
              </div>

              {/* Synchronized Slider Indicator */}
              <div className="mb-4" style={{ padding: '0 8px' }}>
                <input 
                  type="range" 
                  min="1" 
                  max="7" 
                  value={selectedNorwood}
                  onChange={(e) => setSelectedNorwood(parseInt(e.target.value))}
                  className="norwood-slider"
                />
              </div>

              {/* Details of Stage */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.02)',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid var(--border-light)'
              }}>
                <h4 className="font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>{currentNorwoodInfo.name}</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{currentNorwoodInfo.description}</p>
              </div>

              {/* Grid of stats */}
              <div className="grid grid-cols-2 gap-4">
                <div style={{ background: '#ffffff', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Estimated Grafts Needed</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--gemini-blue)', marginTop: '4px' }}>
                    {currentNorwoodInfo.grafts}
                  </div>
                </div>

                <div style={{ background: '#ffffff', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Donor Density Expectation</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--gemini-purple)', marginTop: '4px' }}>
                    {currentNorwoodInfo.density}
                  </div>
                </div>

                <div style={{ background: '#ffffff', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Procedure Duration</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                    {currentNorwoodInfo.duration}
                  </div>
                </div>

                <div style={{ background: '#ffffff', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Typical Recovery Timeline</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                    {currentNorwoodInfo.recovery}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Pricing Estimates & Dynamic Add-ons */}
            <div className="glass-card p-8 col-span-5 flex flex-col justify-between" style={{ minHeight: '450px' }}>
              <div>
                <h3 className="text-2xl mb-6">Procedural Billing Estimate</h3>
                
                {/* Cost Panel */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(66, 133, 244, 0.03) 0%, rgba(155, 81, 224, 0.03) 100%)',
                  borderRadius: '20px',
                  padding: '24px',
                  border: '1px solid rgba(155, 81, 224, 0.1)',
                  marginBottom: '24px',
                  textAlign: 'center'
                }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Estimated Cost</span>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: '8px 0' }}>
                    {currentNorwoodInfo.stage === 1 ? '₹0' : `₹${calculateBookingPrice().toLocaleString('en-IN')}`}
                  </div>
                  <span className="badge badge-gradient" style={{ fontSize: '0.75rem' }}>
                    {currentNorwoodInfo.stage === 1 ? 'No Treatment Needed' : 'Estimated Base Price'}
                  </span>
                </div>

                {/* Interactive Additions Selector */}
                {currentNorwoodInfo.stage > 1 && (
                  <div className="flex flex-col gap-4">
                    <h4 className="font-semibold text-secondary-color" style={{ fontSize: '0.9rem' }}>Tailor Your Care Package:</h4>
                    
                    {/* PRP session add-ons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Include PRP Recovery Sessions:</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[0, 1, 3, 5].map((sessionCount) => (
                          <button
                            key={sessionCount}
                            onClick={() => setIncludePRPSessions(sessionCount)}
                            style={{
                              padding: '8px',
                              borderRadius: '10px',
                              border: '1px solid',
                              borderColor: includePRPSessions === sessionCount ? 'var(--gemini-purple)' : 'var(--border-light)',
                              background: includePRPSessions === sessionCount ? 'rgba(155, 81, 224, 0.05)' : '#ffffff',
                              color: includePRPSessions === sessionCount ? 'var(--gemini-purple)' : 'var(--text-secondary)',
                              fontWeight: 600,
                              fontSize: '0.8rem',
                              cursor: 'pointer'
                            }}
                          >
                            {sessionCount === 0 ? 'None' : `${sessionCount}x`}
                          </button>
                        ))}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>PRP accelerates healing and strengthens donor follicle retention (+₹5,000/session)</span>
                    </div>

                    {/* Pre-surgical screening checklist */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)' }} className="mt-2">
                      <input 
                        type="checkbox" 
                        checked={includeScreening}
                        onChange={(e) => setIncludeScreening(e.target.checked)}
                        style={{ accentColor: 'var(--gemini-purple)', width: '16px', height: '16px' }}
                      />
                      <span>Include Pre-Surgical Screening Package (₹999)</span>
                    </label>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginLeft: '26px', marginTop: '-8px' }}>Required on-site check (Blood sugar, coagulation markers, diagnostics)</span>
                  </div>
                )}
              </div>

              {currentNorwoodInfo.stage > 1 ? (
                <button 
                  onClick={() => handleBookService('FUE Hair Transplant')}
                  className="btn btn-primary w-100 mt-6" 
                  style={{ width: '100%', marginTop: '24px' }}
                >
                  Pre-Book This Estimation <ArrowRight size={16} style={{ marginLeft: '8px' }} />
                </button>
              ) : (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', textAlign: 'center', marginTop: '24px' }}>
                  No restoration is required. Reach out for minor dermal diagnostics or facials.
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Clinical Team / Staff Highlight */}
      <section id="team" className="py-24" style={{ position: 'relative' }}>
        <div className="container">
          <div className="text-center mb-16">
            <div className="badge badge-gradient mb-3">Our Dedicated Staff</div>
            <h2 className="text-4xl mb-4">Meet Our Clinical Support Team</h2>
            <p className="text-lg text-secondary-color" style={{ maxWidth: '640px', margin: '0 auto' }}>
              Surgical outcomes require exceptional post-operative support. Meet our key clinical and support 
              specialists, highly praised by our patients for detailed care and warm handling.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8 flex-col-mobile">
            {staffMembers.map((member, idx) => (
              <div key={idx} className="glass-card p-6 flex flex-col align-center text-center">
                
                {/* Premium iOS-level Circular Image Frame */}
                <div className="profile-image-container">
                  <img 
                    src={member.avatarPath} 
                    alt={member.name} 
                    className="profile-image" 
                  />
                </div>

                <h3 className="text-xl mb-1">{member.name}</h3>
                <span className="badge mb-4" style={{ borderColor: 'rgba(155, 81, 224, 0.15)', color: 'var(--gemini-purple)', fontSize: '0.75rem' }}>
                  {member.role}
                </span>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '20px', minHeight: '80px' }}>
                  "{member.bio}"
                </p>

                {/* Specialties tags */}
                <div className="flex gap-2 justify-center flex-wrap">
                  {member.specialties.map((spec, sidx) => (
                    <span key={sidx} style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: 'rgba(15, 23, 42, 0.03)',
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-light)'
                    }}>
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quality Standards & Transparency Section (Address comments on junior assistants and pricing in a professional manner) */}
          <div className="glass-card p-8 mt-12 grid grid-cols-12 gap-8 flex-col-mobile align-center" style={{ marginTop: '48px' }}>
            <div className="col-span-4" style={{ textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                background: 'rgba(66, 133, 244, 0.1)',
                color: 'var(--gemini-blue)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <Shield size={28} />
              </div>
              <h3 className="text-xl">Safety & Integrity</h3>
            </div>
            
            <div className="col-span-8 no-border-left-mobile" style={{ borderLeft: '1px solid var(--border-light)', paddingLeft: '32px' }}>
              <h4 className="font-semibold text-lg mb-2">Our Clinical Standards & Oversight</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }} className="mb-4">
                At Hair Haven, all surgical designs, graft counts, and donor incisions are mapped and executed 
                under the direct, on-site supervision of certified hair restoration surgeons and medical consultants. 
                Our support technicians are rigorously trained in highly sterilized FUE extraction methods and post-transplant care.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--gemini-purple)', fontWeight: 600 }}>
                <CheckCircle2 size={14} />
                <span>Routine pre-surgical screenings, including blood glucose checking, are standard protocol.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Patient Reviews & Ratings Explorer */}
      <section id="reviews" className="py-24 bg-secondary-color" style={{ background: 'rgba(248, 250, 252, 0.3)', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          
          <div className="grid grid-cols-12 gap-8 flex-col-mobile mb-16 align-center">
            <div className="col-span-5">
              <div className="badge badge-gradient mb-3">Patient Testimonials</div>
              <h2 className="text-4xl mb-4">What Our Clients Say</h2>
              <p className="text-lg text-secondary-color" style={{ lineHeight: '1.6' }}>
                With a **4.8/5 Star aggregate web rating** based on **191 verified client reviews**, 
                explore direct patient feedback detailing our clinic.
              </p>
            </div>

            {/* Ratings Summary Card */}
            <div className="col-span-7 flex justify-center">
              <div className="glass-card p-6 flex align-center gap-6" style={{ width: '100%', maxWidth: '480px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: '1' }}>4.8</div>
                  <div style={{ display: 'flex', color: '#ffb627', margin: '8px 0', justifyContent: 'center' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="#ffb627" color="#ffb627" />
                    ))}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>191 Reviews</div>
                </div>

                <div className="flex-1 flex flex-col gap-2" style={{ borderLeft: '1px solid var(--border-light)', paddingLeft: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 500 }}>
                    <span className="text-secondary-color">Clean & Sterile</span>
                    <span className="font-semibold">9 Mentions</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 500 }}>
                    <span className="text-secondary-color">Reasonably Priced</span>
                    <span className="font-semibold">6 Mentions</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 500 }}>
                    <span className="text-secondary-color">Speedy Recovery</span>
                    <span className="font-semibold">6 Mentions</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 500 }}>
                    <span className="text-secondary-color">Easy Booking</span>
                    <span className="font-semibold">5 Mentions</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Review Filter Tabs */}
          <div className="flex gap-3 flex-wrap mb-10 justify-center">
            {reviewTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedReviewTag(tag)}
                className={`filter-pill ${selectedReviewTag === tag ? 'active' : ''}`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Testimonial Slider */}
          <div className="flex justify-center">
            {filteredTestimonials.length > 0 ? (
              <div className="glass-card p-8 flex flex-col justify-between" style={{ width: '100%', maxWidth: '640px', minHeight: '260px', position: 'relative' }}>
                
                {/* Quotation mark decoration */}
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  right: '30px',
                  fontSize: '5rem',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  color: 'rgba(155, 81, 224, 0.05)',
                  lineHeight: '1',
                  pointerEvents: 'none'
                }}>
                  ”
                </div>

                <div>
                  <div className="flex justify-between align-center mb-4">
                    <span className="font-semibold" style={{ fontSize: '1.1rem' }}>{filteredTestimonials[testimonialIndex].name}</span>
                    <div style={{ display: 'flex', color: '#ffb627' }}>
                      {[...Array(filteredTestimonials[testimonialIndex].rating)].map((_, i) => (
                        <Star key={i} size={14} fill="#ffb627" color="#ffb627" />
                      ))}
                    </div>
                  </div>

                  <p style={{
                    fontSize: '1.05rem',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.7',
                    fontStyle: 'italic',
                    marginBottom: '24px'
                  }}>
                    "{filteredTestimonials[testimonialIndex].quote}"
                  </p>
                </div>

                <div className="flex justify-between align-center" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                  <span className="badge badge-gradient" style={{ fontSize: '0.75rem' }}>
                    Category: {filteredTestimonials[testimonialIndex].tag}
                  </span>

                  <div className="flex gap-2">
                    <button 
                      onClick={handlePrevReview}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        border: '1px solid var(--border-light)',
                        background: '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button 
                      onClick={handleNextReview}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        border: '1px solid var(--border-light)',
                        background: '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                No reviews found under the selected category. Please choose another tag.
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Interactive Google Map & Direct Navigation Section */}
      <section id="map" className="py-24 map-section">
        <div className="container">
          <div className="text-center mb-16">
            <div className="badge badge-gradient mb-3">📍 Visit Our Clinic</div>
            <h2 className="text-4xl mb-4">Location & Direct Navigation</h2>
            <p className="text-lg text-secondary-color" style={{ maxWidth: '640px', margin: '0 auto' }}>
              We are located in the heart of Jammu at Channi Himmat. Click on the map to start GPS navigation directly on your device.
            </p>
          </div>

          <div className="map-wrapper">
            {/* Embedded Google Map centered at Channi Himmat, Jammu */}
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3356.5684347712395!2d74.8765251!3d32.7059000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391e84eb00000001%3A0x6b8eb6a7c36a8e8b!2sChanni%20Himmat%2C%20Jammu!5e0!3m2!1sen!2sin!4v1716000000000!5m2!1sen!2sin"
              className="map-iframe"
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Hair Haven Location Map"
            ></iframe>

            {/* GPS Directions Overlay Card */}
            <div className="map-directions-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <MapPin size={18} color="var(--gold-dark)" />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>Clinic Landmark</span>
              </div>
              <h3 className="text-xl mb-4" style={{ fontWeight: 800 }}>Hair Haven Clinic</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '20px' }}>
                606/B, Sector 3, Channi Himmat, Jammu.<br />
                <span style={{ fontStyle: 'italic', fontSize: '0.85rem' }}>Opposite Kashmir Flavours Restaurant</span>
              </p>
              
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px', marginBottom: '24px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <strong>Hours:</strong> 10:00 AM - 06:00 PM (Daily)
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <strong>Parking:</strong> Free On-Site Parking Available
                </div>
              </div>

              <button 
                onClick={() => window.open('https://www.google.com/maps/dir/?api=1&destination=Channi+Himmat+Jammu', '_blank')}
                className="btn btn-primary w-100 flex align-center justify-center gap-2 pulse-button"
                style={{
                  background: 'linear-gradient(135deg, var(--green-deep) 0%, var(--green-primary) 100%)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  boxShadow: '0 8px 24px rgba(11, 167, 89, 0.25)',
                  padding: '14px 20px',
                  fontWeight: 800
                }}
              >
                <Compass size={18} />
                <span>Start GPS Navigation</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer & Contact Details / Maps & Logistics */}
      <footer style={{
        background: '#ffffff',
        borderTop: '1px solid var(--border-light)',
        position: 'relative',
        zIndex: 5
      }} className="py-16">
        <div className="container">
          <div className="grid grid-cols-3 gap-8 flex-col-mobile mb-12">
            
            {/* Address & Landmark */}
            <div className="flex flex-col gap-4">
              <h4 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>Clinic Location</h4>
              <div className="flex align-center gap-3">
                <MapPin size={20} color="var(--gemini-purple)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  606/B, Sector 3, Channi Himmat,<br />
                  Jammu - 180015, Jammu and Kashmir
                </span>
              </div>
              <div className="flex align-center gap-3">
                <Info size={16} color="var(--gemini-blue)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  Landmark: Directly opposite / near **Kashmir Flavours Restaurant**
                </span>
              </div>
            </div>

            {/* Timings & Opening Hours */}
            <div className="flex flex-col gap-4">
              <h4 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>Operational Hours</h4>
              <div className="flex align-center gap-3">
                <Clock size={20} color="var(--gemini-blue)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Monday - Sunday: 10:00 AM – 06:00 PM
                </span>
              </div>
              <span className="badge badge-gradient" style={{ fontSize: '0.75rem', width: 'fit-content' }}>
                Open 7 Days a Week
              </span>
            </div>

            {/* Parking & Transit */}
            <div className="flex flex-col gap-4">
              <h4 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>Transit & Parking</h4>
              <div className="flex align-center gap-3">
                <Compass size={20} color="var(--gemini-pink)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Easily accessible via local public transport, buses, e-rickshaws, and private cabs.
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <CheckCircle2 size={14} color="var(--gemini-blue)" />
                <span>Hassle-free roadside & dedicated customer parking.</span>
              </div>
            </div>

          </div>

          {/* Bottom Copyright & Tech Info */}
          <div style={{
            borderTop: '1px solid var(--border-light)',
            paddingTop: '32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }} className="flex-col-mobile gap-4 text-center">
            <div>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>Hair Haven</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}> © {new Date().getFullYear()} Transplant Clinic. All rights reserved.</span>
            </div>

            <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem' }}>
              <a href="#services" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }} className="nav-link">Privacy Policy</a>
              <a href="#booking" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }} className="nav-link">Clinical Standards</a>
            </div>
          </div>
        </div>
      </footer>





      {/* Simulated SMS Status Toast */}
      {showToast && toastMessage && (
        <div className={`sms-toast ${showToast ? 'active' : ''} status-${smsStatus}`}>
          <div className="flex justify-between align-center mb-3">
            <div className="flex align-center gap-2">
              <MessageSquare size={16} style={{ color: toastMessage.status === 'success' ? 'var(--green-mid)' : toastMessage.status === 'failed' ? '#ef4444' : 'var(--green-soft)' }} />
              <span style={{ fontWeight: 800, fontSize: '0.9rem', marginRight: '6px' }}>{toastMessage.title}</span>
              <span style={{
                fontSize: '0.6rem',
                padding: '2px 6px',
                borderRadius: '4px',
                background: smsStatus === 'success' ? 'rgba(52,168,83,0.2)' : smsStatus === 'failed' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.15)',
                color: smsStatus === 'success' ? '#6ee7b7' : smsStatus === 'failed' ? '#fca5a5' : '#e2e8f0',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '0.05em'
              }}>
                {smsStatus}
              </span>
            </div>
            <button 
              onClick={() => setShowToast(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={14} />
            </button>
          </div>
          
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '12px', lineHeight: '1.4' }}>
            {toastMessage.message}
          </p>

          {/* Console logs drawer */}
          <div className="sms-log-container">
            {smsLogs.length > 0 ? (
              smsLogs.map((log, lidx) => (
                <div key={lidx} style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#6ee7b7', margin: '2px 0' }}>
                  {log}
                </div>
              ))
            ) : (
              <div style={{ color: '#64748b', fontSize: '0.7rem', fontFamily: 'monospace' }}>No logs initialized...</div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import { 
  MapPin, Clock, Shield, Star, CheckCircle2, 
  Sparkles, Menu, X, ArrowRight, 
  Heart, Info, Award, Compass,
  MessageSquare, Search, SlidersHorizontal,
  Sun, Moon
} from 'lucide-react';
// @ts-ignore
import confetti from 'canvas-confetti';

// Hair Haven Official Logo Component (Circular cropped PNG with premium clinic brand green border)
function HairHavenLogo({ className = "", size = 40 }: { className?: string; size?: number }) {
  return (
    <div 
      className={className} 
      style={{ 
        width: `${size}px`, 
        height: `${size}px`, 
        borderRadius: '50%', 
        overflow: 'hidden', 
        border: '1.8px solid var(--green-primary)', 
        display: 'inline-flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'var(--surface-card)', 
        boxShadow: 'var(--shadow-sm)',
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

// Interactive Scalp Vector SVG Visuals for Norwood Stages 1-7
function NorwoodStageVisual({ stage }: { stage: number }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '12px' }}>
      <img 
        src={`/norwood${stage}.png`} 
        alt={`Norwood Stage ${stage}`} 
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} 
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
  date?: string;
  daysAgo?: number;
}

// Data Sets
const norwoodStages: NorwoodStage[] = [
  {
    stage: 1,
    name: "Minimal Hair Loss (Stage 1)",
    description: "Optimal hair density. Full, healthy hairline with no active recession. No surgical restoration needed.",
    grafts: "0 Grafts",
    priceRange: "₹0",
    basePrice: 0,
    density: "Optimal",
    duration: "N/A",
    recovery: "N/A"
  },
  {
    stage: 2,
    name: "Minor Receding Temples (Stage 2)",
    description: "Slight recession at the temples. Perfect stage for preventive care or growth PRP sessions to stop further thinning.",
    grafts: "500 - 1,000",
    priceRange: "₹21,000 - ₹25,000",
    basePrice: 21000,
    density: "High",
    duration: "2 - 3 Hours",
    recovery: "3 - 5 Days"
  },
  {
    stage: 3,
    name: "M-Shaped Receding hairline (Stage 3)",
    description: "Clear M or V-shaped temple recession. This is the baseline stage for starting a successful FUE hairline restoration.",
    grafts: "1,200 - 1,800",
    priceRange: "₹30,000 (Base)",
    basePrice: 30000,
    density: "Good",
    duration: "4 - 5 Hours",
    recovery: "7 Days"
  },
  {
    stage: 4,
    name: "Receding Front & Crown Thinning (Stage 4)",
    description: "Deep frontal recession combined with a distinct thinning spot at the crown (vertex). Requires targeted FUE packing.",
    grafts: "2,000 - 2,800",
    priceRange: "₹35,000 - ₹40,000",
    basePrice: 35000,
    density: "Moderate",
    duration: "5 - 6 Hours",
    recovery: "7 - 10 Days"
  },
  {
    stage: 5,
    name: "Advanced Hair Loss (Stage 5)",
    description: "Frontal balding and crown bald zones are separated by only a very narrow bridge of hair. Dense graft packing required.",
    grafts: "2,800 - 3,500",
    priceRange: "₹40,000 - ₹45,000",
    basePrice: 40000,
    density: "Moderate",
    duration: "6 - 7 Hours",
    recovery: "10 Days"
  },
  {
    stage: 6,
    name: "Severe Hair Loss / Merged Zones (Stage 6)",
    description: "The dividing bridge of hair is completely gone. Front and back bald areas merge. Requires extensive full-head reconstruction.",
    grafts: "3,500 - 4,500",
    priceRange: "₹45,000 (Base)",
    basePrice: 45000,
    density: "Requires Evaluation",
    duration: "7 - 8 Hours",
    recovery: "10 - 14 Days"
  },
  {
    stage: 7,
    name: "Extreme Balding / Horseshoe (Stage 7)",
    description: "Most severe hair loss. Only a narrow strip of hair remains around the sides and back. Requires precise scientific mapping.",
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
      desc: "In this modern technique, healthy hair grafts are carefully taken from the donor area and implanted into bald areas. It is minimally invasive, leaves no major scars, provides natural-looking density, and has a faster recovery time.",
      price: "From ₹21,000",
      features: ["Minimally Invasive", "No Major Scars", "Natural Density", "Fast Recovery Time"]
    },
    {
      title: "BioSapphire FUE Technique",
      desc: "An advanced FUE hair transplant variant utilizing precise sapphire blades instead of steel to create micro-channels. This ensures superior graft placement, higher density, accelerated healing, and extremely natural results.",
      price: "From ₹31,000",
      features: ["Advanced FUE Variant", "Precise Sapphire Micro-Channels", "Superior Graft Density", "Rapid Scalp Healing"]
    }
  ],
  lasers: [
    {
      title: "PRP Therapy (Platelet Rich Plasma)",
      desc: "A non-surgical hair treatment in which the patient’s own plasma is injected into the scalp to strengthen hair roots, reduce hair fall, improve blood circulation, and stimulate natural hair growth.",
      price: "₹2,000 / session",
      features: ["Non-Surgical Option", "Strengthens Hair Roots", "Reduces Hair Fall", "Stimulates Hair Growth"]
    },
    {
      title: "GFC Therapy (Growth Factor Concentrate)",
      desc: "An advanced regenerative treatment that uses concentrated growth factors from the patient’s blood to nourish hair follicles, improve hair thickness, control hair fall, and promote healthier hair growth.",
      price: "₹4,500 / session",
      features: ["Advanced Regenerative", "Nourishes Follicles", "Improves Thickness", "Promotes Healthier Growth"]
    }
  ],
  dermatology: [
    {
      title: "Beard Transplant",
      desc: "A specialized procedure for men who want a fuller and well-shaped beard. Hair grafts are implanted carefully to give a dense, natural, and permanent beard look.",
      price: "Custom Pricing",
      features: ["Fuller Beard Look", "Careful Implanting", "Dense & Natural", "Permanent Growth"]
    },
    {
      title: "Eyebrow Transplant",
      desc: "A cosmetic procedure designed to restore thin or uneven eyebrows by implanting natural hair grafts for a fuller, properly shaped, and natural appearance.",
      price: "Custom Pricing",
      features: ["Restores Thin Brows", "Properly Shaped", "Fuller & Natural", "Directional Placement"]
    }
  ]
};



const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Manmohan Singh",
    rating: 5,
    quote: "That was the best experience of my life, it gave me new life, thank you hair haven, the best staff and people treating.",
    tag: "Attentive Care",
    date: "1 week ago",
    daysAgo: 7
  },
  {
    id: 2,
    name: "Kalsotra Aman",
    rating: 5,
    quote: "Excellent treatment, accurate diagnosis. Hair Haven offers excellent customer service and easy booking. The staff provides gentle care.",
    tag: "Easy Booking",
    date: "2 weeks ago",
    daysAgo: 14
  },
  {
    id: 3,
    name: "Neevad Kumar",
    rating: 5,
    quote: "Easy booking, great customer service. I had an excellent experience with Hair Haven. Booking an appointment was very easy. The customer service was top tier.",
    tag: "Good Supervision",
    date: "3 weeks ago",
    daysAgo: 21
  },
  {
    id: 4,
    name: "Shubam Sakolia",
    rating: 5,
    quote: "I recently visited Hair Haven in Channi Himmat, and I must say, it was a delightful experience! The ambiance is wonderful and the results are amazing.",
    tag: "Speedy Recovery",
    date: "1 month ago",
    daysAgo: 30
  },
  {
    id: 5,
    name: "Saleem",
    rating: 5,
    quote: "I am really satisfied with the behaviour of staff members and work, especially Shazia mam and Rimpy mam... my results are very good. I'm very happy.",
    tag: "Attentive Care",
    date: "2 months ago",
    daysAgo: 60
  },
  {
    id: 6,
    name: "Sunny",
    rating: 5,
    quote: "I recently underwent a hair transplant treatment here. The staff is very friendly, I'm very happy, thank you team. Great customer service.",
    tag: "Reasonably Priced",
    date: "2 months ago",
    daysAgo: 65
  },
  {
    id: 7,
    name: "Vishwa Nath",
    rating: 5,
    quote: "Clean & hygienic, sterilized equipment. As far as the result is concerned it is very good. Hair Haven clinic provided me good facilities and the staff is too good.",
    tag: "Clean & Hygienic",
    date: "3 months ago",
    daysAgo: 90
  },
  {
    id: 8,
    name: "Jannu",
    rating: 5,
    quote: "Best clinic in Jammu. 100% result in Hair Haven transplant. Reasonably priced and subsidies available.",
    tag: "Reasonably Priced",
    date: "4 months ago",
    daysAgo: 120
  }
];

const reviewTags = ["All", "Clean & Hygienic", "Reasonably Priced", "Speedy Recovery", "Easy Booking", "Good Supervision", "Attentive Care"];

const treatments = [
  { value: "FUE Hair Transplant", label: "FUE Hair Transplant", category: "Surgical", desc: "Premium hair restoration with micro-graft extraction", icon: "🏥" },
  { value: "BioSapphire FUE Technique", label: "BioSapphire FUE Technique", category: "Surgical", desc: "Advanced sapphire blade FUE restoration for higher density", icon: "💎" },
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
  const [useBioSapphire, setUseBioSapphire] = useState(false);

  // Reviews States
  const [selectedReviewTag, setSelectedReviewTag] = useState('All');
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [reviewSortOrder, setReviewSortOrder] = useState('relevant');
  
  // Parallax Scroll State
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.body.classList.contains('dark-mode');
  });

  // Swiper States
  const [currentSwiperIndex, setCurrentSwiperIndex] = useState(0);

  const swiperImages = useMemo(() => [
    '/image.png',
    '/image copy.png',
    '/image copy 2.png',
    '/image copy 3.png',
    '/image copy 4.png',
    '/image copy 5.png',
    '/image copy 6.png',
    '/image copy 7.png'
  ], []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSwiperIndex((prev) => (prev + 1) % swiperImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [swiperImages.length]);

  // Preload Images for instant rendering
  useEffect(() => {
    // Preload Norwood images
    for (let i = 1; i <= 7; i++) {
      const img = new Image();
      img.src = `/norwood${i}.png`;
    }
    // Preload patient swiper images
    swiperImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [swiperImages]);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);


  // Typewriter Tagline Phrases & State
  const phrases = useMemo(() => [
    "Natural Hair Restoration",
    "Precision FUE Transplants",
    "Artistic Hairline Design",
    "Premium Graft Implantation",
    "Vibrant & Dense Results",
    "Science-Backed Hair Growth"
  ], []);

  const [phraseIdx, setPhraseIdx] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  useEffect(() => {
    let timer: number;
    
    const handleType = () => {
      const fullText = phrases[phraseIdx];
      if (!isDeleting) {
        const nextText = fullText.slice(0, displayText.length + 1);
        setDisplayText(nextText);
        
        if (nextText === fullText) {
          setIsDeleting(true);
          setTypingSpeed(2000);
        } else {
          setTypingSpeed(80);
        }
      } else {
        const nextText = fullText.slice(0, displayText.length - 1);
        setDisplayText(nextText);
        
        if (nextText === '') {
          setIsDeleting(false);
          setPhraseIdx((prev) => (prev + 1) % phrases.length);
          setTypingSpeed(500);
        } else {
          setTypingSpeed(45);
        }
      }
    };
    
    timer = window.setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, phraseIdx, typingSpeed, phrases]);

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
      const el = document.documentElement;
      const progress = (window.scrollY / (el.scrollHeight - el.clientHeight)) * 100;
      setScrollProgress(Math.min(progress, 100));
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

    const ownerPhone = '+918899708659';

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
        message: `Direct WhatsApp message has been successfully generated for owner (+91 88997 08659).`,
        status: 'success'
      });
      
      const encodedText = encodeURIComponent(messageBody);
      const waUrl = `https://wa.me/918899708659?text=${encodedText}`;
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
      base = norwoodStages[selectedNorwood - 1].basePrice || 21000;
    } else if (bookingForm.service === 'BioSapphire FUE Technique') {
      base = 31000;
    } else if (bookingForm.service.includes('PRP')) {
      base = 2000;
    } else if (bookingForm.service.includes('GFC')) {
      base = 4500;
    } else if (bookingForm.service.includes('Beard') || bookingForm.service.includes('Eyebrow')) {
      base = 25000;
    }
    
    let extra = 0;
    if (bookingForm.service === 'FUE Hair Transplant' || bookingForm.service === 'BioSapphire FUE Technique') {
      extra += includePRPSessions * 2000;
      if (includeScreening) extra += 999;
    }
    return base + extra;
  };

  const calculateCalculatorPrice = () => {
    let base = norwoodStages[selectedNorwood - 1].basePrice;
    let extra = includePRPSessions * 2000;
    if (includeScreening) extra += 999;
    if (useBioSapphire) extra += 10000;
    return base + extra;
  };

  const currentNorwoodInfo = norwoodStages[selectedNorwood - 1];

  // Filtered, searched, and sorted reviews
  const filteredTestimonials = useMemo(() => {
    let result = [...testimonials];

    // Filter by tag
    if (selectedReviewTag !== 'All') {
      result = result.filter(t => t.tag === selectedReviewTag);
    }

    // Search query
    if (reviewSearchQuery.trim() !== '') {
      const q = reviewSearchQuery.toLowerCase();
      result = result.filter(t => 
        t.name.toLowerCase().includes(q) || 
        t.quote.toLowerCase().includes(q) ||
        t.tag.toLowerCase().includes(q)
      );
    }

    // Sort order
    if (reviewSortOrder === 'newest') {
      result.sort((a, b) => (a.daysAgo || 0) - (b.daysAgo || 0));
    } else if (reviewSortOrder === 'highest') {
      result.sort((a, b) => b.rating - a.rating);
    } else {
      // 'relevant' - default sorting
      result.sort((a, b) => a.id - b.id);
    }

    return result;
  }, [selectedReviewTag, reviewSearchQuery, reviewSortOrder]);
  return (
    <>
      {/* Header / Navbar */}
      <nav className={`glass-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container py-4 flex justify-between align-center" style={{ position: 'relative', minHeight: '74px' }}>
          
          {/* Left Side: Theme Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', zIndex: 10 }}>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                borderRadius: '50%',
                transition: 'background-color 0.2s ease',
              }}
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun size={22} color="var(--green-primary)" /> : <Moon size={22} color="var(--green-deep)" />}
            </button>
          </div>

          {/* Center: Logo and Name */}
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 5
          }}>
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
          </div>

          {/* Right Side: Navigation & Mobile Menu */}
          <div className="flex align-center gap-4" style={{ zIndex: 10 }}>
            <div className="desktop-only-flex">
              <a href="#home" onClick={() => setActiveSection('home')} className={`nav-link ${activeSection === 'home' ? 'active' : ''}`}>Home</a>
              <a href="#services" onClick={() => setActiveSection('services')} className={`nav-link ${activeSection === 'services' ? 'active' : ''}`}>Treatments</a>
              <a href="#team" onClick={() => setActiveSection('team')} className={`nav-link ${activeSection === 'team' ? 'active' : ''}`}>Expert Team</a>
              <a href="#calculator" onClick={() => setActiveSection('calculator')} className={`nav-link ${activeSection === 'calculator' ? 'active' : ''}`}>Graft Calculator</a>
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
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-nav-drawer">
            <a href="#home" onClick={() => { setActiveSection('home'); setMobileMenuOpen(false); }} className={`mobile-nav-link ${activeSection === 'home' ? 'active' : ''}`}>Home</a>
            <a href="#services" onClick={() => { setActiveSection('services'); setMobileMenuOpen(false); }} className={`mobile-nav-link ${activeSection === 'services' ? 'active' : ''}`}>Treatments</a>
            <a href="#team" onClick={() => { setActiveSection('team'); setMobileMenuOpen(false); }} className={`mobile-nav-link ${activeSection === 'team' ? 'active' : ''}`}>Expert Team</a>
            <a href="#calculator" onClick={() => { setActiveSection('calculator'); setMobileMenuOpen(false); }} className={`mobile-nav-link ${activeSection === 'calculator' ? 'active' : ''}`}>Graft Calculator</a>
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
            
            <h1 className="hero-title mb-6" style={{ minHeight: '2.4em' }}>
              The Art & Science of <br className="mobile-only-block" /><span className="text-gemini-gradient">{displayText}</span><span className="typewriter-cursor"></span>
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
                  <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>4.9 / 5 Stars</div>
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
                <h3 className="text-xl">Hair Transplants</h3>
              </div>

              {services.surgical.map((srv, idx) => (
                <div 
                  key={idx} 
                  className="glass-card p-6 flex flex-col" 
                  style={{ gap: '16px' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div className="flex justify-between align-center flex-wrap gap-2">
                      <h4 className="font-semibold text-lg" style={{ lineHeight: '1.3' }}>{srv.title}</h4>
                      <span className="badge" style={{ fontSize: '0.75rem', borderColor: 'rgba(11, 167, 89, 0.2)', color: 'var(--green-deep)', fontWeight: 700, whiteSpace: 'nowrap' }}>{srv.price}</span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{srv.desc}</p>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto', paddingTop: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {srv.features.slice(0, 3).map((feat, fidx) => (
                        <div key={fidx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <CheckCircle2 size={12} color="var(--green-primary)" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                    
                    <button 
                      onClick={() => handleBookService(srv.title)}
                      className={`btn w-100 ${srv.title.includes('Transplant') ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                    >
                      {srv.title.includes('Transplant') ? 'Reserve Transplant Slot' : 'Book Session'}
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
                  background: 'rgba(11, 167, 89, 0.1)',
                  color: 'var(--green-deep)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Sparkles size={20} />
                </div>
                <h3 className="text-xl">Non-Surgical Therapies</h3>
              </div>

              {services.lasers.map((srv, idx) => (
                <div 
                  key={idx} 
                  className="glass-card p-6 flex flex-col" 
                  style={{ gap: '16px' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div className="flex justify-between align-center flex-wrap gap-2">
                      <h4 className="font-semibold text-lg" style={{ lineHeight: '1.3' }}>{srv.title}</h4>
                      <span className="badge" style={{ fontSize: '0.75rem', borderColor: 'rgba(11, 167, 89, 0.2)', color: 'var(--green-primary)', fontWeight: 700, whiteSpace: 'nowrap' }}>{srv.price}</span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{srv.desc}</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto', paddingTop: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {srv.features.slice(0, 3).map((feat, fidx) => (
                        <div key={fidx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <CheckCircle2 size={12} color="var(--green-primary)" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                    
                    <button 
                      onClick={() => handleBookService(srv.title)}
                      className="btn btn-secondary btn-sm w-100"
                    >
                      Book Growth Session
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
                  background: 'rgba(11, 167, 89, 0.1)',
                  color: 'var(--green-deep)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Heart size={20} />
                </div>
                <h3 className="text-xl">Specialized Transplants</h3>
              </div>

              {services.dermatology.map((srv, idx) => (
                <div 
                  key={idx} 
                  className="glass-card p-6 flex flex-col" 
                  style={{ gap: '16px' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div className="flex justify-between align-center flex-wrap gap-2">
                      <h4 className="font-semibold text-lg" style={{ lineHeight: '1.3' }}>{srv.title}</h4>
                      <span className="badge" style={{ fontSize: '0.75rem', borderColor: 'rgba(11, 167, 89, 0.2)', color: 'var(--green-mid)', fontWeight: 700, whiteSpace: 'nowrap' }}>{srv.price}</span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{srv.desc}</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto', paddingTop: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {srv.features.slice(0, 3).map((feat, fidx) => (
                        <div key={fidx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <CheckCircle2 size={12} color="var(--green-primary)" />
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

      {/* Clinic Supportive Team Section */}
      <section id="team" className="py-24" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: '20%',
          right: '5%',
          width: '200px',
          height: '200px',
          background: 'rgba(11, 167, 89, 0.03)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          pointerEvents: 'none'
        }}></div>

        <div className="container">
          <div className="text-center mb-16">
            <div className="badge badge-gradient mb-3">Expert Care Specialists</div>
            <h2 className="text-4xl mb-4">Meet Our Supportive Team</h2>
            <p className="text-lg text-secondary-color" style={{ maxWidth: '640px', margin: '0 auto' }}>
              Your hair restoration journey is supported by certified medical professionals, 
              precision implanters, and dedicated recovery support leads.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-6 flex-col-mobile">
            {/* Dr. Suby Kakkar */}
            <div className="glass-card p-6 flex flex-col align-center text-center" style={{ gap: '12px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(11, 167, 89, 0.1) 0%, rgba(34, 197, 94, 0.02) 100%)',
                border: '2px solid rgba(11, 167, 89, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                fontWeight: 800,
                color: 'var(--green-deep)',
                fontFamily: 'var(--font-display)',
                boxShadow: '0 8px 24px rgba(11, 167, 89, 0.06)',
                marginBottom: '6px',
                flexShrink: 0
              }}>
                SK
              </div>
              <span className="badge badge-gradient" style={{ fontSize: '0.7rem', padding: '3px 10px', width: 'fit-content' }}>
                Clinical Director
              </span>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2px', fontFamily: 'var(--font-display)' }}>
                Dr. Suby Kakkar
              </h4>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                MBBS, E. Dermatology, Germany
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', lineHeight: '1.4' }}>
                Ex Consultant: Max Hospital Delhi. Highly experienced in advanced dermatological therapies.
              </p>
            </div>

            {/* Maxon Epstin */}
            <div className="glass-card p-6 flex flex-col align-center text-center" style={{ gap: '12px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(11, 167, 89, 0.1) 0%, rgba(34, 197, 94, 0.02) 100%)',
                border: '2px solid rgba(11, 167, 89, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                fontWeight: 800,
                color: 'var(--green-deep)',
                fontFamily: 'var(--font-display)',
                boxShadow: '0 8px 24px rgba(11, 167, 89, 0.06)',
                marginBottom: '6px',
                flexShrink: 0
              }}>
                ME
              </div>
              <span className="badge badge-gradient" style={{ fontSize: '0.7rem', padding: '3px 10px', width: 'fit-content' }}>
                Master Technician
              </span>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2px', fontFamily: 'var(--font-display)' }}>
                Maxon Epstin
              </h4>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                Hair Transplant & PRP Specialist
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', lineHeight: '1.4' }}>
                Expert in hair extraction, PRP growth therapies, and advanced surgical support procedures.
              </p>
            </div>

            {/* Kashish Gupta */}
            <div className="glass-card p-6 flex flex-col align-center text-center" style={{ gap: '12px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(11, 167, 89, 0.1) 0%, rgba(34, 197, 94, 0.02) 100%)',
                border: '2px solid rgba(11, 167, 89, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                fontWeight: 800,
                color: 'var(--green-deep)',
                fontFamily: 'var(--font-display)',
                boxShadow: '0 8px 24px rgba(11, 167, 89, 0.06)',
                marginBottom: '6px',
                flexShrink: 0
              }}>
                KG
              </div>
              <span className="badge badge-gradient" style={{ fontSize: '0.7rem', padding: '3px 10px', width: 'fit-content' }}>
                Senior Implanter
              </span>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2px', fontFamily: 'var(--font-display)' }}>
                Kashish Gupta
              </h4>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                Experienced Implanter
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', lineHeight: '1.4' }}>
                Experienced implanter skilled in precise graft implantation and natural hairline work.
              </p>
            </div>

            {/* Ronika Bhardwaj */}
            <div className="glass-card p-6 flex flex-col align-center text-center" style={{ gap: '12px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(11, 167, 89, 0.1) 0%, rgba(34, 197, 94, 0.02) 100%)',
                border: '2px solid rgba(11, 167, 89, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                fontWeight: 800,
                color: 'var(--green-deep)',
                fontFamily: 'var(--font-display)',
                boxShadow: '0 8px 24px rgba(11, 167, 89, 0.06)',
                marginBottom: '6px',
                flexShrink: 0
              }}>
                RB
              </div>
              <span className="badge badge-gradient" style={{ fontSize: '0.7rem', padding: '3px 10px', width: 'fit-content' }}>
                Follow-Ups & Leads
              </span>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2px', fontFamily: 'var(--font-display)' }}>
                Ronika Bhardwaj
              </h4>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                Patient Care Coordinator
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', lineHeight: '1.4' }}>
                Manages post-transplant recovery logs, patient check-ups, and guides incoming clinical leads.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Consultation Booking Section (Inline Wizard Page) */}
      <section id="booking" className="py-24" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Ambient background glow inside section */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '300px',
          height: '300px',
          background: 'rgba(11, 167, 89, 0.05)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          pointerEvents: 'none'
        }}></div>

        <div className="container flex justify-center" style={{ position: 'relative', zIndex: 2 }}>
          {/* Form Container (Fully visible card inline) */}
          <div 
            className="glass-card"
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '850px',
              border: '1.5px solid var(--border-green)',
              background: 'var(--surface-frost)',
              boxShadow: 'var(--shadow-xl), 0 20px 50px rgba(11, 167, 89, 0.06)',
              padding: '40px',
              borderRadius: '28px',
              textAlign: 'left'
            }}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <div className="badge badge-gradient mb-3" style={{ background: 'rgba(11, 167, 89, 0.07)', borderColor: 'rgba(11, 167, 89, 0.25)', color: 'var(--green-deep)', fontWeight: 800 }}>
                ✨ Clinical Private Diagnostics & Restoration
              </div>
              <h2 className="text-3xl font-decorative mb-1" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.02em', fontWeight: 800, color: 'var(--text-primary)' }}>
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
                    placeholder="e.g. +91 88997 08659" 
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
                          <div className="flex justify-between align-center flex-wrap gap-2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                          background: bookingForm.hadPriorConsultation === val ? 'rgba(11, 167, 89, 0.08)' : 'var(--surface-card)',
                          color: bookingForm.hadPriorConsultation === val ? 'var(--green-primary)' : 'var(--text-secondary)',
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
                      background: 'var(--surface-glass)',
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
                  marginBottom: '4px',
                  alignSelf: 'center'
                }}>
                  <CheckCircle2 size={32} />
                </div>

                <h3 className="text-2xl text-center font-decorative" style={{ color: 'var(--green-primary)', fontFamily: 'var(--font-display)', fontWeight: 800, marginTop: '-10px' }}>
                  Diagnostics Scheduled!
                </h3>
                <p className="text-secondary-color text-center" style={{ fontSize: '0.85rem', marginTop: '-12px', lineHeight: '1.5' }}>
                  Your exclusive care pass has been generated. Specialists <strong>Shazia Mam</strong>, <strong>Rimpy Mam</strong>, and support lead <strong>Rajesh</strong> have been alerted of your booking.
                </p>

                {/* Perforated VIP Clinical Pass */}
                <div className="ticket-premium w-100 flex flex-col gap-4" style={{ width: '100%' }}>
                  <div className="ticket-watermark">HAVEN</div>
                  
                  <div className="flex justify-between align-center" style={{ borderBottom: '1px dashed rgba(11, 167, 89, 0.2)', paddingBottom: '14px' }}>
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
                      <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--green-primary)', marginTop: '2px' }}>
                        ₹{bookingTicket.priceEstimate.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <span className="badge badge-gradient" style={{ fontSize: '0.7rem', borderColor: 'rgba(11, 167, 89, 0.2)', color: 'var(--green-primary)', background: 'rgba(11, 167, 89, 0.04)', fontWeight: 700 }}>
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
                      const ownerPhone = '918899708659';
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
  • *PRP Healing Sessions:* ${includePRPSessions > 0 ? `${includePRPSessions} Sessions Included (+₹${(includePRPSessions * 2000).toLocaleString('en-IN')})` : 'None Selected'}
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
      <section id="calculator" className="py-24" style={{ background: 'transparent', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
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

              {/* Details of Stage - Split Visual Dashboard */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.01)',
                borderRadius: '24px',
                padding: '32px 24px',
                border: '1.5px solid var(--border-light)',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                alignItems: 'center',
                textAlign: 'center'
              }}>
                
                {/* Top: Beautiful Diagnostic SVG */}
                <div style={{
                  background: 'var(--surface-card)',
                  borderRadius: '16px',
                  border: '1.5px solid var(--border-light)',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-sm)',
                  height: '140px',
                  width: '140px',
                  flexShrink: 0
                }}>
                  <NorwoodStageVisual stage={selectedNorwood} />
                </div>

                {/* Bottom: Description & Simple English */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div className="badge badge-gradient mb-3" style={{ fontSize: '0.7rem' }}>
                    Stage {selectedNorwood} Scalp Pattern
                  </div>
                  <h4 className="font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                    {currentNorwoodInfo.name}
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '480px', margin: '0 auto' }}>
                    {currentNorwoodInfo.description}
                  </p>
                </div>
              </div>

              {/* Grid of stats */}
              <div className="grid grid-cols-2 gap-4">
                <div style={{ background: 'var(--surface-card)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Estimated Grafts Needed</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--gemini-blue)', marginTop: '4px' }}>
                    {currentNorwoodInfo.grafts}
                  </div>
                </div>

                <div style={{ background: 'var(--surface-card)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Donor Density Expectation</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--gemini-purple)', marginTop: '4px' }}>
                    {currentNorwoodInfo.density}
                  </div>
                </div>

                <div style={{ background: 'var(--surface-card)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Procedure Duration</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                    {currentNorwoodInfo.duration}
                  </div>
                </div>

                <div style={{ background: 'var(--surface-card)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
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
                    {currentNorwoodInfo.stage === 1 ? '₹0' : `₹${calculateCalculatorPrice().toLocaleString('en-IN')}`}
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
                              background: includePRPSessions === sessionCount ? 'rgba(155, 81, 224, 0.05)' : 'var(--surface-card)',
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
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>PRP accelerates healing and strengthens donor follicle retention (+₹2,000/session)</span>
                    </div>

                    {/* BioSapphire Technique Upgrade */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)' }} className="mt-2">
                      <input 
                        type="checkbox" 
                        checked={useBioSapphire}
                        onChange={(e) => setUseBioSapphire(e.target.checked)}
                        style={{ accentColor: 'var(--green-primary)', width: '16px', height: '16px' }}
                      />
                      <span>Upgrade to BioSapphire Technique (+₹10,000)</span>
                    </label>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginLeft: '26px', marginTop: '-8px' }}>
                      Advanced sapphire blade technology for precise incisions, better density, faster healing, and more natural results.
                    </span>

                    {/* Pre-surgical screening checklist */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)' }} className="mt-2">
                      <input 
                        type="checkbox" 
                        checked={includeScreening}
                        onChange={(e) => setIncludeScreening(e.target.checked)}
                        style={{ accentColor: 'var(--green-primary)', width: '16px', height: '16px' }}
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

      {/* Instagram Curated Results Gallery */}
      <section id="gallery" className="py-24" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          bottom: '10%',
          left: '5%',
          width: '240px',
          height: '240px',
          background: 'rgba(11, 167, 89, 0.03)',
          borderRadius: '50%',
          filter: 'blur(70px)',
          pointerEvents: 'none'
        }}></div>

        <div className="container">
          <div className="text-center mb-16">
            <div className="badge badge-gradient mb-3">📸 Real Patient Showcases</div>
            <h2 className="text-4xl mb-4">Curated Results From Instagram</h2>
            <p className="text-lg text-secondary-color" style={{ maxWidth: '640px', margin: '0 auto' }}>
              Handpicked transformations shared directly from our official Instagram feed. 
              Real outcomes from FUE surgical restoration and advanced dermatology treatments.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {/* Single Premium Instagram Profile Widget Card */}
            <div 
              className="glass-card flex flex-col cursor-pointer"
              onClick={() => window.open('https://instagram.com/hairhaventransplantclinic', '_blank')}
              style={{
                width: '100%',
                maxWidth: '580px',
                background: 'var(--surface-card)',
                border: '1.5px solid var(--border-light)',
                borderRadius: '32px',
                padding: '32px',
                boxShadow: 'var(--shadow-lg), 0 20px 40px -15px rgba(0,0,0,0.05)',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                textAlign: 'left'
              }}
            >
              {/* Instagram Profile Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                <div style={{
                  width: '76px',
                  height: '76px',
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                  padding: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <div style={{
                     width: '100%',
                     height: '100%',
                     borderRadius: '50%',
                     background: 'var(--surface-card)',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     overflow: 'hidden',
                     border: '2px solid var(--surface-card)'
                  }}>
                    <HairHavenLogo size={70} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontFamily: 'var(--font-display)',
                    margin: 0
                  }}>
                    hairhaventransplantclinic
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '15px', height: '15px', borderRadius: '50%', background: '#0095f6', color: '#fff', fontSize: '0.55rem', fontWeight: 900 }}>✓</span>
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--green-deep)', fontWeight: 700 }}>Hair Restoration Clinic • Jammu, J&K</span>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '4px', fontSize: '0.82rem' }}>
                    <span><strong>146</strong> posts</span>
                    <span><strong>1,917</strong> followers</span>
                    <span><strong>84</strong> following</span>
                  </div>
                </div>
              </div>

              {/* Bio Details */}
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '20px', marginBottom: '24px' }}>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '6px' }}>
                  Hair Haven Transplant Clinic
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.65' }}>
                  💚 Hair Haven — Premium Hair Restoration & Laser Center<br />
                  📍 606/B, Sector 3, Channi Himmat, Jammu<br />
                  👨‍⚕️ Consultant: Dr. Suby Kakkar (MBBS, MD Dermatology)<br />
                  💉 FUE Hair Transplant | PRP Therapy | Laser Hair Removal<br />
                  🌟 Jammu's Most Trusted Hair Clinic — 4.9★ on Google
                </p>
              </div>

              {/* Curated Grid Preview Mockup */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                marginBottom: '28px'
              }}>
                {[
                  { label: 'FUE Hairline', emoji: '🧔' },
                  { label: 'PRP Therapy', emoji: '💉' },
                  { label: 'Crown Cover', emoji: '👑' }
                ].map((item, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(11, 167, 89, 0.04)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '16px',
                    aspectRatio: '1',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{ fontSize: '1.8rem' }}>{item.emoji}</div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Open Feed Button */}
              <button 
                onClick={() => window.open('https://instagram.com/hairhaventransplantclinic', '_blank')}
                className="btn btn-primary w-100 flex align-center justify-center gap-2 pulse-button"
                style={{
                  background: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)',
                  border: 'none',
                  color: '#ffffff',
                  boxShadow: '0 8px 24px rgba(225, 48, 108, 0.25)',
                  padding: '14px 20px',
                  fontWeight: 800,
                  fontSize: '0.95rem'
                }}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                Open Instagram Feed & Results
              </button>
            </div>
          </div>

          {/* Follow CTA Banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(11, 167, 89, 0.04) 0%, rgba(34, 197, 94, 0.01) 100%)',
            border: '1.5px solid rgba(11, 167, 89, 0.18)',
            borderRadius: '24px',
            padding: '32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: 'var(--shadow-sm)'
          }} className="flex-col-mobile gap-6 text-center">
            <div style={{ textAlign: 'left' }} className="text-center-mobile">
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                Follow Our Restorative Journey
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Get daily tips, transparent clinical cases, and live Before-After transformations shared by @hairhaventransplantclinic on Instagram.
              </p>
            </div>
            
            <button 
              onClick={() => window.open('https://instagram.com/hairhaventransplantclinic', '_blank')}
              className="btn btn-primary pulse-button"
              style={{
                background: 'linear-gradient(135deg, var(--green-deep) 0%, var(--green-primary) 100%)',
                padding: '14px 28px',
                fontWeight: 800
              }}
            >
              Follow us @hairhaventransplantclinic
            </button>
          </div>

        </div>
      </section>

      {/* Patient Reviews & Ratings Explorer */}
      <section id="reviews" className="py-24" style={{ background: 'transparent', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          
          <div className="grid grid-cols-12 gap-8 flex-col-mobile mb-12 align-center">
            <div className="col-span-5">
              <div className="badge badge-gradient mb-3" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#4285F4', fontWeight: 900 }}>G</span>oogle Verified Reviews
              </div>
              <h2 className="text-4xl mb-4">What Our Clients Say</h2>
              <p className="text-lg text-secondary-color" style={{ lineHeight: '1.6' }}>
                Explore 100% original, verified Google Business reviews of **Hair Haven Jammu**. Real feedback from our patients detailing FUE surgical success and clinical care.
              </p>
            </div>

            {/* Right Column: Google Ratings Card & Auto-Swiping Photo Card */}
            <div className="col-span-7 flex flex-col items-center gap-6" style={{ width: '100%' }}>
              
              {/* Google Ratings Summary Card — 4.9 header on top, stats below */}
              <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '28px 32px' }}>
                {/* Top: Google branding + 4.9 rating */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg viewBox="0 0 24 24" width="26" height="26" style={{ display: 'block' }}>
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: '1', fontFamily: 'var(--font-display)' }}>4.9</span>
                    </div>
                    <div style={{ display: 'flex', color: '#ffb627', gap: '2px' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={13} fill="#ffb627" color="#ffb627" />
                      ))}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, whiteSpace: 'nowrap' }}>168 Reviews · Google</div>
                  </div>

                  {/* Vertical divider */}
                  <div style={{ width: '1px', alignSelf: 'stretch', background: 'var(--border-light)', flexShrink: 0 }}></div>

                  {/* Right: clinic name + open button */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '2px' }}>Hair Haven</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>Hair transplantation clinic in Jammu, J&K · <span style={{ color: 'var(--green-deep)', fontWeight: 700 }}>Open</span></div>
                    <button
                      onClick={() => window.open('https://share.google/91xZaADhSuWDBvWCC', '_blank')}

                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '8px 14px', borderRadius: '20px',
                        background: 'rgba(66,133,244,0.08)', border: '1px solid rgba(66,133,244,0.25)',
                        color: '#4285F4', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Write a Review
                    </button>
                  </div>
                </div>

                {/* Separator */}
                <div style={{ height: '1px', background: 'var(--border-light)', marginBottom: '16px' }}></div>

                {/* Stats grid below the header */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
                  {[
                    { label: 'Cleanliness & Hygiene', value: '98% Positive' },
                    { label: 'Graft Survival Rate', value: '99.2% Success' },
                    { label: 'Staff Professionalism', value: '5 / 5 Stars' },
                    { label: 'Post-Op Supervision', value: 'Highly Rated' }
                  ].map((stat) => (
                    <div key={stat.label} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>{stat.label}</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--green-deep)' }}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Premium Auto-Swiping Photocard Gallery */}
              <div 
                className="glass-card" 
                style={{ 
                  width: '100%', 
                  maxWidth: '540px', 
                  padding: '24px', 
                  overflow: 'hidden',
                  position: 'relative',
                  border: '1.5px solid var(--border-green)',
                  background: 'var(--surface-glass)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <div className="badge badge-gradient" style={{ fontSize: '0.7rem', padding: '4px 10px' }}>
                    📸 Clinical Transformations
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>Auto-Swiping Results</span>
                </div>
                
                {/* Images Container */}
                <div style={{ position: 'relative', width: '100%', aspectRatio: '1', borderRadius: '16px', overflow: 'hidden', background: '#000' }}>
                  {swiperImages.map((src, idx) => (
                    <img
                      key={src}
                      src={src}
                      alt={`Patient Transformation ${idx + 1}`}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: currentSwiperIndex === idx ? 1 : 0,
                        transform: currentSwiperIndex === idx ? 'scale(1)' : 'scale(1.05)',
                        transition: 'opacity 0.8s ease, transform 0.8s ease'
                      }}
                    />
                  ))}
                  
                  {/* Subtle Gradient Overlay */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)',
                    pointerEvents: 'none'
                  }} />

                  {/* Caption on Card */}
                  <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Before & After Case {currentSwiperIndex + 1}</div>
                    <div style={{ fontSize: '0.72rem', opacity: 0.88, marginTop: '2px' }}>FUE Transplant / PRP Restoration Result</div>
                  </div>
                </div>

                {/* Slider dots indicator */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '14px' }}>
                  {swiperImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSwiperIndex(idx)}
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: currentSwiperIndex === idx ? 'var(--green-primary)' : 'var(--text-tertiary)',
                        opacity: currentSwiperIndex === idx ? 1 : 0.4,
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        transition: 'all 0.3s ease'
                      }}
                      title={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Interactive Search & Sort Bar */}
          <div style={{
            background: 'var(--surface-glass)',
            border: '1.5px solid var(--border-light)',
            borderRadius: '20px',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '32px'
          }} className="flex-col-mobile">
            {/* Search Input */}
            <div style={{ position: 'relative', flex: 1, width: '100%' }}>
              <Search size={16} color="var(--text-tertiary)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text"
                placeholder="Search inside original reviews (e.g. staff, hygiene, transplant)..."
                value={reviewSearchQuery}
                onChange={(e) => setReviewSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 42px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-light)',
                  background: 'var(--surface-card)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  fontFamily: 'var(--font-ui)',
                  outline: 'none',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.3s ease'
                }}
              />
            </div>

            {/* Sort Order Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, width: '100%', justifyContent: 'flex-end' }} className="justify-center-mobile">
              <SlidersHorizontal size={14} color="var(--text-secondary)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Sort By:</span>
              <select 
                value={reviewSortOrder}
                onChange={(e) => setReviewSortOrder(e.target.value)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-light)',
                  background: 'var(--surface-card)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="relevant">Most Relevant</option>
                <option value="highest">Highest Rating</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>

          {/* Review Filter Slider */}
          <div className="filter-slider-container">
            <div className="filter-slider">
              {reviewTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedReviewTag(tag)}
                  className={`filter-pill ${selectedReviewTag === tag ? 'active' : ''}`}
                  style={{ flexShrink: 0 }}
                >
                  {tag}
                </button>
              ))}
            </div>
            {/* Subtle side gradient indicating scrollability on touch devices */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 16,
              width: '40px',
              background: 'linear-gradient(to left, var(--bg-primary), transparent)',
              pointerEvents: 'none'
            }}></div>
          </div>

          {/* Testimonial Cards Grid */}
          {filteredTestimonials.length > 0 ? (
            <div className="grid grid-cols-3 gap-8 flex-col-mobile">
              {filteredTestimonials.slice(0, 9).map((review) => (
                <div 
                  key={review.id} 
                  className="glass-card p-6 flex flex-col justify-between" 
                  style={{ 
                    position: 'relative', 
                    minHeight: '260px',
                    border: '1.5px solid var(--border-light)',
                    boxShadow: 'var(--shadow-md)',
                    transition: 'all 0.3s ease',
                    background: 'var(--surface-card)'
                  }}
                >
                  {/* Google G logo branding in bottom right */}
                  <div style={{ position: 'absolute', bottom: '16px', right: '16px', opacity: 0.12 }}>
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  </div>

                  <div>
                    {/* Header Row: Google branding and Reviewer Metadata */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--green-pale) 0%, rgba(11, 167, 89, 0.05) 100%)',
                          color: 'var(--green-deep)',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          border: '1px solid rgba(11, 167, 89, 0.15)'
                        }}>
                          {review.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            {review.name}
                            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '10px', height: '10px', borderRadius: '50%', background: '#4285f4', color: '#fff', fontSize: '0.45rem', fontWeight: 900 }}>✓</span>
                          </span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>Google Review</span>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                        {review.date || '3 days ago'}
                      </span>
                    </div>

                    {/* Rating sub-row: E.g., '5.0' and Star icons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>{review.rating.toFixed(1)}</span>
                      <div style={{ display: 'flex', color: '#ffb627' }}>
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} size={11} fill="#ffb627" color="#ffb627" />
                        ))}
                      </div>
                    </div>

                    {/* Divider Line */}
                    <div style={{ height: '1.2px', background: 'rgba(0, 0, 0, 0.06)', width: '100%', margin: '12px 0' }}></div>

                    {/* Review content details inside the card */}
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.65',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      textAlign: 'left',
                      marginTop: '6px'
                    }}>
                      "{review.quote}"
                    </p>
                  </div>

                  {/* Tag details */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '14px', borderTop: '1px solid rgba(0,0,0,0.03)', paddingTop: '10px' }}>
                    <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green-primary)' }}></span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--green-deep)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{review.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              padding: '48px',
              borderRadius: '24px',
              border: '1.5px solid var(--border-light)',
              background: 'var(--surface-card)',
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}>
              🔍 No original Google reviews matched your search terms. Try searching for "hygiene", "FUE" or "PRP".
            </div>
          )}

          {/* Action Trigger */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '48px' }}>
            <button 
              onClick={() => {
                window.open('https://share.google/91xZaADhSuWDBvWCC', '_blank');
              }}

              className="btn btn-primary flex align-center gap-2"
              style={{ padding: '14px 28px', fontWeight: 700 }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" style={{ display: 'block' }}>
                <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Write a Google Review
            </button>
            
            <button 
              onClick={() => {
                window.open('https://maps.app.goo.gl/QFGD7kxLjtaQFP739', '_blank');
              }}
              className="btn btn-secondary flex align-center gap-2"
              style={{ padding: '14px 28px', fontWeight: 700 }}
            >
              <MapPin size={16} color="var(--green-primary)" />
              View Clinic on Maps
            </button>
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
            {/* Embedded Google Map centered at Hair Haven, Channi Himmat, Jammu */}
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3356.5684347712395!2d74.8765251!3d32.7059000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391e85b54a3a83eb%3A0x5f9d84ca705aefbb!2sHair%20Haven!5e0!3m2!1sen!2sin!4v1716000000000!5m2!1sen!2sin"
              className="map-iframe"
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Hair Haven Location Map"
            ></iframe>

            {/* GPS Directions Overlay Card */}
            <div className="map-directions-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <MapPin size={18} color="var(--green-primary)" />
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
                onClick={() => window.open('https://maps.app.goo.gl/QFGD7kxLjtaQFP739', '_blank')}
                className="btn btn-primary w-100 flex align-center justify-center gap-2 pulse-button"
                style={{
                  background: 'linear-gradient(135deg, var(--green-deep) 0%, var(--green-primary) 100%)',
                  border: '1px solid rgba(11, 167, 89, 0.18)',
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

      <footer style={{
        background: 'var(--surface-card)',
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

      {/* Scroll Progress Bar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '3px',
        width: `${scrollProgress}%`,
        background: 'linear-gradient(90deg, var(--green-deep) 0%, var(--green-primary) 60%, #22d3ee 100%)',
        zIndex: 10000,
        transition: 'width 0.1s linear',
        borderRadius: '0 2px 2px 0',
        boxShadow: '0 0 8px rgba(11, 167, 89, 0.5)'
      }} />

      {/* Floating WhatsApp Quick-Contact Button */}
      <div style={{
        position: 'fixed',
        bottom: '88px',
        right: '24px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px'
      }}>
        {/* Scroll to top */}
        {scrollY > 400 && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            title="Back to top"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'var(--surface-card)',
              border: '1.5px solid var(--border-light)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              color: 'var(--text-secondary)'
            }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 15l-6-6-6 6"/>
            </svg>
          </button>
        )}

        {/* WhatsApp button */}
        <a
          href="https://wa.me/918899708659?text=Hello%20Hair%20Haven%2C%20I%20would%20like%20to%20book%20a%20consultation."
          target="_blank"
          rel="noopener noreferrer"
          title="Chat on WhatsApp"
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#25D366',
            boxShadow: '0 4px 20px rgba(37, 211, 102, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
            textDecoration: 'none',
            animation: 'pulse-wa 2.5s infinite'
          }}
        >
          <svg viewBox="0 0 24 24" width="28" height="28" fill="#ffffff">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
      </div>
    </>
  );
}

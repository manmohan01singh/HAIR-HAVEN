import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Calendar, Image as ImageIcon, Star, Settings, 
  Search, Shield, Plus, Trash2, Check, X, Pin, 
  Phone, Mail, Upload, Copy, 
  Eye, EyeOff, FileSpreadsheet
} from 'lucide-react';
import { 
  subscribeToBookings, 
  updateBookingStatus, 
  deleteBooking, 
  subscribeToGallery, 
  addGalleryImage, 
  updateGalleryImage, 
  deleteGalleryImage, 
  reorderGalleryImages, 
  uploadGalleryImage,
  subscribeToReviews, 
  addReview, 
  updateReview, 
  deleteReview, 
  subscribeToClinicSettings, 
  updateClinicSettings 
} from './firebase';

interface AdminPanelProps {
  onBack: () => void;
  showToast: (message: string, type: 'success' | 'info' | 'warning') => void;
}

export default function AdminPanel({ onBack, showToast }: AdminPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'bookings' | 'gallery' | 'reviews' | 'settings'>('bookings');
  
  // Real-time Data States
  const [bookings, setBookings] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [clinicSettings, setClinicSettings] = useState<any>({
    announcementBanner: '',
    isAnnouncementActive: true,
    whatsappNumber: '',
    slotsAvailable: 3,
    specialOffer: ''
  });
  
  // Loading States
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  
  // Search & Filter States
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingFilter, setBookingFilter] = useState<'All' | 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'>('All');
  
  const [reviewSearch, setReviewSearch] = useState('');


  // Form States for adding new items
  const [newImgUrl, setNewImgUrl] = useState('');
  const [newImgCaption, setNewImgCaption] = useState('');
  const [newImgCategory, setNewImgCategory] = useState('Hairline');
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [newRevName, setNewRevName] = useState('');
  const [newRevRating, setNewRevRating] = useState(5);
  const [newRevQuote, setNewRevQuote] = useState('');
  const [newRevTag, setNewRevTag] = useState('FUE Transplant');
  const [newRevSource, setNewRevSource] = useState('Verified Patient');

  // QR & Booking Pass Modal
  const [selectedBookingPass, setSelectedBookingPass] = useState<any | null>(null);

  // Settings modification state
  const [savingSettings, setSavingSettings] = useState(false);

  // Subscribe to real-time updates on mount
  useEffect(() => {
    const unsubBookings = subscribeToBookings((data) => {
      setBookings(data);
      setLoadingBookings(false);
    });

    const unsubGallery = subscribeToGallery((data) => {
      setGallery(data);
      setLoadingGallery(false);
    });

    const unsubReviews = subscribeToReviews((data) => {
      setReviews(data);
      setLoadingReviews(false);
    });

    const unsubSettings = subscribeToClinicSettings((data) => {
      if (data) {
        setClinicSettings(data);
      }
    });

    return () => {
      unsubBookings();
      unsubGallery();
      unsubReviews();
      unsubSettings();
    };
  }, []);

  // JS Implementation #1: CSV Export of Bookings
  const handleExportCSV = () => {
    try {
      if (bookings.length === 0) {
        showToast("No bookings to export!", "warning");
        return;
      }
      const headers = ['Booking ID', 'Full Name', 'Phone', 'Email', 'Service', 'Date', 'Time', 'Status', 'Grafts Est', 'Price Est', 'Created At'];
      const rows = bookings.map(b => [
        b.id || '',
        `"${b.fullName || ''}"`,
        b.phone || '',
        b.email || '',
        `"${b.service || ''}"`,
        b.date || '',
        b.time || '',
        b.status || '',
        b.graftsEstimate || '',
        b.priceEstimate || '',
        b.createdAt ? new Date(b.createdAt.seconds * 1000).toLocaleString() : ''
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `hairhaven_bookings_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Bookings list exported successfully as CSV!", "success");
    } catch (e) {
      showToast("Failed to export CSV.", "warning");
    }
  };

  // JS Implementation #2: Copy Booking ID with visual feedback
  const handleCopyBookingId = (id: string) => {
    navigator.clipboard.writeText(id);
    showToast(`Copied Booking ID: ${id.substring(0, 8)}...`, 'success');
  };

  // Booking CRUD handlers
  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateBookingStatus(id, status);
      showToast(`Appointment status updated to ${status}!`, 'success');
    } catch (err) {
      showToast('Failed to update status.', 'warning');
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this booking record?")) {
      try {
        await deleteBooking(id);
        showToast('Booking deleted successfully.', 'success');
      } catch (err) {
        showToast('Failed to delete booking.', 'warning');
      }
    }
  };

  // Gallery CRUD handlers
  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImgUrl.trim()) {
      showToast('Please enter or upload an image first.', 'warning');
      return;
    }
    try {
      const orderVal = gallery.length > 0 ? Math.max(...gallery.map(img => img.order || 0)) + 1 : 1;
      await addGalleryImage(newImgUrl, newImgCaption, newImgCategory, orderVal);
      setNewImgUrl('');
      setNewImgCaption('');
      showToast('Gallery image added successfully!', 'success');
    } catch (err) {
      showToast('Failed to add gallery image.', 'warning');
    }
  };

  // JS Implementation #3: Admin File Upload to Firebase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      showToast("Uploading image to Firebase Storage...", "info");
      const url = await uploadGalleryImage(file);
      setNewImgUrl(url);
      setUploadingImage(false);
      showToast("Image uploaded successfully! Fill details & add to gallery.", "success");
    } catch (err) {
      console.error(err);
      setUploadingImage(false);
      showToast("Storage upload failed. Dynamic URL fallback enabled.", "warning");
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this image from the gallery?")) {
      try {
        await deleteGalleryImage(id);
        showToast('Image removed from gallery.', 'success');
      } catch (err) {
        showToast('Failed to remove image.', 'warning');
      }
    }
  };

  const handleToggleImageActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateGalleryImage(id, { isActive: !currentStatus });
      showToast(currentStatus ? 'Image hidden from patients.' : 'Image visible to patients!', 'success');
    } catch (err) {
      showToast('Failed to toggle status.', 'warning');
    }
  };

  // JS Implementation #4: Reorder Gallery Images (Up / Down)
  const handleMoveImage = async (index: number, direction: 'up' | 'down') => {
    const newItems = [...gallery];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= gallery.length) return;

    // Swap order values
    const temp = newItems[index].order;
    newItems[index].order = newItems[targetIndex].order;
    newItems[targetIndex].order = temp;

    // Update locally and in batch
    try {
      const batchData = [
        { id: newItems[index].id, order: newItems[index].order },
        { id: newItems[targetIndex].id, order: newItems[targetIndex].order }
      ];
      await reorderGalleryImages(batchData);
      showToast('Gallery reordered successfully!', 'success');
    } catch (err) {
      showToast('Failed to reorder gallery.', 'warning');
    }
  };

  // Reviews CRUD handlers
  const handleAddManualReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRevName.trim() || !newRevQuote.trim()) {
      showToast('Please fill out Name and Patient Quote.', 'warning');
      return;
    }
    try {
      await addReview({
        name: newRevName,
        rating: Number(newRevRating),
        quote: newRevQuote,
        tag: newRevTag,
        source: newRevSource,
        isPinned: false,
        isVisible: true
      });
      setNewRevName('');
      setNewRevQuote('');
      showToast('Patient review added to board!', 'success');
    } catch (err) {
      showToast('Failed to add review.', 'warning');
    }
  };

  const handleToggleReviewPin = async (id: string, currentPin: boolean) => {
    try {
      await updateReview(id, { isPinned: !currentPin });
      showToast(currentPin ? 'Review unpinned.' : 'Review pinned to highlight section!', 'success');
    } catch (err) {
      showToast('Failed to update pin.', 'warning');
    }
  };

  const handleToggleReviewVisible = async (id: string, currentVisible: boolean) => {
    try {
      await updateReview(id, { isVisible: !currentVisible });
      showToast(currentVisible ? 'Review hidden from users.' : 'Review is now public!', 'success');
    } catch (err) {
      showToast('Failed to update visibility.', 'warning');
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (window.confirm("Delete this patient review?")) {
      try {
        await deleteReview(id);
        showToast('Review deleted.', 'success');
      } catch (err) {
        showToast('Failed to delete review.', 'warning');
      }
    }
  };

  // Save Settings handler
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      await updateClinicSettings({
        announcementBanner: clinicSettings.announcementBanner,
        isAnnouncementActive: clinicSettings.isAnnouncementActive,
        whatsappNumber: clinicSettings.whatsappNumber,
        slotsAvailable: Number(clinicSettings.slotsAvailable),
        specialOffer: clinicSettings.specialOffer,
        heroDescription: clinicSettings.heroDescription || '',
        founderName: clinicSettings.founderName || '',
        founderRole: clinicSettings.founderRole || '',
        founderQuote: clinicSettings.founderQuote || '',
        colorTheme: clinicSettings.colorTheme || 'Emerald Green',
        fontTheme: clinicSettings.fontTheme || 'Outfit'
      });
      showToast('Clinic core configurations updated!', 'success');
    } catch (err) {
      showToast('Failed to update clinic configurations.', 'warning');
    } finally {
      setSavingSettings(false);
    }
  };

  // Filter Bookings logic
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      (b.fullName || '').toLowerCase().includes(bookingSearch.toLowerCase()) ||
      (b.email || '').toLowerCase().includes(bookingSearch.toLowerCase()) ||
      (b.phone || '').toLowerCase().includes(bookingSearch.toLowerCase()) ||
      (b.service || '').toLowerCase().includes(bookingSearch.toLowerCase());
    
    const matchesFilter = bookingFilter === 'All' || b.status === bookingFilter;
    return matchesSearch && matchesFilter;
  });

  // Filter Reviews logic
  const filteredReviews = reviews.filter(r => {
    return (r.name || '').toLowerCase().includes(reviewSearch.toLowerCase()) ||
           (r.quote || '').toLowerCase().includes(reviewSearch.toLowerCase()) ||
           (r.tag || '').toLowerCase().includes(reviewSearch.toLowerCase());
  });

  // Calculations for stats
  const totalBookingsCount = bookings.length;
  const pendingBookingsCount = bookings.filter(b => b.status === 'Pending').length;
  const activeGalleryCount = gallery.filter(g => g.isActive).length;
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1) 
    : '5.0';

  return (
    <div className="container" style={{ paddingTop:'100px', paddingBottom:'120px', minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      
      {/* Admin Panel Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'32px' }} className="flex-col-mobile align-start gap-4">
        <button 
          onClick={onBack}
          className="btn btn-secondary haptic-btn"
          style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 16px', borderRadius:'12px', fontSize:'0.85rem' }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{ background:'rgba(128, 90, 213, 0.1)', color:'var(--gemini-purple)', width:'40px', height:'40px', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Shield size={20} />
          </div>
          <div>
            <h2 style={{ fontFamily:'var(--font-display)', color:'var(--text-primary)', fontSize:'1.5rem', lineHeight:1.1 }}>Clinic Control Center</h2>
            <span style={{ fontSize:'0.75rem', color:'var(--text-tertiary)' }}>Firebase-Backed Administration</span>
          </div>
        </div>
      </div>

      {/* Admin Stats Strip */}
      <div style={{ 
        display:'grid', 
        gridTemplateColumns:'repeat(4, 1fr)', 
        gap:'16px', 
        marginBottom:'32px',
        width:'100%'
      }} className="grid-2-mobile">
        <div className="stat-glass-card" style={{ padding:'16px', display:'flex', flexDirection:'column', gap:'6px' }}>
          <span style={{ fontSize:'0.7rem', fontWeight:800, color:'var(--text-tertiary)', textTransform:'uppercase' }}>Pending Appointments</span>
          <div style={{ display:'flex', alignItems:'baseline', gap:'8px' }}>
            <span style={{ fontSize:'1.8rem', fontWeight:800, color:'var(--yellow-primary)' }}>{pendingBookingsCount}</span>
            <span style={{ fontSize:'0.75rem', color:'var(--text-secondary)' }}>/ {totalBookingsCount} total</span>
          </div>
        </div>
        <div className="stat-glass-card" style={{ padding:'16px', display:'flex', flexDirection:'column', gap:'6px' }}>
          <span style={{ fontSize:'0.7rem', fontWeight:800, color:'var(--text-tertiary)', textTransform:'uppercase' }}>Gallery Items</span>
          <div style={{ display:'flex', alignItems:'baseline', gap:'8px' }}>
            <span style={{ fontSize:'1.8rem', fontWeight:800, color:'var(--green-primary)' }}>{activeGalleryCount}</span>
            <span style={{ fontSize:'0.75rem', color:'var(--text-secondary)' }}>active cases</span>
          </div>
        </div>
        <div className="stat-glass-card" style={{ padding:'16px', display:'flex', flexDirection:'column', gap:'6px' }}>
          <span style={{ fontSize:'0.7rem', fontWeight:800, color:'var(--text-tertiary)', textTransform:'uppercase' }}>Avg Patient Rating</span>
          <div style={{ display:'flex', alignItems:'baseline', gap:'8px' }}>
            <span style={{ fontSize:'1.8rem', fontWeight:800, color:'var(--gemini-purple)' }}>{averageRating} ★</span>
            <span style={{ fontSize:'0.75rem', color:'var(--text-secondary)' }}>({reviews.length} reviews)</span>
          </div>
        </div>
        <div className="stat-glass-card" style={{ padding:'16px', display:'flex', flexDirection:'column', gap:'6px' }}>
          <span style={{ fontSize:'0.7rem', fontWeight:800, color:'var(--text-tertiary)', textTransform:'uppercase' }}>Live Urgent Slots</span>
          <div style={{ display:'flex', alignItems:'baseline', gap:'8px' }}>
            <span style={{ fontSize:'1.8rem', fontWeight:800, color:'var(--red-primary)' }}>{clinicSettings.slotsAvailable}</span>
            <span style={{ fontSize:'0.75rem', color:'var(--text-secondary)' }}>slots left</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ 
        display:'flex', 
        borderBottom:'1.5px solid var(--border-light)', 
        marginBottom:'30px', 
        gap:'24px',
        overflowX:'auto',
        whiteSpace:'nowrap',
        paddingBottom:'2px'
      }} className="no-scrollbar">
        {[
          { id: 'bookings', label: '📅 Booking Queue', count: pendingBookingsCount },
          { id: 'gallery', label: '🖼️ Gallery Manager', count: gallery.length },
          { id: 'reviews', label: '★ Review Board', count: reviews.length },
          { id: 'settings', label: '⚙️ Clinic Settings', count: null }
        ].map(tab => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as any);
                if (navigator.vibrate) navigator.vibrate(8);
              }}
              style={{
                background:'none',
                border:'none',
                padding:'12px 4px 14px 4px',
                fontSize:'0.9rem',
                fontWeight:isActive ? 800 : 600,
                color:isActive ? 'var(--green-primary)' : 'var(--text-secondary)',
                position:'relative',
                cursor:'pointer',
                transition:'all 0.2s',
                display:'flex',
                alignItems:'center',
                gap:'6px'
              }}
            >
              {tab.label}
              {tab.count !== null && (
                <span style={{ 
                  fontSize:'0.65rem', 
                  background: isActive ? 'var(--green-primary)' : 'var(--border-light)', 
                  color: isActive ? '#ffffff' : 'var(--text-secondary)', 
                  padding:'1px 6px', 
                  borderRadius:'8px',
                  fontWeight:800
                }}>
                  {tab.count}
                </span>
              )}
              {isActive && (
                <div style={{ 
                  position:'absolute', 
                  bottom:0, 
                  left:0, 
                  right:0, 
                  height:'3px', 
                  background:'var(--green-primary)', 
                  borderRadius:'3px 3px 0 0',
                  boxShadow:'0 -2px 6px rgba(11,167,89,0.3)'
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* ────────────────── SUB-TAB: BOOKINGS QUEUE ────────────────── */}
      {activeSubTab === 'bookings' && (
        <div className="reveal-on-scroll" style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
          
          {/* Controls bar */}
          <div style={{ display:'flex', gap:'12px', flexWrap:'wrap', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ display:'flex', gap:'10px', flex:1, minWidth:'280px' }}>
              <div className="search-bar-wrapper" style={{ flex:1, position:'relative' }}>
                <Search size={16} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'var(--text-tertiary)' }} />
                <input 
                  type="text" 
                  placeholder="Search patient, phone, service..." 
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  style={{ width:'100%', padding:'10px 12px 10px 38px', borderRadius:'12px', border:'1.5px solid var(--border-light)', background:'var(--surface-card)', color:'var(--text-primary)', fontSize:'0.88rem' }}
                />
              </div>
              <select 
                value={bookingFilter}
                onChange={(e) => setBookingFilter(e.target.value as any)}
                style={{ padding:'10px 14px', borderRadius:'12px', border:'1.5px solid var(--border-light)', background:'var(--surface-card)', color:'var(--text-primary)', fontSize:'0.85rem', fontWeight:600, cursor:'pointer' }}
              >
                <option value="All">All Bookings</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            
            <button 
              onClick={handleExportCSV}
              className="btn btn-secondary haptic-btn"
              style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 16px', borderRadius:'12px', fontSize:'0.85rem', fontWeight:700 }}
            >
              <FileSpreadsheet size={16} /> Export CSV
            </button>
          </div>

          {/* Bookings Table / List */}
          {loadingBookings ? (
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              {[1, 2, 3].map(n => <div key={n} className="skeleton" style={{ height:'80px', borderRadius:'16px' }} />)}
            </div>
          ) : filteredBookings.length === 0 ? (
            <div style={{ textAlign:'center', padding:'48px 16px', background:'rgba(255,255,255,0.02)', border:'1.5px dashed var(--border-light)', borderRadius:'24px' }}>
              <Calendar size={36} style={{ color:'var(--text-tertiary)', marginBottom:'12px' }} />
              <h4 style={{ color:'var(--text-primary)', marginBottom:'4px' }}>No Appointments Found</h4>
              <p style={{ color:'var(--text-secondary)', fontSize:'0.85rem' }}>No booking matches the selected search/filters.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              {filteredBookings.map((b) => (
                <div 
                  key={b.id} 
                  className="gradient-border-card" 
                  style={{ 
                    padding:'20px', 
                    borderRadius:'20px', 
                    background:'var(--surface-card)', 
                    display:'flex', 
                    flexDirection:'column', 
                    gap:'16px',
                    position:'relative'
                  }}
                >
                  {/* Top line with status & basic details */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }} className="flex-col-mobile gap-2">
                    <div>
                      <h4 style={{ fontSize:'1.05rem', fontWeight:800, color:'var(--text-primary)', marginBottom:'4px' }}>{b.fullName}</h4>
                      <div style={{ display:'flex', gap:'12px', flexWrap:'wrap', fontSize:'0.78rem', color:'var(--text-secondary)' }}>
                        <span style={{ display:'flex', alignItems:'center', gap:'4px' }}><Phone size={12} /> {b.phone}</span>
                        {b.email && <span style={{ display:'flex', alignItems:'center', gap:'4px' }}><Mail size={12} /> {b.email}</span>}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      <span className={`badge`} style={{
                        background: b.status === 'Confirmed' ? 'rgba(34, 197, 94, 0.12)' 
                          : b.status === 'Completed' ? 'rgba(59, 130, 246, 0.12)' 
                          : b.status === 'Cancelled' ? 'rgba(239, 68, 68, 0.12)' 
                          : 'rgba(234, 179, 8, 0.12)',
                        color: b.status === 'Confirmed' ? 'var(--green-primary)' 
                          : b.status === 'Completed' ? 'var(--gemini-blue)' 
                          : b.status === 'Cancelled' ? 'var(--red-primary)' 
                          : 'var(--yellow-primary)',
                        border: '1px solid currentColor',
                        fontSize:'0.75rem',
                        padding:'4px 10px',
                        borderRadius:'20px',
                        fontWeight:800
                      }}>
                        {b.status || 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Booking details card grid */}
                  <div style={{ 
                    display:'grid', 
                    gridTemplateColumns:'repeat(4, 1fr)', 
                    gap:'12px', 
                    background:'rgba(255,255,255,0.02)', 
                    padding:'12px 16px', 
                    borderRadius:'14px', 
                    border:'1px solid var(--border-light)' 
                  }} className="grid-2-mobile">
                    <div className="flex flex-col">
                      <span style={{ fontSize:'0.65rem', fontWeight:800, color:'var(--text-tertiary)', textTransform:'uppercase' }}>Service</span>
                      <span style={{ fontSize:'0.82rem', fontWeight:700, color:'var(--text-primary)' }}>{b.service || 'Norwood Analysis'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span style={{ fontSize:'0.65rem', fontWeight:800, color:'var(--text-tertiary)', textTransform:'uppercase' }}>Date & Time</span>
                      <span style={{ fontSize:'0.82rem', fontWeight:700, color:'var(--text-primary)' }}>{b.date} at {b.time}</span>
                    </div>
                    <div className="flex flex-col">
                      <span style={{ fontSize:'0.65rem', fontWeight:800, color:'var(--text-tertiary)', textTransform:'uppercase' }}>Estimated Grafts</span>
                      <span style={{ fontSize:'0.82rem', fontWeight:700, color:'var(--gemini-purple)' }}>{b.graftsEstimate || '1,200 – 1,800'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span style={{ fontSize:'0.65rem', fontWeight:800, color:'var(--text-tertiary)', textTransform:'uppercase' }}>Estimate Cost</span>
                      <span style={{ fontSize:'0.82rem', fontWeight:700, color:'var(--green-deep)' }}>{b.priceEstimate || '₹30,000'}</span>
                    </div>
                  </div>

                  {/* Actions strip */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid var(--border-light)', paddingTop:'14px' }} className="flex-col-mobile gap-3 align-stretch">
                    
                    <div style={{ display:'flex', gap:'8px', fontSize:'0.75rem', color:'var(--text-tertiary)' }}>
                      <span 
                        onClick={() => handleCopyBookingId(b.id)} 
                        style={{ cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'4px' }} 
                        className="hover-green"
                      >
                        <Copy size={12} /> ID: {b.id.substring(0, 8)}...
                      </span>
                      {b.createdAt && (
                        <span>• Recieved: {new Date(b.createdAt.seconds * 1000).toLocaleDateString()}</span>
                      )}
                    </div>

                    {/* Booking Control Actions */}
                    <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }} className="flex-col-mobile">
                      
                      {/* Pass Generator Button */}
                      <button
                        onClick={() => setSelectedBookingPass(b)}
                        className="btn btn-secondary haptic-btn"
                        style={{ padding:'6px 12px', fontSize:'0.78rem', borderRadius:'8px', fontWeight:700 }}
                      >
                        🎫 Pass Pass
                      </button>

                      {b.status !== 'Confirmed' && (
                        <button 
                          onClick={() => handleUpdateStatus(b.id, 'Confirmed')}
                          className="btn btn-primary haptic-btn"
                          style={{ padding:'6px 12px', fontSize:'0.78rem', borderRadius:'8px', background:'var(--green-primary)', border:'none', color:'#ffffff', fontWeight:700 }}
                        >
                          <Check size={14} style={{ marginRight:'4px' }} /> Confirm
                        </button>
                      )}

                      {b.status !== 'Completed' && b.status === 'Confirmed' && (
                        <button 
                          onClick={() => handleUpdateStatus(b.id, 'Completed')}
                          className="btn btn-primary haptic-btn"
                          style={{ padding:'6px 12px', fontSize:'0.78rem', borderRadius:'8px', background:'var(--gemini-blue)', border:'none', color:'#ffffff', fontWeight:700 }}
                        >
                          <Check size={14} style={{ marginRight:'4px' }} /> Complete
                        </button>
                      )}

                      {b.status !== 'Cancelled' && (
                        <button 
                          onClick={() => handleUpdateStatus(b.id, 'Cancelled')}
                          className="btn btn-secondary haptic-btn"
                          style={{ padding:'6px 12px', fontSize:'0.78rem', borderRadius:'8px', border:'1px solid var(--red-primary)', color:'var(--red-primary)', background:'none', fontWeight:700 }}
                        >
                          <X size={14} style={{ marginRight:'4px' }} /> Cancel
                        </button>
                      )}

                      <button 
                        onClick={() => handleDeleteBooking(b.id)}
                        style={{ background:'rgba(239, 68, 68, 0.08)', border:'none', borderRadius:'8px', width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--red-primary)', cursor:'pointer' }}
                        title="Delete record"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ────────────────── SUB-TAB: GALLERY MANAGER ────────────────── */}
      {activeSubTab === 'gallery' && (
        <div className="reveal-on-scroll flex-col-mobile" style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:'30px' }}>
          
          {/* Left panel: Add Image Form */}
          <div className="stat-glass-card" style={{ padding:'24px', borderRadius:'24px', height:'fit-content', display:'flex', flexDirection:'column', gap:'18px' }}>
            <h3 style={{ fontFamily:'var(--font-display)', color:'var(--text-primary)', fontSize:'1.15rem', display:'flex', alignItems:'center', gap:'8px' }}>
              <Plus size={18} color="var(--green-primary)" /> Add Gallery Image
            </h3>
            
            <form onSubmit={handleAddImage} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              <div className="flex flex-col gap-2">
                <label style={{ fontSize:'0.78rem', fontWeight:800, color:'var(--text-secondary)' }}>File Upload (Firebase Storage)</label>
                <div style={{ display:'flex', gap:'8px', alignItems:'center', width:'100%' }}>
                  <label 
                    className="btn btn-secondary haptic-btn"
                    style={{ 
                      flex:1, 
                      padding:'10px 12px', 
                      fontSize:'0.82rem', 
                      borderRadius:'10px', 
                      display:'flex', 
                      alignItems:'center', 
                      justifyContent:'center', 
                      gap:'8px', 
                      cursor: uploadingImage ? 'not-allowed' : 'pointer',
                      border:'1.5px dashed var(--border-light)'
                    }}
                  >
                    <Upload size={16} /> 
                    {uploadingImage ? 'Uploading...' : 'Choose Local File'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileUpload} 
                      disabled={uploadingImage}
                      style={{ display:'none' }} 
                    />
                  </label>
                </div>
              </div>

              <div style={{ textAlign:'center', fontSize:'0.72rem', color:'var(--text-tertiary)', margin:'-4px 0' }}>— OR Paste Direct URL —</div>

              <div className="flex flex-col gap-2">
                <label style={{ fontSize:'0.78rem', fontWeight:800, color:'var(--text-secondary)' }}>Image URL</label>
                <input 
                  type="text" 
                  placeholder="https://images.unsplash.com/photo-..." 
                  value={newImgUrl}
                  onChange={(e) => setNewImgUrl(e.target.value)}
                  style={{ width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1.5px solid var(--border-light)', background:'var(--surface-card)', color:'var(--text-primary)', fontSize:'0.82rem' }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label style={{ fontSize:'0.78rem', fontWeight:800, color:'var(--text-secondary)' }}>Patient / Case Caption</label>
                <input 
                  type="text" 
                  placeholder="e.g. 2500 Grafts - FUE Hairline - 8 Months Results" 
                  value={newImgCaption}
                  onChange={(e) => setNewImgCaption(e.target.value)}
                  style={{ width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1.5px solid var(--border-light)', background:'var(--surface-card)', color:'var(--text-primary)', fontSize:'0.82rem' }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label style={{ fontSize:'0.78rem', fontWeight:800, color:'var(--text-secondary)' }}>Treatment Category</label>
                <select 
                  value={newImgCategory}
                  onChange={(e) => setNewImgCategory(e.target.value)}
                  style={{ width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1.5px solid var(--border-light)', background:'var(--surface-card)', color:'var(--text-primary)', fontSize:'0.82rem', fontWeight:600, cursor:'pointer' }}
                >
                  <option value="Hairline">Hairline Restoration</option>
                  <option value="Crown">Crown/Vertex Dense Packing</option>
                  <option value="FUE">FUE Sapphire FUE</option>
                  <option value="PRP">Growth factor PRP</option>
                </select>
              </div>

              {newImgUrl && (
                <div style={{ borderRadius:'12px', overflow:'hidden', border:'1.5px solid var(--border-light)', width:'100%', height:'120px' }}>
                  <img src={newImgUrl} alt="Preview" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary haptic-btn"
                style={{ width:'100%', padding:'12px', borderRadius:'12px', fontSize:'0.88rem', fontWeight:800 }}
              >
                Add Case to Gallery
              </button>
            </form>
          </div>

          {/* Right panel: Active Gallery Grid / List */}
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h3 style={{ fontFamily:'var(--font-display)', color:'var(--text-primary)', fontSize:'1.15rem' }}>Current Case Slides</h3>
              <span style={{ fontSize:'0.75rem', color:'var(--text-tertiary)' }}>Total: {gallery.length} cases</span>
            </div>

            {loadingGallery ? (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'12px' }}>
                <div className="skeleton" style={{ height:'160px', borderRadius:'16px' }} />
                <div className="skeleton" style={{ height:'160px', borderRadius:'16px' }} />
              </div>
            ) : gallery.length === 0 ? (
              <div style={{ textAlign:'center', padding:'48px 16px', background:'rgba(255,255,255,0.02)', border:'1.5px dashed var(--border-light)', borderRadius:'24px' }}>
                <ImageIcon size={32} style={{ color:'var(--text-tertiary)', marginBottom:'12px' }} />
                <h4 style={{ color:'var(--text-primary)', marginBottom:'4px' }}>Gallery Empty</h4>
                <p style={{ color:'var(--text-secondary)', fontSize:'0.85rem' }}>Upload or add URLs to display patient cases.</p>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                {gallery.map((img, idx) => (
                  <div 
                    key={img.id} 
                    className="stat-glass-card" 
                    style={{ 
                      padding:'12px', 
                      borderRadius:'16px', 
                      display:'flex', 
                      alignItems:'center', 
                      gap:'16px',
                      opacity: img.isActive ? 1 : 0.65 
                    }}
                  >
                    <img 
                      src={img.url} 
                      alt={img.caption} 
                      style={{ width:'80px', height:'80px', borderRadius:'10px', objectFit:'cover', border:'1px solid var(--border-light)', flexShrink:0 }} 
                    />
                    
                    <div style={{ flex:1, overflow:'hidden' }}>
                      <span className="badge" style={{ fontSize:'0.62rem', background:'rgba(128, 90, 213, 0.1)', color:'var(--gemini-purple)', padding:'2px 6px', borderRadius:'6px', display:'inline-block', marginBottom:'4px' }}>
                        {img.category}
                      </span>
                      <h5 style={{ fontSize:'0.85rem', fontWeight:800, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:'2px' }}>
                        {img.caption || 'No Caption Provided'}
                      </h5>
                      <span style={{ fontSize:'0.72rem', color:'var(--text-tertiary)' }}>Order Index: {img.order}</span>
                    </div>

                    {/* Order Controls & Actions */}
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      
                      {/* Move Up/Down Order */}
                      <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                        <button 
                          disabled={idx === 0}
                          onClick={() => handleMoveImage(idx, 'up')}
                          style={{ background:'var(--border-light)', border:'none', borderRadius:'4px', width:'24px', height:'24px', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-secondary)', cursor:'pointer', opacity: idx === 0 ? 0.3 : 1 }}
                        >
                          ▲
                        </button>
                        <button 
                          disabled={idx === gallery.length - 1}
                          onClick={() => handleMoveImage(idx, 'down')}
                          style={{ background:'var(--border-light)', border:'none', borderRadius:'4px', width:'24px', height:'24px', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-secondary)', cursor:'pointer', opacity: idx === gallery.length - 1 ? 0.3 : 1 }}
                        >
                          ▼
                        </button>
                      </div>

                      {/* Hide/Show Toggle */}
                      <button 
                        onClick={() => handleToggleImageActive(img.id, img.isActive)}
                        style={{ background:'none', border:'none', width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', color: img.isActive ? 'var(--green-primary)' : 'var(--text-secondary)', cursor:'pointer' }}
                        title={img.isActive ? "Hide Image" : "Show Image"}
                      >
                        {img.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>

                      {/* Delete */}
                      <button 
                        onClick={() => handleDeleteImage(img.id)}
                        style={{ background:'none', border:'none', width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--red-primary)', cursor:'pointer' }}
                        title="Delete Case"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ────────────────── SUB-TAB: REVIEWS BOARD ────────────────── */}
      {activeSubTab === 'reviews' && (
        <div className="reveal-on-scroll flex-col-mobile" style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:'30px' }}>
          
          {/* Left panel: Add Testimonial Form */}
          <div className="stat-glass-card" style={{ padding:'24px', borderRadius:'24px', height:'fit-content', display:'flex', flexDirection:'column', gap:'18px' }}>
            <h3 style={{ fontFamily:'var(--font-display)', color:'var(--text-primary)', fontSize:'1.15rem', display:'flex', alignItems:'center', gap:'8px' }}>
              <Plus size={18} color="var(--green-primary)" /> Add Custom Review
            </h3>
            
            <form onSubmit={handleAddManualReview} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              <div className="flex flex-col gap-2">
                <label style={{ fontSize:'0.78rem', fontWeight:800, color:'var(--text-secondary)' }}>Patient Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Amit Sharma" 
                  value={newRevName}
                  onChange={(e) => setNewRevName(e.target.value)}
                  style={{ width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1.5px solid var(--border-light)', background:'var(--surface-card)', color:'var(--text-primary)', fontSize:'0.82rem' }}
                />
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                <div className="flex flex-col gap-2">
                  <label style={{ fontSize:'0.78rem', fontWeight:800, color:'var(--text-secondary)' }}>Rating (1-5)</label>
                  <select 
                    value={newRevRating}
                    onChange={(e) => setNewRevRating(Number(e.target.value))}
                    style={{ width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1.5px solid var(--border-light)', background:'var(--surface-card)', color:'var(--text-primary)', fontSize:'0.82rem', fontWeight:600 }}
                  >
                    <option value={5}>5 Stars ★★★★★</option>
                    <option value={4}>4 Stars ★★★★</option>
                    <option value={3}>3 Stars ★★★</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label style={{ fontSize:'0.78rem', fontWeight:800, color:'var(--text-secondary)' }}>Verified Tag</label>
                  <input 
                    type="text" 
                    placeholder="e.g. FUE Patient" 
                    value={newRevTag}
                    onChange={(e) => setNewRevTag(e.target.value)}
                    style={{ width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1.5px solid var(--border-light)', background:'var(--surface-card)', color:'var(--text-primary)', fontSize:'0.82rem' }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label style={{ fontSize:'0.78rem', fontWeight:800, color:'var(--text-secondary)' }}>Review Quote / Experience</label>
                <textarea 
                  placeholder="Type patient's review content here..." 
                  value={newRevQuote}
                  onChange={(e) => setNewRevQuote(e.target.value)}
                  rows={4}
                  style={{ width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1.5px solid var(--border-light)', background:'var(--surface-card)', color:'var(--text-primary)', fontSize:'0.82rem', resize:'none' }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label style={{ fontSize:'0.78rem', fontWeight:800, color:'var(--text-secondary)' }}>Review Source</label>
                <input 
                  type="text" 
                  placeholder="e.g. Google Maps, Practo" 
                  value={newRevSource}
                  onChange={(e) => setNewRevSource(e.target.value)}
                  style={{ width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1.5px solid var(--border-light)', background:'var(--surface-card)', color:'var(--text-primary)', fontSize:'0.82rem' }}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary haptic-btn"
                style={{ width:'100%', padding:'12px', borderRadius:'12px', fontSize:'0.88rem', fontWeight:800 }}
              >
                Post Review
              </button>
            </form>
          </div>

          {/* Right panel: Active Reviews List */}
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
              <div className="search-bar-wrapper" style={{ flex:1, position:'relative' }}>
                <Search size={16} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'var(--text-tertiary)' }} />
                <input 
                  type="text" 
                  placeholder="Search reviews..." 
                  value={reviewSearch}
                  onChange={(e) => setReviewSearch(e.target.value)}
                  style={{ width:'100%', padding:'10px 12px 10px 38px', borderRadius:'12px', border:'1.5px solid var(--border-light)', background:'var(--surface-card)', color:'var(--text-primary)', fontSize:'0.88rem' }}
                />
              </div>
            </div>

            {loadingReviews ? (
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                <div className="skeleton" style={{ height:'100px', borderRadius:'16px' }} />
                <div className="skeleton" style={{ height:'100px', borderRadius:'16px' }} />
              </div>
            ) : filteredReviews.length === 0 ? (
              <div style={{ textAlign:'center', padding:'48px 16px', background:'rgba(255,255,255,0.02)', border:'1.5px dashed var(--border-light)', borderRadius:'24px' }}>
                <Star size={32} style={{ color:'var(--text-tertiary)', marginBottom:'12px' }} />
                <h4 style={{ color:'var(--text-primary)', marginBottom:'4px' }}>No Reviews Found</h4>
                <p style={{ color:'var(--text-secondary)', fontSize:'0.85rem' }}>Add custom reviews to display testimonials.</p>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                {filteredReviews.map((rev) => (
                  <div 
                    key={rev.id} 
                    className="stat-glass-card" 
                    style={{ 
                      padding:'16px', 
                      borderRadius:'16px', 
                      display:'flex', 
                      flexDirection:'column', 
                      gap:'10px',
                      opacity: rev.isVisible ? 1 : 0.5,
                      border: rev.isPinned ? '1px solid var(--green-primary)' : '1px solid var(--border-light)'
                    }}
                  >
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                      <div>
                        <h5 style={{ fontSize:'0.9rem', fontWeight:800, color:'var(--text-primary)', display:'flex', alignItems:'center', gap:'6px' }}>
                          {rev.name}
                          {rev.isPinned && <Pin size={12} color="var(--green-primary)" fill="var(--green-primary)" />}
                        </h5>
                        <span style={{ fontSize:'0.72rem', color:'var(--text-tertiary)' }}>{rev.tag} • {rev.source}</span>
                      </div>
                      
                      <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                        <span style={{ fontSize:'0.85rem', fontWeight:800, color:'var(--yellow-primary)' }}>{rev.rating} ★</span>
                      </div>
                    </div>

                    <p style={{ fontSize:'0.82rem', color:'var(--text-secondary)', fontStyle:'italic', lineHeight:'1.5' }}>
                      "{rev.quote}"
                    </p>

                    <div style={{ display:'flex', justifyContent:'flex-end', gap:'8px', borderTop:'1px solid var(--border-light)', paddingTop:'8px' }}>
                      <button 
                        onClick={() => handleToggleReviewPin(rev.id, rev.isPinned)}
                        className="btn btn-secondary"
                        style={{ padding:'4px 8px', fontSize:'0.72rem', borderRadius:'6px', display:'flex', alignItems:'center', gap:'4px' }}
                      >
                        <Pin size={10} /> {rev.isPinned ? 'Unpin' : 'Pin Review'}
                      </button>
                      <button 
                        onClick={() => handleToggleReviewVisible(rev.id, rev.isVisible)}
                        className="btn btn-secondary"
                        style={{ padding:'4px 8px', fontSize:'0.72rem', borderRadius:'6px', display:'flex', alignItems:'center', gap:'4px' }}
                      >
                        {rev.isVisible ? <EyeOff size={10} /> : <Eye size={10} />} {rev.isVisible ? 'Hide' : 'Publish'}
                      </button>
                      <button 
                        onClick={() => handleDeleteReview(rev.id)}
                        className="btn btn-secondary"
                        style={{ padding:'4px 8px', fontSize:'0.72rem', borderRadius:'6px', color:'var(--red-primary)', border:'none', background:'none' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ────────────────── SUB-TAB: CLINIC CONFIGS ────────────────── */}
      {activeSubTab === 'settings' && (
        <div className="reveal-on-scroll" style={{ maxWidth:'600px', width:'100%', margin:'0 auto' }}>
          <div className="stat-glass-card" style={{ padding:'28px', borderRadius:'24px', display:'flex', flexDirection:'column', gap:'20px' }}>
            <h3 style={{ fontFamily:'var(--font-display)', color:'var(--text-primary)', fontSize:'1.25rem', borderBottom:'1px solid var(--border-light)', paddingBottom:'12px', display:'flex', alignItems:'center', gap:'8px' }}>
              <Settings size={20} color="var(--green-primary)" /> Core Clinic Configurations
            </h3>

            <form onSubmit={handleSaveSettings} style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
              
              {/* Ribbon Announcement */}
              <div className="flex flex-col gap-2">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <label style={{ fontSize:'0.82rem', fontWeight:800, color:'var(--text-secondary)' }}>Announcement Ribbon Text</label>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={clinicSettings.isAnnouncementActive} 
                      onChange={(e) => setClinicSettings({ ...clinicSettings, isAnnouncementActive: e.target.checked })} 
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <input 
                  type="text" 
                  value={clinicSettings.announcementBanner}
                  onChange={(e) => setClinicSettings({ ...clinicSettings, announcementBanner: e.target.value })}
                  style={{ width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1.5px solid var(--border-light)', background:'var(--surface-card)', color:'var(--text-primary)', fontSize:'0.85rem' }}
                  disabled={!clinicSettings.isAnnouncementActive}
                />
              </div>

              {/* WhatsApp Link Number */}
              <div className="flex flex-col gap-2">
                <label style={{ fontSize:'0.82rem', fontWeight:800, color:'var(--text-secondary)' }}>WhatsApp Contact Link Number</label>
                <input 
                  type="text" 
                  value={clinicSettings.whatsappNumber}
                  onChange={(e) => setClinicSettings({ ...clinicSettings, whatsappNumber: e.target.value })}
                  style={{ width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1.5px solid var(--border-light)', background:'var(--surface-card)', color:'var(--text-primary)', fontSize:'0.85rem' }}
                />
                <span style={{ fontSize:'0.68rem', color:'var(--text-tertiary)' }}>Format: include country code without space/plus (e.g. 918899708659)</span>
              </div>

              {/* Urgency Settings */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <div className="flex flex-col gap-2">
                  <label style={{ fontSize:'0.82rem', fontWeight:800, color:'var(--text-secondary)' }}>Urgent Slots Display Count</label>
                  <input 
                    type="number" 
                    min={1} 
                    max={10}
                    value={clinicSettings.slotsAvailable}
                    onChange={(e) => setClinicSettings({ ...clinicSettings, slotsAvailable: Number(e.target.value) })}
                    style={{ width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1.5px solid var(--border-light)', background:'var(--surface-card)', color:'var(--text-primary)', fontSize:'0.85rem', fontWeight:700 }}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label style={{ fontSize:'0.82rem', fontWeight:800, color:'var(--text-secondary)' }}>Urgency Special Offer Text</label>
                  <input 
                    type="text" 
                    value={clinicSettings.specialOffer}
                    onChange={(e) => setClinicSettings({ ...clinicSettings, specialOffer: e.target.value })}
                    style={{ width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1.5px solid var(--border-light)', background:'var(--surface-card)', color:'var(--text-primary)', fontSize:'0.85rem' }}
                  />
                </div>
              </div>

              {/* ── NEW ELEMENT EDITORS ── */}
              <div style={{ borderTop:'1px solid var(--border-light)', paddingTop:'16px', marginTop:'6px' }} />

              {/* Hero Content CMS */}
              <div className="flex flex-col gap-2">
                <label style={{ fontSize:'0.82rem', fontWeight:800, color:'var(--text-secondary)' }}>Hero Section Description Paragraph</label>
                <textarea 
                  rows={3}
                  value={clinicSettings.heroDescription || ''}
                  onChange={(e) => setClinicSettings({ ...clinicSettings, heroDescription: e.target.value })}
                  placeholder="Welcome to Hair Haven, Jammu's premier aesthetic surgical center..."
                  style={{ width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1.5px solid var(--border-light)', background:'var(--surface-card)', color:'var(--text-primary)', fontSize:'0.85rem', fontFamily:'var(--font-ui)', resize:'vertical', lineHeight:'1.5' }}
                />
              </div>

              {/* Founder Profile Details CMS */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <div className="flex flex-col gap-2">
                  <label style={{ fontSize:'0.82rem', fontWeight:800, color:'var(--text-secondary)' }}>Founder Full Name</label>
                  <input 
                    type="text" 
                    value={clinicSettings.founderName || ''}
                    onChange={(e) => setClinicSettings({ ...clinicSettings, founderName: e.target.value })}
                    placeholder="Mr. Harish Kalsotra"
                    style={{ width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1.5px solid var(--border-light)', background:'var(--surface-card)', color:'var(--text-primary)', fontSize:'0.85rem' }}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label style={{ fontSize:'0.82rem', fontWeight:800, color:'var(--text-secondary)' }}>Founder Role/Title</label>
                  <input 
                    type="text" 
                    value={clinicSettings.founderRole || ''}
                    onChange={(e) => setClinicSettings({ ...clinicSettings, founderRole: e.target.value })}
                    placeholder="(Founder & Client Relations Executive)"
                    style={{ width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1.5px solid var(--border-light)', background:'var(--surface-card)', color:'var(--text-primary)', fontSize:'0.85rem' }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label style={{ fontSize:'0.82rem', fontWeight:800, color:'var(--text-secondary)' }}>Founder Highlight Quote</label>
                <textarea 
                  rows={2}
                  value={clinicSettings.founderQuote || ''}
                  onChange={(e) => setClinicSettings({ ...clinicSettings, founderQuote: e.target.value })}
                  placeholder="Dedicated to helping clients regain confidence..."
                  style={{ width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1.5px solid var(--border-light)', background:'var(--surface-card)', color:'var(--text-primary)', fontSize:'0.85rem', fontFamily:'var(--font-ui)', resize:'vertical', lineHeight:'1.5' }}
                />
              </div>

              {/* Dynamic Themes & Fonts CMS */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <div className="flex flex-col gap-2">
                  <label style={{ fontSize:'0.82rem', fontWeight:800, color:'var(--text-secondary)' }}>Active Color Theme</label>
                  <select 
                    value={clinicSettings.colorTheme || 'Emerald Green'}
                    onChange={(e) => setClinicSettings({ ...clinicSettings, colorTheme: e.target.value })}
                    style={{ width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1.5px solid var(--border-light)', background:'var(--surface-card)', color:'var(--text-primary)', fontSize:'0.85rem', fontWeight:700, cursor:'pointer', outline:'none' }}
                  >
                    <option value="Emerald Green">🟢 Emerald Green (Default)</option>
                    <option value="Sapphire Blue">🔵 Sapphire Blue</option>
                    <option value="Amethyst Purple">🟣 Amethyst Purple</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label style={{ fontSize:'0.82rem', fontWeight:800, color:'var(--text-secondary)' }}>UI Display Font</label>
                  <select 
                    value={clinicSettings.fontTheme || 'Outfit'}
                    onChange={(e) => setClinicSettings({ ...clinicSettings, fontTheme: e.target.value })}
                    style={{ width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1.5px solid var(--border-light)', background:'var(--surface-card)', color:'var(--text-primary)', fontSize:'0.85rem', fontWeight:700, cursor:'pointer', outline:'none' }}
                  >
                    <option value="Outfit">Outfit (Default Sans)</option>
                    <option value="Playfair Display">Playfair Display (Serif)</option>
                    <option value="Cinzel">Cinzel (Roman Luxury)</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary haptic-btn"
                disabled={savingSettings}
                style={{ width:'100%', padding:'14px', borderRadius:'12px', fontSize:'0.9rem', fontWeight:800, marginTop:'10px' }}
              >
                {savingSettings ? 'Saving Configurations...' : '💾 Save Configurations'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────── PASS MODAL (QR CODE GENERATION) ────────────────── */}
      {selectedBookingPass && (
        <div style={{ 
          position:'fixed', top:0, left:0, right:0, bottom:0, 
          background:'rgba(0,0,0,0.7)', backdropFilter:'blur(8px)', 
          zIndex:200000, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' 
        }}>
          <div 
            className="gradient-border-card" 
            style={{ 
              background:'var(--surface-card)', 
              borderRadius:'24px', 
              padding:'24px', 
              maxWidth:'400px', 
              width:'100%', 
              display:'flex', 
              flexDirection:'column', 
              alignItems:'center', 
              position:'relative' 
            }}
          >
            <button 
              onClick={() => setSelectedBookingPass(null)}
              style={{ position:'absolute', top:'16px', right:'16px', background:'none', border:'none', color:'var(--text-secondary)', cursor:'pointer' }}
            >
              <X size={20} />
            </button>

            <span style={{ fontSize:'0.75rem', fontWeight:800, color:'var(--gemini-purple)', letterSpacing:'0.05em', textTransform:'uppercase', marginBottom:'8px' }}>
              Patient Consultation Pass
            </span>
            
            <h3 style={{ color:'var(--text-primary)', marginBottom:'16px', fontFamily:'var(--font-display)', textAlign:'center' }}>
              {selectedBookingPass.fullName}
            </h3>

            {/* QR Code Container using QRServer API */}
            <div style={{ 
              background:'#ffffff', 
              padding:'12px', 
              borderRadius:'16px', 
              border:'1.5px solid var(--border-light)', 
              boxShadow:'var(--shadow-sm)',
              marginBottom:'16px' 
            }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  `Hair Haven ID: ${selectedBookingPass.id}\nPatient: ${selectedBookingPass.fullName}\nDate: ${selectedBookingPass.date}\nTime: ${selectedBookingPass.time}\nService: ${selectedBookingPass.service}`
                )}`} 
                alt="Booking Pass QR Code" 
                style={{ display:'block', width:'180px', height:'180px' }}
              />
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'6px', width:'100%', textTransform:'uppercase', fontSize:'0.65rem', fontWeight:800, color:'var(--text-tertiary)', borderTop:'1px dashed var(--border-light)', paddingTop:'16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span>Booking ID</span>
                <span style={{ color:'var(--text-primary)' }}>{selectedBookingPass.id.substring(0, 10)}...</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span>Treatment</span>
                <span style={{ color:'var(--text-primary)' }}>{selectedBookingPass.service}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span>Slot</span>
                <span style={{ color:'var(--text-primary)' }}>{selectedBookingPass.date} at {selectedBookingPass.time}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span>Status</span>
                <span style={{ color:'var(--green-primary)' }}>{selectedBookingPass.status}</span>
              </div>
            </div>

            <button 
              className="btn btn-secondary haptic-btn"
              onClick={() => {
                navigator.clipboard.writeText(selectedBookingPass.id);
                showToast("Booking ID copied to clipboard!", "success");
              }}
              style={{ width:'100%', marginTop:'16px', padding:'10px', fontSize:'0.82rem', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}
            >
              <Copy size={14} /> Copy Booking Pass ID
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

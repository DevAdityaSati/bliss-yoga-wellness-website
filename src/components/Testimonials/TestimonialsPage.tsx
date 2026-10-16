import { useState, useEffect, FormEvent, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Star,
  Quote,
  ChevronLeft,
  ChevronRight,
  Globe,
  Sparkles,
  MessageSquarePlus,
  X,
  CheckCircle,
  Search,
  Filter,
  Grid,
  List,
  ArrowUpDown,
  Maximize2,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react';
import { TestimonialItem } from '../../types';
import { getTestimonials, createTestimonial } from '../../services/testimonialService';
import { getCurrentUser } from '../../services/authService';
import { getAllBookings } from '../../services/bookingService';

interface TestimonialsPageProps {
  onOpenBookingModal: () => void;
}

function AvatarBadge({ name, avatar }: { name: string; avatar?: string }) {
  const [imgError, setImgError] = useState(false);

  const getInitials = (str: string) => {
    if (!str) return 'S';
    const parts = str.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  if (avatar && avatar.trim() !== '' && !imgError) {
    return (
      <img
        src={avatar}
        alt={name}
        onError={() => setImgError(true)}
        className="w-12 h-12 rounded-full object-cover border-2 border-[#c5a059]/40 shadow-md shrink-0 bg-[#121412]"
      />
    );
  }

  return (
    <div className="w-12 h-12 rounded-full bg-[#121412] border-2 border-[#c5a059]/40 text-[#c5a059] flex items-center justify-center font-bold text-sm tracking-wider uppercase shadow-md shrink-0 select-none">
      {getInitials(name)}
    </div>
  );
}

export default function TestimonialsPage({ onOpenBookingModal }: TestimonialsPageProps) {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileIndex, setMobileIndex] = useState(0);

  // Search, Filter, Sort & View Modes
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<'all' | '5' | '4' | '3'>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'verified'>('all');
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'rating-desc' | 'rating-asc'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'scroll'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modal to read full testimonial
  const [expandedTestimonial, setExpandedTestimonial] = useState<TestimonialItem | null>(null);

  // Review Submission Modal State
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('United States');
  const [program, setProgram] = useState('Hatha Yoga & Wellness');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  // Gmail Profile Photo Permission State
  const [allowGmailPhoto, setAllowGmailPhoto] = useState(false);
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string | null>(null);

  const [submitNotice, setSubmitNotice] = useState<{ title: string; desc: string; isVerified: boolean } | null>(null);

  useEffect(() => {
    loadTestimonials();
    checkCurrentUser();
  }, []);

  const loadTestimonials = async () => {
    setLoading(true);
    try {
      const [data, bookings] = await Promise.all([
        getTestimonials(),
        getAllBookings(),
      ]);

      const updatedData = data.map(t => {
        if (t.is_verified_student === true) return t;
        const matched = bookings.some(b =>
          (t.email && b.email && b.email.trim().toLowerCase() === t.email.trim().toLowerCase()) ||
          (t.name && b.full_name && b.full_name.trim().toLowerCase() === t.name.trim().toLowerCase())
        );
        return { ...t, is_verified_student: matched };
      });

      setTestimonials(updatedData.filter(t => t.is_approved !== false));
    } catch (e) {
      console.warn('Error loading testimonials:', e);
      const data = await getTestimonials();
      setTestimonials(data.filter(t => t.is_approved !== false));
    } finally {
      setLoading(false);
    }
  };

  const checkCurrentUser = async () => {
    const user = await getCurrentUser();
    if (user) {
      if (user.full_name) setName(user.full_name);
      if (user.email) setEmail(user.email);
      if (user.country) setCountry(user.country);
      if (user.avatar_url) setCurrentUserAvatar(user.avatar_url);
    }
  };

  const isGmailEmail = email.trim().toLowerCase().endsWith('@gmail.com') || email.trim().toLowerCase().includes('gmail.com');

  const handleSubmitReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !reviewText.trim()) return;

    const cleanEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      alert('Please enter a valid email address to submit your review.');
      return;
    }

    setIsSubmitting(true);

    let finalAvatar = '';
    if (isGmailEmail && allowGmailPhoto) {
      finalAvatar = currentUserAvatar || `https://unavatar.io/gmail/${encodeURIComponent(cleanEmail)}`;
    }

    try {
      const allBookings = await getAllBookings();
      const isAttendee = allBookings.some(b =>
        (cleanEmail && b.email && b.email.trim().toLowerCase() === cleanEmail.toLowerCase()) ||
        (name.trim() && b.full_name && b.full_name.trim().toLowerCase() === name.trim().toLowerCase())
      );

      const newReview = await createTestimonial({
        name: name.trim(),
        email: cleanEmail,
        country: country.trim() || 'United States',
        program: program.trim() || 'Hatha Yoga & Wellness',
        rating: rating,
        avatar: finalAvatar,
        testimonial: reviewText.trim(),
        is_approved: true,
        is_verified_student: isAttendee,
      });

      setTestimonials((prev) => [newReview, ...prev]);
      setSubmitNotice({
        title: 'Review Published Live!',
        desc: isAttendee
          ? 'Thank you! As a verified program attendee, your review is now live on the website.'
          : 'Thank you! Your review has been published live on the website.',
        isVerified: true,
      });

      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setSubmitNotice(null);
        setShowWriteModal(false);
        setReviewText('');
      }, 3500);
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Metrics
  const totalReviewsCount = testimonials.length;
  const avgRating = useMemo(() => {
    if (testimonials.length === 0) return '5.0';
    const sum = testimonials.reduce((acc, t) => acc + (t.rating || 5), 0);
    return (sum / testimonials.length).toFixed(1);
  }, [testimonials]);

  const verifiedCount = useMemo(() => {
    return testimonials.filter(t => t.is_verified_student).length;
  }, [testimonials]);

  // Unique program options
  const programOptions = useMemo(() => {
    const set = new Set<string>();
    testimonials.forEach(t => {
      if (t.program) set.add(t.program);
    });
    return Array.from(set);
  }, [testimonials]);

  // Filtered & Sorted List
  const filteredTestimonials = useMemo(() => {
    return testimonials
      .filter((item) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = item.name?.toLowerCase().includes(q);
          const matchText = item.testimonial?.toLowerCase().includes(q);
          const matchCountry = item.country?.toLowerCase().includes(q);
          const matchProgram = item.program?.toLowerCase().includes(q);
          if (!matchName && !matchText && !matchCountry && !matchProgram) return false;
        }

        if (ratingFilter !== 'all') {
          const r = parseInt(ratingFilter, 10);
          if (item.rating !== r) return false;
        }

        if (verifiedFilter === 'verified' && !item.is_verified_student) {
          return false;
        }

        if (programFilter !== 'all') {
          if (item.program?.toLowerCase() !== programFilter.toLowerCase()) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating-desc') return (b.rating || 5) - (a.rating || 5);
        if (sortBy === 'rating-asc') return (a.rating || 5) - (b.rating || 5);
        if (a.created_at && b.created_at) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return 0;
      });
  }, [testimonials, searchQuery, ratingFilter, verifiedFilter, programFilter, sortBy]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setMobileIndex(0);
  }, [searchQuery, ratingFilter, verifiedFilter, programFilter, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredTestimonials.length / itemsPerPage) || 1;
  const paginatedTestimonials = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTestimonials.slice(start, start + itemsPerPage);
  }, [filteredTestimonials, currentPage, itemsPerPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      const element = document.getElementById('testimonials-container');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const nextMobile = () => {
    if (filteredTestimonials.length === 0) return;
    setMobileIndex((prev) => (prev + 1) % filteredTestimonials.length);
  };

  const prevMobile = () => {
    if (filteredTestimonials.length === 0) return;
    setMobileIndex((prev) => (prev - 1 + filteredTestimonials.length) % filteredTestimonials.length);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setRatingFilter('all');
    setVerifiedFilter('all');
    setProgramFilter('all');
    setSortBy('newest');
  };

  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Page Header */}
      <section className="text-center max-w-3xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-[#c5a059]/30 text-[#c5a059] text-xs font-semibold tracking-wider uppercase backdrop-blur-md"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
          <span>Real Stories From Global Students</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#f4f1ea]"
        >
          Trusted by Students <span className="italic text-[#c5a059]">Around the World</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-base sm:text-lg text-white/80 font-light leading-relaxed max-w-2xl mx-auto"
        >
          Discover how live online instruction with Bliss Yoga & Wellness has helped practitioners across
          different continents build strength, relieve pain, and cultivate deep daily peace.
        </motion.p>

        {/* Action Button: Write Review */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-wrap items-center justify-center gap-3 pt-2"
        >
          <button
            onClick={() => setShowWriteModal(true)}
            className="px-6 py-3 rounded-2xl bg-[#c5a059] hover:bg-[#d4af37] text-[#121412] font-semibold text-xs tracking-wider uppercase transition-all shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Write a Review</span>
          </button>
        </motion.div>
      </section>

      {/* Trust & Community Summary Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-3xl bg-white/[0.03] border border-white/10 shadow-xl backdrop-blur-xl">
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-1 text-[#c5a059] font-serif text-2xl sm:text-3xl font-bold">
            <Star className="w-5 h-5 fill-current" />
            <span>{avgRating}</span>
          </div>
          <p className="text-[11px] text-white/60 font-medium uppercase tracking-wider">Average Rating</p>
        </div>

        <div className="text-center space-y-1 border-l border-white/10">
          <div className="text-[#f4f1ea] font-serif text-2xl sm:text-3xl font-bold">
            {totalReviewsCount}
          </div>
          <p className="text-[11px] text-white/60 font-medium uppercase tracking-wider">Total Reviews</p>
        </div>

        <div className="text-center space-y-1 border-l border-white/10">
          <div className="text-emerald-400 font-serif text-2xl sm:text-3xl font-bold flex items-center justify-center gap-1">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span>{verifiedCount}</span>
          </div>
          <p className="text-[11px] text-white/60 font-medium uppercase tracking-wider">Verified Students</p>
        </div>

        <div className="text-center space-y-1 border-l border-white/10">
          <div className="text-[#94a388] font-serif text-2xl sm:text-3xl font-bold">
            100%
          </div>
          <p className="text-[11px] text-white/60 font-medium uppercase tracking-wider">Authentic Experiences</p>
        </div>
      </div>

      {/* Consistent Layout Control Toolbar (Search, Filter, Sort, View Modes) */}
      <div id="testimonials-container" className="scroll-mt-32 space-y-6">
        <div className="p-4 sm:p-5 rounded-3xl bg-[#161a16] border border-white/15 shadow-xl space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student name, keyword, or country..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#c5a059] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Filter Selectors & View Mode Controls */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              {/* Rating Filter */}
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-2xl px-3 py-1.5 text-xs">
                <Filter className="w-3.5 h-3.5 text-[#c5a059]" />
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value as any)}
                  className="bg-transparent text-white/90 text-xs focus:outline-none cursor-pointer font-medium"
                >
                  <option value="all" className="bg-[#161a16] text-white">All Ratings</option>
                  <option value="5" className="bg-[#161a16] text-white">5 Stars Only</option>
                  <option value="4" className="bg-[#161a16] text-white">4 Stars Only</option>
                </select>
              </div>

              {/* Verified Filter */}
              <button
                onClick={() => setVerifiedFilter(verifiedFilter === 'all' ? 'verified' : 'all')}
                className={`px-3 py-2 rounded-2xl border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  verifiedFilter === 'verified'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : 'bg-white/5 border-white/10 text-white/70 hover:text-white'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Verified Only</span>
              </button>

              {/* Program Filter if available */}
              {programOptions.length > 0 && (
                <div className="hidden sm:flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-2xl px-3 py-1.5 text-xs">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#c5a059]" />
                  <select
                    value={programFilter}
                    onChange={(e) => setProgramFilter(e.target.value)}
                    className="bg-transparent text-white/90 text-xs focus:outline-none cursor-pointer font-medium max-w-[140px] truncate"
                  >
                    <option value="all" className="bg-[#161a16] text-white">All Programs</option>
                    {programOptions.map(prog => (
                      <option key={prog} value={prog} className="bg-[#161a16] text-white">{prog}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Sort By */}
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-2xl px-3 py-1.5 text-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#c5a059]" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-white/90 text-xs focus:outline-none cursor-pointer font-medium"
                >
                  <option value="newest" className="bg-[#161a16] text-white">Newest First</option>
                  <option value="rating-desc" className="bg-[#161a16] text-white">Highest Rated</option>
                  <option value="rating-asc" className="bg-[#161a16] text-white">Lowest Rated</option>
                </select>
              </div>

              {/* View Mode Switcher (Grid Paginated vs Fixed Height Scroll) */}
              <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-2xl p-1 gap-1">
                <button
                  onClick={() => setViewMode('grid')}
                  title="Paginated Grid View (Fixed Cards per Page)"
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    viewMode === 'grid' ? 'bg-[#c5a059] text-[#121412]' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('scroll')}
                  title="Scrollable Wall View (Fixed Frame Height)"
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    viewMode === 'scroll' ? 'bg-[#c5a059] text-[#121412]' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters Display & Reset */}
          {(searchQuery || ratingFilter !== 'all' || verifiedFilter !== 'all' || programFilter !== 'all') && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs">
              <div className="flex items-center gap-2 text-white/60">
                <span>Active filters:</span>
                <span className="text-[#c5a059] font-medium">
                  {filteredTestimonials.length} of {totalReviewsCount} reviews matching
                </span>
              </div>
              <button
                onClick={resetFilters}
                className="text-[#c5a059] hover:underline flex items-center gap-1 text-xs cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset all filters</span>
              </button>
            </div>
          )}
        </div>

        {/* Testimonials Display Section */}
        {loading ? (
          <div className="py-20 text-center text-white/60 space-y-3 bg-white/[0.02] rounded-3xl border border-white/10">
            <div className="w-8 h-8 mx-auto border-2 border-[#c5a059] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs">Loading verified student reviews...</p>
          </div>
        ) : filteredTestimonials.length === 0 ? (
          /* Empty State */
          <div className="py-16 text-center space-y-4 bg-white/[0.02] rounded-3xl border border-white/10 p-8">
            <div className="w-12 h-12 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#c5a059]">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg text-[#f4f1ea] font-medium">No reviews found matching your search</h3>
            <p className="text-xs text-white/60 max-w-md mx-auto">
              Try adjusting your search keywords, rating filters, or clearing active filters to view all student stories.
            </p>
            <button
              onClick={resetFilters}
              className="px-5 py-2.5 rounded-2xl bg-[#c5a059]/20 border border-[#c5a059]/40 text-[#c5a059] hover:bg-[#c5a059] hover:text-[#121412] text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* Desktop View Mode 1: Paginated Grid View */}
            {viewMode === 'grid' && (
              <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
                {paginatedTestimonials.map((item, index) => {
                  const isLongText = (item.testimonial?.length || 0) > 180;
                  return (
                    <motion.div
                      key={item.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-[#c5a059]/40 hover:bg-white/[0.06] transition-all duration-300 space-y-4 relative shadow-xl backdrop-blur-xl flex flex-col justify-between group"
                    >
                      <div className="space-y-4">
                        {/* Top Quote & Rating */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {[...Array(item.rating || 5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-[#c5a059] text-[#c5a059]" />
                            ))}
                          </div>
                          <Quote className="w-6 h-6 text-[#c5a059]/30 group-hover:text-[#c5a059]/60 transition-colors" />
                        </div>

                        {/* Clamped Review Text to enforce card height uniformity */}
                        <div className="relative">
                          <p className="text-sm text-white/85 font-light leading-relaxed italic line-clamp-5">
                            "{item.testimonial}"
                          </p>
                          {isLongText && (
                            <button
                              onClick={() => setExpandedTestimonial(item)}
                              className="mt-2 text-xs font-semibold text-[#c5a059] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <span>Read full review</span>
                              <Maximize2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* User Profile Footer */}
                      <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3.5 overflow-hidden">
                          <AvatarBadge name={item.name} avatar={item.avatar} />
                          <div className="space-y-0.5 overflow-hidden">
                            <h3 className="font-serif text-sm text-[#f4f1ea] font-medium truncate">{item.name}</h3>
                            <div className="flex items-center gap-1.5 text-xs text-white/60">
                              <span className="text-[#94a388] font-medium">{item.country || 'Global'}</span>
                              <span>•</span>
                              <span className="truncate text-white/50">{item.program || 'Yoga Student'}</span>
                            </div>
                          </div>
                        </div>
                        {item.is_verified_student ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-medium flex items-center gap-1 shrink-0">
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            Verified
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-medium flex items-center gap-1 shrink-0">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            Community
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Desktop View Mode 2: Scrollable Wall View (Fixed Frame Height ~680px) */}
            {viewMode === 'scroll' && (
              <div className="hidden md:block rounded-3xl bg-white/[0.02] border border-white/15 p-6 shadow-2xl relative">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10 text-xs text-white/60">
                  <span className="flex items-center gap-2">
                    <List className="w-4 h-4 text-[#c5a059]" />
                    <span>Scrollable Testimonial Stream ({filteredTestimonials.length} reviews)</span>
                  </span>
                  <span className="text-white/40">Scroll inside panel to explore</span>
                </div>

                <div className="max-h-[660px] overflow-y-auto pr-3 space-y-4 [scrollbar-width:thin] [::-webkit-scrollbar]:w-2 [::-webkit-scrollbar-track]:bg-white/5 [::-webkit-scrollbar-thumb]:bg-[#c5a059]/40 [::-webkit-scrollbar-thumb]:rounded-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTestimonials.map((item, index) => (
                      <div
                        key={item.id || index}
                        className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#c5a059]/40 hover:bg-white/[0.05] transition-all space-y-3 relative shadow-md flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              {[...Array(item.rating || 5)].map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-[#c5a059] text-[#c5a059]" />
                              ))}
                            </div>
                            <Quote className="w-5 h-5 text-[#c5a059]/30" />
                          </div>
                          <p className="text-xs text-white/85 font-light leading-relaxed italic">
                            "{item.testimonial}"
                          </p>
                        </div>

                        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <AvatarBadge name={item.name} avatar={item.avatar} />
                            <div className="truncate">
                              <h4 className="font-serif text-xs text-[#f4f1ea] font-medium truncate">{item.name}</h4>
                              <p className="text-[10px] text-white/50 truncate">{item.country || 'Global'} • {item.program}</p>
                            </div>
                          </div>
                          {item.is_verified_student && (
                            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Pagination Controls for Grid Mode */}
            {viewMode === 'grid' && totalPages > 1 && (
              <div className="hidden md:flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
                <p className="text-xs text-white/60">
                  Showing <span className="text-[#f4f1ea] font-semibold">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="text-[#f4f1ea] font-semibold">
                    {Math.min(currentPage * itemsPerPage, filteredTestimonials.length)}
                  </span>{' '}
                  of <span className="text-[#f4f1ea] font-semibold">{filteredTestimonials.length}</span> reviews
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    aria-label="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1 px-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                      // Compact pagination logic if many pages exist
                      if (
                        totalPages > 7 &&
                        pageNum !== 1 &&
                        pageNum !== totalPages &&
                        Math.abs(pageNum - currentPage) > 1
                      ) {
                        if (pageNum === 2 && currentPage > 3) return <span key={pageNum} className="text-white/30 text-xs px-1">...</span>;
                        if (pageNum === totalPages - 1 && currentPage < totalPages - 2) return <span key={pageNum} className="text-white/30 text-xs px-1">...</span>;
                        return null;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-8 h-8 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            pageNum === currentPage
                              ? 'bg-[#c5a059] text-[#121412] shadow-md'
                              : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    aria-label="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Carousel / Stacked Feed with Compact Slide Controls */}
            {filteredTestimonials.length > 0 && (
              <div className="md:hidden space-y-6">
                <div className="relative overflow-hidden p-1">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={filteredTestimonials[mobileIndex]?.id || mobileIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="p-6 rounded-3xl bg-white/[0.04] border border-white/15 space-y-5 backdrop-blur-xl shadow-2xl"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {[...Array(filteredTestimonials[mobileIndex]?.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-[#c5a059] text-[#c5a059]" />
                          ))}
                        </div>
                        <span className="text-xs font-medium text-[#94a388] flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5" />
                          {filteredTestimonials[mobileIndex]?.country || 'Global'}
                        </span>
                      </div>

                      <p className="text-sm text-white/90 font-light leading-relaxed italic">
                        "{filteredTestimonials[mobileIndex]?.testimonial}"
                      </p>

                      <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3.5 overflow-hidden">
                          <AvatarBadge
                            name={filteredTestimonials[mobileIndex]?.name || ''}
                            avatar={filteredTestimonials[mobileIndex]?.avatar}
                          />
                          <div className="truncate">
                            <h3 className="font-serif text-sm text-[#f4f1ea] font-medium truncate">
                              {filteredTestimonials[mobileIndex]?.name}
                            </h3>
                            <p className="text-xs text-[#c5a059] truncate">
                              {filteredTestimonials[mobileIndex]?.program}
                            </p>
                          </div>
                        </div>
                        {filteredTestimonials[mobileIndex]?.is_verified_student ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-medium flex items-center gap-1 shrink-0">
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            Verified
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-medium flex items-center gap-1 shrink-0">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            Community
                          </span>
                        )}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Mobile Controls: Compact Counter instead of endless dots */}
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs text-white/60 font-medium">
                    Review <span className="text-[#c5a059] font-bold">{mobileIndex + 1}</span> of{' '}
                    <span className="text-[#f4f1ea]">{filteredTestimonials.length}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={prevMobile}
                      className="p-2.5 rounded-full bg-white/5 border border-white/15 text-white/80 hover:text-white cursor-pointer"
                      aria-label="Previous Testimonial"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextMobile}
                      className="p-2.5 rounded-full bg-white/5 border border-white/15 text-white/80 hover:text-white cursor-pointer"
                      aria-label="Next Testimonial"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Expanded Full Review Reader Modal */}
      {expandedTestimonial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-[#161a16] border border-white/20 text-[#f4f1ea] shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <AvatarBadge name={expandedTestimonial.name} avatar={expandedTestimonial.avatar} />
                <div>
                  <h3 className="font-serif text-base font-bold text-[#f4f1ea]">{expandedTestimonial.name}</h3>
                  <p className="text-xs text-[#c5a059]">{expandedTestimonial.country || 'Global'} • {expandedTestimonial.program}</p>
                </div>
              </div>
              <button
                onClick={() => setExpandedTestimonial(null)}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1">
              {[...Array(expandedTestimonial.rating || 5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#c5a059] text-[#c5a059]" />
              ))}
              {expandedTestimonial.is_verified_student && (
                <span className="ml-3 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-medium flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  Verified Attendee
                </span>
              )}
            </div>

            <p className="text-sm text-white/90 font-light leading-relaxed italic whitespace-pre-wrap">
              "{expandedTestimonial.testimonial}"
            </p>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setExpandedTestimonial(null)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Write Review Modal */}
      {showWriteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-[#161a16] border border-white/15 text-[#f4f1ea] shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquarePlus className="w-5 h-5 text-[#c5a059]" />
                <h2 className="font-serif text-xl font-bold">Write a Student Review</h2>
              </div>
              <button
                onClick={() => setShowWriteModal(false)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="py-8 text-center space-y-3">
                {submitNotice?.isVerified ? (
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                ) : (
                  <Sparkles className="w-12 h-12 text-amber-400 mx-auto animate-pulse" />
                )}
                <h3 className={`font-serif text-lg font-medium ${submitNotice?.isVerified ? 'text-emerald-300' : 'text-amber-300'}`}>
                  {submitNotice?.title || 'Thank You For Your Review!'}
                </h3>
                <p className="text-xs text-white/80 max-w-md mx-auto leading-relaxed">
                  {submitNotice?.desc || 'Your review has been saved.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
                {/* Interactive Star Rating */}
                <div className="space-y-1.5 text-center py-2 bg-white/5 rounded-2xl border border-white/10">
                  <label className="text-xs font-medium text-[#c5a059] block">Your Rating</label>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isActive = (hoverRating || rating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                        >
                          <Star
                            className={`w-7 h-7 transition-colors ${
                              isActive
                                ? 'fill-[#c5a059] text-[#c5a059]'
                                : 'text-white/30 fill-transparent'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-[11px] text-white/50 block font-light">
                    {rating === 5 ? '5 Stars - Exceptional Experience!' : `${rating} Stars Selected`}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-white/70 font-medium">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Elena Rostova"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-white/70 font-medium">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. elena@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                </div>

                {/* Gmail Profile Photo Permission Request */}
                {isGmailEmail && (
                  <div className="p-3.5 rounded-2xl bg-[#1f241f] border border-[#c5a059]/40 space-y-2.5 transition-all">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                            <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.6 1 3.9 3.5 2.1 7L5.8 9.9C6.7 7.1 9.1 5 12 5z" />
                            <path fill="#4285F4" d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.3h5.9c-.3 1.4-1 2.5-2.2 3.3l3.6 2.8c2.1-1.9 3.3-4.7 3.3-8.2z" />
                            <path fill="#FBBC05" d="M5.8 14.1c-.2-.7-.4-1.4-.4-2.1s.2-1.4.4-2.1L2.1 7C1.4 8.5 1 10.2 1 12s.4 3.5 1.1 5l3.7-2.9z" />
                            <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-2-6.2-4.6L2.1 17C3.9 20.5 7.6 23 12 23z" />
                          </svg>
                        </div>
                        <span className="font-semibold text-xs text-[#f4f1ea]">Gmail ID Recognized</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allowGmailPhoto}
                          onChange={(e) => setAllowGmailPhoto(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#c5a059]"></div>
                      </label>
                    </div>
                    <p className="text-[11px] text-white/80 font-light leading-snug">
                      Allow permission to use your Gmail profile photo for this review?
                      <span className="block mt-1 text-[10px] font-medium">
                        {allowGmailPhoto ? (
                          <span className="text-emerald-400">✓ Yes, permission granted. Your Gmail profile photo will be displayed.</span>
                        ) : (
                          <span className="text-amber-300/80">✗ No permission granted. Photo section will remain empty with name initials.</span>
                        )}
                      </span>
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-white/70 font-medium">Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="e.g. United States"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-white/70 font-medium">Program / Connection</label>
                    <select
                      value={program}
                      onChange={(e) => setProgram(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#1f241f] border border-white/10 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                    >
                      <option value="Hatha Yoga & Wellness">Hatha Yoga & Wellness</option>
                      <option value="Pranayama & Meditation">Pranayama & Meditation</option>
                      <option value="Vinyasa Flow Masterclass">Vinyasa Flow Masterclass</option>
                      <option value="Therapy & Back Pain Relief">Therapy & Back Pain Relief</option>
                      <option value="1-on-1 Personal Yoga">1-on-1 Personal Yoga</option>
                      <option value="Community Member / Website Visitor">Community Member / Website Visitor</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-white/70 font-medium">Your Review / Experience *</label>
                  <textarea
                    required
                    rows={4}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your experience with Bliss Yoga, class guidance, posture changes, or mental clarity..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#c5a059] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-2xl bg-[#c5a059] hover:bg-[#d4af37] text-[#121412] font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? 'Posting Review...' : 'Submit Review'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}

      {/* Bottom CTA Banner */}
      <section className="text-center space-y-6 pt-8 border-t border-white/10">
        <h2 className="font-serif text-2xl sm:text-3xl text-[#f4f1ea]">
          Join Our Global Online Yoga Family
        </h2>
        <p className="text-xs sm:text-sm text-white/70 max-w-xl mx-auto font-light">
          Begin your journey towards increased energy, flexibility, and mindfulness with customized live online classes.
        </p>
        <button
          onClick={onOpenBookingModal}
          className="px-8 py-3.5 rounded-2xl font-semibold text-xs tracking-wider uppercase text-[#121412] gold-gradient hover:opacity-95 shadow-xl transition-all cursor-pointer"
        >
          Book Your Session Today
        </button>
      </section>
    </div>
  );
}


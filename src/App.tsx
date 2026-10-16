import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { NavigationPage, ProgramItem, UserProfile } from './types';
import FloatingLeaves from './components/FloatingLeaves';
import FloatingSocials from './components/FloatingSocials';
import Navbar from './components/Navbar';
import HeroSection from './components/Home/HeroSection';
import TrustSection from './components/Home/TrustSection';
import ProgramPreview from './components/Home/ProgramPreview';
import WhyChooseSection from './components/Home/WhyChooseSection';
import CallToActionSection from './components/Home/CallToActionSection';
import AboutPage from './components/About/AboutPage';
import ProgramsPage from './components/Programs/ProgramsPage';
import ProgramDetailPage from './components/Programs/ProgramDetailPage';
import PricingPage from './components/Pricing/PricingPage';
import TestimonialsPage from './components/Testimonials/TestimonialsPage';
import FAQPage from './components/FAQ/FAQPage';
import Footer from './components/Footer';
import ProgramModal from './components/ProgramModal';
import BookingModal from './components/BookingModal';
import AuthModal from './components/Auth/AuthModal';
import { PremiumRegisterModal } from './components/Auth/PremiumRegisterModal';
import AdminLoginPage from './components/Admin/AdminLoginPage';
import AdminDashboard from './components/Admin/AdminDashboard';
import StudentDashboard from './components/Student/StudentDashboard';
import MetaHead from './components/SEO/MetaHead';
import ErrorBoundary from './components/Common/ErrorBoundary';
import { getCurrentUser, logoutUser } from './services/authService';

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('home');
  const [detailProgramId, setDetailProgramId] = useState<string>('hatha-yoga');
  const [selectedProgram, setSelectedProgram] = useState<ProgramItem | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [initialBookingProgramId, setInitialBookingProgramId] = useState<string | undefined>(undefined);

  // Auth State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPremiumRegisterModalOpen, setIsPremiumRegisterModalOpen] = useState(false);
  const [premiumProgramTitle, setPremiumProgramTitle] = useState('Premium Program');
  const [pendingPremiumProgramId, setPendingPremiumProgramId] = useState<string | null>(null);
  const [prefilledLoginEmail, setPrefilledLoginEmail] = useState('');

  useEffect(() => {
    // Check local session on load
    const initAuth = async () => {
      const user = await getCurrentUser();
      if (user && user.id) {
        setCurrentUser(user);
      }
    };
    initAuth();
  }, []);

  const handleNavigate = (page: NavigationPage, sectionId?: string) => {
    if (page === 'student-dashboard' && !currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    if (page === 'admin-dashboard' && (!currentUser || currentUser.role !== 'admin')) {
      setCurrentPage('admin-login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (page === 'home' && sectionId) {
      setTimeout(() => {
        const targetEl = document.getElementById(sectionId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleViewProgramDetail = (programId: string) => {
    setDetailProgramId(programId);
    setCurrentPage('program-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBookingModal = (programId?: string) => {
    if (programId === 'bliss-12day' || programId === 'bliss-15day') {
      const progTitle = programId === 'bliss-12day'
        ? '12-Day Bliss Transformation Program'
        : '15-Day Bliss Complete Wellness Program';
      
      if (!currentUser) {
        setPendingPremiumProgramId(programId);
        setPremiumProgramTitle(progTitle);
        setIsPremiumRegisterModalOpen(true);
        return;
      }
    }

    setInitialBookingProgramId(programId);
    setIsBookingModalOpen(true);
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setCurrentPage('home');
  };

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setCurrentPage('admin-dashboard');
    } else {
      if (pendingPremiumProgramId) {
        const pId = pendingPremiumProgramId;
        setPendingPremiumProgramId(null);
        setInitialBookingProgramId(pId);
        setIsBookingModalOpen(true);
      } else {
        setCurrentPage('student-dashboard');
      }
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
  };

  const pageTransition = {
    duration: 0.35,
    ease: [0.22, 1, 0.36, 1] as const,
  };

  return (
    <ErrorBoundary>
      <MetaHead />
      <div className="min-h-screen bg-[#121412] text-[#f4f1ea] relative flex flex-col font-sans selection:bg-[#c5a059] selection:text-[#121412]">
      {/* Background Floating Organic Leaf Particles */}
      <FloatingLeaves />

      {/* Global Sticky Navigation Bar (Hidden on Admin pages for full focus) */}
      {currentPage !== 'admin-login' && currentPage !== 'admin-dashboard' && (
        <Navbar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onOpenBookingModal={() => handleOpenBookingModal()}
        />
      )}

      {/* Main Page Content with Page Transitions */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {currentPage === 'home' && (
            <motion.div
              key="home-page"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              {/* Section 1: Hero */}
              <HeroSection
                onOpenBookingModal={() => handleOpenBookingModal()}
                onExplorePrograms={() => handleNavigate('programs')}
              />

              {/* Section 2: Trust Section */}
              <TrustSection />

              {/* Section 3: Program Preview */}
              <ProgramPreview
                onSelectProgram={(prog) => handleViewProgramDetail(prog.id)}
                onOpenBookingModal={(progId) => handleOpenBookingModal(progId)}
              />

              {/* Section 4: Why Choose Bliss */}
              <WhyChooseSection />

              {/* Section 5: Call To Action */}
              <CallToActionSection
                onOpenBookingModal={() => handleOpenBookingModal()}
                onExplorePrograms={() => handleNavigate('programs')}
              />
            </motion.div>
          )}

          {currentPage === 'about' && (
            <motion.div
              key="about-page"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <AboutPage
                onOpenBookingModal={() => handleOpenBookingModal()}
                onNavigateHome={() => handleNavigate('home')}
              />
            </motion.div>
          )}

          {currentPage === 'programs' && (
            <motion.div
              key="programs-page"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <ProgramsPage
                onViewDetail={handleViewProgramDetail}
                onOpenBookingModal={handleOpenBookingModal}
              />
            </motion.div>
          )}

          {currentPage === 'program-detail' && (
            <motion.div
              key="program-detail-page"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <ProgramDetailPage
                programId={detailProgramId}
                onBackToPrograms={() => handleNavigate('programs')}
                onSelectProgram={handleViewProgramDetail}
                onOpenBookingModal={handleOpenBookingModal}
              />
            </motion.div>
          )}

          {currentPage === 'pricing' && (
            <motion.div
              key="pricing-page"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <PricingPage onOpenBookingModal={handleOpenBookingModal} />
            </motion.div>
          )}

          {currentPage === 'testimonials' && (
            <motion.div
              key="testimonials-page"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <TestimonialsPage onOpenBookingModal={handleOpenBookingModal} />
            </motion.div>
          )}

          {currentPage === 'faq' && (
            <motion.div
              key="faq-page"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <FAQPage onOpenBookingModal={handleOpenBookingModal} />
            </motion.div>
          )}

          {currentPage === 'student-dashboard' && currentUser && (
            <motion.div
              key="student-dashboard-page"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <StudentDashboard
                user={currentUser}
                onLogout={handleLogout}
                onNavigateHome={() => handleNavigate('home')}
                onOpenBookingModal={() => handleOpenBookingModal()}
              />
            </motion.div>
          )}

          {currentPage === 'admin-login' && (
            <motion.div
              key="admin-login-page"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <AdminLoginPage
                onLoginSuccess={(admin) => {
                  setCurrentUser(admin);
                  setCurrentPage('admin-dashboard');
                }}
                onNavigateHome={() => handleNavigate('home')}
              />
            </motion.div>
          )}

          {currentPage === 'admin-dashboard' && currentUser && currentUser.role === 'admin' && (
            <motion.div
              key="admin-dashboard-page"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <AdminDashboard
                adminUser={currentUser}
                onLogout={handleLogout}
                onNavigateHome={() => handleNavigate('home')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global Footer (Hidden on Admin pages) */}
      {currentPage !== 'admin-login' && currentPage !== 'admin-dashboard' && (
        <Footer
          onNavigate={handleNavigate}
          onOpenBookingModal={() => handleOpenBookingModal()}
        />
      )}

      {/* Interactive Modals */}
      <ProgramModal
        program={selectedProgram}
        onClose={() => setSelectedProgram(null)}
        onBookProgram={(programId) => handleOpenBookingModal(programId)}
      />

      <BookingModal
        isOpen={isBookingModalOpen}
        initialProgramId={initialBookingProgramId}
        onClose={() => setIsBookingModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        initialEmail={prefilledLoginEmail}
      />

      <PremiumRegisterModal
        isOpen={isPremiumRegisterModalOpen}
        onClose={() => setIsPremiumRegisterModalOpen(false)}
        programTitle={premiumProgramTitle}
        onSuccessRedirectToLogin={(registeredEmail) => {
          setPrefilledLoginEmail(registeredEmail);
          setIsAuthModalOpen(true);
        }}
      />

      {/* Floating WhatsApp and Instagram Quick Action Buttons */}
      <FloatingSocials />
    </div>
    </ErrorBoundary>
  );
}



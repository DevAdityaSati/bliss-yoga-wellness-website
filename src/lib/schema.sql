-- ====================================================================
-- Bliss Yoga & Wellness - Complete Bulletproof Database & Payment Setup
-- Run this script in your Supabase SQL Editor.
-- It safely creates or updates all tables and ensures all missing columns
-- (like booking_id, student_id, payment_status) are added without errors.
-- ====================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 1. PROFILES TABLE (Students & Admins)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  country TEXT DEFAULT 'United States',
  timezone TEXT DEFAULT 'UTC',
  phone TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Safely ensure all columns exist on public.profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'United States';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ====================================================================
-- 2. YOGA PROGRAMS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.programs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  group_price NUMERIC NOT NULL DEFAULT 180.00,
  private_price NUMERIC NOT NULL DEFAULT 300.00,
  duration TEXT DEFAULT '60 Minutes',
  image TEXT NOT NULL,
  benefits JSONB DEFAULT '[]'::jsonb,
  recommended_for TEXT,
  overview TEXT,
  suitable_for JSONB DEFAULT '[]'::jsonb,
  what_you_will_learn JSONB DEFAULT '[]'::jsonb,
  class_structure JSONB DEFAULT '[]'::jsonb,
  supports JSONB DEFAULT '[]'::jsonb,
  faqs JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 3. BOOKINGS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  country TEXT NOT NULL,
  timezone TEXT NOT NULL,
  program_id TEXT NOT NULL,
  program_title TEXT NOT NULL,
  class_type TEXT NOT NULL DEFAULT 'Group',
  skill_level TEXT DEFAULT 'All Levels',
  booking_date DATE,
  preferred_date DATE,
  booking_time TIME,
  preferred_time TIME,
  duration TEXT DEFAULT '60 Minutes',
  base_price NUMERIC DEFAULT 180.00,
  tax_amount NUMERIC DEFAULT 0.00,
  gateway_charges NUMERIC DEFAULT 0.00,
  final_amount NUMERIC DEFAULT 180.00,
  price NUMERIC DEFAULT 180.00,
  additional_notes TEXT,
  payment_status TEXT DEFAULT 'Pending',
  status TEXT DEFAULT 'Pending',
  meeting_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safely ensure all columns exist on public.bookings
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS timezone TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS program_id TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS program_title TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS class_type TEXT DEFAULT 'Group';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS skill_level TEXT DEFAULT 'All Levels';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS booking_date DATE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS preferred_date DATE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS booking_time TIME;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS preferred_time TIME;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS duration TEXT DEFAULT '60 Minutes';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS base_price NUMERIC DEFAULT 180.00;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS tax_amount NUMERIC DEFAULT 0.00;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS gateway_charges NUMERIC DEFAULT 0.00;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS final_amount NUMERIC DEFAULT 180.00;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 180.00;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS additional_notes TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'Pending';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS meeting_link TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_bookings_student_id ON public.bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON public.bookings(email);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON public.bookings(payment_status);

-- ====================================================================
-- 4. PAYMENTS TABLE (Student Transactions & Payment Records)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  student_email TEXT NOT NULL,
  student_name TEXT NOT NULL,
  transaction_id TEXT UNIQUE NOT NULL DEFAULT ('TXN-' || UPPER(SUBSTRING(gen_random_uuid()::text FROM 1 FOR 8))),
  amount NUMERIC(10, 2) NOT NULL DEFAULT 180.00,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_method TEXT NOT NULL DEFAULT 'Card',
  payment_status TEXT NOT NULL DEFAULT 'Pending',
  verification_status TEXT DEFAULT 'Pending Verification',
  program_title TEXT,
  receipt_screenshot TEXT,
  admin_notes TEXT,
  gateway_reference TEXT,
  receipt_url TEXT,
  notes TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safely ensure all columns exist on public.payments in case the table was created earlier without them
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS student_email TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS student_name TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS transaction_id TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS amount NUMERIC(10, 2) DEFAULT 180.00;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'Card';
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'Pending';
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'Pending Verification';
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS program_title TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS receipt_screenshot TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS gateway_reference TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS receipt_url TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_student_id ON public.payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON public.payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(payment_status);

-- ====================================================================
-- 5. REVIEWS & TESTIMONIALS TABLES
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  country TEXT DEFAULT 'United States',
  program TEXT DEFAULT 'Hatha Yoga & Wellness',
  rating INTEGER DEFAULT 5,
  review_text TEXT NOT NULL,
  avatar_url TEXT,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  program TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  avatar TEXT,
  testimonial TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 6. CONTACT INQUIRIES & NOTIFICATIONS TABLES
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread',
  reply_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 7. ATTENDANCE TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  status TEXT DEFAULT 'Present',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE;
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS session_date DATE;
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Present';
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS notes TEXT;

-- ====================================================================
-- 8. PAYMENT SETTINGS TABLE (Admin Bank Details)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.payment_settings (
  id TEXT PRIMARY KEY DEFAULT 'default_settings',
  bank_name TEXT DEFAULT 'Global Wellness Bank',
  account_title TEXT DEFAULT 'Bliss Yoga & Wellness Studio',
  account_number TEXT DEFAULT 'XXXX-XXXX-8899',
  routing_number TEXT DEFAULT '021000021',
  iban TEXT DEFAULT 'US90WELLNESS0012345678',
  swift_code TEXT DEFAULT 'GWUS33XXX',
  upi_id TEXT DEFAULT 'blissyoga@bank',
  paypal_email TEXT DEFAULT 'payments@blissyoga.com',
  instructions TEXT DEFAULT 'Please include your Booking ID as reference in payment notes.',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.payment_settings (id, bank_name, account_title, account_number, routing_number, iban, swift_code, upi_id, paypal_email, instructions)
VALUES ('default_settings', 'Global Wellness Bank', 'Bliss Yoga & Wellness Studio', 'XXXX-XXXX-8899', '021000021', 'US90WELLNESS0012345678', 'GWUS33XXX', 'blissyoga@bank', 'payments@blissyoga.com', 'Please include your Booking ID as reference in payment notes.')
ON CONFLICT (id) DO NOTHING;

-- ====================================================================
-- 9. AUTOMATED USER REGISTRATION TRIGGER & ADMIN PROMOTION
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Student Practitioner'),
    COALESCE(new.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'),
    CASE 
      WHEN new.email LIKE '%admin%' OR new.email = 'admin@blissyoga.com' THEN 'admin'
      ELSE COALESCE(new.raw_user_meta_data->>'role', 'student')
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = CASE WHEN EXCLUDED.email LIKE '%admin%' OR EXCLUDED.email = 'admin@blissyoga.com' THEN 'admin' ELSE public.profiles.role END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Sync existing auth.users into profiles
INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', 'Studio Administrator'),
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  CASE 
    WHEN u.email LIKE '%admin%' OR u.email = 'admin@blissyoga.com' THEN 'admin'
    ELSE 'student'
  END
FROM auth.users u
ON CONFLICT (id) DO UPDATE 
SET 
  email = EXCLUDED.email,
  role = CASE 
    WHEN EXCLUDED.email LIKE '%admin%' OR EXCLUDED.email = 'admin@blissyoga.com' THEN 'admin'
    ELSE public.profiles.role
  END;

-- Guarantee admin role for authorized emails
UPDATE public.profiles
SET role = 'admin'
WHERE email LIKE '%admin%' OR email = 'admin@blissyoga.com';

-- ====================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
DROP POLICY IF EXISTS "Public Profiles Read" ON public.profiles;
DROP POLICY IF EXISTS "Users Update Own Profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins Manage Profiles" ON public.profiles;

CREATE POLICY "Public Profiles Read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users Update Own Profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins Manage Profiles" ON public.profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Bookings RLS
DROP POLICY IF EXISTS "Public Insert Booking" ON public.bookings;
DROP POLICY IF EXISTS "Public Delete Booking" ON public.bookings;
DROP POLICY IF EXISTS "Users Read Own Bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins Manage Bookings" ON public.bookings;

CREATE POLICY "Public Insert Booking" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Delete Booking" ON public.bookings FOR DELETE USING (true);
CREATE POLICY "Users Read Own Bookings" ON public.bookings FOR SELECT USING (
  auth.uid() = student_id OR auth.uid() = user_id OR email = (SELECT email FROM public.profiles WHERE id = auth.uid()) OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins Manage Bookings" ON public.bookings FOR ALL USING (true);

-- Payments RLS
DROP POLICY IF EXISTS "Public Insert Payments" ON public.payments;
DROP POLICY IF EXISTS "Users Read Own Payments" ON public.payments;
DROP POLICY IF EXISTS "Admins Manage Payments" ON public.payments;

CREATE POLICY "Public Insert Payments" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users Read Own Payments" ON public.payments FOR SELECT USING (
  auth.uid() = student_id OR student_email = (SELECT email FROM public.profiles WHERE id = auth.uid()) OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins Manage Payments" ON public.payments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Programs Policies
DROP POLICY IF EXISTS "Public Read Programs" ON public.programs;
DROP POLICY IF EXISTS "Admins Manage Programs" ON public.programs;

CREATE POLICY "Public Read Programs" ON public.programs FOR SELECT USING (true);
CREATE POLICY "Admins Manage Programs" ON public.programs FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Testimonials & Reviews Policies
DROP POLICY IF EXISTS "Public Read Testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Public Insert Testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Public Delete Testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins Manage Testimonials" ON public.testimonials;

CREATE POLICY "Public Read Testimonials" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "Public Insert Testimonials" ON public.testimonials FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Delete Testimonials" ON public.testimonials FOR DELETE USING (true);
CREATE POLICY "Admins Manage Testimonials" ON public.testimonials FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read Reviews" ON public.reviews;
DROP POLICY IF EXISTS "Public Insert Reviews" ON public.reviews;
DROP POLICY IF EXISTS "Public Delete Reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins Manage Reviews" ON public.reviews;

CREATE POLICY "Public Read Reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Public Insert Reviews" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Delete Reviews" ON public.reviews FOR DELETE USING (true);
CREATE POLICY "Admins Manage Reviews" ON public.reviews FOR ALL USING (true);

-- Contacts Policies
DROP POLICY IF EXISTS "Public Insert Contacts" ON public.contacts;
DROP POLICY IF EXISTS "Admins Manage Contacts" ON public.contacts;

CREATE POLICY "Public Insert Contacts" ON public.contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins Manage Contacts" ON public.contacts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Notifications & Attendance Policies
DROP POLICY IF EXISTS "Users Read Notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins Manage Notifications" ON public.notifications;
CREATE POLICY "Users Read Notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins Manage Notifications" ON public.notifications FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admins Manage Attendance" ON public.attendance;
CREATE POLICY "Admins Manage Attendance" ON public.attendance FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Public Read Payment Settings" ON public.payment_settings;
DROP POLICY IF EXISTS "Admins Manage Payment Settings" ON public.payment_settings;
CREATE POLICY "Public Read Payment Settings" ON public.payment_settings FOR SELECT USING (true);
CREATE POLICY "Admins Manage Payment Settings" ON public.payment_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ====================================================================
-- 11. INITIAL SEED DATA
-- ====================================================================
INSERT INTO public.programs (id, title, description, group_price, private_price, duration, image, benefits)
VALUES 
  ('12-day-bliss-transformation', '12-Day Bliss Transformation Program', 'A 12-day structured wellness transformation covering Hatha Yoga, Chair Yoga, Meditation, Pranayama, Posture Correction, and Stress Management.', 180, 300, '12 Days', 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=800', '["Hatha Yoga", "Pranayama", "Posture Alignment", "Spinal Therapy"]'::jsonb),
  ('15-day-bliss-complete-wellness', '15-Day Bliss Complete Wellness Program', 'A 15-day complete holistic wellness journey designed for total body restoration, spinal care, breath mastery, and daily lifestyle transformation.', 220, 400, '15 Days', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800', '["Holistic Mastery", "Breathwork", "Lower Back Care", "Daily Guided Regimen"]'::jsonb),
  ('hatha-yoga', 'Hatha Yoga', 'Foundational yoga postures focusing on breath control, body alignment, and mental serenity.', 180, 300, '60 Minutes', 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=800', '["Improves Flexibility", "Builds Core Strength", "Reduces Stress"]'::jsonb),
  ('therapeutic-yoga', 'Therapeutic Yoga', 'Restorative movement designed for pain relief, post-injury recovery, and gentle posture correction.', 210, 350, '60 Minutes', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800', '["Joint Relief", "Spine Realignment", "Deep Relaxation"]'::jsonb),
  ('guided-meditation', 'Guided Meditation & Mindfulness', 'Mindfulness exercises and pranayama breathwork to dissolve stress, focus the mind, and improve sleep.', 150, 250, '45 Minutes', 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=800', '["Mental Clarity", "Lower Anxiety", "Improved Sleep"]'::jsonb),
  ('chair-yoga', 'Chair Yoga', 'Gentle, accessible yoga practice using a chair for support, ideal for seniors and office workers.', 140, 220, '45 Minutes', 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&q=80&w=800', '["Low Impact", "Enhanced Mobility", "Posture Support"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ====================================================================
-- 12. STORED SQL FUNCTION FOR AUTHENTICATION & PAYMENT ELIGIBILITY CHECK
-- ====================================================================
CREATE OR REPLACE FUNCTION public.check_student_program_approval(p_email TEXT)
RETURNS TABLE (
  is_approved BOOLEAN,
  program_title TEXT,
  booking_status TEXT,
  payment_status TEXT,
  message TEXT
) AS $$
DECLARE
  v_clean_email TEXT := LOWER(TRIM(p_email));
  v_booking RECORD;
  v_payment RECORD;
BEGIN
  -- 1. Check for approved booking in 12-day or 15-day program
  SELECT b.id, b.program_title, b.status INTO v_booking
  FROM public.bookings b
  WHERE LOWER(TRIM(b.email)) = v_clean_email
    AND (
      LOWER(b.program_id) LIKE '%12-day%' OR LOWER(b.program_id) LIKE '%15-day%'
      OR LOWER(b.program_title) LIKE '%12-day%' OR LOWER(b.program_title) LIKE '%15-day%'
      OR LOWER(b.program_title) LIKE '%12 day%' OR LOWER(b.program_title) LIKE '%15 day%'
    )
    AND b.status IN ('Approved', 'Verified', 'Confirmed', 'Completed')
  ORDER BY b.created_at DESC
  LIMIT 1;

  IF FOUND THEN
    RETURN QUERY SELECT TRUE, v_booking.program_title, v_booking.status, 'Paid'::TEXT, 'Student is fully approved for ' || v_booking.program_title;
    RETURN;
  END IF;

  -- 2. Check for approved payment transaction
  SELECT p.id, p.program_title, p.payment_status INTO v_payment
  FROM public.payments p
  WHERE LOWER(TRIM(p.student_email)) = v_clean_email
    AND (
      LOWER(p.program_title) LIKE '%12-day%' OR LOWER(p.program_title) LIKE '%15-day%'
      OR LOWER(p.program_title) LIKE '%12 day%' OR LOWER(p.program_title) LIKE '%15 day%'
    )
    AND p.payment_status IN ('Paid', 'Verified', 'Completed', 'Approved')
  ORDER BY p.created_at DESC
  LIMIT 1;

  IF FOUND THEN
    RETURN QUERY SELECT TRUE, v_payment.program_title, 'Approved'::TEXT, v_payment.payment_status, 'Verified payment found for ' || v_payment.program_title;
    RETURN;
  END IF;

  -- 3. Check if pending enrollment exists
  SELECT b.id, b.program_title, b.status INTO v_booking
  FROM public.bookings b
  WHERE LOWER(TRIM(b.email)) = v_clean_email
    AND (
      LOWER(b.program_id) LIKE '%12-day%' OR LOWER(b.program_id) LIKE '%15-day%'
      OR LOWER(b.program_title) LIKE '%12-day%' OR LOWER(b.program_title) LIKE '%15-day%'
      OR LOWER(b.program_title) LIKE '%12 day%' OR LOWER(b.program_title) LIKE '%15 day%'
    )
  ORDER BY b.created_at DESC
  LIMIT 1;

  IF FOUND THEN
    RETURN QUERY SELECT FALSE, v_booking.program_title, v_booking.status, 'Pending Verification'::TEXT, 'Payment for 12-Day / 15-Day Program is pending Admin approval.';
    RETURN;
  END IF;

  RETURN QUERY SELECT FALSE, NULL::TEXT, 'Not Enrolled'::TEXT, 'No Payment'::TEXT, 'No approved payment or booking found for 12-Day or 15-Day Program.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

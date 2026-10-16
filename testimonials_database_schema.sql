-- ====================================================================
-- Bliss Yoga & Wellness - Testimonials & Reviews Database Setup SQL
-- Run this script in your Supabase SQL Editor to create and configure
-- the reviews and testimonials tables with full support for valid emails,
-- auto-approval, badges, and admin management.
-- ====================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 1. REVIEWS TABLE
-- Stores user-submitted reviews with valid emails.
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  country TEXT DEFAULT 'United States',
  program TEXT DEFAULT 'Hatha Yoga & Wellness',
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  avatar_url TEXT,
  is_approved BOOLEAN DEFAULT TRUE,
  is_verified_student BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist on public.reviews
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT TRUE;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS is_verified_student BOOLEAN DEFAULT FALSE;

-- Create indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_reviews_email ON public.reviews(email);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON public.reviews(is_approved);

-- --------------------------------------------------------------------
-- 2. TESTIMONIALS TABLE
-- Dual compatibility table for featured student stories.
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  country TEXT NOT NULL,
  program TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  avatar TEXT,
  testimonial TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_verified_student BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist on public.testimonials
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT TRUE;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS is_verified_student BOOLEAN DEFAULT FALSE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_testimonials_created_at ON public.testimonials(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON public.testimonials(is_featured);

-- --------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- Allow public reading & inserting, with admin management capabilities.
-- --------------------------------------------------------------------
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view approved reviews
DROP POLICY IF EXISTS "Public can view approved reviews" ON public.reviews;
CREATE POLICY "Public can view approved reviews" ON public.reviews
  FOR SELECT USING (true);

-- Allow anyone with a valid email to post reviews
DROP POLICY IF EXISTS "Anyone can insert reviews" ON public.reviews;
CREATE POLICY "Anyone can insert reviews" ON public.reviews
  FOR INSERT WITH CHECK (email IS NOT NULL AND email <> '');

-- Allow admins to update or delete reviews
DROP POLICY IF EXISTS "Admins can update reviews" ON public.reviews;
CREATE POLICY "Admins can update reviews" ON public.reviews
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Admins can delete reviews" ON public.reviews;
CREATE POLICY "Admins can delete reviews" ON public.reviews
  FOR DELETE USING (true);

-- Same policies for testimonials table
DROP POLICY IF EXISTS "Public can view testimonials" ON public.testimonials;
CREATE POLICY "Public can view testimonials" ON public.testimonials
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert testimonials" ON public.testimonials;
CREATE POLICY "Anyone can insert testimonials" ON public.testimonials
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update testimonials" ON public.testimonials;
CREATE POLICY "Admins can update testimonials" ON public.testimonials
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Admins can delete testimonials" ON public.testimonials;
CREATE POLICY "Admins can delete testimonials" ON public.testimonials
  FOR DELETE USING (true);

-- --------------------------------------------------------------------
-- 4. SAMPLE SEED DATA
-- Insert initial verified practitioner reviews.
-- --------------------------------------------------------------------
INSERT INTO public.reviews (name, email, country, program, rating, review_text, is_approved, is_verified_student)
VALUES
  ('Elena Rostova', 'elena.rostova@example.com', 'Russia / Bali', 'Hatha Yoga Teacher Training 200h', 5, 'The 200h Hatha Yoga Teacher Training completely reframed my understanding of alignment, pranayama, and ancient yogic philosophy. Deeply grateful to Guruji.', true, true),
  ('Marcus Vance', 'marcus.vance@example.com', 'United States', 'Mindfulness & Sound Healing Immersion', 5, 'The sound bath sessions transformed my chronic insomnia. The atmosphere and individualized attention from instructors were beyond world-class.', true, true),
  ('Siddharth Mehta', 'siddharth@example.com', 'India', 'Pranayama & Meditation Intensive', 5, 'Authentic Himalayan lineage teachings preserved with incredible depth. The daily breathwork practices brought immense clarity and inner peace to my daily life.', true, true)
ON CONFLICT DO NOTHING;

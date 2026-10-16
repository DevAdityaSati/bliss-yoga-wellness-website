import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { TestimonialItem } from '../types';
import { TESTIMONIALS as initialTestimonialsData } from '../data/content';

const LOCAL_STORAGE_TESTIMONIALS = 'bliss_yoga_testimonials_db';

function getLocalTestimonials(): TestimonialItem[] {
  const data = localStorage.getItem(LOCAL_STORAGE_TESTIMONIALS);
  if (!data) {
    const initialized = initialTestimonialsData.map(t => ({ ...t, is_approved: true, is_featured: true }));
    localStorage.setItem(LOCAL_STORAGE_TESTIMONIALS, JSON.stringify(initialized));
    return initialized;
  }
  try {
    return JSON.parse(data);
  } catch {
    return initialTestimonialsData.map(t => ({ ...t, is_approved: true, is_featured: true }));
  }
}

function saveLocalTestimonials(testimonials: TestimonialItem[]) {
  localStorage.setItem(LOCAL_STORAGE_TESTIMONIALS, JSON.stringify(testimonials));
}

export async function getTestimonials(): Promise<TestimonialItem[]> {
  const localItems = getLocalTestimonials();
  const resultMap = new Map<string, TestimonialItem>();

  // Add local items to start
  for (const item of localItems) {
    resultMap.set(item.id, item);
  }

  if (isSupabaseConfigured()) {
    try {
      // 1. Fetch from 'reviews' table
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (reviewsData && reviewsData.length > 0) {
        for (const r of reviewsData) {
          const item: TestimonialItem = {
            id: String(r.id),
            name: r.name || 'Anonymous Student',
            email: r.email || undefined,
            country: r.country || 'United States',
            program: r.program || 'Hatha Yoga & Wellness',
            rating: Number(r.rating || 5),
            avatar: r.avatar_url || r.avatar || '',
            testimonial: r.review_text || r.testimonial || '',
            is_approved: r.is_approved ?? true,
            is_featured: r.is_featured ?? true,
            created_at: r.created_at || new Date().toISOString(),
          };
          resultMap.set(item.id, item);
        }
      }

      // 2. Fetch from 'testimonials' table
      const { data: testimonialsData } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (testimonialsData && testimonialsData.length > 0) {
        for (const t of testimonialsData) {
          const idStr = String(t.id);
          const existing = resultMap.get(idStr);
          const item: TestimonialItem = {
            id: idStr,
            name: t.name || existing?.name || 'Anonymous Student',
            email: t.email || existing?.email || undefined,
            country: t.country || existing?.country || 'United States',
            program: t.program || existing?.program || 'Hatha Yoga & Wellness',
            rating: Number(t.rating || existing?.rating || 5),
            avatar: t.avatar || existing?.avatar || '',
            testimonial: t.testimonial || existing?.testimonial || '',
            is_approved: t.is_approved ?? existing?.is_approved ?? true,
            is_featured: t.is_featured ?? existing?.is_featured ?? true,
            created_at: t.created_at || existing?.created_at || new Date().toISOString(),
          };
          resultMap.set(idStr, item);
        }
      }
    } catch (e) {
      console.warn('Supabase fetch testimonials/reviews error:', e);
    }
  }

  const mergedList = Array.from(resultMap.values());
  saveLocalTestimonials(mergedList);
  return mergedList;
}

export async function createTestimonial(testimonial: Omit<TestimonialItem, 'id'> & { email?: string }): Promise<TestimonialItem> {
  const newItem: TestimonialItem = {
    ...testimonial,
    id: 'tst-' + Date.now(),
    is_approved: testimonial.is_approved ?? true,
    is_featured: testimonial.is_featured ?? false,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      // 1. Insert into Supabase 'reviews' table
      const { data: reviewData } = await supabase
        .from('reviews')
        .insert([{
          name: testimonial.name,
          email: testimonial.email || null,
          country: testimonial.country || 'United States',
          program: testimonial.program || 'Hatha Yoga & Wellness',
          rating: testimonial.rating,
          review_text: testimonial.testimonial,
          avatar_url: testimonial.avatar || '',
          is_approved: testimonial.is_approved ?? true,
        }])
        .select()
        .single();

      // 2. Also insert into Supabase 'testimonials' table
      await supabase
        .from('testimonials')
        .insert([{
          name: testimonial.name,
          country: testimonial.country,
          program: testimonial.program,
          rating: testimonial.rating,
          avatar: testimonial.avatar,
          testimonial: testimonial.testimonial,
          is_approved: testimonial.is_approved ?? true,
          is_featured: testimonial.is_featured ?? false,
        }]);

      if (reviewData) {
        const formatted: TestimonialItem = {
          id: String(reviewData.id),
          name: reviewData.name,
          email: reviewData.email || testimonial.email,
          country: reviewData.country,
          program: reviewData.program,
          rating: Number(reviewData.rating),
          avatar: reviewData.avatar_url || testimonial.avatar,
          testimonial: reviewData.review_text,
          is_approved: reviewData.is_approved ?? true,
          is_featured: false,
          created_at: reviewData.created_at || new Date().toISOString(),
        };
        const local = getLocalTestimonials();
        local.unshift(formatted);
        saveLocalTestimonials(local);
        return formatted;
      }
    } catch (e) {
      console.warn('Supabase create review/testimonial error:', e);
    }
  }

  const local = getLocalTestimonials();
  local.unshift(newItem);
  saveLocalTestimonials(local);
  return newItem;
}

export async function updateTestimonial(
  id: string,
  updates: Partial<TestimonialItem>
): Promise<TestimonialItem | null> {
  const local = getLocalTestimonials();
  const idx = local.findIndex(t => t.id === id);

  if (idx !== -1) {
    local[idx] = { ...local[idx], ...updates };
    saveLocalTestimonials(local);

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('testimonials').update(updates).eq('id', id);
      } catch (e) {
        console.warn('Supabase update testimonial error:', e);
      }
    }
    return local[idx];
  }
  return null;
}

export async function deleteTestimonial(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('reviews').delete().eq('id', id);
      await supabase.from('testimonials').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete testimonial error:', e);
    }
  }

  const local = getLocalTestimonials();
  const filtered = local.filter(t => t.id !== id);
  saveLocalTestimonials(filtered);
  return true;
}

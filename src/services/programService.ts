import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ProgramItem } from '../types';
import { PROGRAMS as initialProgramsData } from '../data/content';

const LOCAL_STORAGE_PROGRAMS = 'bliss_yoga_programs_db';

function getLocalPrograms(): ProgramItem[] {
  const data = localStorage.getItem(LOCAL_STORAGE_PROGRAMS);
  if (!data) {
    const initialized = initialProgramsData.map(p => ({ ...p, is_active: true }));
    localStorage.setItem(LOCAL_STORAGE_PROGRAMS, JSON.stringify(initialized));
    return initialized;
  }
  try {
    const parsed: ProgramItem[] = JSON.parse(data);
    // Sync images from default content to ensure every program uses its unique image
    const updated = parsed.map(p => {
      const init = initialProgramsData.find(ip => ip.id === p.id);
      if (init && init.image) {
        return { ...p, image: init.image };
      }
      return p;
    });
    localStorage.setItem(LOCAL_STORAGE_PROGRAMS, JSON.stringify(updated));
    return updated;
  } catch {
    return initialProgramsData.map(p => ({ ...p, is_active: true }));
  }
}

function saveLocalPrograms(programs: ProgramItem[]) {
  localStorage.setItem(LOCAL_STORAGE_PROGRAMS, JSON.stringify(programs));
}

export async function getPrograms(): Promise<ProgramItem[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .order('id');

      if (!error && data && data.length > 0) {
        const formatted = data.map((p: any) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          groupPrice: p.group_price,
          privatePrice: p.private_price,
          duration: p.duration,
          image: p.image,
          benefits: p.benefits || [],
          recommendedFor: p.recommended_for || '',
          overview: p.overview,
          suitableFor: p.suitable_for || [],
          whatYouWillLearn: p.what_you_will_learn || [],
          classStructure: p.class_structure || [],
          supports: p.supports || [],
          faqs: p.faqs || [],
          is_active: p.is_active ?? true,
        }));
        saveLocalPrograms(formatted);
        return formatted;
      }
    } catch (e) {
      console.warn('Supabase fetch programs error:', e);
    }
  }

  return getLocalPrograms();
}

export async function updateProgram(
  id: string,
  updates: Partial<ProgramItem>
): Promise<ProgramItem | null> {
  const local = getLocalPrograms();
  const idx = local.findIndex(p => p.id === id);

  if (idx !== -1) {
    local[idx] = { ...local[idx], ...updates };
    saveLocalPrograms(local);

    if (isSupabaseConfigured()) {
      try {
        const dbPayload: any = {};
        if (updates.title !== undefined) dbPayload.title = updates.title;
        if (updates.description !== undefined) dbPayload.description = updates.description;
        if (updates.groupPrice !== undefined) dbPayload.group_price = updates.groupPrice;
        if (updates.privatePrice !== undefined) dbPayload.private_price = updates.privatePrice;
        if (updates.image !== undefined) dbPayload.image = updates.image;
        if (updates.is_active !== undefined) dbPayload.is_active = updates.is_active;

        await supabase.from('programs').update(dbPayload).eq('id', id);
      } catch (e) {
        console.warn('Supabase update program error:', e);
      }
    }
    return local[idx];
  }
  return null;
}

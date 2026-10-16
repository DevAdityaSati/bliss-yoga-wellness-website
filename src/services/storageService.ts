import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type StorageBucket = 'profile-photos' | 'program-images' | 'testimonials' | 'website-assets' | 'documents';

/**
 * Ensures bucket exists or uploads file to Supabase Storage
 */
export async function uploadFileToSupabase(
  bucket: StorageBucket,
  file: File,
  folderPath: string = ''
): Promise<{ url: string | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    // Return base64 object URL as fallback when client-only offline
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({ url: reader.result as string, error: null });
      };
      reader.onerror = () => {
        resolve({ url: null, error: 'Failed to read local file' });
      };
      reader.readAsDataURL(file);
    });
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.warn(`Supabase storage upload error on bucket ${bucket}:`, error.message);
      
      // Fallback to data URL if bucket is not created yet
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({ url: reader.result as string, error: null });
        };
        reader.readAsDataURL(file);
      });
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { url: publicUrlData.publicUrl, error: null };
  } catch (err: any) {
    console.error('Storage upload exception:', err);
    return { url: null, error: err.message || 'An unexpected upload error occurred' };
  }
}

/**
 * Retrieves public URL for an asset path in a bucket
 */
export function getPublicStorageUrl(bucket: StorageBucket, path: string): string {
  if (!isSupabaseConfigured() || !path) return path;
  if (path.startsWith('http') || path.startsWith('data:')) return path;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Initialize Supabase client if configured, otherwise provide safe fallback
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper to upload image to Supabase Storage or convert to Base64 data URL
export async function uploadInspirationImage(file: File): Promise<string> {
  if (isSupabaseConfigured && supabase) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `tailoring-inspirations/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('maccy-uploads')
        .upload(filePath, file);

      if (uploadError) {
        console.warn('Supabase storage upload error, falling back to base64 preview:', uploadError);
      } else {
        const { data } = supabase.storage.from('maccy-uploads').getPublicUrl(filePath);
        return data.publicUrl;
      }
    } catch (err) {
      console.warn('Supabase upload exception:', err);
    }
  }

  // Graceful zero-config fallback: Convert to Base64 Data URL for instant preview & persistence
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

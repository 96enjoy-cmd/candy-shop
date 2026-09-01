import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && key);

// ถ้ายังไม่ตั้งค่า env จะ export เป็น null แล้วหน้าเว็บจะแจ้งเตือนแทนการพัง
export const supabase =
  isSupabaseConfigured ? createClient(url as string, key as string) : null;

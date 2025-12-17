import { createClient } from '@supabase/supabase-js';

// Get config from environment variables
const getSupabaseConfig = () => {
  let env:  any = {};
  try {
    if (typeof process !== 'undefined' && process.env) {
      env = process.env;
    }
  } catch (e) {
    // process is not available
  }

  const supabaseUrl = env. VITE_SUPABASE_URL || (window as any).__supabase_url || '';
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY || (window as any).__supabase_key || '';

  return { supabaseUrl, supabaseKey };
};

const { supabaseUrl, supabaseKey } = getSupabaseConfig();

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper functions for common operations
export const authService = {
  signUp: (email: string, password: string) => 
    supabase.auth.signUp({ email, password }),
  
  signIn: (email: string, password: string) => 
    supabase. auth.signInWithPassword({ email, password }),
  
  signOut: () => supabase.auth.signOut(),
  
  onAuthStateChange: (callback: any) =>
    supabase.auth. onAuthStateChange(callback),
};

export const dbService = {
  // Users
  getUser: (userId: string) =>
    supabase.from('profiles').select('*').eq('id', userId).single(),
  
  createUserProfile: (userId: string, data:  any) =>
    supabase.from('profiles').insert([{ id: userId, ...data }]),
  
  updateUserProfile: (userId: string, data: any) =>
    supabase.from('profiles').update(data).eq('id', userId),
  
  // Announcements
  getAnnouncements: () =>
    supabase.from('announcements').select('*').order('date', { ascending: false }),
  
  addAnnouncement: (data:  any) =>
    supabase.from('announcements').insert([data]),
  
  deleteAnnouncement: (id: string) =>
    supabase.from('announcements').delete().eq('id', id),
  
  // Market Prices
  getMarketPrices: () =>
    supabase.from('market_prices').select('*'),
  
  updateMarketPrice: (id: string, price: number) =>
    supabase.from('market_prices').update({ price }).eq('id', id),
  
  // KPIs
  getUserKPIs: (userId: string) =>
    supabase.from('kpis').select('*').eq('user_id', userId).single(),
  
  updateUserKPIs: (userId: string, data: any) =>
    supabase.from('kpis').upsert({ user_id: userId, ...data }),
  
  // Listings
  getListings: () =>
    supabase.from('listings').select('*').order('timestamp', { ascending: false }),
  
  getUserListings: (userId: string) =>
    supabase.from('listings').select('*').eq('user_id', userId),
  
  createListing:  (data: any) =>
    supabase.from('listings').insert([data]),
};

export const storageService = {
  uploadProfilePicture: (userId: string, file: File) => {
    const path = `${userId}/profile_picture`;
    return supabase.storage.from('profiles').upload(path, file, { upsert: true });
  },
  
  getProfilePictureUrl: (userId: string) => {
    const { data } = supabase.storage.from('profiles').getPublicUrl(`${userId}/profile_picture`);
    return data?. publicUrl;
  },
};
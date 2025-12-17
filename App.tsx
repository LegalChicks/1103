import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase, authService, dbService } from './services/supabase';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import { FullScreenLoader } from './components/ui';
import { Profile } from './types';

const SUPER_ADMINS = ['admin@legalchicks.vip'];

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });

export const useAuth = () => useContext(AuthContext);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to auth state changes
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      setUser(session?.user ??  null);

      if (session?.user) {
        // Fetch or create user profile
        const { data, error } = await dbService.getUser(session.user.id);
        
        if (error || !data) {
          // Create new profile if it doesn't exist
          await dbService.createUserProfile(session.user.id, {
            uid: session.user.id,
            email: session.user.email,
            name: session.user.email || 'New Member',
            role:  SUPER_ADMINS.includes(session.user.email || '') ? 'power-admin' : 'member',
          });
          
          const newProfile = await dbService.getUser(session.user.id);
          setProfile(newProfile. data as Profile);
        } else {
          // Check if user should be promoted to power-admin
          if (session.user.email && SUPER_ADMINS. includes(session.user.email) && data.role !== 'power-admin') {
            await dbService.updateUserProfile(session.user.id, { role: 'power-admin' });
            setProfile({ ...data, role: 'power-admin' } as Profile);
          } else {
            setProfile(data as Profile);
          }
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {loading ? <FullScreenLoader /> :  (
        <HashRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
            <Route path="/dashboard" element={user ? <DashboardPage /> :  <Navigate to="/login" />} />
            <Route path="/admin" element={user && profile?. role === 'power-admin' ? <AdminPage /> : <Navigate to="/dashboard" />} />
          </Routes>
        </HashRouter>
      )}
    </AuthContext.Provider>
  );
};

export default AuthProvider;


import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, User, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db, appId } from './services/firebase';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import { FullScreenLoader } from './components/ui';
import { Profile } from './types';

// LIST OF EMAILS THAT AUTOMATICALLY BECOME SUPER ADMINS
const SUPER_ADMINS = ['admin@legalchicks.vip'];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });

export const useAuth = () => useContext(AuthContext);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleMagicLinkSignIn = async () => {
        if (isSignInWithEmailLink(auth, window.location.href)) {
            let email = window.localStorage.getItem('emailForSignIn');
            if (email) {
                try {
                    await signInWithEmailLink(auth, email, window.location.href);
                    window.localStorage.removeItem('emailForSignIn');
                    // onAuthStateChanged will handle the user state update.
                    // Clear the URL to prevent re-triggering
                    window.history.replaceState(null, '', window.location.pathname + window.location.hash);
                } catch (error) {
                    console.error("Magic link sign-in error", error);
                    // Let the app continue to load, user will not be signed in.
                }
            }
        }
    };
    
    handleMagicLinkSignIn();

    let profileUnsubscribe: (() => void) | null = null;

    const authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      // Clean up previous profile listener if it exists
      if (profileUnsubscribe) {
          profileUnsubscribe();
          profileUnsubscribe = null;
      }

      if (firebaseUser) {
        const profileRef = doc(db, `artifacts/${appId}/users/${firebaseUser.uid}/profile/details`);
        
        // Subscribe to real-time updates for the profile
        profileUnsubscribe = onSnapshot(profileRef, async (docSnap) => {
            let userProfile: Profile;

            if (docSnap.exists()) {
                userProfile = docSnap.data() as Profile;
            } else {
                // If profile doc doesn't exist yet, set a temporary default
                userProfile = { 
                    uid: firebaseUser.uid, 
                    email: firebaseUser.email || '', 
                    name: firebaseUser.email || 'New Member', 
                    role: 'member' 
                };
            }

            // --- SUPER ADMIN BOOTSTRAP LOGIC ---
            // If the logged-in email is in the SUPER_ADMINS list, force update their role to 'power-admin'
            // This ensures you have access immediately.
            if (firebaseUser.email && SUPER_ADMINS.includes(firebaseUser.email) && userProfile.role !== 'power-admin') {
                console.log("Auto-promoting user to Power Admin...");
                const updatedProfile = { ...userProfile, role: 'power-admin' as const };
                // Update local state immediately for responsiveness
                userProfile = updatedProfile; 
                // Persist to database
                await setDoc(profileRef, updatedProfile, { merge: true });
            }
            // -----------------------------------

            setProfile(userProfile);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching profile:", error);
            setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
        authUnsubscribe();
        if (profileUnsubscribe) profileUnsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <FullScreenLoader />;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, profile, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <FullScreenLoader />;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    if (profile?.role !== 'admin' && profile?.role !== 'power-admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};


const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
};

const Router = () => {
    const { loading } = useAuth();
    
    if (loading) {
        return <FullScreenLoader />;
    }

    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/admin" 
                    element={
                        <AdminRoute>
                            <AdminPage />
                        </AdminRoute>
                    } 
                />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </HashRouter>
    );
}

export default App;

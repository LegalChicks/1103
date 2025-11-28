
import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, doc, getDoc, getDocs, updateDoc, getCountFromServer, writeBatch } from 'firebase/firestore';
import { auth, db, appId } from '../services/firebase';
import { useAuth } from '../App';
import { Announcement, MarketPrice, MembershipApplication, Profile } from '../types';
import { Icon, Logo } from '../components/ui';
import { Link } from 'react-router-dom';

import AdminHomeView from './admin/AdminHomeView';
import ManageMembersView from './admin/ManageMembersView';
import NetworkSettingsView from './admin/NetworkSettingsView';

interface NetworkStats {
    totalMembers: number;
    pendingApplications: number;
    activeListings: number;
}

const AdminPage: React.FC = () => {
    const { profile } = useAuth();
    const [activeView, setActiveView] = useState('home');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    
    // Admin-specific data states
    const [stats, setStats] = useState<NetworkStats>({ totalMembers: 0, pendingApplications: 0, activeListings: 0 });
    const [applications, setApplications] = useState<MembershipApplication[]>([]);
    const [allUsers, setAllUsers] = useState<Profile[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);

    useEffect(() => {
        const publicRoot = `artifacts/${appId}/public/data`;
        const usersRoot = `artifacts/${appId}/users`;

        const fetchStatsAndUsers = async () => {
            const listingsQuery = collection(db, `${publicRoot}/listings`);
            const listingsSnap = await getCountFromServer(listingsQuery);
            setStats(prev => ({...prev, activeListings: listingsSnap.data().count}));

            const usersSnap = await getDocs(collection(db, usersRoot));
            const userProfiles: Profile[] = [];
            for (const userDoc of usersSnap.docs) {
                const profileRef = doc(db, usersRoot, userDoc.id, 'profile', 'details');
                const profileSnap = await getDoc(profileRef);
                if (profileSnap.exists()) {
                    const profileData = profileSnap.data();
                    userProfiles.push({
                        uid: userDoc.id,
                        name: profileData.name || 'No Name',
                        email: profileData.email || 'No Email',
                        role: profileData.role || 'member',
                    } as Profile);
                }
            }
            setAllUsers(userProfiles);
            setStats(prev => ({...prev, totalMembers: userProfiles.length}));
        };

        fetchStatsAndUsers();

        const unsubs = [
            onSnapshot(query(collection(db, `${publicRoot}/membership_applications`), orderBy("submittedAt", "desc")), snap => {
                const apps = snap.docs.map(d => ({...d.data(), id: d.id } as MembershipApplication));
                setApplications(apps);
                setStats(prev => ({...prev, pendingApplications: apps.filter(a => a.status === 'pending').length}));
            }),
            onSnapshot(query(collection(db, publicRoot, "announcements"), orderBy("date", "desc")), snap => {
                setAnnouncements(snap.docs.map(d => ({...d.data(), id: d.id} as Announcement)));
            }),
            onSnapshot(collection(db, publicRoot, "marketPrices"), snap => {
                setMarketPrices(snap.docs.map(d => ({ ...d.data(), id: d.id } as MarketPrice)));
            }),
        ];
        
        return () => unsubs.forEach(unsub => unsub());
    }, []);

    const handleUpdateApplicationStatus = async (id: string, status: 'approved' | 'rejected') => {
        try {
            const appRef = doc(db, `artifacts/${appId}/public/data/membership_applications`, id);
            await updateDoc(appRef, { status });
        } catch (error) {
            console.error("Error updating application status:", error);
            alert("Failed to update status. Please check console for errors.");
        }
    };

    const handleBulkUpdateApplicationStatus = async (ids: string[], status: 'approved' | 'rejected') => {
        if (ids.length === 0) return;
        try {
            const batch = writeBatch(db);
            ids.forEach(id => {
                const appRef = doc(db, `artifacts/${appId}/public/data/membership_applications`, id);
                batch.update(appRef, { status });
            });
            await batch.commit();
        } catch (error) {
            console.error("Error performing bulk update:", error);
            alert("Failed to perform bulk update. Please check console for errors.");
            throw error;
        }
    };

    const handleUpdateMemberRole = async (uid: string, role: Profile['role']) => {
        try {
            const profileRef = doc(db, `artifacts/${appId}/users/${uid}/profile/details`);
            await updateDoc(profileRef, { role });
            setAllUsers(prevUsers => prevUsers.map(user => 
                user.uid === uid ? { ...user, role } : user
            ));
        } catch (error) {
            console.error("Error updating member role:", error);
            alert("Failed to update role. Please try again.");
            throw error;
        }
    };

    const renderView = () => {
        switch (activeView) {
            case 'home':
                return <AdminHomeView stats={stats} recentApplications={applications.filter(a => a.status === 'pending').slice(0, 5)} />;
            case 'members':
                return <ManageMembersView applications={applications} members={allUsers} onUpdateStatus={handleUpdateApplicationStatus} onBulkUpdateStatus={handleBulkUpdateApplicationStatus} onUpdateRole={handleUpdateMemberRole} />;
            case 'settings':
                return <NetworkSettingsView announcements={announcements} marketPrices={marketPrices} />;
            default:
                return <AdminHomeView stats={stats} recentApplications={applications.filter(a => a.status === 'pending').slice(0, 5)} />;
        }
    };

    const navItems = [
        { id: 'home', label: 'Admin Overview', icon: 'Shield' },
        { id: 'members', label: 'User Management', icon: 'Users' },
        { id: 'settings', label: 'System Settings', icon: 'Settings' }
    ];

    const handleLogout = () => {
        signOut(auth).catch(error => console.error('Logout failed', error));
    };

    return (
        <div className="flex h-screen bg-slate-100 font-sans">
            {/* Admin Sidebar - Distinct Dark Theme */}
            <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 text-slate-100 shadow-2xl transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 lg:flex lg:flex-shrink-0 transition-transform duration-300 ease-in-out`}>
                <div className="flex flex-col h-full w-full">
                    <div className="flex items-center justify-between h-20 px-6 bg-slate-950 border-b border-slate-800">
                        <div className="flex items-center space-x-3">
                            <div className="bg-red-700 p-1.5 rounded-md">
                                <Logo className="h-6 w-6" />
                            </div>
                            <div>
                                <span className="block text-lg font-bold tracking-wider uppercase">LCEN Admin</span>
                                <span className="block text-xs text-red-400 font-mono tracking-widest">CONTROL CENTER</span>
                            </div>
                        </div>
                         <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
                            <Icon name="X" className="w-6 h-6"/>
                        </button>
                    </div>

                    <div className="px-6 py-4">
                        <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                            <p className="text-xs text-slate-400 uppercase font-bold mb-1">Current User</p>
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold mr-2">
                                     {profile?.name?.charAt(0) || 'A'}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-bold truncate">{profile?.name}</p>
                                    <p className="text-xs text-red-400 font-mono">{profile?.role === 'power-admin' ? 'ROOT ACCESS' : 'ADMIN ACCESS'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                        <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-4 mb-2">Main Menu</p>
                        {navItems.map(item => (
                            <button key={item.id} onClick={() => { setActiveView(item.id); setSidebarOpen(false); }} className={`flex items-center w-full px-4 py-3 text-left rounded-lg transition-all duration-200 border-l-4 ${activeView === item.id ? 'bg-slate-800 border-red-500 text-white shadow-lg' : 'border-transparent text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                                <Icon name={item.icon as any} className={`w-5 h-5 mr-3 ${activeView === item.id ? 'text-red-500' : ''}`} />
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-slate-800 bg-slate-950">
                         <Link to="/dashboard" className="flex items-center justify-center w-full px-4 py-2 mb-3 text-sm font-medium text-slate-300 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
                            <Icon name="LayoutDashboard" className="w-4 h-4 mr-2" />
                            View as Member
                        </Link>
                        <button onClick={handleLogout} className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-red-700 rounded-lg hover:bg-red-800 transition-colors shadow-md">
                            <Icon name="LogOut" className="w-4 h-4 mr-2" />
                            Secure Logout
                        </button>
                    </div>
                </div>
            </aside>
            
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-100">
                <header className="lg:hidden flex items-center justify-between h-20 px-6 bg-white border-b border-slate-200 shadow-sm">
                    <button onClick={() => setSidebarOpen(true)} className="text-slate-600 hover:text-slate-900">
                        <Icon name="Menu" className="w-6 h-6" />
                    </button>
                    <span className="text-lg font-bold text-slate-800">{navItems.find(i => i.id === activeView)?.label}</span>
                    <div className="w-6"></div>
                </header>
                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    {renderView()}
                </main>
            </div>
        </div>
    );
};

export default AdminPage;

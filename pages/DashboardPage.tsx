
import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { collection, onSnapshot, query, where, orderBy, doc, limit, getDocs } from 'firebase/firestore';
import { auth, db, appId } from '../services/firebase';
import { useAuth } from '../App';
import { KPI, LivestockFlock, Supply, Alert, Announcement, MarketPrice, Listing, UserSettings } from '../types';
import { Icon, Logo } from '../components/ui';

import DashboardHomeView from './dashboard/DashboardHomeView';
import MarketHubView from './dashboard/MarketHubView';
import ResourcesView from './dashboard/ResourcesView';
import SettingsView from './dashboard/SettingsView';
import { Link } from 'react-router-dom';

interface ProductionRecord {
    id: string; // YYYY-MM-DD
    eggs: number;
}

const DashboardPage: React.FC = () => {
    const { user, profile } = useAuth();
    const [activeView, setActiveView] = useState('dashboard');
    const [kpis, setKpis] = useState<KPI | null>(null);
    const [livestock, setLivestock] = useState<LivestockFlock[]>([]);
    const [supplies, setSupplies] = useState<Supply[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
    const [marketPriceHistory, setMarketPriceHistory] = useState<Record<string, { date: string; price: number }[]>>({});
    const [listings, setListings] = useState<Listing[]>([]);
    const [myListings, setMyListings] = useState<Listing[]>([]);
    const [settings, setSettings] = useState<UserSettings>({});
    const [eggProductionHistory, setEggProductionHistory] = useState<ProductionRecord[]>([]);
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!user) return;
        const userRoot = `artifacts/${appId}/users/${user.uid}`;
        const publicRoot = `artifacts/${appId}/public/data`;
        
        const historyQuery = query(collection(db, `${userRoot}/kpis/history`), orderBy("id", "desc"), limit(7));

        const marketPricesUnsub = onSnapshot(collection(db, publicRoot, "marketPrices"), (snap) => {
            const prices = snap.docs.map(d => ({ ...d.data(), id: d.id } as MarketPrice));
            setMarketPrices(prices);

            const newHistoryData: Record<string, {date: string, price: number}[]> = {};
            if (prices.length === 0) {
                setMarketPriceHistory({});
                return;
            }

            let completedFetches = 0;
            prices.forEach(price => {
                const historyQuery = query(
                    collection(db, publicRoot, "marketPrices", price.id, "history"),
                    orderBy("date", "asc"),
                    limit(30)
                );
                getDocs(historyQuery).then(historySnap => {
                    newHistoryData[price.id] = historySnap.docs.map(doc => doc.data() as { date: string, price: number });
                    completedFetches++;
                    if (completedFetches === prices.length) {
                        setMarketPriceHistory(newHistoryData);
                    }
                });
            });
        });

        const unsubs = [
            marketPricesUnsub,
            onSnapshot(doc(db, `${userRoot}/kpis/latest`), doc => setKpis(doc.data() as KPI)),
            onSnapshot(collection(db, `${userRoot}/livestock`), snap => setLivestock(snap.docs.map(d => ({...d.data(), id: d.id} as LivestockFlock)))),
            onSnapshot(collection(db, `${userRoot}/supplies`), snap => setSupplies(snap.docs.map(d => ({...d.data(), id: d.id} as Supply)))),
            onSnapshot(query(collection(db, `${publicRoot}/alerts`)), snap => setAlerts(snap.docs.map(d => ({...d.data(), id: d.id} as Alert)))),
            onSnapshot(query(collection(db, `${publicRoot}/announcements`), orderBy("date", "desc")), snap => setAnnouncements(snap.docs.map(d => ({...d.data(), id: d.id} as Announcement)))),
            onSnapshot(query(collection(db, publicRoot, "listings"), orderBy("timestamp", "desc")), snap => setListings(snap.docs.map(d => ({ ...d.data(), id: d.id } as Listing)))),
            onSnapshot(query(collection(db, publicRoot, "listings"), where("userId", "==", user.uid), orderBy("timestamp", "desc")), snap => setMyListings(snap.docs.map(d => ({ ...d.data(), id: d.id } as Listing)))),
            onSnapshot(doc(db, userRoot, 'settings', 'userPreferences'), doc => doc.exists() && setSettings(doc.data() as UserSettings)),
            onSnapshot(historyQuery, snap => {
                const historyData = snap.docs.map(d => ({id: d.id, ...d.data()} as ProductionRecord)).reverse();
                setEggProductionHistory(historyData);
            })
        ];

        return () => unsubs.forEach(unsub => unsub());
    }, [user]);
    
    const renderView = () => {
        switch (activeView) {
            case 'dashboard':
                return <DashboardHomeView kpis={kpis} announcements={announcements} livestock={livestock} eggProductionHistory={eggProductionHistory} />;
            case 'market':
                return <MarketHubView prices={marketPrices} listings={listings} myListings={myListings} priceHistory={marketPriceHistory} />;
            case 'resources':
                return <ResourcesView />;
            case 'settings':
                return <SettingsView initialSettings={settings} profile={profile} />;
            default:
                return <DashboardHomeView kpis={kpis} announcements={announcements} livestock={livestock} eggProductionHistory={eggProductionHistory} />;
        }
    };
    
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
        { id: 'market', label: 'Market Hub', icon: 'Store' },
        { id: 'resources', label: 'Resources', icon: 'BookOpen' },
        { id: 'settings', label: 'Settings', icon: 'Settings' }
    ];

    const handleLogout = () => {
        signOut(auth).catch(error => console.error('Logout failed', error));
    };

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 lg:flex lg:flex-shrink-0 transition-transform duration-300 ease-in-out`}>
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between h-20 px-6 border-b border-stone-200">
                        <div className="flex items-center space-x-3">
                            <Logo className="h-10 w-10" />
                            <span className="text-xl font-bold text-stone-800">LCEN</span>
                        </div>
                         <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-stone-500 hover:text-stone-700">
                            <Icon name="X" className="w-6 h-6"/>
                        </button>
                    </div>
                    <nav className="flex-1 px-4 py-6 space-y-2">
                        {navItems.map(item => (
                            <button key={item.id} onClick={() => { setActiveView(item.id); setSidebarOpen(false); }} className={`flex items-center w-full px-4 py-3 text-left rounded-lg transition-colors duration-200 ${activeView === item.id ? 'bg-amber-100 text-amber-800 font-bold' : 'text-stone-600 hover:bg-slate-100'}`}>
                                <Icon name={item.icon as any} className="w-5 h-5 mr-3" />
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>
                     {profile?.role === 'admin' && (
                        <div className="px-4 py-4">
                            <Link to="/admin" className="flex items-center w-full px-4 py-3 text-left rounded-lg transition-colors duration-200 bg-stone-700 text-white hover:bg-stone-800">
                                <Icon name="Shield" className="w-5 h-5 mr-3" />
                                <span>Admin Dashboard</span>
                            </Link>
                        </div>
                    )}
                    <div className="px-6 py-6 border-t border-stone-200">
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-amber-200 flex items-center justify-center font-bold text-amber-700">
                                {profile?.photoURL ? (
                                    <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    profile?.name?.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-semibold text-stone-800">{profile?.name || 'Loading...'}</p>
                                <button onClick={handleLogout} className="text-xs text-stone-500 hover:text-red-600 font-semibold">Log Out</button>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="lg:hidden flex items-center justify-between h-20 px-6 bg-white border-b border-stone-200">
                    <button onClick={() => setSidebarOpen(true)} className="text-stone-600 hover:text-stone-800">
                        <Icon name="Menu" className="w-6 h-6" />
                    </button>
                    <span className="text-lg font-bold text-stone-800">{navItems.find(i => i.id === activeView)?.label}</span>
                    <div className="w-6"></div>
                </header>
                <main className="flex-1 overflow-y-auto p-6 lg:p-10">
                    {renderView()}
                </main>
            </div>
        </div>
    );
};

export default DashboardPage;
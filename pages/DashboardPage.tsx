import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { collection, onSnapshot, query, where, orderBy, doc, limit } from 'firebase/firestore';
import { auth, db, appId } from '../services/firebase';
import { useAuth } from '../App';
import { KPI, LivestockFlock, Supply, Alert, Announcement, MarketPrice, Listing, UserSettings, Profile } from '../types';
import { Icon, Logo } from '../components/ui';

import DashboardHomeView from './dashboard/DashboardHomeView';
import MarketHubView from './dashboard/MarketHubView';
import ResourcesView from './dashboard/ResourcesView';
import SettingsView from './dashboard/SettingsView';

interface ProductionRecord {
    id: string; // YYYY-MM-DD
    eggs: number;
}

const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const [activeView, setActiveView] = useState('dashboard');
    const [profile, setProfile] = useState<Profile | null>(null);
    const [kpis, setKpis] = useState<KPI | null>(null);
    const [livestock, setLivestock] = useState<LivestockFlock[]>([]);
    const [supplies, setSupplies] = useState<Supply[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
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

        const unsubs = [
            onSnapshot(doc(db, `${userRoot}/profile/details`), doc => setProfile(doc.data() as Profile)),
            onSnapshot(doc(db, `${userRoot}/kpis/latest`), doc => setKpis(doc.data() as KPI)),
            onSnapshot(collection(db, `${userRoot}/livestock`), snap => setLivestock(snap.docs.map(d => ({...d.data(), id: d.id} as LivestockFlock)))),
            onSnapshot(collection(db, `${userRoot}/supplies`), snap => setSupplies(snap.docs.map(d => ({...d.data(), id: d.id} as Supply)))),
            onSnapshot(query(collection(db, `${publicRoot}/alerts`)), snap => setAlerts(snap.docs.map(d => ({...d.data(), id: d.id} as Alert)))),
            onSnapshot(query(collection(db, `${publicRoot}/announcements`), orderBy("date", "desc")), snap => setAnnouncements(snap.docs.map(d => ({...d.data(), id: d.id} as Announcement)))),
            onSnapshot(collection(db, publicRoot, "marketPrices"), snap => setMarketPrices(snap.docs.map(d => ({...d.data(), id: d.id } as MarketPrice)))),
            onSnapshot(query(collection(db, publicRoot, "listings"), orderBy("timestamp", "desc")), snap => setListings(snap.docs.map(d => ({ ...d.data(), id: d.id } as Listing)))),
            onSnapshot(query(collection(db, publicRoot, "listings"), where("userId", "==", user.uid), orderBy("timestamp", "desc")), snap => setMyListings(snap.docs.map(d => ({ ...d.data(), id: d.id } as Listing)))),
            onSnapshot(doc(db, userRoot, 'settings', 'userPreferences'), doc => doc.exists() && setSettings(doc.data() as UserSettings)),
            onSnapshot(historyQuery, snap => {
                const historyData = snap.docs.map(d => ({id: d.id, ...d.data()} as ProductionRecord)).reverse();
                setEggProductionHistory(historyData);
            }),
        ];
        
        return () => unsubs.forEach(unsub => unsub());
    }, [user]);

    const handleLogout = async () => {
        await signOut(auth);
    };

    const renderView = () => {
        switch (activeView) {
            case 'market-hub':
                return <MarketHubView prices={marketPrices} listings={listings} myListings={myListings} />;
            case 'resources':
                return <ResourcesView />;
            case 'settings':
                return <SettingsView initialSettings={settings} profile={profile} />;
            default:
                return <DashboardHomeView kpis={kpis} announcements={announcements} livestock={livestock} eggProductionHistory={eggProductionHistory} />;
        }
    };

    return (
        <div className="flex h-screen bg-[--color-background] text-[--color-text-primary]">
            <Sidebar activeView={activeView} setActiveView={setActiveView} handleLogout={handleLogout} profile={profile} isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen}/>
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header profile={profile} setSidebarOpen={setSidebarOpen} />
                <main className="flex-1 overflow-y-auto">
                    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
                        {renderView()}
                    </div>
                </main>
            </div>
        </div>
    );
};

interface SidebarProps {
    activeView: string;
    setActiveView: (view: string) => void;
    handleLogout: () => void;
    profile: Profile | null;
    isSidebarOpen: boolean;
    setSidebarOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({activeView, setActiveView, handleLogout, isSidebarOpen, setSidebarOpen}) => (
    <>
        <aside className={`fixed md:relative z-20 md:z-auto w-64 bg-[--color-card] border-r border-[--color-border] flex-shrink-0 flex flex-col h-full transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
            <div className="p-6">
                <a href="#/dashboard" className="flex items-center space-x-2">
                    <Logo className="h-10 w-10" />
                    <span className="text-lg font-bold text-[--color-primary]">Legal Chicks</span>
                </a>
            </div>
            <nav className="px-4 space-y-2 flex-grow">
                <NavItem icon="LayoutDashboard" label="Dashboard" view="dashboard" activeView={activeView} setActiveView={setActiveView} />
                <NavItem icon="ShoppingCart" label="Market Hub" view="market-hub" activeView={activeView} setActiveView={setActiveView} />
                <NavItem icon="BookOpen" label="Resources" view="resources" activeView={activeView} setActiveView={setActiveView} />
                <NavItem icon="Settings" label="Settings" view="settings" activeView={activeView} setActiveView={setActiveView} />
            </nav>
            <div className="p-4 border-t border-[--color-border]">
                 <button onClick={handleLogout} className="w-full flex items-center p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-semibold">
                    <Icon name="LogOut" className="w-5 h-5 mr-3" />
                    <span>Log Out</span>
                </button>
            </div>
        </aside>
        {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-10 md:hidden" onClick={() => setSidebarOpen(false)}></div>}
    </>
);

const Header = ({ profile, setSidebarOpen }: { profile: Profile | null, setSidebarOpen: (open: boolean) => void }) => (
    <header className="sticky top-0 z-10 bg-[--color-card]/80 backdrop-blur-sm border-b border-[--color-border] md:hidden">
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <button onClick={() => setSidebarOpen(true)} className="md:hidden text-[--color-text-secondary]">
                    <Icon name="Menu" className="h-6 w-6"/>
                </button>
                <span className="font-semibold text-sm">Welcome, {profile?.name || 'Member'}</span>
                <div className="w-6"></div>
            </div>
        </div>
    </header>
);

const NavItem = ({icon, label, view, activeView, setActiveView}: any) => (
     <button onClick={() => setActiveView(view)} className={`w-full flex items-center p-3 rounded-lg transition-colors font-semibold ${activeView === view ? 'bg-[--color-accent-light] text-[--color-primary]' : 'text-[--color-text-secondary] hover:bg-slate-100'}`}>
        <Icon name={icon} className="w-5 h-5 mr-3" />
        <span>{label}</span>
    </button>
);

export default DashboardPage;
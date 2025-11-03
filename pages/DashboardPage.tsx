import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { signOut } from 'firebase/auth';
import { collection, onSnapshot, query, where, orderBy, addDoc, serverTimestamp, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, appId } from '../services/firebase';
import { useAuth } from '../App';
import { KPI, LivestockFlock, Supply, Alert, Announcement, MarketPrice, Listing, UserSettings, Profile } from '../types';
import { Icon, Loader, AlertModal, ConfirmModal } from '../components/ui';
import { generateInsightReport } from '../services/gemini';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

// Main Page Component
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
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!user) return;
        const userRoot = `artifacts/${appId}/users/${user.uid}`;
        const publicRoot = `artifacts/${appId}/public/data`;
        
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
                return <DashboardHomeView kpis={kpis} alerts={alerts} announcements={announcements} livestock={livestock} supplies={supplies} />;
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

// ... Sub-components for Dashboard ...
const Sidebar = ({activeView, setActiveView, handleLogout, profile, isSidebarOpen, setSidebarOpen} : any) => (
    <>
        <aside className={`fixed md:relative z-20 md:z-auto w-64 bg-[--color-card] border-r border-[--color-border] flex-shrink-0 flex flex-col h-full transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
            <div className="p-6">
                <a href="#/dashboard" className="flex items-center space-x-2">
                    <img src="https://placehold.co/40x40/8B4513/FFFFFF?text=LCE&font=inter" alt="LCE Logo" className="h-10 w-10 rounded-full" />
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


const DashboardHomeView = ({kpis, alerts, announcements, livestock, supplies}: {kpis: KPI | null, alerts: Alert[], announcements: Announcement[], livestock: LivestockFlock[], supplies: Supply[]}) => {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-text-primary mb-6">Member Dashboard</h1>
            <section id="kpis">
                <h2 className="text-2xl font-semibold text-text-primary mb-4">Farm KPIs</h2>
                {!kpis ? <Loader /> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <KpiCard title="Total Livestock" value={livestock.reduce((sum, item) => sum + item.headcount, 0).toLocaleString()} change="+15%" changeType="positive" icon="Rabbit" />
                        <KpiCard title="Egg Production" value={`${kpis.prod_eggs_today} / day`} change={kpis.eggProductionRateChange > 0 ? `+${(kpis.eggProductionRateChange*100).toFixed(1)}%` : `${(kpis.eggProductionRateChange*100).toFixed(1)}%`} changeType={kpis.eggProductionRateChange > 0 ? "positive" : "negative"} icon="Egg" />
                        <KpiCard title="Feed Conversion" value={kpis.fcr.toFixed(2)} change={kpis.fcrChange.toFixed(2)} changeType={kpis.fcrChange > 0 ? "negative" : "positive"} icon="BarChart2" />
                        <KpiCard title="Mortality (7d)" value={`${(kpis.mortalityRate*100).toFixed(1)}%`} change={`${(kpis.mortalityRateChange*100).toFixed(1)}%`} changeType={kpis.mortalityRateChange > 0 ? "negative" : "positive"} icon="Skull" />
                    </div>
                )}
            </section>
            
            <section id="charts" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[--color-card] p-6 rounded-lg shadow-sm border border-[--color-border]">
                     <h3 className="text-lg font-semibold text-text-primary mb-4">Livestock Distribution</h3>
                     <div className="h-64"><Doughnut data={{
                         labels: ['Layers', 'Broilers', 'Growers', 'Chicks'],
                         datasets: [{ data: [722, 301, 120, 61], backgroundColor: ['#8B4513', '#F59E0B', '#FDE68A', '#D2B48C'] }]
                     }} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' }} }} /></div>
                </div>
                 <div className="bg-[--color-card] p-6 rounded-lg shadow-sm border border-[--color-border]">
                     <h3 className="text-lg font-semibold text-text-primary mb-4">Egg Production (Last 7 Days)</h3>
                     <div className="h-64"><Line data={{
                         labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                         datasets: [{ label: 'Eggs Produced', data: [850, 865, 870, 890, 885, 895, 890], borderColor: '#8B4513', backgroundColor: '#8B451320', fill: true, tension: 0.3 }]
                     }} options={{ maintainAspectRatio: false, plugins: { legend: { display: false }}}} /></div>
                </div>
            </section>
        </div>
    );
};
const KpiCard = ({ title, value, change, changeType, icon }: { title: string, value: string | number, change: string, changeType: "positive" | "negative", icon: any }) => (
    <div className="bg-[--color-card] p-6 rounded-lg shadow-sm border border-[--color-border]">
        <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[--color-text-secondary]">{title}</span>
            <Icon name={icon} className="text-[--color-primary]" />
        </div>
        <p className="text-3xl font-bold text-text-primary mt-2">{value}</p>
        <p className={`text-sm flex items-center mt-1 font-semibold ${changeType === 'positive' ? 'text-[--color-success]' : 'text-[--color-danger]'}`}>{change}</p>
    </div>
);

const MarketHubView = ({prices, listings, myListings}: {prices: MarketPrice[], listings: Listing[], myListings: Listing[]}) => {
    // ... JSX for market hub view
    return <h1 className="text-3xl font-bold">Market Hub</h1>
};
const ResourcesView = () => {
    // ... JSX for resources view
    return <h1 className="text-3xl font-bold">Resources</h1>
};
const SettingsView = ({ initialSettings, profile }: { initialSettings: UserSettings, profile: Profile | null }) => {
    const [settings, setSettings] = useState(initialSettings);
    
    useEffect(() => {
        setSettings({
            farmName: initialSettings.farmName || '',
            contactName: profile?.name || initialSettings.contactName || '',
            phoneNumber: initialSettings.phoneNumber || '',
            ...initialSettings
        });
    }, [initialSettings, profile]);
    
    // ... JSX for settings view
    return <h1 className="text-3xl font-bold">Settings</h1>
};


export default DashboardPage;
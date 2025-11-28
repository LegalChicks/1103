import React, { useState } from 'react';
import { KPI, LivestockFlock, Announcement } from '../../types';
import { Icon, Loader } from '../../components/ui';
import { generateInsightReport } from '../../services/gemini';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

interface ProductionRecord {
    id: string; // YYYY-MM-DD
    eggs: number;
}
interface DashboardHomeViewProps {
    kpis: KPI | null;
    announcements: Announcement[];
    livestock: LivestockFlock[];
    eggProductionHistory: ProductionRecord[];
}

const KpiCard = ({ title, value, change, changeType, icon }: { title: string, value: string | number, change?: string, changeType?: "positive" | "negative", icon: any }) => (
    <div className="bg-[--color-card] p-6 rounded-lg shadow-sm border border-[--color-border]">
        <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[--color-text-secondary]">{title}</span>
            <Icon name={icon} className="text-[--color-primary]" />
        </div>
        <p className="text-3xl font-bold text-text-primary mt-2">{value}</p>
        {change && <p className={`text-sm flex items-center mt-1 font-semibold ${changeType === 'positive' ? 'text-[--color-success]' : 'text-[--color-danger]'}`}>{change}</p>}
    </div>
);

const renderMarkdown = (text: string) => {
    let html = text.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-text-primary my-2">$1</h3>');

    html = html.replace(/(\r\n|\n|\r)/gm, '\n'); 
    
    // Bold text
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    const listRegex = /((?:\* .*(?:\n|$))+)/g;
    html = html.replace(listRegex, (match) => {
        const items = match.trim().split('\n').map(item => 
            `<li class="flex items-start"><span class="mr-2 mt-1 text-[--color-primary]">&#8226;</span><span>${item.substring(2).trim()}</span></li>`
        ).join('');
        return `<ul class="space-y-1">${items}</ul>`;
    });

    return <div className="prose prose-sm max-w-none text-text-secondary" dangerouslySetInnerHTML={{ __html: html }} />;
}

const AICoPilotCard: React.FC<{ kpis: KPI, history: ProductionRecord[] }> = ({ kpis, history }) => {
    const [report, setReport] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerateReport = async () => {
        setIsLoading(true);
        setError('');
        setReport('');
        try {
            const result = await generateInsightReport(kpis, history);
            setReport(result);
        } catch (err) {
            setError('Failed to generate report. Please try again.');
            console.error(err);
        }
        setIsLoading(false);
    };

    return (
        <div className="bg-[--color-card] p-6 rounded-lg shadow-sm border border-[--color-border]">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">AI Co-Pilot: Advanced Analytics</h3>
                <Icon name="Sparkles" className="text-[--color-accent]" />
            </div>
            {isLoading ? <Loader /> : report ? renderMarkdown(report) : (
                <div className="text-center py-4">
                    <p className="text-[--color-text-secondary] mb-4">
                        Generate a detailed forecast including <strong>Feed Cost projections</strong> and <strong>Production trends</strong> based on your recent data.
                    </p>
                    <button onClick={handleGenerateReport} className="btn btn-dark py-2 px-4">Generate Forecast & Insights</button>
                </div>
            )}
            {error && <p className="text-sm text-[--color-danger] mt-2">{error}</p>}
        </div>
    );
};

const AnnouncementsCard: React.FC<{ announcements: Announcement[] }> = ({ announcements }) => (
    <div className="bg-[--color-card] p-6 rounded-lg shadow-sm border border-[--color-border]">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Network Announcements</h3>
        <ul className="space-y-4">
            {announcements.length > 0 ? announcements.slice(0, 3).map(ann => (
                <li key={ann.id} className="border-b border-[--color-border] pb-3 last:border-b-0">
                    <p className="text-sm text-[--color-text-secondary]">{new Date(ann.date).toLocaleDateString()}</p>
                    <p className="font-semibold text-text-primary">{ann.title}</p>
                </li>
            )) : <p className="text-[--color-text-secondary]">No new announcements.</p>}
        </ul>
    </div>
);

const LivestockSummaryCard: React.FC<{ livestock: LivestockFlock[] }> = ({ livestock }) => (
    <div className="bg-[--color-card] p-6 rounded-lg shadow-sm border border-[--color-border]">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Flock Overview</h3>
        <div className="space-y-3">
            {livestock.length > 0 ? livestock.map(flock => (
                <div key={flock.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                        <p className="font-semibold text-text-primary">{flock.type}</p>
                        <p className="text-sm text-[--color-text-secondary]">{flock.status} - {flock.age} weeks old</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-lg text-text-primary">{flock.headcount.toLocaleString()}</p>
                        <p className="text-xs text-[--color-text-secondary]">birds</p>
                    </div>
                </div>
            )) : <p className="text-center text-[--color-text-secondary] py-4">No livestock data available.</p>}
        </div>
    </div>
);


const DashboardHomeView: React.FC<DashboardHomeViewProps> = ({kpis, announcements, livestock, eggProductionHistory}) => {
    const totalLivestock = livestock.reduce((sum, item) => sum + item.headcount, 0);
    const livestockDistribution = {
        labels: livestock.map(f => f.type),
        datasets: [{ data: livestock.map(f => f.headcount), backgroundColor: ['#8B4513', '#F59E0B', '#FDE68A', '#D2B48C'], borderWidth: 0 }]
    };
    const eggProductionChartData = {
        labels: eggProductionHistory.map(d => {
            const date = new Date(d.id);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }),
        datasets: [{ 
            label: 'Eggs Produced', 
            data: eggProductionHistory.map(d => d.eggs), 
            borderColor: 'var(--color-primary)', 
            backgroundColor: 'rgba(139, 69, 19, 0.1)', 
            fill: true, 
            tension: 0.3 
        }]
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-text-primary">Member Dashboard</h1>
            
            <section id="kpis">
                {!kpis ? <Loader /> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <KpiCard title="Total Livestock" value={totalLivestock.toLocaleString()} icon="Rabbit" />
                        <KpiCard title="Egg Production (Today)" value={`${kpis.prod_eggs_today.toLocaleString()}`} change={kpis.eggProductionRateChange > 0 ? `+${(kpis.eggProductionRateChange*100).toFixed(1)}%` : `${(kpis.eggProductionRateChange*100).toFixed(1)}%`} changeType={kpis.eggProductionRateChange > 0 ? "positive" : "negative"} icon="Egg" />
                        <KpiCard title="Feed Conversion" value={kpis.fcr.toFixed(2)} change={kpis.fcrChange > 0 ? `+${kpis.fcrChange.toFixed(2)}` : kpis.fcrChange.toFixed(2)} changeType={kpis.fcrChange > 0 ? "negative" : "positive"} icon="BarChart2" />
                        <KpiCard title="Mortality (7d)" value={`${(kpis.mortalityRate*100).toFixed(1)}%`} change={kpis.mortalityRateChange > 0 ? `+${(kpis.mortalityRateChange*100).toFixed(1)}%` : `${(kpis.mortalityRateChange*100).toFixed(1)}%`} changeType={kpis.mortalityRateChange > 0 ? "negative" : "positive"} icon="Skull" />
                    </div>
                )}
            </section>
            
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    {kpis && <AICoPilotCard kpis={kpis} history={eggProductionHistory} />}
                </div>
                <div>
                    <AnnouncementsCard announcements={announcements} />
                </div>
            </section>
            
            <section>
                <LivestockSummaryCard livestock={livestock} />
            </section>
            
            <section id="charts" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[--color-card] p-6 rounded-lg shadow-sm border border-[--color-border]">
                     <h3 className="text-lg font-semibold text-text-primary mb-4">Livestock Distribution</h3>
                     <div className="h-64"><Doughnut data={livestockDistribution} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' }} }} /></div>
                </div>
                 <div className="bg-[--color-card] p-6 rounded-lg shadow-sm border border-[--color-border]">
                     <h3 className="text-lg font-semibold text-text-primary mb-4">Egg Production (Last 7 Days)</h3>
                     <div className="h-64"><Line data={eggProductionChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false }}}} /></div>
                </div>
            </section>
        </div>
    );
};

export default DashboardHomeView;
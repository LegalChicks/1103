
import React from 'react';
import { Icon } from '../../components/ui';
import { MembershipApplication } from '../../types';

interface NetworkStats {
    totalMembers: number;
    pendingApplications: number;
    activeListings: number;
}

interface AdminHomeViewProps {
    stats: NetworkStats;
    recentApplications: MembershipApplication[];
}

const StatCard: React.FC<{ title: string; value: number; icon: any; color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border-l-4" style={{ borderLeftColor: color }}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-stone-500 uppercase">{title}</p>
                <p className="text-3xl font-bold text-stone-800 mt-1">{value.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
                <Icon name={icon} className="w-7 h-7" style={{ color }} />
            </div>
        </div>
    </div>
);

const AdminHomeView: React.FC<AdminHomeViewProps> = ({ stats, recentApplications }) => {
    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-extrabold text-stone-800 tracking-tight">Admin Dashboard</h1>

            {/* Stats Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total Members" value={stats.totalMembers} icon="Users" color="#3B82F6" />
                <StatCard title="Pending Applications" value={stats.pendingApplications} icon="UserPlus" color="#F59E0B" />
                <StatCard title="Active Market Listings" value={stats.activeListings} icon="Store" color="#10B981" />
            </section>

            {/* Recent Activity */}
            <section className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-stone-800 mb-4">Recent Membership Applications</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="p-3 text-sm font-semibold text-stone-600">Applicant Name</th>
                                <th className="p-3 text-sm font-semibold text-stone-600">Location</th>
                                <th className="p-3 text-sm font-semibold text-stone-600">Submitted On</th>
                                <th className="p-3 text-sm font-semibold text-stone-600">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentApplications.length > 0 ? (
                                recentApplications.map(app => (
                                    <tr key={app.id} className="border-b border-stone-200 last:border-0">
                                        <td className="p-3 font-medium text-stone-800">{app.name}</td>
                                        <td className="p-3 text-stone-600">{app.farmLocation}</td>
                                        <td className="p-3 text-stone-600">{new Date(app.submittedAt).toLocaleDateString()}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${app.status === 'pending' ? 'bg-amber-100 text-amber-800' : app.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center p-6 text-stone-500">
                                        No new applications.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default AdminHomeView;

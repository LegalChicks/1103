
import React, { useState, useMemo, useEffect } from 'react';
import { MembershipApplication, Profile } from '../../types';
import { Icon } from '../../components/ui';

interface ManageMembersViewProps {
    applications: MembershipApplication[];
    members: Profile[];
    onUpdateStatus: (id: string, status: 'approved' | 'rejected') => void;
    onBulkUpdateStatus: (ids: string[], status: 'approved' | 'rejected') => Promise<void>;
    onUpdateRole: (uid: string, role: Profile['role']) => Promise<void>;
}

const ManageMembersView: React.FC<ManageMembersViewProps> = ({ applications, members, onUpdateStatus, onBulkUpdateStatus, onUpdateRole }) => {
    const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
    
    // State for pending applications tab
    const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
    const [isBulkUpdating, setIsBulkUpdating] = useState(false);

    // State for all members tab (inline editing)
    const [searchTerm, setSearchTerm] = useState('');
    const [memberRoles, setMemberRoles] = useState<Record<string, Profile['role']>>({});
    const [updatingUids, setUpdatingUids] = useState<string[]>([]);


    useEffect(() => {
        // Initialize local role state when members prop changes
        const initialRoles = members.reduce((acc, member) => {
            acc[member.uid] = member.role;
            return acc;
        }, {} as Record<string, Profile['role']>);
        setMemberRoles(initialRoles);
    }, [members]);


    const pendingApplications = useMemo(() => applications.filter(a => a.status === 'pending'), [applications]);
    
    const filteredMembers = useMemo(() => {
        if (!searchTerm) return members;
        return members.filter(member =>
            member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [members, searchTerm]);

    const allPendingSelected = useMemo(() => 
        pendingApplications.length > 0 && selectedApplications.length === pendingApplications.length,
        [selectedApplications, pendingApplications]
    );

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedApplications(pendingApplications.map(app => app.id));
        } else {
            setSelectedApplications([]);
        }
    };

    const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
        if (e.target.checked) {
            setSelectedApplications(prev => [...prev, id]);
        } else {
            setSelectedApplications(prev => prev.filter(appId => appId !== id));
        }
    };
    
    const handleBulkAction = async (status: 'approved' | 'rejected') => {
        if (selectedApplications.length === 0) return;
        setIsBulkUpdating(true);
        try {
            await onBulkUpdateStatus(selectedApplications, status);
            setSelectedApplications([]);
        } catch (error) {
            console.error("Bulk update failed in view:", error);
        } finally {
            setIsBulkUpdating(false);
        }
    };
    
    const handleRoleChange = (uid: string, role: Profile['role']) => {
        setMemberRoles(prev => ({ ...prev, [uid]: role }));
    };

    const handleSaveRole = async (uid: string) => {
        setUpdatingUids(prev => [...prev, uid]);
        try {
            await onUpdateRole(uid, memberRoles[uid]);
            // The parent component will refresh the 'members' prop, which will reset the button state via useEffect
        } catch (error) {
            console.error("Failed to save role", error);
            // Revert UI change on failure by finding the original role from the prop
            const originalMember = members.find(m => m.uid === uid);
            if (originalMember) {
                 setMemberRoles(prev => ({ ...prev, [uid]: originalMember.role }));
            }
        } finally {
            setUpdatingUids(prev => prev.filter(id => id !== uid));
        }
    };

    const handleExportData = () => {
        if (members.length === 0) {
            alert("No member data to export.");
            return;
        }

        const headers = ['UID', 'Name', 'Email', 'Role'];
        const escapeCsvField = (field: string) => `"${String(field || '').replace(/"/g, '""')}"`;

        const rows = members.map(member => 
            [
                escapeCsvField(member.uid),
                escapeCsvField(member.name),
                escapeCsvField(member.email),
                escapeCsvField(member.role)
            ].join(',')
        );

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");

        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        const timestamp = new Date().toISOString().split('T')[0];
        link.setAttribute("download", `lce-members-export-${timestamp}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const availableRoles: Profile['role'][] = ['member', 'editor', 'viewer', 'admin', 'power-admin'];


    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-extrabold text-stone-800 tracking-tight">Manage Members</h1>

            <div className="border-b border-stone-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`${activeTab === 'pending' ? 'border-amber-500 text-amber-600' : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'} group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        <span>Pending Applications</span>
                        {pendingApplications.length > 0 && (
                            <span className={`${activeTab === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-stone-100 text-stone-600'} hidden ml-3 py-0.5 px-2.5 rounded-full text-xs font-medium md:inline-block`}>
                                {pendingApplications.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`${activeTab === 'all' ? 'border-amber-500 text-amber-600' : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        All Members
                    </button>
                </nav>
            </div>

            {activeTab === 'pending' && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    {selectedApplications.length > 0 && (
                        <div className="bg-slate-100 p-3 rounded-lg mb-4 flex items-center justify-between">
                            <span className="font-semibold text-stone-700">{selectedApplications.length} selected</span>
                            <div className="space-x-2">
                                <button 
                                    onClick={() => handleBulkAction('approved')} 
                                    disabled={isBulkUpdating}
                                    className="btn bg-green-100 text-green-700 hover:bg-green-200 py-1 px-3 text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Icon name="Check" className="w-4 h-4" /> Approve
                                </button>
                                <button 
                                    onClick={() => handleBulkAction('rejected')} 
                                    disabled={isBulkUpdating}
                                    className="btn bg-red-100 text-red-700 hover:bg-red-200 py-1 px-3 text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Icon name="X" className="w-4 h-4" /> Reject
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="p-3 w-12 text-center">
                                        <input 
                                            type="checkbox" 
                                            className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                                            checked={allPendingSelected}
                                            onChange={handleSelectAll}
                                            disabled={pendingApplications.length === 0}
                                        />
                                    </th>
                                    <th className="p-3 text-sm font-semibold text-stone-600">Applicant</th>
                                    <th className="p-3 text-sm font-semibold text-stone-600">Contact</th>
                                    <th className="p-3 text-sm font-semibold text-stone-600">Location</th>
                                    <th className="p-3 text-sm font-semibold text-stone-600">Submitted</th>
                                    <th className="p-3 text-sm font-semibold text-stone-600 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingApplications.length > 0 ? (
                                    pendingApplications.map(app => (
                                        <tr key={app.id} className={`border-b border-stone-200 last:border-0 ${selectedApplications.includes(app.id) ? 'bg-amber-50' : ''}`}>
                                            <td className="p-3 text-center">
                                                <input 
                                                    type="checkbox" 
                                                    className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                                                    checked={selectedApplications.includes(app.id)}
                                                    onChange={(e) => handleSelectOne(e, app.id)}
                                                />
                                            </td>
                                            <td className="p-3 font-medium text-stone-800">{app.name}</td>
                                            <td className="p-3 text-stone-600 text-sm">{app.email}<br />{app.phone}</td>
                                            <td className="p-3 text-stone-600">{app.farmLocation}</td>
                                            <td className="p-3 text-stone-600">{new Date(app.submittedAt).toLocaleDateString()}</td>
                                            <td className="p-3 text-right space-x-2">
                                                <button onClick={() => onUpdateStatus(app.id, 'approved')} className="btn bg-green-100 text-green-700 hover:bg-green-200 py-1 px-3 text-sm">Approve</button>
                                                <button onClick={() => onUpdateStatus(app.id, 'rejected')} className="btn bg-red-100 text-red-700 hover:bg-red-200 py-1 px-3 text-sm">Reject</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="text-center p-6 text-stone-500">
                                            No pending applications.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
             {activeTab === 'all' && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full max-w-sm px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                        />
                        <button 
                            onClick={handleExportData}
                            className="btn btn-dark py-2 px-4 flex items-center gap-2"
                        >
                            <Icon name="Download" className="w-4 h-4" />
                            Export Data
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="p-3 text-sm font-semibold text-stone-600">Member Name</th>
                                    <th className="p-3 text-sm font-semibold text-stone-600">Email</th>
                                    <th className="p-3 text-sm font-semibold text-stone-600 w-48">Role</th>
                                    <th className="p-3 text-sm font-semibold text-stone-600 w-32">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMembers.length > 0 ? (
                                    filteredMembers.map((member) => (
                                        <tr key={member.uid} className="border-b border-stone-200 last:border-0">
                                            <td className="p-3 font-medium text-stone-800">{member.name}</td>
                                            <td className="p-3 text-stone-600">{member.email}</td>
                                            <td className="p-3">
                                                <select
                                                    value={memberRoles[member.uid] || member.role}
                                                    onChange={(e) => handleRoleChange(member.uid, e.target.value as Profile['role'])}
                                                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-amber-500 focus:border-amber-500 bg-white"
                                                >
                                                    {availableRoles.map(role => (
                                                        <option key={role} value={role} className="capitalize">{role}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="p-3">
                                                <button
                                                    onClick={() => handleSaveRole(member.uid)}
                                                    disabled={updatingUids.includes(member.uid) || memberRoles[member.uid] === member.role}
                                                    className="btn bg-amber-500 text-stone-900 hover:bg-amber-600 py-1 px-3 text-sm disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed w-full"
                                                >
                                                    {updatingUids.includes(member.uid) ? 'Saving...' : 'Save'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="text-center p-6 text-stone-500">
                                            No members found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageMembersView;

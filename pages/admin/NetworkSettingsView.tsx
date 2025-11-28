
import React, { useState, FormEvent, useEffect } from 'react';
import { Announcement, MarketPrice } from '../../types';
import { Icon, ConfirmModal } from '../../components/ui';
import { db, appId } from '../../services/firebase';
import { collection, addDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';

interface NetworkSettingsViewProps {
    announcements: Announcement[];
    marketPrices: MarketPrice[];
}

const NetworkSettingsView: React.FC<NetworkSettingsViewProps> = ({ announcements, marketPrices }) => {
    // Announcements state
    const [newAnnouncement, setNewAnnouncement] = useState({ title: '', body: '' });
    const [isSubmittingAnn, setIsSubmittingAnn] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [annToDelete, setAnnToDelete] = useState<string | null>(null);

    // Market Prices state
    const [editablePrices, setEditablePrices] = useState<Record<string, number>>({});
    const [isSavingPrice, setIsSavingPrice] = useState<string | null>(null);

    useEffect(() => {
        const initialPrices: Record<string, number> = {};
        marketPrices.forEach(p => {
            initialPrices[p.id] = p.price;
        });
        setEditablePrices(initialPrices);
    }, [marketPrices]);

    const handleAddAnnouncement = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmittingAnn(true);
        try {
            await addDoc(collection(db, `artifacts/${appId}/public/data/announcements`), {
                ...newAnnouncement,
                author: 'LCE Admin',
                date: new Date().toISOString()
            });
            setNewAnnouncement({ title: '', body: '' });
        } catch (error) {
            console.error("Error adding announcement:", error);
            alert("Failed to add announcement.");
        } finally {
            setIsSubmittingAnn(false);
        }
    };

    const openDeleteConfirm = (id: string) => {
        setAnnToDelete(id);
        setShowDeleteConfirm(true);
    };

    const handleDeleteAnnouncement = async () => {
        if (!annToDelete) return;
        try {
            await deleteDoc(doc(db, `artifacts/${appId}/public/data/announcements`, annToDelete));
        } catch (error) {
            console.error("Error deleting announcement:", error);
        } finally {
            setShowDeleteConfirm(false);
            setAnnToDelete(null);
        }
    };

    const handlePriceChange = (id: string, value: string) => {
        setEditablePrices(prev => ({ ...prev, [id]: Number(value) }));
    };

    const handleSavePrice = async (priceItem: MarketPrice) => {
        const newPrice = editablePrices[priceItem.id];
        if (newPrice === undefined || newPrice === priceItem.price) return;

        setIsSavingPrice(priceItem.id);
        try {
            const batch = writeBatch(db);
            const priceRef = doc(db, `artifacts/${appId}/public/data/marketPrices`, priceItem.id);
            const historyRef = doc(collection(db, `artifacts/${appId}/public/data/marketPrices`, priceItem.id, 'history'));
            
            const newTrend = newPrice > priceItem.price ? 'up' : newPrice < priceItem.price ? 'down' : 'stable';

            batch.update(priceRef, { price: newPrice, trend: newTrend });
            batch.set(historyRef, { date: new Date().toISOString(), price: newPrice });

            await batch.commit();

        } catch (error) {
            console.error("Error updating price:", error);
            alert("Failed to update price.");
            // Revert optimistic UI state if server update fails
            setEditablePrices(prev => ({...prev, [priceItem.id]: priceItem.price}));
        } finally {
            setIsSavingPrice(null);
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-extrabold text-stone-800 tracking-tight">Network Settings</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Announcements Section */}
                <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
                    <h2 className="text-xl font-bold text-stone-800">Manage Announcements</h2>
                    <form onSubmit={handleAddAnnouncement} className="space-y-4">
                        <input type="text" placeholder="Announcement Title" value={newAnnouncement.title} onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})} required className="w-full px-4 py-2 border border-stone-300 rounded-lg" />
                        <textarea placeholder="Announcement Body..." value={newAnnouncement.body} onChange={e => setNewAnnouncement({...newAnnouncement, body: e.target.value})} required rows={4} className="w-full px-4 py-2 border border-stone-300 rounded-lg"></textarea>
                        <button type="submit" disabled={isSubmittingAnn} className={`btn btn-dark w-full ${isSubmittingAnn ? 'btn-loading' : ''}`}>{isSubmittingAnn ? 'Posting...' : 'Post Announcement'}</button>
                    </form>
                    <div className="space-y-3">
                        <h3 className="font-semibold">Current Announcements</h3>
                        {announcements.map(ann => (
                            <div key={ann.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div>
                                    <p className="font-medium">{ann.title}</p>
                                    <p className="text-sm text-stone-500">{new Date(ann.date).toLocaleDateString()}</p>
                                </div>
                                <button onClick={() => openDeleteConfirm(ann.id)} className="text-red-500 hover:text-red-700 p-2"><Icon name="Trash2" className="w-5 h-5" /></button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Market Prices Section */}
                <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                    <h2 className="text-xl font-bold text-stone-800">Manage Market Prices</h2>
                    {marketPrices.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <label className="font-medium flex-1">{p.name}</label>
                            <div className="flex items-center space-x-2">
                                <span className="text-stone-500">₱</span>
                                <input type="number" step="0.01" value={editablePrices[p.id] || ''} onChange={e => handlePriceChange(p.id, e.target.value)} className="w-24 px-2 py-1 border border-stone-300 rounded-md" />
                                <button onClick={() => handleSavePrice(p)} disabled={isSavingPrice === p.id} className={`btn btn-dark py-1 px-3 text-sm ${isSavingPrice === p.id ? 'btn-loading' : ''}`}>
                                    {isSavingPrice === p.id ? '' : 'Save'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDeleteAnnouncement}
                title="Delete Announcement"
                message="Are you sure you want to permanently delete this announcement?"
            />
        </div>
    );
};

export default NetworkSettingsView;

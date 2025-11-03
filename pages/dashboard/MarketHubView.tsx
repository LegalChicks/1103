import React, { useState, FormEvent } from 'react';
import { useAuth } from '../../App';
import { db, appId } from '../../services/firebase';
import { collection, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { MarketPrice, Listing } from '../../types';
import { Icon, ConfirmModal } from '../../components/ui';

const MarketHubView: React.FC<{prices: MarketPrice[], listings: Listing[], myListings: Listing[]}> = ({prices, listings, myListings}) => {
    const { user } = useAuth();
    const [productName, setProductName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [listingToDelete, setListingToDelete] = useState<string | null>(null);

    const handleCreateListing = async (e: FormEvent) => {
        e.preventDefault();
        if (!user || !productName || !quantity || !price) return;

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, `artifacts/${appId}/public/data/listings`), {
                productName,
                quantity,
                price: parseFloat(price),
                userId: user.uid,
                timestamp: serverTimestamp()
            });
            setProductName('');
            setQuantity('');
            setPrice('');
        } catch (error) {
            console.error("Error creating listing:", error);
            alert("Failed to create listing. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const openDeleteConfirm = (id: string) => {
        setListingToDelete(id);
        setShowConfirm(true);
    };

    const handleDeleteListing = async () => {
        if (!listingToDelete) return;
        try {
            await deleteDoc(doc(db, `artifacts/${appId}/public/data/listings`, listingToDelete));
        } catch (error) {
            console.error("Error deleting listing:", error);
        } finally {
            setShowConfirm(false);
            setListingToDelete(null);
        }
    };


    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-text-primary">Market Hub</h1>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-2 bg-[--color-card] p-6 rounded-lg shadow-sm border border-[--color-border]">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Create New Listing</h3>
                    <form onSubmit={handleCreateListing} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder="Product (e.g., Medium Eggs)" value={productName} onChange={e => setProductName(e.target.value)} required className="w-full px-4 py-2 border border-[--color-border] rounded-lg" />
                            <input type="text" placeholder="Quantity (e.g., 30 Trays)" value={quantity} onChange={e => setQuantity(e.target.value)} required className="w-full px-4 py-2 border border-[--color-border] rounded-lg" />
                        </div>
                        <input type="number" placeholder="Price per unit (PHP)" value={price} onChange={e => setPrice(e.target.value)} required className="w-full px-4 py-2 border border-[--color-border] rounded-lg" />
                        <button type="submit" disabled={isSubmitting} className={`btn btn-dark w-full ${isSubmitting ? 'btn-loading' : ''}`}>{isSubmitting ? 'Posting...' : 'Post to Market'}</button>
                    </form>
                </div>

                <div className="bg-[--color-card] p-6 rounded-lg shadow-sm border border-[--color-border]">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Market Prices</h3>
                    <ul className="space-y-2">
                        {prices.map(item => (
                            <li key={item.id} className="flex justify-between items-center text-sm">
                                <span className="text-[--color-text-secondary]">{item.name}</span>
                                <span className="font-bold">₱{item.price.toFixed(2)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
            
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[--color-card] p-6 rounded-lg shadow-sm border border-[--color-border]">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">My Listings</h3>
                    {myListings.length > 0 ? (
                        <ul className="space-y-3">
                            {myListings.map(l => (
                                <li key={l.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div>
                                        <p className="font-semibold">{l.productName}</p>
                                        <p className="text-sm text-[--color-text-secondary]">{l.quantity} at ₱{l.price.toFixed(2)}</p>
                                    </div>
                                    <button onClick={() => openDeleteConfirm(l.id)} className="text-red-500 hover:text-red-700 p-2"><Icon name="Trash2" className="w-5 h-5"/></button>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-center text-[--color-text-secondary] py-4">You have no active listings.</p>}
                </div>

                <div className="bg-[--color-card] p-6 rounded-lg shadow-sm border border-[--color-border]">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Community Listings</h3>
                    {listings.length > 0 ? (
                        <ul className="space-y-3">
                            {listings.filter(l => l.userId !== user?.uid).map(l => (
                                <li key={l.id} className="p-3 border-b border-[--color-border] last:border-0">
                                    <p className="font-semibold">{l.productName}</p>
                                    <p className="text-sm text-[--color-text-secondary]">{l.quantity} at ₱{l.price.toFixed(2)}</p>
                                    <p className="text-xs text-slate-400 mt-1">Posted by member on {l.timestamp?.toDate().toLocaleDateString()}</p>
                                </li>
                             ))}
                        </ul>
                    ) : <p className="text-center text-[--color-text-secondary] py-4">No community listings available.</p>}
                </div>
            </section>
            
            <ConfirmModal 
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleDeleteListing}
                title="Delete Listing"
                message="Are you sure you want to permanently delete this listing?"
            />
        </div>
    );
};

export default MarketHubView;

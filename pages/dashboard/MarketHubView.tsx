
import React, { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '../../App';
import { db, appId } from '../../services/firebase';
import { collection, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { MarketPrice, Listing } from '../../types';
import { Icon, ConfirmModal, Modal } from '../../components/ui';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface MarketHubViewProps {
    prices: MarketPrice[];
    listings: Listing[];
    myListings: Listing[];
    priceHistory: Record<string, { date: string, price: number }[]>;
}

const PriceTrendCard: React.FC<{ priceItem: MarketPrice, history: { date: string, price: number }[] }> = ({ priceItem, history }) => {
    const chartData = {
        labels: history.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }),
        datasets: [{
            label: priceItem.name,
            data: history.map(d => d.price),
            borderColor: 'var(--color-primary)',
            backgroundColor: 'rgba(139, 69, 19, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            pointHitRadius: 10,
        }]
    };

    const chartOptions: any = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                ticks: {
                    callback: function (value: any) {
                        return '₱' + value;
                    }
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };

    const trendIcon = priceItem.trend === 'up' ? 'ArrowUp' : priceItem.trend === 'down' ? 'ArrowDown' : 'Minus';
    const trendColor = priceItem.trend === 'up' ? 'text-[--color-success]' : priceItem.trend === 'down' ? 'text-[--color-danger]' : 'text-slate-500';

    return (
        <div className="bg-[--color-card] p-6 rounded-lg shadow-sm border border-[--color-border]">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-text-primary">{priceItem.name}</h3>
                <div className={`flex items-center font-bold text-lg ${trendColor}`}>
                    <Icon name={trendIcon} className="w-4 h-4 mr-1" />
                    <span>₱{priceItem.price.toFixed(2)}</span>
                </div>
            </div>
            <div className="h-48">
                {history.length > 1 ? (
                    <Line data={chartData} options={chartOptions} />
                ) : (
                    <div className="flex items-center justify-center h-full text-[--color-text-secondary]">
                        Not enough data for trend.
                    </div>
                )}
            </div>
        </div>
    );
};

const MarketHubView: React.FC<MarketHubViewProps> = ({ prices, listings, myListings, priceHistory }) => {
    const { user } = useAuth();
    const [productName, setProductName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // State for deletion
    const [showConfirm, setShowConfirm] = useState(false);
    const [listingToDelete, setListingToDelete] = useState<string | null>(null);

    // State for editing
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingListing, setEditingListing] = useState<Listing | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [editFormData, setEditFormData] = useState({ productName: '', quantity: '', price: '' });

    // Pagination Logic
    const communityListings = listings.filter(l => l.userId !== user?.uid);
    const totalPages = Math.ceil(communityListings.length / itemsPerPage);
    
    // Ensure current page is valid when listings change
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [communityListings.length, totalPages, currentPage]);

    const currentListings = communityListings.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

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

    const openEditModal = (listing: Listing) => {
        setEditingListing(listing);
        setEditFormData({
            productName: listing.productName,
            quantity: listing.quantity,
            price: String(listing.price),
        });
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditingListing(null);
    };
    
    const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateListing = async (e: FormEvent) => {
        e.preventDefault();
        if (!editingListing) return;

        setIsUpdating(true);
        try {
            const listingRef = doc(db, `artifacts/${appId}/public/data/listings`, editingListing.id);
            await updateDoc(listingRef, {
                productName: editFormData.productName,
                quantity: editFormData.quantity,
                price: parseFloat(editFormData.price),
            });
            closeEditModal();
        } catch (error) {
            console.error("Error updating listing:", error);
            alert("Failed to update listing. Please try again.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleContactSeller = (listing: Listing) => {
        const subject = `Inquiry about LCE Market Hub listing: ${listing.productName}`;
        const body = `Hi LCE Support,\n\nPlease connect me with the seller for the following listing:\n\nProduct: ${listing.productName}\nQuantity: ${listing.quantity}\nPrice: ₱${listing.price.toFixed(2)}\nListing ID: ${listing.id}\n\nI would like to inquire about its availability.\n\nThank you.`;
        const mailtoLink = `mailto:info@legalchicks.ph?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-text-primary">Market Hub</h1>

            <section className="bg-[--color-card] p-6 rounded-lg shadow-sm border border-[--color-border]">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Create New Listing</h3>
                <form onSubmit={handleCreateListing} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Product (e.g., Medium Eggs)" value={productName} onChange={e => setProductName(e.target.value)} required className="w-full px-4 py-2 border border-[--color-border] rounded-lg" />
                        <input type="text" placeholder="Quantity (e.g., 30 Trays)" value={quantity} onChange={e => setQuantity(e.target.value)} required className="w-full px-4 py-2 border border-[--color-border] rounded-lg" />
                    </div>
                    <input type="number" placeholder="Price per unit (PHP)" value={price} onChange={e => setPrice(e.target.value)} required className="w-full px-4 py-2 border border-[--color-border] rounded-lg" />
                    <button type="submit" disabled={isSubmitting} className={`btn btn-dark w-full ${isSubmitting ? 'btn-loading' : ''}`}>{isSubmitting ? 'Posting...' : 'Post to Market'}</button>
                </form>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-text-primary mb-4">Price Trends (30-day)</h2>
                {prices.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {prices.map(priceItem => (
                            <PriceTrendCard key={priceItem.id} priceItem={priceItem} history={priceHistory[priceItem.id] || []} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-[--color-card] p-6 rounded-lg shadow-sm border border-[--color-border] text-center text-[--color-text-secondary]">
                        No market price data available.
                    </div>
                )}
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
                                    <div className="flex items-center">
                                        <button onClick={() => openEditModal(l)} className="text-amber-600 hover:text-amber-800 p-2"><Icon name="Pencil" className="w-5 h-5" /></button>
                                        <button onClick={() => openDeleteConfirm(l.id)} className="text-red-500 hover:text-red-700 p-2"><Icon name="Trash2" className="w-5 h-5" /></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-center text-[--color-text-secondary] py-4">You have no active listings.</p>}
                </div>

                <div className="bg-[--color-card] p-6 rounded-lg shadow-sm border border-[--color-border] flex flex-col">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Community Listings</h3>
                    {currentListings.length > 0 ? (
                        <>
                            <ul className="space-y-3 flex-grow">
                                {currentListings.map(l => (
                                    <li key={l.id} className="p-3 border-b border-[--color-border] last:border-0">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold">{l.productName}</p>
                                                <p className="text-sm text-[--color-text-secondary]">{l.quantity} at ₱{l.price.toFixed(2)}</p>
                                                <p className="text-xs text-slate-400 mt-1">Posted by member on {l.timestamp?.toDate().toLocaleDateString()}</p>
                                            </div>
                                            <button onClick={() => handleContactSeller(l)} className="btn btn-dark py-1 px-3 text-sm whitespace-nowrap">Contact Seller</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            
                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-6 pt-4 border-t border-[--color-border]">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="btn btn-secondary text-stone-600 border-stone-300 hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm py-1 px-3"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm text-[--color-text-secondary]">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="btn btn-secondary text-stone-600 border-stone-300 hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm py-1 px-3"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
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
            
            <Modal isOpen={isEditModalOpen} onClose={closeEditModal} title="Edit Listing">
                <form onSubmit={handleUpdateListing} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-[--color-text-secondary] mb-1">Product</label>
                        <input type="text" name="productName" value={editFormData.productName} onChange={handleEditFormChange} required className="w-full px-4 py-2 border border-[--color-border] rounded-lg" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-[--color-text-secondary] mb-1">Quantity</label>
                        <input type="text" name="quantity" value={editFormData.quantity} onChange={handleEditFormChange} required className="w-full px-4 py-2 border border-[--color-border] rounded-lg" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-[--color-text-secondary] mb-1">Price per unit (PHP)</label>
                        <input type="number" name="price" value={editFormData.price} onChange={handleEditFormChange} required className="w-full px-4 py-2 border border-[--color-border] rounded-lg" />
                    </div>
                    <button type="submit" disabled={isUpdating} className={`btn btn-dark w-full ${isUpdating ? 'btn-loading' : ''}`}>
                        {isUpdating ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default MarketHubView;

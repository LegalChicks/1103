
import React, { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../../App';
import { db, storage, appId } from '../../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { UserSettings, Profile } from '../../types';
import { Icon } from '../../components/ui';

const SettingsView: React.FC<{ initialSettings: UserSettings, profile: Profile | null }> = ({ initialSettings, profile }) => {
    const { user } = useAuth();
    const [settings, setSettings] = useState<UserSettings>({});
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        setSettings({
            farmName: initialSettings.farmName || '',
            contactName: profile?.name || initialSettings.contactName || '',
            phoneNumber: initialSettings.phoneNumber || '',
            notifyMarket: initialSettings.notifyMarket ?? true,
            notifyNews: initialSettings.notifyNews ?? true,
            notifyPrice: initialSettings.notifyPrice ?? true,
        });
    }, [initialSettings, profile]);
    
    const handleSave = async (e: FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSaving(true);
        setSaveSuccess(false);

        try {
            const userRoot = `artifacts/${appId}/users/${user.uid}`;
            const settingsRef = doc(db, userRoot, 'settings', 'userPreferences');
            
            const settingsToSave: UserSettings = {
                farmName: settings.farmName,
                contactName: settings.contactName,
                phoneNumber: settings.phoneNumber,
                notifyMarket: settings.notifyMarket,
                notifyNews: settings.notifyNews,
                notifyPrice: settings.notifyPrice,
            };

            await setDoc(settingsRef, settingsToSave, { merge: true });

            // Also update profile name if it changed
            if (settings.contactName && settings.contactName !== profile?.name) {
                const profileRef = doc(db, userRoot, 'profile', 'details');
                await setDoc(profileRef, { name: settings.contactName }, { merge: true });
            }

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000); // Hide success message after 3s
        } catch (error) {
            console.error("Error saving settings:", error);
            alert("Failed to save settings. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setUploading(true);
        try {
            // Upload to Firebase Storage
            const storageRef = ref(storage, `users/${user.uid}/profile_picture`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            // Update Firestore Profile
            const userRoot = `artifacts/${appId}/users/${user.uid}`;
            const profileRef = doc(db, userRoot, 'profile', 'details');
            await setDoc(profileRef, { photoURL: downloadURL }, { merge: true });
            
            // Note: App.tsx listener will automatically update the UI
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-3xl">
            <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
            
            <div className="bg-[--color-card] p-8 rounded-lg shadow-sm border border-[--color-border] space-y-6">
                 <div>
                    <h3 className="text-xl font-semibold text-text-primary mb-4">Profile Picture</h3>
                    <div className="flex items-center space-x-6">
                        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-amber-100 border-2 border-amber-200">
                             {uploading ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                </div>
                            ) : null}
                            {profile?.photoURL ? (
                                <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-amber-700 text-3xl font-bold">
                                    {profile?.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div>
                             <label className={`btn btn-secondary text-sm cursor-pointer border-stone-300 text-stone-700 hover:bg-stone-100 hover:text-stone-900 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {uploading ? 'Uploading...' : 'Change Picture'}
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={handleImageUpload} 
                                    disabled={uploading}
                                />
                            </label>
                            <p className="text-xs text-stone-500 mt-2">JPG, GIF or PNG. Max size of 800K</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-6 border-t border-[--color-border] pt-6">
                    <div>
                        <h3 className="text-xl font-semibold text-text-primary mb-4">Farm & Personal Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[--color-text-secondary] mb-1">Farm Name</label>
                                <input type="text" name="farmName" value={settings.farmName || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-[--color-border] rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[--color-text-secondary] mb-1">Contact Name</label>
                                <input type="text" name="contactName" value={settings.contactName || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-[--color-border] rounded-lg" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-[--color-text-secondary] mb-1">Phone Number</label>
                                <input type="tel" name="phoneNumber" value={settings.phoneNumber || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-[--color-border] rounded-lg" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-text-primary mb-4">Notification Settings</h3>
                        <div className="space-y-3">
                            <ToggleSwitch label="Market Hub Listings" name="notifyMarket" checked={settings.notifyMarket ?? false} onChange={handleInputChange} />
                            <ToggleSwitch label="Network News & Announcements" name="notifyNews" checked={settings.notifyNews ?? false} onChange={handleInputChange} />
                            <ToggleSwitch label="Price Fluctuation Alerts" name="notifyPrice" checked={settings.notifyPrice ?? false} onChange={handleInputChange} />
                        </div>
                    </div>

                    <div className="border-t border-[--color-border] pt-6 flex items-center justify-between">
                        <button type="submit" disabled={isSaving} className={`btn btn-dark ${isSaving ? 'btn-loading' : ''}`}>{isSaving ? 'Saving...' : 'Save Changes'}</button>
                        {saveSuccess && (
                            <div className="flex items-center text-[--color-success] font-semibold">
                                <Icon name="CheckCircle" className="w-5 h-5 mr-2" />
                                <span>Settings saved!</span>
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

const ToggleSwitch: React.FC<{label: string, name: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void}> = ({ label, name, checked, onChange }) => (
    <label htmlFor={name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer">
        <span className="font-medium text-text-primary">{label}</span>
        <div className="relative">
            <input type="checkbox" id={name} name={name} className="sr-only" checked={checked} onChange={onChange} />
            <div className={`block w-14 h-8 rounded-full transition-colors ${checked ? 'bg-amber-500' : 'bg-slate-300'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${checked ? 'translate-x-6' : ''}`}></div>
        </div>
    </label>
);

export default SettingsView;
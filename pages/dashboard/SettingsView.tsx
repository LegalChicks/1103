import React, { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../../App';
import { db, appId } from '../../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { UserSettings, Profile } from '../../types';
import { Icon } from '../../components/ui';

const SettingsView: React.FC<{ initialSettings: UserSettings, profile: Profile | null }> = ({ initialSettings, profile }) => {
    const { user } = useAuth();
    const [settings, setSettings] = useState<UserSettings>({});
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

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
            await setDoc(settingsRef, settings, { merge: true });

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

    return (
        <div className="space-y-8 max-w-3xl">
            <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
            
            <form onSubmit={handleSave} className="bg-[--color-card] p-8 rounded-lg shadow-sm border border-[--color-border] space-y-6">
                <div>
                    <h3 className="text-xl font-semibold text-text-primary mb-4">Farm & Profile</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[--color-text-secondary] mb-1">Farm Name</label>
                            <input type="text" name="farmName" value={settings.farmName} onChange={handleInputChange} className="w-full px-4 py-2 border border-[--color-border] rounded-lg" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-[--color-text-secondary] mb-1">Contact Name</label>
                            <input type="text" name="contactName" value={settings.contactName} onChange={handleInputChange} className="w-full px-4 py-2 border border-[--color-border] rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[--color-text-secondary] mb-1">Phone Number</label>
                            <input type="tel" name="phoneNumber" value={settings.phoneNumber} onChange={handleInputChange} className="w-full px-4 py-2 border border-[--color-border] rounded-lg" />
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-semibold text-text-primary mb-4">Notifications</h3>
                    <div className="space-y-3">
                       <label className="flex items-center space-x-3 cursor-pointer">
                            <input type="checkbox" name="notifyMarket" checked={settings.notifyMarket} onChange={handleInputChange} className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
                            <span className="text-[--color-text-secondary]">New items in the Market Hub</span>
                       </label>
                       <label className="flex items-center space-x-3 cursor-pointer">
                            <input type="checkbox" name="notifyNews" checked={settings.notifyNews} onChange={handleInputChange} className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
                            <span className="text-[--color-text-secondary]">Network news and announcements</span>
                       </label>
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input type="checkbox" name="notifyPrice" checked={settings.notifyPrice} onChange={handleInputChange} className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
                            <span className="text-[--color-text-secondary]">Significant market price changes</span>
                       </label>
                    </div>
                </div>
                
                <div className="pt-4 flex items-center space-x-4">
                    <button type="submit" disabled={isSaving} className={`btn btn-dark ${isSaving ? 'btn-loading' : ''}`}>{isSaving ? 'Saving...' : 'Save Changes'}</button>
                    {saveSuccess && <span className="text-[--color-success] font-semibold flex items-center"><Icon name="CheckCircle" className="w-5 h-5 mr-2" /> Settings Saved!</span>}
                </div>
            </form>
        </div>
    );
};

export default SettingsView;
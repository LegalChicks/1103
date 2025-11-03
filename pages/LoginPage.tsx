import React, { useState, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { Icon } from '../components/ui';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/dashboard";

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate(from, { replace: true });
        } catch (err: any) {
            if (err.code === 'auth/user-not-found') {
                 // For demo purposes, create the user if it doesn't exist.
                 // In a real app, you'd have a separate sign-up flow.
                try {
                    await createUserWithEmailAndPassword(auth, email, password);
                    navigate(from, { replace: true });
                } catch (creationError: any) {
                    setError('Failed to create a new demo account.');
                }
            } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
                setError("Invalid credentials. For this demo, please use 'member@legalchicks.vip' with password 'password123'.");
            } else {
                setError('An unknown error occurred. Please try again later.');
                console.error("Login Error:", err);
            }
        } finally {
            setIsLoading(false);
        }
    };
    

    return (
        <div className="bg-slate-50 min-h-screen">
            <header className="bg-white shadow-sm">
                <nav className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center sm:justify-start h-16">
                        <a href="/#" className="flex items-center space-x-3">
                            <img src="https://placehold.co/48x48/8B4513/FFFFFF?text=LCE&font=inter" alt="LCE Logo" className="h-9 w-9 rounded-full" />
                            <span className="text-xl font-bold text-stone-800">Legal Chicks Empowerment Network</span>
                        </a>
                    </div>
                </nav>
            </header>

            <main className="flex items-center justify-center min-h-[calc(100vh-10rem)] py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
                        <div className="text-center">
                            <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">Member Login</h2>
                            <p className="mt-2 text-stone-600">Access your Empowerment Dashboard.</p>
                        </div>
                        {error && (
                            <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg text-center">
                                <span className="font-medium text-red-700">{error}</span>
                            </div>
                        )}
                        <form onSubmit={handleLogin} className="mt-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="email-address" className="font-medium text-stone-700">Email address</label>
                                    <input id="email-address" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-amber-500 focus:border-amber-500" placeholder="member@legalchicks.vip" />
                                </div>
                                <div>
                                    <label htmlFor="password" className="font-medium text-stone-700">Password</label>
                                    <div className="relative mt-1">
                                        <input id="password" name="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required className="block w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-amber-500 focus:border-amber-500" placeholder="password123" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600">
                                            <Icon name={showPassword ? 'EyeOff' : 'Eye'} className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <button type="submit" disabled={isLoading} className={`btn btn-primary w-full flex justify-center py-3.5 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    {isLoading ? <Icon name="Loader" className="animate-spin" /> : 'Log In'}
                                </button>
                            </div>
                        </form>
                        <div className="mt-6 text-center">
                            <p className="text-sm text-stone-600">
                                Not a member yet?
                                <a href="/#" className="font-medium text-amber-600 hover:text-amber-700"> Apply for membership</a>
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LoginPage;
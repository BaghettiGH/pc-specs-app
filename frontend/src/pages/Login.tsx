import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import { Lock, Mail } from 'lucide-react';

interface LoginProps {
    onSwitchView: (view: 'register') => void;
}

export function Login({ onSwitchView }: LoginProps) {
    const { login, error, clearError } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setFieldErrors({});
        clearError();

        try {
            await login({ email, password });
        } catch (err: any) {
            if (err.response?.data?.errors) {
                setFieldErrors(err.response.data.errors);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md animate-fade-in-up">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 bg-clip-text text-transparent">
                    Welcome Back
                </h1>
                <p className="text-sm text-slate-500 mt-2 font-medium">
                    Enter your credentials to access your secure space
                </p>
            </div>

            <div className="glass-panel p-8 rounded-2xl flex flex-col gap-6 relative overflow-hidden">
                {/* Subtle top light bar */}
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

                {error && <Alert message={error} onClose={clearError} />}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="relative">
                        <Input
                            label="Email Address"
                            type="email"
                            id="email"
                            placeholder="email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            error={fieldErrors.email?.[0]}
                            required
                        />
                        <Mail className="absolute right-3.5 top-[37px] h-4 w-4 text-slate-400" />
                    </div>

                    <div className="relative">
                        <Input
                            label="Password"
                            type="password"
                            id="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={fieldErrors.password?.[0]}
                            required
                        />
                        <Lock className="absolute right-3.5 top-[37px] h-4 w-4 text-slate-400" />
                    </div>

                    <div className="flex items-center justify-between text-xs font-medium mt-1">
                        <label className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-800">
                            <input 
                                type="checkbox" 
                                className="rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500/30" 
                            />
                            <span>Remember me</span>
                        </label>
                        <a href="#" className="text-blue-600 hover:text-blue-500 transition-colors">
                            Forgot Password?
                        </a>
                    </div>

                    <Button type="submit" loading={loading} className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.2)] hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                        Sign In
                    </Button>
                </form>
            </div>

            <p className="text-center text-sm text-slate-500 mt-6">
                Don't have an account?{' '}
                <button
                    onClick={() => {
                        clearError();
                        onSwitchView('register');
                    }}
                    className="text-red-500 hover:text-red-600 font-semibold transition-colors focus:outline-none"
                >
                    Sign up now
                </button>
            </p>
        </div>
    );
}

import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Spinner } from './components/Spinner';

function AppContent() {
    const { isAuthenticated, loading } = useAuth();
    const [view, setView] = useState<'login' | 'register'>('login');

    if (loading) {
        return (
            <div className="h-full flex-1 flex flex-col items-center justify-center bg-mesh">
                <div className="glass-panel p-6 rounded-2xl flex flex-col items-center gap-4 text-center">
                    <Spinner className="h-8 w-8 text-violet-500" />
                    <p className="text-sm font-medium text-neutral-400">Loading secure portal...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-full w-full flex-1 flex flex-col items-center p-6 bg-mesh relative ${
            isAuthenticated ? 'justify-start py-10' : 'justify-center overflow-hidden'
        }`}>
            {/* Background glowing decorations */}
            <div className="absolute -top-12 -left-12 h-96 w-96 rounded-full bg-gradient-to-br from-red-400/25 to-pink-500/20 blur-3xl pointer-events-none animate-float" />
            <div className="absolute -bottom-12 -right-12 h-[450px] w-[450px] rounded-full bg-gradient-to-tl from-blue-400/25 to-indigo-500/20 blur-3xl pointer-events-none animate-float" style={{ animationDelay: '-3s' }} />
            <div className="absolute top-1/3 right-1/4 h-80 w-80 rounded-full bg-gradient-to-r from-pink-300/15 to-blue-400/15 blur-3xl pointer-events-none animate-pulse-slow" />

            <div className="w-full flex justify-center z-10">
                {isAuthenticated ? (
                    <Dashboard />
                ) : view === 'login' ? (
                    <Login onSwitchView={setView} />
                ) : (
                    <Register onSwitchView={setView} />
                )}
            </div>
        </div>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

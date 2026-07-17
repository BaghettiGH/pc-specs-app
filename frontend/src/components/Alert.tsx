import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface AlertProps {
    message: string;
    type?: 'success' | 'error';
    onClose?: () => void;
}

export function Alert({ message, type = 'error', onClose }: AlertProps) {
    const bgStyles = type === 'success' 
        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
        : 'bg-red-500/10 border-red-500/20 text-red-400';

    return (
        <div className={`flex items-start gap-3 p-3.5 rounded-lg border text-sm animate-fade-in-up ${bgStyles}`}>
            {type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 shrink-0" />
            ) : (
                <AlertCircle className="h-5 w-5 shrink-0" />
            )}
            <div className="flex-1 font-medium">{message}</div>
            {onClose && (
                <button 
                    onClick={onClose}
                    className="text-xs text-neutral-400 hover:text-neutral-200 focus:outline-none transition-colors"
                >
                    Close
                </button>
            )}
        </div>
    );
}

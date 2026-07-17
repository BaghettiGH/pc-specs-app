import React from 'react';
import { Spinner } from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
    variant?: 'primary' | 'secondary' | 'ghost';
}

export function Button({
    children,
    loading,
    variant = 'primary',
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const baseStyle = 'relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
        primary: 'bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white shadow-[0_0_15px_rgba(124,58,237,0.4)] hover:shadow-[0_0_20px_rgba(124,58,237,0.6)]',
        secondary: 'bg-neutral-800/80 hover:bg-neutral-700 active:bg-neutral-900 text-neutral-200 border border-neutral-700/50',
        ghost: 'bg-transparent hover:bg-neutral-900 active:bg-neutral-800 text-neutral-400 hover:text-neutral-200',
    };

    return (
        <button
            disabled={disabled || loading}
            className={`${baseStyle} ${variants[variant]} ${className}`}
            {...props}
        >
            {loading && <Spinner className="h-4 w-4" />}
            <span>{children}</span>
        </button>
    );
}

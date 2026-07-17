import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export function Input({
    label,
    error,
    id,
    className = '',
    ...props
}: InputProps) {
    return (
        <div className="flex flex-col gap-1.5 w-full">
            <div className="flex justify-between items-center">
                <label htmlFor={id} className="text-xs font-semibold tracking-wide text-neutral-400 uppercase">
                    {label}
                </label>
            </div>
            <input
                id={id}
                className={`glass-input px-4 py-2.5 rounded-lg text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none w-full ${
                    error ? 'border-red-500/50 focus:border-red-500/80 focus:ring-red-500/10' : ''
                } ${className}`}
                {...props}
            />
            {error && (
                <span className="text-xs text-red-400 font-medium mt-0.5">
                    {error}
                </span>
            )}
        </div>
    );
}

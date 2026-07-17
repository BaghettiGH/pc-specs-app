import { ChangeEvent } from 'react';

interface InputFieldProps {
    id: string;
    name: string;
    type: string;
    label: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    autoComplete?: string;
    disabled?: boolean;
    error?: string;
}

export default function InputField({
    id,
    name,
    type,
    label,
    value,
    onChange,
    autoComplete,
    disabled,
    error,
}: InputFieldProps) {
    return (
        <div style={styles.field}>
            <label htmlFor={id} style={styles.label}>
                {label}
            </label>
            <input
                id={id}
                name={name}
                type={type}
                autoComplete={autoComplete}
                value={value}
                onChange={onChange}
                disabled={disabled}
                style={{
                    ...styles.input,
                    ...(error ? styles.inputError : {}),
                }}
            />
            {error && <span style={styles.errorText}>{error}</span>}
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    label: {
        fontSize: '13px',
        fontWeight: 500,
        color: '#374151',
    },
    input: {
        padding: '10px 12px',
        fontSize: '14px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        outline: 'none',
    },
    inputError: {
        borderColor: '#dc2626',
    },
    errorText: {
        fontSize: '12px',
        color: '#dc2626',
    },
};
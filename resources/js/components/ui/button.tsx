import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
}

export default function Button({
  isLoading = false,
  loadingText = 'Loading...',
  children,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || isLoading}
      style={{ ...styles.button, ...style }}
    >
      {isLoading ? loadingText : children}
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  button: {
    marginTop: '8px',
    padding: '10px 12px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#ffffff',
    backgroundColor: '#2563eb',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};
import { FormEvent } from 'react';
import { useForm } from '@inertiajs/react';
import InputField from '../../components/ui/inputfield';
import Button from '../../components/ui/button';
import { LoginFormData } from '../../types/auth';

export default function LoginForm() {
    const { data, setData, post, processing, errors } = useForm<LoginFormData>({
        username: '',
        password: '',
    });

    const submit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Backend route to be implemented separately (e.g. POST /login)
        post('/login');
    };

    return (
        <form onSubmit={submit} style={styles.form}>
            <InputField
                id="username"
                name="username"
                type="text"
                label="Username"
                autoComplete="username"
                value={data.username}
                onChange={(e) => setData('username', e.target.value)}
                disabled={processing}
                error={errors.username}
            />

            <InputField
                id="password"
                name="password"
                type="password"
                label="Password"
                autoComplete="current-password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                disabled={processing}
                error={errors.password}
            />

            <Button type="submit" isLoading={processing} loadingText="Signing in...">
                Sign In
            </Button>
        </form>
    );
}

const styles: Record<string, React.CSSProperties> = {
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
};
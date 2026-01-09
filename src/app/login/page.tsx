"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            if (res.ok) {
                router.push('/');
                router.refresh(); // Refresh to ensure middleware/layout checks update
            } else {
                setError('Feil passord. Prøv igjen 🙈');
            }
        } catch (err) {
            setError('Noe gikk galt.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            minHeight: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#131014',
            color: 'white',
            padding: '1rem'
        }}>
            <div style={{
                background: '#1c181d',
                padding: '2.5rem',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.1)',
                width: '100%',
                maxWidth: '400px',
                textAlign: 'center'
            }}>
                <h1 style={{ marginBottom: '1.5rem', fontSize: '1.8rem' }}>M51 Dashboard 🔐</h1>
                <p style={{ color: '#999', marginBottom: '2rem' }}>Skriv inn team-passordet for å fortsette.</p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="password"
                        placeholder="Passord"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            padding: '1rem',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.2)',
                            background: 'rgba(255,255,255,0.05)',
                            color: 'white',
                            fontSize: '1rem'
                        }}
                    />

                    {error && (
                        <p style={{ color: '#ff3b3f', fontSize: '0.9rem', margin: '0' }}>{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            background: '#bded62',
                            color: '#131014',
                            border: 'none',
                            padding: '1rem',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Sjekker...' : 'Logg inn'}
                    </button>
                </form>
            </div>
        </main>
    );
}

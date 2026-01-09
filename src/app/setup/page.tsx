"use client";

import { useState } from 'react';

export default function SetupPage() {
    const [status, setStatus] = useState<string>('Ready');
    const [loading, setLoading] = useState(false);

    const handleSetup = async () => {
        setLoading(true);
        setStatus('Initializing...');
        try {
            const res = await fetch('/api/setup-db');
            const data = await res.json();
            if (res.ok) {
                setStatus('Success: ' + data.message);
            } else {
                setStatus('Error: ' + JSON.stringify(data));
            }
        } catch (err: any) {
            setStatus('Failed: ' + err.toString());
        }
        setLoading(false);
    };

    return (
        <div style={{ padding: '2rem', color: 'white', textAlign: 'center' }}>
            <h1>Database Setup</h1>
            <p>Click the button below to create the necessary tables.</p>
            <button
                onClick={handleSetup}
                disabled={loading}
                style={{
                    padding: '1rem 2rem',
                    fontSize: '1.2rem',
                    background: '#bded62',
                    color: 'black',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginTop: '1rem'
                }}
            >
                {loading ? 'Working...' : 'Initialize Database'}
            </button>
            <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #333' }}>
                Status: <strong>{status}</strong>
            </div>
        </div>
    );
}

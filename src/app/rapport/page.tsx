"use client";

import { useEffect, useState } from 'react';
import styles from './rapport.module.css';

interface SeoData {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    topQueries: {
        query: string;
        clicks: number;
        impressions: number;
    }[];
}

export default function RapportPage() {
    const [data, setData] = useState<SeoData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('/api/seo')
            .then(res => res.json())
            .then(data => {
                if (data.error) throw new Error(data.error);
                setData(data);
            })
            .catch(err => {
                console.error("Failed to load SEO data", err);
                setError('Kunne ikke laste data. Sjekk at serveren har tilgang til Google Search Console.');
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className={styles.main}><p>Laster SEO-tall...</p></div>;
    if (error) return <div className={styles.main}><p style={{ color: 'red' }}>{error}</p></div>;

    return (
        <main className={styles.main}>
            <h1 className={styles.title}>SEO Rapport – Siste 30 dager</h1>

            {/* Overview Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
                <div className={styles.card} style={{ textAlign: 'center', padding: '1.5rem' }}>
                    <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.5rem' }}>Klikk</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#BDED62' }}>{data?.clicks.toLocaleString()}</div>
                </div>
                <div className={styles.card} style={{ textAlign: 'center', padding: '1.5rem' }}>
                    <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.5rem' }}>Visninger</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff' }}>{data?.impressions.toLocaleString()}</div>
                </div>
                <div className={styles.card} style={{ textAlign: 'center', padding: '1.5rem' }}>
                    <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.5rem' }}>Gj.snittlig CTR</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff' }}>{(data?.ctr ? data.ctr * 100 : 0).toFixed(1)}%</div>
                </div>
                <div className={styles.card} style={{ textAlign: 'center', padding: '1.5rem' }}>
                    <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.5rem' }}>Gj.snittlig Posisjon</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ff3b3f' }}>{data?.position.toFixed(1)}</div>
                </div>
            </div>

            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Topp Søkeord</h2>

            <div className={styles.card}>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>Søkeord</th>
                                <th className={styles.th}>Klikk</th>
                                <th className={styles.th}>Visninger</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.topQueries.map((item, index) => (
                                <tr key={index}>
                                    <td className={styles.td} style={{ fontWeight: 500 }}>{item.query}</td>
                                    <td className={styles.td}>{item.clicks}</td>
                                    <td className={styles.td} style={{ color: '#aaa' }}>{item.impressions}</td>
                                </tr>
                            ))}
                            {data?.topQueries.length === 0 && (
                                <tr>
                                    <td colSpan={3} className={styles.td} style={{ textAlign: 'center', color: '#888' }}>
                                        Ingen data funnet for perioden
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}

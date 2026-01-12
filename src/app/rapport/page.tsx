"use client";

import { useEffect, useState } from 'react';
import { importedKeywords } from '../../data/keywords';
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
        position: number;
    }[];
}

interface HelpIconProps {
    text: string;
}

function HelpIcon({ text }: HelpIconProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <span className={styles.helpIconContainer}>
            <span
                className={styles.helpIcon}
                onClick={() => setIsOpen(!isOpen)}
                style={{ cursor: 'pointer' }}
            >
                ?
            </span>
            {isOpen && (
                <div className={styles.tooltipContent}>
                    {text}
                </div>
            )}
        </span>
    );
}

export default function RapportPage() {
    const [data, setData] = useState<SeoData | null>(null);
    const [loading, setLoading] = useState(true);
    // Silent error handling to not scare user if GSC is empty
    const [error, setError] = useState('');

    const [lastUpdated, setLastUpdated] = useState<string>('');
    const [debugInfo, setDebugInfo] = useState<any>(null);

    useEffect(() => {
        setLoading(true);
        fetch('/api/seo?t=' + Date.now())
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    console.error("SEO API Error:", data.error);
                    setError(data.error);
                }
                setData(data);
                setDebugInfo(data.debug);
                setLastUpdated(new Date().toLocaleTimeString('nb-NO'));
            })
            .catch(err => {
                console.error("Failed to load SEO data", err);
                setError('Kunne ikke koble til API-et');
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <main className={styles.main}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className={styles.title} style={{ marginBottom: 0 }}>SEO Rapport – Siste 30 dager</h1>
                {lastUpdated && (
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>
                        Oppdatert: {lastUpdated}
                    </span>
                )}
            </div>

            {error && (
                <div style={{
                    background: 'rgba(255, 59, 63, 0.1)',
                    border: '1px solid #ff3b3f',
                    color: '#ff3b3f',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '2rem',
                    fontSize: '0.9rem'
                }}>
                    <strong>Status:</strong> {error}
                    <br />
                    <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                        Sjekk at <strong>{debugInfo?.email || 'service-brukeren'}</strong> har fått tilgang til eiendommen <strong>{debugInfo?.siteUrl || 'm51.no'}</strong> i Google Search Console.
                    </span>
                </div>
            )}

            {/* Overview Cards (From GSC API) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
                <div
                    className={styles.card}
                    style={{ textAlign: 'center', padding: '1.5rem' }}
                >
                    <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        Klikk (GSC)
                        <HelpIcon text="Antall ganger noen har klikket på en lenke til din side fra Google-søk." />
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#BDED62' }}>
                        {data?.clicks ? data.clicks.toLocaleString() : '0'}
                    </div>
                </div>
                <div
                    className={styles.card}
                    style={{ textAlign: 'center', padding: '1.5rem' }}
                >
                    <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        Visninger (GSC)
                        <HelpIcon text="Hvor mange ganger en lenke til din side har blitt vist i søkeresultatene." />
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff' }}>
                        {data?.impressions ? data.impressions.toLocaleString() : '0'}
                    </div>
                </div>
                <div
                    className={styles.card}
                    style={{ textAlign: 'center', padding: '1.5rem' }}
                >
                    <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        Gj.snittlig CTR
                        <HelpIcon text="Click-Through Rate. Hvor stor andel av de som ser lenken din som faktisk klikker på den." />
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff' }}>
                        {data?.ctr ? (data.ctr * 100).toFixed(1) : '0.0'}%
                    </div>
                </div>
                <div
                    className={styles.card}
                    style={{ textAlign: 'center', padding: '1.5rem' }}
                >
                    <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        Gj.snittlig Posisjon
                        <HelpIcon text="Din gjennomsnittlige rangering i søkeresultatene for alle søkeord." />
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ff3b3f' }}>
                        {data?.position ? data.position.toFixed(1) : '–'}
                    </div>
                </div>
            </div>

            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                Søkeord (Rank Tracker)
                <span style={{ fontSize: '0.8rem', color: '#aaa', fontStyle: 'italic', fontWeight: 'normal' }}>flere søkeord kommer</span>
            </h2>

            {/* Detailed Table (From Imported Manual Data) */}
            <div className={styles.card}>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>
                                    Søkeord
                                </th>
                                <th className={styles.th}>
                                    Visninger <HelpIcon text="Antall ganger m51.no har blitt vist på dette spesifikke søkeordet de siste 30 dagene." />
                                </th>
                                <th className={styles.th}>
                                    Plassering
                                </th>
                                <th className={styles.th}>
                                    Endring
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {importedKeywords
                                .map((item) => {
                                    // Try to find this keyword in the live GSC data
                                    const liveMatch = data?.topQueries?.find(q => q.query.toLowerCase() === item.keyword.toLowerCase());

                                    // Use live position if available, otherwise fallback to manual
                                    const effectivePosition = liveMatch ? liveMatch.position : item.position;

                                    // Use live impressions if available, otherwise 0
                                    const effectiveImpressions = liveMatch ? liveMatch.impressions : 0;

                                    // Calculate change:
                                    // If we have live data matching manual data, we can calculate Change = (ManualBaseline - Live).
                                    // Example: Manual was 19, Live is 15. Change is +4 (Improved).
                                    // If no live data, use the manual Change column.
                                    let effectiveChange = item.change;
                                    if (liveMatch && item.position) {
                                        effectiveChange = item.position - liveMatch.position;
                                    }

                                    return {
                                        ...item,
                                        position: effectivePosition,
                                        change: effectiveChange,
                                        impressions: effectiveImpressions,
                                        isLive: !!liveMatch // Flag to show if this is real data
                                    };
                                })
                                .sort((a, b) => {
                                    // Sort by position ascending
                                    if (a.position === null && b.position === null) return 0;
                                    if (a.position === null) return 1;
                                    if (b.position === null) return -1;
                                    return a.position - b.position;
                                })
                                .map((item, index) => (
                                    <tr key={index}>
                                        <td className={styles.td} style={{ fontWeight: 500 }}>
                                            {item.url ? (
                                                <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                                                    {item.keyword}
                                                </a>
                                            ) : (
                                                item.keyword
                                            )}
                                        </td>
                                        <td className={styles.td} style={{ color: '#aaa' }}>
                                            {item.isLive ? item.impressions.toLocaleString() : '–'}
                                        </td>
                                        <td className={styles.td}>
                                            {item.position ? (
                                                <span style={{
                                                    color: item.position <= 10 ? '#bded62' : '#fff',
                                                    fontWeight: item.position <= 10 ? 'bold' : 'normal'
                                                }}>
                                                    #{Math.round(item.position)}
                                                </span>
                                            ) : (
                                                <span style={{ color: '#555' }}>–</span>
                                            )}
                                        </td>
                                        <td className={styles.td}>
                                            {Math.round(item.change) !== 0 && (
                                                <span style={{
                                                    color: item.change > 0 ? '#bded62' : '#ff3b3f',
                                                    fontSize: '0.9em'
                                                }}>
                                                    {item.change > 0 ? '▲' : '▼'} {Math.round(Math.abs(item.change))}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}

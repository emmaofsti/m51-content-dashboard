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
    const [filter, setFilter] = useState<'clicks' | 'impressions' | null>(null);

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

            {/* Debug/Status info when data is missing or error exists */}
            {!loading && (error || (!data || data.impressions === 0)) && (
                <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    marginBottom: '2rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '0.9rem'
                }}>
                    <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '0.5rem', fontSize: '1rem' }}>📡 Tilkoblingsstatus</h3>
                    <p style={{ margin: '0.2rem 0' }}>
                        {debugInfo?.email && debugInfo.email !== 'Ikke satt' ? '✓' : '❌'} Konfigurert i Vercel: <code>{debugInfo?.email || 'Venter på setup...'}</code>
                    </p>
                    {debugInfo?.siteUrl && (
                        <p style={{ margin: '0.2rem 0' }}>✓ Spør etter data for: <strong>{debugInfo.siteUrl}</strong></p>
                    )}

                    {debugInfo?.availableSites && debugInfo.availableSites.length > 0 ? (
                        <div style={{ marginTop: '1rem' }}>
                            <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Tilgjengelige eiendommer på denne kontoen:</p>
                            <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                                {debugInfo.availableSites.map((site: string) => (
                                    <li key={site} style={{ opacity: site === debugInfo.siteUrl ? 1 : 0.6 }}>
                                        {site} {site === debugInfo.siteUrl && '(Aktiv)'}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : debugInfo?.email && debugInfo.email !== 'Ikke satt' ? (
                        <p style={{ color: '#ffbaba', marginTop: '1rem' }}>
                            ⚠️ Denne kontoen har ikke tilgang til noen eiendommer i Search Console enda.
                            Legg til e-posten over i Search Console under "Brukere og tillatelser".
                        </p>
                    ) : (
                        <p style={{ color: '#ffbaba', marginTop: '1rem' }}>
                            ⚠️ Du må legge til <code>GOOGLE_CLIENT_EMAIL</code> og <code>GOOGLE_PRIVATE_KEY</code> i Vercel for at dette skal fungere.
                        </p>
                    )}

                    <p style={{ marginTop: '1rem', fontStyle: 'italic', opacity: 0.7 }}>
                        Merk: Hvis du nettopp har lagt til siden, kan det ta 24-48 timer før Google viser data i API-et.
                    </p>
                </div>
            )}

            {/* Overview Cards (From GSC API) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
                <div
                    className={`${styles.card} ${filter === 'clicks' ? styles.activeCard : ''}`}
                    style={{
                        textAlign: 'center',
                        padding: '1.5rem',
                        cursor: 'pointer',
                        borderColor: filter === 'clicks' ? '#BDED62' : 'rgba(255, 255, 255, 0.1)'
                    }}
                    onClick={() => setFilter(filter === 'clicks' ? null : 'clicks')}
                >
                    <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        Klikk (GSC)
                        <HelpIcon text="Antall ganger noen har klikket på en lenke til din side fra Google-søk. Trykk for å se søkeordene." />
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#BDED62' }}>
                        {data?.clicks ? data.clicks.toLocaleString() : '0'}
                    </div>
                </div>
                <div
                    className={`${styles.card} ${filter === 'impressions' ? styles.activeCard : ''}`}
                    style={{
                        textAlign: 'center',
                        padding: '1.5rem',
                        cursor: 'pointer',
                        borderColor: filter === 'impressions' ? '#fff' : 'rgba(255, 255, 255, 0.1)'
                    }}
                    onClick={() => setFilter(filter === 'impressions' ? null : 'impressions')}
                >
                    <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        Visninger (GSC)
                        <HelpIcon text="Hvor mange ganger en lenke til din side har blitt vist i søkeresultatene. Trykk for å se søkeordene." />
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff' }}>
                        {data?.impressions ? data.impressions.toLocaleString() : '0'}
                    </div>
                </div>
                <div
                    className={styles.card}
                    style={{ textAlign: 'center', padding: '1.5rem', opacity: 0.8 }}
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
                    style={{ textAlign: 'center', padding: '1.5rem', opacity: 0.8 }}
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>
                    {filter === 'clicks' && '🔥 Søkeord som ga klikk'}
                    {filter === 'impressions' && '👀 Søkeord med flest visninger'}
                    {filter === null && '🎯 Utvalgte søkeord (Tracker)'}
                </h2>
                {filter && (
                    <button
                        onClick={() => setFilter(null)}
                        style={{
                            background: 'none',
                            color: '#ff3b3f',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            border: '1px solid rgba(255, 59, 63, 0.2)'
                        }}
                    >
                        Nullstill filter
                    </button>
                )}
            </div>

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
                            {filter ? (
                                // Render Live GSC Data when filtering
                                (data?.topQueries || [])
                                    .filter(q => filter === 'clicks' ? q.clicks > 0 : q.impressions > 0)
                                    .sort((a, b) => filter === 'clicks' ? b.clicks - a.clicks : b.impressions - a.impressions)
                                    .slice(0, 50) // Limit to top 50
                                    .map((item, index) => (
                                        <tr key={index}>
                                            <td className={styles.td} style={{ fontWeight: 500 }}>
                                                {item.query}
                                            </td>
                                            <td className={styles.td} style={{ color: '#aaa' }}>
                                                {filter === 'clicks' ? item.clicks.toLocaleString() : item.impressions.toLocaleString()}
                                            </td>
                                            <td className={styles.td}>
                                                <span style={{ color: item.position <= 10 ? '#bded62' : '#fff' }}>
                                                    #{Math.round(item.position)}
                                                </span>
                                            </td>
                                            <td className={styles.td} style={{ color: '#555' }}>
                                                –
                                            </td>
                                        </tr>
                                    ))
                            ) : (
                                // Render Tracked Keywords (Default)
                                importedKeywords
                                    .map((item) => {
                                        const liveMatch = data?.topQueries?.find(q => q.query.toLowerCase() === item.keyword.toLowerCase());
                                        const effectivePosition = liveMatch ? liveMatch.position : item.position;
                                        const effectiveImpressions = liveMatch ? liveMatch.impressions : 0;
                                        let effectiveChange = item.change;
                                        if (liveMatch && item.position) {
                                            effectiveChange = item.position - liveMatch.position;
                                        }

                                        return {
                                            ...item,
                                            position: effectivePosition,
                                            change: effectiveChange,
                                            impressions: effectiveImpressions,
                                            isLive: !!liveMatch
                                        };
                                    })
                                    .sort((a, b) => {
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
                                    ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}

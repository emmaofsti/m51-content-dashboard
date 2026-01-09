"use client";

import { mockSeRankingData } from "../../data/se-ranking";

export default function RapportPage() {
    return (
        <main style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '3rem', fontWeight: 'bold', textAlign: 'center', color: '#ffffff' }}>SEO Rapport – Søkeord</h1>

            <div style={{
                background: '#171218',
                borderRadius: '12px',
                padding: '2rem',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <th style={{ padding: '1rem', color: '#bded62', fontWeight: 'bold' }}>Søkeord</th>
                            <th style={{ padding: '1rem', color: '#bded62', fontWeight: 'bold' }}>Posisjon</th>
                            <th style={{ padding: '1rem', color: '#bded62', fontWeight: 'bold' }}>Endring</th>
                            <th style={{ padding: '1rem', color: '#bded62', fontWeight: 'bold' }}>Volum</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockSeRankingData.map((item) => (
                            <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '1rem', fontWeight: 500 }}>{item.keyword}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '0.2rem 0.6rem',
                                        borderRadius: '20px',
                                        background: '#171218',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: '0.9rem',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}>
                                        #{item.position}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        color: item.change > 0 ? '#bded62' : item.change < 0 ? '#ff3b3f' : '#aaa',
                                        fontWeight: 'bold'
                                    }}>
                                        {item.change === 0 ? '0' : `${item.change > 0 ? '▲' : '▼'} ${Math.abs(item.change)}`}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', color: '#aaa' }}>
                                    {item.volume.toLocaleString('nb-NO')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}

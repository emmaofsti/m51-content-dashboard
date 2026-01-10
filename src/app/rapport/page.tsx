"use client";

import { mockSeRankingData } from "../../data/se-ranking";
import styles from './rapport.module.css';

export default function RapportPage() {
    return (
        <main className={styles.main}>
            <h1 className={styles.title}>SEO Rapport – Søkeord</h1>

            <div className={styles.card}>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>Søkeord</th>
                                <th className={styles.th}>Posisjon</th>
                                <th className={styles.th}>Endring</th>
                                <th className={styles.th}>Volum</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockSeRankingData.map((item) => (
                                <tr key={item.id}>
                                    <td className={styles.td} style={{ fontWeight: 500 }}>{item.keyword}</td>
                                    <td className={styles.td}>
                                        <span className={styles.positionBadge}>
                                            #{item.position}
                                        </span>
                                    </td>
                                    <td className={styles.td}>
                                        <span style={{
                                            color: item.change > 0 ? '#bded62' : item.change < 0 ? '#ff3b3f' : '#aaa',
                                            fontWeight: 'bold'
                                        }}>
                                            {item.change === 0 ? '0' : `${item.change > 0 ? '▲' : '▼'} ${Math.abs(item.change)}`}
                                        </span>
                                    </td>
                                    <td className={styles.td} style={{ color: '#aaa' }}>
                                        {item.volume.toLocaleString('nb-NO')}
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

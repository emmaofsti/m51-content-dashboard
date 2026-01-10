"use client";

import Link from 'next/link';
import { useContributions } from '../../context/ContributionsContext';
import { employees } from '../../data/employees';
import styles from './page.module.css';

export default function HistorikkPage() {
    const { contributions } = useContributions();

    // Updated to 2026
    const targetYear = 2026;
    const now = new Date();

    const months = Array.from({ length: 12 }, (_, i) => {
        const date = new Date(targetYear, i, 1);
        const isFuture = date > now;

        // Calculate Stats
        const monthIso = `${targetYear}-${String(i + 1).padStart(2, '0')}`;
        const monthContributions = contributions.filter(c => c.date.startsWith(monthIso));

        const count = monthContributions
            .filter(c => c.status === 'Published')
            .length;

        return {
            name: date.toLocaleString('nb-NO', { month: 'long' }),
            date,
            isFuture,
            count,
            iso: monthIso
        };
    });

    return (
        <main className={styles.main}>
            <h1 className={styles.title}>Historikk ({targetYear})</h1>

            <div className={styles.grid}>
                {months.map((month) => (
                    month.isFuture ? (
                        // Future Card (Blurred / Disabled)
                        <div
                            key={month.name}
                            className={styles.futureCard}
                        >
                            <h2 className={styles.cardTitle} style={{ opacity: 0.5 }}>
                                {month.name}
                            </h2>
                            <div style={{ filter: 'blur(4px)', opacity: 0.3, userSelect: 'none' }}>
                                Not started yet
                                <br />
                                0 / {employees.length} bidrag
                            </div>
                        </div>
                    ) : (
                        // Active Card
                        <Link
                            key={month.name}
                            href={`/?month=${month.iso}`}
                            className={styles.card}
                        >
                            <h2 className={styles.cardTitle}>
                                {month.name}
                            </h2>
                            <p className={styles.subtitle}>
                                {month.count} / {employees.length} bidrag
                            </p>
                        </Link>
                    )
                ))}
            </div>
        </main>
    );
}

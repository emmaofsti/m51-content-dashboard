"use client";

import { useContributions } from '../context/ContributionsContext';
import { employees } from '../data/employees';
import { CircularProgress } from './CircularProgress';

interface TeamProgressProps {
    currentMonth: string; // YYYY-MM
}

export function TeamProgress({ currentMonth }: TeamProgressProps) {
    const { contributions } = useContributions();

    // Filter contributions for this month
    const monthContributions = contributions.filter(c => c.date.startsWith(currentMonth));

    // Count total published contributions
    const count = monthContributions.filter(c => c.status === 'Published').length;

    // Use total employees as baseline target? Or maybe we should sum individual targets?
    // For now, keeping it as employees.length (assuming 1 per person default).
    const total = employees.length;

    const date = new Date(currentMonth + '-01');
    const monthName = date.toLocaleString('nb-NO', { month: 'long' });

    return (
        <div style={{
            marginBottom: '3rem',
            textAlign: 'center',
            color: 'white'
        }}>
            <h2 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 'bold', letterSpacing: '-0.03em' }}>Team M51</h2>
            <div style={{ width: '40px', height: '2px', background: '#ff3b3f', margin: '0.5rem auto' }} />
            <p style={{ margin: '0.5rem 0 0', fontSize: '1.1rem', color: '#ccc' }}>
                Vi har levert <b style={{ color: '#fff' }}>{count}</b> av <b style={{ color: '#fff' }}>{total}</b> bidrag i {monthName}
            </p>
        </div>
    );
}

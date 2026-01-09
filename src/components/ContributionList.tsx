import { Contribution } from '../data/contributions';
import { useContributions } from '../context/ContributionsContext';

interface ContributionListProps {
    contributions: Contribution[];
}

export function ContributionList({ contributions }: ContributionListProps) {
    const { deleteContribution } = useContributions();

    if (contributions.length === 0) {
        return <p style={{ color: '#666', fontStyle: 'italic' }}>Ingen bidrag registrert denne måneden.</p>;
    }

    return (
        <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0' }}>
            {contributions.map((c) => (
                <li
                    key={c.id}
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem 0',
                        borderBottom: '1px solid #eee'
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', textAlign: 'left' }}>
                        <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{c.title}</span>
                        <span style={{ fontSize: '0.8rem', color: '#888' }}>{c.type} • {c.date}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span
                            style={{
                                fontSize: '0.75rem',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '999px',
                                fontWeight: 500,
                                backgroundColor: c.status === 'Published' ? '#e6fffa' : c.status === 'In Review' ? '#fffaf0' : '#f3f4f6',
                                color: c.status === 'Published' ? '#047857' : c.status === 'In Review' ? '#c05621' : '#4b5563',
                                border: `1px solid ${c.status === 'Published' ? '#059669' : c.status === 'In Review' ? '#dd6b20' : '#d1d5db'}`
                            }}
                        >
                            {c.status}
                        </span>

                        <button
                            onClick={() => {
                                if (window.confirm('Vil du slette dette bidraget?')) {
                                    deleteContribution(c.id);
                                }
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#ff3b3f',
                                padding: '0.25rem',
                                display: 'flex',
                                alignItems: 'center',
                                opacity: 0.7,
                                transition: 'opacity 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                            title="Slett bidrag"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    );
}

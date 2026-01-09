import { useState } from 'react';
import { Contribution } from '../data/contributions';

interface ContributionFormProps {
    employeeId: number;
    onSave: (contribution: Omit<Contribution, 'id'>) => void;
    onCancel: () => void;
}

export function ContributionForm({ employeeId, onSave, onCancel }: ContributionFormProps) {
    const [title, setTitle] = useState('');
    const [type, setType] = useState<Contribution['type']>('Innsikt');
    const [status, setStatus] = useState<Contribution['status']>('Draft');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            employeeId,
            title,
            type,
            status,
            date: new Date().toISOString().split('T')[0],
        });
    };

    const inputStyle = {
        display: 'block',
        width: '100%',
        padding: '0.5rem',
        borderRadius: '6px',
        border: '1px solid #ddd',
        fontSize: '0.9rem',
        marginTop: '0.25rem'
    };

    const labelStyle = {
        display: 'block',
        textAlign: 'left' as const,
        fontSize: '0.85rem',
        fontWeight: 500,
        marginTop: '1rem',
        color: '#444'
    };

    return (
        <form onSubmit={handleSubmit} style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px', marginTop: '1rem' }}>

            <label style={{ ...labelStyle, marginTop: 0 }}>
                Tittel
                <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="E.g., Q4 Roadmap"
                    style={inputStyle}
                />
            </label>

            <div style={{ display: 'flex', gap: '1rem' }}>
                <label style={{ ...labelStyle, flex: 1 }}>
                    Type
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value as Contribution['type'])}
                        style={inputStyle}
                    >
                        <option value="Innsikt">Innsikt</option>
                        <option value="Kundehistorie">Kundehistorie</option>
                        <option value="Annet">Annet</option>
                    </select>
                </label>

                <label style={{ ...labelStyle, flex: 1 }}>
                    Status
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as Contribution['status'])}
                        style={inputStyle}
                    >
                        <option value="Draft">Draft</option>
                        <option value="In Review">In Review</option>
                        <option value="Published">Published</option>
                    </select>
                </label>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button
                    type="button"
                    onClick={onCancel}
                    style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        border: '1px solid #ddd',
                        background: 'white',
                        cursor: 'pointer'
                    }}
                >
                    Avbryt
                </button>
                <button
                    type="submit"
                    style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#ff3b3f',
                        color: 'white',
                        fontWeight: 500,
                        cursor: 'pointer'
                    }}
                >
                    Lagre bidrag
                </button>
            </div>
        </form>
    );
}

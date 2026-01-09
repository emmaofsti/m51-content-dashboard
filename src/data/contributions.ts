export interface Contribution {
    id: string;
    employeeId: number;
    title: string;
    type: 'Innsikt' | 'Kundehistorie' | 'Annet';
    status: 'Draft' | 'In Review' | 'Published';
    date: string; // ISO date YYYY-MM-DD
    link?: string;
}

export const initialContributions: Contribution[] = [
    {
        id: '1',
        employeeId: 6, // Emma
        title: 'Q4 Roadmap',
        type: 'Innsikt',
        status: 'Published',
        date: '2026-01-15',
    },
    {
        id: '2',
        employeeId: 6, // Emma
        title: 'Tech Radar 2026',
        type: 'Innsikt',
        status: 'Published',
        date: '2026-01-20',
    },
    {
        id: '3',
        employeeId: 1, // Asgeir
        title: 'Next.js 15 Migration Guide',
        type: 'Innsikt',
        status: 'Published',
        date: '2026-01-05',
    },
    {
        id: '4',
        employeeId: 4, // Elisabeth
        title: 'Design System Updates',
        type: 'Innsikt',
        status: 'Published',
        date: '2026-01-12',
    },
    {
        id: '5',
        employeeId: 3, // Eirik
        title: 'User Research Q1',
        type: 'Annet',
        status: 'Draft',
        date: '2026-01-25',
    }
];

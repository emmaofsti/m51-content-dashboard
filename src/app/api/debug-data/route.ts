import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { employees } from '../../../data/employees';

export async function GET() {
    try {
        const { rows: contributions } = await sql`SELECT * FROM contributions`;
        const currentYear = new Date().getFullYear().toString();

        const employeeStats = employees.map(emp => {
            // Use loose equality (==)
            const count = contributions.filter(c =>
                c.employee_id == emp.id &&
                c.status === 'Published' &&
                c.date.startsWith(currentYear)
            ).length;
            return { name: emp.name, id: emp.id, count };
        });

        // Copy exact sort logic
        employeeStats.sort((a, b) => b.count - a.count);

        return NextResponse.json({
            sortedStats: employeeStats,
            contributions: contributions
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

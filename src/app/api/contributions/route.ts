import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { Contribution } from '../../../data/contributions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const { rows } = await sql`SELECT * FROM contributions ORDER BY date DESC`;

        const contributions = rows.map(row => ({
            id: row.id,
            employeeId: row.employee_id,
            title: row.title,
            type: row.type,
            status: row.status,
            date: row.date,
            created_at: row.created_at
        }));

        return NextResponse.json(contributions);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to load contributions' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const newContribution = await request.json();

        if (!newContribution.employeeId || !newContribution.title) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const id = newContribution.id || Math.random().toString(36).substr(2, 9);

        await sql`
            INSERT INTO contributions (id, employee_id, title, type, status, date)
            VALUES (
                ${id}, 
                ${newContribution.employeeId}, 
                ${newContribution.title}, 
                ${newContribution.type}, 
                ${newContribution.status}, 
                ${newContribution.date}
            )
        `;

        return NextResponse.json({ ...newContribution, id });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save contribution' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }

        await sql`DELETE FROM contributions WHERE id = ${id}`;

        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete contribution' }, { status: 500 });
    }
}

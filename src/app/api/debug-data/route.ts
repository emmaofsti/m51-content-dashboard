import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
    try {
        const { rows } = await sql`SELECT * FROM contributions`;
        return NextResponse.json({ count: rows.length, rows });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

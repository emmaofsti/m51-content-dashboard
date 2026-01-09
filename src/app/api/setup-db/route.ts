import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await sql`
      CREATE TABLE IF NOT EXISTS contributions (
        id VARCHAR(50) PRIMARY KEY,
        employee_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        type VARCHAR(50),
        status VARCHAR(50),
        date VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
        return NextResponse.json({ message: 'Table created successfully' });
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}

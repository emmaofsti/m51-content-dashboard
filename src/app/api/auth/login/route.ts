import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { password } = await request.json();
        const TEAM_PASSWORD = process.env.TEAM_PASSWORD || 'salami';

        if (password === TEAM_PASSWORD) {
            // Valid password
            // Set cookie valid for 30 days
            const cookieStore = await cookies();
            cookieStore.set('auth_token', 'authenticated', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/',
            });

            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Feil passord' }, { status: 401 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Intern feil' }, { status: 500 });
    }
}

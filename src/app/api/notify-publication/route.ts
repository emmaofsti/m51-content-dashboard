import { NextResponse } from 'next/server';
import { sendEmail } from '../../../utils/email';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title } = body;

        const subject = title ? `Nytt bidrag: ${title} 🚀` : 'Nytt innhold publisert 🚀';
        const targetEmail = 'jonathan@m51.no'; // Original target

        // Check for email credentials
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.error('Missing EMAIL_USER or EMAIL_PASSWORD');
            return NextResponse.json({ error: 'Missing Email Config' }, { status: 500 });
        }

        const { data, error } = await sendEmail(
            targetEmail,
            subject,
            `
            <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ff3b3f;">Nytt innhold er registrert!</h2>
              <p>Tittel: <strong>${title}</strong></p>
              <br/>
              <p>– M51 Content Dashboard</p>
            </div>
          `
        );

        if (error) {
            console.error('Error sending notification:', error);
            // Allow success even if email fails? No, return error so we know.
            return NextResponse.json({ error: error }, { status: 500 });
        }

        return NextResponse.json({ message: 'Notification sent', data });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

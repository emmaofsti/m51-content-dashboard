import { NextResponse } from 'next/server';
import { sendEmail } from '../../../utils/email';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title } = body;

        const subject = title ? `Nytt bidrag: ${title} 🚀` : 'Nytt innhold publisert 🚀';
        const targetEmail = 'jonathan@m51.no, emma@m51.no'; // Update: Jonathan + Emma

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
              <h2 style="color: #ff3b3f;">Hei Jonathan</h2>
              <p>Oioi, jobben kaller 📢</p>
              <p>Noen har nettopp publisert nytt innhold på nettsiden:</p>
              
              <blockquote style="border-left: 4px solid #ff3b3f; padding-left: 10px; margin: 20px 0; font-style: italic; font-size: 18px;">
                ${title}
              </blockquote>
              
              <p>Ta en titt, og få det ut på Instagram!</p>
              <p>Du er flink! 🌟</p>
              
              <br/>
              <p style="color: #999; font-size: 12px;">– Content Tracker</p>
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

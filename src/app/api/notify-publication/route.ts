import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: Request) {
    try {
        if (!resend) {
            console.error('RESEND_API_KEY is missing');
            return NextResponse.json({ error: 'Internal Server Error: Missing Email Config' }, { status: 500 });
        }

        const body = await request.json();
        const { title } = body;

        const subject = title ? `Nytt bidrag: ${title} 🚀` : 'Nytt innhold publisert 🚀 Instagram next!';

        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'jonathan@m51.no', // Should be Jonathan
            subject: `Nytt bidrag: ${title}`,
            html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          
          <br/>
          <p>– Content Tracker</p>
        </div>
      `,
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Notification sent', data });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

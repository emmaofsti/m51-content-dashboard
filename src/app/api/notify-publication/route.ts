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
            to: 'emma@m51.no', // Updated recipient
            subject: subject,
            html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff3b3f;">Hei Emma 👋</h2>
          
          <p>Oioi – jobben kaller 😎</p>
          
          <p>Noen har nettopp <strong>publisert nytt innhold på nettsiden</strong>:</p>
          <p style="font-size: 1.2rem; font-weight: bold; margin: 1rem 0;">${title || 'Ukjent tittel'}</p>
          <p>Ta en titt, og få det ut på Instagram når det passer!</p>
          
          <br/>
          
          <p>Dette klarer du lett.</p>
          <p>Du er god. 🚀</p>
          
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

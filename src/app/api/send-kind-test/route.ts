import { NextResponse, NextRequest } from 'next/server';
import { sendEmail } from '../../../utils/email';

export async function GET(request: NextRequest) {
    try {
        const htmlContent = `
            <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ff3b3f;">Hei fine deg 👋</h2>
              
              <p>Liten påminnelse om nettsiden vår!</p>
              
              <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;">Så langt i år har du ikke registrert noen bidrag – og det er helt greit, men kanskje denne måneden er måneden?</p>
                <p>Streaken din er på <strong>0 måneder</strong> akkurat nå.</p>
                <p style="margin-top: 10px;">Perfekt tidspunkt å starte 😉</p>
              </div>
    
              <p>Logg inn på <a href="https://m51-content-dashboard.vercel.app" style="color: #ff3b3f; text-decoration: none; font-weight: bold;">Content Tracker</a> og registrer når du har lagt ut noe.</p>
              <p style="color: #888; margin-top: 20px;">– Content Tracker</p>
            </div>
          `;

        const subject = 'Kanskje tid for å skrive noe til nettsiden? (TEST)';

        const targetEmail = 'emma@m51.no';

        console.log(`Sending KIND TEST email to ${targetEmail}`);
        const { data, error } = await sendEmail(targetEmail, subject, htmlContent);

        if (error) {
            return NextResponse.json({ error }, { status: 500 });
        }

        return NextResponse.json({ message: 'Kind test email sent to ' + targetEmail });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

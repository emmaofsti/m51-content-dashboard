import { NextResponse, NextRequest } from 'next/server';
import { sendEmail } from '../../../utils/email';
import { employees } from '../../../data/employees';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const targetEmail = searchParams.get('email');
        const sendToAll = searchParams.get('sendToAll') === 'true';

        // Security/Safety check: valid sender or forced test
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            return NextResponse.json({ error: 'Missing email credentials' }, { status: 500 });
        }

        const subject = 'Nettsideinnhold – Oversikt';

        const htmlContent = `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff3b3f;">Hei dere! 👋</h2>
          
          <p>Jeg har laget en felles oversikt som forhåpentligvis gjør det enklere (og litt morsommere) å levere jevnt innhold til nettsiden 😝</p>
          
          <p>Tanken er <strong>1 bidrag i måneden per person</strong> (artikkel eller kundehistorie).</p>
          
          <p style="font-style: italic; color: #666;">Det er bare ment som motivasjon og oversikt dette her assa 😌</p>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #333;">Sånn funker det:</h3>
            <ul style="padding-left: 20px; margin-bottom: 0;">
              <li style="margin-bottom: 10px;">Når du publiserer noe, registrerer du det i oversikten</li>
              <li>Du får e-post to ganger i måneden:
                <ul style="margin-top: 5px; color: #555;">
                  <li>én liten påminnelse</li>
                  <li>én status på hvordan teamet ligger an 🏆</li>
                </ul>
              </li>
            </ul>
          </div>

          <p>Oversikten finner du her:<br>
          <a href="https://m51-content-dashboard.vercel.app/login" style="color: #ff3b3f; font-weight: bold; font-size: 16px;">Gå til Content Dashboard</a></p>
          
          <div style="background: #eee; display: inline-block; padding: 5px 10px; border-radius: 4px; font-family: monospace; font-size: 14px; margin-bottom: 20px;">
            Passord: <strong>salami</strong>
          </div>

          <p>Spørsmål, tanker eller forbedringer? Si ifra!</p>
          
          <p style="margin-top: 30px;">– Emma</p>
        </div>
        `;

        // If sendToAll is true, we map over all employees
        // For now, we only implement the test for specific email or default test group
        let recipients = [];

        if (targetEmail) {
            recipients.push(targetEmail);
        } else if (sendToAll) {
            // CAUTION: This would enable bulk sending. 
            // Currently disabling unless explicitly uncommented or logic approved.
            // recipients = employees.map(e => e.email);
            return NextResponse.json({ message: 'Bulk send disabled for safety. Please provide ?email=...' });
        } else {
            return NextResponse.json({ message: 'Please provide ?email=your@email.com to test.' });
        }

        const results = [];
        for (const email of recipients) {
            const { data, error } = await sendEmail(email, subject, htmlContent);
            results.push({ email, success: !error, error });
        }

        return NextResponse.json({
            message: 'Launch email sent',
            results
        });

    } catch (error: any) {
        console.error('Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

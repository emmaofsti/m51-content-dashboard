import { NextResponse, NextRequest } from 'next/server';
import { Resend } from 'resend';
import { employees } from '../../../data/employees';
import { sql } from '@vercel/postgres';

// Initialize Resend with the API key safely
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function isFirstTuesdayOfMonth(date: Date): boolean {
    const day = date.getDay();
    const dayOfMonth = date.getDate();
    // Tuesday is 2. First Tuesday means day of month is <= 7.
    return day === 2 && dayOfMonth <= 7;
}

const MONTH_NAMES = [
    "januar", "februar", "mars", "april", "mai", "juni",
    "juli", "august", "september", "oktober", "november", "desember"
];

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const force = searchParams.get('force') === 'true';

        const now = new Date();
        const isScheduledTime = isFirstTuesdayOfMonth(now);

        if (!force && !isScheduledTime) {
            return NextResponse.json({ message: 'Skipped: Not the first Tuesday of the month' });
        }

        if (!resend) {
            console.warn('RESEND_API_KEY missing, skipping team email');
            return NextResponse.json({ message: 'Skipped: No API Key' });
        }

        // 1. Get stats from Database
        const { rows: contributions } = await sql`SELECT * FROM contributions`;

        // Map snake_case DB columns to property names used in logic (if needed), or adjust logic.
        // Logic below uses .status and .date. DB has status and date.
        // Logic filters by c.status === 'Published'. 
        // DB columns are standard.
        // BUT logic might assume other properties not in DB?
        // Let's verify usage.
        // Logic checks: c.status, c.date.
        // DB returns: status, date.
        // So this should work directly if column names match.
        // "date" is VARCHAR(10) in DB (YYYY-MM-DD), same as JSON string.
        // "status" is VARCHAR, same.

        // No mapping needed if we just trust the rows object structure matches expected shape for "status" and "date".

        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        // --- YTD Stats ---
        // Published contributions this year
        const ytdPublished = contributions.filter(c =>
            c.status === 'Published' &&
            c.date.startsWith(currentYear.toString())
        ).length;

        // Goal: 1 per person per month.
        // Approx: Number of employees * months passed (including current?)
        // Let's say goal is strictly accumulated months passed (0-index month + 1)
        const totalEmployees = employees.length;
        const monthsPassed = currentMonth + 1;
        const ytdGoal = totalEmployees * monthsPassed;

        const ytdPercent = ytdGoal > 0 ? Math.round((ytdPublished / ytdGoal) * 100) : 0;

        // --- Monthly Stats ---
        const monthName = MONTH_NAMES[currentMonth];
        const monthGoal = totalEmployees; // 1 per person

        // Use string formatting for month matching to match frontend logic and avoid timezone issues (YYYY-MM)
        const currentMonthString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

        const monthPublished = contributions.filter(c =>
            c.status === 'Published' &&
            c.date.startsWith(currentMonthString)
        ).length;


        // 2. Construct Email
        const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'emma@m51.no', // Testing: Send to Emma only
            subject: `Team Status: ${capitalizedMonth} 🚀`,
            html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff3b3f;">Hei fine deg! 👋</h2>
          
          <p>Det er første tirsdag i måneden, og det betyr: <strong>tid for månedens bidrag til nettsiden</strong> (1 stk per person).</p>
          
          <br/>

          <h3 style="margin-bottom: 5px;">Status – året så langt (YTD):</h3>
          <ul style="padding-left: 20px;">
            <li>Publisert: <strong>${ytdPublished} / ${ytdGoal}</strong> (${ytdPercent}%)</li>
          </ul>

          <h3 style="margin-bottom: 5px;">Denne måneden (${monthName}):</h3>
          <ul style="padding-left: 20px;">
            <li>Mål: <strong>${monthGoal}</strong> bidrag (1 per person)</li>
            <li>Så langt: <strong>${monthPublished} / ${monthGoal}</strong></li>
          </ul>

          <br/>
          
          <p>👉 Legg inn bidraget ditt i <strong>Nettsideinnhold – Oversikt</strong> når du er i gang:<br/>
          <a href="https://m51-content-dashboard.vercel.app/nettsideinnhold" style="color: #ff3b3f; text-decoration: none;">https://m51-content-dashboard.vercel.app/nettsideinnhold</a></p>
          
          <br/>

          <p>Takk for at dere bygger synlighet sammen 🚀<br/>
          – Content Tracker</p>
        </div>
      `,
        });

        if (error) {
            console.error('Error sending team email:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Team email sent successfully', data });

    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

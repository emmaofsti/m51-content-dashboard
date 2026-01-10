import { NextResponse, NextRequest } from 'next/server';
import { Resend } from 'resend';
import { employees } from '../../../data/employees';
import { sql } from '@vercel/postgres';
import { isLastTuesdayOfMonth } from '../../../utils/date';

// Initialize Resend with the API key safely
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const MONTH_NAMES = [
    "januar", "februar", "mars", "april", "mai", "juni",
    "juli", "august", "september", "oktober", "november", "desember"
];

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const force = searchParams.get('force') === 'true';

        const now = new Date();
        const isScheduledTime = isLastTuesdayOfMonth(now);

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


        // ... existing stats calculation ...

        // --- Top 3 Contributors (YTD) ---
        // distinct employees
        const employeeStats = employees.map(emp => {
            const count = contributions.filter(c =>
                c.employee_id === emp.id &&
                c.status === 'Published' &&
                c.date.startsWith(currentYear.toString())
            ).length;
            return { name: emp.name, count };
        });

        // Sort desc
        employeeStats.sort((a, b) => b.count - a.count);

        // Take top 3
        const top3 = employeeStats.filter(e => e.count > 0).slice(0, 3);

        // Prepare podium data (Needs at least 1 person to show podium, but let's handle empty gracefully)
        // Positions for podium: Left (2nd), Center (1st), Right (3rd)
        const first = top3[0] || { name: '-', count: 0 };
        const second = top3[1] || { name: '-', count: 0 };
        const third = top3[2] || { name: '-', count: 0 };

        // HTML for podium (using a table for email compatibility)
        // Structure:
        // |   2   |   1   |   3   |
        // | Name  | Name  | Name  |
        // | bar   | bar   | bar   |

        const podiumHtml = top3.length > 0 ? `
        <table width="100%" cellspacing="0" cellpadding="0" style="margin: 20px 0; max-width: 400px; margin-left: auto; margin-right: auto; text-align: center;">
            <tr>
                <!-- 2nd Place -->
                <td valign="bottom" width="33%" style="padding: 0 5px;">
                    <div style="font-size: 1.5rem;">🥈</div>
                    <div style="font-weight: bold; font-size: 14px; margin-bottom: 5px;">${second.count > 0 ? second.name : ''}</div>
                    <div style="font-size: 12px; color: #666; margin-bottom: 5px;">${second.count > 0 ? second.count + ' bidrag' : ''}</div>
                    <div style="height: 30px;"></div>
                    <div style="background-color: #e0e0e0; height: 60px; border-top-left-radius: 4px; border-top-right-radius: 4px;"></div>
                </td>

                <!-- 1st Place -->
                <td valign="bottom" width="33%" style="padding: 0 5px;">
                    <div style="font-size: 2rem;">🏆</div>
                    <div style="font-weight: bold; font-size: 16px; margin-bottom: 5px;">${first.count > 0 ? first.name : ''}</div>
                    <div style="font-size: 12px; color: #666; margin-bottom: 5px;">${first.count > 0 ? first.count + ' bidrag' : ''}</div>
                    <div style="height: 20px;"></div>
                    <div style="background-color: #ff3b3f; height: 100px; border-top-left-radius: 4px; border-top-right-radius: 4px;"></div>
                </td>

                <!-- 3rd Place -->
                <td valign="bottom" width="33%" style="padding: 0 5px;">
                    <div style="font-size: 1.5rem;">🥉</div>
                    <div style="font-weight: bold; font-size: 14px; margin-bottom: 5px;">${third.count > 0 ? third.name : ''}</div>
                    <div style="font-size: 12px; color: #666; margin-bottom: 5px;">${third.count > 0 ? third.count + ' bidrag' : ''}</div>
                    <div style="height: 40px;"></div>
                    <div style="background-color: #e0e0e0; height: 40px; border-top-left-radius: 4px; border-top-right-radius: 4px;"></div>
                </td>
            </tr>
        </table>
        ` : '<p style="text-align: center; color: #999;">Ingen bidrag enda i år.</p>';


        // 2. Construct Email
        const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'emma@m51.no', // Testing: Send to Emma only
            subject: `Status nettsideinnhold: ${capitalizedMonth}`,
            html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff3b3f;">Hei fine deg! 👋</h2>

          <p>Her kommer en oppdatering på nettsideinnhold hittil.</p>

          <h3 style="margin-bottom: 5px;">Status – året så langt:</h3>
          <ul style="padding-left: 20px;">
            <li>Publisert: <strong>${ytdPublished}</strong></li>
          </ul>

          <h4 style="margin-bottom: 5px; text-align: center;">Topp 3 bidragsytere 🏆</h4>

          ${podiumHtml}

          <h3 style="margin-bottom: 5px;">Denne måneden (${monthName}):</h3>
          <ul style="padding-left: 20px;">
            <li>Mål: <strong>${monthGoal}</strong> bidrag (7 stk)</li>
            <li>Så langt: <strong>${monthPublished} / ${monthGoal}</strong></li>
          </ul>

          <p>Måneden er ikke over. Du kan fortsatt legge ut noe!</p>

          <p>Logg inn på <a href="https://m51-content-dashboard.vercel.app" style="color: #ff3b3f; text-decoration: none; font-weight: bold;">Content Tracker</a> for å registrere status.</p>
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

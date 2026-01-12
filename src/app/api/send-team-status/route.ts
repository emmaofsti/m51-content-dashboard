import { NextResponse, NextRequest } from 'next/server';
import { employees } from '../../../data/employees';
import { sql } from '@vercel/postgres';
import { isLastTuesdayOfMonth } from '../../../utils/date';
import { sendEmail } from '../../../utils/email';

export const dynamic = 'force-dynamic'; // Prevent caching

const MONTH_NAMES = [
    "januar", "februar", "mars", "april", "mai", "juni",
    "juli", "august", "september", "oktober", "november", "desember"
];

export async function GET(request: NextRequest) {
    try {
        // Disabled by user request
        return NextResponse.json({ message: 'Team status email is disabled' });

        const { searchParams } = new URL(request.url);
        const force = searchParams.get('force') === 'true';
        const targetEmail = searchParams.get('email');

        const now = new Date();
        const isScheduledTime = isLastTuesdayOfMonth(now);

        if (!force && !isScheduledTime) {
            return NextResponse.json({ message: 'Skipped: Not the first Tuesday of the month' });
        }

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.warn('Email credentials missing, skipping team email');
            return NextResponse.json({ message: 'Skipped: No Email Credentials' });
        }

        // 1. Get stats from Database
        const { rows: contributions } = await sql`SELECT * FROM contributions`;

        console.log('Total contributions fetched:', contributions.length);

        // --- Top 3 Contributors (YTD) ---

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
                c.employee_id == emp.id &&
                c.status === 'Published' &&
                c.date.startsWith(currentYear.toString())
            ).length;
            return { name: emp.name, count };
        });

        // Sort desc
        employeeStats.sort((a, b) => b.count - a.count);

        // Check for ties in 1st place
        const maxCount = employeeStats.length > 0 ? employeeStats[0].count : 0;
        const winners = employeeStats.filter(e => e.count === maxCount && e.count > 0);

        let topContentHtml = '';

        // Hoist variables for debug scope
        let top3: { name: string; count: number; }[] = [];
        let first = { name: '-', count: 0 };
        let second = { name: '-', count: 0 };
        let third = { name: '-', count: 0 };

        if (winners.length > 1) {
            // Tie Logic: Show text instead of podium
            const names = winners.map(w => w.name).join(', ');
            // "Veldig bra jobba til *navn* dere har publisert - innlegg hver"
            // Rephrased slightly for grammar: "Veldig bra jobba til [Names], dere har publisert [Count] innlegg hver!"
            const lastIndex = names.lastIndexOf(', ');
            const formattedNames = lastIndex !== -1 ? names.substring(0, lastIndex) + ' og ' + names.substring(lastIndex + 2) : names;

            topContentHtml = `
            <div style="background: #BDED62; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; color: #171218;">
                <h3 style="margin-top: 0;">🏆 Uavgjort i toppen!</h3>
                <p style="font-size: 16px;">Veldig bra jobba til <strong>${formattedNames}</strong>!</p>
                <p>Dere har publisert <strong>${maxCount}</strong> innlegg hver. 👏</p>
            </div>
            `;
        } else {
            // Standard Podium Logic
            top3 = employeeStats.filter(e => e.count > 0).slice(0, 3);

            first = top3[0] || { name: '-', count: 0 };
            second = top3[1] || { name: '-', count: 0 };
            third = top3[2] || { name: '-', count: 0 };

            topContentHtml = top3.length > 0 ? `
            <table width="100%" cellspacing="0" cellpadding="0" style="margin: 20px 0; max-width: 400px; margin-left: auto; margin-right: auto; text-align: center;">
                <tr>
                    <!-- 2nd Place -->
                    <td valign="bottom" width="33%" style="padding: 0 5px;">
                        <div style="font-size: 12px; color: #999; margin-bottom: 5px;">2. plass</div>
                        <div style="font-size: 1.5rem;">🥈</div>
                        <div style="font-weight: bold; font-size: 14px; margin-bottom: 5px;">${second.count > 0 ? second.name : ''}</div>
                        <div style="font-size: 12px; color: #666; margin-bottom: 5px;">${second.count > 0 ? second.count + ' bidrag' : ''}</div>
                        <div style="height: 30px;"></div>
                        <div style="background-color: #E0F7B6; height: 60px; border-top-left-radius: 4px; border-top-right-radius: 4px;"></div>
                    </td>

                    <!-- 1st Place -->
                    <td valign="bottom" width="33%" style="padding: 0 5px;">
                        <div style="font-size: 12px; color: #BDED62; font-weight: bold; margin-bottom: 5px;">1. PLASS</div>
                        <div style="font-size: 2rem;">🏆</div>
                        <div style="font-weight: bold; font-size: 16px; margin-bottom: 5px;">${first.count > 0 ? first.name : ''}</div>
                        <div style="font-size: 12px; color: #666; margin-bottom: 5px;">${first.count > 0 ? first.count + ' bidrag' : ''}</div>
                        <div style="height: 20px;"></div>
                        <div style="background-color: #BDED62; height: 100px; border-top-left-radius: 4px; border-top-right-radius: 4px;"></div>
                    </td>

                    <!-- 3rd Place -->
                    <td valign="bottom" width="33%" style="padding: 0 5px;">
                        <div style="font-size: 12px; color: #999; margin-bottom: 5px;">3. plass</div>
                        <div style="font-size: 1.5rem;">🥉</div>
                        <div style="font-weight: bold; font-size: 14px; margin-bottom: 5px;">${third.count > 0 ? third.name : ''}</div>
                        <div style="font-size: 12px; color: #666; margin-bottom: 5px;">${third.count > 0 ? third.count + ' bidrag' : ''}</div>
                        <div style="height: 40px;"></div>
                        <div style="background-color: #F7FBEF; height: 40px; border-top-left-radius: 4px; border-top-right-radius: 4px;"></div>
                    </td>
                </tr>
            </table>
            ` : '<p style="text-align: center; color: #999;">Ingen bidrag enda i år.</p>';
        }

        // --- Honorable Mention (Comeback) Logic ---
        const honorableMentions = employees.filter(emp => {
            // 1. Did they contribute THIS month?
            const contributedThisMonth = contributions.some(c =>
                c.employee_id == emp.id &&
                c.status === 'Published' &&
                c.date.startsWith(currentMonthString)
            );
            if (!contributedThisMonth) return false;

            // 2. Did they have a "pause" of > 3 months?
            const userDates = contributions
                .filter(c => c.employee_id == emp.id && c.status === 'Published')
                .map(c => new Date(c.date)) // Assumes YYYY-MM-DD string
                .sort((a, b) => b.getTime() - a.getTime());

            // userDates[0] is likely this month (since we confirmed contribution).
            // Find the breakdown point.

            const startOfThisMonth = new Date(currentYear, currentMonth, 1);

            // Find the most recent contribution strictly BEFORE this month
            const lastPreviousDate = userDates.find(d => d < startOfThisMonth);

            if (!lastPreviousDate) return false; // No history = new user = not a comeback

            // Calculate gap in months
            const diffMonths = (startOfThisMonth.getFullYear() - lastPreviousDate.getFullYear()) * 12 +
                (startOfThisMonth.getMonth() - lastPreviousDate.getMonth());

            // "Over 3 mnd" -> Gap > 3. (e.g. May - Jan = 4).
            return diffMonths > 3;
        });

        let honorableMentionHtml = '';
        if (honorableMentions.length > 0) {
            honorableMentions.forEach(emp => {
                honorableMentionHtml += `
                 <div style="margin-top: 30px; padding: 15px; border: 2px dashed #ff3b3f; border-radius: 8px; text-align: center; background-color: #fff5f5;">
                    <div style="font-size: 18px; font-weight: bold; color: #ff3b3f;">🏅 Honorable mention:</div>
                    <p style="font-size: 16px; margin: 10px 0 0 0; line-height: 1.4;">
                        <strong>${emp.name}</strong> har tidenes comeback – tilbake på content-kjøret igjen etter noen måneders pause! 🔥
                    </p>
                 </div>
                `;
            });
        }

        // 2. Construct Email
        const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

        const htmlContent = `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff3b3f;">Hei fine deg! 👋</h2>

          <p>Her kommer en oppdatering på nettsideinnhold hittil.</p>

          <h3 style="margin-bottom: 5px;">Status – året så langt:</h3>
          <ul style="padding-left: 20px;">
            <li>Publisert: <strong>${ytdPublished}</strong></li>
          </ul>

          <h4 style="margin-bottom: 5px; text-align: center;">Topp 3 bidragsytere 🏆</h4>

          ${topContentHtml}
          
          ${honorableMentionHtml}

          <h3 style="margin-bottom: 5px; margin-top: 30px;">Denne måneden (${monthName}):</h3>
          <ul style="padding-left: 20px;">
            <li>Mål: <strong>${monthGoal}</strong> bidrag (7 stk)</li>
            <li>Så langt: <strong>${monthPublished} / ${monthGoal}</strong></li>
          </ul>

          <p>Måneden er ikke over. Du kan fortsatt legge ut noe!</p>

          <p>Logg inn på <a href="https://m51-content-dashboard.vercel.app" style="color: #ff3b3f; text-decoration: none; font-weight: bold;">Content Tracker</a> for å registrere status.</p>
        </div>
      `;

        // 3. Send Email
        const recipients: string[] = targetEmail
            ? [targetEmail]
            : ['emma@m51.no', 'jonathan@m51.no'];

        const sendPromises = recipients.map(email =>
            sendEmail(
                email,
                `Status nettsideinnhold: ${capitalizedMonth}`,
                htmlContent
            )
        );

        const results = await Promise.all(sendPromises);
        const errors = results.filter(r => r.error);

        if (errors.length === recipients.length && recipients.length > 0) {
            console.error('All emails failed:', errors);
            return NextResponse.json({ error: 'All emails failed' }, { status: 500 });
        }

        return NextResponse.json({
            message: 'Team email sent successfully',
            data: {
                sent: results.length - errors.length,
                failed: errors.length
            }
        });

    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

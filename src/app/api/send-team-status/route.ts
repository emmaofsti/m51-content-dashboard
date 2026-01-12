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
        const { searchParams } = new URL(request.url);
        const force = searchParams.get('force') === 'true';
        const targetEmail = searchParams.get('email');

        const now = new Date();
        const isScheduledTime = isLastTuesdayOfMonth(now);

        if (!force && !isScheduledTime) {
            return NextResponse.json({ message: 'Skipped: Not the last Tuesday of the month' });
        }

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.warn('Email credentials missing, skipping team email');
            return NextResponse.json({ message: 'Skipped: No Email Credentials' });
        }

        // 1. Get stats from Database
        const { rows: contributions } = await sql`SELECT * FROM contributions`;

        console.log('Total contributions fetched:', contributions.length);

        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        // --- YTD Stats ---
        const ytdPublished = contributions.filter(c =>
            c.status === 'Published' &&
            c.date.startsWith(currentYear.toString())
        ).length;

        const totalEmployees = employees.length;
        const monthsPassed = currentMonth + 1;
        const ytdGoal = totalEmployees * monthsPassed;

        // --- Monthly Stats ---
        const monthName = MONTH_NAMES[currentMonth];
        const monthGoal = totalEmployees; // 1 per person

        const currentMonthString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

        const monthPublished = contributions.filter(c =>
            c.status === 'Published' &&
            c.date.startsWith(currentMonthString)
        ).length;

        // --- Top 3 Contributors (YTD) ---
        const employeeStats = employees.map(emp => {
            const count = contributions.filter(c =>
                c.employee_id == emp.id &&
                c.status === 'Published' &&
                c.date.startsWith(currentYear.toString())
            ).length;
            return { name: emp.name, count };
        });

        employeeStats.sort((a, b) => b.count - a.count);

        const maxCount = employeeStats.length > 0 ? employeeStats[0].count : 0;
        const winners = employeeStats.filter(e => e.count === maxCount && e.count > 0);

        let topContentHtml = '';
        let top3: { name: string; count: number; }[] = [];
        let first = { name: '-', count: 0 };
        let second = { name: '-', count: 0 };
        let third = { name: '-', count: 0 };

        if (winners.length > 1) {
            const names = winners.map(w => w.name).join(', ');
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
            top3 = employeeStats.filter(e => e.count > 0).slice(0, 3);
            first = top3[0] || { name: '-', count: 0 };
            second = top3[1] || { name: '-', count: 0 };
            third = top3[2] || { name: '-', count: 0 };

            topContentHtml = top3.length > 0 ? `
            <table width="100%" cellspacing="0" cellpadding="0" style="margin: 20px 0; max-width: 400px; margin-left: auto; margin-right: auto; text-align: center;">
                <tr>
                    <td valign="bottom" width="33%" style="padding: 0 5px;">
                        <div style="font-size: 12px; color: #999; margin-bottom: 5px;">2. plass</div>
                        <div style="font-size: 1.5rem;">🥈</div>
                        <div style="font-weight: bold; font-size: 14px; margin-bottom: 5px;">${second.count > 0 ? second.name : ''}</div>
                        <div style="font-size: 12px; color: #666; margin-bottom: 5px;">${second.count > 0 ? second.count + ' bidrag' : ''}</div>
                        <div style="height: 30px;"></div>
                        <div style="background-color: #E0F7B6; height: 60px; border-top-left-radius: 4px; border-top-right-radius: 4px;"></div>
                    </td>
                    <td valign="bottom" width="33%" style="padding: 0 5px;">
                        <div style="font-size: 12px; color: #BDED62; font-weight: bold; margin-bottom: 5px;">1. PLASS</div>
                        <div style="font-size: 2rem;">🏆</div>
                        <div style="font-weight: bold; font-size: 16px; margin-bottom: 5px;">${first.count > 0 ? first.name : ''}</div>
                        <div style="font-size: 12px; color: #666; margin-bottom: 5px;">${first.count > 0 ? first.count + ' bidrag' : ''}</div>
                        <div style="height: 20px;"></div>
                        <div style="background-color: #BDED62; height: 100px; border-top-left-radius: 4px; border-top-right-radius: 4px;"></div>
                    </td>
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
            const contributedThisMonth = contributions.some(c =>
                c.employee_id == emp.id &&
                c.status === 'Published' &&
                c.date.startsWith(currentMonthString)
            );
            if (!contributedThisMonth) return false;

            const userDates = contributions
                .filter(c => c.employee_id == emp.id && c.status === 'Published')
                .map(c => new Date(c.date))
                .sort((a, b) => b.getTime() - a.getTime());

            const startOfThisMonth = new Date(currentYear, currentMonth, 1);
            const lastPreviousDate = userDates.find(d => d < startOfThisMonth);

            if (!lastPreviousDate) return false;

            const diffMonths = (startOfThisMonth.getFullYear() - lastPreviousDate.getFullYear()) * 12 +
                (startOfThisMonth.getMonth() - lastPreviousDate.getMonth());

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
            ? [targetEmail as string]
            : ['emma@m51.no', 'jonathan@m51.no'];

        const sendPromises = recipients.map(email =>
            sendEmail(
                email,
                `Status nettsideinnhold: ${capitalizedMonth}`,
                htmlContent,
                { noCc: true } // Emma does not want to be on CC for team status
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

import { NextResponse, NextRequest } from 'next/server';
import { Resend } from 'resend';
import { employees } from '../../../data/employees';
import { calculateStreak } from '../../../utils/stats';
import { isFirstTuesdayOfMonth } from '../../../utils/date';
import { sql } from '@vercel/postgres';

// Initialize Resend with the API key safely
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const force = searchParams.get('force') === 'true';

        // Date Logic
        const now = new Date();
        const isScheduledTuesday = isFirstTuesdayOfMonth(now);

        // Allow if forced, or if it's a scheduled Tuesday
        // Also check if we are in testing mode (force=true bypasses this)
        if (!force && !isScheduledTuesday) {
            return NextResponse.json({ message: 'Skipped: Not scheduled time' });
        }

        if (!resend) {
            console.warn('RESEND_API_KEY missing, skipping email send');
            return NextResponse.json({ message: 'Skipped: No API Key' });
        }

        // 1. Get Emma's data
        const emma = employees.find(e => e.email === 'emma@m51.no');
        if (!emma) {
            throw new Error('Emma not found in database');
        }

        // 2. Get her stats from Database
        const { rows: contributions } = await sql`SELECT * FROM contributions`;
        // Mapping from snake_case DB columns to camelCase expected by logic if needed, 
        // OR adjust logic. DB columns: employee_id.
        // Let's map it for now to match logic.
        const mappedContributions = contributions.map((c: any) => ({
            ...c,
            employeeId: c.employee_id
        }));

        const emmaContributions = mappedContributions.filter((c: any) => c.employeeId === emma.id);

        // Use 2026 as current year based on mock data
        const currentYear = 2026;

        // Calculate Yearly Contributions (Personal) using string matching for consistency
        const yearlyCount = emmaContributions.filter((c: any) =>
            c.status === 'Published' &&
            c.date.startsWith(currentYear.toString())
        ).length;

        const streak = calculateStreak(emmaContributions);

        // 3. Construct Email Content
        const streakMessage = streak > 0
            ? `<p>Du har en streak på <strong>${streak} måneder</strong>! 🔥 Du vil vel ikke miste den? 😉</p>`
            : `<p>Du har en streak på 0 måneder. Eller du har ikke gjort så mye, kanskje på tide? 🚀</p>`;

        const monthName = now.toLocaleString('nb-NO', { month: 'long' });
        const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'emma@m51.no',
            subject: `Din status for ${capitalizedMonth} 📊`,
            html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff3b3f;">Hei fine deg👋</h2>
          
          <p>Nå er det på tide å skrive et bidrag til nettsiden.</p>
          
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;">Du har skrevet <strong>${yearlyCount}</strong> bidrag i år. ✍️</p>
            ${streakMessage}
          </div>

          <p>Logg inn på <a href="https://m51-content-dashboard.vercel.app" style="color: #ff3b3f; text-decoration: none; font-weight: bold;">Content Tracker</a> for å registrere status.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">Dette er en automatisert påminnelse.</p>
        </div>
      `,
        });

        if (error) {
            console.error('Error sending email:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            message: 'Email sent successfully',
            data,
            debug: {
                to: 'emma@m51.no',
                subject: `Din status for ${capitalizedMonth} 📊`,
                monthName: monthName
            }
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

import { NextResponse, NextRequest } from 'next/server';
import { employees } from '../../../data/employees';
import { calculateStreak } from '../../../utils/stats';
import { isFirstTuesdayOfMonth } from '../../../utils/date';
import { sql } from '@vercel/postgres';
import { sendEmail } from '../../../utils/email';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';
    const targetEmail = searchParams.get('email'); // Allow null for bulk send

    // Date Logic
    const now = new Date();
    const isScheduledTuesday = isFirstTuesdayOfMonth(now);

    // Allow if forced, or if it's a scheduled Tuesday
    if (!force && !isScheduledTuesday) {
      return NextResponse.json({ message: 'Skipped: Not scheduled time' });
    }
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('Email credentials missing, skipping reminder');
      return NextResponse.json({ message: 'Skipped: No Email Credentials' });
    }

    // 1. Determine Recipients
    // If specific email is requested via param, use that.
    // Otherwise, use the "Test Group" (Emma & Jonathan).
    // Later this can be changed to "all employees".
    let targetEmployees = [];

    if (targetEmail) {
      const emp = employees.find(e => e.email === targetEmail);
      if (emp) targetEmployees.push(emp);
    } else {
      // TEST MODE: Only Emma and Jonathan
      targetEmployees = employees.filter(e =>
        ['emma@m51.no', 'jonathan@m51.no'].includes(e.email)
      );
    }

    if (targetEmployees.length === 0) {
      return NextResponse.json({ message: 'No recipients found' });
    }

    // 2. Get stats from Database (once for all)
    const { rows: contributions } = await sql`SELECT * FROM contributions`;
    // Map to camelCase
    const allContributions = contributions.map((c: any) => ({
      ...c,
      employeeId: c.employee_id
    }));

    const currentYear = 2026;
    const monthName = now.toLocaleString('nb-NO', { month: 'long' });

    // 3. Loop and Send
    const results = [];

    for (const employee of targetEmployees) {
      const employeeContributions = allContributions.filter((c: any) => c.employeeId === employee.id);

      const yearlyCount = employeeContributions.filter((c: any) =>
        c.status === 'Published' &&
        c.date.startsWith(currentYear.toString())
      ).length;

      const streak = calculateStreak(employeeContributions);

      let htmlContent = '';
      const subject = 'Kanskje tid for å skrive noe til nettsiden? 😝';

      if (yearlyCount > 0) {
        // Good results
        htmlContent = `
                <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #ff3b3f;">Hei ${employee.name}</h2>
                  
                  <p>Nå er det på tide å skrive et bidrag til nettsiden.</p>
                  
                  <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;">Du har skrevet <strong>${yearlyCount}</strong> bidrag i år. Veldig bra jobba! 👏</p>
                    <p>Du har en streak på <strong>${streak} måneder</strong>. Du vil vel ikke miste den? 😉</p>
                  </div>
        
                  <p>Logg inn på <a href="https://m51-content-dashboard.vercel.app" style="color: #ff3b3f; text-decoration: none; font-weight: bold;">Content Tracker</a> for å registrere status.</p>
                </div>
              `;
      } else {
        // Bad results
        htmlContent = `
                <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #ff3b3f;">Hei ${employee.name}</h2>
                  
                  <p>Nå er det på tide å skrive et bidrag til nettsiden.</p>
                  
                  <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;">Du har skrevet <strong>0</strong> bidrag i år. Kanskje på tide å gjøre noe med det?</p>
                    <p>Du har en streak på <strong>0 måneder</strong>.</p>
                  </div>
        
                  <p>Logg inn på <a href="https://m51-content-dashboard.vercel.app" style="color: #ff3b3f; text-decoration: none; font-weight: bold;">Content Tracker</a> for å registrere status.</p>
                </div>
              `;
      }

      const { data, error } = await sendEmail(employee.email, subject, htmlContent);
      results.push({ email: employee.email, success: !error, error });
    }

    return NextResponse.json({
      message: 'Reminder process completed',
      results
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

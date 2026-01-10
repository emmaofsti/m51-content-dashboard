import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
    try {
        const client_email = process.env.GOOGLE_CLIENT_EMAIL;
        const private_key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'); // Handle newlines in env var

        if (!client_email || !private_key) {
            console.warn('Missing Google Credentials');
            // Return empty data structure so frontend doesn't crash during setup
            return NextResponse.json({
                clicks: 0,
                impressions: 0,
                ctr: 0,
                position: 0,
                topQueries: []
            });
        }

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email,
                private_key,
            },
            scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
        });

        const searchConsole = google.searchconsole({ version: 'v1', auth });

        // Calculate date range (Last 28 days)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 30); // 30 days ago

        const formattedEndDate = endDate.toISOString().split('T')[0];
        const formattedStartDate = startDate.toISOString().split('T')[0];

        // Fetch Totals
        const responseCallback = await searchConsole.searchanalytics.query({
            siteUrl: 'https://m51.no/', // Updated to match user's GSC property
            requestBody: {
                startDate: formattedStartDate,
                endDate: formattedEndDate,
                dimensions: ['date'],
                rowLimit: 1000
            }
        });

        const rows = responseCallback.data.rows || [];

        let totalClicks = 0;
        let totalImpressions = 0;
        let weightedPosition = 0;
        let weightedCtr = 0;

        rows.forEach(row => {
            totalClicks += row.clicks || 0;
            totalImpressions += row.impressions || 0;
            weightedPosition += (row.position || 0) * (row.impressions || 0);
            weightedCtr += (row.ctr || 0) * (row.impressions || 0);
        });

        const avgPosition = totalImpressions > 0 ? weightedPosition / totalImpressions : 0;
        const avgCtr = totalImpressions > 0 ? weightedCtr / totalImpressions : 0;

        // Fetch Top Queries
        const queryResponse = await searchConsole.searchanalytics.query({
            siteUrl: 'https://m51.no/',
            requestBody: {
                startDate: formattedStartDate,
                endDate: formattedEndDate,
                dimensions: ['query'],
                rowLimit: 5
            }
        });

        const topQueries = (queryResponse.data.rows || []).map(row => ({
            query: row.keys ? row.keys[0] : 'Unknown',
            clicks: row.clicks || 0,
            impressions: row.impressions || 0
        }));

        return NextResponse.json({
            clicks: totalClicks,
            impressions: totalImpressions,
            ctr: avgCtr,
            position: avgPosition,
            topQueries
        });

    } catch (error: any) {
        console.error('SEO API Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch SEO data' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const client_email = process.env.GOOGLE_CLIENT_EMAIL;
        const private_key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'); // Handle newlines in env var

        console.log("SEO API: Checking credentials...");
        console.log("Email present:", !!client_email);
        console.log("Key present:", !!private_key);

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

        const propertyFormats = [
            'sc-domain:m51.no',
            'https://m51.no/',
            'https://www.m51.no/'
        ];

        let rows: any[] = [];
        let successUrl = '';

        for (const url of propertyFormats) {
            try {
                console.log(`SEO API: Trying property ${url}...`);
                const res = await searchConsole.searchanalytics.query({
                    siteUrl: url,
                    requestBody: {
                        startDate: formattedStartDate,
                        endDate: formattedEndDate,
                        dimensions: ['date'],
                        rowLimit: 10
                    }
                });
                if (res.data.rows && res.data.rows.length > 0) {
                    rows = res.data.rows;
                    successUrl = url;
                    console.log(`SEO API: Success with ${url}`);
                    break;
                }
            } catch (e: any) {
                console.warn(`SEO API: Failed for ${url}:`, e.message);
            }
        }

        // If no data found with date dimension, just pick the first one and try queries anyway
        if (!successUrl) {
            successUrl = propertyFormats[0];
            console.warn("SEO API: No data found in any property format. Falling back to default.");
        }

        const totalsResponse = rows.length > 0 ? { data: { rows } } : await searchConsole.searchanalytics.query({
            siteUrl: successUrl,
            requestBody: {
                startDate: formattedStartDate,
                endDate: formattedEndDate,
                dimensions: ['date'],
                rowLimit: 1000
            }
        });

        const finalRows = totalsResponse.data.rows || [];
        let totalClicks = 0;
        let totalImpressions = 0;
        let weightedPosition = 0;
        let weightedCtr = 0;

        finalRows.forEach(row => {
            totalClicks += row.clicks || 0;
            totalImpressions += row.impressions || 0;
            weightedPosition += (row.position || 0) * (row.impressions || 0);
            weightedCtr += (row.ctr || 0) * (row.impressions || 0);
        });

        const avgPosition = totalImpressions > 0 ? weightedPosition / totalImpressions : 0;
        const avgCtr = totalImpressions > 0 ? weightedCtr / totalImpressions : 0;

        // Fetch Top Queries using the successful URL
        const queryResponse = await searchConsole.searchanalytics.query({
            siteUrl: successUrl,
            requestBody: {
                startDate: formattedStartDate,
                endDate: formattedEndDate,
                dimensions: ['query'],
                rowLimit: 500
            }
        });

        const topQueries = (queryResponse.data.rows || []).map(row => ({
            query: row.keys ? row.keys[0] : 'Unknown',
            clicks: row.clicks || 0,
            impressions: row.impressions || 0,
            position: row.position || 0
        }));

        return NextResponse.json({
            clicks: totalClicks,
            impressions: totalImpressions,
            ctr: avgCtr,
            position: avgPosition,
            topQueries,
            debug: {
                siteUrl: successUrl,
                email: client_email,
                rowCount: finalRows.length,
                queryCount: topQueries.length
            }
        });

    } catch (error: any) {
        console.error('SEO API Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch SEO data' }, { status: 500 });
    }
}

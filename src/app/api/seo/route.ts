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

        // Diagnostic: List all sites this service account can see
        const siteListResponse = await searchConsole.sites.list();
        const availableSites = (siteListResponse.data.siteEntry || []).map(s => s.siteUrl);
        console.log("SEO API: Available sites:", availableSites);

        // Calculate date range (Last 30 days)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 30); // 30 days ago

        const formattedEndDate = endDate.toISOString().split('T')[0];
        const formattedStartDate = startDate.toISOString().split('T')[0];

        // Property formats to try: User's domain, but also whatever is in the available sites
        const propertyFormats = [
            'sc-domain:m51.no',
            'https://m51.no/',
            'https://www.m51.no/',
            ...availableSites.filter(s => s && !s.includes('m51.no')) // Add others just in case
        ];

        let rows: any[] = [];
        let successUrl = '';

        // Prioritize matching sites from the available list
        const matchedSite = availableSites.find(s => s?.includes('m51.no'));
        const formatsToTry = matchedSite ? [matchedSite, ...propertyFormats.filter(f => f !== matchedSite)] : propertyFormats;

        for (const url of formatsToTry) {
            if (!url) continue;
            try {
                console.log(`SEO API: Trying property ${url}...`);
                const res = await searchConsole.searchanalytics.query({
                    siteUrl: url,
                    requestBody: {
                        startDate: formattedStartDate,
                        endDate: formattedEndDate,
                        dimensions: ['date'],
                        rowLimit: 5
                    }
                });
                if (res.data.rows) {
                    rows = res.data.rows;
                    successUrl = url;
                    console.log(`SEO API: Success with ${url}`);
                    // If we have data, we stop. If we have 0 rows but success (no error), it's a valid property but empty.
                    break;
                }
            } catch (e: any) {
                console.warn(`SEO API: Failed for ${url}:`, e.message);
            }
        }

        // If no data found, fall back to the first available site or the domain default
        if (!successUrl) {
            successUrl = matchedSite || propertyFormats[0];
        }

        const totalsResponse = await searchConsole.searchanalytics.query({
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

        // Fetch Top Queries
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
                availableSites,
                rowCount: finalRows.length
            }
        });

    } catch (error: any) {
        console.error('SEO API Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch SEO data' }, { status: 500 });
    }
}

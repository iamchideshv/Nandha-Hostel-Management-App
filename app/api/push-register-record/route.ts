import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { db } from '@/lib/db';

const getGoogleSheetsClient = () => {
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return google.sheets({ version: 'v4', auth });
};

const collegeMap: { [key: string]: string } = {
    'Nandha Engineering College': 'NEC',
    'Nandha Polytechnic College': 'NPC',
    'Nandha College of Technology': 'NCT',
    'Nandha Ayurveda College': 'BAMS',
    'Nandha Medical College': 'NMC',
    'Nandha Dental College': 'NDC',
    'Nandha College of Pharmacy': 'NCP',
    'Nandha Arts & Science College': 'NASC',
    'Nandha College of Physiotherapy': 'NCPT',
    'Nandha College of Nursing': 'NCN',
    'Nandha College of Allied Health Sciences': 'NCAHS',
    'Nandha Naturopathy and Yoga Medical College': 'NNYMC'
};

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { outpass, adminName } = body;

        if (!outpass || !adminName) {
            return NextResponse.json({ error: 'Outpass data and admin name required' }, { status: 400 });
        }

        const SPREADSHEET_ID = '1ibukV7nGbO8B6WBxVVdOzB5Cv9bfqKQhRDDzPsWYUa0';
        const sheets = getGoogleSheetsClient();

        // Get sheet name (Jan-2026 format)
        const date = new Date();
        const sheetTitle = `${date.toLocaleString('en-US', { month: 'short' })}-${date.getFullYear()}`;

        // Ensure current month sheet exists
        try {
            const { data } = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
            const existingSheets = data.sheets || [];
            const sheetExists = existingSheets.some((s: any) => s.properties.title === sheetTitle);

            if (!sheetExists) {
                await sheets.spreadsheets.batchUpdate({
                    spreadsheetId: SPREADSHEET_ID,
                    requestBody: {
                        requests: [{
                            addSheet: {
                                properties: {
                                    title: sheetTitle
                                }
                            }
                        }]
                    }
                });

                // Add header if new sheet
                await sheets.spreadsheets.values.append({
                    spreadsheetId: SPREADSHEET_ID,
                    range: `${sheetTitle}!A1:H1`,
                    valueInputOption: 'RAW',
                    requestBody: {
                        values: [[
                            'Sno', 'Date', 'Room Number', 'College name',
                            'Year&Dept', 'Out Time', 'In Time', 'Approved By'
                        ]]
                    }
                });
            }
        } catch (error) {
            console.error('Error checking/creating sheet:', error);
            // Non-critical error if sheet already has header but check failed
        }

        // Get the next Sno
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetTitle}!A:A`,
        });
        const sno = (response.data.values?.length || 0);

        // Map college name to short form
        const collegeShort = collegeMap[outpass.collegeName] || outpass.collegeName;

        // Prepare row data
        const row = [
            sno,
            outpass.fromDate || outpass.createdAt.split('T')[0],
            outpass.roomNumber,
            collegeShort,
            outpass.yearAndDept,
            outpass.outTime || 'N/A',
            outpass.inTime || 'N/A',
            adminName
        ];

        // Append to sheet
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetTitle}!A:H`,
            valueInputOption: 'RAW',
            requestBody: {
                values: [row]
            }
        });

        // Update local database
        await db.updateOutpass(outpass.id, {
            pushedToSheet: true,
            pushedBy: adminName
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Push Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to push record' }, { status: 500 });
    }
}

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

const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { entry, adminName } = body;

        if (!entry || !adminName) {
            return NextResponse.json({ error: 'Entry data and admin name required' }, { status: 400 });
        }

        // Sheet IDs for Boys (NRI) and Girls (AKSHAYA)
        const BOYS_SICK_SHEET_ID = '1juK0cw8OIMyFECYwOexkvkCBdn1NBQTrY-4YDWgS-nk';
        const GIRLS_SICK_SHEET_ID = '1LIVmp3dUkHUy-gMvuFatrRMgvPX4qBXj2EProRMGMZE';

        const isBoysHostel = entry.hostelName && entry.hostelName.toLowerCase().includes('nri');
        const SPREADSHEET_ID = isBoysHostel ? BOYS_SICK_SHEET_ID : GIRLS_SICK_SHEET_ID;

        const sheets = getGoogleSheetsClient();

        // Get sheet name (Jan-2026 format)
        const date = new Date();
        const sheetTitle = `Sick-${date.toLocaleString('en-US', { month: 'short' })}-${date.getFullYear()}`;

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
                const headerRow = [
                    'S.No', 'Date', 'Name', 'Hostel', 'Room', 'College', 'Reason', 'Cared By'
                ];

                await sheets.spreadsheets.values.append({
                    spreadsheetId: SPREADSHEET_ID,
                    range: `${sheetTitle}!A1`,
                    valueInputOption: 'RAW',
                    requestBody: {
                        values: [headerRow]
                    }
                });
            }
        } catch (error) {
            console.error('Error checking/creating sheet:', error);
        }

        // Get the next S.No
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetTitle}!A:A`,
        });
        const sno = (response.data.values?.length || 0);

        // Map college name to short form
        const collegeShort = collegeMap[entry.collegeName] || entry.collegeName;

        // Prepare row data
        const row = [
            sno, // S.No
            formatDate(entry.date), // Date (dd/mm/yyyy)
            entry.studentName, // Name
            entry.hostelName, // Hostel
            entry.roomNumber, // Room
            collegeShort, // College
            entry.reason, // Reason
            entry.caredBy || adminName // Cared By
        ];

        // Append to sheet
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetTitle}!A:A`,
            valueInputOption: 'RAW',
            requestBody: {
                values: [row]
            }
        });

        // Update local database
        await db.updateSickRegister(entry.id, {
            pushedToSheet: true,
            pushedAt: new Date().toISOString(),
            status: 'pushed'
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Push Error:', error);

        let errorMessage = error.message || 'Failed to push record';

        if (error.code === 403) {
            errorMessage = 'Permission denied. Check if the service account has edit access to the sheet.';
        } else if (error.code === 404) {
            errorMessage = 'Spreadsheet not found. Please check the Sheet ID.';
        } else if (error.code === 400) {
            errorMessage = `Bad Request: ${error.message}`;
        }

        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/formatters';
import { Complaint } from '@/lib/types';

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
        const { complaint, adminName }: { complaint: Complaint; adminName: string } = body;

        if (!complaint || !adminName) {
            return NextResponse.json({ error: 'Complaint data and admin name required' }, { status: 400 });
        }

        const BOYS_SHEET_ID = '1jNomFfmrPaYkzNnTj59Jz3qNBuk7Jc3rewqStczE6js';
        const GIRLS_SHEET_ID = '1EH3gEaA7R7Zhq7rWSS3l4ZfSDLzR27DPIEujDyPGuLk';

        const isBoysHostel = complaint.hostelName && complaint.hostelName.toLowerCase().includes('nri');
        const SPREADSHEET_ID = isBoysHostel ? BOYS_SHEET_ID : GIRLS_SHEET_ID;

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
                const headerRow = [
                    'Sno', 'Date', 'Name', 'Hostel Name', 'Room No',
                    'College Name', 'Issue Type', 'Description', 'Progress(Resolved or In-Process)', 'Complaint ID'
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

        // Map college name to short form
        const collegeShort = collegeMap[complaint.collegeName] || complaint.collegeName;
        const progress = complaint.status === 'resolved' ? 'Resolved' : 'In-Process';

        // Check if complaint ID already exists in the sheet
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetTitle}!J:J`,
        });
        const ids = response.data.values || [];
        const rowIndex = ids.findIndex(row => row[0] === complaint.id);

        if (rowIndex !== -1) {
            // Update existing row (specifically the progress column which is I, index 8)
            const range = `${sheetTitle}!I${rowIndex + 1}`;
            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: range,
                valueInputOption: 'RAW',
                requestBody: {
                    values: [[progress]]
                }
            });
        } else {
            // Get the next Sno
            const snoResponse = await sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: `${sheetTitle}!A:A`,
            });
            const sno = (snoResponse.data.values?.length || 0);

            // Prepare row data
            // Sno, Date, Name, Hostel Name, Room No, College Name, Issuse Type, Description, Progress, ID
            const row = [
                sno,
                formatDate(complaint.createdAt.split('T')[0]),
                complaint.studentName,
                complaint.hostelName || 'N/A',
                complaint.roomNumber,
                collegeShort,
                complaint.type,
                complaint.description,
                progress,
                complaint.id
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
        }

        // Update local database to mark as pushed
        await db.updateComplaint(complaint.id, {
            pushedToSheet: true
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Push Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to push record' }, { status: 500 });
    }
}

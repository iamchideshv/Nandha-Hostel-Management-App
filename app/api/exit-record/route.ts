import { NextResponse } from 'next/server';
import { google } from 'googleapis';

// Initialize Google Sheets API
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

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { collegeName, hostelName, roomNumber, fromDate, toDate, reason, studentName, outpassId, scanType } = body;

        if (!SPREADSHEET_ID) {
            return NextResponse.json({ error: 'Spreadsheet ID not configured' }, { status: 500 });
        }

        const sheets = getGoogleSheetsClient();

        if (scanType === 'EXIT') {
            // Get current row count to determine S.No
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: 'Sheet1!A:A', // Get all rows in column A to count
            });

            const rowCount = response.data.values?.length || 0;
            const sno = rowCount; // This will be the next S.No (header is row 1, so rowCount is correct)

            // If this is the first data row, add headers
            if (rowCount === 0) {
                await sheets.spreadsheets.values.append({
                    spreadsheetId: SPREADSHEET_ID,
                    range: 'Sheet1!A1',
                    valueInputOption: 'RAW',
                    requestBody: {
                        values: [[
                            'S.No', 'Outpass ID', 'Student Name', 'Hostel Name',
                            'College Name', 'Room No', 'From Date', 'To Date',
                            'Reason', 'Out Time', 'In Time'
                        ]]
                    }
                });
            }

            // Append new EXIT record
            const newRow = [
                sno,
                outpassId,
                studentName,
                hostelName || 'N/A',
                collegeName || 'Nandha College of Technology',
                roomNumber,
                fromDate,
                toDate,
                reason,
                new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
                '' // In Time (empty for now)
            ];

            await sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: 'Sheet1!A:K',
                valueInputOption: 'RAW',
                requestBody: {
                    values: [newRow]
                }
            });

            return NextResponse.json({ success: true, message: 'EXIT record logged to Google Sheets' });

        } else if (scanType === 'ENTRY') {
            // Get all rows to find matching Outpass ID
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: 'Sheet1!A:K',
            });

            const rows = response.data.values || [];
            let foundRowIndex = -1;

            // Search from bottom up for the latest matching Outpass ID with no In Time
            for (let i = rows.length - 1; i > 0; i--) { // Start from 1 to skip header
                const row = rows[i];
                // Column B (index 1) is Outpass ID, Column K (index 10) is In Time
                if (row[1] === outpassId && !row[10]) {
                    foundRowIndex = i;
                    break;
                }
            }

            if (foundRowIndex === -1) {
                return NextResponse.json({
                    error: 'No matching "Exit" record found for this scan. Did they scan out?'
                }, { status: 400 });
            }

            // Update the In Time column (K) for the found row
            const updateRange = `Sheet1!K${foundRowIndex + 1}`; // +1 because sheets are 1-indexed
            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: updateRange,
                valueInputOption: 'RAW',
                requestBody: {
                    values: [[new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })]]
                }
            });

            return NextResponse.json({ success: true, message: 'ENTRY time updated in Google Sheets' });
        }

        return NextResponse.json({ error: 'Invalid scan type' }, { status: 400 });

    } catch (e: any) {
        console.error("Google Sheets API Error:", e);
        return NextResponse.json({
            error: e.message || 'Failed to update Google Sheets',
            details: e.response?.data || e.toString()
        }, { status: 500 });
    }
}

// Optional: Keep GET endpoint for backward compatibility or remove if not needed
export async function GET(req: Request) {
    return NextResponse.json({
        message: 'Data is now stored in Google Sheets. Please access the sheet directly.',
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`
    });
}

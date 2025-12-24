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

const getSheetName = () => {
    const date = new Date();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${month}-${year}`;
};

async function ensureSheetExists(sheets: any, spreadsheetId: string, sheetTitle: string) {
    try {
        const { data } = await sheets.spreadsheets.get({ spreadsheetId });
        const existingSheets = data.sheets || [];

        const targetSheet = existingSheets.find((s: any) => s.properties.title === sheetTitle);
        if (targetSheet) return; // Sheet already exists

        const sheet1 = existingSheets.find((s: any) => s.properties.title === 'Sheet1');

        if (sheet1) {
            // Rename Sheet1 to current month
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId,
                requestBody: {
                    requests: [{
                        updateSheetProperties: {
                            properties: {
                                sheetId: sheet1.properties.sheetId,
                                title: sheetTitle
                            },
                            fields: 'title'
                        }
                    }]
                }
            });
        } else {
            // Create new sheet
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId,
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
        }
    } catch (error) {
        console.error('Error ensuring sheet exists:', error);
        throw error;
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { collegeName, hostelName, roomNumber, fromDate, toDate, reason, studentName, outpassId, scanType, pwsId } = body;

        // Configuration for different hostels
        const BOYS_HOSTELS = ['nri-1', 'nri-2', 'nri-3', 'nri-4'];
        const GIRLS_HOSTELS = ['akshaya', 'akshaya-1', 'akshaya-2', 'akshaya-3', 'akshaya-4', 'akshaya1', 'akshaya2', 'akshaya3', 'akshaya4'];

        // Determine correct Spreadsheet ID
        let targetSpreadsheetId = process.env.GOOGLE_SHEETS_BOYS_SPREADSHEET_ID || process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

        // Basic normalization for matching (remove spaces, lowercase)
        const normalizedHostel = hostelName?.toLowerCase().replace(/\s+/g, '') || '';

        console.log(`[EXIT-RECORD] Raw Hostel: "${hostelName}", Normalized: "${normalizedHostel}"`);

        // If it's a girls hostel, use the girls spreadsheet
        if (GIRLS_HOSTELS.some(h => normalizedHostel.includes(h.replace(/\s+/g, '')))) {
            targetSpreadsheetId = '1fZpDraz__Bb--8rX5NktVQSJ6Y9fLiDoZ27YhHr1vr0';
            console.log(`[EXIT-RECORD] Routing to GIRLS sheet: ${targetSpreadsheetId}`);
        } else {
            console.log(`[EXIT-RECORD] Routing to BOYS sheet: ${targetSpreadsheetId}`);
        }

        if (!targetSpreadsheetId) {
            return NextResponse.json({ error: 'Spreadsheet ID not configured' }, { status: 500 });
        }

        const sheets = getGoogleSheetsClient();
        const currentSheetName = getSheetName();

        // Ensure the correct sheet exists before writing
        await ensureSheetExists(sheets, targetSpreadsheetId, currentSheetName);

        if (scanType === 'EXIT') {
            // Get current row count to determine S.No
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: targetSpreadsheetId,
                range: `${currentSheetName}!A:A`, // Get all rows in column A to count
            });

            const rowCount = response.data.values?.length || 0;
            const sno = rowCount; // This will be the next S.No

            // If this is the first data row, add headers
            if (rowCount === 0) {
                await sheets.spreadsheets.values.append({
                    spreadsheetId: targetSpreadsheetId,
                    range: `${currentSheetName}!A1`,
                    valueInputOption: 'RAW',
                    requestBody: {
                        values: [[
                            'S.No', 'Outpass ID', 'Student Name', 'Hostel Name',
                            'College Name', 'Room No', 'From Date', 'To Date',
                            'Reason', 'Out Time', 'In Time', 'PWS ID'
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
                '', // In Time (empty for now)
                pwsId || 'N/A'
            ];

            await sheets.spreadsheets.values.append({
                spreadsheetId: targetSpreadsheetId,
                range: `${currentSheetName}!A:L`,
                valueInputOption: 'RAW',
                requestBody: {
                    values: [newRow]
                }
            });

            return NextResponse.json({ success: true, message: `EXIT record logged to ${targetSpreadsheetId === '1fZpDraz__Bb--8rX5NktVQSJ6Y9fLiDoZ27YhHr1vr0' ? 'Girls' : 'Boys'} Spreadsheet` });

        } else if (scanType === 'ENTRY') {
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: targetSpreadsheetId,
                range: `${currentSheetName}!A:L`,
            });

            const rows = response.data.values || [];
            let foundRowIndex = -1;

            // Search from bottom up for the latest matching Outpass ID with no In Time
            for (let i = rows.length - 1; i > 0; i--) {
                const row = rows[i];
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

            // Update the In Time column (K)
            const updateRange = `${currentSheetName}!K${foundRowIndex + 1}`;
            await sheets.spreadsheets.values.update({
                spreadsheetId: targetSpreadsheetId,
                range: updateRange,
                valueInputOption: 'RAW',
                requestBody: {
                    values: [[new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })]]
                }
            });

            return NextResponse.json({ success: true, message: `ENTRY time updated in ${targetSpreadsheetId === '1fZpDraz__Bb--8rX5NktVQSJ6Y9fLiDoZ27YhHr1vr0' ? 'Girls' : 'Boys'} Spreadsheet` });
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

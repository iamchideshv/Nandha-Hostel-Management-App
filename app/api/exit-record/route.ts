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
        if (targetSheet) return;

        const sheet1 = existingSheets.find((s: any) => s.properties.title === 'Sheet1');

        if (sheet1) {
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
        const { collegeName, hostelName, roomNumber, fromDate, toDate, reason, studentName, outpassId, scanType, pwsId, yearAndDept } = body;

        // Specific Spreadsheet IDs provided by user
        const BOYS_SHEET_ID = '1AkuIj3I7BXB7k7gdp01aVjSET1M___j2cKesFo-7am4';
        const GIRLS_SHEET_ID = '1fZpDraz__Bb--8rX5NktVQSJ6Y9fLiDoZ27YhHr1vr0';

        // Configuration for different hostels
        const GIRLS_HOSTELS = ['akshaya', 'akshaya-1', 'akshaya-2', 'akshaya-3', 'akshaya-4', 'akshaya1', 'akshaya2', 'akshaya3', 'akshaya4'];

        // Determine correct Spreadsheet ID
        let targetSpreadsheetId = BOYS_SHEET_ID;
        const normalizedHostel = hostelName?.toLowerCase().replace(/\s+/g, '') || '';

        if (GIRLS_HOSTELS.some(h => normalizedHostel.includes(h.replace(/\s+/g, '')))) {
            targetSpreadsheetId = GIRLS_SHEET_ID;
        }

        const sheets = getGoogleSheetsClient();
        const currentSheetName = getSheetName();

        await ensureSheetExists(sheets, targetSpreadsheetId, currentSheetName);

        if (scanType === 'EXIT') {
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: targetSpreadsheetId,
                range: `${currentSheetName}!A:A`,
            });

            const rowCount = response.data.values?.length || 0;
            const sno = rowCount;

            if (rowCount === 0) {
                await sheets.spreadsheets.values.append({
                    spreadsheetId: targetSpreadsheetId,
                    range: `${currentSheetName}!A1`,
                    valueInputOption: 'RAW',
                    requestBody: {
                        values: [[
                            'S.No', 'Outpass ID', 'Student Name', 'Hostel Name',
                            'College Name', 'Year & Dept', 'Room No', 'From Date',
                            'To Date', 'Reason', 'Out Time', 'In Time', 'PWS ID'
                        ]]
                    }
                });
            }

            // Mapping: A:SNo, B:ID, C:Name, D:Hostel, E:College, F:Year&Dept, G:RoomNo, H:From, I:To, J:Reason, K:OutTime, L:InTime, M:PWSID
            const newRow = [
                sno,
                outpassId,
                studentName,
                hostelName || 'N/A',
                collegeName || 'NEI SMART HOSTEL',
                yearAndDept || 'N/A',
                roomNumber || 'N/A',
                fromDate,
                toDate,
                reason,
                new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
                '', // In Time (Column L / Index 11)
                pwsId || 'N/A'
            ];

            await sheets.spreadsheets.values.append({
                spreadsheetId: targetSpreadsheetId,
                range: `${currentSheetName}!A:M`,
                valueInputOption: 'RAW',
                requestBody: {
                    values: [newRow]
                }
            });

            return NextResponse.json({ success: true, message: `EXIT record logged to ${targetSpreadsheetId === GIRLS_SHEET_ID ? 'Girls' : 'Boys'} Sheet` });

        } else if (scanType === 'ENTRY') {
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: targetSpreadsheetId,
                range: `${currentSheetName}!A:M`,
            });

            const rows = response.data.values || [];
            let foundRowIndex = -1;

            for (let i = rows.length - 1; i > 0; i--) {
                const row = rows[i];
                if (row[1] === outpassId && !row[11]) {
                    foundRowIndex = i;
                    break;
                }
            }

            if (foundRowIndex === -1) {
                return NextResponse.json({ error: 'No matching "Exit" record found.' }, { status: 400 });
            }

            const updateRange = `${currentSheetName}!L${foundRowIndex + 1}`;
            await sheets.spreadsheets.values.update({
                spreadsheetId: targetSpreadsheetId,
                range: updateRange,
                valueInputOption: 'RAW',
                requestBody: {
                    values: [[new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })]]
                }
            });

            return NextResponse.json({ success: true, message: `ENTRY time updated in ${targetSpreadsheetId === GIRLS_SHEET_ID ? 'Girls' : 'Boys'} Sheet` });
        }

        return NextResponse.json({ error: 'Invalid scan type' }, { status: 400 });

    } catch (e: any) {
        console.error("Internal Server Error:", e);
        return NextResponse.json({ error: e.message || 'Server Error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    return NextResponse.json({
        message: 'Google Sheets Routing API Active',
        boys: '1AkuIj3I7BXB7k7gdp01aVjSET1M___j2cKesFo-7am4',
        girls: '1fZpDraz__Bb--8rX5NktVQSJ6Y9fLiDoZ27YhHr1vr0'
    });
}

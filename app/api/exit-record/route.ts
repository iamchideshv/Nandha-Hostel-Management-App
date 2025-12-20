import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

export async function GET(req: Request) {
    try {
        const filePath = path.join(process.cwd(), 'data', 'exit_records.xlsx');

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: 'No records found' }, { status: 404 });
        }

        const fileBuffer = fs.readFileSync(filePath);

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename=exit_records.xlsx'
            }
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { collegeName, hostelName, roomNumber, fromDate, toDate, reason, studentName, outpassId, scanType } = body;

        const dirPath = path.join(process.cwd(), 'data');
        const filePath = path.join(dirPath, 'exit_records.xlsx');

        // Ensure data directory exists
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        const workbook = new ExcelJS.Workbook();
        let worksheet: ExcelJS.Worksheet;

        if (fs.existsSync(filePath)) {
            await workbook.xlsx.readFile(filePath);
            worksheet = workbook.getWorksheet(1) || workbook.addWorksheet('Exit Records');
        } else {
            worksheet = workbook.addWorksheet('Exit Records');
            // Add headers with some basic bold formatting for the first time
            const headerRow = worksheet.addRow([
                'S.No', 'Outpass ID', 'Student Name', 'Hostel Name',
                'College Name', 'Room No', 'From Date', 'To Date',
                'Reason', 'Out Time', 'In Time'
            ]);
            headerRow.font = { bold: true };
            headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        }

        if (scanType === 'EXIT') {
            // Find next S.No by counting rows (excluding header)
            const sno = worksheet.actualRowCount;

            const newRowValues = [
                sno,
                outpassId,
                studentName,
                hostelName || 'N/A',
                collegeName || 'Nandha College of Technology',
                roomNumber,
                fromDate,
                toDate,
                reason,
                new Date().toLocaleString(),
                '' // In Time
            ];

            worksheet.addRow(newRowValues);
        } else if (scanType === 'ENTRY') {
            let found = false;

            // Search from bottom up for the latest matching Outpass ID with no In Time
            const rowCount = worksheet.rowCount;
            for (let i = rowCount; i > 1; i--) {
                const row = worksheet.getRow(i);
                // Column 2 is Outpass ID, Column 11 is In Time
                if (row.getCell(2).value?.toString() === outpassId && !row.getCell(11).value) {
                    row.getCell(11).value = new Date().toLocaleString();
                    row.commit();
                    found = true;
                    break;
                }
            }

            if (!found) {
                return NextResponse.json({
                    error: 'No matching "Exit" record found for this scan. Did they scan out?'
                }, { status: 400 });
            }
        }

        // Atomic Write Pattern using ExcelJS
        const tempFilePath = filePath + '.tmp';
        try {
            await workbook.xlsx.writeFile(tempFilePath);

            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
                fs.renameSync(tempFilePath, filePath);
            } catch (renameErr) {
                // If main file is locked, create a backup
                const backupPath = path.join(dirPath, `exit_records_${Date.now()}.xlsx`);
                fs.renameSync(tempFilePath, backupPath);
                return NextResponse.json({
                    success: true,
                    message: `Original file locked. Data saved to ${path.basename(backupPath)}`,
                    warning: true
                });
            }

            return NextResponse.json({ success: true, message: `Record (${scanType}) logged to Excel` });

        } catch (writeErr: any) {
            console.error("ExcelJS Write Error:", writeErr);
            return NextResponse.json({ error: `Save failed: ${writeErr.message}` }, { status: 500 });
        }

    } catch (e: any) {
        console.error("API POST Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}


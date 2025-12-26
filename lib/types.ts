export type UserRole = 'student' | 'admin' | 'authority' | 'send-off' | 'devops';

export interface User {
    id: string; // Student ID or Admin username
    password?: string;
    name: string;
    role: UserRole;
    hostelName?: string;
    email?: string;
    // Student specific fields
    roomNumber?: string;
    feesPaid?: boolean;
}

export type ComplaintType = 'food' | 'misc';
export type ComplaintStatus = 'pending' | 'in-progress' | 'resolved';

export interface Complaint {
    id: string;
    studentId: string;
    studentName: string;
    hostelName?: string;
    type: ComplaintType;
    title: string;
    description: string;
    status: ComplaintStatus;
    createdAt: string;
}

export type OutpassStatus = 'pending' | 'approved' | 'rejected' | 'exited' | 'entered' | 'expired';


export interface Outpass {
    id: string;
    studentId: string;
    // New fields
    studentName: string;
    hostelName: string;
    collegeName: string;
    roomNumber: string;
    yearAndDept: string;

    reason: string;
    fromDate: string;
    toDate: string;
    status: OutpassStatus;
    createdAt: string;
    approvedAt?: string;
}

export interface FeeStatus {
    id: string; // same as studentId usually, or unique
    studentId: string;
    studentName: string;
    hostelName?: string;
    status: 'paid' | 'unpaid' | 'partially-paid' | 'pending_request';
    amountDue?: number;
    fineAmount?: number;
    fineReason?: string;
    dueDate?: string;
    lastUpdated: string;
}

export interface MessMenu {
    id: string; // 'current' or date-based
    breakfast: string[];
    lunch: string[];
    snacks: string[];
    dinner: string[];
    lastUpdated: string;
}

export interface DBSchema {
    users: User[];
    complaints: Complaint[];
    outpasses: Outpass[];
    fees: FeeStatus[];
    messMenu?: MessMenu;

}

export interface PasswordResetRequest {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    requestDate: string;
    status: 'pending' | 'completed';
}


export interface Message {
    id: string;
    message: string;
    type: 'info' | 'urgent' | 'Mess' | 'important';
    senderId: string;
    senderName: string;
    senderRole: UserRole;
    targetHostels?: string[]; // If empty/undefined -> Generic/Admin message
    hostelName?: string; // If sent by student
    timestamp: string;
}

export interface LostFound {
    id: string;
    studentId: string;
    studentName: string;
    hostelName: string;
    roomNumber: string;
    productName: string;
    identification: string; // clues or identification
    location: string; // where and when
    timeAndDate: string;
    image?: string; // Base64 string
    images?: string[]; // Array of Base64 strings
    status: 'pending' | 'found' | 'returned' | 'not-found';
    adminMessage?: string;
    createdAt: string;
}

export interface Feedback {
    id: string;
    studentId: string;
    studentName: string;
    hostelName?: string;
    rating: number;
    message: string;
    createdAt: string;
}

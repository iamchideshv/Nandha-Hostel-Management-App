import { db as firestore } from './firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  QueryConstraint
} from 'firebase/firestore';
import { User, Complaint, Outpass, ComplaintStatus, OutpassStatus, FeeStatus } from './types';

// Collection References
const USERS_COL = 'users';
const COMPLAINTS_COL = 'complaints';
const OUTPASS_COL = 'outpasses';
const FEES_COL = 'fees';
const MESS_MENU_COL = 'messMenus';
const LOST_FOUND_COL = 'lostFound';

export const db = {
  // --- USERS ---
  getUsers: async (): Promise<User[]> => {
    const querySnapshot = await getDocs(collection(firestore, USERS_COL));
    return querySnapshot.docs.map(doc => doc.data() as User);
  },

  addUser: async (user: User): Promise<User> => {
    // Check if user exists first to prevent overwrite if needed, 
    // or just use setDoc with ID. 
    // Since ID is manual (e.g. ID string), we use setDoc
    const userRef = doc(firestore, USERS_COL, user.id);
    await setDoc(userRef, user);
    return user;
  },

  findUser: async (id: string): Promise<User | undefined> => {
    const userRef = doc(firestore, USERS_COL, id);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data() as User;
    }
    return undefined;
  },

  updateUserDetails: async (id: string, data: Partial<User>): Promise<void> => {
    const userRef = doc(firestore, USERS_COL, id);
    await updateDoc(userRef, data);
  },

  updateUserId: async (oldId: string, newId: string): Promise<void> => {
    // Check if newId already exists
    const newRef = doc(firestore, USERS_COL, newId);
    const newSnap = await getDoc(newRef);
    if (newSnap.exists()) {
      throw new Error('This ID is already taken by another user');
    }

    const oldRef = doc(firestore, USERS_COL, oldId);
    const snap = await getDoc(oldRef);
    if (snap.exists()) {
      const userData = snap.data() as User;
      userData.id = newId;
      await setDoc(newRef, userData);
      await deleteDoc(oldRef);
    }
  },

  deleteUser: async (id: string): Promise<void> => {
    const userRef = doc(firestore, USERS_COL, id);
    await deleteDoc(userRef);
  },

  // --- COMPLAINTS ---
  getComplaints: async (studentId?: string, hostelName?: string): Promise<Complaint[]> => {
    let q = query(collection(firestore, COMPLAINTS_COL));
    const constraints: QueryConstraint[] = [];
    if (studentId) constraints.push(where("studentId", "==", studentId));
    if (hostelName) constraints.push(where("hostelName", "==", hostelName));

    if (constraints.length > 0) {
      q = query(collection(firestore, COMPLAINTS_COL), ...constraints);
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Complaint);
  },

  addComplaint: async (complaint: Complaint): Promise<Complaint> => {
    // using setDoc because we generated a UUID in the API route, 
    // though addDoc would auto-generate one. 
    // Stick to setDoc for consistency with existing UUID logic.
    await setDoc(doc(firestore, COMPLAINTS_COL, complaint.id), complaint);
    return complaint;
  },

  updateComplaintStatus: async (id: string, status: ComplaintStatus): Promise<Complaint | null> => {
    const ref = doc(firestore, COMPLAINTS_COL, id);
    await updateDoc(ref, { status });
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as Complaint) : null;
  },

  clearComplaints: async (hostelName?: string): Promise<void> => {
    let q = query(collection(firestore, COMPLAINTS_COL));
    if (hostelName) {
      q = query(collection(firestore, COMPLAINTS_COL), where("hostelName", "==", hostelName));
    }
    const snap = await getDocs(q);
    const deletePromises = snap.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deletePromises);
  },

  // --- OUTPASSES ---
  getOutpasses: async (studentId?: string, hostelName?: string): Promise<Outpass[]> => {
    let q = query(collection(firestore, OUTPASS_COL));
    const constraints: QueryConstraint[] = [];
    if (studentId) constraints.push(where("studentId", "==", studentId));
    if (hostelName) constraints.push(where("hostelName", "==", hostelName));

    if (constraints.length > 0) {
      q = query(collection(firestore, OUTPASS_COL), ...constraints);
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Outpass);
  },

  addOutpass: async (outpass: Outpass): Promise<Outpass> => {
    await setDoc(doc(firestore, OUTPASS_COL, outpass.id), outpass);
    return outpass;
  },

  updateOutpassStatus: async (id: string, status: OutpassStatus): Promise<Outpass | null> => {
    const ref = doc(firestore, OUTPASS_COL, id);
    const updateData: any = { status };
    if (status === 'approved') {
      updateData.approvedAt = new Date().toISOString();
    }
    await updateDoc(ref, updateData);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as Outpass) : null;
  },

  clearOutpasses: async (hostelName?: string, studentId?: string): Promise<void> => {
    let q = query(collection(firestore, OUTPASS_COL));
    const constraints: QueryConstraint[] = [];
    if (hostelName) constraints.push(where("hostelName", "==", hostelName));
    if (studentId) constraints.push(where("studentId", "==", studentId));

    if (constraints.length > 0) {
      q = query(collection(firestore, OUTPASS_COL), ...constraints);
    }

    const snap = await getDocs(q);
    const deletePromises = snap.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deletePromises);
  },

  // --- FEES ---
  getFeeStatus: async (studentId: string): Promise<FeeStatus | null> => {
    const docRef = doc(firestore, FEES_COL, studentId);
    const snap = await getDoc(docRef);
    return snap.exists() ? (snap.data() as FeeStatus) : null;
  },

  getAllFeeRequests: async (): Promise<FeeStatus[]> => {
    const q = query(collection(firestore, FEES_COL), where("status", "==", "pending_request"));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as FeeStatus);
  },

  getAllFees: async (): Promise<FeeStatus[]> => {
    const snap = await getDocs(collection(firestore, FEES_COL));
    return snap.docs.map(d => d.data() as FeeStatus);
  },

  updateFeeStatus: async (data: FeeStatus): Promise<void> => {
    await setDoc(doc(firestore, FEES_COL, data.studentId), data);
  },

  clearFeeRequests: async (hostelName?: string): Promise<void> => {
    let q = query(collection(firestore, FEES_COL), where("status", "==", "pending_request"));
    if (hostelName) {
      q = query(collection(firestore, FEES_COL), where("status", "==", "pending_request"), where("hostelName", "==", hostelName));
    }
    const snap = await getDocs(q);
    // For fees, we might want to reset them to 'unpaid' or delete them? 
    // User asked for "Clear History" for "Fees Pending". Usually this means clearing requests or old logs.
    // Assuming clearing the "pending requests" back to a state or deleting if they are just requests.
    // But FeeStatus is the source of truth for fee payment. We shouldn't delete the student's fee record entirely.
    // Maybe just revert 'pending_request' to 'unpaid'? 
    // But if it's "Clear History", maybe they mean delete resolved ones?
    // Re-reading: "clear history botton for complaint registerd, outpass verification, fees pending"
    // Likely means clearing the *lists* shown in the dashboard.
    // For Outpass/Complaints, deleting the record is fine.
    // For Fee Pending, it lists students with status 'pending_request'. 
    // If we "clear" it, we probably acknowledge them or reject them. Or maybe the user implies clearing DONE items?
    // "Fees Pending" tab lists requests. Clearing them implies ignoring them or resetting.
    // Let's assume for now we remove the 'pending_request' status -> 'unpaid' (reject) or just delete strictly the REQUEST logic if it was separate.
    // But here FeeStatus IS the record.
    // Deleting the record would delete the student's fee tracking entirely. Bad.
    // So, clearing fee pending history might mean setting status back to 'unpaid' or 'paid' (if history of paid ones).
    // The tab name is "Fee Pending" (activeTab === 'fees'). Code shows it lists `fees` state.
    // Let's implement removing "pending_request" status => 'unpaid' effectively "clearing" the request.

    const updatePromises = snap.docs.map(d => updateDoc(d.ref, { status: 'unpaid' } as any));
    // Actually, if it's "Clear History", usually it means removing Completed/Old items? 
    // But the request says "fees pending". 
    // Let's implement a HARD delete for Outpass/Complaints (history), but for Fees, let's just reset the status or maybe strictly delete if the user intends to remove "notifications".
    // Given the specific request "fees pending", I'll stick to resetting them to 'unpaid' so they disappear from the "Pending" list but don't break data.
    await Promise.all(updatePromises);
  },

  // --- MESS MENU ---
  getMessMenu: async (type: string = 'current'): Promise<any | null> => {
    const docRef = doc(firestore, 'messMenu', type);
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() : null;
  },

  saveMessMenu: async (menuData: any, type: string = 'current'): Promise<void> => {
    const data = {
      ...menuData,
      id: type,
      lastUpdated: new Date().toISOString()
    };
    await setDoc(doc(firestore, 'messMenu', type), data);
  },

  // --- VENDING STATUS ---
  getVendingStatus: async (): Promise<any | null> => {
    const docRef = doc(firestore, 'vendingStatus', 'current');
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() : null;
  },

  saveVendingStatus: async (statusData: any): Promise<void> => {
    const data = {
      ...statusData,
      id: 'current',
      lastUpdated: new Date().toISOString()
    };
    await setDoc(doc(firestore, 'vendingStatus', 'current'), data);
  },

  // --- MESSAGES ---
  getMessages: async (): Promise<any[]> => {
    const snapshot = await getDocs(collection(firestore, 'messages'));
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a: any, b: any) => {
        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return timeB - timeA;
      });
  },

  addMessage: async (messageData: any): Promise<void> => {
    // Sanitize data to remove undefined values which crash Firestore
    const cleanData = Object.fromEntries(
      Object.entries(messageData).filter(([_, v]) => v !== undefined)
    );
    const data = {
      ...cleanData,
      timestamp: new Date().toISOString()
    };
    await addDoc(collection(firestore, 'messages'), data);
  },

  deleteMessagesByRole: async (role: string): Promise<void> => {
    const messagesRef = collection(firestore, 'messages');
    const q = query(messagesRef, where('senderRole', '==', role));
    const snapshot = await getDocs(q);

    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  },

  // --- PASSWORD RESET REQUESTS ---
  getPasswordResetRequests: async (): Promise<any[]> => {
    const snapshot = await getDocs(collection(firestore, 'passwordResetRequests'));
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter((req: any) => req.status === 'pending')
      .sort((a: any, b: any) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
  },

  submitPasswordResetRequest: async (requestData: any): Promise<void> => {
    const data = {
      ...requestData,
      requestDate: new Date().toISOString(),
      status: 'pending'
    };
    await addDoc(collection(firestore, 'passwordResetRequests'), data);
  },

  updateUserPassword: async (userId: string, newPassword: string): Promise<void> => {
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('id', '==', userId));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const userDoc = snapshot.docs[0];
      await updateDoc(userDoc.ref, { password: newPassword });
    }
  },

  deletePasswordResetRequest: async (requestId: string): Promise<void> => {
    await deleteDoc(doc(firestore, 'passwordResetRequests', requestId));
  },

  // --- MESS TIMINGS ---
  getMessTimings: async (type: string = 'boys'): Promise<any | null> => {
    const docRef = doc(firestore, 'messTimings', type);
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() : null;
  },

  saveMessTimings: async (timingData: any, type: string = 'boys'): Promise<void> => {
    const data = {
      ...timingData,
      id: type,
      lastUpdated: new Date().toISOString()
    };
    await setDoc(doc(firestore, 'messTimings', type), data);
  },

  // --- LOST & FOUND ---
  getLostFoundItems: async (studentId?: string, hostelName?: string): Promise<any[]> => {
    let q = query(collection(firestore, LOST_FOUND_COL));
    const constraints: QueryConstraint[] = [];
    if (studentId) constraints.push(where("studentId", "==", studentId));
    if (hostelName) constraints.push(where("hostelName", "==", hostelName));

    if (constraints.length > 0) {
      q = query(collection(firestore, LOST_FOUND_COL), ...constraints);
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  addLostFoundItem: async (item: any): Promise<void> => {
    await setDoc(doc(firestore, LOST_FOUND_COL, item.id), item);
  },

  clearLostFoundItems: async (hostelName?: string, studentId?: string): Promise<void> => {
    let q = query(collection(firestore, LOST_FOUND_COL));
    const constraints = [];
    if (hostelName) constraints.push(where("hostelName", "==", hostelName));
    if (studentId) constraints.push(where("studentId", "==", studentId));

    if (constraints.length > 0) {
      q = query(collection(firestore, LOST_FOUND_COL), ...constraints);
    }
    const snap = await getDocs(q);
    const deletePromises = snap.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deletePromises);
  },

};

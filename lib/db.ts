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
const FEEDBACK_COL = 'feedback';
const SICK_REGISTER_COL = 'sickRegister';

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
    const docs = querySnapshot.docs.map(doc => doc.data() as Complaint);

    if (studentId && !hostelName) {
      return docs.filter(c => !c.studentHidden);
    }
    return docs;
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

  updateComplaint: async (id: string, data: Partial<Complaint>): Promise<Complaint | null> => {
    const ref = doc(firestore, COMPLAINTS_COL, id);
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    );
    await updateDoc(ref, cleanData);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as Complaint) : null;
  },


  clearComplaints: async (hostelName?: string, studentId?: string): Promise<void> => {
    let q = query(collection(firestore, COMPLAINTS_COL));
    const constraints: QueryConstraint[] = [];
    if (hostelName) constraints.push(where("hostelName", "==", hostelName));
    if (studentId) constraints.push(where("studentId", "==", studentId));

    if (constraints.length > 0) {
      q = query(collection(firestore, COMPLAINTS_COL), ...constraints);
    }

    const snap = await getDocs(q);
    if (studentId && !hostelName) {
      const updatePromises = snap.docs.map(d => updateDoc(d.ref, { studentHidden: true }));
      await Promise.all(updatePromises);
    } else {
      const deletePromises = snap.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
    }
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
    const docs = querySnapshot.docs.map(doc => doc.data() as Outpass);

    // Filter out hidden records for students (if studentId provided but not hostelName, implies Student Dashboard)
    if (studentId && !hostelName) {
      return docs.filter(o => !o.studentHidden);
    }
    return docs;
  },

  addOutpass: async (outpass: Outpass): Promise<Outpass> => {
    const cleanOutpass = Object.fromEntries(
      Object.entries(outpass).filter(([_, v]) => v !== undefined)
    );
    await setDoc(doc(firestore, OUTPASS_COL, outpass.id), cleanOutpass);
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

  updateOutpass: async (id: string, data: Partial<Outpass>): Promise<Outpass | null> => {
    const ref = doc(firestore, OUTPASS_COL, id);
    // Sanitize data
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    );
    await updateDoc(ref, cleanData);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as Outpass) : null;
  },

  clearOutpasses: async (hostelName?: string, studentId?: string, type?: string, collegeName?: string): Promise<void> => {
    let q = query(collection(firestore, OUTPASS_COL));
    const constraints: QueryConstraint[] = [];
    if (hostelName) constraints.push(where("hostelName", "==", hostelName));
    if (studentId) constraints.push(where("studentId", "==", studentId));

    // For type, we handle 'outpass' specially to include legacy records (no type)
    if (type && type !== 'outpass') {
      constraints.push(where("type", "==", type));
    }

    if (collegeName) constraints.push(where("collegeName", "==", collegeName));

    if (constraints.length > 0) {
      q = query(collection(firestore, OUTPASS_COL), ...constraints);
    }

    let snap = await getDocs(q);
    let docsToDelete = snap.docs;

    // Manual filtering for 'outpass' type to include null/undefined
    if (type === 'outpass') {
      docsToDelete = docsToDelete.filter(d => {
        const data = d.data() as Outpass;
        return !data.type || data.type === 'outpass';
      });
    }

    if (studentId && !hostelName) {
      // Student clearing own history -> Soft Delete
      const updatePromises = docsToDelete.map(d => updateDoc(d.ref, { studentHidden: true }));
      await Promise.all(updatePromises);
    } else {
      // Admin clearance -> Hard Delete
      const deletePromises = docsToDelete.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
    }
  },

  deleteOutpassesByIds: async (ids: string[]): Promise<void> => {
    const deletePromises = ids.map(id => deleteDoc(doc(firestore, OUTPASS_COL, id)));
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
    let q = query(collection(firestore, FEES_COL));
    if (hostelName) {
      q = query(collection(firestore, FEES_COL), where("hostelName", "==", hostelName));
    }
    const snap = await getDocs(q);

    // Clear History usually means everything that isn't a current critical state?
    // In this app, FeeStatus is used for the list. 
    // Deleting them is the only way to clear the "history" from the admin view.
    const deletePromises = snap.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deletePromises);
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
  getMessages: async (hostelName?: string): Promise<any[]> => {
    let q = query(collection(firestore, 'messages'));
    const constraints: QueryConstraint[] = [];
    if (hostelName) constraints.push(where("hostelName", "==", hostelName));

    if (constraints.length > 0) {
      q = query(collection(firestore, 'messages'), ...constraints);
    }

    const snapshot = await getDocs(q);
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
    // Sanitize data to remove undefined values which crash Firestore
    const cleanData = Object.fromEntries(
      Object.entries(item).filter(([_, v]) => v !== undefined)
    );
    await setDoc(doc(firestore, LOST_FOUND_COL, item.id), cleanData);
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

  // --- FEEDBACK ---
  getFeedback: async (): Promise<any[]> => {
    const q = query(collection(firestore, FEEDBACK_COL));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  addFeedback: async (feedback: any): Promise<void> => {
    await setDoc(doc(firestore, FEEDBACK_COL, feedback.id), feedback);
  },

  // --- PROFILE UPDATE REQUESTS ---
  getProfileUpdateRequests: async (): Promise<any[]> => {
    const snapshot = await getDocs(collection(firestore, 'profileUpdateRequests'));
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a: any, b: any) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
  },

  addProfileUpdateRequest: async (request: any): Promise<void> => {
    await setDoc(doc(firestore, 'profileUpdateRequests', request.id), request);
  },

  deleteProfileUpdateRequest: async (id: string): Promise<void> => {
    await deleteDoc(doc(firestore, 'profileUpdateRequests', id));
  },

  // --- SICK REGISTER ---
  getSickRegisters: async (studentId?: string, hostelName?: string): Promise<any[]> => {
    let q = query(collection(firestore, SICK_REGISTER_COL));
    const constraints: QueryConstraint[] = [];
    if (studentId) constraints.push(where("studentId", "==", studentId));
    if (hostelName) constraints.push(where("hostelName", "==", hostelName));

    if (constraints.length > 0) {
      q = query(collection(firestore, SICK_REGISTER_COL), ...constraints);
    }

    const querySnapshot = await getDocs(q);
    const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));

    if (studentId && !hostelName) {
      return docs.filter(s => !s.studentHidden);
    }
    return docs.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  addSickRegister: async (entry: any): Promise<void> => {
    const cleanData = Object.fromEntries(
      Object.entries(entry).filter(([_, v]) => v !== undefined)
    );
    await setDoc(doc(firestore, SICK_REGISTER_COL, entry.id), cleanData);
  },

  updateSickRegister: async (id: string, data: any): Promise<any | null> => {
    const ref = doc(firestore, SICK_REGISTER_COL, id);
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    );
    await updateDoc(ref, cleanData);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  },

  clearSickRegisters: async (hostelName?: string, studentId?: string): Promise<void> => {
    let q = query(collection(firestore, SICK_REGISTER_COL));
    const constraints: QueryConstraint[] = [];
    if (hostelName) constraints.push(where("hostelName", "==", hostelName));
    if (studentId) constraints.push(where("studentId", "==", studentId));

    if (constraints.length > 0) {
      q = query(collection(firestore, SICK_REGISTER_COL), ...constraints);
    }

    const snap = await getDocs(q);
    if (studentId && !hostelName) {
      const updatePromises = snap.docs.map(d => updateDoc(d.ref, { studentHidden: true }));
      await Promise.all(updatePromises);
    } else {
      const deletePromises = snap.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
    }
  },
};

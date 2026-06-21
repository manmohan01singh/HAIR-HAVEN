import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut } from "firebase/auth";
import type { User } from "firebase/auth";
import { 
  initializeFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  writeBatch 
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Hair Haven Firebase Project Configuration
// Trim all env vars to prevent %0A (newline) URL-encoding bug in Firebase Auth
const firebaseConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY || '').trim(),
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '').trim(),
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID || '').trim(),
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '').trim(),
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '').trim(),
  appId: (import.meta.env.VITE_FIREBASE_APP_ID || '').trim()
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firebase Firestore with long polling for network stability
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

// Initialize Firebase Storage
export const storage = getStorage(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// ─── Admin Configuration ──────────────────────────────────────────────────
export const ADMIN_EMAILS = [
  "hairhaventransplant@gmail.com",
  "drsubykakkar@gmail.com",
  "manmohan.admin@gmail.com"
];

/**
 * Checks whether a given email is whitelisted as an administrator.
 */
export const isAdminUser = (email: string | null): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

// ─── Auth & Firestore Functions ────────────────────────────────────────

/**
 * Sign in with Google popup
 * Returns the Firebase User on success, throws on failure
 */
/**
 * Detect if we're in a popup-hostile environment (mobile, some browsers, or ad-blocked)
 * In those cases use redirect flow instead of popup
 */
const isMobileOrPopupUnsafe = (): boolean => {
  const ua = navigator.userAgent;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
};

export const signInWithGoogle = async (): Promise<User> => {
  if (isMobileOrPopupUnsafe()) {
    // Use redirect flow on mobile — getRedirectResult is called in App.tsx on mount
    await signInWithRedirect(auth, googleProvider);
    // This line won't execute on mobile (page redirects), but satisfies the type signature
    throw new Error('redirect_initiated');
  }
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

/**
 * Call this once on app mount to handle the result of a redirect sign-in
 */
export const handleRedirectSignIn = async (): Promise<User | null> => {
  try {
    const result = await getRedirectResult(auth);
    return result ? result.user : null;
  } catch {
    return null;
  }
};

/**
 * Sign out current user
 */
export const signOutUser = async (): Promise<void> => {
  await signOut(auth);
};

/**
 * Subscribe to auth state changes
 * Returns the unsubscribe function
 */
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Creates or updates a user document in Firebase Firestore
 */
export const saveUserToFirestore = async (user: User): Promise<void> => {
  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    const userData = {
      uid: user.uid,
      displayName: user.displayName || "Patient",
      email: user.email || "",
      photoURL: user.photoURL || "",
      lastLogin: serverTimestamp(),
    };

    if (!userSnap.exists()) {
      // First-time login: create new document with createdAt
      const defaultMedicalProfile = {
        stage: 3,
        primaryConcerns: "Temple recession & hairline balding",
        priorTreatments: "None",
        medicalConditions: "None",
        firstConsultationDate: new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' }),
        consultationNotes: "Seeking hair restoration for temple hair loss.",
        aiAssessment: "Patient presents Norwood Stage 3 pattern hair loss. Highly suitable candidate for FUE Hair Transplant or BioSapphire FUE technique. Recommended FUE hairline restoration with approx 1,500 grafts."
      };
      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
        medicalProfile: defaultMedicalProfile
      });
      console.log("Firestore: User document created successfully.");
    } else {
      // Returning user: update current fields and merge with existing custom fields
      await setDoc(userRef, userData, { merge: true });
      console.log("Firestore: User document merged/updated successfully.");
    }
  } catch (error) {
    console.error("Firestore Error in saveUserToFirestore:", error);
  }
};

/**
 * Loads patient data from Firestore
 */
export const getUserDoc = async (uid: string): Promise<any> => {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data();
    }
  } catch (error) {
    console.error("Firestore Error in getUserDoc:", error);
  }
  return null;
};

/**
 * Saves/updates patient medical profile in Firestore
 */
export const saveMedicalProfileToFirestore = async (uid: string, profile: any): Promise<void> => {
  try {
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, {
      medicalProfile: profile,
      lastLogin: serverTimestamp(),
    }, { merge: true });
    console.log("Firestore: Medical profile saved successfully.");
  } catch (error) {
    console.error("Firestore Error in saveMedicalProfileToFirestore:", error);
  }
};

// ─── Real-Time Gallery CRUD Functions ────────────────────────────────────

export const subscribeToGallery = (callback: (images: any[]) => void) => {
  const q = query(collection(db, "gallery"), orderBy("order", "asc"));
  return onSnapshot(q, (snapshot) => {
    const images = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(images);
  }, (error) => {
    console.error("Gallery subscription error:", error);
  });
};

export const addGalleryImage = async (url: string, caption: string, category: string, order: number) => {
  return await addDoc(collection(db, "gallery"), {
    url,
    caption,
    category,
    order,
    isActive: true,
    createdAt: serverTimestamp()
  });
};

export const updateGalleryImage = async (id: string, updates: any) => {
  const ref = doc(db, "gallery", id);
  return await updateDoc(ref, updates);
};

export const deleteGalleryImage = async (id: string) => {
  const ref = doc(db, "gallery", id);
  return await deleteDoc(ref);
};

export const reorderGalleryImages = async (images: { id: string, order: number }[]) => {
  const batch = writeBatch(db);
  images.forEach(img => {
    const ref = doc(db, "gallery", img.id);
    batch.update(ref, { order: img.order });
  });
  return await batch.commit();
};

export const uploadGalleryImage = async (file: File): Promise<string> => {
  const fileRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(fileRef, file);
  return await getDownloadURL(snapshot.ref);
};

// ─── Real-Time Bookings CRUD Functions ──────────────────────────────────

export const subscribeToBookings = (callback: (bookings: any[]) => void) => {
  const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(bookings);
  }, (error) => {
    console.error("Bookings subscription error:", error);
  });
};

export const saveBookingToFirestore = async (booking: any) => {
  return await addDoc(collection(db, "bookings"), {
    ...booking,
    createdAt: serverTimestamp(),
    status: booking.status || "Pending" // Pending, Confirmed, Cancelled, Completed
  });
};

export const updateBookingStatus = async (id: string, status: string) => {
  const ref = doc(db, "bookings", id);
  return await updateDoc(ref, { status });
};

export const deleteBooking = async (id: string) => {
  const ref = doc(db, "bookings", id);
  return await deleteDoc(ref);
};

// ─── Real-Time Reviews CRUD Functions ───────────────────────────────────

export const subscribeToReviews = (callback: (reviews: any[]) => void) => {
  const q = query(collection(db, "reviews"), orderBy("isPinned", "desc"));
  return onSnapshot(q, (snapshot) => {
    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(reviews);
  }, (error) => {
    console.error("Reviews subscription error:", error);
  });
};

export const addReview = async (review: any) => {
  return await addDoc(collection(db, "reviews"), {
    ...review,
    isPinned: review.isPinned || false,
    isVisible: review.isVisible !== false,
    createdAt: serverTimestamp()
  });
};

export const updateReview = async (id: string, updates: any) => {
  const ref = doc(db, "reviews", id);
  return await updateDoc(ref, updates);
};

export const deleteReview = async (id: string) => {
  const ref = doc(db, "reviews", id);
  return await deleteDoc(ref);
};

// ─── Real-Time Clinic Settings Functions ───────────────────────────────

export const subscribeToClinicSettings = (callback: (settings: any) => void) => {
  const ref = doc(db, "settings", "clinic");
  return onSnapshot(ref, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() });
    } else {
      // Default initial settings
      const defaultSettings = {
        announcementBanner: "🌟 Premium BioSapphire FUE Hair Restoration — Book now for up to 30% Off!",
        isAnnouncementActive: true,
        whatsappNumber: "+919876543210",
        slotsAvailable: 3,
        specialOffer: "Limited slots remaining for this week!"
      };
      setDoc(ref, defaultSettings);
      callback(defaultSettings);
    }
  }, (error) => {
    console.error("Clinic settings subscription error:", error);
  });
};

export const updateClinicSettings = async (settings: any) => {
  const ref = doc(db, "settings", "clinic");
  return await setDoc(ref, settings, { merge: true });
};

export default app;


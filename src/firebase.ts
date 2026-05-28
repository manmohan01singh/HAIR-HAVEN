import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import type { User } from "firebase/auth";
import { initializeFirestore, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

// Hair Haven Firebase Project Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCFm1ByIvUbca__K-eaGldfWszClYJ0VqU",
  authDomain: "hair-haven-5ac0c.firebaseapp.com",
  projectId: "hair-haven-5ac0c",
  storageBucket: "hair-haven-5ac0c.firebasestorage.app",
  messagingSenderId: "551517483508",
  appId: "1:551517483508:web:161385d419884s5309a1"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firebase Firestore with long polling for network stability
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// ─── Auth & Firestore Functions ────────────────────────────────────────

/**
 * Sign in with Google popup
 * Returns the Firebase User on success, throws on failure
 */
export const signInWithGoogle = async (): Promise<User> => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
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

export default app;

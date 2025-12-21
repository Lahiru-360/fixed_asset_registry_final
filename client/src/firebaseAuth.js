import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";

import { auth } from "./firebase";

// Register user in Firebase
export async function registerFirebase(email, password) {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  // Send verification email
  await sendEmailVerification(userCredential.user);

  return userCredential.user;
}

// Login user
export async function loginFirebase(email, password) {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential.user;
}

// Get Firebase Auth token (send to backend)
export async function getFirebaseToken() {
  if (!auth.currentUser) return null;
  return await auth.currentUser.getIdToken();
}

// Logout user
export function logoutFirebase() {
  return signOut(auth);
}

export async function sendPasswordReset(email) {
  return sendPasswordResetEmail(auth, email);
}

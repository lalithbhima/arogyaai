import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyDVpUnRx50fAMm0F1_7MwbkXS4_kHGiPIk",
  authDomain: "arogyaai-e8929.firebaseapp.com",
  projectId: "arogyaai-e8929",
  storageBucket: "arogyaai-e8929.appspot.com", // <-- Fix: should be .appspot.com not .storage.app
  messagingSenderId: "69671904644",
  appId: "1:69671904644:web:276be8bbc966205d10a9d1",
  measurementId: "G-ZYJPH73225"
};

// Initialize the app only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with persistence for React Native
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  // If already initialized, just get the Auth instance
  auth = getAuth(app);
}

export { app, auth };

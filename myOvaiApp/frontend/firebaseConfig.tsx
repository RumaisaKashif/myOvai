import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { initializeAuth,
  // @ts-ignore
  getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBd0gwdzNwVcICOPbZBpdnU7vh2am4FgIc",
  authDomain: "myovai.firebaseapp.com",
  projectId: "myovai",
  storageBucket: "myovai.firebasestorage.app",
  messagingSenderId: "676509692331",
  appId: "1:676509692331:web:42bd731cf1c47d8a3aa2ee",
  measurementId: "G-BE0RY62H90"
};

const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});
export const db = getFirestore(app);

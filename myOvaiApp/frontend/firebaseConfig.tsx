import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getAuth,
  initializeAuth,
  // @ts-ignore
  getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";
import { getStorage } from 'firebase/storage';

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
export const storage = getStorage(app);
export const auth =
  Platform.OS === "web"
    ? getAuth(app) // Use standard Firebase Auth for web/local host
    : initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage), // Use AsyncStorage for persistence in Expo
      });
export const db = getFirestore(app);
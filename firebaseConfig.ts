
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
  apiKey: "", // Paste your API Key here
  authDomain: "", // Paste your Auth Domain here
  projectId: "", // Paste your Project ID here
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

// Check if configuration is present to avoid errors if user hasn't set it up
const isConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey.length > 0;

// Initialize Firebase
const app = isConfigured ? initializeApp(firebaseConfig) : null;

// Initialize Firestore
export const db = isConfigured && app ? getFirestore(app) : null;

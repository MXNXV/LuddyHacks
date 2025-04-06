import { initializeApp } from "firebase/app";
// import { getFirestore } from "firebase/firestore";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";


const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};


const app = initializeApp(firebaseConfig);

const db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});
console.log("ENV projectId:", import.meta.env.VITE_FIREBASE_PROJECT_ID);

console.log("Firebase App Initialized:", app.name); 

export { db };
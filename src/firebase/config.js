import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: The user provided the project ID: albumfotosdigital-24d4b
// However, typically the full config is needed to initialize the app in the frontend.
// I will set up the skeleton. Once the user connects this to their Firebase console,
// they will need to paste the real config here.

const firebaseConfig = {
  apiKey: "AIzaSyAfLl8pxBeSYhpOlN_PPQC8Wy6LZ-JQSFw",
  authDomain: "albumfotosdigital-24d4b.firebaseapp.com",
  projectId: "albumfotosdigital-24d4b",
  storageBucket: "albumfotosdigital-24d4b.firebasestorage.app",
  messagingSenderId: "1016997483924",
  appId: "1:1016997483924:web:921d5f65a0977f244b2b81"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

// Owner email specified by the user
export const OWNER_EMAIL = "ggonzalovalderrama@gmail.com";

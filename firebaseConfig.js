import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDqqv1C8pIsbAapYJCfHDI7tiDeU1PiXSo",
  authDomain: "lessons-bcbb6.firebaseapp.com",
  projectId: "lessons-bcbb6",
  storageBucket: "lessons-bcbb6.appspot.com",
  messagingSenderId: "37663628436",
  appId: "1:37663628436:web:0bccc242c065e492c0a881",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
export const storage = getStorage(app);

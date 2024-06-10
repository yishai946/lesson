import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDqqv1C8pIsbAapYJCfHDI7tiDeU1PiXSo",
  authDomain: "lessons-bcbb6.firebaseapp.com",
  projectId: "lessons-bcbb6",
  storageBucket: "lessons-bcbb6.appspot.com",
  messagingSenderId: "37663628436",
  appId: "1:37663628436:web:0bccc242c065e492c0a881",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
let auth = null;
if (Platform.OS === "web") {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
}
export { auth };
export const storage = getStorage(app);

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getDoc, doc, setDoc, collection } from "firebase/firestore";
import { auth, storage, db } from "../firebaseConfig";

const Auth = {
  uploadImage: async (image) => {
    try {
      const response = await fetch(image);
      const blob = await response.blob();
      imagesRef = ref(storage, "images/" + blob._data.name);

      await uploadBytesResumable(imagesRef, blob);

      const url = await getDownloadURL(imagesRef);

      return url;
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  },

  login: async (user, setUser) => {
    try {
      // sign in
      await signInWithEmailAndPassword(auth, user.email, user.password);

      const docData = await Auth.getData(auth.currentUser.uid);

      // set local state
      setUser({
        hours: docData.hours,
        email: docData.email,
        phone: docData.phone,
        image: docData.image,
        id: docData.id,
        username: docData.username,
        study: docData.study,
        role: docData.role,
      });

      return userCredential.user;
    } catch (error) {
      return error;
    }
  },

  signup: async (userObj, setUser) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userObj.email,
        userObj.password
      );

      // upload profile image
      if (userObj.image != "https://tinyurl.com/2pxxfxb6") {
        res = await uploadImage(userObj.image);
        userObj = { ...userObj, image: res };
      }

      // update profile in auth
      updateProfile(auth.currentUser, {
        displayName: userObj.username,
        phoneNumber: userObj.phone,
        photoURL: userObj.image,
      });

      // set firestore doc
      const docRef = doc(db, "users", auth.currentUser.uid);

      if (userObj.role == "teacher") {
        await setDoc(docRef, {
          email: userObj.email,
          phone: userObj.phone,
          id: userObj.id,
          username: userObj.username,
          study: userObj.study,
          hours: 0,
          image: userObj.image,
          role: userObj.role,
          studentsIds: [],
        });

        // set local state
        setUser({
          hours: 0,
          studentsIds: [],
          ...userObj,
        });
      } else {
        await setDoc(docRef, {
          email: userObj.email,
          phone: userObj.phone,
          id: userObj.id,
          username: userObj.username,
          study: userObj.study,
          image: userObj.image,
          role: userObj.role,
          teachersIds: [],
        });

        // set local state
        setUser({
          teachersIds: [],
          ...userObj,
        });
      }

      return userCredential.user;
    } catch (error) {
      console.error(error);
      return error;
    }
  },

  logout: async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error(error);
    }
  },

  getData: async (uid) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      return docSnap.data();
    } catch (error) {
      console.error(error);
      return error;
    }
  },
};

export default Auth;

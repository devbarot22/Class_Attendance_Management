import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"
// import firebase from "firebase/compat/app";
// import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCy6rLk8lcinn_vps4JLcLCF-9cv2v_TkI",
  authDomain: "attendit-d286e.firebaseapp.com",
  projectId: "attendit-d286e",
  storageBucket: "attendit-d286e.appspot.com",
  messagingSenderId: "276966340029",
  appId: "1:276966340029:web:82b0496368be6c42d58ed4",
  measurementId: "G-723TTHDF3K"

};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


export { auth, app, db };
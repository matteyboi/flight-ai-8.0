import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB6rvOpkri9QNbjPKqe9rnYdO83XFGaGtM",
  authDomain: "flight-syllabus.firebaseapp.com",
  projectId: "flight-syllabus",
  storageBucket: "flight-syllabus.firebasestorage.app",
  messagingSenderId: "980847938393",
  appId: "1:980847938393:web:7c74338019270537c8da48",
  measurementId: "G-NN5C1WP195"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
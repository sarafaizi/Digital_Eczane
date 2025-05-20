// Firebase SDK'sından gerekli fonksiyonları import et
/*
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";


const firebaseConfig = {
    apiKey: "AIzaSyBDz1vY2nCcp9NM2-TXMbsG6ea33sFZRe0",
    authDomain: "eczane-38a2b.firebaseapp.com",
    projectId: "eczane-38a2b",
    storageBucket: "eczane-38a2b.firebasestorage.app",
    messagingSenderId: "471392736334",
    appId: "1:471392736334:web:36069ceed5ff7afcf91f1f",
    measurementId: "G-Y12NRWVEJ5"
};


const app = initializeApp(firebaseConfig);


const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, createUserWithEmailAndPassword, setDoc, doc };
*/


import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, updateDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBDz1vY2nCcp9NM2-TXMbsG6ea33sFZRe0",
    authDomain: "eczane-38a2b.firebaseapp.com",
    projectId: "eczane-38a2b",
    storageBucket: "eczane-38a2b.appspot.com",
    messagingSenderId: "471392736334",
    appId: "1:471392736334:web:36069ceed5ff7afcf91f1f",
    measurementId: "G-Y12NRWVEJ5"
};


const app = initializeApp(firebaseConfig);


const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage, createUserWithEmailAndPassword, setDoc, doc, updateDoc };

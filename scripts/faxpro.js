import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore, collection, doc, getDocs, addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

const FirebaseConfig = {
    apiKey: "AIzaSyCMyS_nsuyVbEfMB06TY7cfUMK2Kj5qk9Q",
    authDomain: "faxpro-42ee0.firebaseapp.com",
    projectId: "faxpro-42ee0",
    storageBucket: "faxpro-42ee0.appspot.com",
    messagingSenderId: "87164703923",
    appId: "1:87164703923:web:2ca34ac33c34852f178cc6",
    measurementId: "G-MGMVZSCFKY"
};

const App = initializeApp(FirebaseConfig);
const Db = getFirestore(App);
const FaxesCollection = collection(Db, "faxes");
const UsersCollection = collection(Db, "users");

export async function GetAllFaxes() {
    const Snapshot = await getDocs(FaxesCollection);
    return Snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function CreateFax(Title, Content, Creator) {
    const FaxRef = await addDoc(FaxesCollection, {
        title: Title,
        content: Content,
        author: Creator,
        views: 0,
        likes: 0,
        likedBy: [],
        timestamp: Math.floor(Date.now() / 1000)
    });
    return FaxRef;
}

export function GetUUID() {
    const CoreMapping = {};
    const Letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
    for (let Index = 1; Index <= 26; Index++) {
        CoreMapping[Index] = Letters[Index - 1];
    }

    return `${navigator.hardwareConcurrency}${CoreMapping[navigator.hardwareConcurrency]}${Intl.DateTimeFormat().resolvedOptions().timeZone.replace("/", "")}`.trim().toLowerCase();
}
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import * as fire from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

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
const Db = fire.getFirestore(App);

const UsersCollection = fire.collection(Db, "users");

const UsernameInput = document.getElementById("UsernameInput");
const PasswordInput = document.getElementById("PasswordInput");
const SubmitButton = document.getElementById("SubmitButton");

const UsernameLabel = document.getElementById("UsernameLabel");

var LocalId = undefined;

async function CheckUserDoc() {
    const IP = `${navigator.hardwareConcurrency}${Intl.DateTimeFormat().resolvedOptions().timeZone.replace("/", "")}`.toLowerCase();
    LocalId = IP;

    const UserDocRef = fire.doc(UsersCollection, IP);
    const DocSnapshot = await fire.getDoc(UserDocRef);

    if (!DocSnapshot.exists()) {
        if (document.title !== "Account") {
            window.location.href = "../account.html";
            return;
        }

        SubmitButton.addEventListener("click", async () => {
            const Username = UsernameInput.value.trim();
            const Password = PasswordInput.value.trim();

            if (!Username || !Password) {
                return;
            }

            await fire.setDoc(UserDocRef, {
                register: Math.floor(Date.now() / 1000),
                username: Username,
                password: Password,
                ip: IP
            });

            window.location.href = "../index.html";
        });
    } else {
        const UserData = DocSnapshot.data();
        window.username = UserData.username
        UsernameLabel.innerHTML = `@${UserData.username}`;
    }
}

document.addEventListener("DOMContentLoaded", CheckUserDoc);
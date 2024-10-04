import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import * as fire from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import * as fax from "./faxpro.js";

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

async function CheckUserDoc() {
    const IP = fax.GetUUID();

    const UserDocRef = fire.doc(UsersCollection, IP);
    const DocSnapshot = await fire.getDoc(UserDocRef);

    if (!DocSnapshot.exists()) {
        if (document.title !== "Account") {
            window.location.href = "../account.html";
            return;
        }
    }

    if (document.title === "Account") {
        SubmitButton.addEventListener("click", async () => {
            const Username = UsernameInput.value.trim();
            const Password = PasswordInput.value.trim();
    
            if (DocSnapshot.exists()) {
                if (!Username || !Password) {
                    return;
                }
    
                const UserData = DocSnapshot.data()
                if (String(PasswordInput.value) === String(UserData.password)) {
                    window.location.href = "../index.html";
                    window.username = UserData.username;
                    window.userdata = UserData;
                    window.pp = UserData.pp;
                    
                    if (UsernameLabel) {
                        UsernameLabel.innerHTML = `@${window.username}`;
                    }
                }
            } else {
                await fire.setDoc(UserDocRef, {
                    register: Math.floor(Date.now() / 1000),
                    username: Username,
                    password: Password,
                    ip: IP
                });
            }
        });
    } else {
        if (UsernameLabel) {
            const UserData = DocSnapshot.data()
            window.username = UserData.username;
            window.userdata = UserData;
            UsernameLabel.innerHTML = `@${UserData.username}`;
        }
    }
}

document.addEventListener("DOMContentLoaded", CheckUserDoc);
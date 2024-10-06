import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore, collection, doc, setDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
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
const Db = getFirestore(App);
const UsersCollection = collection(Db, "users");

const UsernameInput = document.getElementById("UsernameInput");
const PasswordInput = document.getElementById("PasswordInput");
const SubmitButton = document.getElementById("SubmitButton");
const UsernameLabel = document.getElementById("UsernameLabel");

function WaitForElement(GetElement, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const CheckElement = setInterval(() => {
            if (GetElement !== null) {
                clearInterval(CheckElement);
                resolve(GetElement);
            }
            if (Date.now() - startTime >= timeout) {
                clearInterval(CheckElement);
                reject(new Error("Element not found within timeout period"));
            }
        }, 100);
    });
}

async function CheckUserDoc() {
    if (localStorage.getItem("USER") === null) {
        if (document.title === "Account") {
            await Promise.all([
                WaitForElement(SubmitButton),
                WaitForElement(PasswordInput),
                WaitForElement(UsernameInput)
            ]);

            async function Login() {
                const Username = UsernameInput.value.trim();
                const Password = PasswordInput.value.trim();

                if (!Username || !Password) return;

                const UserQuery = query(UsersCollection, where("username", "==", Username));
                const QuerySnapshot = await getDocs(UserQuery);

                if (!QuerySnapshot.empty) {
                    const DocSnapshot = QuerySnapshot.docs[0];
                    const UserData = DocSnapshot.data();

                    if (String(Password) === String(UserData.password)) {
                        localStorage.setItem("USER", JSON.stringify(UserData));
                        window.location.href = "../index.html";
                        window.username = UserData.username;
                        window.userdata = UserData;
                        window.pp = UserData.pp;
                    }
                } else {
                    const UserData = {
                        register: Math.floor(Date.now() / 1000),
                        username: Username,
                        password: Password,
                        bio: "",
                        pp: "",

                        ban: {
                            banned: false,
                            until: 0,
                            reason: ""
                        }
                    };

                    const NewUserDocRef = doc(UsersCollection);
                    await setDoc(NewUserDocRef, UserData);
                    localStorage.setItem("USER", JSON.stringify(UserData));
                }
            }

            SubmitButton.addEventListener("click", Login);
            PasswordInput.addEventListener("keypress", (Event) => {
                if (Event.key === "Enter") {
                    Login();
                }
            });

            UsernameInput.addEventListener("keypress", (Event) => {
                if (Event.key === "Enter") {
                    Login();
                }
            });
        } else {
            location.href = "../account.html"; 
        }
    } else if (document.title !== "Account") {
        const ProfileRemoveAccountButton = document.getElementById("ProfileRemoveAccountButton");
        const LogOutButton = document.getElementById("LogOutButton");

        ProfileRemoveAccountButton.addEventListener("click", () => localStorage.removeItem("USER"));
        LogOutButton.addEventListener("click", () => localStorage.removeItem("USER"));

        UsernameLabel.innerHTML = `@${JSON.parse(localStorage.getItem("USER")).username}`;
        window.userdata = JSON.parse(localStorage.getItem("USER"));
    }
}

document.addEventListener("DOMContentLoaded", CheckUserDoc);
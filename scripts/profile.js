import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
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

const FaxesCollection = collection(Db, "faxes");

const Topbar = document.getElementById("Topbar");

const FaxesContainer = document.getElementById("FaxesContainer");
const UsernameLabel = document.getElementById("UsernameLabel");

const ProfileContainer = document.getElementById("Profile");
const ProfileUsernameLabel = document.getElementById("ProfileUsernameLabel");
const ProfileLikesLabel = document.getElementById("ProfileLikesLabel");
const ProfilePostsLabel = document.getElementById("ProfilePostsLabel");

var Toggle = false;
var UserFaxes = 0;
var UserLikes = 0;

UsernameLabel.addEventListener("click", async () => {
    UserFaxes = 0;
    UserLikes = 0;

    if (window.username) {
        Toggle = !Toggle;

        ProfileUsernameLabel.textContent = window.username;
        Topbar.style.top = Toggle ? "-10%" : "0";
        FaxesContainer.style.visibility = Toggle ? "hidden" : "visible";
        ProfileContainer.style.visibility = !Toggle ? "hidden" : "visible";

        const Faxes = await getDocs(FaxesCollection);
        Faxes.forEach((Fax) => {
            if (Fax.data().author === window.username) {
                UserFaxes++;
                UserLikes += Fax.data().likes;
            }
        });

        ProfilePostsLabel.innerHTML = `${UserFaxes} Posts`;
        ProfileLikesLabel.innerHTML = `${UserLikes} Likes`;
    }
});
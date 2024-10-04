import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore, collection, getDocs, getDoc, deleteDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
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
const UsersCollection = collection(Db, "users");

const Topbar = document.getElementById("Topbar");
const FaxesContainer = document.getElementById("FaxesContainer");
const UsernameLabel = document.getElementById("UsernameLabel");
const ProfileContainer = document.getElementById("Profile");
const ProfileUsernameLabel = document.getElementById("ProfileUsernameLabel");
const ProfileLikesLabel = document.getElementById("ProfileLikesLabel");
const ProfileViewsLabel = document.getElementById("ProfileViewsLabel");
const ProfilePostsLabel = document.getElementById("ProfilePostsLabel");
const ProfileTimestampLabel = document.getElementById("ProfileTimestampLabel");
const ProfileImageLabel = document.getElementById("ProfileImageLabel");

const ProfilePhotoInput = document.getElementById("ProfilePhotoInput");

const ProfilePhotoSaveButton = document.getElementById("ProfilePhotoSaveButton");
const ProfileRemoveAccountButton = document.getElementById("ProfileRemoveAccountButton");

var Toggle = false;
var UserFaxes = 0;
var UserLikes = 0;
var UserViews = 0;

function FormatDate(sec) {
    let d = new Date(sec * 1000);
    let day = ('0' + d.getDate()).slice(-2);
    let month = ('0' + (d.getMonth() + 1)).slice(-2);
    let year = d.getFullYear();
    return `${day}.${month}.${year}`;
}

UsernameLabel.addEventListener("click", async () => {
    UserFaxes = 0;
    UserLikes = 0;
    UserViews = 0;

    if (window.username) {
        Toggle = !Toggle;

        ProfileUsernameLabel.textContent = `@${window.username}`;
        Topbar.style.top = Toggle ? "-10%" : "0";
        FaxesContainer.style.visibility = Toggle ? "hidden" : "visible";
        ProfileContainer.style.visibility = !Toggle ? "hidden" : "visible";

        const Faxes = await getDocs(FaxesCollection);
        Faxes.forEach((Fax) => {
            if (Fax.data().author === window.username) {
                UserFaxes++;
                UserLikes += Fax.data().likes;
                UserViews += Fax.data().views;
            }
        });

        const IP = fax.GetUUID();
        const UserDocRef = doc(UsersCollection, IP);
        const UserSnapshot = await getDoc(UserDocRef);
        const ProfileImageAddress = UserSnapshot.data();
        if (ProfileImageAddress.pp !== "") {
            ProfileImageLabel.src = ProfileImageAddress.pp;
        }

        ProfilePostsLabel.innerHTML = `${UserFaxes} Post${UserFaxes > 1 ? "s" : ""}`;
        ProfileLikesLabel.innerHTML = `${UserLikes} Like${UserLikes > 1 ? "s" : ""}`;
        ProfileViewsLabel.innerHTML = `${UserViews} View${UserViews > 1 ? "s" : ""}`;
        ProfileTimestampLabel.innerHTML = FormatDate(window.userdata.register);
    }
});

ProfileRemoveAccountButton.addEventListener("click", async () => {
    const IP = fax.GetUUID();
    const UserDocRef = doc(UsersCollection, IP);
    await deleteDoc(UserDocRef);
    window.location.reload();
});

ProfilePhotoSaveButton.addEventListener("click", async () => {
    const ProfilePhotoAddress = ProfilePhotoInput.value;

    const IP = fax.GetUUID();
    const UserDocRef = doc(UsersCollection, IP);
    await updateDoc(UserDocRef, {
        pp: ProfilePhotoAddress
    });

    location.reload();
});
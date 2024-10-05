import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js";
import { getFirestore, collection, getDocs, deleteDoc, updateDoc, doc, query, where } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
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
const Storage = getStorage(App);

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
const ProfileImageInput = document.getElementById("ProfileImageInput");

const ProfilePhotoSaveButton = document.getElementById("ProfilePhotoSaveButton");
const ProfileRemoveAccountButton = document.getElementById("ProfileRemoveAccountButton");

var Focus = {
    ProfileImage: false
};

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

    if (JSON.parse(localStorage.getItem("USER"))) {
        Toggle = !Toggle;

        ProfileUsernameLabel.textContent = `@${JSON.parse(localStorage.getItem("USER")).username}`;
        Topbar.style.top = Toggle ? "-10%" : "0";
        FaxesContainer.style.visibility = Toggle ? "hidden" : "visible";
        ProfileContainer.style.visibility = !Toggle ? "hidden" : "visible";

        const Faxes = await getDocs(FaxesCollection);
        Faxes.forEach((Fax) => {
            if (Fax.data().author === JSON.parse(localStorage.getItem("USER")).username) {
                UserFaxes++;
                UserLikes += Fax.data().likes;
                UserViews += Fax.data().views;
            }
        });

        const UserData = JSON.parse(localStorage.getItem("USER"));
        if (UserData.pp !== "") {
            ProfileImageLabel.src = UserData.pp;
        }

        ProfilePostsLabel.innerHTML = `${UserFaxes} Post${UserFaxes > 1 ? "s" : ""}`;
        ProfileLikesLabel.innerHTML = `${UserLikes} Like${UserLikes > 1 ? "s" : ""}`;
        ProfileViewsLabel.innerHTML = `${UserViews} View${UserViews > 1 ? "s" : ""}`;
        ProfileTimestampLabel.innerHTML = FormatDate(window.userdata.register);
    }
});

ProfileRemoveAccountButton.addEventListener("click", async () => {
    const UserQuery = query(UsersCollection, where("username", "==", JSON.parse(localStorage.getItem("USER")).username));
    const QuerySnapshot = await getDocs(UserQuery);
    if (!QuerySnapshot.empty) {
        const UserDocRef = QuerySnapshot.docs[0].ref;
        await deleteDoc(UserDocRef);
        localStorage.removeItem("USER");
        window.location.reload();
    }
});

ProfilePhotoSaveButton.addEventListener("click", async () => {
    const ProfilePhotoImage = ProfileImageInput.files[0];

    if (ProfilePhotoImage) {
        const StorageRef = ref(Storage, `uploads/${ProfilePhotoImage.name}`);

        ProfilePhotoSaveButton.innerHTML = "Uploading Image";
        ProfilePhotoSaveButton.disabled = true;

        try {
            await uploadBytes(StorageRef, ProfilePhotoImage);
            const URLString = await getDownloadURL(StorageRef);
            
            const UserQuery = query(UsersCollection, where("username", "==", JSON.parse(localStorage.getItem("USER")).username));
            const QuerySnapshot = await getDocs(UserQuery);
            if (!QuerySnapshot.empty) {
                const UserDocRef = QuerySnapshot.docs[0].ref;

                await updateDoc(UserDocRef, {
                    pp: URLString
                });

                const UserData = JSON.parse(localStorage.getItem("USER"));
                UserData.pp = URLString; 
                localStorage.setItem("USER", JSON.stringify(UserData));
                ProfileImageLabel.src = URLString; 
            }
            ProfilePhotoSaveButton.innerHTML = "Save Photo";
            ProfilePhotoSaveButton.disabled = false;
        } catch (Error) {
            console.error('Upload failed:', Error);
            ProfilePhotoSaveButton.innerHTML = "Save Photo";
            ProfilePhotoSaveButton.disabled = false;
        }
    }
});

ProfileImageLabel.addEventListener("click", () => {
    Focus.ProfileImage = !Focus.ProfileImage;
    ProfileImageLabel.style.position = Focus.ProfileImage ? "absolute" : "";
    ProfileImageLabel.style.left = Focus.ProfileImage ? "50%" : "";
    ProfileImageLabel.style.top = Focus.ProfileImage ? "50%" : "";
    ProfileImageLabel.style.transform = Focus.ProfileImage ? "translate(-50%, -50%)" : "";
    ProfileImageLabel.style.width = Focus.ProfileImage ? "25%" : "";
});
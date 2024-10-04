import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js";
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

const BackdropInput = document.getElementById("BackdropInput");
const TextColorInput = document.getElementById("TextColorInput");

const ProfilePhotoInput = document.getElementById("ProfilePhotoInput");
const ProfileImageInput = document.getElementById("ProfileImageInput");

const ProfileStyleSaveButton = document.getElementById("ProfileStyleSaveButton");
const ProfilePhotoSaveButton = document.getElementById("ProfilePhotoSaveButton");
const ProfileRemoveAccountButton = document.getElementById("ProfileRemoveAccountButton");

function InvertColor(HexString) {
    HexString = HexString.replace('#', '');

    const R = parseInt(HexString.substring(0, 2), 16);
    const G = parseInt(HexString.substring(2, 4), 16);
    const B = parseInt(HexString.substring(4, 6), 16);

    const Brightness = (R * 0.299 + G * 0.587 + B * 0.114);
    const InvertedColor = Brightness >= 200 ? '#000000' : '#FFFFFF';
    
    return InvertedColor;
}

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
        const UserData = await UserSnapshot.data();

        const BackgroundColor = UserData.style.backgroundColor;
        const TextColor = UserData.style.textColor;

        ProfileContainer.style.backgroundColor = BackgroundColor;
        ProfileContainer.style.color = TextColor;

        BackdropInput.value = BackgroundColor;
        TextColorInput.value = TextColor;
        
        ProfileImageLabel.style.borderColor = TextColor;

        Array.from(ProfileContainer.querySelectorAll("button")).forEach(Element => {
            Element.style.color = TextColor;
            Element.onmouseenter = () => Element.style.color = InvertColor(TextColor);
            Element.onmouseleave = () => Element.style.color = TextColor;
        });

        Array.from(ProfileContainer.querySelectorAll("input")).forEach(Element => {
            Element.style.color = TextColor;;
        });

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
    const IP = fax.GetUUID();
    const UserDocRef = doc(UsersCollection, IP);
    await deleteDoc(UserDocRef);
    window.location.reload();
});

ProfilePhotoSaveButton.addEventListener("click", async () => {
    const ProfilePhotoAddress = ProfilePhotoInput.value;
    const ProfilePhotoImage = ProfileImageInput;

    if (!ProfilePhotoImage.files[0] && ProfilePhotoAddress) {
        const IP = fax.GetUUID();
        const UserDocRef = doc(UsersCollection, IP);
        await updateDoc(UserDocRef, {
            pp: ProfilePhotoAddress
        });

        location.reload();
    } else if (ProfilePhotoImage.files[0] && !ProfilePhotoAddress) {
        const File = ProfilePhotoImage.files[0];

        const StorageRef = ref(Storage, `uploads/${File.name}`);

        ProfilePhotoSaveButton.innerHTML = "Uploading Image";
        ProfilePhotoSaveButton.disabled = true;
        await uploadBytes(StorageRef, File).then(async (Snapshot) => {
            const URL = await getDownloadURL(StorageRef);
            const UserDocRef = doc(UsersCollection, fax.GetUUID());
            await updateDoc(UserDocRef, {
                pp: URL
            });
        }).catch((Error) => {
            console.error('Upload failed:', Error);
        });

        location.reload();
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

ProfileStyleSaveButton.addEventListener("click", async () => {
    const BackgroundColor = BackdropInput.value;
    const TextColor = TextColorInput.value;

    const IP = fax.GetUUID();
    const UserDocRef = doc(UsersCollection, IP);
    await updateDoc(UserDocRef, {
        style: {
            backgroundColor: BackgroundColor,
            textColor: TextColor
        }
    });

    location.reload();
});
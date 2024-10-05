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

export const DebugMode = false;
export const AdminNames = [
    "kayra",
    "Lil Communist"
];

const App = initializeApp(FirebaseConfig);
const Db = getFirestore(App);
const FaxesCollection = collection(Db, "faxes");

const LinkHrefLabel = document.getElementById("LinkHrefLabel");
const MessageBoxDiv = document.getElementById("MessageBox");
const MsgHeader = document.getElementById('MsgHeader');
const MsgContent = document.getElementById('MsgContent');
const MsgAcceptButton = document.getElementById('MsgAcceptButton');
const MsgRefuseButton = document.getElementById('MsgRefuseButton');

export function MidCont(MessageBox = {Header: "", Content: "", Accept: "", Refuse: ""}, Accept = () => console.log("Accepted"), Refuse = () => console.log("Refused"), Visible = true) {
    MsgHeader.innerHTML = MessageBox.Header;
    MsgContent.innerHTML = MessageBox.Content;
    
    if (MessageBox.Accept) {
        MsgRefuseButton.style.display = "none";
        MsgAcceptButton.innerHTML = MessageBox.Accept;
    } else if (MessageBox.Refuse) {
        MsgAcceptButton.style.display = "none";
        MsgRefuseButton.innerHTML = MessageBox.Refuse;
    } else if (MessageBox.Accept && MessageBox.Refuse) {
        MsgRefuseButton.style.display = "";
        MsgAcceptButton.style.display = "";
        MsgAcceptButton.innerHTML = MessageBox.Accept;
        MsgRefuseButton.innerHTML = MessageBox.Refuse;
    }
    
    if (!Visible) {
        MessageBoxDiv.style.opacity = "0"

        setTimeout(() => {
            MessageBoxDiv.style.visibility = "hidden";
        }, 250);
    } else {
        MsgAcceptButton.onclick = () => {
            Accept();

            MessageBoxDiv.style.opacity = "0"

            setTimeout(() => {
                MessageBoxDiv.style.visibility = "hidden";
            }, 250);
        };
        MsgRefuseButton.onclick = () => {
            Refuse();
            MessageBoxDiv.style.opacity = "0"

            setTimeout(() => {
                MessageBoxDiv.style.visibility = "hidden";
            }, 250);
        };

        MessageBoxDiv.style.visibility = "visible";
        MessageBoxDiv.style.opacity = "1"
    }
}

export function ShowLink(Link, Show) {
    LinkHrefLabel.innerHTML = Link;
    LinkHrefLabel.style.opacity = Show ? "1" : "0";
}

export async function CreateFax(Title, Content, Creator) {
    const FaxRef = await addDoc(FaxesCollection, {
        title: Title,
        content: Content,
        author: Creator,
        views: 0,
        likes: 0,
        likedBy: [],
        replies: [],
        editted: {
            editted: false,
            timestamp: Math.floor(Date.now() / 1000)
        },
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

    return `${navigator.language.slice(0, 2)}${navigator.hardwareConcurrency}${CoreMapping[navigator.hardwareConcurrency]}${Intl.DateTimeFormat().resolvedOptions().timeZone.replace("/", "")}`.trim().toLowerCase();
}
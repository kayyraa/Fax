import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore, collection, doc, getDocs, addDoc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
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

export const Announcements = false;
export const DebugMode = false;
export const AdminNames = [
    "kayra",
    "Lil Communist",
    "Tahta"
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

export async function UpdateDoc(DocRef, Fields) {
    await updateDoc(DocRef, Fields);
}

export async function DeleteDoc(DocRef) {
    await deleteDoc(DocRef);
}

export async function GetAllUsers() {
    const UsersCollection = collection(Db, "users");
    return await getDocs(UsersCollection);
}

export function FilterKeywords(Words, Parent) {
    for (let Index = 0; Index < Words.length; Index++) {
        const Word = Words[Index];
        
        let TextNode;
    
        if (Word.startsWith("<code>") && Word.endsWith("</code>")) {
            TextNode = document.createElement("code");
            TextNode.innerHTML = InnerContent;
        } else if (Word.startsWith("<i>") && Word.endsWith("</i>")) {
            TextNode = document.createElement("i");
            TextNode.innerHTML = Word.replace(/<\/?i>/g, "").trim();
        } else if (Word.startsWith("<b>") && Word.endsWith("</b>")) {
            TextNode = document.createElement("b");
            TextNode.innerHTML = Word.replace(/<\/?b>/g, "").trim();
        } else if (Word.startsWith("<bq>") && Word.endsWith("</bq>")) {
            TextNode = document.createElement("blockquote");
            TextNode.innerHTML = Word.replace(/<\/?bq>/g, "").trim();
        } else if (Word.startsWith("<spoiler>") && Word.endsWith("</spoiler>")) {
            TextNode = document.createElement("span");
            TextNode.classList.add("SpoilerNode");
            TextNode.innerHTML = Word.replace(/<\/?spoiler>/g, "").trim();
        } else if (Word.startsWith("<pre>") && Word.endsWith("</pre>")) {
            TextNode = document.createElement("pre");
            TextNode.innerHTML = Word.replace(/<\/?pre>/g, "").trim();
        } else if (Word.startsWith("https://")) {
            const GetDomain = (Url) => new URL(Url).hostname;
            TextNode = document.createElement("span");
            TextNode.setAttribute("hreflink", "true");
            TextNode.innerHTML = Index !== 0 ? ` https://${GetDomain(Word)}` : `https://${GetDomain(Word)}`;
            TextNode.onclick = () => window.open(Word);
            TextNode.onmouseenter = () => fax.ShowLink(Word, true);
            TextNode.onmouseleave = () => fax.ShowLink(Word, false);
        } else if (Word.startsWith("<img>") && Word.endsWith("</img>")) {
            TextNode = document.createElement("img");
            TextNode.style.height = "100%";
            TextNode.src = Word.replace("<img>", "").replace("</img>", "").trim();
            TextNode.onclick = () => window.open(TextNode.src);
            TextNode.onmouseenter = () => fax.ShowLink(TextNode.src, true);
            TextNode.onmouseleave = () => fax.ShowLink(TextNode.src, false);
        } else if (Word.startsWith("<video>") && Word.endsWith("</video>")) {
            TextNode = document.createElement("video");
            TextNode.style.height = "100%";
            TextNode.src = Word.replace("<video>", "").replace("</video>", "").trim();
            TextNode.onclick = () => window.open(TextNode.src);
            TextNode.onmouseenter = () => fax.ShowLink(TextNode.src, true);
            TextNode.onmouseleave = () => fax.ShowLink(TextNode.src, false);
            TextNode.controls = true;
        } else if (Word.startsWith("<embed>") && Word.endsWith("</embed>")) {
            const GetDomain = (Url) => new URL(Url).hostname;

            TextNode = document.createElement("iframe");
            TextNode.style.height = "100%";
            TextNode.src = Word.replace("<embed>", "").replace("</embed>", "").trim();
            TextNode.onclick = () => window.open(TextNode.src);
            TextNode.onmouseenter = () => fax.ShowLink(TextNode.src, true);
            TextNode.onmouseleave = () => fax.ShowLink(TextNode.src, false);
            TextNode.referrerPolicy = "strict-origin-when-cross-origin";

            TextNode.onload = () => {
                try {
                    console.log(`${String(TextNode.tagName).toLowerCase()}.load > ${GetDomain(TextNode.src)} > ${TextNode.src.replace(GetDomain(TextNode.src), "")}`);
                } catch (e) {
                    console.warn(`${String(TextNode.tagName).toLowerCase()}.fail > ${GetDomain(TextNode.src)} > ${TextNode.src.replace(GetDomain(TextNode.src), "")}`)
                }
            };
        } else {
            TextNode = document.createElement("span");
            TextNode.innerHTML = ` ${Word}`;
        }

        Parent.appendChild(TextNode);
    }
}

export const TimeAgo = (t1, t2, x) => {
    let diff = t2 - t1;
    let mins = 60, hrs = 3600, days = 86400, weeks = 604800, months = 2592000, years = 31536000;
    
    if (x) {
        return diff < 60 ? "now" : 
               diff < mins ? `${diff}s ago` : 
               diff < hrs ? `${Math.floor(diff / mins)}m ago` : 
               diff < days ? `${Math.floor(diff / hrs)}h ago` : 
               diff < weeks ? `${Math.floor(diff / days)}d ago` : 
               diff < months ? `${Math.floor(diff / weeks)}w ago` : 
               diff < years ? `${Math.floor(diff / months)}mo ago` : 
               `${Math.floor(diff / years)}y ago`;
    } else {
        return diff;
    }
};
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

const UsersCollection = collection(Db, "users");

const FaxesContainer = document.getElementById("FaxesContainer");
const FaxCreateButton = document.getElementById("FaxCreateButton");
const FaxTitleInput = document.getElementById("FaxTitleInput");
const FaxContentInput = document.getElementById("FaxContentInput");
const FaxSubmitButton = document.getElementById("FaxSubmitButton");

function LoadFaxes() {
    Array.from(FaxesContainer.getElementsByTagName("div")).forEach(Fax => {
        if (Fax !== FaxCreateButton) {
            Fax.remove();
        }
    });

    (async () => {
        const Faxes = await fax.GetAllFaxes();
        if (Faxes.length > 0) {
            Faxes.forEach(async Fax => {
                const Title = Fax.title;
                const Content = Fax.content;
                const Author = Fax.author;

                const FaxButton = document.createElement("div");
                FaxButton.classList.add("FaxButton");
                FaxesContainer.appendChild(FaxButton);

                const TitleLabel = document.createElement("h1");
                TitleLabel.innerHTML = Title;
                FaxButton.appendChild(TitleLabel);

                const CreatorLabel = document.createElement("sub");
                CreatorLabel.innerHTML = `@${Author}`;
                TitleLabel.appendChild(CreatorLabel);

                const Words = Content.split(" ");

                const ContentLabel = document.createElement("p");
                FaxButton.appendChild(ContentLabel);

                Words.forEach(Word => {
                    if (Word.startsWith("<i>") && Word.endsWith("</i>")) {
                        const TextNode = document.createElement("i");
                        TextNode.innerHTML = ` ${Word.replace("<i>", "").replace("</i>", "")}`;
                        ContentLabel.appendChild(TextNode);
                    } else if (Word.startsWith("<b>") && Word.endsWith("</b>")) {
                        const TextNode = document.createElement("b");
                        TextNode.innerHTML = ` ${Word.replace("<b>", "").replace("</b>", "")}`;
                        ContentLabel.appendChild(TextNode);
                    } else if (Word.startsWith("<bq>") && Word.endsWith("</bq>")) {
                        const TextNode = document.createElement("blockquote");
                        TextNode.innerHTML = ` ${Word.replace("<bq>", "").replace("</bq>", "")}`;
                        ContentLabel.appendChild(TextNode);
                    } else if (Word.startsWith("<code>") && Word.endsWith("</code>")) {
                        const TextNode = document.createElement("code");
                        TextNode.innerHTML = ` ${Word.replace("<code>", "").replace("</code>", "")}`;
                        ContentLabel.appendChild(TextNode);
                    } else if (Word.startsWith("<pre>") && Word.endsWith("</pre>")) {
                        const TextNode = document.createElement("pre");
                        TextNode.innerHTML = ` ${Word.replace("<pre>", "").replace("</pre>", "")}`;
                        ContentLabel.appendChild(TextNode);
                    }
                    
                    else {
                        const TextNode = document.createElement("span");
                        TextNode.innerHTML = ` ${Word}`;
                        ContentLabel.appendChild(TextNode);
                    }
                });       

                const StatusBar = document.createElement("div");
                StatusBar.classList.add("StatusBar");
                FaxButton.appendChild(StatusBar);

                const ViewCountLabel = document.createElement("span");
                ViewCountLabel.innerHTML = `${Fax.views} View${parseInt(Fax.views) > 1 ? "s" : ""}`;
                StatusBar.appendChild(ViewCountLabel);

                const Division = document.createElement("division");
                StatusBar.appendChild(Division);

                const LikeCountLabel = document.createElement("span");
                LikeCountLabel.innerHTML = `${Fax.likes} Like${parseInt(Fax.likes) > 1 ? "s" : ""}`;
                LikeCountLabel.setAttribute("link", "");
                LikeCountLabel.onclick = () => {
                    Array.from(document.getElementById('LikedByContainer').getElementsByTagName("div")).forEach(LikeByDiv => {
                        LikeByDiv.remove();
                    });

                    document.getElementById('LikedByContainer').style.visibility = 'visible';
                    Fax.likedBy.forEach(User => {
                        const LikedByDiv = document.createElement("div");
                        LikedByDiv.innerHTML = `@${User}`;
                        document.getElementById('LikedByContainer').appendChild(LikedByDiv);

                        LikedByDiv.addEventListener("click", async () => {
                            Array.from(document.getElementById('LikedByContainer').getElementsByTagName("div")).forEach(LikeByDiv => {
                                LikeByDiv.remove();
                            });
                            
                            const LikerProfile = document.createElement("div");
                            LikerProfile.innerHTML = `@${User}`;
                            document.getElementById('LikedByContainer').appendChild(LikerProfile);

                            const LikerQueryRef = await query(UsersCollection, where("username", "==", User));
                            const QuerySnapshot = await getDocs(LikerQueryRef);
                            QuerySnapshot.forEach((Doc) => {
                                const ConvertSecsToDate = (Seconds) => {
                                    const DateObject = new Date(Seconds * 1000);
                                    const Day = String(DateObject.getDate()).padStart(2, '0');
                                    const Month = String(DateObject.getMonth() + 1).padStart(2, '0');
                                    const Year = DateObject.getFullYear();
                                
                                    return `${Day}.${Month}.${Year}`;
                                };

                                const Data = Doc.data();
                                const Timestamp = Data.register;
                                
                                var Views = 0;
                                var Likes = 0;
                                var Posts = 0;

                                Faxes.forEach(Fax => {
                                    if (Fax.author === User) {
                                        Posts++;
                                        Views += Fax.views;
                                        Likes += Fax.likes;
                                    }
                                });

                                LikerProfile.innerHTML += `<br>Registered: ${ConvertSecsToDate(Timestamp)}`;
                                LikerProfile.innerHTML += `<br>Views: ${Views}`;
                                LikerProfile.innerHTML += `<br>Likes: ${Likes}`;
                                LikerProfile.innerHTML += `<br>Posts: ${Posts}`;
                            });
                        });
                    });
                };
                StatusBar.appendChild(LikeCountLabel);
                
                const Division2 = document.createElement("division");
                StatusBar.appendChild(Division2);

                const LikeButton = document.createElement("img");
                LikeButton.src = "../images/NotLiked.svg";
                LikeButton.style.height = "3vh";
                StatusBar.appendChild(LikeButton);

                const Division3 = document.createElement("division");
                StatusBar.appendChild(Division3);

                const TimeAgo = (t1, t2, x) => {
                    let diff = t2 - t1;
                    let mins = 60, hrs = 3600, days = 86400, months = 2592000, years = 31536000;
                    if (x) {
                        return diff < mins ? `${diff}s ago` : diff < hrs ? `${Math.floor(diff / mins)}m ago` : diff < days ? `${Math.floor(diff / hrs)}h ago` : 
                           diff < months ? `${Math.floor(diff / days)}d ago` : diff < years ? `${Math.floor(diff / months)}mo ago` : `${Math.floor(diff / years)}y ago`;
                    } else {
                        return diff;
                    }
                };

                const TimestampLabel = document.createElement("span");
                TimestampLabel.innerHTML = TimeAgo(Fax.timestamp, Math.floor(Date.now() / 1000), true);
                StatusBar.appendChild(TimestampLabel);

                FaxButton.style.order = TimeAgo(Fax.timestamp, Math.floor(Date.now() / 1000), false);

                const RemoveButton = document.createElement("div");
                RemoveButton.style.position = "absolute";
                RemoveButton.style.right = "1.25%";
                RemoveButton.style.fontSize = "2.5vh";
                RemoveButton.style.backgroundColor = "rgba(200, 0, 0, 0.5)";
                RemoveButton.style.borderRadius = "2.5em";
                RemoveButton.style.paddingLeft = "1.5vh";
                RemoveButton.style.paddingRight = "1.5vh";
                RemoveButton.style.bottom = "8vh";
                RemoveButton.innerHTML = "Remove";
                FaxButton.appendChild(RemoveButton);

                const IP = fax.GetUUID();
                if (IP) {
                    const UserDocRef = doc(UsersCollection, IP);
                    const DocSnapshot = await getDoc(UserDocRef);

                    const DocData = await DocSnapshot.data();

                    var IsAuthor = Author === DocData.username;
                    RemoveButton.style.visibility = IsAuthor ? "visible" : "hidden";

                    if (Array.from(Fax.likedBy).includes(DocData.username)) {
                        LikeButton.src = "../images/Liked.svg";
                    } else {
                        LikeButton.addEventListener("mouseleave", () => {
                            LikeButton.src = "../images/NotLiked.svg"
                        });

                        LikeButton.addEventListener("mouseenter", () => {
                            LikeButton.src = "../images/Liked.svg"
                        });
                    }

                    LikeButton.addEventListener("click", async () => {
                        if (!Array.from(Fax.likedBy).includes(DocData.username)) {
                            const UpdatedLikedBy = [...Fax.likedBy, DocData.username];

                            await setDoc(doc(Db, "faxes", Fax.id), {
                                likes: Fax.likes + 1,
                                likedBy: UpdatedLikedBy
                            }, { merge: true });

                            LikeButton.src = "../images/Liked.svg"
                        } else {
                            const UpdatedLikedBy = Fax.likedBy.filter(user => user !== DocData.username);

                            await setDoc(doc(Db, "faxes", Fax.id), {
                                likes: Fax.likes - 1,
                                likedBy: UpdatedLikedBy
                            }, { merge: true });

                            LikeButton.src = "../images/NotLiked.svg"
                        }

                        LoadFaxes();
                    });

                    RemoveButton.addEventListener("click", async () => {
                        await deleteDoc(doc(Db, "faxes", Fax.id));
                        LoadFaxes();
                    });
                }

                FaxButton.addEventListener("click", async function(Event) {
                    if (Event.target === LikeButton || Event.target === RemoveButton || Event.target === LikeCountLabel) return;
                    
                    ContentLabel.style.visibility = getComputedStyle(ContentLabel).visibility === "visible" ? "hidden" : "visible";
                    this.style.zIndex = "1";
                    this.style.height = getComputedStyle(ContentLabel).visibility === "visible" ? "36vh" : "26vh";

                    await setDoc(doc(Db, "faxes", Fax.id), {
                        views: Fax.views + 1
                    }, { merge: true });
                });
            });
        }
    })();
}

FaxSubmitButton.addEventListener("click", async () => {
    const IP = fax.GetUUID();

    const UserDocRef = doc(UsersCollection, IP);
    const DocSnapshot = await getDoc(UserDocRef);

    if (!DocSnapshot.exists()) return;

    const Title = FaxTitleInput.value;
    const Content = FaxContentInput.value;

    if (!Title || !Content) return;

    await fax.CreateFax(Title, Content, DocSnapshot.data().username);
    FaxTitleInput.value = "";
    FaxContentInput.value = "";
    LoadFaxes();
});

document.addEventListener("DOMContentLoaded", LoadFaxes);
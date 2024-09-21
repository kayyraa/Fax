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

                const Tags = {
                    "<i>": "i",
                    "<b>": "b",
                    "<u>": "u",
                    "<sub>" : "sub",
                    "<sup>" : "sup",
                    "<code>" : "code",
                    "<pre>" : "pre",
                    "<bq>" : "blockquote"
                };
                
                const Words = Content.split(" ");
                const ContentLabel = document.createElement("p");
                FaxButton.appendChild(ContentLabel);
                
                Words.forEach(Word => {
                    let Tag = "span";
                    let CleanWord = Word;
                
                    for (const [Key, Value] of Object.entries(Tags)) {
                        if (Word.startsWith(Key) && Word.endsWith(`</${Value}>`)) {
                            Tag = Value;
                            CleanWord = ` ${Word.replace(Key, "").replace(`</${Value}>`, "")}`;
                            break;
                        }
                    }
                
                    const TextNode = document.createElement(Tag);
                    TextNode.textContent = CleanWord;
                    ContentLabel.appendChild(TextNode);
                });                

                const StatusBar = document.createElement("div");
                StatusBar.classList.add("StatusBar");
                FaxButton.appendChild(StatusBar);

                const ViewCountLabel = document.createElement("span");
                ViewCountLabel.innerHTML = `${Fax.views} Views`;
                StatusBar.appendChild(ViewCountLabel);

                const Division = document.createElement("division");
                Division.innerHTML = "|";
                StatusBar.appendChild(Division);

                const LikeCountLabel = document.createElement("span");
                LikeCountLabel.innerHTML = `${Fax.likes} Like${parseInt(Fax.likes) > 1 ? "s" : ""}`;
                StatusBar.appendChild(LikeCountLabel);
                
                const Division2 = document.createElement("division");
                Division2.innerHTML = "|";
                StatusBar.appendChild(Division2);

                const LikeButton = document.createElement("img");
                LikeButton.src = "../images/NotLiked.svg";
                LikeButton.style.height = "4vh";
                StatusBar.appendChild(LikeButton);

                const RemoveButton = document.createElement("div");
                RemoveButton.style.position = "absolute";
                RemoveButton.style.right = "1.5%";
                RemoveButton.style.color = "rgb(225, 55, 55)";
                RemoveButton.style.fontSize = "4vh";
                RemoveButton.style.visibility = "hidden";
                RemoveButton.innerHTML = "Remove";
                FaxButton.appendChild(RemoveButton);

                const IP = `${navigator.hardwareConcurrency}${Intl.DateTimeFormat().resolvedOptions().timeZone.replace("/", "")}`.toLowerCase();
                if (IP) {
                    const UserDocRef = doc(UsersCollection, IP);
                    const DocSnapshot = await getDoc(UserDocRef);

                    const DocData = await DocSnapshot.data();

                    var IsAuthor = Author === DocData.username;

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
                    if (Event.target === LikeButton) return;

                    RemoveButton.style.visibility = getComputedStyle(ContentLabel).visibility !== "visible" ? IsAuthor ? "visible" : "hidden" : "hidden";

                    FaxesContainer.scrollTop = 0;
                    
                    ContentLabel.style.visibility = getComputedStyle(ContentLabel).visibility === "visible" ? "hidden" : "visible";
                    this.style.zIndex = "2";
                    this.style.position = getComputedStyle(ContentLabel).visibility === "visible" ? "absolute" : "";
                    this.style.height = getComputedStyle(ContentLabel).visibility === "visible" ? "100%" : "26vh";

                    FaxCreateButton.style.visibility = getComputedStyle(ContentLabel).visibility === "visible" ? "hidden" : "visible";

                    Array.from(FaxesContainer.getElementsByTagName("div")).forEach(OtherFax => {
                        if (OtherFax !== this) {
                            OtherFax.style.visibility = getComputedStyle(ContentLabel).visibility === "visible" ? "hidden" : "visible";
                        }
                    });

                    await setDoc(doc(Db, "faxes", Fax.id), {
                        views: Fax.views + 1
                    }, { merge: true });
                });
            });
        }
    })();
}

FaxSubmitButton.addEventListener("click", async () => {
    const IP = `${navigator.hardwareConcurrency}${Intl.DateTimeFormat().resolvedOptions().timeZone.replace("/", "")}`.toLowerCase();;

    const UserDocRef = doc(UsersCollection, IP);
    const DocSnapshot = await getDoc(UserDocRef);

    if (!DocSnapshot.exists()) return;

    const Title = FaxTitleInput.value;
    const Content = FaxContentInput.value;

    await fax.CreateFax(Title, Content, DocSnapshot.data().username);
    FaxTitleInput.value = "";
    FaxContentInput.value = "";
    LoadFaxes();
});

document.addEventListener("DOMContentLoaded", LoadFaxes);
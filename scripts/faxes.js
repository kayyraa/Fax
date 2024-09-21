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

async function json(url) {
    return fetch(url).then(res => res.json());
}

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

                const ContentLabel = document.createElement("p");
                ContentLabel.innerHTML = Content;
                FaxButton.appendChild(ContentLabel);

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

                const IP = await json(`https://api.ipdata.co?api-key=b1bf8f09e6f8fd273c85562c3adf823f22cb40a5d06762baba6cd04b`).then(data => {
                    return data.ip;
                });
                if (IP) {
                    const UserDocRef = doc(UsersCollection, IP);
                    const DocSnapshot = await getDoc(UserDocRef);

                    var IsAuthor = Author === DocSnapshot.data().username;

                    if (Array.from(Fax.likedBy).includes(DocSnapshot.data().username)) {
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
                        if (!Array.from(Fax.likedBy).includes(DocSnapshot.data().username)) {
                            const UpdatedLikedBy = [...Fax.likedBy, DocSnapshot.data().username];

                            await setDoc(doc(Db, "faxes", Fax.id), {
                                likes: Fax.likes + 1,
                                likedBy: UpdatedLikedBy
                            }, { merge: true });

                            LikeButton.src = "../images/Liked.svg"
                        } else {
                            const UpdatedLikedBy = Fax.likedBy.filter(user => user !== DocSnapshot.data().username);

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
                    if (Event.target !== FaxButton) return;

                    RemoveButton.style.visibility = getComputedStyle(ContentLabel).visibility !== "visible" ? IsAuthor ? "visible" : "hidden" : "hidden";

                    ContentLabel.style.visibility = getComputedStyle(ContentLabel).visibility === "visible" ? "hidden" : "visible";
                    this.style.position = getComputedStyle(ContentLabel).visibility === "visible" ? "absolute" : "";
                    this.style.height = getComputedStyle(ContentLabel).visibility === "visible" ? "100%" : "32.5%";
                    this.style.width = getComputedStyle(ContentLabel).visibility === "visible" ? "100%" : "75%";

                    FaxCreateButton.style.visibility = getComputedStyle(ContentLabel).visibility === "visible" ? "hidden" : "visible";

                    if (getComputedStyle(ContentLabel).visibility === "hidden") {
                        LoadFaxes();
                    }

                    await setDoc(doc(Db, "faxes", Fax.id), {
                        views: Fax.views + 1
                    }, { merge: true });
                });
            });
        }
    })();
}

FaxSubmitButton.addEventListener("click", async () => {
    const IP = navigator.userAgent;

    const UserDocRef = doc(UsersCollection, IP);
    const DocSnapshot = await getDoc(UserDocRef);

    if (!DocSnapshot.exists()) return;

    const Title = FaxTitleInput.value;
    const Content = FaxContentInput.value;

    await fax.CreateFax(Title, Content, DocSnapshot.data().username);
    LoadFaxes();
});

document.addEventListener("DOMContentLoaded", LoadFaxes);
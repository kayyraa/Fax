import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore, collection, doc, setDoc, updateDoc, getDoc, getDocs, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
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
const FaxesCollection = collection(Db, "faxes");

const FaxesContainer = document.getElementById("FaxesContainer");
const FaxCreateButton = document.getElementById("FaxCreateButton");
const FaxTitleInput = document.getElementById("FaxTitleInput");
const FaxContentInput = document.getElementById("FaxContentInput");
const FaxSubmitButton = document.getElementById("FaxSubmitButton");
const FilterButton = document.getElementById("FilterButton");
const FilterInput = document.getElementById("FilterInput");
const ResultsLabel = document.getElementById("ResultsLabel");

function LoadFaxes(OnlyLoadOptions = {
    OnlyLoadWithThisAuthor: "",
    OnlyLoadWithTheseWords: [],
    OnlyLoadWithThisLikes: 0,
    OnlyLoadWithThisViews: 0,
    OnlyLoadWithHigherViewsThan: 0,
    OnlyLoadWithHigherLikesThan: 0,
    OnlyLoadWithLowerViewsThan: 0,
    OnlyLoadWithLowerLikesThan: 0,
}) {
    var Results = 0;
    Array.from(FaxesContainer.getElementsByTagName("div")).forEach(Fax => {
        if (Fax !== FaxCreateButton) {
            Fax.remove();
        }
    });

    (async () => {
        const Faxes = await fax.GetAllFaxes();
        if (Faxes.length > 0) {
            Faxes.forEach(async Fax => {
                if (OnlyLoadOptions.OnlyLoadWithThisAuthor) {
                    if (String(Fax.author).toLowerCase() !== OnlyLoadOptions.OnlyLoadWithThisAuthor.toLowerCase().replace("@", "")) {
                        return;
                    }
                }

                if (OnlyLoadOptions.OnlyLoadWithTheseWords && OnlyLoadOptions.OnlyLoadWithTheseWords.length > 0) {
                    const IncludesInTitle = OnlyLoadOptions.OnlyLoadWithTheseWords.some(Character => Fax.title.includes(Character));
                    const IncludesInContent = OnlyLoadOptions.OnlyLoadWithTheseWords.some(Character => Fax.content.includes(Character));
                
                    if (!IncludesInTitle && !IncludesInContent) {
                        return;
                    }
                }

                if (OnlyLoadOptions.OnlyLoadWithThisLikes) {
                    if (Fax.likes !== OnlyLoadOptions.OnlyLoadWithThisLikes) {
                        return;
                    }
                }

                if (OnlyLoadOptions.OnlyLoadWithThisViews) {
                    if (Fax.views !== OnlyLoadOptions.OnlyLoadWithThisViews) {
                        return;
                    }
                }

                if (OnlyLoadOptions.OnlyLoadWithHigherLikesThan) {
                    if (Fax.likes > OnlyLoadOptions.OnlyLoadWithHigherLikesThan) {
                        return;
                    }
                }

                if (OnlyLoadOptions.OnlyLoadWithHigherViewsThan) {
                    if (Fax.views > OnlyLoadOptions.OnlyLoadWithHigherViewsThan) {
                        return;
                    }
                }

                if (OnlyLoadOptions.OnlyLoadWithLowerLikesThan) {
                    if (Fax.likes < OnlyLoadOptions.OnlyLoadWithLowerLikesThan) {
                        return;
                    }
                }

                if (OnlyLoadOptions.OnlyLoadWithLowerViewsThan) {
                    if (Fax.views < OnlyLoadOptions.OnlyLoadWithLowerViewsThan) {
                        return;
                    }
                }

                Results++;

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

                                LikerProfile.innerHTML = `@${User}` +
                                `<br>Registered: ${ConvertSecsToDate(Timestamp)}` +
                                `<br>Views: ${Views}` +
                                `<br>Likes: ${Likes}` +
                                `<br>Posts: ${Posts}`;
                            });
                        });
                    });
                };
                StatusBar.appendChild(LikeCountLabel);

                const DivisionA = document.createElement("division");
                StatusBar.appendChild(DivisionA);

                const ReplyCountLabel = document.createElement("span");
                ReplyCountLabel.innerHTML = `${Fax.replies.length} ${Fax.replies.length > 1 ? "Replies" : "Reply"}`;
                StatusBar.appendChild(ReplyCountLabel);
                
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
                    let mins = 60, hrs = 3600, days = 86400, weeks = 604800, months = 2592000, years = 31536000;
                    
                    if (x) {
                        return diff <= 40 ? "now" : 
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

                const TimestampLabel = document.createElement("span");
                TimestampLabel.innerHTML = TimeAgo(Fax.timestamp, Math.floor(Date.now() / 1000), true);
                StatusBar.appendChild(TimestampLabel);

                FaxButton.style.order = TimeAgo(Fax.timestamp, Math.floor(Date.now() / 1000), false);

                const ReplyContainer = document.createElement("div");
                ReplyContainer.classList.add("ReplyContainer");
                FaxButton.appendChild(ReplyContainer);

                const ReplyInput = document.createElement("input");
                ReplyInput.type = "text";
                ReplyInput.placeholder = "Reply with ....";
                ReplyContainer.appendChild(ReplyInput);

                const ReplyButton = document.createElement("button");
                ReplyButton.innerHTML = "Reply";
                ReplyButton.onclick = async () => {
                    const ReplyValue = ReplyInput.value;
                    const FaxDocRef = doc(FaxesCollection, Fax.id);
                    const FaxDocSnapshot = await getDoc(FaxDocRef);

                    if (FaxDocSnapshot.exists()) {
                        const IP = fax.GetUUID();
                        const UserDocRef = doc(UsersCollection, IP);
                        const DocSnapshot = await getDoc(UserDocRef);
                        const DocData = await DocSnapshot.data();

                        const CurrentReplies = FaxDocSnapshot.data().replies || [];
                        CurrentReplies.push({
                            author: DocData.username,
                            message: ReplyValue
                        });
                    
                        await updateDoc(FaxDocRef, {
                            replies: CurrentReplies
                        });
                    
                        ReplyInput.value = "";
                    }
                }
                ReplyContainer.appendChild(ReplyButton);

                const RepliesContainer = document.createElement("div");
                RepliesContainer.classList.add("RepliesContainer");
                ReplyContainer.appendChild(RepliesContainer);

                const RepliesHeader = document.createElement("header");
                RepliesHeader.innerHTML = "Replies";
                RepliesContainer.appendChild(RepliesHeader);

                if (Fax.replies.length > 0) {
                    Fax.replies.forEach(Reply => {
                        const ReplyMessage = document.createElement("div");
                        ReplyMessage.classList.add("ReplyMessage");
                        ReplyMessage.innerHTML = `@${Reply.author} - ${Reply.message}`;
                        RepliesContainer.appendChild(ReplyMessage);
                    });
                } else {
                    const NoRepliesMessage = document.createElement("div");
                    NoRepliesMessage.innerHTML = "No replies yet.";
                    RepliesContainer.appendChild(NoRepliesMessage);
                }

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
                const UserDocRef = doc(UsersCollection, IP);
                const DocSnapshot = await getDoc(UserDocRef);
                const DocData = await DocSnapshot.data();
                var IsAuthor = Author === DocData.username;
                RemoveButton.style.visibility = IsAuthor ? "visible" : "hidden";
                if (Array.from(Fax.likedBy).includes(DocData.username)) {
                    LikeButton.src = "../images/Liked.svg";
                    LikeButton.addEventListener("mouseleave", function() {
                        LikeButton.src = "../images/Liked.svg"
                    });
                    LikeButton.addEventListener("mouseenter", () => {
                        LikeButton.src = "../images/NotLiked.svg"
                    });
                } else {
                    LikeButton.addEventListener("mouseleave", function() {
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
                });
                RemoveButton.addEventListener("click", async () => {
                    await deleteDoc(doc(Db, "faxes", Fax.id));
                    LoadFaxes();
                });

                FaxButton.addEventListener("click", async function(Event) {
                    if (Event.target === LikeButton || Event.target === RemoveButton || Event.target === LikeCountLabel || Event.target === ReplyContainer || Event.target.tagName.toLowerCase() === "input" || Event.target.tagName.toLowerCase() === "button") return;
                    
                    ContentLabel.style.visibility = getComputedStyle(ContentLabel).visibility === "visible" ? "hidden" : "visible";
                    ReplyContainer.style.visibility = getComputedStyle(ContentLabel).visibility !== "visible" ? "hidden" : "visible";
                    this.style.zIndex = "1";
                    this.style.height = getComputedStyle(ContentLabel).visibility === "visible" ? "46vh" : "26vh";

                    await setDoc(doc(Db, "faxes", Fax.id), {
                        views: Fax.views + 1
                    }, { merge: true });
                });
            });

            ResultsLabel.innerHTML = `${Results} Results`;
        }
    })();
}

function Filter() {
    if (FilterInput.value.startsWith("views: ")) {
        LoadFaxes({
            OnlyLoadWithThisViews: parseInt(FilterInput.value.replace("views: ", ""))
        });
    } else if (FilterInput.value.startsWith("likes: ")) {
        LoadFaxes({
            OnlyLoadWithThisLikes: parseInt(FilterInput.value.replace("likes: ", ""))
        });
    } else if (FilterInput.value.startsWith("views<: ")) {
        LoadFaxes({
            OnlyLoadWithLowerViewsThan: parseInt(FilterInput.value.replace("views<: ", ""))
        });
    } else if (FilterInput.value.startsWith("likes<: ")) {
        LoadFaxes({
            OnlyLoadWithLowerLikesThan: parseInt(FilterInput.value.replace("likes<: ", ""))
        });
    } else if (FilterInput.value.startsWith("views>: ")) {
        LoadFaxes({
            OnlyLoadWithHigherViewsThan: parseInt(FilterInput.value.replace("views>: ", ""))
        });
    } else if (FilterInput.value.startsWith("likes>: ")) {
        LoadFaxes({
            OnlyLoadWithHigherLikesThan: parseInt(FilterInput.value.replace("likes>: ", ""))
        });
    } else if (FilterInput.value.startsWith("author: ")) {
        LoadFaxes({
            OnlyLoadWithThisAuthor: FilterInput.value.replace("author: ", "")
        });
    } else {
        LoadFaxes({
            OnlyLoadWithTheseWords: FilterInput.value.split(", ")
        });
    }
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

FilterButton.addEventListener("click", () => {
    Filter();
});

FilterInput.addEventListener("keypress", (Event) => {
    if (Event.key === "Enter") {
        Filter();
    }
});

document.addEventListener("DOMContentLoaded", LoadFaxes);
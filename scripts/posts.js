import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore, collection, doc, setDoc, updateDoc, getDoc, getDocs, deleteDoc, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
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
const AdminHTLabel = document.getElementById("AdminLabel");

function LoadFaxes(
OnlyLoadOptions = {
    OnlyLoadWithThisAuthor: "",
    OnlyLoadWithThisHashtags: [],
    OnlyLoadWithTheseWords: [],
    OnlyLoadWithThisLikes: 0,
    OnlyLoadWithThisViews: 0,
    OnlyLoadWithHigherViewsThan: 0,
    OnlyLoadWithHigherLikesThan: 0,
    OnlyLoadWithLowerViewsThan: 0,
    OnlyLoadWithLowerLikesThan: 0,
},
PageOptions = {
    Scroll: 0
},
OnLoadOptions = {
    HighlightFax: {
        Title: "",
        Author: "",
        For: 250,
        Click: false
    }
}) {
    var Results = 0;
    ResultsLabel.innerHTML = `${Results} Results`;

    Array.from(FaxesContainer.getElementsByTagName("div")).forEach(Fax => {
        if (Fax !== FaxCreateButton) {
            Fax.remove();
        }
    });

    (async () => {
        const Snapshot = await getDocs(FaxesCollection);
        const Faxes = await Snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (Faxes.length > 0) {
            Faxes.forEach(async Fax => {
                const FaxDocRef = await doc(FaxesCollection, Fax.id);
                const FaxDocSnapshot = await getDoc(FaxDocRef);

                const ADR = await query(UsersCollection, await where("username", "==", Fax.author));
                const AQS = await getDocs(ADR);
                const AuthorDocRef = AQS.docs[0];

                const UDR = await query(UsersCollection, await where("username", "==", JSON.parse(localStorage.getItem("USER")).username));
                const UQS = await getDocs(UDR);
                const UserDocRef = UQS.docs[0];

                if (fax.DebugMode) {
                    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
                    console.log(`fax.load.replies > ${Fax.replies}`);
                    console.log(`fax.load.likes > ${Fax.likes}`);
                    console.log(`fax.load.likedby > ${Fax.likedBy}`);
                    console.log(`fax.load.editted > ${Fax.editted}`);
                    console.log(`fax.load.author > ${Fax.author}`);
                    console.log(`fax.load.title > ${Fax.title}`);
                    console.log(`fax.load.content > ${Fax.content}`);
                    console.log(`fax.load.timestamp > ${Fax.timestamp}`);
                    console.log(Fax);
                }

                if (PageOptions.Scroll) {
                    FaxesContainer.scrollTop = PageOptions.Scroll;
                }

                if (OnlyLoadOptions.OnlyLoadWithThisAuthor) {
                    if (String(Fax.author).toLowerCase() !== OnlyLoadOptions.OnlyLoadWithThisAuthor.toLowerCase().replace("@", "")) return;
                }

                if (OnlyLoadOptions.OnlyLoadWithThisHashtags) {
                    if (!OnlyLoadOptions.OnlyLoadWithThisHashtags.includes(String(Fax.content))) return;
                }

                if (OnlyLoadOptions.OnlyLoadWithTheseWords && OnlyLoadOptions.OnlyLoadWithTheseWords.length > 0) {
                    const IncludesInTitle = OnlyLoadOptions.OnlyLoadWithTheseWords.some(Character => Fax.title.includes(Character));
                    const IncludesInContent = OnlyLoadOptions.OnlyLoadWithTheseWords.some(Character => Fax.content.includes(Character));
                
                    if (!IncludesInTitle && !IncludesInContent) return;
                }

                if (OnlyLoadOptions.OnlyLoadWithThisLikes) {
                    if (Fax.likes !== OnlyLoadOptions.OnlyLoadWithThisLikes) return;
                }

                if (OnlyLoadOptions.OnlyLoadWithThisViews) {
                    if (Fax.views !== OnlyLoadOptions.OnlyLoadWithThisViews) return;
                }

                if (OnlyLoadOptions.OnlyLoadWithHigherLikesThan) {
                    if (Fax.likes > OnlyLoadOptions.OnlyLoadWithHigherLikesThan) return;
                }

                if (OnlyLoadOptions.OnlyLoadWithHigherViewsThan) {
                    if (Fax.views > OnlyLoadOptions.OnlyLoadWithHigherViewsThan) return;
                }

                if (OnlyLoadOptions.OnlyLoadWithLowerLikesThan) {
                    if (Fax.likes < OnlyLoadOptions.OnlyLoadWithLowerLikesThan) return;
                }

                if (OnlyLoadOptions.OnlyLoadWithLowerViewsThan) {
                    if (Fax.views < OnlyLoadOptions.OnlyLoadWithLowerViewsThan) return;
                }

                const Title = Fax.title;
                const Content = Fax.content;
                const Author = Fax.author;

                const FaxButton = document.createElement("div");
                FaxButton.classList.add("FaxButton");
                FaxesContainer.appendChild(FaxButton);

                const ProfileContainer = document.createElement("div");
                ProfileContainer.classList.add("ProfileContainer");
                FaxButton.appendChild(ProfileContainer);

                const ProfilePhoto = document.createElement("img");
                ProfilePhoto.classList.add("FaxButtonProfilePhoto");
                ProfilePhoto.src = "../images/DefaultUser.svg";
                ProfileContainer.appendChild(ProfilePhoto); 

                const CreatorLabel = document.createElement("span");
                CreatorLabel.innerHTML = `@${Author}`;
                CreatorLabel.classList.add("FaxButtonCreatorLabel");
                ProfileContainer.appendChild(CreatorLabel);

                const AdminLabel = document.createElement("span");
                AdminLabel.innerHTML = `${fax.AdminNames.includes(Author) ? "Admin" : ""}`;
                AdminLabel.classList.add("FaxButtonCreatorLabel");
                AdminLabel.id = "AdminLabel";
                ProfileContainer.appendChild(AdminLabel);

                const TitleLabel = document.createElement("h1");
                TitleLabel.innerHTML = Title;
                FaxButton.appendChild(TitleLabel);

                const TitleEditInput = document.createElement("input");
                TitleEditInput.style.display = "none";
                FaxButton.appendChild(TitleEditInput);

                const ContentEditInput = document.createElement("textarea");
                ContentEditInput.style.display = "none";
                ContentEditInput.style.height = "75vh";
                ContentEditInput.style.alignContent = "center";
                FaxButton.appendChild(ContentEditInput);

                const ConfirmEditButton = document.createElement("button");
                ConfirmEditButton.style.display = "none";
                ConfirmEditButton.innerHTML = "Confirm Changes";
                FaxButton.appendChild(ConfirmEditButton);

                const AbortEditButton = document.createElement("button");
                AbortEditButton.style.display = "none";
                AbortEditButton.innerHTML = "Abort Changes";
                AbortEditButton.style.color = "red";
                FaxButton.appendChild(AbortEditButton);

                if (OnLoadOptions.HighlightFax && OnLoadOptions.HighlightFax.Title && OnLoadOptions.HighlightFax.Author) {
                    if (String(Title).toLowerCase() === String(OnLoadOptions.HighlightFax.Title).toLowerCase() && String(Author).toLowerCase() === String(OnLoadOptions.HighlightFax.Author).toLowerCase()) {
                        FaxButton.style.backgroundColor = "rgb(80, 80, 80)";
                        setTimeout(() => {
                            FaxButton.style.backgroundColor = "";
                        }, OnLoadOptions.HighlightFax.For || 250);

                        if (OnLoadOptions.HighlightFax.Click) {
                            FaxButton.click();
                        }
                    }
                }

                const ContentLabel = document.createElement("p");
                ContentLabel.classList.add("ContentLabel");
                FaxButton.appendChild(ContentLabel);
                            
                const Words = Content.split(" ");
                            
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
                        TextNode = document.createElement("iframe");
                        TextNode.style.height = "100%";
                        TextNode.src = Word.replace("<embed>", "").replace("</embed>", "").trim();
                        TextNode.onclick = () => window.open(TextNode.src);
                        TextNode.onmouseenter = () => fax.ShowLink(TextNode.src, true);
                        TextNode.onmouseleave = () => fax.ShowLink(TextNode.src, false);
                        TextNode.referrerPolicy = "strict-origin-when-cross-origin";

                        TextNode.onload = () => {
                            try {
                                console.log(`${String(TextNode.tagName).toLowerCase()}.load > ${TextNode.src}`);
                            } catch (e) {
                                console.warn(`${String(TextNode.tagName).toLowerCase()}.fail > ${TextNode.src}`)
                            }
                        };
                    } else {
                        TextNode = document.createElement("span");
                        TextNode.innerHTML = ` ${Word}`;
                    }
                
                    ContentLabel.appendChild(TextNode);
                }

                const StatusBar = document.createElement("div");
                StatusBar.classList.add("StatusBar");
                FaxButton.appendChild(StatusBar);

                const ViewCountLabel = document.createElement("span");
                ViewCountLabel.innerHTML = `${Fax.views} View${parseInt(Fax.views) > 1 ? "s" : ""}`;
                StatusBar.appendChild(ViewCountLabel);

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

                const ReplyCountLabel = document.createElement("span");
                ReplyCountLabel.innerHTML = `${Fax.replies.length} ${Fax.replies.length > 1 ? "Replies" : "Reply"}`;
                StatusBar.appendChild(ReplyCountLabel);

                const TimestampLabel = document.createElement("span");
                StatusBar.appendChild(TimestampLabel);

                const TimeAgo = (t1, t2, x) => {
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

                if (Fax.editted.editted) {
                    const EditLabel = document.createElement("span");
                    EditLabel.innerHTML = `Edited - ${TimeAgo(Fax.editted.timestamp, Math.floor(Date.now() / 1000), true)}`;
                    StatusBar.appendChild(EditLabel);
                }

                const LikeButton = document.createElement("img");
                LikeButton.src = "../images/NotLiked.svg";
                LikeButton.style.height = "3vh";
                StatusBar.appendChild(LikeButton);

                TimestampLabel.innerHTML = TimeAgo(Fax.timestamp, Math.floor(Date.now() / 1000), true);

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

                    if (!ReplyValue) return;

                    if (FaxDocSnapshot.exists()) {
                        const CurrentReplies = FaxDocSnapshot.data().replies || [];
                        CurrentReplies.push({
                            author: JSON.parse(localStorage.getItem("USER")).username,
                            message: ReplyValue,
                            timestamp: Math.floor(Date.now() / 1000)
                        });
                    
                        await updateDoc(FaxDocRef, {
                            replies: CurrentReplies
                        });
                    
                        ReplyInput.value = "";

                        LoadFaxes(
                            undefined,
                            {
                                Scroll: FaxButton.offsetTop - FaxButton.offsetHeight
                            },
                            {
                                HighlightFax: {
                                    Title: Title,
                                    Author: Author,
                                    For: 250,
                                    Click: true
                                }
                            }
                        );
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
                    Fax.replies.forEach(async Reply => {
                        const ReplyContainer = document.createElement("div");
                        ReplyContainer.style.order = TimeAgo(Reply.timestamp, Math.floor(Date.now() / 1000), false);
                        RepliesContainer.appendChild(ReplyContainer);

                        const ReplyAuthor = document.createElement("div");
                        ReplyAuthor.innerHTML = `@${Reply.author} -`;
                        ReplyContainer.appendChild(ReplyAuthor);

                        const ReplyMessage = document.createElement("div");
                        ReplyMessage.innerHTML = `${Reply.message} -`;
                        ReplyContainer.appendChild(ReplyMessage);

                        const ReplyTimestamp = document.createElement("div");
                        ReplyTimestamp.innerHTML = `${TimeAgo(Reply.timestamp, Math.floor(Date.now() / 1000), true)} -`;
                        ReplyContainer.appendChild(ReplyTimestamp);

                        const DocData = JSON.parse(localStorage.getItem("USER"));

                        if (String(Reply.author).toLowerCase() === DocData.username) {
                            const RemoveReplyButton = document.createElement("div");
                            RemoveReplyButton.innerHTML = "Remove Reply";
                            RemoveReplyButton.classList.add("RemoveReplyButton", "RemoveBase");
                            ReplyContainer.appendChild(RemoveReplyButton);

                            RemoveReplyButton.addEventListener("click", async () => {
                                const FaxDocRef = doc(FaxesCollection, Fax.id);
                                const FaxDocSnapshot = await getDoc(FaxDocRef);

                                if (FaxDocSnapshot.exists()) {
                                    var CurrentReplies = FaxDocSnapshot.data().replies;
                                    CurrentReplies = [
                                        ...CurrentReplies.filter(
                                            (Element) =>
                                                Element.author !== Reply.author ||
                                                Element.message !== Reply.message ||
                                                Element.timestamp !== Reply.timestamp
                                        )
                                    ];
                                
                                    await updateDoc(FaxDocRef, {
                                        replies: CurrentReplies
                                    });

                                    LoadFaxes(undefined, {
                                        Scroll: FaxButton.offsetTop - FaxButton.offsetHeight,
                                    },
                                    {
                                        HighlightFax: {
                                            Title: Title,
                                            Author: Author,
                                            For: 250,
                                            Click: true
                                        }
                                    });
                                }
                            });
                        }
                    });
                } else {
                    const NoRepliesMessage = document.createElement("div");
                    NoRepliesMessage.innerHTML = "No replies yet.";
                    RepliesContainer.appendChild(NoRepliesMessage);
                }
                
                const DocData = await UserDocRef.data();
                var IsAuthor = Author === DocData.username;

                const AuthorDocQuery = query(UsersCollection, where("username", '==', Author));
                const QuerySnapshot = await getDocs(AuthorDocQuery);
                QuerySnapshot.forEach(async (Doc) => {
                    const Data = await Doc.data();
                    const ProfilePhotoURL = String(Data.pp).trim();
                    if (ProfilePhotoURL !== "") {
                        ProfilePhoto.src = ProfilePhotoURL;
                    }
                });

                if (!fax.AdminNames.includes(DocData.username)) {
                    AdminHTLabel.remove();
                }

                if (IsAuthor || fax.AdminNames.includes(DocData.username)) {
                    const EditButton = document.createElement("div");
                    EditButton.classList.add("EditButton");
                    EditButton.innerHTML = "Edit";
                    StatusBar.appendChild(EditButton);

                    const RemoveButton = document.createElement("div");
                    RemoveButton.classList.add("RemoveButton", "RemoveBase");
                    RemoveButton.innerHTML = "Remove";
                    StatusBar.appendChild(RemoveButton);

                    EditButton.addEventListener("click", () => {
                        ContentLabel.style.display = "none";
                        TitleLabel.style.display = "none";
                        
                        ContentEditInput.style.display = "";
                        ContentEditInput.value = Content;

                        TitleEditInput.style.display = "";
                        TitleEditInput.value = Title;

                        AbortEditButton.style.display = "";
                        ConfirmEditButton.style.display = "";

                        AbortEditButton.addEventListener("click", () => {
                            ContentEditInput.style.display = "none";
                            TitleEditInput.style.display = "none";
                            ConfirmEditButton.style.display = "none";
                            AbortEditButton.style.display = "none";

                            ContentLabel.style.display = "";
                            TitleLabel.style.display = "";
                        });

                        ConfirmEditButton.addEventListener("click", async () => {
                            const QuerySnapshot = await getDocs(query(FaxesCollection, where("author", "==", Fax.author), where("title", "==", Fax.title)));

                            QuerySnapshot.forEach(async (Doc) => {
                                const FaxDocRef = doc(FaxesCollection, Doc.id);
                                await updateDoc(FaxDocRef, {
                                    title: TitleEditInput.value,
                                    content: ContentEditInput.value
                                });

                                updateDoc(FaxDocRef, {
                                    editted: {
                                        timestamp: Math.floor(Date.now() / 1000),
                                        editted: true
                                    }
                                });

                                ContentEditInput.style.display = "none";
                                TitleEditInput.style.display = "none";
                                ConfirmEditButton.style.display = "none";

                                ContentLabel.style.display = "";
                                TitleLabel.style.display = "";
                            });

                            LoadFaxes(undefined, {
                                Scroll: FaxButton.offsetTop - FaxButton.offsetHeight,
                            },
                            {
                                HighlightFax: {
                                    Title: Title,
                                    Author: Author,
                                    For: 250,
                                    Click: true
                                }
                            });
                        });
                    });

                    RemoveButton.addEventListener("click", () => {
                        fax.MidCont({
                            Header: "Removing Post",
                            Content: "Are you sure that you want to delete this post?",
                            Accept: "Remove",
                            Refuse: "No, take me back."
                        }, async () => {
                            const QuerySnapshot = await getDocs(query(FaxesCollection, where("author", "==", Fax.author), where("title", "==", Fax.title)));

                            QuerySnapshot.forEach(async (Doc) => {
                                const FaxDocRef = doc(FaxesCollection, Doc.id);
                                await deleteDoc(FaxDocRef);
                            });
                    
                            LoadFaxes();
                        },
                        () => {return;},
                        true);
                    });
                }

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

                FaxButton.addEventListener("click", async function(Event) {
                    if (Event.target.offsetParent === StatusBar || Event.target === ContentEditInput || Event.target === LikeButton || Event.target === LikeCountLabel || Event.target === ReplyContainer || Event.target.tagName.toLowerCase() === "input" || Event.target.tagName.toLowerCase() === "button") return;

                    ContentLabel.style.visibility = getComputedStyle(ContentLabel).visibility === "visible" ? "hidden" : "visible";
                    ReplyContainer.style.visibility = getComputedStyle(ContentLabel).visibility !== "visible" ? "hidden" : "visible";
                    this.style.zIndex = "1";
                    this.style.height = getComputedStyle(ContentLabel).visibility === "visible" ? "72vh" : "26vh";

                    await setDoc(doc(Db, "faxes", Fax.id), {
                        views: Fax.views + 1
                    }, { merge: true });
                });

                Results++;
                ResultsLabel.innerHTML = `${Results} Results`;
            });
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
    }else if (FilterInput.value.startsWith("#")) {
        const Hashtags = FilterInput.value
            .replace("#", "")
            .split(",")
            .map(tag => tag.trim())
            .filter(tag => tag);
    
        LoadFaxes({
            OnlyLoadWithThisHashtags: Hashtags
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
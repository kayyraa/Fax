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
const PostsCollection = collection(Db, "faxes");

const PostsContainer = document.getElementById("FaxesContainer");
const FaxCreateButton = document.getElementById("FaxCreateButton");
const PostTitleInput = document.getElementById("FaxTitleInput");
const PosxtContentInput = document.getElementById("FaxContentInput");
const PostSubmitButton = document.getElementById("FaxSubmitButton");
const FilterButton = document.getElementById("FilterButton");
const FilterInput = document.getElementById("FilterInput");
const ResultsLabel = document.getElementById("ResultsLabel");
const AdminHTLabel = document.getElementById("AdminLabel");

function LoadPosts(
OnlyLoadOptions = {
    OnlyLoadWithThisAuthor: "",
    OnlyLoadWithTheseWords: [],
    OnlyLoadWithThisLikes: 0,
    OnlyLoadWithThisViews: 0,
},
PageOptions = {
    Scroll: 0,
    HLF: ""
}) {
    var Results = 0;
    ResultsLabel.innerHTML = `${Results} Results`;

    Array.from(PostsContainer.getElementsByTagName("div")).forEach(Fax => {
        if (Fax !== FaxCreateButton) {
            Fax.remove();
        }
    });

    (async () => {
        const Snapshot = await getDocs(PostsCollection);
        const Posts = await Snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (Posts.length > 0) {
            Posts.forEach(async Post => {
                console.log(`STREAM_GET_${Post.id}`);
                var Sub = false;

                const PostDocRef = await doc(PostsCollection, Post.id);
                const PostDocSnapshot = await getDoc(PostDocRef);

                const PostRef = doc(PostsCollection, Post.id);

                const UDR = await query(UsersCollection, await where("username", "==", JSON.parse(localStorage.getItem("USER")).username));
                const UQS = await getDocs(UDR);
                const UserDocRef = UQS.docs[0];

                if (fax.DebugMode) {
                    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
                    console.log(`fax.load.replies > ${Post.replies}`);
                    console.log(`fax.load.likes > ${Post.likes}`);
                    console.log(`fax.load.likedby > ${Post.likedBy}`);
                    console.log(`fax.load.editted > ${Post.editted}`);
                    console.log(`fax.load.author > ${Post.author}`);
                    console.log(`fax.load.title > ${Post.title}`);
                    console.log(`fax.load.content > ${Post.content}`);
                    console.log(`fax.load.timestamp > ${Post.timestamp}`);
                    console.log(Post);
                }

                if (PageOptions.Scroll) {
                    PostsContainer.scrollTop = PageOptions.Scroll;
                }

                if (OnlyLoadOptions.OnlyLoadWithThisAuthor) {
                    if (String(Post.author).toLowerCase() !== OnlyLoadOptions.OnlyLoadWithThisAuthor.toLowerCase().replace("@", "")) return;
                }

                if (OnlyLoadOptions.OnlyLoadWithTheseWords && OnlyLoadOptions.OnlyLoadWithTheseWords.length > 0) {
                    const IncludesInTitle = OnlyLoadOptions.OnlyLoadWithTheseWords.some(Character => Post.title.includes(Character));
                    const IncludesInContent = OnlyLoadOptions.OnlyLoadWithTheseWords.some(Character => Post.content.includes(Character));
                
                    if (!IncludesInTitle && !IncludesInContent) return;
                }

                if (OnlyLoadOptions.OnlyLoadWithThisLikes) {
                    if (Post.likes !== OnlyLoadOptions.OnlyLoadWithThisLikes) return;
                }

                if (OnlyLoadOptions.OnlyLoadWithThisViews) {
                    if (Post.views !== OnlyLoadOptions.OnlyLoadWithThisViews) return;
                }

                const Title = Post.title;
                const Content = Post.content;
                const Author = Post.author;

                const PostButton = document.createElement("div");
                PostButton.classList.add("FaxButton");
                PostsContainer.appendChild(PostButton);

                const ProfileContainer = document.createElement("div");
                ProfileContainer.classList.add("ProfileContainer");
                PostButton.appendChild(ProfileContainer);

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
                PostButton.appendChild(TitleLabel);

                const TitleEditInput = document.createElement("input");
                TitleEditInput.style.display = "none";
                PostButton.appendChild(TitleEditInput);

                const ContentEditInput = document.createElement("textarea");
                ContentEditInput.style.display = "none";
                ContentEditInput.style.height = "75vh";
                ContentEditInput.style.alignContent = "center";
                PostButton.appendChild(ContentEditInput);

                const ConfirmEditButton = document.createElement("button");
                ConfirmEditButton.style.display = "none";
                ConfirmEditButton.innerHTML = "Confirm Changes";
                PostButton.appendChild(ConfirmEditButton);

                const AbortEditButton = document.createElement("button");
                AbortEditButton.style.display = "none";
                AbortEditButton.innerHTML = "Abort Changes";
                AbortEditButton.style.color = "red";
                PostButton.appendChild(AbortEditButton);

                const ContentLabel = document.createElement("p");
                ContentLabel.classList.add("ContentLabel");
                PostButton.appendChild(ContentLabel);
                            
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
                
                    ContentLabel.appendChild(TextNode);
                }

                const StatusBar = document.createElement("div");
                StatusBar.classList.add("StatusBar");
                PostButton.appendChild(StatusBar);

                const ViewsContainer = document.createElement("div");
                StatusBar.appendChild(ViewsContainer);

                const ViewImage = document.createElement("img");
                ViewImage.src = "../images/Views.svg";
                ViewsContainer.appendChild(ViewImage);

                const ViewCountLabel = document.createElement("span");
                ViewCountLabel.innerHTML = Post.views;
                ViewsContainer.appendChild(ViewCountLabel);

                const LikeContainer = document.createElement("div");
                StatusBar.appendChild(LikeContainer);

                const LikeButton = document.createElement("img");
                LikeButton.src = "../images/NotLiked.svg";
                LikeContainer.appendChild(LikeButton);

                const LikeCountLabel = document.createElement("span");
                LikeCountLabel.innerHTML = Post.likes;
                LikeContainer.appendChild(LikeCountLabel);

                const RepliesStatusContainer = document.createElement("div");
                StatusBar.appendChild(RepliesStatusContainer);

                const ReplyIcon = document.createElement("img");
                ReplyIcon.src = "../images/Replies.svg";
                RepliesStatusContainer.appendChild(ReplyIcon);

                const ReplyCountLabel = document.createElement("span");
                ReplyCountLabel.innerHTML = Post.replies.length;
                RepliesStatusContainer.appendChild(ReplyCountLabel);

                const TimestampContainer = document.createElement("div");
                StatusBar.appendChild(TimestampContainer);

                const TimestampIcon = document.createElement("img");
                TimestampIcon.src = "../images/Timestamp.svg";
                TimestampContainer.appendChild(TimestampIcon);

                const TimestampLabel = document.createElement("span");
                TimestampContainer.appendChild(TimestampLabel);

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

                if (PageOptions.HLF) {
                    if (Post.content === PageOptions.HLF) {
                        PostButton.click();
                        var Event = document.createEvent('MouseEvents')
                        Event.initMouseEvent('mousedown', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                        PostButton.dispatchEvent(Event);
                    }
                }

                if (Post.editted.editted) {
                    const EditContainer = document.createElement("div");
                    StatusBar.appendChild(EditContainer);

                    const EditIcon = document.createElement("img");
                    EditIcon.src = "../images/Edit.svg";
                    EditContainer.appendChild(EditIcon);

                    const EditLabel = document.createElement("span");
                    EditLabel.innerHTML = TimeAgo(Post.editted.timestamp, Math.floor(Date.now() / 1000), true);
                    EditContainer.appendChild(EditLabel);
                }

                TimestampLabel.innerHTML = TimeAgo(Post.timestamp, Math.floor(Date.now() / 1000), true);

                PostButton.style.order = TimeAgo(Post.timestamp, Math.floor(Date.now() / 1000), false);

                const ReplyContainer = document.createElement("div");
                ReplyContainer.classList.add("ReplyContainer");
                PostButton.appendChild(ReplyContainer);

                const ReplyInput = document.createElement("input");
                ReplyInput.type = "text";
                ReplyInput.placeholder = "Reply with ....";
                ReplyContainer.appendChild(ReplyInput);

                const ReplyButton = document.createElement("button");
                ReplyButton.innerHTML = "Reply";
                ReplyButton.onclick = async () => {
                    const ReplyValue = ReplyInput.value;

                    if (!ReplyValue) return;

                    if (PostDocSnapshot.exists()) {
                        const CurrentReplies = PostDocSnapshot.data().replies || [];
                        CurrentReplies.push({
                            author: JSON.parse(localStorage.getItem("USER")).username,
                            message: ReplyValue,
                            timestamp: Math.floor(Date.now() / 1000)
                        });
                    
                        await updateDoc(PostDocRef, {
                            replies: CurrentReplies
                        });
                    
                        ReplyInput.value = "";

                        LoadPosts(
                            undefined,
                            {
                                Scroll: PostButton.offsetTop - PostButton.offsetHeight
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

                if (Post.replies.length > 0) {
                    Post.replies.forEach(async Reply => {
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
                                const PostDocRef = doc(PostsCollection, Post.id);
                                const PostDocSnapshot = await getDoc(PostDocRef);

                                if (PostDocSnapshot.exists()) {
                                    var CurrentReplies = PostDocSnapshot.data().replies;
                                    CurrentReplies = [
                                        ...CurrentReplies.filter(
                                            (Element) =>
                                                Element.author !== Reply.author ||
                                                Element.message !== Reply.message ||
                                                Element.timestamp !== Reply.timestamp
                                        )
                                    ];
                                
                                    await updateDoc(PostDocRef, {
                                        replies: CurrentReplies
                                    });

                                    LoadPosts(undefined, {
                                        Scroll: PostButton.offsetTop - PostButton.offsetHeight,
                                    }
                                    );
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

                    if (IsAuthor) {
                        onSnapshot(PostRef, (Snapshot) => {
                            const Data = Snapshot.data();
                    
                            if (Sub === true) {
                                console.log(`Post ID: ${Post.id}, Likes: ${Data.likes}`);
                            } else {
                                Sub = true;
                            }
                        });
                    }

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
                            const QuerySnapshot = await getDocs(query(PostsCollection, where("author", "==", Post.author), where("title", "==", Post.title)));

                            QuerySnapshot.forEach(async (Doc) => {
                                const PostDocRef = doc(PostsCollection, Doc.id);
                                await updateDoc(PostDocRef, {
                                    title: TitleEditInput.value,
                                    content: ContentEditInput.value
                                });

                                updateDoc(PostDocRef, {
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

                            LoadPosts(undefined, {
                                Scroll: PostButton.offsetTop - PostButton.offsetHeight,
                            }
                            );
                        });
                    });

                    RemoveButton.addEventListener("click", () => {
                        fax.MidCont({
                            Header: "Removing Post",
                            Content: "Are you sure that you want to delete this post?",
                            Accept: "Remove",
                            Refuse: "No, take me back."
                        }, async () => {
                            const QuerySnapshot = await getDocs(query(PostsCollection, where("author", "==", Post.author), where("title", "==", Post.title)));

                            QuerySnapshot.forEach(async (Doc) => {
                                const PostDocRef = doc(PostsCollection, Doc.id);
                                await deleteDoc(PostDocRef);
                            });
                    
                            LoadPosts();
                        },
                        () => {return;},
                        true);
                    });
                }

                if (Array.from(Post.likedBy).includes(DocData.username)) {
                    LikeButton.src = "../images/Liked.svg";
                    LikeButton.addEventListener("mouseleave", function() {
                        LikeButton.src = "../images/Liked.svg"
                    });
                    LikeButton.addEventListener("mouseenter", () => {
                        LikeButton.src = "../images/NotLiked.svg"
                    });
                } else {
                    LikeButton.src = "../images/NotLiked.svg";
                    LikeButton.addEventListener("mouseleave", function() {
                        LikeButton.src = "../images/NotLiked.svg"
                    });
                    LikeButton.addEventListener("mouseenter", () => {
                        LikeButton.src = "../images/Liked.svg"
                    });
                }
                LikeButton.addEventListener("click", async () => {
                    if (!Array.from(Post.likedBy).includes(DocData.username)) {
                        const UpdatedLikedBy = [...Post.likedBy, DocData.username];
                        await updateDoc(PostRef, {
                            likes: Post.likes + 1,
                            likedBy: UpdatedLikedBy
                        }, { merge: true });
                        LikeButton.src = "../images/Liked.svg"
                    } else {
                        const UpdatedLikedBy = Post.likedBy.filter(user => user !== DocData.username);
                        await updateDoc(PostRef, {
                            likes: Post.likes - 1,
                            likedBy: UpdatedLikedBy
                        }, { merge: true });
                        LikeButton.src = "../images/NotLiked.svg"
                    }

                    LoadPosts(
                        undefined,
                        {
                            Scroll: PostButton.offsetTop - PostButton.offsetHeight,
                            HLF: Post.content
                        }
                    );
                });

                PostButton.addEventListener("click", async function(Event) {
                    if (Event.target.offsetParent === StatusBar || Event.target === ContentEditInput || Event.target === LikeButton || Event.target === LikeCountLabel || Event.target === ReplyContainer || Event.target.tagName.toLowerCase() === "input" || Event.target.tagName.toLowerCase() === "button") return;

                    ContentLabel.style.visibility = getComputedStyle(ContentLabel).visibility === "visible" ? "hidden" : "visible";
                    ReplyContainer.style.visibility = getComputedStyle(ContentLabel).visibility !== "visible" ? "hidden" : "visible";
                    this.style.zIndex = "1";
                    this.style.height = getComputedStyle(ContentLabel).visibility === "visible" ? "72vh" : "26vh";

                    await updateDoc(PostRef, {
                        views: Post.views + 1
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
        LoadPosts({
            OnlyLoadWithThisViews: parseInt(FilterInput.value.replace("views: ", ""))
        });
    } else if (FilterInput.value.startsWith("likes: ")) {
        LoadPosts({
            OnlyLoadWithThisLikes: parseInt(FilterInput.value.replace("likes: ", ""))
        });
    } else if (FilterInput.value.startsWith("author: ")) {
        LoadPosts({
            OnlyLoadWithThisAuthor: FilterInput.value.replace("author: ", "")
        });  
    } else {
        LoadPosts({
            OnlyLoadWithTheseWords: FilterInput.value.split(", ")
        });
    }
}

PostSubmitButton.addEventListener("click", async () => {
    const IP = fax.GetUUID();

    const UserDocRef = doc(UsersCollection, IP);
    const DocSnapshot = await getDoc(UserDocRef);

    if (!DocSnapshot.exists()) return;

    const Title = PostTitleInput.value;
    const Content = PosxtContentInput.value;

    if (!Title || !Content) return;

    await fax.CreateFax(Title, Content, DocSnapshot.data().username);
    PostTitleInput.value = "";
    PosxtContentInput.value = "";
    LoadPosts();
});

FilterButton.addEventListener("click", () => {
    Filter();
});

FilterInput.addEventListener("keypress", (Event) => {
    if (Event.key === "Enter") {
        Filter();
    }
});

document.addEventListener("DOMContentLoaded", LoadPosts);
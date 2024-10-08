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

async function LoadPosts(
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

    const UDR = await query(UsersCollection, where("username", "==", JSON.parse(localStorage.getItem("USER")).username));
    const UQS = await getDocs(UDR);
    const UserDocRef = UQS.docs[0];

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
                var Sub = false;

                const UserData = UserDocRef.data();

                const AuthorQuery = query(UsersCollection, where("username", "==", Post.author));
                const AuthorQuerySnapshot = await getDocs(AuthorQuery);
                const AuthorDocument = AuthorQuerySnapshot.docs[0];
                const AuthorDocumentData = AuthorDocument.data();

                const Author = {
                    Username: Post.author,
                    Bio: AuthorDocumentData.bio,
                    ProfilePhoto: AuthorDocumentData.pp
                };

                const PostDocRef = await doc(PostsCollection, Post.id);
                const PostDocSnapshot = await getDoc(PostDocRef);
                const PostRef = doc(PostsCollection, Post.id);

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
                    console.log(`fax.load.id > ${Post.id}`);
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

                const PostButton = document.createElement("div");
                PostButton.classList.add("FaxButton");
                PostsContainer.appendChild(PostButton);

                const ProfileContainer = document.createElement("div");
                ProfileContainer.classList.add("ProfileContainer");
                PostButton.appendChild(ProfileContainer);

                const ProfilePhoto = document.createElement("img");
                ProfilePhoto.classList.add("FaxButtonProfilePhoto");
                ProfilePhoto.src = Author.ProfilePhoto;
                ProfileContainer.appendChild(ProfilePhoto); 

                const CreatorLabel = document.createElement("span");
                CreatorLabel.innerHTML = `@${Author.Username}`;
                CreatorLabel.classList.add("FaxButtonCreatorLabel");
                ProfileContainer.appendChild(CreatorLabel);

                const AdminLabel = document.createElement("span");
                AdminLabel.innerHTML = `${fax.AdminNames.includes(Author.Username) ? "Admin" : ""}`;
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
                fax.FilterKeywords(Words, ContentLabel);

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
                    EditLabel.innerHTML = fax.TimeAgo(Post.editted.timestamp, Math.floor(Date.now() / 1000), true);
                    EditContainer.appendChild(EditLabel);
                }

                TimestampLabel.innerHTML = fax.TimeAgo(Post.timestamp, Math.floor(Date.now() / 1000), true);

                PostButton.style.order = fax.TimeAgo(Post.timestamp, Math.floor(Date.now() / 1000), false);

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
                        ReplyContainer.style.order = fax.TimeAgo(Reply.timestamp, Math.floor(Date.now() / 1000), false);
                        RepliesContainer.appendChild(ReplyContainer);

                        const ReplyAuthor = document.createElement("div");
                        ReplyAuthor.innerHTML = `@${Reply.author} -`;
                        ReplyContainer.appendChild(ReplyAuthor);

                        const ReplyMessage = document.createElement("div");
                        ReplyMessage.innerHTML = `${Reply.message} -`;
                        ReplyContainer.appendChild(ReplyMessage);

                        const ReplyTimestamp = document.createElement("div");
                        ReplyTimestamp.innerHTML = `${fax.TimeAgo(Reply.timestamp, Math.floor(Date.now() / 1000), true)} -`;
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
                var IsAuthor = Author.Username === DocData.username;

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
                        var PreviousLikes = Post.likes;
                        var PreviousRepliesLength = Post.replies.length;

                        onSnapshot(PostRef, async (Snapshot) => {
                            const Data = Snapshot.data();
                        
                            if (Sub === true) {
                                var CurrentNotifications = AuthorDocumentData.notifications || [];
                            
                                if (Data.likes !== PreviousLikes && Data.likes > PreviousLikes) {
                                    CurrentNotifications.push({
                                        type: "Like",
                                        timestamp: Math.floor(Date.now() / 1000),
                                        content: `Your post "${Title.substring(0, 10)}" now has ${Data.likes} like${Data.likes > 1 ? "s" : ""}.`,
                                        post: Post.id
                                    });
                                    await updateDoc(AuthorDocument.ref, {
                                        notifications: CurrentNotifications
                                    });
                                
                                    PreviousLikes = Data.likes;
                                }
                            
                                if (Data.replies.length !== PreviousRepliesLength) {
                                    const LatestReply = Data.replies[Data.replies.length - 1];
                                    
                                    if (LatestReply.author === Author) return;
                                    
                                    CurrentNotifications.push({
                                        type: "Comment",
                                        timestamp: Math.floor(Date.now() / 1000),
                                        content: `@${LatestReply.author} commented on your post: "${LatestReply.message}".`,
                                        post: Post.id
                                    });
                                    await updateDoc(AuthorDocument.ref, {
                                        notifications: CurrentNotifications
                                    });
                                
                                    PreviousRepliesLength = Data.replies.length;
                                }
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
    const Title = PostTitleInput.value;
    const Content = PosxtContentInput.value;

    if (!Title || !Content) return;

    await fax.CreateFax(Title, Content, JSON.parse(localStorage.getItem("USER")).username);
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
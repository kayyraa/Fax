import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js";
import { getFirestore, collection, getDocs, deleteDoc, updateDoc, arrayUnion, query, where } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
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

const PostCollection = collection(Db, "faxes");
const UsersCollection = collection(Db, "users");

const Topbar = document.getElementById("Topbar");
const PostsContainer = document.getElementById("FaxesContainer");
const UsernameLabel = document.getElementById("UsernameLabel");
const ProfileContainer = document.getElementById("Profile");
const ProfileUsernameLabel = document.getElementById("ProfileUsernameLabel");
const ProfileLikesLabel = document.getElementById("ProfileLikesLabel");
const ProfileViewsLabel = document.getElementById("ProfileViewsLabel");
const ProfilePostsLabel = document.getElementById("ProfilePostsLabel");
const ProfileTimestampLabel = document.getElementById("ProfileTimestampLabel");
const ProfileImageLabel = document.getElementById("ProfileImageLabel");
const ProfileBioLabel = document.getElementById("ProfileBioLabel");
const NotificationCenter = document.getElementById("NotificationCenter");

const PostContentInput = document.getElementById("FaxContentInput");
const ProfileImageInput = document.getElementById("ProfileImageInput");
const ProfileBioInput = document.getElementById("ProfileBioInput");

const NotificationsButton = document.getElementById("NotificationsButton");
const ProfileBioSaveButton = document.getElementById("ProfileBioSaveButton");
const ProfilePhotoSaveButton = document.getElementById("ProfilePhotoSaveButton");
const ProfileRemoveAccountButton = document.getElementById("ProfileRemoveAccountButton");

var Focus = {
    ProfileImage: false
};

var Toggle = false;
var UserFaxes = 0;
var UserLikes = 0;
var UserViews = 0;

function FormatDate(Epoch) {
    const DateObj = new Date(Epoch * 1000);
    const Day = String(DateObj.getDate()).padStart(2, '0');
    const Month = String(DateObj.getMonth() + 1).padStart(2, '0');
    const Year = DateObj.getFullYear();
    const Hours = String(DateObj.getHours()).padStart(2, '0');
    const Minutes = String(DateObj.getMinutes()).padStart(2, '0');
    
    return `${Day}.${Month}.${Year} ${Hours}:${Minutes}`;
}

async function ProfileInit() {
    UserFaxes = 0;
    UserLikes = 0;
    UserViews = 0;

    if (JSON.parse(localStorage.getItem("USER"))) {
        Toggle = !Toggle;

        ProfileUsernameLabel.textContent = `@${JSON.parse(localStorage.getItem("USER")).username}`;
        Topbar.style.top = Toggle ? "-10%" : "0";
        PostsContainer.style.visibility = Toggle ? "hidden" : "visible";
        ProfileContainer.style.visibility = !Toggle ? "hidden" : "visible";

        const Faxes = await getDocs(PostCollection);
        Faxes.forEach((Fax) => {
            if (Fax.data().author === JSON.parse(localStorage.getItem("USER")).username) {
                UserFaxes++;
                UserLikes += Fax.data().likes;
                UserViews += Fax.data().views;
            }
        });

        const UserData = JSON.parse(localStorage.getItem("USER"));
        if (UserData.pp !== "") {
            ProfileImageLabel.src = UserData.pp;
        }

        ProfilePostsLabel.innerHTML = `${UserFaxes} Post${UserFaxes > 1 ? "s" : ""}`;
        ProfileLikesLabel.innerHTML = `${UserLikes} Like${UserLikes > 1 ? "s" : ""}`;
        ProfileViewsLabel.innerHTML = `${UserViews} View${UserViews > 1 ? "s" : ""}`;
        ProfileTimestampLabel.innerHTML = FormatDate(window.userdata.register);

        const Username = JSON.parse(localStorage.getItem("USER")).username;
        const UDR = query(UsersCollection, where("username", "==", Username));
        const UQS = await getDocs(UDR);

        const UserDocSnap = UQS.docs[0];
        const UserDocData = UserDocSnap.data();
        const UserBio = UserDocData.bio;

        ProfileBioLabel.innerHTML = UserBio;
        ProfileBioInput.value = UserBio;

        if (UserDocData.growth) {
            if ((Math.floor(Date.now() / 1000) - UserDocData.growth.lastCheck) > (5 * 60)) {
                await updateDoc(UQS.docs[0].ref, {
                    growth: {
                        data: [...UserDocData.growth.data, UserViews],
                        time: [...UserDocData.growth.time, Math.floor(Date.now() / 1000)],
                        lastCheck: Math.floor(Date.now() / 1000)
                    }
                });
                location.reload();
            }

            const FilteredData = UserDocData.growth.data;
            const FilteredTime = UserDocData.growth.time;

            const DayNames = FilteredTime.map(timestamp => FormatDate(timestamp));
            
            const ProfileGrowthChart = document.getElementById("ProfileGrowthChart").getContext('2d');
            const FollowerGrowthChart = new Chart(ProfileGrowthChart, {
                type: 'line',
                data: {
                    labels: DayNames,
                    datasets: [{
                        data: FilteredData,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 2,
                        fill: true
                    }]
                },
                options: {
                    responsive: false,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 0
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    const value = context.raw;
                                    return `${value} Views`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            display: false
                        },
                        y: {
                            display: true
                        }
                    }
                }
            });
        } else {
            console.log(arrayUnion(UserViews));
            await updateDoc(UQS.docs[0].ref, {
                growth: {
                    data: arrayUnion(UserViews),
                    time: arrayUnion(Math.floor(Date.now() / 1000)),
                    lastCheck: 0
                }
            });
            location.reload();
        }
    }
}

UsernameLabel.addEventListener("click", ProfileInit);

ProfileRemoveAccountButton.addEventListener("click", async () => {
    const UserQuery = query(UsersCollection, where("username", "==", JSON.parse(localStorage.getItem("USER")).username));
    const QuerySnapshot = await getDocs(UserQuery);
    if (!QuerySnapshot.empty) {
        const UserDocRef = QuerySnapshot.docs[0].ref;
        await deleteDoc(UserDocRef);
        localStorage.removeItem("USER");
        window.location.reload();
    }
});

ProfilePhotoSaveButton.addEventListener("click", async () => {
    const ProfilePhotoImage = ProfileImageInput.files[0];

    if (ProfilePhotoImage) {
        const StorageRef = ref(Storage, `uploads/${ProfilePhotoImage.name}`);

        ProfilePhotoSaveButton.innerHTML = "Uploading Image";
        ProfilePhotoSaveButton.disabled = true;

        try {
            await uploadBytes(StorageRef, ProfilePhotoImage);
            const URLString = await getDownloadURL(StorageRef);

            const UserQuery = query(UsersCollection, where("username", "==", JSON.parse(localStorage.getItem("USER")).username));
            const QuerySnapshot = await getDocs(UserQuery);
            if (!QuerySnapshot.empty) {
                const UserDocRef = QuerySnapshot.docs[0].ref;

                await updateDoc(UserDocRef, {
                    pp: URLString
                });

                const UserData = JSON.parse(localStorage.getItem("USER"));
                UserData.pp = URLString;
                localStorage.setItem("USER", JSON.stringify(UserData));
                ProfileImageLabel.src = URLString;
            }
            ProfilePhotoSaveButton.innerHTML = "Save Photo";
            ProfilePhotoSaveButton.disabled = false;
        } catch (Error) {
            console.error('Upload failed:', Error);
            ProfilePhotoSaveButton.innerHTML = "Save Photo";
            ProfilePhotoSaveButton.disabled = false;
        }
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

ProfileBioSaveButton.addEventListener("click", async () => {
    const Username = JSON.parse(localStorage.getItem("USER")).username;
    const UDR = query(UsersCollection, where("username", "==", Username));
    const UQS = await getDocs(UDR);

    const UserDocSnap = UQS.docs[0];
    const NewBio = ProfileBioInput.value;

    await updateDoc(UserDocSnap.ref, {
        bio: NewBio
    });

    const UserData = UserDocSnap.data();
    UserData.bio = NewBio;
    localStorage.setItem("USER", JSON.stringify(UserData));

    location.reload();
});

PostContentInput.addEventListener("input", () => {
    const Content = PostContentInput.value;
    if (Content === "") {
        PostContentInput.style.height = "";
    } else {
        PostContentInput.style.height = "auto";
        PostContentInput.style.height = `${PostContentInput.scrollHeight / 2}vh`;
    }
});

PostContentInput.addEventListener("change", () => {
    const Content = PostContentInput.value;
    if (Content === "") {
        PostContentInput.style.height = "";
    } else {
        PostContentInput.style.height = "auto";
        PostContentInput.style.height = `${PostContentInput.scrollHeight / 2}vh`;
    }
});

async function LoadNotifications(Event) {
    Array.from(NotificationCenter.getElementsByTagName("div")).forEach(Notification => {
        Notification.remove();
    });

    const UDR = query(UsersCollection, where("username", "==", JSON.parse(localStorage.getItem("USER")).username));
    const UQS = await getDocs(UDR);

    const UserDocSnap = UQS.docs[0];
    const UserData = UserDocSnap.data();

    const Notifications = UserData.notifications || [];

    if (Event) {
        if (Notifications.length > 0) {
            Notifications.forEach(Notification => {
                const NotificationDiv = document.createElement("div");
                NotificationCenter.appendChild(NotificationDiv);

                const NotificationContent = document.createElement("div");
                NotificationContent.innerHTML = Notification.content;
                NotificationDiv.appendChild(NotificationContent);

                const Vr = document.createElement("vr");
                NotificationDiv.appendChild(Vr);

                const NotificationTimestamp = document.createElement("div");
                NotificationTimestamp.innerHTML = fax.TimeAgo(Notification.timestamp, Math.floor(Date.now() / 1000), true);
                NotificationDiv.appendChild(NotificationTimestamp);

                const NotificationRemoveButton = document.createElement("img");
                NotificationRemoveButton.src = "../images/Remove.svg";
                NotificationRemoveButton.onclick = async () => {
                    await updateDoc(UserDocSnap.ref, {
                        notifications: Notifications.filter(n => n.content !== Notification.content)
                    });
                    NotificationDiv.remove();
                    LoadNotifications();
                };
                NotificationDiv.appendChild(NotificationRemoveButton);
            });
        } else {
            const NotificationDiv = document.createElement("div");
            NotificationDiv.innerHTML = "All caught up!";
            NotificationDiv.classList.add("ACU");
            NotificationCenter.appendChild(NotificationDiv);
        }
    } else {

    }
}

LoadNotifications();
NotificationsButton.addEventListener("click", (Event) => {
    LoadNotifications(Event);
});
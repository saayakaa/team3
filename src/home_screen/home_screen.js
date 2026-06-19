// ==========================================
// Firebaseからタスクを取得して表示する処理
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc,            
  updateDoc    
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDvZoWqjJWz31p8VkL7PkFnWAJaFfNTrgo",
  authDomain: "fire-ositask-kadai.firebaseapp.com",
  projectId: "fire-ositask-kadai",
  storageBucket: "fire-ositask-kadai.firebasestorage.app",
  messagingSenderId: "768957795601",
  appId: "1:768957795601:web:4822650f67df18c8d710b0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const taskArea = document.getElementById("taskArea");
const imageInput = document.getElementById("imageInput");
const oshiImage = document.getElementById("oshiImage");
const levelEl = document.getElementById("level");
const expFillEl = document.getElementById("expFill");

// 画像アップロード
imageInput.addEventListener("change", function () {
    const file = imageInput.files[0];
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);
    oshiImage.src = imageUrl;
});

// レベルと経験値処理
let currentLevel = parseInt(localStorage.getItem("oshi_level")) || 1;
let currentExp = parseInt(localStorage.getItem("oshi_exp")) || 0;

function updateLevelDOM() {
    levelEl.textContent = `Lv.${currentLevel}`;
    expFillEl.style.width = `${currentExp}%`;
}

function gainExp(amount) {
    currentExp += amount;
    if (currentExp >= 100) {
        currentLevel += 1;
        currentExp = currentExp - 100;
        alert(`🎉 レベルアップ！ Lv.${currentLevel} になりました！`);
    }
    localStorage.setItem("oshi_level", currentLevel);
    localStorage.setItem("oshi_exp", currentExp);
    updateLevelDOM();
}

updateLevelDOM();

// Firestoreのパスを生成する共通関数
function getTaskCollection(user) {
    return collection(db, "users", user.uid, "kadai1");
}

// タスク完了処理
async function completeTask(user, id) {
    try {
        const taskRef = doc(db, "users", user.uid, "kadai1", id);
        await updateDoc(taskRef, {
            done: true
        });
        gainExp(20);
    } catch (e) {
        console.error("タスクの完了処理に失敗しました:", e);
    }
}

// Firestoreリスナー
function startFirestoreListener(user) {
    const q = query(getTaskCollection(user), orderBy("created", "desc"));

    onSnapshot(q, (snapshot) => {
        taskArea.innerHTML = "";
        const ul = document.createElement("ul");
        ul.className = "home-task-list";

        snapshot.forEach((docSnap) => {
            const t = docSnap.data();
            const docId = docSnap.id;

            if (t.done === false) {
                const li = document.createElement("li");
                li.className = "home-task-item";

                const checkBtn = document.createElement("button");
                checkBtn.className = "home-check-btn";
                checkBtn.onclick = () => {
                    completeTask(user, docId);
                };

                const contentDiv = document.createElement("div");
                contentDiv.className = "home-task-content";

                const displayTitle = t.title || t.kadai || '無題のタスク';
                const titleSpan = document.createElement("span");
                titleSpan.className = "home-task-title";
                titleSpan.textContent = displayTitle;

                const dateSpan = document.createElement("span");
                dateSpan.className = "home-task-date";
                dateSpan.textContent = t.due ? `📅 ${t.due}` : "";

                contentDiv.appendChild(titleSpan);
                contentDiv.appendChild(dateSpan);
                li.appendChild(checkBtn);
                li.appendChild(contentDiv);
                ul.appendChild(li);
            }
        });

        if (ul.childElementCount === 0) {
            taskArea.innerHTML = `<div class="no-task">完了！推しが褒めてるよ！</div>`;
        } else {
            taskArea.appendChild(ul);
        }
    }, (error) => {
        console.error("データ取得エラー:", error);
        taskArea.innerHTML = `<div class="no-task">データの読み込みに失敗しました</div>`;
    });
}

// 認証チェック
onAuthStateChanged(auth, (user) => {
    if (user) {
        startFirestoreListener(user);
    } else {
        window.location.href = "../login_screen/index.html";
    }
});

// 画面遷移
const editButton = document.querySelector(".function_button button:nth-child(1)");
if (editButton) {
    editButton.onclick = (e) => {
        e.preventDefault();
        window.location.href = "../assignment_register_screen/index.html"; 
    };
}

// ==========================================
// 追加：Firebaseからタスクを取得して表示する処理
// ==========================================

// 1. Firebaseの必要な機能をインポート
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

// 2. Firebaseの初期化設定（課題入力側と同じConfig）
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

// HTML要素の取得
const taskArea = document.getElementById("taskArea");
const imageInput = document.getElementById("imageInput");
const oshiImage = document.getElementById("oshiImage");
const levelEl = document.getElementById("level");     // 👈 追加
const expFillEl = document.getElementById("expFill"); // 👈 追加

// ==========================================
// 画像アップロード処理（既存機能）
// ==========================================
imageInput.addEventListener("change", function () {
    const file = imageInput.files[0];
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);
    oshiImage.src = imageUrl;
});

// ==========================================
// データの管理（LocalStorage）とレベルアップ処理
// ==========================================
// ページを開いたときに保存されたレベルと経験値を読み込む（なければLv.1, EXP:0）
let currentLevel = parseInt(localStorage.getItem("oshi_level")) || 1;
let currentExp = parseInt(localStorage.getItem("oshi_exp")) || 0;

// 画面に現在のレベルとゲージを反映する関数
function updateLevelDOM() {
    levelEl.textContent = `Lv.${currentLevel}`;
    expFillEl.style.width = `${currentExp}%`; // 経験値の数値をそのままゲージの「%」にする
}

// 経験値を獲得する関数
function gainExp(amount) {
    currentExp += amount;

    // 経験値が 100 以上になったらレベルアップ！
    if (currentExp >= 100) {
        currentLevel += 1;
        currentExp = currentExp - 100; // 100を超えて溢れた分の経験値を次回に繰り越し
        alert(`🎉 レベルアップ！ Lv.${currentLevel} になりました！`);
    }

    // 新しい状態をブラウザに保存（これで画面を閉じても消えない）
    localStorage.setItem("oshi_level", currentLevel);
    localStorage.setItem("oshi_exp", currentExp);

    // 表示を更新
    updateLevelDOM();
}

// 画面起動時に一度表示を最新にする
updateLevelDOM();

// ==========================================
// ⭕ 修正：Firestoreのタスクを完了にして、経験値を獲得する
// ==========================================
async function completeTask(id) {
    try {
        const taskRef = doc(db, "kadai1", id);
        await updateDoc(taskRef, {
            done: true
        });
        
        // 🛠️ タスクのデータ更新に成功したら経験値を 20 獲得！
        gainExp(20);

    } catch (e) {
        console.error("タスクの完了処理に失敗しました:", e);
    }
}

// ==========================================
// Firestoreから未完了タスクを取得して表示
// ==========================================
// 作成日時（created）が新しい順にデータを監視するクエリ
const q = query(collection(db, "kadai1"), orderBy("created", "desc"));

function startFirestoreListener() {
    const q = query(collection(db, "kadai1"), orderBy("created", "desc"));

    onSnapshot(q, (snapshot) => {
        // 表示エリアをクリア
        taskArea.innerHTML = "";
        
        // リストの入れ物（ul）を作成
        const ul = document.createElement("ul");
        ul.className = "home-task-list";

        snapshot.forEach((docSnap) => {
            const t = docSnap.data();
            const docId = docSnap.id;   // ドキュメントのIDを取得

            // 未完了（done === false）のタスクだけをピックアップ
            if (t.done === false) {
                const li = document.createElement("li");
                li.className = "home-task-item";

            // チェック用の丸ボタンを作る
                const checkBtn = document.createElement("button");
                checkBtn.className = "home-check-btn";
                checkBtn.innerHTML = ""; 
                checkBtn.onclick = () => {
                    completeTask(docId); // クリックで完了関数を実行！
                };

            // 文字エリアのコンテナ
                const contentDiv = document.createElement("div");
                contentDiv.className = "home-task-content";

                // タスク名の決定（入力側のロジックに合わせて title か kadai を使用）
                const displayTitle = t.title || t.kadai || '無題のタスク';

                // 左側：タスク名
                const titleSpan = document.createElement("span");
                titleSpan.className = "home-task-title";
                titleSpan.textContent = displayTitle;

                // 右側：期限（入力側が due なので t.due に修正）
                const dateSpan = document.createElement("span");
                dateSpan.className = "home-task-date";
                dateSpan.textContent = t.due ? `📅 ${t.due}` : "";

                contentDiv.appendChild(titleSpan); // コンテナにタスク名を入れる
                contentDiv.appendChild(dateSpan);  // コンテナに期限を入れる

                li.appendChild(checkBtn);   // 1. まず左側にチェックボタンを追加！
                li.appendChild(contentDiv); // 2. 次に右側に文字コンテナを追加！
                ul.appendChild(li);
            }
        });

        // 未完了タスクがゼロだった場合の表示
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

onAuthStateChanged(auth, (user) => {
    if (user) {
        startFirestoreListener();
    } else {
        window.location.href = "../login_screen/index.html";
    }
});


// ==========================================
// ボタンを押したら画面を遷移する処理
// ==========================================

// 1. ✏️ボタン（function_button の中にある1番目のボタン）を取得
// ==========================================
// ボタンを押したら画面を遷移する処理
// ==========================================
const editButton = document.querySelector(".function_button button:nth-child(1)");

if (editButton) {
    editButton.onclick = (e) => {
        e.preventDefault(); // ボタン本来の挙動（フォーム送信など）を念のため止める
        window.location.href = "../assignment_register_screen/index.html"; 
    };
}

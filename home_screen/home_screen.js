/*
//firebaseとの接続
initializeApp()
getFirestore()

// kadai1から取得
const q = query(
    collection(db, "kadai1"),
    orderBy("created", "desc")
);

// 未完了だけ取得
t.done === false
*/

// ==========================================
// 追加：Firebaseからタスクを取得して表示する処理
// ==========================================

// 1. Firebaseの必要な機能をインポート
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
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
const db = getFirestore(app);

// HTML要素の取得
const taskArea = document.getElementById("taskArea");
const imageInput = document.getElementById("imageInput");
const oshiImage = document.getElementById("oshiImage");

// ==========================================
// A. 画像アップロード処理（既存機能）
// ==========================================
imageInput.addEventListener("change", function () {
    const file = imageInput.files[0];
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);
    oshiImage.src = imageUrl;
});

// ==========================================
// ⭕ 追加：Firestoreのタスクを完了にする関数
// ==========================================
async function completeTask(id) {
    try {
        const taskRef = doc(db, "kadai1", id);
        await updateDoc(taskRef, {
            done: true
        });
    } catch (e) {
        console.error("タスクの完了処理に失敗しました:", e);
    }
}

// ==========================================
// B. Firestoreから未完了タスクを取得して表示
// ==========================================
// 作成日時（created）が新しい順にデータを監視するクエリ
const q = query(collection(db, "kadai1"), orderBy("created", "desc"));

// リアルタイムでデータを監視（onSnapshot）
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


// ==========================================
// C. ボタンを押したら画面を遷移する処理
// ==========================================

// 1. ✏️ボタン（function_button の中にある1番目のボタン）を取得
// ==========================================
// C. ボタンを押したら画面を遷移する処理（改良版）
// ==========================================
const editButton = document.querySelector(".function_button button:nth-child(1)");

if (editButton) {
    editButton.onclick = (e) => {
        e.preventDefault(); // ボタン本来の挙動（フォーム送信など）を念のため止める
        // 💡 課題入力画面のHTMLファイル名に合わせて変更してください
        window.location.href = "../src/assignment_register_screen/index.html"; 
    };
}

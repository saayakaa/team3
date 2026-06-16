// 1. Firebaseの必要な機能をインポート（Viteで100%動くURLに修正しました）
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 2. だんごさんのプロジェクトの正しい住所
const firebaseConfig = {
  apiKey: "AIzaSyDvZoWqjJWz31p8VkL7PkFnWAJaFfNTrgo",
  authDomain: "fire-ositask-kadai.firebaseapp.com",
  projectId: "fire-ositask-kadai",
  storageBucket: "fire-ositask-kadai.firebasestorage.app",
  messagingSenderId: "768957795601",
  appId: "1:768957795601:web:ada47d8533ff44e0d710b0",
  measurementId: "G-C6NF6SJT5Z"
};

// 3. FirebaseとFirestoreの初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 4. 画面の要素を捕まえる
const taskForm = document.getElementById("task-form");
const taskList = document.getElementById("task-list");

// 5. 【送信処理】追加ボタンが押されたときの動き
taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const due = document.getElementById("due").value;
  const priority = document.getElementById("priority").value;

  try {
    // Firestoreの「tasks」という場所にデータを送る
    await addDoc(collection(db, "tasks"), {
      title: title,
      description: description,
      due: due,
      priority: priority,
      createdAt: new Date()
    });

    alert("タスクを追加しました！");
    taskForm.reset();
    loadTasks(); // 一覧を再読み込み
  } catch (error) {
    console.error("エラーが出ました:", error);
    alert("送信に失敗しました。");
  }
});

// 6. 【読み込み処理】データを画面に表示する動き
async function loadTasks() {
  if (!taskList) return;
  taskList.innerHTML = ""; // 一度リセット
  try {
    const querySnapshot = await getDocs(collection(db, "tasks"));
    querySnapshot.forEach((doc) => {
      const task = doc.data();
      const li = document.createElement("li");
      li.textContent = `【${task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}】${task.title} (期日: ${task.due})`;
      taskList.appendChild(li);
    });
  } catch (error) {
    console.error("読み込みエラー:", error);
  }
}

// 最初にページを開いたときにも一覧を表示する
loadTasks();
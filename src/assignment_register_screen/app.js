// 1. Firebaseの必要な機能をインポート
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  deleteDoc, 
  updateDoc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 2. Firebaseの初期化設定 (★ご自身のConfigに置き換えてください)
const firebaseConfig = {
  apiKey: "AIzaSyDvZoWqjJWz31p8VkL7PkFnWAJaFfNTrgo",
  authDomain: "fire-ositask-kadai.firebaseapp.com",
  projectId: "fire-ositask-kadai", // 👈 あなたのプロジェクトID
  storageBucket: "fire-ositask-kadai.firebasestorage.app",
  messagingSenderId: "768957795601",
  appId: "1:768957795601:web:4822650f67df18c8d710b0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// HTML要素の取得
const form = document.getElementById('task-form');
const listEl = document.getElementById('task-list');
const clearBtn = document.getElementById('clear');

// 3. データをFirestoreから取得して画面に描画する関数
async function renderTasks() {
  listEl.innerHTML = '<li>読み込み中...</li>';
  
  try {
    // kadai1 コレクションから作成日時（created）が新しい順にデータを取得するクエリ
    const q = query(collection(db, "kadai1"), orderBy("created", "desc"));
    const querySnapshot = await getDocs(q);
    
    listEl.innerHTML = '';
    
    querySnapshot.forEach((docSnap) => {
      const t = docSnap.data();
      const docId = docSnap.id; // 👈 Firestoreが自動生成したID (vae6mmwqK1kZ...など)

      const li = document.createElement('li');
      li.className = 'task-item' + (t.done ? ' done' : '');

      // ※ 既存の「kadai」フィールドと、新しく追加する「title」フィールドの両方に対応できるようにしています
      const displayTitle = t.title || t.kadai || '無題のタスク';

      const left = document.createElement('div');
      left.innerHTML = `<div class="title">${escapeHtml(displayTitle)}</div>
        <div class="meta">${t.due ? '期限: ' + t.due + ' • ' : ''}優先度: ${t.priority || 'なし'}</div>`;

      const controls = document.createElement('div');
      controls.className = 'controls';

      const doneBtn = document.createElement('button');
      doneBtn.className = 'small-btn done-btn';
      doneBtn.textContent = t.done ? '未完に戻す' : '完了';
      // クリック時にFirestoreのIDを渡して更新
      doneBtn.onclick = () => { toggleDone(docId, t.done) };

      const delBtn = document.createElement('button');
      delBtn.className = 'small-btn delete-btn';
      delBtn.textContent = '削除';
      // クリック時にFirestoreのIDを渡して削除
      delBtn.onclick = () => { deleteTask(docId) };

      controls.appendChild(doneBtn);
      controls.appendChild(delBtn);

      li.appendChild(left);
      li.appendChild(controls);
      listEl.appendChild(li);
    });
  } catch (e) {
    console.error("データ取得エラー:", e);
    listEl.innerHTML = '<li>データの読み込みに失敗しました。</li>';
  }
}

// 4. Firestoreへデータを追加する関数 (addDoc)
async function addTask(task) {
  try {
    // 「kadai1」コレクションに自動生成IDで保存
    await addDoc(collection(db, "kadai1"), task);
    renderTasks(); // 画面を再描画
  } catch (e) {
    console.error("データ追加エラー:", e);
  }
}

// 5. Firestoreのデータを削除する関数 (deleteDoc)
async function deleteTask(id) {
  try {
    await deleteDoc(doc(db, "kadai1", id));
    renderTasks();
  } catch (e) {
    console.error("データ削除エラー:", e);
  }
}

// 6. Firestoreの完了状態を反転させる関数 (updateDoc)
async function toggleDone(id, currentStatus) {
  try {
    const taskRef = doc(db, "kadai1", id);
    await updateDoc(taskRef, {
      done: !currentStatus
    });
    renderTasks();
  } catch (e) {
    console.error("データ更新エラー:", e);
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}

// フォーム送信時のイベント
form.addEventListener('submit', e => {
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  if (!title) return;
  const description = document.getElementById('description').value.trim();
  const due = document.getElementById('due').value || '';
  const priority = document.getElementById('priority').value;

  // 保存するデータオブジェクト（コンソールの「kadai」フィールド用にも一応文字を入れておきます）
  addTask({ 
    title, 
    kadai: title, // コンソールの既存データと互換性を持たせるため
    description, 
    due, 
    priority, 
    done: false, 
    created: Date.now() 
  });
  
  form.reset();
});

clearBtn.addEventListener('click', () => { form.reset(); });

// 最初にデータを読み込む
renderTasks();
const form = document.getElementById('task-form');
const listEl = document.getElementById('task-list');
const clearBtn = document.getElementById('clear');
const STORAGE_KEY = 'todo_tasks_v1';

function loadTasks(){
  try{return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')}
  catch(e){return []}
}

function saveTasks(tasks){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function renderTasks(){
  const tasks = loadTasks();
  listEl.innerHTML = '';
  tasks.forEach((t, idx)=>{
    const li = document.createElement('li');
    li.className = 'task-item' + (t.done? ' done':'');

    const left = document.createElement('div');
    left.innerHTML = `<div class="title">${escapeHtml(t.title)}</div>
      <div class="meta">${t.due? '期限: '+t.due + ' • ' : ''}優先度: ${t.priority}</div>`;

    const controls = document.createElement('div');
    controls.className = 'controls';

    const doneBtn = document.createElement('button');
    doneBtn.className = 'small-btn done-btn';
    doneBtn.textContent = t.done? '未完に戻す':'完了';
    doneBtn.onclick = ()=>{ toggleDone(idx) };

    const delBtn = document.createElement('button');
    delBtn.className = 'small-btn delete-btn';
    delBtn.textContent = '削除';
    delBtn.onclick = ()=>{ deleteTask(idx) };

    controls.appendChild(doneBtn);
    controls.appendChild(delBtn);

    li.appendChild(left);
    li.appendChild(controls);
    listEl.appendChild(li);
  });
}

function addTask(task){
  const tasks = loadTasks();
  tasks.unshift(task);
  saveTasks(tasks);
  renderTasks();
}

function deleteTask(i){
  const tasks = loadTasks();
  tasks.splice(i,1);
  saveTasks(tasks);
  renderTasks();
}

function toggleDone(i){
  const tasks = loadTasks();
  tasks[i].done = !tasks[i].done;
  saveTasks(tasks);
  renderTasks();
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[c]);
}

form.addEventListener('submit', e=>{
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  if(!title) return;
  const description = document.getElementById('description').value.trim();
  const due = document.getElementById('due').value || '';
  const priority = document.getElementById('priority').value;

  addTask({title,description,due,priority,done:false,created:Date.now()});
  form.reset();
});

clearBtn.addEventListener('click', ()=>{ form.reset(); });

renderTasks();

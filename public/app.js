// State
let todos = [];
let currentFilter = 'all'; // 'all' | 'active' | 'completed'

// DOM Elements
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const emptyTitle = document.getElementById('empty-title');
const emptyDesc = document.getElementById('empty-desc');
const clearCompletedBtn = document.getElementById('clear-completed-btn');
const currentDateEl = document.getElementById('current-date');
const remainingCountEl = document.getElementById('remaining-count');
const progressBarFill = document.getElementById('progress-bar-fill');
const progressPercent = document.getElementById('progress-percent');

// Badges
const countAllEl = document.getElementById('count-all');
const countActiveEl = document.getElementById('count-active');
const countCompletedEl = document.getElementById('count-completed');

// Filter Buttons
const filterBtns = document.querySelectorAll('.filter-btn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  displayFormattedDate();
  setupEventListeners();
  fetchTodos();
});

// Display Turkish Formatted Date
function displayFormattedDate() {
  const now = new Date();
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  const formatted = now.toLocaleDateString('tr-TR', options);
  // Capitalize first letter
  currentDateEl.textContent = formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

// Setup Event Listeners
function setupEventListeners() {
  // Add Todo Form Submit
  todoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = todoInput.value.trim();
    if (!title) return;

    await addTodo(title);
    todoInput.value = '';
    todoInput.focus();
  });

  // Filter Buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      currentFilter = btn.dataset.filter;
      renderTodos();
    });
  });

  // Clear Completed Tasks
  clearCompletedBtn.addEventListener('click', async () => {
    const completedCount = todos.filter(t => t.completed).length;
    if (completedCount === 0) return;

    await clearCompletedTodos();
  });
}

// API Calls

// 1. Fetch Todos
async function fetchTodos() {
  try {
    const res = await fetch('/api/todos');
    if (!res.ok) throw new Error('Görevler yüklenemedi');
    todos = await res.json();
    renderTodos();
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

// 2. Add Todo
async function addTodo(title) {
  try {
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    });
    if (!res.ok) throw new Error('Görev eklenemedi');
    const newTodo = await res.json();
    todos.unshift(newTodo);
    renderTodos();
  } catch (err) {
    console.error('Add error:', err);
  }
}

// 3. Toggle Complete
async function toggleTodo(id, currentCompleted) {
  try {
    const res = await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !currentCompleted })
    });
    if (!res.ok) throw new Error('Görev güncellenemedi');
    const updated = await res.json();
    todos = todos.map(t => (t.id === id ? updated : t));
    renderTodos();
  } catch (err) {
    console.error('Update error:', err);
  }
}

// 4. Delete Single Todo
async function deleteTodo(id) {
  try {
    const res = await fetch(`/api/todos/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Görev silinemedi');
    todos = todos.filter(t => t.id !== id);
    renderTodos();
  } catch (err) {
    console.error('Delete error:', err);
  }
}

// 5. Clear All Completed Todos
async function clearCompletedTodos() {
  try {
    const res = await fetch('/api/todos/completed/all', {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Tamamlananlar silinemedi');
    todos = todos.filter(t => !t.completed);
    renderTodos();
  } catch (err) {
    console.error('Clear completed error:', err);
  }
}

// Render Function
function renderTodos() {
  // Counts
  const totalCount = todos.length;
  const completedCount = todos.filter(t => t.completed).length;
  const activeCount = totalCount - completedCount;

  // Update Badge Counts
  countAllEl.textContent = totalCount;
  countActiveEl.textContent = activeCount;
  countCompletedEl.textContent = completedCount;

  // Clear completed button state
  clearCompletedBtn.disabled = completedCount === 0;

  // Remaining indicator
  remainingCountEl.textContent = `${activeCount} görev kaldı`;

  // Progress Bar
  const percent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  progressBarFill.style.width = `${percent}%`;
  progressPercent.textContent = `${percent}%`;

  // Filter Todos
  let filtered = todos;
  if (currentFilter === 'active') {
    filtered = todos.filter(t => !t.completed);
  } else if (currentFilter === 'completed') {
    filtered = todos.filter(t => t.completed);
  }

  // Clear List
  todoList.innerHTML = '';

  // Handle Empty State
  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
    if (currentFilter === 'active') {
      emptyTitle.textContent = 'Harika, her şey tamam!';
      emptyDesc.textContent = 'Şu an bekleyen hiçbir göreviniz bulunmuyor.';
    } else if (currentFilter === 'completed') {
      emptyTitle.textContent = 'Tamamlanan görev yok';
      emptyDesc.textContent = 'Bitirdiğiniz görevler burada görüntülenecektir.';
    } else {
      emptyTitle.textContent = 'Henüz görev eklenmedi';
      emptyDesc.textContent = 'Yukarıdaki alandan yeni bir görev ekleyerek başlayabilirsiniz.';
    }
  } else {
    emptyState.classList.add('hidden');

    filtered.forEach(todo => {
      const li = document.createElement('li');
      li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
      li.dataset.id = todo.id;

      // Checkmark SVG inside checkbox
      li.innerHTML = `
        <div class="todo-left" role="button" tabindex="0" aria-label="${todo.completed ? 'Görevi yapılmadı olarak işaretle' : 'Görevi tamamlandı olarak işaretle'}">
          <div class="checkbox-custom" aria-hidden="true">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <span class="todo-text">${escapeHtml(todo.title)}</span>
        </div>
        <button type="button" class="delete-btn" aria-label="Görevi sil" title="Görevi sil">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      `;

      // Event: Toggle on click
      const todoLeft = li.querySelector('.todo-left');
      todoLeft.addEventListener('click', () => {
        toggleTodo(todo.id, todo.completed);
      });
      // Keyboard accessible toggle
      todoLeft.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTodo(todo.id, todo.completed);
        }
      });

      // Event: Delete
      const deleteBtn = li.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteTodo(todo.id);
      });

      todoList.appendChild(li);
    });
  }
}

// Utility: Prevent XSS
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

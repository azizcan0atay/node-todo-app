const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'todos.json');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper: Ensure data directory and file exist
async function initDataFile() {
  try {
    await fs.mkdir(path.join(__dirname, 'data'), { recursive: true });
    try {
      await fs.access(DATA_FILE);
    } catch {
      // Create initial sample data
      const initialData = [
        {
          id: '1',
          title: 'Node.js to-do uygulamasını incele',
          completed: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Yeni görevler ekle ve test et',
          completed: false,
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          title: 'Tamamlanan görevleri temizle',
          completed: false,
          createdAt: new Date().toISOString()
        }
      ];
      await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Veri dosyası başlatılamadı:', err);
  }
}

// Helper: Read todos
async function readTodos() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Görevler okunamadı:', err);
    return [];
  }
}

// Helper: Write todos
async function writeTodos(todos) {
  await fs.writeFile(DATA_FILE, JSON.stringify(todos, null, 2), 'utf-8');
}

// API Endpoints

// 1. Get all todos
app.get('/api/todos', async (req, res) => {
  try {
    const todos = await readTodos();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: 'Görevler alınamadı' });
  }
});

// 2. Add new todo
app.post('/api/todos', async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Görev başlığı boş olamaz' });
    }

    const todos = await readTodos();
    const newTodo = {
      id: Date.now().toString(),
      title: title.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };

    todos.unshift(newTodo);
    await writeTodos(todos);
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(500).json({ error: 'Görev eklenirken hata oluştu' });
  }
});

// 3. Delete all completed todos (User requirement: bitenlerin de silinebildiği)
app.delete('/api/todos/completed/all', async (req, res) => {
  try {
    const todos = await readTodos();
    const activeTodos = todos.filter(t => !t.completed);
    const removedCount = todos.length - activeTodos.length;
    await writeTodos(activeTodos);
    res.json({ message: 'Tamamlanan görevler silindi', removedCount });
  } catch (err) {
    res.status(500).json({ error: 'Tamamlanan görevler silinemedi' });
  }
});

// 4. Update todo (toggle completion or edit title)
app.patch('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed, title } = req.body;

    const todos = await readTodos();
    const index = todos.findIndex(t => t.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Görev bulunamadı' });
    }

    if (typeof completed === 'boolean') {
      todos[index].completed = completed;
    }
    if (typeof title === 'string' && title.trim()) {
      todos[index].title = title.trim();
    }

    await writeTodos(todos);
    res.json(todos[index]);
  } catch (err) {
    res.status(500).json({ error: 'Görev güncellenemedi' });
  }
});

// 5. Delete specific todo
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const todos = await readTodos();
    const filteredTodos = todos.filter(t => t.id !== id);

    if (filteredTodos.length === todos.length) {
      return res.status(404).json({ error: 'Görev bulunamadı' });
    }

    await writeTodos(filteredTodos);
    res.json({ message: 'Görev başarıyla silindi', id });
  } catch (err) {
    res.status(500).json({ error: 'Görev silinemedi' });
  }
});

// Start server
async function startServer() {
  await initDataFile();
  app.listen(PORT, () => {
    console.log(`To-Do App sunucusu çalışıyor: http://localhost:${PORT}`);
  });
}

startServer();

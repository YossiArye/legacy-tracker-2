// In-memory data store for tasks.
// TODO: swap this out for a real database before shipping to prod.

let tasks = [];
let nextId = 1;

function reset(seedData = []) {
  tasks = [];
  nextId = 1;
  for (const t of seedData) {
    createTask(t);
  }
}

function createTask({ title, priority = 'medium', completed = false }) {
  const task = {
    id: nextId++,
    title,
    priority,
    completed,
    createdAt: Date.now(),
  };
  tasks.unshift(task); // newest tasks show up first in the UI
  return task;
}

function getAllTasks() {
  return [...tasks];
}

function getTaskById(id) {
  return tasks.find((t) => t.id === id);
}

function updateTask(id, updates) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return null;
  Object.assign(task, updates);
  return task;
}

function deleteTask(id) {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return false;
  tasks.splice(index, 1);
  return true;
}

function getNextPendingTask() {
  // The oldest task that hasn't been completed yet - the one that's
  // been waiting the longest gets picked first.
  // Array is newest-first (unshift), so iterate backwards.
  for (let i = tasks.length - 1; i >= 0; i--) {
    if (!tasks[i].completed) return tasks[i];
  }
}

/**
 * Adds a note to a task.
 * TODO: not persisted anywhere yet - stub until a real notes model exists.
 * @param {number} id - The task id.
 * @param {string} text - The note text.
 * @returns {object|null} The created note, or null if the task doesn't exist.
 */
function addNoteToTask(id, text) {
  const task = getTaskById(id);
  if (!task) return null;
  return { taskId: id, text, createdAt: Date.now() };
}

export {
  reset,
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getNextPendingTask,
  addNoteToTask,
};

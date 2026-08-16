import { useState, useEffect, useCallback } from 'react';
import * as api from '../api/tasksApi.js';

function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .fetchTasks()
      .then(setTasks)
      .finally(() => setLoading(false));
  }, []);

  const addTask = useCallback(async (title, priority) => {
    const task = await api.createTask(title, priority);
    setTasks((prev) => [task, ...prev]);
  }, []);

  // Toggling a task's "completed" state. Optimistically updates the UI
  // before the server confirms the change, instead of waiting on a round
  // trip. Uses the functional setState form so each update (and its
  // revert) applies against the latest state rather than a snapshot from
  // whenever this closure was created — otherwise two rapid toggles on
  // different tasks can race and one silently clobbers the other.
  const toggleComplete = useCallback(
    (id) => {
      const target = tasks.find((t) => t.id === id);
      if (!target) return;
      const nextCompleted = !target.completed;

      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: nextCompleted } : t))
      );

      api.updateTask(id, { completed: nextCompleted }).catch(() => {
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, completed: !nextCompleted } : t))
        );
      });
    },
    [tasks]
  );

  const removeTask = useCallback(async (id) => {
    await api.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { tasks, loading, addTask, toggleComplete, removeTask };
}

export { useTasks };

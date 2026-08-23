import * as store from '../store.js';
import * as activityLog from '../activityLog.js';
import { validateTask, validateNote, VALID_PRIORITIES } from '../utils/validate.js';
import { log } from '../utils/logger.js';

function listTasks(req, res) {
  const { completed } = req.query;
  let tasks = store.getAllTasks();
  if (completed !== undefined) {
    const wantCompleted = completed === 'true';
    tasks = tasks.filter((t) => t.completed === wantCompleted);
  }
  res.json(tasks);
}

function getTask(req, res) {
  const id = Number(req.params.id);
  const task = store.getTaskById(id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
}

async function createTask(req, res) {
  const errors = validateTask(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  const task = store.createTask(req.body);
  await activityLog.record('created', task.id);
  log(`Created task ${task.id}`);
  res.status(201).json(task);
}

function updateTask(req, res) {
  const id = Number(req.params.id);
  const errors = validateTask(req.body, { partial: true });
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  const updated = store.updateTask(id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Task not found' });
  }
  activityLog.record('updated', id);
  log(`Updated task ${id}`);
  res.json(updated);
}

function deleteTask(req, res) {
  const id = Number(req.params.id);
  const removed = store.deleteTask(id);
  if (!removed) {
    return res.status(404).json({ error: 'Task not found' });
  }
  activityLog.record('deleted', id);
  res.status(204).end();
}

/**
 * Adds a note to a task.
 * @param {import('express').Request} req - Expects `id` param and `text` in body.
 * @param {import('express').Response} res
 * @returns {void}
 */
function addNote(req, res) {
  const id = Number(req.params.id);
  const errors = validateNote(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  const note = store.addNoteToTask(id, req.body.text);
  if (!note) {
    return res.status(404).json({ error: 'Task not found' });
  }
  log(`Added note to task ${id}`);
  res.status(201).json(note);
}

function nextTask(req, res) {
  const task = store.getNextPendingTask();
  if (!task) {
    return res.status(404).json({ error: 'No pending tasks' });
  }
  res.json(task);
}

const URGENT_KEYWORDS = ['urgent', 'asap', 'critical', 'now'];

function splitImportLines(data) {
  return data
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

// Parses one "title,priority" line into a candidate task. Falls back to
// medium priority when missing/invalid, then escalates to high if the
// title contains an urgent keyword.
function parseImportLine(line) {
  const [rawTitle, rawPriority] = line.split(',').map((p) => p.trim());
  const title = rawTitle || '';

  let priority = rawPriority || 'medium';
  if (!VALID_PRIORITIES.includes(priority)) {
    priority = 'medium';
  }

  const lowerTitle = title.toLowerCase();
  if (URGENT_KEYWORDS.some((keyword) => lowerTitle.includes(keyword))) {
    priority = 'high';
  }

  return { title, priority };
}

function summarizeImport(lines, created, skipped) {
  const byPriority = { low: 0, medium: 0, high: 0 };
  for (const task of created) {
    byPriority[task.priority] += 1;
  }
  return {
    total: lines.length,
    created: created.length,
    skipped: skipped.length,
    byPriority,
  };
}

// Bulk-import tasks from a simple CSV-ish payload: one "title,priority" per line.
// Handles dedup, keyword-based priority bumping, validation, and a summary report.
function bulkImportTasks(req, res) {
  const { data } = req.body;
  if (typeof data !== 'string' || data.trim().length === 0) {
    return res.status(400).json({ error: 'No import data provided' });
  }

  const lines = splitImportLines(data);
  const seenTitles = new Set();
  const created = [];
  const skipped = [];

  for (const line of lines) {
    const { title, priority } = parseImportLine(line);

    if (!title) {
      skipped.push({ line, reason: 'missing title' });
      continue;
    }

    const normalizedTitle = title.toLowerCase();
    if (seenTitles.has(normalizedTitle)) {
      skipped.push({ line, reason: 'duplicate title' });
      continue;
    }
    seenTitles.add(normalizedTitle);

    const errors = validateTask({ title, priority });
    if (errors.length > 0) {
      skipped.push({ line, reason: errors.join('; ') });
      continue;
    }

    const task = store.createTask({ title, priority });
    activityLog.record('created', task.id);
    created.push(task);
  }

  const stats = summarizeImport(lines, created, skipped);

  log(`Bulk import: ${created.length} created, ${skipped.length} skipped`);
  res.status(201).json({ created, skipped, stats });
}

export {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  nextTask,
  bulkImportTasks,
  addNote,
};

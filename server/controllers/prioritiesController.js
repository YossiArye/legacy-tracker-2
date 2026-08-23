import * as store from '../store.js';
import {
  validatePriorityQuery,
  validatePriorityAssignment,
  validatePriorityReplacement,
  VALID_PRIORITIES,
} from '../utils/validate.js';
import { log } from '../utils/logger.js';

/**
 * Lists valid priorities with a count of tasks at each one. When a
 * `priority` query param is given, the response is filtered to just
 * that priority.
 * @param {import('express').Request} req - Optional `priority` query param.
 * @param {import('express').Response} res
 * @returns {void}
 */
function listPriorities(req, res) {
  const errors = validatePriorityQuery(req.query);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const { priority } = req.query;
  const tasks = store.getAllTasks();
  const priorities = priority ? [priority] : VALID_PRIORITIES;

  const summary = priorities.map((p) => ({
    priority: p,
    count: tasks.filter((t) => t.priority === p).length,
  }));

  log(`Listed priorities${priority ? ` filtered to ${priority}` : ''}`);
  res.json(summary);
}

/**
 * Applies one priority to a batch of tasks in a single request.
 * TODO: scaffold only - the payload is validated but no task is updated
 * yet. Implement the store writes (and the activityLog entries that go
 * with them) before wiring this up to the client.
 * @param {import('express').Request} req - Expects `priority` and `taskIds` in body.
 * @param {import('express').Response} res
 * @returns {void}
 */
function assignPriority(req, res) {
  const errors = validatePriorityAssignment(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  log('Priority assignment requested but not implemented');
  res.status(501).json({ error: 'Not implemented' });
}

/**
 * Replaces which tasks hold a given priority.
 * TODO: scaffold only - the payload is validated but the store isn't
 * touched yet. Implement the store writes (and the activityLog entries
 * that go with them) before wiring this up to the client.
 * @param {import('express').Request} req - Expects `priority` route param and `taskIds` in body.
 * @param {import('express').Response} res
 * @returns {void}
 */
function replacePriorityAssignment(req, res) {
  const { priority } = req.params;
  const errors = validatePriorityReplacement({ priority, taskIds: req.body.taskIds });
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  log(`Priority replacement requested for ${priority} but not implemented`);
  res.status(501).json({ error: 'Not implemented' });
}

export { listPriorities, assignPriority, replacePriorityAssignment };

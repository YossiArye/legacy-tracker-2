// Validation rules for task payloads.
// Used by the controller on every create and update.

const MAX_TITLE_LENGTH = 120;
const MIN_TITLE_LENGTH = 3;
const VALID_PRIORITIES = ['low', 'medium', 'high'];

function validateTask(payload, { partial = false } = {}) {
  const errors = [];
  const { title, priority } = payload;

  if (!partial || title !== undefined) {
    if (typeof title !== 'string' || title.trim().length < MIN_TITLE_LENGTH) {
      errors.push(`Title must be at least ${MIN_TITLE_LENGTH} characters`);
    } else if (title.length > MAX_TITLE_LENGTH) {
      errors.push(`Title must be under ${MAX_TITLE_LENGTH} characters`);
    }
  }

  if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
    errors.push(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }

  return errors;
}

/**
 * Validates a note payload.
 * @param {object} payload - The request body.
 * @param {string} payload.text - The note text.
 * @returns {string[]} Array of error messages, empty if valid.
 */
function validateNote(payload) {
  const errors = [];
  const { text } = payload;

  if (typeof text !== 'string' || text.trim().length === 0) {
    errors.push('Note text is required');
  }

  return errors;
}

/**
 * Validates an optional `priority` filter passed as a query param.
 * @param {object} query - The request query object.
 * @param {string} [query.priority] - The priority to filter by, if any.
 * @returns {string[]} Array of error messages, empty if valid.
 */
function validatePriorityQuery(query) {
  const errors = [];
  const { priority } = query;

  if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
    errors.push(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }

  return errors;
}

/**
 * Validates a bulk priority-assignment payload.
 * @param {object} payload - The request body.
 * @param {string} payload.priority - The priority to apply.
 * @param {number[]} payload.taskIds - The ids of the tasks to update.
 * @returns {string[]} Array of error messages, empty if valid.
 */
function validatePriorityAssignment(payload) {
  const errors = [];
  const { priority, taskIds } = payload;

  if (!VALID_PRIORITIES.includes(priority)) {
    errors.push(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }

  if (!Array.isArray(taskIds) || taskIds.length === 0) {
    errors.push('taskIds must be a non-empty array');
  } else if (taskIds.some((id) => !Number.isInteger(id))) {
    errors.push('taskIds must contain only integers');
  }

  return errors;
}

/**
 * Validates a payload for replacing which tasks hold a given priority.
 * @param {object} payload - Combined route param and request body.
 * @param {string} payload.priority - The priority being replaced.
 * @param {number[]} payload.taskIds - The ids of the tasks that should hold it.
 * @returns {string[]} Array of error messages, empty if valid.
 */
function validatePriorityReplacement(payload) {
  const errors = [];
  const { priority, taskIds } = payload;

  if (!VALID_PRIORITIES.includes(priority)) {
    errors.push(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }

  if (!Array.isArray(taskIds)) {
    errors.push('taskIds must be an array');
  } else if (taskIds.some((id) => !Number.isInteger(id))) {
    errors.push('taskIds must contain only integers');
  }

  return errors;
}

export {
  validateTask,
  validateNote,
  validatePriorityQuery,
  validatePriorityAssignment,
  validatePriorityReplacement,
  VALID_PRIORITIES,
  MAX_TITLE_LENGTH,
  MIN_TITLE_LENGTH,
};

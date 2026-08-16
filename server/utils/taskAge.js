// Formats how long ago a task was created, relative to now.

import { log } from './logger.js';

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/**
 * Formats a task's createdAt timestamp as a human-readable age string.
 * @param {string|number|Date} createdAt - The task's creation timestamp.
 * @returns {string} A phrase like "created 3 days ago" or "created just now".
 */
function formatTaskAge(createdAt) {
  const createdDate = new Date(createdAt);
  const diffMs = Date.now() - createdDate.getTime();

  log(`formatTaskAge: createdAt=${createdDate.toISOString()} diffMs=${diffMs}`);

  if (Number.isNaN(diffMs) || diffMs < 0) {
    log(`formatTaskAge: invalid or future createdAt (${createdAt})`);
    return 'created at an unknown time';
  }

  if (diffMs < MINUTE_MS) {
    return 'created just now';
  }

  if (diffMs < HOUR_MS) {
    const minutes = Math.floor(diffMs / MINUTE_MS);
    return `created ${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }

  if (diffMs < DAY_MS) {
    const hours = Math.floor(diffMs / HOUR_MS);
    return `created ${hours} hour${hours === 1 ? '' : 's'} ago`;
  }

  const days = Math.floor(diffMs / DAY_MS);
  return `created ${days} day${days === 1 ? '' : 's'} ago`;
}

export { formatTaskAge };

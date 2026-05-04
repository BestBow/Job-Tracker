const STATUSES = ['applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn'];

// Now allows moving to ANY status except from terminal ones
// Only rejected and withdrawn are truly terminal (can't move out once there)
const TERMINAL = ['rejected', 'withdrawn'];

function canTransition(from, to) {
  if (!STATUSES.includes(from) || !STATUSES.includes(to)) return false;
  if (from === to) return false;
  if (TERMINAL.includes(from)) return false; // can't move out of terminal
  return true; // everything else is allowed — users can move freely
}

function getValidTransitions(from) {
  if (TERMINAL.includes(from)) return [];
  return STATUSES.filter(s => s !== from);
}

module.exports = { canTransition, getValidTransitions, STATUSES, TERMINAL };
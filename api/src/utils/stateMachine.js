// Valid transitions — key is current status, value is where it can go
const TRANSITIONS = {
    applied:   ['screening', 'interview', 'rejected', 'withdrawn'],
    screening: ['interview', 'rejected', 'withdrawn'],
    interview: ['offer',     'rejected', 'withdrawn'],
    offer:     ['withdrawn'],
    rejected:  [],
    withdrawn: [],
  };
  
  function canTransition(from, to) {
    return TRANSITIONS[from]?.includes(to) ?? false;
  }
  
  function getValidTransitions(from) {
    return TRANSITIONS[from] ?? [];
  }
  
  module.exports = { canTransition, getValidTransitions, TRANSITIONS };
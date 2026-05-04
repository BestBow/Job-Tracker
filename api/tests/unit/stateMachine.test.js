const { canTransition, getValidTransitions } = require('../../src/utils/stateMachine');

describe('stateMachine', () => {
  describe('canTransition', () => {
    it.each([
      ['applied',   'screening', true],
      ['applied',   'interview', true],
      ['applied',   'rejected',  true],
      ['screening', 'applied',   true],  // can go backwards now
      ['interview', 'applied',   true],  // can go backwards now
      ['interview', 'offer',     true],
      ['offer',     'applied',   true],  // can go backwards now
    ])('allows %s → %s', (from, to, expected) => {
      expect(canTransition(from, to)).toBe(expected);
    });

    it.each([
      ['rejected',  'applied',   false], // terminal
      ['withdrawn', 'applied',   false], // terminal
      ['applied',   'applied',   false], // same status
    ])('blocks %s → %s', (from, to, expected) => {
      expect(canTransition(from, to)).toBe(expected);
    });

    it('returns false for unknown status', () => {
      expect(canTransition('unknown', 'applied')).toBe(false);
    });
  });

  describe('getValidTransitions', () => {
    it('returns all other statuses for applied', () => {
      const transitions = getValidTransitions('applied');
      expect(transitions).toContain('screening');
      expect(transitions).toContain('interview');
      expect(transitions).not.toContain('applied');
    });

    it('returns empty array for terminal statuses', () => {
      expect(getValidTransitions('rejected')).toHaveLength(0);
      expect(getValidTransitions('withdrawn')).toHaveLength(0);
    });
  });
});
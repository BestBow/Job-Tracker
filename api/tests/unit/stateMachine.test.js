const { canTransition, getValidTransitions } = require('../../src/utils/stateMachine');

describe('stateMachine', () => {
  describe('canTransition', () => {
    it.each([
      ['applied',   'screening', true],
      ['applied',   'interview', true],
      ['applied',   'rejected',  true],
      ['applied',   'withdrawn', true],
      ['screening', 'interview', true],
      ['interview', 'offer',     true],
      ['offer',     'withdrawn', true],
    ])('allows %s → %s', (from, to, expected) => {
      expect(canTransition(from, to)).toBe(expected);
    });

    it.each([
      ['rejected',  'applied',   false],  // can't go backwards
      ['withdrawn', 'applied',   false],  // can't reopen
      ['offer',     'applied',   false],  // can't go backwards
      ['interview', 'applied',   false],  // can't go backwards
      ['rejected',  'interview', false],  // rejected is terminal
      ['withdrawn', 'offer',     false],  // withdrawn is terminal
    ])('blocks %s → %s', (from, to, expected) => {
      expect(canTransition(from, to)).toBe(expected);
    });

    it('returns false for unknown status', () => {
      expect(canTransition('unknown', 'applied')).toBe(false);
    });
  });

  describe('getValidTransitions', () => {
    it('returns correct transitions for applied', () => {
      expect(getValidTransitions('applied')).toEqual(
        expect.arrayContaining(['screening', 'interview', 'rejected', 'withdrawn'])
      );
    });

    it('returns empty array for terminal statuses', () => {
      expect(getValidTransitions('rejected')).toHaveLength(0);
      expect(getValidTransitions('withdrawn')).toHaveLength(0);
    });
  });
});
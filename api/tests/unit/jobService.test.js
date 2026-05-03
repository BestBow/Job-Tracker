jest.mock('../../src/db/pool', () => ({ query: jest.fn() }));
jest.mock('../../src/utils/stateMachine');

const pool = require('../../src/db/pool');
const { canTransition, getValidTransitions } = require('../../src/utils/stateMachine');
const { createJob, updateJobStatus, deleteJob } = require('../../src/services/jobService');

const mockJob = {
  id: 1, company: 'Google', role: 'SWE',
  status: 'applied', is_active: true,
};

beforeEach(() => jest.clearAllMocks());

describe('jobService', () => {
  describe('createJob', () => {
    it('inserts a job and returns the row', async () => {
      pool.query.mockResolvedValue({ rows: [mockJob] });

      const result = await createJob({ company: 'Google', role: 'SWE' });

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO jobs'),
        expect.any(Array)
      );
      expect(result.company).toBe('Google');
    });
  });

  describe('updateJobStatus', () => {
    it('updates status when transition is valid', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ status: 'applied' }] })   // fetch current
        .mockResolvedValueOnce({ rows: [{ ...mockJob, status: 'interview' }] }); // update

      canTransition.mockReturnValue(true);

      const result = await updateJobStatus(1, 'interview');
      expect(result.status).toBe('interview');
    });

    it('throws 400 when transition is invalid', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ status: 'rejected' }] });
      canTransition.mockReturnValue(false);
      getValidTransitions.mockReturnValue([]);

      await expect(updateJobStatus(1, 'applied')).rejects.toMatchObject({ status: 400 });
    });

    it('throws 404 when job does not exist', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      await expect(updateJobStatus(999, 'interview')).rejects.toMatchObject({ status: 404 });
    });
  });

  describe('deleteJob', () => {
    it('returns true when job is soft deleted', async () => {
      pool.query.mockResolvedValue({ rowCount: 1 });
      expect(await deleteJob(1)).toBe(true);
    });

    it('returns false when job not found', async () => {
      pool.query.mockResolvedValue({ rowCount: 0 });
      expect(await deleteJob(999)).toBe(false);
    });
  });
});
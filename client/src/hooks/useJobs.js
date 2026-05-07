import { useState, useEffect, useCallback } from 'react';
import { getJobs, updateStatus, deleteJob, restoreJob } from '../api/jobs';

export function useJobs() {
  const [jobs,      setJobs]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [deletedJob, setDeletedJob] = useState(null); // for undo

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getJobs();
      setJobs(data);
    } catch (err) {
      console.error('Failed to load jobs', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  async function moveJob(id, newStatus) {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: newStatus } : j));
    try {
      await updateStatus(id, newStatus);
    } catch (err) {
      fetchJobs(); // revert on failure
    }
  }

  async function removeJob(id) {
    const job = jobs.find(j => j.id === id);
    setJobs(prev => prev.filter(j => j.id !== id));
    setDeletedJob(job); // show undo toast
    try {
      await deleteJob(id);
    } catch (err) {
      fetchJobs();
    }
  }

  async function undoDelete() {
    if (!deletedJob) return;
    try {
      await restoreJob(deletedJob.id);
      setDeletedJob(null);
      fetchJobs();
    } catch (err) {
      console.error('Failed to restore job', err);
    }
  }

  function dismissUndo() {
    setDeletedJob(null);
  }

  return { jobs, loading, moveJob, removeJob, fetchJobs, deletedJob, undoDelete, dismissUndo };
}
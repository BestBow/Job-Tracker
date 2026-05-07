import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:3001/api' });

export const getJobs      = ()               => api.get('/jobs').then(r => r.data.jobs);
export const getDeletedJobs = ()             => api.get('/jobs?active=false').then(r => r.data.jobs);
export const createJob    = (data)           => api.post('/jobs', data).then(r => r.data);
export const updateStatus = (id, status)     => api.patch(`/jobs/${id}/status`, { status }).then(r => r.data);
export const deleteJob    = (id)             => api.delete(`/jobs/${id}`);
export const restoreJob   = (id)             => api.post(`/jobs/${id}/restore`).then(r => r.data);
export const getJob       = (id)             => api.get(`/jobs/${id}`).then(r => r.data);
export const addNote      = (id, content)    => api.post(`/jobs/${id}/notes`, { content }).then(r => r.data);
export const addContact   = (id, data)       => api.post(`/jobs/${id}/contacts`, data).then(r => r.data);
export const addTag       = (id, name)       => api.post(`/jobs/${id}/tags`, { name }).then(r => r.data);
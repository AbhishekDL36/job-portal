import client from './client';

export const authAPI = {
  register: (data) => client.post('/auth/register', data),
  verifyOTP: (data) => client.post('/auth/verify-otp', data),
  resendOTP: (email) => client.post('/auth/resend-otp', { email }),
  login: (data) => client.post('/auth/login', data),
  getProfile: () => client.get('/auth/me'),
  updateProfile: (data) => client.put('/auth/profile', data),
};

export const jobsAPI = {
  getAllJobs: (params) => client.get('/jobs', { params }),
  getJobById: (id) => client.get(`/jobs/${id}`),
  getMyJobs: () => client.get('/jobs/user/my-jobs'),
  postJob: (data) => client.post('/jobs', data),
  updateJob: (id, data) => client.put(`/jobs/${id}`, data),
  deleteJob: (id) => client.delete(`/jobs/${id}`),
  searchJobs: (q) => client.get('/jobs/search', { params: { q } }),
};

export const applicationsAPI = {
  applyJob: (jobId, data) => client.post(`/applications/${jobId}/apply`, data),
  getUserApplications: () => client.get('/applications/user/my-applications'),
  getCheckApplications: () => client.get('/applications/user/check-applications'),
  updateApplicationStatus: (applicationId, status) =>
    client.put(`/applications/${applicationId}/status`, { status }),
  getApplicationStats: () => client.get('/applications/user/stats'),
};

export const resumeAPI = {
  saveResume: (data) => client.post('/resume', data),
  getResume: () => client.get('/resume'),
  deleteResume: () => client.delete('/resume'),
  getSuggestions: () => client.get('/resume/suggestions'),
  getJobMatch: (jobId) => client.get(`/resume/match/${jobId}`),
};

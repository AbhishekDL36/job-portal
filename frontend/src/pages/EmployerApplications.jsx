import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { applicationsAPI, jobsAPI } from '../api/auth';
import { AlertCircle, CheckCircle } from 'lucide-react';

function EmployerApplications() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, [jobId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appRes, jobRes] = await Promise.all([
        applicationsAPI.getCheckApplications(),
        jobsAPI.getJobById(jobId),
      ]);
      setJob(jobRes.data);
      setApplications(appRes.data.filter(app => app.jobId._id === jobId));
    } catch (err) {
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId, status) => {
    try {
      setError('');
      setSuccess('');
      await applicationsAPI.updateApplicationStatus(appId, status);
      setSuccess(`Application status updated to ${status}`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading applications...</p>
      </div>
    );
  }

  const filteredApplications = selectedStatus
    ? applications.filter(app => app.status === selectedStatus)
    : applications;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate(-1)} className="text-blue-600 hover:text-blue-700 mb-6">
          ← Back
        </button>

        <h1 className="text-3xl font-bold mb-2">Applications for "{job?.title}"</h1>
        <p className="text-gray-600 mb-8">Manage applications and update candidate status</p>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-8 flex-wrap">
          <button
            onClick={() => setSelectedStatus('')}
            className={`px-4 py-2 rounded-lg font-medium ${
              selectedStatus === ''
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            All ({applications.length})
          </button>
          {['applied', 'shortlisted', 'accepted', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium capitalize ${
                selectedStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              {status} ({applications.filter(a => a.status === status).length})
            </button>
          ))}
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No applications {selectedStatus ? `with status "${selectedStatus}"` : ''}</p>
            </div>
          ) : (
            filteredApplications.map(app => (
              <div key={app._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{app.userId?.name}</h3>
                    <p className="text-gray-600">{app.userId?.email}</p>
                    {app.userId?.phone && <p className="text-gray-600">{app.userId?.phone}</p>}
                  </div>
                  <span className={`px-4 py-1 rounded-full text-sm font-medium capitalize ${
                    app.status === 'applied' ? 'bg-blue-100 text-blue-800' :
                    app.status === 'shortlisted' ? 'bg-yellow-100 text-yellow-800' :
                    app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {app.status}
                  </span>
                </div>

                {app.coverLetter && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 font-medium mb-2">Cover Letter:</p>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded">{app.coverLetter}</p>
                  </div>
                )}

                {app.resume && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 font-medium mb-2">Resume:</p>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded line-clamp-3">{app.resume}</p>
                  </div>
                )}

                <p className="text-sm text-gray-500 mb-4">
                  Applied on {new Date(app.appliedAt).toLocaleDateString()}
                </p>

                <div className="flex gap-2 flex-wrap">
                  {['shortlisted', 'rejected', 'accepted'].map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(app._id, status)}
                      disabled={app.status === status}
                      className={`px-4 py-2 rounded font-medium capitalize ${
                        app.status === status
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      {status === 'shortlisted' ? 'Shortlist' :
                       status === 'rejected' ? 'Reject' :
                       'Accept'}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default EmployerApplications;

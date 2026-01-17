import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { savedJobsAPI, applicationsAPI } from '../api/auth';
import { MapPin, DollarSign, Briefcase, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import ShareButton from '../components/ShareButton';

function SavedJobs() {
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSavedJobs();
    fetchUserApplications();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await savedJobsAPI.getSavedJobs();
      console.log('Saved jobs response:', response);
      // axios wraps response in response.data
      const jobs = response.data?.savedJobs || [];
      setSavedJobs(Array.isArray(jobs) ? jobs : []);
    } catch (err) {
      console.error('Failed to fetch saved jobs:', err);
      setError('Failed to load saved jobs');
      setSavedJobs([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchUserApplications = async () => {
    try {
      const response = await applicationsAPI.getUserApplications();
      const jobIds = response.data.map(app => app.jobId._id);
      setAppliedJobIds(jobIds);
    } catch (err) {
      console.error('Failed to fetch user applications:', err);
    }
  };

  const handleRemoveSavedJob = async (jobId, e) => {
    e.stopPropagation();
    try {
      await savedJobsAPI.unsaveJob(jobId);
      setSavedJobs(savedJobs.filter(item => item.jobId._id !== jobId));
    } catch (err) {
      console.error('Failed to remove saved job:', err);
      setError('Failed to remove job');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Jobs</h1>
          <p className="text-gray-600">
            {savedJobs.length === 0
              ? 'You haven\'t saved any jobs yet'
              : `You have ${savedJobs.length} saved job${savedJobs.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading saved jobs...</p>
          </div>
        ) : savedJobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">No Saved Jobs Yet</h2>
            <p className="text-gray-600 mb-6">
              Start browsing jobs and click the heart icon to save them for later.
            </p>
            <button
              onClick={() => navigate('/jobs')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              Browse Jobs
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {savedJobs.map(({ jobId, savedAt }) => {
              if (!jobId) return null; // Skip if job data is missing

              const isApplied = appliedJobIds.includes(jobId._id);
              const savedDate = new Date(savedAt);
              const formattedDate = savedDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={jobId._id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer"
                  onClick={() => navigate(`/jobs/${jobId._id}`)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{jobId.title}</h2>
                      <p className="text-gray-600">{jobId.companyName || 'Company'}</p>
                      <p className="text-sm text-gray-500 mt-1">Saved on {formattedDate}</p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {jobId.jobType}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">{jobId.description}</p>

                  <div className="flex flex-wrap gap-6 mb-4">
                    {jobId.location && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{jobId.location}</span>
                      </div>
                    )}
                    {jobId.salary?.min && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <span>
                          ${jobId.salary.min.toLocaleString()} - $
                          {jobId.salary.max?.toLocaleString() || 'Negotiable'}
                        </span>
                      </div>
                    )}
                    {jobId.experience && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Briefcase className="w-4 h-4" />
                        <span>{jobId.experience}</span>
                      </div>
                    )}
                  </div>

                  {jobId.skills && jobId.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {jobId.skills.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                      {jobId.skills.length > 3 && (
                        <span className="text-gray-600 text-sm">+{jobId.skills.length - 3} more</span>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex gap-2">
                      {isApplied ? (
                        <button
                          disabled
                          className="flex-1 bg-green-100 text-green-700 px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Applied
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/jobs/${jobId._id}`);
                          }}
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
                        >
                          Apply Now
                        </button>
                      )}
                      <button
                        onClick={(e) => handleRemoveSavedJob(jobId._id, e)}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-semibold flex items-center justify-center gap-2"
                        title="Remove from saved jobs"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <ShareButton job={jobId} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default SavedJobs;

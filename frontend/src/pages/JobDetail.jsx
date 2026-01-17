import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobsAPI, applicationsAPI } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { MapPin, DollarSign, Briefcase, AlertCircle, CheckCircle } from 'lucide-react';
import ShareButton from '../components/ShareButton';
import SimilarJobs from '../components/SimilarJobs';

function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [formData, setFormData] = useState({
    coverLetter: '',
    resume: '',
  });

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const response = await jobsAPI.getJobById(id);
      setJob(response.data);
    } catch (err) {
      setError('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setApplyLoading(true);

    try {
      await applicationsAPI.applyJob(id, formData);
      setSuccess('Application submitted successfully! Check your email for confirmation.');
      setFormData({ coverLetter: '', resume: '' });
      setShowApplyForm(false);
      setTimeout(() => {
        navigate('/applications');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplyLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Job not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-700 mb-6"
        >
          ← Back
        </button>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <p className="text-xl text-gray-600">{job.companyName || 'Company'}</p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-medium">
                {job.jobType}
              </span>
              <ShareButton job={job} />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {job.location && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-5 h-5" />
                <span>{job.location}</span>
              </div>
            )}
            {job.salary?.min && (
              <div className="flex items-center gap-2 text-gray-600">
                <DollarSign className="w-5 h-5" />
                <span>${job.salary.min.toLocaleString()} - ${job.salary.max?.toLocaleString()}</span>
              </div>
            )}
            {job.experience && (
              <div className="flex items-center gap-2 text-gray-600">
                <Briefcase className="w-5 h-5" />
                <span>{job.experience}</span>
              </div>
            )}
          </div>

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

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Job Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
          </div>

          {job.skills && job.skills.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, idx) => (
                  <span key={idx} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {isAuthenticated && user?.userType === 'job_seeker' && (
            <div className="mb-8">
              {!showApplyForm ? (
                <button
                  onClick={() => setShowApplyForm(true)}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Apply Now
                </button>
              ) : (
                <form onSubmit={handleApply} className="space-y-4 border-t pt-6">
                  <h3 className="text-lg font-bold">Application Form</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cover Letter</label>
                    <textarea
                      value={formData.coverLetter}
                      onChange={(e) => setFormData({...formData, coverLetter: e.target.value})}
                      placeholder="Tell the employer why you're interested in this position..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="6"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Resume URL or Content</label>
                    <textarea
                      value={formData.resume}
                      onChange={(e) => setFormData({...formData, resume: e.target.value})}
                      placeholder="Paste your resume or provide a link..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="4"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={applyLoading}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {applyLoading ? 'Submitting...' : 'Submit Application'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowApplyForm(false)}
                      className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {(!isAuthenticated || user?.userType !== 'job_seeker') && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-900">
                {!isAuthenticated 
                  ? 'Please sign in as a job seeker to apply for this position.' 
                  : 'Sign in as a job seeker to apply for this position.'}
              </p>
              {!isAuthenticated && (
                <button
                  onClick={() => navigate('/login')}
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Sign In
                </button>
              )}
            </div>
          )}
        </div>

        {/* Similar Jobs Section */}
        {job && <SimilarJobs currentJob={job} />}
      </div>
    </div>
  );
}

export default JobDetail;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsAPI } from '../api/auth';
import { MapPin, DollarSign, Briefcase } from 'lucide-react';
import ShareButton from './ShareButton';

function SimilarJobs({ currentJob }) {
  const navigate = useNavigate();
  const [similarJobs, setSimilarJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentJob) {
      fetchSimilarJobs();
    }
  }, [currentJob]);

  const fetchSimilarJobs = async () => {
    try {
      setLoading(true);
      const response = await jobsAPI.getAllJobs({});
      const allJobs = response.data;

      // Filter similar jobs based on skills and category
      const currentJobSkills = (currentJob.skills || []).map(s => s.toLowerCase());
      const currentJobCategory = (currentJob.category || '').toLowerCase();

      const similar = allJobs
        .filter(job => job._id !== currentJob._id) // Exclude current job
        .map(job => {
          let score = 0;
          const jobSkills = (job.skills || []).map(s => s.toLowerCase());

          // Score based on skill overlap
          const skillOverlap = jobSkills.filter(skill => 
            currentJobSkills.includes(skill)
          ).length;
          score += skillOverlap * 3; // 3 points per matching skill

          // Score based on category match
          if ((job.category || '').toLowerCase() === currentJobCategory) {
            score += 2;
          }

          // Score based on job type match
          if (job.jobType === currentJob.jobType) {
            score += 1;
          }

          return { job, score };
        })
        .filter(item => item.score > 0) // Only jobs with some relevance
        .sort((a, b) => b.score - a.score) // Sort by relevance
        .slice(0, 6) // Top 6 similar jobs
        .map(item => item.job);

      setSimilarJobs(similar);
    } catch (err) {
      console.error('Failed to fetch similar jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-6 text-gray-600">Loading similar jobs...</div>;
  }

  if (similarJobs.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <h2 className="text-2xl font-bold mb-6">More Jobs Like This</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {similarJobs.map(job => (
          <div
            key={job._id}
            className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition cursor-pointer border border-gray-100"
            onClick={() => navigate(`/jobs/${job._id}`)}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-1">{job.title}</h3>
            <p className="text-sm text-gray-600 mb-3">{job.companyName || 'Company'}</p>

            <div className="space-y-2 mb-4 text-sm">
              {job.location && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{job.location}</span>
                </div>
              )}
              {job.salary?.min && (
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign className="w-4 h-4" />
                  <span>${job.salary.min.toLocaleString()} - ${job.salary.max?.toLocaleString() || 'Negotiable'}</span>
                </div>
              )}
              {job.jobType && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Briefcase className="w-4 h-4" />
                  <span>{job.jobType}</span>
                </div>
              )}
            </div>

            {job.skills && job.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {job.skills.slice(0, 3).map((skill, idx) => (
                  <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {skill}
                  </span>
                ))}
                {job.skills.length > 3 && (
                  <span className="text-xs text-gray-600">+{job.skills.length - 3}</span>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/jobs/${job._id}`)}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                View Job
              </button>
              <ShareButton job={job} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SimilarJobs;

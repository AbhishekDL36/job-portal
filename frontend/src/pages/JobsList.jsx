import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsAPI, applicationsAPI } from '../api/auth';
import { MapPin, DollarSign, Briefcase, Search, CheckCircle } from 'lucide-react';

function JobsList() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    jobType: '',
  });

  useEffect(() => {
    fetchJobs();
    fetchUserApplications();
  }, [filters]);

  const fetchUserApplications = async () => {
    try {
      const response = await applicationsAPI.getUserApplications();
      const jobIds = response.data.map(app => app.jobId._id);
      setAppliedJobIds(jobIds);
    } catch (err) {
      console.error('Failed to fetch user applications:', err);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.location) params.location = filters.location;
      if (filters.jobType) params.jobType = filters.jobType;
      
      const response = await jobsAPI.getAllJobs(params);
      setJobs(response.data);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) {
      fetchJobs();
      return;
    }
    try {
      setLoading(true);
      const response = await jobsAPI.searchJobs(searchQuery);
      setJobs(response.data);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (searchQuery) {
      return job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
             job.companyName?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Browse Jobs</h1>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by job title, company..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <select
                value={filters.jobType}
                onChange={(e) => setFilters({...filters, jobType: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Job Types</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="remote">Remote</option>
              </select>
            </div>

            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Search
            </button>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading jobs...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No jobs found. Try adjusting your filters.</p>
            </div>
          ) : (
            filteredJobs.map(job => {
              const isApplied = appliedJobIds.includes(job._id);
              return (
                <div
                  key={job._id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                >
                  <div 
                    className="cursor-pointer"
                    onClick={() => navigate(`/jobs/${job._id}`)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
                        <p className="text-gray-600">{job.companyName || 'Company'}</p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {job.jobType}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>

                    <div className="flex flex-wrap gap-6 mb-4">
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
                      {job.experience && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Briefcase className="w-4 h-4" />
                          <span>{job.experience}</span>
                        </div>
                      )}
                    </div>

                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {job.skills.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 3 && (
                          <span className="text-gray-600 text-sm">+{job.skills.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Applied Status Button */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {isApplied ? (
                      <button
                        disabled
                        className="w-full bg-green-100 text-green-700 px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Applied
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/jobs/${job._id}`)}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default JobsList;

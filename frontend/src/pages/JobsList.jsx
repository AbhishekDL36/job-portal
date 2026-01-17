import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsAPI, applicationsAPI } from '../api/auth';
import { MapPin, DollarSign, Briefcase, Search, CheckCircle } from 'lucide-react';
import ShareButton from '../components/ShareButton';

function JobsList() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]); // Store all jobs for filtering
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    searchType: 'all', // 'all', 'company', 'profile', 'skills'
    category: '',
    location: '',
    jobType: '',
    minSalary: '',
    maxSalary: '',
    skills: [],
    skillMatchType: 'any', // 'any' or 'all'
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
      setAllJobs(response.data);
      applyFilters(response.data);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (jobsToFilter) => {
    let filtered = [...jobsToFilter];

    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job => {
        const matchTitle = job.title?.toLowerCase().includes(query);
        const matchCompany = job.companyName?.toLowerCase().includes(query);
        const matchDescription = job.description?.toLowerCase().includes(query);
        const matchSkills = job.skills?.some(skill => skill.toLowerCase().includes(query));
        
        if (filters.searchType === 'company') return matchCompany;
        if (filters.searchType === 'profile') return matchTitle;
        if (filters.searchType === 'skills') return matchSkills;
        return matchTitle || matchCompany || matchDescription || matchSkills;
      });
    }

    // Salary filter
    if (filters.minSalary) {
      const minSal = Number(filters.minSalary);
      filtered = filtered.filter(job => !job.salary?.min || job.salary.min >= minSal);
    }
    if (filters.maxSalary) {
      const maxSal = Number(filters.maxSalary);
      filtered = filtered.filter(job => !job.salary?.max || job.salary.max <= maxSal);
    }

    // Skills filter
    if (filters.skills.length > 0) {
      filtered = filtered.filter(job => {
        const jobSkills = job.skills?.map(s => s.toLowerCase()) || [];
        const selectedSkills = filters.skills.map(s => s.toLowerCase());
        
        if (filters.skillMatchType === 'all') {
          return selectedSkills.every(skill => jobSkills.includes(skill));
        } else {
          return selectedSkills.some(skill => jobSkills.includes(skill));
        }
      });
    }

    setJobs(filtered);
  };

  const handleSearch = async () => {
    if (!searchQuery) {
      applyFilters(allJobs);
      return;
    }
    applyFilters(allJobs);
  };

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    // Re-apply filters with new filter settings
    setTimeout(() => applyFilters(allJobs), 0);
  };

  const addSkillFilter = (skill) => {
    if (!filters.skills.includes(skill)) {
      const newSkills = [...filters.skills, skill];
      handleFilterChange('skills', newSkills);
    }
  };

  const removeSkillFilter = (skill) => {
    const newSkills = filters.skills.filter(s => s !== skill);
    handleFilterChange('skills', newSkills);
  };

  const filteredJobs = jobs;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Browse Jobs</h1>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          {/* Main Search Bar */}
          <div className="mb-4">
            <div className="flex gap-2 items-center mb-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by job title, company, skills, keywords..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filters.searchType}
                onChange={(e) => handleFilterChange('searchType', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Search All</option>
                <option value="company">Company</option>
                <option value="profile">Job Title</option>
                <option value="skills">Skills</option>
              </select>
              <button
                onClick={handleSearch}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
              >
                Search
              </button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
              <select
                value={filters.jobType}
                onChange={(e) => handleFilterChange('jobType', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Types</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="remote">Remote</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary ($)</label>
              <input
                type="number"
                value={filters.minSalary}
                onChange={(e) => handleFilterChange('minSalary', e.target.value)}
                placeholder="Min"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Salary ($)</label>
              <input
                type="number"
                value={filters.maxSalary}
                onChange={(e) => handleFilterChange('maxSalary', e.target.value)}
                placeholder="Max"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm font-medium mt-6"
              >
                {showAdvancedFilters ? 'Hide Filters' : 'Advanced Filters'}
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="border-t pt-4 mt-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Skills</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    id="skillInput"
                    placeholder="Enter skill (e.g., React, Python, Java)"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById('skillInput');
                      if (input.value.trim()) {
                        addSkillFilter(input.value.trim());
                        input.value = '';
                      }
                    }}
                    className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 text-sm font-medium"
                  >
                    Add Skill
                  </button>
                </div>

                {/* Selected Skills */}
                {filters.skills.length > 0 && (
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-xs font-medium text-gray-600">Match:</label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="skillMatch"
                          value="any"
                          checked={filters.skillMatchType === 'any'}
                          onChange={() => handleFilterChange('skillMatchType', 'any')}
                          className="w-3 h-3"
                        />
                        <span className="text-xs text-gray-600">Any Skill</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="skillMatch"
                          value="all"
                          checked={filters.skillMatchType === 'all'}
                          onChange={() => handleFilterChange('skillMatchType', 'all')}
                          className="w-3 h-3"
                        />
                        <span className="text-xs text-gray-600">All Skills</span>
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {filters.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          {skill}
                          <button
                            onClick={() => removeSkillFilter(skill)}
                            className="text-blue-700 hover:text-blue-900 font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setFilters({
                    searchType: 'all',
                    category: '',
                    location: '',
                    jobType: '',
                    minSalary: '',
                    maxSalary: '',
                    skills: [],
                    skillMatchType: 'any',
                  });
                  setSearchQuery('');
                  applyFilters(allJobs);
                  setShowAdvancedFilters(false);
                }}
                className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 text-sm font-medium"
              >
                Reset Filters
              </button>
            </div>
          )}
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

                  {/* Applied Status Button & Share */}
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
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
                          onClick={() => navigate(`/jobs/${job._id}`)}
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
                        >
                          Apply Now
                        </button>
                      )}
                      <ShareButton job={job} />
                    </div>
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

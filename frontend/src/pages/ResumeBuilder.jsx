import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resumeAPI, authAPI } from '../api/auth';
import { useNotification } from '../context/NotificationContext';
import { Save, Plus, Trash2, AlertCircle, CheckCircle, Lightbulb, TrendingUp, Eye } from 'lucide-react';

function ResumeBuilder() {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [resume, setResume] = useState({
    title: 'My Resume',
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    projects: [],
    languages: [],
  });
  const [atsScore, setAtsScore] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchResumeAndUserData();
  }, []);

  const fetchResumeAndUserData = async () => {
    try {
      setLoading(true);
      
      // First, fetch user profile to get name and skills
      let userProfile = null;
      try {
        const userResponse = await authAPI.getProfile();
        userProfile = userResponse.data;
      } catch (err) {
        console.log('Could not fetch user profile');
      }

      // Try to fetch existing resume
      try {
        const response = await resumeAPI.getResume();
        setResume(response.data);
        setAtsScore(response.data.atsScore || 0);
        setSuggestions(response.data.suggestions || []);
      } catch (err) {
        // No resume found yet - create new with user data
        console.log('No resume found yet - creating new with user data');
        
        if (userProfile) {
          // Pre-fill with user data
          const newResume = {
            title: 'My Resume',
            personalInfo: {
              fullName: userProfile.name || '',
              email: userProfile.email || '',
              phone: userProfile.phone || '',
              location: userProfile.location || '',
              website: '',
              linkedin: '',
            },
            summary: '',
            experience: [],
            education: [],
            skills: userProfile.skills ? userProfile.skills.map(skill => ({
              skill: skill,
              proficiency: 'Intermediate'
            })) : [],
            certifications: [],
            projects: [],
            languages: [],
          };
          setResume(newResume);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await resumeAPI.saveResume(resume);
      setAtsScore(response.data.resume.atsScore);
      setSuggestions(response.data.resume.suggestions);
      addNotification('✅ Resume saved successfully!', 'success');
    } catch (err) {
      addNotification('❌ Failed to save resume', 'error');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const updatePersonalInfo = (field, value) => {
    setResume({
      ...resume,
      personalInfo: { ...resume.personalInfo, [field]: value },
    });
  };

  const addExperience = () => {
    setResume({
      ...resume,
      experience: [
        ...resume.experience,
        {
          jobTitle: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          currentlyWorking: false,
          description: '',
        },
      ],
    });
  };

  const updateExperience = (index, field, value) => {
    const newExp = [...resume.experience];
    newExp[index][field] = value;
    setResume({ ...resume, experience: newExp });
  };

  const removeExperience = (index) => {
    setResume({
      ...resume,
      experience: resume.experience.filter((_, i) => i !== index),
    });
  };

  const addEducation = () => {
    setResume({
      ...resume,
      education: [
        ...resume.education,
        {
          degree: '',
          institution: '',
          fieldOfStudy: '',
          startDate: '',
          endDate: '',
          score: '',
          description: '',
        },
      ],
    });
  };

  const updateEducation = (index, field, value) => {
    const newEdu = [...resume.education];
    newEdu[index][field] = value;
    setResume({ ...resume, education: newEdu });
  };

  const removeEducation = (index) => {
    setResume({
      ...resume,
      education: resume.education.filter((_, i) => i !== index),
    });
  };

  const addSkill = () => {
    setResume({
      ...resume,
      skills: [...resume.skills, { skill: '', proficiency: 'Intermediate' }],
    });
  };

  const updateSkill = (index, field, value) => {
    const newSkills = [...resume.skills];
    newSkills[index][field] = value;
    setResume({ ...resume, skills: newSkills });
  };

  const removeSkill = (index) => {
    setResume({
      ...resume,
      skills: resume.skills.filter((_, i) => i !== index),
    });
  };

  const getATSColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getATSBgColor = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Resume Builder</h1>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate('/resume-preview')}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 font-semibold"
                  >
                    <Eye className="w-5 h-5" />
                    Preview & Download
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2 font-semibold"
                  >
                    <Save className="w-5 h-5" />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-6 border-b border-gray-200 flex-wrap">
                {['personal', 'summary', 'experience', 'education', 'skills', 'projects'].map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 font-medium capitalize ${
                        activeTab === tab
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tab}
                    </button>
                  )
                )}
              </div>

              {/* Personal Info Tab */}
              {activeTab === 'personal' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold mb-4">Personal Information</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={resume.personalInfo.fullName}
                      onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                      className="col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={resume.personalInfo.email}
                      onChange={(e) => updatePersonalInfo('email', e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={resume.personalInfo.phone}
                      onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Location"
                      value={resume.personalInfo.location}
                      onChange={(e) => updatePersonalInfo('location', e.target.value)}
                      className="col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="url"
                      placeholder="Website (optional)"
                      value={resume.personalInfo.website}
                      onChange={(e) => updatePersonalInfo('website', e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="url"
                      placeholder="LinkedIn (optional)"
                      value={resume.personalInfo.linkedin}
                      onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Summary Tab */}
              {activeTab === 'summary' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold mb-4">Professional Summary</h2>
                  <textarea
                    placeholder="Write a brief professional summary (50-200 words)"
                    value={resume.summary}
                    onChange={(e) => setResume({ ...resume, summary: e.target.value })}
                    rows="6"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500">{resume.summary.length}/500 characters</p>
                </div>
              )}

              {/* Experience Tab */}
              {activeTab === 'experience' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Work Experience</h2>
                    <button
                      onClick={addExperience}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 flex items-center gap-1 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                  {resume.experience.map((exp, idx) => (
                    <div key={idx} className="border border-gray-300 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <h3 className="font-semibold">Experience {idx + 1}</h3>
                        <button
                          onClick={() => removeExperience(idx)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Job Title"
                          value={exp.jobTitle}
                          onChange={(e) => updateExperience(idx, 'jobTitle', e.target.value)}
                          className="col-span-2 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Company"
                          value={exp.company}
                          onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Location"
                          value={exp.location}
                          onChange={(e) => updateExperience(idx, 'location', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <input
                          type="date"
                          value={exp.startDate}
                          onChange={(e) => updateExperience(idx, 'startDate', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <input
                          type="date"
                          value={exp.endDate}
                          disabled={exp.currentlyWorking}
                          onChange={(e) => updateExperience(idx, 'endDate', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100"
                        />
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={exp.currentlyWorking}
                            onChange={(e) => updateExperience(idx, 'currentlyWorking', e.target.checked)}
                            className="rounded"
                          />
                          Currently Working
                        </label>
                        <textarea
                          placeholder="Job description (use action verbs)"
                          value={exp.description}
                          onChange={(e) => updateExperience(idx, 'description', e.target.value)}
                          rows="3"
                          className="col-span-2 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Education Tab */}
              {activeTab === 'education' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Education</h2>
                    <button
                      onClick={addEducation}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 flex items-center gap-1 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                  {resume.education.map((edu, idx) => (
                    <div key={idx} className="border border-gray-300 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <h3 className="font-semibold">Education {idx + 1}</h3>
                        <button
                          onClick={() => removeEducation(idx)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Degree"
                          value={edu.degree}
                          onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                          className="col-span-2 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Institution"
                          value={edu.institution}
                          onChange={(e) => updateEducation(idx, 'institution', e.target.value)}
                          className="col-span-2 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Field of Study"
                          value={edu.fieldOfStudy}
                          onChange={(e) => updateEducation(idx, 'fieldOfStudy', e.target.value)}
                          className="col-span-2 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <input
                          type="date"
                          value={edu.startDate}
                          onChange={(e) => updateEducation(idx, 'startDate', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <input
                          type="date"
                          value={edu.endDate}
                          onChange={(e) => updateEducation(idx, 'endDate', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="GPA/Score (optional)"
                          value={edu.score}
                          onChange={(e) => updateEducation(idx, 'score', e.target.value)}
                          className="col-span-2 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Skills Tab */}
              {activeTab === 'skills' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Skills</h2>
                    <button
                      onClick={addSkill}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 flex items-center gap-1 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resume.skills.map((skill, idx) => (
                      <div key={idx} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Skill name"
                            value={skill.skill}
                            onChange={(e) => updateSkill(idx, 'skill', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>
                        <div className="flex-1">
                          <select
                            value={skill.proficiency}
                            onChange={(e) => updateSkill(idx, 'proficiency', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            <option>Beginner</option>
                            <option>Intermediate</option>
                            <option>Advanced</option>
                            <option>Expert</option>
                          </select>
                        </div>
                        <button
                          onClick={() => removeSkill(idx)}
                          className="text-red-600 hover:text-red-700 p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects Tab */}
              {activeTab === 'projects' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Projects</h2>
                    <button
                      onClick={() =>
                        setResume({
                          ...resume,
                          projects: [
                            ...resume.projects,
                            {
                              projectName: '',
                              description: '',
                              link: '',
                              technologies: [],
                            },
                          ],
                        })
                      }
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 flex items-center gap-1 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                  {resume.projects?.length === 0 ? (
                    <p className="text-gray-600 text-center py-6">No projects added yet. Click "Add" to get started!</p>
                  ) : (
                    resume.projects?.map((project, idx) => (
                      <div key={idx} className="border border-gray-300 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between">
                          <h3 className="font-semibold">Project {idx + 1}</h3>
                          <button
                            onClick={() =>
                              setResume({
                                ...resume,
                                projects: resume.projects.filter((_, i) => i !== idx),
                              })
                            }
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Project Name"
                            value={project.projectName}
                            onChange={(e) => {
                              const newProjects = [...resume.projects];
                              newProjects[idx].projectName = e.target.value;
                              setResume({ ...resume, projects: newProjects });
                            }}
                            className="col-span-2 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                          <textarea
                            placeholder="Project Description"
                            value={project.description}
                            onChange={(e) => {
                              const newProjects = [...resume.projects];
                              newProjects[idx].description = e.target.value;
                              setResume({ ...resume, projects: newProjects });
                            }}
                            rows="3"
                            className="col-span-2 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                          <input
                            type="url"
                            placeholder="Project Link (optional)"
                            value={project.link}
                            onChange={(e) => {
                              const newProjects = [...resume.projects];
                              newProjects[idx].link = e.target.value;
                              setResume({ ...resume, projects: newProjects });
                            }}
                            className="col-span-2 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                          <input
                            type="text"
                            placeholder="Technologies (comma-separated)"
                            value={project.technologies?.join(', ') || ''}
                            onChange={(e) => {
                              const newProjects = [...resume.projects];
                              newProjects[idx].technologies = e.target.value
                                .split(',')
                                .map((tech) => tech.trim())
                                .filter((tech) => tech);
                              setResume({ ...resume, projects: newProjects });
                            }}
                            className="col-span-2 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - ATS Score & Suggestions */}
          <div className="space-y-4">
            {/* ATS Score Card */}
            <div className={`rounded-lg shadow-md p-6 ${getATSBgColor(atsScore)}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">ATS Score</h2>
                <TrendingUp className={`w-6 h-6 ${getATSColor(atsScore)}`} />
              </div>
              <div className={`text-4xl font-bold ${getATSColor(atsScore)} mb-2`}>
                {atsScore}/100
              </div>
              <div className="w-full bg-gray-300 rounded-full h-2 mb-4">
                <div
                  className={`h-2 rounded-full transition-all ${
                    atsScore >= 80
                      ? 'bg-green-600'
                      : atsScore >= 60
                      ? 'bg-yellow-600'
                      : 'bg-red-600'
                  }`}
                  style={{ width: `${atsScore}%` }}
                />
              </div>
              <p className="text-sm text-gray-700">
                {atsScore >= 80
                  ? '✅ Excellent ATS compatibility!'
                  : atsScore >= 60
                  ? '⚠️ Good, but can be improved'
                  : '❌ Needs improvement'}
              </p>
            </div>

            {/* Suggestions Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-6 h-6 text-yellow-600" />
                <h2 className="text-lg font-bold">Suggestions</h2>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {suggestions.length === 0 ? (
                  <p className="text-gray-600 text-sm">Save your resume to get suggestions</p>
                ) : (
                  suggestions.map((suggestion, idx) => (
                    <div key={idx} className="flex gap-2 text-sm">
                      <span className="text-blue-600 flex-shrink-0">→</span>
                      <p className="text-gray-700">{suggestion}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Resume Preview Quick Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold mb-4">Resume Stats</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Experiences:</span>
                  <span className="font-semibold">{resume.experience.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Education:</span>
                  <span className="font-semibold">{resume.education.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Skills:</span>
                  <span className="font-semibold">{resume.skills.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Summary Length:</span>
                  <span className="font-semibold">{resume.summary.length} chars</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeBuilder;

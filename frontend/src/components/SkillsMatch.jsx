import React, { useState, useEffect } from 'react';
import { resumeAPI } from '../api/auth';
import { CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

function SkillsMatch({ job }) {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matchPercentage, setMatchPercentage] = useState(0);
  const [matchedSkills, setMatchedSkills] = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);

  useEffect(() => {
    fetchResumeAndCalculateMatch();
  }, [job]);

  const fetchResumeAndCalculateMatch = async () => {
    try {
      setLoading(true);
      const response = await resumeAPI.getResume();
      const userResume = response.data;
      setResume(userResume);

      // Get user skills
      const userSkills = (userResume.skills || []).map(s => s.skill.toLowerCase());
      const jobSkills = (job.skills || []).map(s => s.toLowerCase());

      // Calculate matched and missing skills
      const matched = jobSkills.filter(skill => 
        userSkills.some(userSkill => 
          userSkill.includes(skill) || skill.includes(userSkill)
        )
      );

      const missing = jobSkills.filter(skill => 
        !userSkills.some(userSkill => 
          userSkill.includes(skill) || skill.includes(userSkill)
        )
      );

      setMatchedSkills(matched);
      setMissingSkills(missing);

      const percentage = jobSkills.length > 0 
        ? Math.round((matched.length / jobSkills.length) * 100)
        : 100;
      setMatchPercentage(percentage);
    } catch (err) {
      console.error('Failed to fetch resume:', err);
      // If no resume, show all as missing
      const jobSkills = (job.skills || []).map(s => s.toLowerCase());
      setMissingSkills(jobSkills);
      setMatchedSkills([]);
      setMatchPercentage(0);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-gray-600 text-sm">Analyzing skills match...</div>;
  }

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMatchBgColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-50 border-green-200';
    if (percentage >= 50) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-600';
    if (percentage >= 50) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <div className={`rounded-lg border-2 p-6 ${getMatchBgColor(matchPercentage)}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className={`w-6 h-6 ${getMatchColor(matchPercentage)}`} />
          <h3 className="text-lg font-bold">Skills Match Analysis</h3>
        </div>
        <div className={`text-2xl font-bold ${getMatchColor(matchPercentage)}`}>
          {matchPercentage}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-300 rounded-full h-2 mb-6">
        <div
          className={`h-2 rounded-full transition-all ${getProgressColor(matchPercentage)}`}
          style={{ width: `${matchPercentage}%` }}
        />
      </div>

      {/* Matched Skills */}
      {matchedSkills.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-gray-900">
              Your Skills ({matchedSkills.length})
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {matchedSkills.map((skill, idx) => (
              <span
                key={idx}
                className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"
              >
                <span className="text-green-600">✓</span>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing Skills */}
      {missingSkills.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h4 className="font-semibold text-gray-900">
              Skills to Develop ({missingSkills.length})
            </h4>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex flex-wrap gap-2 mb-4">
              {missingSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"
                >
                  <span className="text-red-600">✕</span>
                  {skill}
                </span>
              ))}
            </div>

            {matchPercentage < 100 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900">
                  <strong>💡 Suggestion:</strong> You're a great fit with {matchPercentage}% skill match!
                  {matchPercentage >= 50
                    ? ' Consider learning the missing skills to strengthen your application.'
                    : ' We recommend building skills in these areas before applying.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Perfect Match */}
      {matchPercentage === 100 && (
        <div className="bg-green-100 border border-green-300 rounded-lg p-4">
          <p className="text-green-900 font-semibold">
            ✓ Perfect match! You have all the required skills for this position.
          </p>
        </div>
      )}
    </div>
  );
}

export default SkillsMatch;

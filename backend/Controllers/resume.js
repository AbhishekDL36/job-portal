import Resume from "../Models/resume.js";
import Job from "../Models/job.js";
import User from "../Models/user.js";

// Calculate ATS Score
function calculateATSScore(resume, jobDescription = '') {
  let score = 0;
  let feedback = [];

  // 1. Personal Info (10 points)
  if (resume.personalInfo?.fullName) score += 2;
  if (resume.personalInfo?.email) score += 2;
  if (resume.personalInfo?.phone) score += 2;
  if (resume.personalInfo?.location) score += 2;
  if (resume.personalInfo?.linkedin) score += 2;

  // 2. Summary (10 points)
  if (resume.summary && resume.summary.length > 50) score += 10;
  else if (resume.summary && resume.summary.length > 20) score += 5;

  // 3. Experience (20 points)
  if (resume.experience.length > 0) {
    const maxExpPoints = 20;
    const pointsPerEntry = maxExpPoints / 5;
    const expPoints = Math.min(resume.experience.length * pointsPerEntry, maxExpPoints);
    score += expPoints;

    // Check description quality
    const withDescriptions = resume.experience.filter(
      (exp) => exp.description && exp.description.length > 50
    ).length;
    if (withDescriptions > 0) score += 5;
  } else {
    feedback.push('⚠️ Add work experience to improve your ATS score');
  }

  // 4. Education (15 points)
  if (resume.education.length > 0) {
    score += 15;
  } else {
    feedback.push('⚠️ Add your education background');
  }

  // 5. Skills (20 points)
  if (resume.skills.length > 0) {
    const skillPoints = Math.min(resume.skills.length * 2, 20);
    score += skillPoints;
  } else {
    feedback.push('⚠️ Add at least 5 relevant skills');
  }

  // 6. Certifications (5 points)
  if (resume.certifications && resume.certifications.length > 0) {
    score += 5;
  }

  // 7. Projects (10 points)
  if (resume.projects && resume.projects.length > 0) {
    const projectPoints = Math.min(resume.projects.length * 2, 10);
    score += projectPoints;
  } else {
    feedback.push('⚠️ Add projects to showcase your work');
  }

  // 8. Languages (5 points)
  if (resume.languages && resume.languages.length > 0) {
    score += 5;
  }

  // 9. Keyword Matching with Job Description (15 points)
  if (jobDescription && jobDescription.length > 0) {
    const jobKeywords = jobDescription.toLowerCase().split(/\s+/);
    const resumeText = JSON.stringify(resume).toLowerCase();

    let matchCount = 0;
    const importantKeywords = jobKeywords.filter(
      (keyword) => keyword.length > 4 && !['that', 'this', 'with', 'from'].includes(keyword)
    );

    importantKeywords.forEach((keyword) => {
      if (resumeText.includes(keyword)) matchCount++;
    });

    const keywordScore = Math.min(
      (matchCount / Math.max(importantKeywords.length, 1)) * 15,
      15
    );
    score += keywordScore;

    // Add missing keywords to feedback
    const missingKeywords = importantKeywords
      .filter((keyword) => !resumeText.includes(keyword))
      .slice(0, 5);
    if (missingKeywords.length > 0) {
      feedback.push(
        `💡 Add these skills: ${missingKeywords.join(', ')}`
      );
    }
  }

  // Cap score at 100
  score = Math.min(Math.round(score), 100);

  return { score, feedback };
}

// Generate AI Suggestions
function generateSuggestions(resume, jobDescription = '') {
  const suggestions = [];

  // General suggestions
  if (!resume.summary) {
    suggestions.push('✨ Add a professional summary (2-3 sentences about yourself)');
  } else if (resume.summary.length < 50) {
    suggestions.push('✨ Expand your summary with more details (aim for 100+ characters)');
  }

  if (resume.experience.length === 0) {
    suggestions.push('✨ Add your work experience with detailed descriptions');
  } else if (resume.experience.some((exp) => !exp.description || exp.description.length < 30)) {
    suggestions.push('✨ Add detailed descriptions for each job (use action verbs like "Developed", "Managed", "Led")');
  }

  if (resume.skills.length < 5) {
    suggestions.push('✨ Add at least 5 key skills relevant to your target role');
  }

  if (!resume.projects || resume.projects.length === 0) {
    suggestions.push('✨ Add projects you\'ve completed to demonstrate practical skills');
  }

  if (resume.education.length === 0) {
    suggestions.push('✨ Add your educational background');
  }

  // Job-specific suggestions
  if (jobDescription) {
    const jobKeywords = extractKeywords(jobDescription);
    const resumeSkills = resume.skills.map((s) => s.skill.toLowerCase());

    const missingSkills = jobKeywords.filter(
      (keyword) => !resumeSkills.includes(keyword.toLowerCase())
    );

    if (missingSkills.length > 0) {
      suggestions.push(
        `🎯 For better matching: Consider highlighting or adding these skills: ${missingSkills.slice(0, 3).join(', ')}`
      );
    }
  }

  // Formatting suggestions
  if (resume.experience.length > 0) {
    const experienceWithoutDates = resume.experience.filter(
      (exp) => !exp.startDate || !exp.endDate
    );
    if (experienceWithoutDates.length > 0) {
      suggestions.push('📋 Add start and end dates for all experiences');
    }
  }

  return suggestions;
}

function extractKeywords(text) {
  if (!text) return [];
  const words = text.toLowerCase().split(/\s+/);
  return words
    .filter((word) => word.length > 4 && !['that', 'this', 'with', 'from', 'have', 'your', 'which'].includes(word))
    .slice(0, 20);
}

// Create or Update Resume
export async function saveResume(req, res) {
  try {
    const { title, personalInfo, summary, experience, education, skills, certifications, projects, languages, jobId } = req.body;

    let jobDescription = '';
    if (jobId) {
      const job = await Job.findById(jobId);
      if (job) jobDescription = job.description;
    }

    let resume = await Resume.findOne({ userId: req.userId });

    if (resume) {
      // Update existing
      resume.title = title || resume.title;
      resume.personalInfo = personalInfo || resume.personalInfo;
      resume.summary = summary || resume.summary;
      resume.experience = experience || resume.experience;
      resume.education = education || resume.education;
      resume.skills = skills || resume.skills;
      resume.certifications = certifications || resume.certifications;
      resume.projects = projects || resume.projects;
      resume.languages = languages || resume.languages;
    } else {
      // Create new
      resume = new Resume({
        userId: req.userId,
        title,
        personalInfo,
        summary,
        experience,
        education,
        skills,
        certifications,
        projects,
        languages,
      });
    }

    // Calculate ATS score
    const { score, feedback } = calculateATSScore(resume, jobDescription);
    resume.atsScore = score;

    const suggestions = generateSuggestions(resume, jobDescription);
    resume.suggestions = [...feedback, ...suggestions];

    resume.updatedAt = new Date();
    await resume.save();

    res.json({
      message: 'Resume saved successfully',
      resume,
    });
  } catch (error) {
    console.error('Save resume error:', error);
    res.status(500).json({ message: error.message });
  }
}

// Get Resume
export async function getResume(req, res) {
  try {
    const resume = await Resume.findOne({ userId: req.userId });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    res.json(resume);
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({ message: error.message });
  }
}

// Delete Resume
export async function deleteResume(req, res) {
  try {
    await Resume.findOneAndDelete({ userId: req.userId });
    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({ message: error.message });
  }
}

// Calculate ATS Score for Specific Job
export async function calculateJobMatchScore(req, res) {
  try {
    const { jobId } = req.params;

    const resume = await Resume.findOne({ userId: req.userId });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const { score, feedback } = calculateATSScore(resume, job.description);
    const suggestions = generateSuggestions(resume, job.description);

    res.json({
      jobTitle: job.title,
      atsScore: score,
      feedback,
      suggestions: [...feedback, ...suggestions],
    });
  } catch (error) {
    console.error('Calculate job match score error:', error);
    res.status(500).json({ message: error.message });
  }
}

// Get Resume Suggestions
export async function getResumeSuggestions(req, res) {
  try {
    const resume = await Resume.findOne({ userId: req.userId });

    if (!resume) {
      return res.status(404).json({
        message: 'Create a resume first to get suggestions',
      });
    }

    const suggestions = generateSuggestions(resume);

    res.json({
      atsScore: resume.atsScore,
      suggestions,
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ message: error.message });
  }
}

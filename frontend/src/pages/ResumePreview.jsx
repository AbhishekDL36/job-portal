import React, { useState, useEffect, useRef } from 'react';
import { resumeAPI } from '../api/auth';
import { Download, Printer, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function ResumePreview() {
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef();

  useEffect(() => {
    fetchResume();
  }, []);

  const fetchResume = async () => {
    try {
      setLoading(true);
      const response = await resumeAPI.getResume();
      setResume(response.data);
    } catch (err) {
      console.error('Failed to fetch resume:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Using browser's print-to-PDF feature
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${resume?.personalInfo?.fullName || 'Resume'}.pdf</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              max-width: 8.5in;
              margin: 0;
              padding: 0.5in;
              color: #333;
            }
            h1 { font-size: 24px; margin: 0 0 5px 0; }
            h2 { font-size: 16px; margin: 15px 0 8px 0; border-bottom: 2px solid #007bff; padding-bottom: 5px; }
            h3 { font-size: 14px; margin: 10px 0 3px 0; }
            .header { text-align: center; margin-bottom: 20px; }
            .contact-info { text-align: center; font-size: 12px; margin-bottom: 15px; }
            .section { margin-bottom: 15px; }
            .entry { margin-bottom: 12px; }
            .entry-header { display: flex; justify-content: space-between; }
            .entry-title { font-weight: bold; }
            .entry-subtitle { font-style: italic; color: #666; }
            .entry-date { font-size: 12px; color: #666; }
            .entry-description { margin-top: 5px; font-size: 14px; }
            .skills-list { display: flex; flex-wrap: wrap; gap: 8px; }
            .skill-tag { background: #f0f0f0; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
            ul { margin: 5px 0; padding-left: 20px; }
            li { margin: 3px 0; }
            @media print {
              body { margin: 0; padding: 0.5in; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${resume?.personalInfo?.fullName || 'Resume'}</h1>
            <div class="contact-info">
              ${resume?.personalInfo?.email ? `<span>${resume.personalInfo.email}</span> | ` : ''}
              ${resume?.personalInfo?.phone ? `<span>${resume.personalInfo.phone}</span> | ` : ''}
              ${resume?.personalInfo?.location ? `<span>${resume.personalInfo.location}</span>` : ''}
            </div>
          </div>

          ${
            resume?.summary
              ? `
            <div class="section">
              <h2>Professional Summary</h2>
              <p>${resume.summary}</p>
            </div>
          `
              : ''
          }

          ${
            resume?.experience && resume.experience.length > 0
              ? `
            <div class="section">
              <h2>Work Experience</h2>
              ${resume.experience
                .map(
                  (exp) => `
                <div class="entry">
                  <div class="entry-header">
                    <span class="entry-title">${exp.jobTitle || ''}</span>
                    <span class="entry-date">
                      ${exp.startDate ? new Date(exp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : ''}
                      ${
                        exp.currentlyWorking
                          ? ' - Present'
                          : exp.endDate
                          ? ' - ' + new Date(exp.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
                          : ''
                      }
                    </span>
                  </div>
                  <div class="entry-subtitle">${exp.company || ''} ${exp.location ? '| ' + exp.location : ''}</div>
                  ${exp.description ? `<div class="entry-description">${exp.description}</div>` : ''}
                </div>
              `
                )
                .join('')}
            </div>
          `
              : ''
          }

          ${
            resume?.education && resume.education.length > 0
              ? `
            <div class="section">
              <h2>Education</h2>
              ${resume.education
                .map(
                  (edu) => `
                <div class="entry">
                  <div class="entry-header">
                    <span class="entry-title">${edu.degree || ''}</span>
                    <span class="entry-date">
                      ${edu.startDate ? new Date(edu.startDate).toLocaleDateString('en-US', { year: 'numeric' }) : ''}
                      ${edu.endDate ? ' - ' + new Date(edu.endDate).toLocaleDateString('en-US', { year: 'numeric' }) : ''}
                    </span>
                  </div>
                  <div class="entry-subtitle">${edu.institution || ''}</div>
                  ${edu.fieldOfStudy ? `<div>${edu.fieldOfStudy}</div>` : ''}
                  ${edu.score ? `<div>GPA: ${edu.score}</div>` : ''}
                </div>
              `
                )
                .join('')}
            </div>
          `
              : ''
          }

          ${
            resume?.skills && resume.skills.length > 0
              ? `
            <div class="section">
              <h2>Skills</h2>
              <div class="skills-list">
                ${resume.skills
                  .map(
                    (skill) => `
                  <div class="skill-tag">${skill.skill}</div>
                `
                  )
                  .join('')}
              </div>
            </div>
          `
              : ''
          }

          ${
            resume?.projects && resume.projects.length > 0
              ? `
            <div class="section">
              <h2>Projects</h2>
              ${resume.projects
                .map(
                  (proj) => `
                <div class="entry">
                  <div class="entry-title">${proj.projectName || ''}</div>
                  ${proj.description ? `<div class="entry-description">${proj.description}</div>` : ''}
                  ${proj.technologies && proj.technologies.length > 0 ? `<div><strong>Technologies:</strong> ${proj.technologies.join(', ')}</div>` : ''}
                </div>
              `
                )
                .join('')}
            </div>
          `
              : ''
          }

          ${
            resume?.certifications && resume.certifications.length > 0
              ? `
            <div class="section">
              <h2>Certifications</h2>
              ${resume.certifications
                .map(
                  (cert) => `
                <div class="entry">
                  <div class="entry-title">${cert.name || ''}</div>
                  <div class="entry-subtitle">${cert.issuer || ''}</div>
                </div>
              `
                )
                .join('')}
            </div>
          `
              : ''
          }
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading resume...</p>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 mb-4">No resume found</p>
          <button
            onClick={() => navigate('/resume-builder')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Create Resume
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/resume-builder')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Editor
          </button>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-medium"
            >
              <Printer className="w-5 h-5" />
              Print
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </button>
          </div>
        </div>

        {/* Resume Preview */}
        <div
          ref={printRef}
          className="bg-white rounded-lg shadow-md p-12 max-w-4xl mx-auto print:shadow-none print:rounded-none print:p-0"
        >
          {/* Header */}
          <div className="text-center mb-6 border-b-2 border-blue-600 pb-4">
            <h1 className="text-4xl font-bold text-gray-900">
              {resume?.personalInfo?.fullName || 'Your Name'}
            </h1>
            <p className="text-gray-600 mt-2">
              {resume?.personalInfo?.email && `${resume.personalInfo.email}`}
              {resume?.personalInfo?.phone && ` | ${resume.personalInfo.phone}`}
              {resume?.personalInfo?.location && ` | ${resume.personalInfo.location}`}
            </p>
          </div>

          {/* Summary */}
          {resume?.summary && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Professional Summary</h2>
              <p className="text-gray-700">{resume.summary}</p>
            </div>
          )}

          {/* Experience */}
          {resume?.experience && resume.experience.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Work Experience</h2>
              <div className="space-y-4">
                {resume.experience.map((exp, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-900">{exp.jobTitle}</h3>
                        <p className="text-gray-600">
                          {exp.company} {exp.location && `| ${exp.location}`}
                        </p>
                      </div>
                      <span className="text-gray-600 text-sm">
                        {exp.startDate && new Date(exp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                        {exp.currentlyWorking ? ' - Present' : exp.endDate ? ' - ' + new Date(exp.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : ''}
                      </span>
                    </div>
                    {exp.description && <p className="text-gray-700 mt-1">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {resume?.education && resume.education.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Education</h2>
              <div className="space-y-4">
                {resume.education.map((edu, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                        <p className="text-gray-600">{edu.institution}</p>
                        {edu.fieldOfStudy && <p className="text-gray-600">{edu.fieldOfStudy}</p>}
                      </div>
                      <span className="text-gray-600 text-sm">
                        {edu.startDate && new Date(edu.startDate).getFullYear()}
                        {edu.endDate ? ' - ' + new Date(edu.endDate).getFullYear() : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {resume?.skills && resume.skills.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {resume.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {skill.skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {resume?.projects && resume.projects.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Projects</h2>
              <div className="space-y-4">
                {resume.projects.map((proj, idx) => (
                  <div key={idx}>
                    <h3 className="font-bold text-gray-900">{proj.projectName}</h3>
                    {proj.description && <p className="text-gray-700 mt-1">{proj.description}</p>}
                    {proj.technologies && proj.technologies.length > 0 && (
                      <p className="text-gray-600 mt-1">
                        <strong>Tech:</strong> {proj.technologies.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body {
            background: white;
          }
          .max-w-4xl {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default ResumePreview;

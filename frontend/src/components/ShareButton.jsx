import React, { useState } from 'react';
import { Share2, Mail, MessageCircle, Copy, Check } from 'lucide-react';

function ShareButton({ job }) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // Create share text
  const shareText = `
Check out this job opportunity: ${job.title}

Company: ${job.companyName || 'Company'}
Location: ${job.location || 'Remote'}
Type: ${job.jobType || 'Full-time'}
${job.salary?.min ? `Salary: $${job.salary.min.toLocaleString()} - $${job.salary.max?.toLocaleString() || 'Negotiable'}` : ''}

${job.description?.substring(0, 200)}...

Apply now on Job Portal!
`.trim();

  const shareUrl = `${window.location.origin}/jobs/${job._id}`;

  // Share via Email
  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Check out this job: ${job.title}`);
    const body = encodeURIComponent(`${shareText}\n\nLink: ${shareUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setShowMenu(false);
  };

  // Share via WhatsApp
  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(`${shareText}\n\n${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setShowMenu(false);
  };

  // Copy to Clipboard
  const copyToClipboard = () => {
    const textToCopy = `${shareText}\n\n${shareUrl}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition text-sm font-medium"
        title="Share this job"
      >
        <Share2 className="w-4 h-4" />
        Share
      </button>

      {/* Share Menu */}
      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <button
            onClick={shareViaEmail}
            className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 border-b border-gray-100 transition"
          >
            <Mail className="w-5 h-5 text-red-600" />
            <span className="text-gray-700 font-medium">Share via Email</span>
          </button>

          <button
            onClick={shareViaWhatsApp}
            className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 border-b border-gray-100 transition"
          >
            <MessageCircle className="w-5 h-5 text-green-600" />
            <span className="text-gray-700 font-medium">Share on WhatsApp</span>
          </button>

          <button
            onClick={copyToClipboard}
            className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 transition"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-green-600 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700 font-medium">Copy Link</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Close menu when clicking outside */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}

export default ShareButton;

import React, { useState, useEffect } from 'react';
import { applicationsAPI } from '../api/auth';
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useApplicationMonitor } from '../hooks/useApplicationMonitor';
import { useAuth } from '../context/AuthContext';
import StartChatButton from '../components/Chat/StartChatButton';

function Applications() {
   const [applications, setApplications] = useState([]);
   const [loading, setLoading] = useState(true);
   const [filter, setFilter] = useState('all');
   const { user } = useAuth();

   // Monitor for application status changes
   useApplicationMonitor();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await applicationsAPI.getUserApplications();
      console.log('✅ Applications Response:', response.data);
      if (response.data.length > 0) {
        console.log('🔍 First App Structure:', {
          jobId: response.data[0]?.jobId,
          postedBy: response.data[0]?.jobId?.postedBy,
          employerId: response.data[0]?.jobId?.postedBy?._id,
        });
      }
      setApplications(response.data);
    } catch (err) {
      console.error('❌ Failed to fetch applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = filter === 'all' 
    ? applications 
    : applications.filter(app => app.status === filter);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'shortlisted':
        return <CheckCircle className="w-5 h-5 text-yellow-600" />;
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'shortlisted':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading your applications...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">My Applications</h1>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-8">
          {['all', 'applied', 'shortlisted', 'accepted', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium capitalize ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No applications found</p>
            </div>
          ) : (
            filteredApplications.map(app => (
              <div
                key={app._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{app.jobId?.title}</h2>
                    <p className="text-gray-600">
                      {app.jobId?.postedBy?.companyName || 'Company'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(app.status)}
                    <span className={`px-4 py-1 rounded-full font-medium capitalize ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </div>
                </div>

                {app.coverLetter && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 font-medium mb-2">Cover Letter:</p>
                    <p className="text-gray-700 line-clamp-2">{app.coverLetter}</p>
                  </div>
                )}

                <div className="flex justify-between items-center mt-4">
                   <div className="text-sm text-gray-500">
                     Applied on {new Date(app.appliedAt).toLocaleDateString()}
                   </div>
                   {(() => {
                      const employerId =
                        typeof app.jobId?.postedBy === 'string'
                          ? app.jobId.postedBy
                          : app.jobId?.postedBy?._id;

                      console.log("DEBUG EMPLOYMENT ID:", {
                        postedBy: app.jobId?.postedBy,
                        employerId,
                        jobId: app.jobId?._id,
                        userId: user?._id,
                      });

                      return employerId ? (
                       <StartChatButton 
                         employerId={employerId}
                         jobSeekerId={user?._id || user?.id}
                         jobId={app.jobId._id}
                         applicationId={app._id}
                         currentUserId={user?._id || user?.id}
                         otherPersonName={
                           app.jobId.postedBy?.companyName || app.jobId.postedBy?.name
                         }
                       />
                     ) : (
                       <button disabled className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg text-sm cursor-not-allowed">
                         Chat unavailable
                       </button>
                     );
                   })()}
                </div>

                {app.status === 'accepted' && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 font-medium">
                      Congratulations! You've been accepted for this position.
                    </p>
                  </div>
                )}

                {app.status === 'rejected' && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 font-medium">
                      Thank you for applying. We've decided to move forward with other candidates.
                    </p>
                  </div>
                )}

                {app.status === 'shortlisted' && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 font-medium">
                      Great! You've been shortlisted. The employer will contact you soon.
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Applications;

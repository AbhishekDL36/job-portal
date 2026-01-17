import { useEffect, useRef } from 'react';
import { applicationsAPI } from '../api/auth';
import { useNotification } from '../context/NotificationContext';

export function useApplicationMonitor() {
  const { addNotification } = useNotification();
  const previousStatusesRef = useRef({});

  useEffect(() => {
    let isActive = true;

    const checkApplicationUpdates = async () => {
      try {
        const response = await applicationsAPI.getUserApplications();
        const applications = response.data;

        applications.forEach((app) => {
          const appId = app._id;
          const currentStatus = app.status;
          const jobTitle = app.jobId?.title || 'Unknown Job';
          const previousStatus = previousStatusesRef.current[appId];

          // If status changed, show notification
          if (previousStatus && previousStatus !== currentStatus) {
            let message = '';
            let notificationType = 'info';

            switch (currentStatus) {
              case 'shortlisted':
                message = `🎉 Great! You've been shortlisted for "${jobTitle}"`;
                notificationType = 'success';
                break;
              case 'accepted':
                message = `🚀 Congratulations! Your application for "${jobTitle}" has been accepted!`;
                notificationType = 'success';
                break;
              case 'rejected':
                message = `📋 Your application for "${jobTitle}" has been reviewed. Thank you for applying!`;
                notificationType = 'warning';
                break;
              default:
                break;
            }

            if (message) {
              addNotification(message, notificationType, 8000);
            }
          }

          // Update the ref to current status
          previousStatusesRef.current[appId] = currentStatus;
        });
      } catch (err) {
        console.error('Failed to check application updates:', err);
      }
    };

    // Check immediately on mount
    checkApplicationUpdates();

    // Then check every 10 seconds
    const interval = setInterval(() => {
      if (isActive) {
        checkApplicationUpdates();
      }
    }, 10000);

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [addNotification]);
}

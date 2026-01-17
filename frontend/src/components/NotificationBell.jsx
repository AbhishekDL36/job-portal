import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { applicationsAPI } from '../api/auth';

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [readNotifications, setReadNotifications] = useState(new Set());

  // Load read notifications from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('readNotifications');
    if (saved) {
      setReadNotifications(new Set(JSON.parse(saved)));
    }
  }, []);

  // Fetch notifications whenever readNotifications changes
  useEffect(() => {
    fetchNotifications();
    // Check for new notifications every 10 seconds
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [readNotifications]);

  const saveReadNotifications = (readSet) => {
    localStorage.setItem('readNotifications', JSON.stringify(Array.from(readSet)));
  };

  // Note: This function will be called with updated readNotifications via useEffect dependency
  const fetchNotifications = async (readSet = readNotifications) => {
    try {
      const response = await applicationsAPI.getUserApplications();
      const apps = response.data;
      
      // Create notifications from recent status updates
      const newNotifications = apps
        .filter(app => app.status !== 'applied')
        .map(app => ({
          id: app._id,
          jobTitle: app.jobId?.title,
          status: app.status,
          timestamp: new Date(app.appliedAt),
          read: readSet.has(app._id),
        }))
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5); // Show only last 5

      setNotifications(newNotifications);
      const unreadCount = newNotifications.filter(n => !n.read).length;
      setUnreadCount(unreadCount);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );

    const newReadSet = new Set(readNotifications);
    newReadSet.add(notificationId);
    setReadNotifications(newReadSet);
    saveReadNotifications(newReadSet);

    // Update unread count immediately
    const newUnreadCount = notifications.filter(n => n.id !== notificationId && !n.read).length;
    setUnreadCount(Math.max(0, newUnreadCount));
  };

  const clearAll = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    setUnreadCount(0);

    const newReadSet = new Set(readNotifications);
    notifications.forEach(notif => newReadSet.add(notif.id));
    setReadNotifications(newReadSet);
    saveReadNotifications(newReadSet);
  };

  const getNotificationMessage = (notification) => {
    const jobTitle = notification.jobTitle || 'Unknown Job';
    switch (notification.status) {
      case 'shortlisted':
        return `🎉 Shortlisted for "${jobTitle}"`;
      case 'accepted':
        return `🚀 Accepted for "${jobTitle}"`;
      case 'rejected':
        return `📋 Application reviewed for "${jobTitle}"`;
      default:
        return jobTitle;
    }
  };

  const getNotificationColor = (status) => {
    switch (status) {
      case 'shortlisted':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'accepted':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'rejected':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition"
        title="Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
            <button
              onClick={() => setShowDropdown(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-2 p-3">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition ${getNotificationColor(
                      notification.status
                    )} ${notification.read ? 'opacity-60' : 'opacity-100 shadow-sm'}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-2">
                      <p className="font-medium text-sm flex-1">
                        {getNotificationMessage(notification)}
                      </p>
                      {!notification.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-1.5"></span>
                      )}
                    </div>
                    <p className="text-xs mt-1 opacity-75">
                      {new Date(notification.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <button
                onClick={clearAll}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;

import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Bell,
  Check,
  ExternalLink,
  FileText,
  RefreshCw,
  X,
} from "lucide-react";
import { apiRequest } from "../lib/api";

const POLL_INTERVAL = 5000;

const NotificationBell = ({
  onProjectClick,
  collapsed = false,
}) => {
  const [notifications, setNotifications] =
    useState([]);
  const [unreadCount, setUnreadCount] =
    useState(0);
  const [loading, setLoading] =
    useState(true);
  const [open, setOpen] =
    useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const response =
        await apiRequest(
          "/api/notifications?limit=50"
        );

      const list =
        Array.isArray(
          response?.data
        )
          ? response.data
          : [];

      setNotifications(list);
      setUnreadCount(
        response?.unreadCount ??
          list.filter(
            (n) => !n.isRead
          ).length
      );
    } catch (error) {
      console.error(
        "Fetch notifications error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response =
        await apiRequest(
          "/api/notifications/unread-count"
        );

      setUnreadCount(
        response?.unreadCount ?? 0
      );
    } catch {
      // use cached count
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const pollRef = useRef(null);

  useEffect(() => {
    pollRef.current =
      setInterval(
        () => {
          if (!open) {           fetchNotifications();          }
        },
        POLL_INTERVAL
      );

    return () => {
      if (pollRef.current) {
        clearInterval(
          pollRef.current
        );
      }
    };
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (
      event
    ) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target
        )
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener(
        "mousedown",
        handleClickOutside
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [open]);

  const toggleDropdown = () => {
    setOpen(
      (previous) => !previous
    );
    if (
      !open &&
      unreadCount > 0
    ) {
      fetchNotifications();
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await apiRequest(
        `/api/notifications/${notificationId}/read`,
        {
          method: "PATCH",
        }
      );

      setNotifications(
        (previous) =>
          previous.map(
            (n) =>
              String(n._id) ===
              String(notificationId)
                ? {
                    ...n,
                    isRead: true,
                    readAt:
                      new Date()
                        .toISOString(),
                  }
                : n
          )
      );

      setUnreadCount(
        (previous) =>
          previous > 0
            ? previous - 1
            : 0
      );
    } catch (error) {
      console.error(
        "Mark notification read error:",
        error
      );
    }
  };


  const clearNotification = async (notificationId) => {
    try {
      const response = await apiRequest(
        `/api/notifications/${notificationId}`,
        {
          method: "DELETE",
        }
      );

      if (response?.success === false) {
        throw new Error(
          response?.message ||
            "Failed to clear notification"
        );
      }

      const notification = notifications.find(
        (item) =>
          String(item._id) ===
          String(notificationId)
      );

      setNotifications((previous) =>
        previous.filter(
          (item) =>
            String(item._id) !==
            String(notificationId)
        )
      );

      if (notification && !notification.isRead) {
        setUnreadCount((previous) =>
          Math.max(0, previous - 1)
        );
      }
    } catch (error) {
      console.error(
        "Clear notification error:",
        error
      );
    }
  };
  const markAllAsRead = async () => {
    try {
      await apiRequest(
        "/api/notifications/read-all",
        {
          method: "PATCH",
        }
      );

      setNotifications(
        (previous) =>
          previous.map(
            (n) => ({
              ...n,
              isRead: true,
              readAt: new Date()
                .toISOString(),
            })
          )
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Mark all read error:",
        error
      );
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    setOpen(false);

    if (
      notification.project &&
      onProjectClick
    ) {
      onProjectClick(notification.project);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date =
      new Date(dateString);
    const now =
      new Date();
    const diffMs =
      now - date;
    const diffMins =
      Math.floor(
        diffMs /
        (1000 * 60)
      );
    const diffHours =
      Math.floor(
        diffMins / 60
      );
    const diffDays =
      Math.floor(
        diffHours / 24
      );

    if (diffMins < 1)
      return "Just now";
    if (diffMins < 60)
      return `${diffMins}m ago`;
    if (diffHours < 24)
      return `${diffHours}h ago`;
    if (diffDays < 7)
      return `${diffDays}d ago`;

    return date.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
      }
    );
  };

  return (
    <div
      className={`notification-bell ${
        collapsed ? "collapsed" : ""
      }`}
      ref={dropdownRef}
    >
      <button
        type="button"
        className="notification-bell-button"
        onClick={toggleDropdown}
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell size={collapsed ? 18 : 17} />

        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <span className="notification-dropdown-title">
              Notifications
            </span>

            {notifications.length > 0 &&
              unreadCount > 0 && (
                <button
                  type="button"
                  className="notification-mark-all"
                  onClick={markAllAsRead}
                  title="Mark all as read"
                >
                  <Check size={14} />
                  Mark all read
                </button>
              )}
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="notification-loading">
                <RefreshCw
                  size={16}
                  className="notification-loading-spinner"
                />
              </div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">
                <Bell
                  size={20}
                  className="notification-empty-icon"
                />
                <p>
                  No notifications
                </p>
              </div>
            ) : (
              notifications.map(
                (notification) => (
                  <div
                    key={
                      notification._id
                    }
                    className={`notification-item ${
                      notification.isRead
                        ? "read"
                        : "unread"
                    }`}
                    onClick={() =>
                      handleNotificationClick(
                        notification
                      )
                    }
                  >
                    <div className="notification-item-dot" />

                    <div className="notification-item-content">
                      <div className="notification-item-title">
                        {notification.title}
                      </div>

                      <div className="notification-item-message">
                        {notification.message}
                      </div>

                      {notification.project &&
                        typeof notification.project ===
                          "object" &&
                        notification.project
                          .projectName && (
                          <div className="notification-item-project">
                            <FileText
                              size={12}
                              className="notification-item-project-icon"
                            />
                            <span>
                              {
                                notification.project
                                  .projectName
                              }
                            </span>
                          </div>
                        )}

                      <div className="notification-item-time">
                        {formatDate(
                          notification.createdAt
                        )}
                      </div>
                    </div>

                    {!notification.isRead && (
                      <div className="notification-unread-indicator" />
                    )}
                  </div>
                )
              )
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notification-dropdown-footer">
              <button
                type="button"
                className="notification-clear-btn"
                onClick={() => {
                  notifications.forEach(
                    (notification) =>
                      clearNotification(
                        notification._id
                      )
                  );
                }}
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;


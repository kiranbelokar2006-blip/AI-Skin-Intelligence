import React, { useEffect, useState } from "react";

const Notifications = ({ onBack }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    generateNotifications();
  }, []);

  const generateNotifications = () => {
    const currentHour = new Date().getHours();

    const newNotifications = [];

    if (currentHour >= 6 && currentHour < 12) {
      newNotifications.push({
        id: "morning-routine",
        icon: "☀️",
        title: "Morning Skincare Routine",
        message:
          "Start your morning skincare routine and follow your personalized SkinAI recommendations.",
        priority: "Today",
      });
    }

    if (currentHour >= 17 && currentHour < 22) {
      newNotifications.push({
        id: "evening-routine",
        icon: "🌙",
        title: "Evening Skincare Routine",
        message:
          "It is time for your evening skincare routine. Follow your recommended routine before sleeping.",
        priority: "Today",
      });
    }

    newNotifications.push({
      id: "hydration",
      icon: "💧",
      title: "Hydration Reminder",
      message:
        "Stay hydrated throughout the day. Drinking enough water supports healthy-looking skin.",
      priority: "Daily",
    });

    newNotifications.push({
      id: "sunscreen",
      icon: "🧴",
      title: "Sunscreen Reminder",
      message:
        "Remember to apply sunscreen during daytime and reapply when needed, especially when outdoors.",
      priority: "Daily",
    });

    if (currentHour >= 21 || currentHour < 6) {
      newNotifications.push({
        id: "sleep",
        icon: "😴",
        title: "Sleep Reminder",
        message:
          "Maintain a regular sleep schedule. Adequate sleep is an important part of your skincare routine.",
        priority: "Tonight",
      });
    }

    newNotifications.push({
      id: "progress",
      icon: "📈",
      title: "Skin Progress Reminder",
      message:
        "Update your skin progress regularly so SkinAI can monitor changes in your skin health.",
      priority: "Weekly",
    });

    setNotifications(newNotifications);
  };

  const dismissNotification = (id) => {
    setNotifications((previous) =>
      previous.filter((item) => item.id !== id)
    );
  };

  return (
    <div className="dashboard-content">

      <button
        className="back-button"
        onClick={onBack}
      >
        ← Back to Dashboard
      </button>

      <div className="dashboard-welcome-section">

        <div className="tagline">
          SMART SKINCARE ALERTS
        </div>

        <h1>Notification Center</h1>

        <p className="dashboard-description">
          Stay updated with personalized skincare reminders,
          hydration alerts, routine notifications and progress updates.
        </p>

      </div>

      <div className="recommendation-box">

        <div className="section-heading">

          <div>
            <h2>🔔 Your Smart Reminders</h2>

            <p>
              SkinAI keeps your daily skincare activities organized.
            </p>
          </div>

          <span className="status-badge status-success">
            {notifications.length} Active
          </span>

        </div>

        {notifications.length === 0 ? (

          <div className="empty-state">

            <h3>🎉 You are all caught up!</h3>

            <p>
              There are no active skincare reminders right now.
            </p>

          </div>

        ) : (

          <div className="notification-list">

            {notifications.map((notification) => (

              <div
                className="notification-card"
                key={notification.id}
              >

                <div className="notification-icon">
                  {notification.icon}
                </div>

                <div style={{ flex: 1 }}>

                  <h3>
                    {notification.title}
                  </h3>

                  <p>
                    {notification.message}
                  </p>

                  <span className="status-badge status-success">
                    {notification.priority}
                  </span>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    dismissNotification(notification.id)
                  }
                  style={{
                    width: "auto",
                    padding: "7px 11px",
                    background: "#f5faf7",
                    color: "#236f5a",
                    border: "1px solid #d5e6de",
                    boxShadow: "none",
                  }}
                  title="Dismiss notification"
                >
                  ✓
                </button>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
};

export default Notifications;
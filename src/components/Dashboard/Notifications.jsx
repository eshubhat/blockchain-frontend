import React, { useState, useEffect, useContext } from "react";
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Button,
} from "@mui/material";
import { Notifications as NotificationsIcon } from "@mui/icons-material";
import { FileAccessContext } from "../../contexts/FileAccess";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const { currentAccount, approveAccess, isLoading } =
    useContext(FileAccessContext);

  const fetchNotifications = async () => {
    try {
      if (!import.meta.env.VITE_APP_URL) {
        console.error("API URL is not defined in the environment variables.");
        return;
      }

      if (!currentAccount) {
        console.error("currentAccount is not defined.");
        return;
      }

      console.log("Fetching notifications for account:", currentAccount);
      console.log("API URL:", import.meta.env.VITE_APP_URL);

      const response = await fetch(
        `${import.meta.env.VITE_APP_URL}/notifications/${currentAccount}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const { success, data } = await response.json();

      if (success) {
        setNotifications(data);
        console.log("Notifications fetched successfully:", data);
      } else {
        console.error("Failed to fetch notifications. Response:", data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const markAsNotified = async (requestId) => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_APP_URL
        }/notifications/${requestId}/${currentAccount}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${localStorage.getItem("id")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark notification as notified");
      }

      console.log(`Notification ${requestId} marked as notified`);
      fetchNotifications(); // Refresh the notifications after marking
    } catch (error) {
      console.error("Error marking notification as notified:", error);
    }
    handleClose();
  };

  const approveRequest = async (requestId) => {
    try {
      const notification = notifications.find(
        (notification) => notification.requestId === requestId
      );

      const hospitalId = notification?.requestingHospital;

      const receipt = await approveAccess(requestId, hospitalId);
      console.log("Approval successful:", receipt);

      const response = await fetch(
        `${
          import.meta.env.VITE_APP_URL
        }/notifications/${requestId}/${currentAccount}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${localStorage.getItem("id")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark notification as notified");
      }

      const result = await response.json();
      console.log("Notification marked as notified:", result);
      fetchNotifications(); // Refresh notifications after approval
    } catch (error) {
      console.error("Error approving request:", error);
    }
    handleClose();
  };
  console.log("Notifications:", currentAccount);

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: "400px",
            width: "auto",
          },
        }}
      >
        {notifications.length === 0 ? (
          <MenuItem>
            <Typography>No new notifications</Typography>
          </MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification.requestId}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <Box>
                <Typography variant="body1">{notification.message}</Typography>
                <Typography variant="caption" color="textSecondary">
                  {new Date(notification.timestamp).toLocaleString()}
                </Typography>
              </Box>
              {!notification.recipients.find(
                (r) =>
                  r.address.toLowerCase() === currentAccount.toLowerCase() &&
                  r.notified
              ) && (
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={() => markAsNotified(notification.requestId)}
                >
                  Mark as Read
                </Button>
              )}
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={() => approveRequest(notification.requestId)}
                style={{ marginTop: "8px" }}
                disabled={isLoading}
              >
                {isLoading ? "Approving..." : "Approve Request"}
              </Button>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;

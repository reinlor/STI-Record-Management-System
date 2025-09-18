const { getNotificationCollection } = require("../models/notificationModel");


// Controller function for retrieving notification
const getStudentNotificationwithID = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: "ID is required" });
        }
        const docRef = getNotificationCollection().doc('student');
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: "Student document not found" });
        }
        const data = doc.data();
        const notificationsForID = data[id];

        if (!notificationsForID) {
            return res.status(404).json({ error: "No notifications found for this ID" });
        }
        return res.status(200).json(notificationsForID);

    } catch (error) {
        console.error("Error fetching notification:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

const updateNotificationReadStatus = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { notifID } = req.body;

        if (!employeeId || !notifID) {
            return res.status(400).json({ error: "Employee ID and Notification ID are required" });
        }

        const docRef = getNotificationCollection().doc('student');
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: "Student document not found" });
        }

        const data = doc.data();
        const notificationsForEmployee = data[employeeId];

        if (!notificationsForEmployee || notificationsForEmployee.length === 0) {
            return res.status(404).json({ error: "No notifications found for this employee ID" });
        }

        const notificationIndex = notificationsForEmployee.findIndex(
            (notification) => notification.notifID === notifID
        );

        if (notificationIndex === -1) {
            return res.status(404).json({ error: "Notification with the given ID not found" });
        }

        const updatedNotifications = [...notificationsForEmployee];
        updatedNotifications[notificationIndex].isRead = true;

        const updatePayload = {
            [employeeId]: updatedNotifications
        };

        await docRef.update(updatePayload);

        return res.status(200).json({ message: "Notification updated successfully" });

    } catch (error) {
        console.error("Error updating notification:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = {
    getStudentNotificationwithID,
    updateNotificationReadStatus
}
// databaseservice.js
import { Databases, ID , Query } from 'appwrite';
import  client from './appwrite2'; 
import * as Notifications from 'expo-notifications';  // Import expo-notifications

const databases = new Databases(client);

// Function to send push notification using Expo
const sendPushNotification = async (expoPushToken, title, message) => {
  try {
    const messageBody = {
      to: expoPushToken,  // Expo push token of the examiner
      sound: 'default',
      title: title,
      body: message,
      data: { someData: 'value' },
    };

    const response = await Notifications.sendPushNotificationAsync(messageBody);
    console.log('Push notification sent:', response);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};

// Function to create a schedule and send a notification to the examiner
export const CreateSchedule = async (data, examinerExpoPushToken) => {
  const databaseId = '67dd8a42000b2f5184aa';  // Ensure this databaseId is correct
  const collectionId = 'PresentationSchedules';  // Ensure this collectionId is correct

  console.log("Database ID:", JSON.stringify(databaseId));
  console.log("Collection ID:", JSON.stringify(collectionId));

  try {
    const response = await databases.createDocument(
      databaseId.trim(),
      collectionId.trim(),
      ID.unique(),
      data
    );

    // Store the Expo Push Token in the schedule document
    await databases.updateDocument(
      databaseId.trim(),
      collectionId.trim(),
      response.$id,  // Use the response ID from the created document
      { examinerExpoPushToken: examinerExpoPushToken }
    );

    console.log('Schedule created successfully:', response);

    // Calculate 24 hours before the presentation date
    const presentationDate = new Date(data.date);
    const reminderTime = new Date(presentationDate.getTime() - 24 * 60 * 60 * 1000);  // 24 hours before

    console.log("Reminder will be sent at:", reminderTime);

    // Schedule a reminder notification for the examiner
    const notificationId = await scheduleReminderNotification(reminderTime, examinerExpoPushToken, "Reminder: Presentation Evaluation", `You have a scheduled presentation for group "${data.group_id}" tomorrow at ${data.time}`);
    console.log('Reminder notification scheduled successfully:', notificationId);

    return response;
  } catch (error) {
    console.error('Error creating schedule:', error);
    throw error;
  }
};

// Function to schedule a reminder notification using expo-notifications
const scheduleReminderNotification = async (reminderTime, examinerExpoPushToken, title, message) => {
  try {
    // Schedule the notification using Expo
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        to: examinerExpoPushToken,
        title: title,
        body: message,
      },
      trigger: {
        seconds: (reminderTime - new Date()) / 1000,  // Calculate the seconds until the reminder
      },
    });

    console.log('Reminder notification scheduled successfully:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('Error scheduling reminder notification:', error);
  }
};

// Function to update (edit) an existing schedule
export const UpdateSchedule = async (documentId, data) => {
  const databaseId = '67dd8a42000b2f5184aa';
  const collectionId = 'PresentationSchedules';

  try {
    const response = await databases.updateDocument(
      databaseId.trim(),
      collectionId.trim(),
      documentId,
      data
    );
    console.log('Schedule updated successfully:', response);
    return response;
  } catch (error) {
    console.error('Error updating schedule:', error);
    throw error;
  }
};

// Function to fetch schedules
export const GetSchedules = async (searchQuery = '') => {
  const databaseId = '67dd8a42000b2f5184aa';  // Ensure this databaseId is correct
  const collectionId = 'PresentationSchedules';  // Ensure this collectionId is correct

  try {
    console.log("Fetching from Database ID:", databaseId);
    console.log("Fetching from Collection ID:", collectionId);

    // If there's a search query, filter by title field
    const query = searchQuery ? [Query.search('title', searchQuery)] : [];

    const response = await databases.listDocuments(databaseId, collectionId, query);
    console.log('Schedules fetched successfully:', response.documents);
    return response.documents;
  } catch (error) {
    console.error('Error fetching schedules:', error);
    throw error;
  }
};

// Function to delete a schedule
export const deleteDocument = async ({ databaseId, collectionId, documentId }) => {
  try {
    const response = await databases.deleteDocument(databaseId, collectionId, documentId);
    return response;
  } catch (error) {
    throw error;
  }
};

// Function to save a completed presentation and send notification to examiner
export const SaveCompletedPresentation = async (data) => {
  const databaseId = '67dd8a42000b2f5184aa';  // Verify this ID
  const collectionId = 'completed_presentations';  // Verify this collection name

  try {
    const response = await databases.createDocument(
      databaseId.trim(),
      collectionId.trim(),
      ID.unique(),
      data
    );

    // Send a push notification to the examiner if needed
    if (response && response.examinerExpoPushToken) {
      await sendPushNotification(response.examinerExpoPushToken, 'Presentation Completed', `The presentation for group "${data.group_id}" has been marked as completed.`);
    }

    console.log('Completed Presentation saved successfully:', response);
    return response;
  } catch (error) {
    console.error('Error saving completed presentation:', error);
    throw error;
  }
};

// Function to fetch completed presentations
export const GetCompletedPresentations = async () => {
  const databaseId = '67dd8a42000b2f5184aa';  // Ensure this databaseId is correct
  const collectionId = 'completed_presentations';  // Ensure this collectionId is correct

  try {
    console.log("Fetching completed presentations from Database ID:", databaseId);
    console.log("Fetching from Collection ID:", collectionId);

    const response = await databases.listDocuments(databaseId, collectionId);
    console.log('Completed presentations fetched successfully:', response.documents);
    return response.documents;
  } catch (error) {
    console.error('Error fetching completed presentations:', error);
    throw error;
  }
};
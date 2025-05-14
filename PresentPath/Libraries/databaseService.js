// databaseservice.js
import { Databases, ID , Query } from 'appwrite';
import  client from './appwrite2'; 
import * as Notifications from 'expo-notifications';  // Import expo-notifications
import moment from 'moment-timezone'; // Use moment-timezone for handling time zones


const databases = new Databases(client);



const pad = (num) => num.toString().padStart(2, '0');

// Helper function to format time (without unwanted 0s)
const formatTime = (time) => {
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const period = hours < 12 ? 'AM' : 'PM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${pad(minutes)} ${period}`;
};

// Function to create a schedule and send a notification to the examiner
export const CreateSchedule = async (data, examinerExpoPushToken) => {
  const databaseId = '67dd8a42000b2f5184aa';  // Ensure this databaseId is correct
  const collectionId = 'PresentationSchedules';  // Ensure this collectionId is correct

  console.log("Database ID:", databaseId);
  console.log("Collection ID:", collectionId);

  try {
    // Instead of manually combining and parsing the date/time,
    // use moment.tz to parse according to Asia/Colombo.
    const presentationMoment = moment.tz(
      `${data.date} ${data.time}`, // assuming data.date is in "YYYY-MM-DD" and data.time is in "HH:mm" format
      'YYYY-MM-DD HH:mm',
      'Asia/Colombo'
    );

    if (!presentationMoment.isValid()) {
      throw new Error('Invalid combined date and time');
    }

    // Format the date/time as "YYYY-MM-DDTHH:mm:ss" (no milliseconds or timezone offset)
    const formattedDateTime = presentationMoment.format('YYYY-MM-DDTHH:mm:ss');

    // Create the schedule document (ensure databases and ID are imported/configured properly)
    const response = await databases.createDocument(
      databaseId.trim(),
      collectionId.trim(),
      ID.unique(),
      { ...data, date: formattedDateTime }
    );

    // Store the Expo Push Token in the schedule document
    await databases.updateDocument(
      databaseId.trim(),
      collectionId.trim(),
      response.$id,
      { examinerExpoPushToken: examinerExpoPushToken }
    );

    console.log('Schedule created successfully:', response);

    // Calculate 24 hours before the presentation date.
    // presentationMoment is already in Asia/Colombo time.
    const reminderMoment = presentationMoment.clone().subtract(24, 'hours');
    const reminderTime = reminderMoment.toDate();

    console.log("Reminder will be sent at:", reminderTime.toLocaleString());

    // Format reminder time as "3:00 PM" (for example)
    const formattedTime = formatTime(reminderTime);

    // Schedule a reminder notification for the examiner
    const notificationId = await scheduleReminderNotification(
      reminderTime,
      examinerExpoPushToken,
      "Reminder: Presentation Evaluation",
      `You have a scheduled presentation for group "${data.group_id}" tomorrow at ${formattedTime}`
    );

    console.log('Reminder notification scheduled successfully:', notificationId);

    return response;
  } catch (error) {
    console.error('Error creating schedule:', error);
    throw error;
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
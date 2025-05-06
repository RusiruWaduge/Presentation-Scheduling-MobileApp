// databaseservice.js
import { Databases, ID , Query } from 'appwrite';
import {client} from './appwriteConfig';

const databases = new Databases(client);

// Function to create a schedule
export const CreateSchedule = async (data) => {
  const databaseId = '67dd8a42000b2f5184aa'; // Check if this is correct
  const collectionId = 'PresentationSchedules'; // Check if this is correct

  console.log("Database ID:", JSON.stringify(databaseId));
  console.log("Collection ID:", JSON.stringify(collectionId));

  try {
    const response = await databases.createDocument(
      databaseId.trim(),
      collectionId.trim(),
      ID.unique(),
      data
    );
    console.log('Schedule created successfully:', response);
    return response;
  } catch (error) {
    console.error('Error creating schedule:', error);
    throw error;
  }
};

/*
  Function to update (edit) an existing schedule
  documentId: the ID of the existing schedule document
  data: the updated data for the schedule
*/
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
  const databaseId = '67dd8a42000b2f5184aa'; // Ensure this databaseId is correct
  const collectionId = 'PresentationSchedules'; // Ensure this collectionId is correct

  try {
    console.log("Fetching from Database ID:", databaseId);
    console.log("Fetching from Collection ID:", collectionId);

     // If there's a search query, filter by title field
     const query = searchQuery ? [Query.search('title', searchQuery)] : [];

    const response = await databases.listDocuments(databaseId, collectionId, query);
    console.log('Schedules fetched successfully:', response.documents);
    return response.documents;
  } catch (error) {
    console.error('Error fetching schedules:', {
      message: error.message,
      code: error.code,
      response: error.response,
    });
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


// Function to save a completed presentation
export const SaveCompletedPresentation = async (data) => {
  const databaseId = '67dd8a42000b2f5184aa'; // Verify this ID
  const collectionId = 'completed_presentations'; // Verify this collection name

  console.log("Saving Completed Presentation...");
  console.log("Database ID:", databaseId);
  console.log("Collection ID:", collectionId);

  try {
    const response = await databases.createDocument(
      databaseId.trim(),
      collectionId.trim(),
      ID.unique(), 
      data
    );
    console.log('Completed Presentation saved successfully:', response);
    return response;
  } catch (error) {
    console.error('Error saving completed presentation:', error);
    throw error;
  }
};

// Function to fetch completed presentations
export const GetCompletedPresentations = async () => {
  const databaseId = '67dd8a42000b2f5184aa'; // Ensure this databaseId is correct
  const collectionId = 'completed_presentations'; // Ensure this collectionId is correct

  try {
    console.log("Fetching completed presentations from Database ID:", databaseId);
    console.log("Fetching from Collection ID:", collectionId);

    const response = await databases.listDocuments(databaseId, collectionId);
    console.log('Completed presentations fetched successfully:', response.documents);
    return response.documents;
  } catch (error) {
    console.error('Error fetching completed presentations:', {
      message: error.message,
      code: error.code,
      response: error.response,
    });
    throw error;
  }
};
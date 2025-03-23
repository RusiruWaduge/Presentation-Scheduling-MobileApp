import { Client, Databases, ID } from 'appwrite';

const client = new Client();

client
    .setEndpoint('https://cloud.appwrite.io/v1') // Replace with your Appwrite endpoint
    .setProject('67dd8453002a601838ad' )// Replace with your project ID

const databases = new Databases(client);

const databaseId = '67dd8a42000b2f5184aa'; // Replace with your database ID
const collectionId = 'AI-Feedbacks';
 // Replace with your collection ID

// Function to insert feedback
export const insertFeedback = async (feedbackData) => {
    try {
        const response = await databases.createDocument(
            databaseId,
            collectionId,
            ID.unique(),
            feedbackData
        );
        console.log('Feedback inserted successfully:', response);
        return response;
    } catch (error) {
        console.error('Error inserting feedback:', error);
        throw error;
    }
};

// Function to get feedback for Year 1 using feedback_id = 00001
export const getFeedback = async (feedbackId) => {
  try {
      const response = await databases.listDocuments(databaseId, collectionId);
      
      // Filter based on feedback ID
      const feedbackData = response.documents.find(
          (doc) => doc.feedback_id === feedbackId
      );

      console.log('Feedback:', feedbackData);
      return feedbackData;
  } catch (error) {
      console.error('Error fetching feedback:', error);
      throw error;
  }
};



// Function to update feedback status
export const updateFeedbackStatus = async (feedbackId, newStatus) => {
    try {
        const response = await databases.updateDocument(
            databaseId,
            collectionId,
            feedbackId,
            { status: newStatus }
        );
        console.log('Feedback updated:', response);
        return response;
    } catch (error) {
        console.error('Error updating feedback:', error);
        throw error;
    }
};

// Function to delete feedback
export const deleteFeedback = async (feedbackId) => {
    try {
        await databases.deleteDocument(databaseId, collectionId, feedbackId);
        console.log('Feedback deleted successfully');
    } catch (error) {
        console.error('Error deleting feedback:', error);
        throw error;
    }
};


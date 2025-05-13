import { Client, Databases, ID, Query } from 'appwrite';

const client = new Client();

client
  .setEndpoint('https://cloud.appwrite.io/v1') // Replace with your Appwrite endpoint
  .setProject('67dd8453002a601838ad'); // Replace with your project ID

const databases = new Databases(client);

const databaseId = '67dd8a42000b2f5184aa'; // Replace with your database ID
const collectionId = 'AI-Feedbacks';
const marksCollectionId = '67e012b2000fd11e41fb';
export { databases };
//Get current user
export const getCurrentUser = async () => {
  try {
    return await account.get();
  } catch {
    return null;
  }
};
// ✅ Get all marks with pagination
export const getAllMarks = async () => {
  try {
    const response = await databases.listDocuments(
      databaseId,
      marksCollectionId,
      [Query.limit(100)]
    );
    console.log('All marks retrieved successfully:', response.documents);
    return response.documents;
  } catch (error) {
    console.error('Error retrieving marks:', error);
    throw error;
  }
};

// ✅ Check if feedback already exists for a student
export const checkFeedbackExists = async (studentId, year) => {
  try {
    const response = await databases.listDocuments(
      databaseId,
      collectionId,
      [
        Query.equal('student_id', studentId),
        Query.equal('year', year)
      ]
    );

    return response.documents.length > 0;
  } catch (error) {
    console.error('Error checking feedback existence:', error);
    throw error;
  }
};

// ✅ Insert feedback into database
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

// ✅ Get existing feedback for a student and year
export const getFeedback = async (studentId, year) => {
  try {
    const response = await databases.listDocuments(
      databaseId,
      collectionId,
      [
        Query.equal('student_id', studentId),
        Query.equal('year', year)
      ]
    );

    return response.documents.length > 0
      ? response.documents[0].feedback
      : null;
  } catch (error) {
    console.error('Error getting feedback:', error);
    throw error;
  }
};

// ✅ Generate feedback based on marks
const generateFeedback = async (marks, isOverall) => {
  try {
    // Example feedback generation logic — modify as needed
    if (isOverall) {
      return `Overall performance: Average score ${(
        marks.reduce((sum, mark) => sum + mark.score, 0) / marks.length
      ).toFixed(2)}`;
    } else {
      return `Year performance: Scored ${marks[0].score} in ${marks[0].subject}`;
    }
  } catch (error) {
    console.error('Error generating feedback:', error);
    throw error;
  }
};

// ✅ Generate and insert feedback ONLY if it doesn't already exist
export const handleGenerateFeedback = async (studentId) => {
  try {
    const marks = await getAllMarks();

    // ✅ Separate overall and year-based marks
    const overallMarks = marks.filter((mark) => mark.year === 'Overall');
    const yearMarks = marks.filter((mark) => mark.year !== 'Overall');

    // ✅ Generate overall feedback if not already generated
    if (overallMarks.length > 0) {
      const feedbackExists = await checkFeedbackExists(studentId, 'Overall');
      if (!feedbackExists) {
        const overallFeedback = await generateFeedback(overallMarks, true);
        await insertFeedback({
          student_id: studentId,
          year: 'Overall',
          feedback: overallFeedback,
          status: 'Generated'
        });
        console.log('Overall feedback generated:', overallFeedback);
      } else {
        console.log('Overall feedback already exists. Skipping generation.');
      }
    }

    // ✅ Generate short feedback for other years if not already generated
    for (const mark of yearMarks) {
      const feedbackExists = await checkFeedbackExists(studentId, mark.year);
      if (!feedbackExists) {
        const shortFeedback = await generateFeedback([mark], false);
        await insertFeedback({
          student_id: studentId,
          year: mark.year,
          feedback: shortFeedback,
          status: 'Generated'
        });
        console.log(`Year ${mark.year} feedback generated:`, shortFeedback);
      } else {
        console.log(`Year ${mark.year} feedback already exists. Skipping generation.`);
      }
    }
  } catch (error) {
    console.error('Error handling feedback generation:', error);
  }
};

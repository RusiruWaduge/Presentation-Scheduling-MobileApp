const API_KEY = 'AIzaSyAit5ym9k9_D6SsgE3RBhkEX6QYxs5gxxU'; // Replace with a valid key

export const generateFeedback = async (marks, isOverall = false) => {
  const prompt = isOverall
    ? `
      Provide a **detailed overall performance feedback** based on the following student's marks:
      
      ${marks.map(mark =>
        `- ${mark.subject}: ${mark.score}/100 (${mark.status})`
      ).join('\n')}

      Include strengths, weaknesses, and actionable suggestions for improvement.
    `
    : `
      Provide a **short and direct feedback** based on the following student's marks:
      
      ${marks.map(mark =>
        `- ${mark.subject}: ${mark.score}/100 (${mark.status})`
      ).join('\n')}

      Keep the feedback short and motivational.
    `;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const feedback =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No feedback generated.';

    return feedback;
  } catch (error) {
    console.error('Error generating feedback:', error);
    return 'Failed to generate feedback.';
  }
};


const API_KEY = 'AIzaSyAbZUg96lhm5q1Mmdw4FrDW3Iw_XE34e7Q'; // Replace with a valid Google Generative AI API key

export const generateGuidelines = async (marks) => {
  const prompt = `
    Based on the following student performance marks:

    ${marks
      .map((mark) => `- ${mark.subject}: ${mark.score}/100 (${mark.status})`)
      .join('\n')}

    Provide a list of actionable, specific, and motivational guidelines to help the student improve their future performance. Return only the guidelines in bullet point form (using "-"), ensuring each guideline is clear, practical, and encouraging. Avoid any introductory or summary text outside the bullet points.
  `;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
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
    const guidelines =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || '- No guidelines generated.';

    return guidelines;
  } catch (error) {
    console.error('Error generating guidelines:', error);
    return '- Failed to generate guidelines. Please try again later.';
  }
};
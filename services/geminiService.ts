import { API_BASE_URL } from "./apiService";

export const analyzeInquiry = async (message: string) => {
  try {
    const token = localStorage.getItem('token'); // Get token from storage
    const response = await fetch(`${API_BASE_URL}/dashboard/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      throw new Error("Failed to analyze inquiry");
    }

    const result = await response.json();
    return result.data || "Unable to generate analysis.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI analysis unavailable.";
  }
};

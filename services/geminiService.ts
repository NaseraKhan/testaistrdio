
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async getAdvice(prompt: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: `You are a Senior Full-Stack Architect. Your goal is to explain how to connect a React frontend to a MySQL database safely. 
          NEVER recommend connecting directly from the browser. 
          ALWAYS emphasize using a Backend API (Node.js, Python, PHP) as a bridge. 
          Keep answers technical but accessible. Focus on security, environment variables, and drivers like 'mysql2' or 'sequelize'.`,
          temperature: 0.7,
        },
      });
      return response.text || "I'm sorry, I couldn't process that request.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "An error occurred while fetching advice. Please ensure your environment is configured correctly.";
    }
  }
}

export const geminiService = new GeminiService();

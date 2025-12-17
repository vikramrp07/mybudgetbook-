import { GoogleGenAI } from "@google/genai";
import { Transaction } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is missing from environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeBudgetWithGemini = async (transactions: Transaction[], query: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "I need an API Key to function. Please configure it in the environment.";

  // Prepare context
  const transactionData = JSON.stringify(transactions.map(t => ({
    date: t.date,
    amount: t.amount,
    category: t.category,
    type: t.type,
    description: t.description
  })));

  const systemInstruction = `
    You are a smart financial assistant for the 'SmartBudget AI' app.
    
    Instructions:
    1. Analyze the provided transaction data to answer the user's specific question.
    2. If the user asks for general advice, look for patterns (e.g., high spending in one category).
    3. Be concise, friendly, and encouraging. 
    4. Format key numbers in bold (e.g., **$150.00**).
    5. Do not output raw JSON, provide a conversational response.
    6. Today's date is ${new Date().toLocaleDateString()}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `User Data: ${transactionData}\n\nUser Question: ${query}`,
      config: {
        systemInstruction: systemInstruction,
      }
    });
    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error while analyzing your budget.";
  }
};

export const suggestCategory = async (description: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Other";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Categorize this transaction description into one of these categories: [Housing, Food, Transportation, Utilities, Entertainment, Healthcare, Shopping, Personal, Education, Savings, Income, Other]. Return ONLY the category name. Description: "${description}"`,
    });
    const text = response.text?.trim();
    return text || "Other";
  } catch (error) {
    return "Other";
  }
};
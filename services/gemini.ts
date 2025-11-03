import { GoogleGenAI } from "@google/genai";
import { KPI } from '../types';

function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(value);
}

function formatPercentage(value: number, decimals = 0) {
    return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value);
}

export const generateInsightReport = async (kpiData: KPI): Promise<string> => {
  if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set.");
    return "Error: API Key is not configured. Please contact support.";
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const userPrompt = `
      Analyze the following current farm health metrics for a layer operation in the Legal Chicks Empowerment Network (LCEN):
      - Feed Conversion Ratio (FCR): ${kpiData.fcr ? kpiData.fcr.toFixed(2) : 'N/A'}
      - Egg Production Rate (Hen-Day %): ${kpiData.eggProductionRate ? formatPercentage(kpiData.eggProductionRate, 1) : 'N/A'}
      - Feed Cost per Egg: ${kpiData.feedCostPerEgg ? formatCurrency(kpiData.feedCostPerEgg) : 'N/A'}
      - 7-Day Mortality Rate: ${kpiData.mortalityRate ? formatPercentage(kpiData.mortalityRate, 1) : 'N/A'}

      Provide a two-part response:
      1. Diagnosis (H3): A concise, single-paragraph analysis of the farm's overall health and the most critical area needing attention.
      2. Action Plan (H3): A maximum of three bullet points providing specific, actionable steps to address the critical area, aligning with LCE's focus on biosecurity and feed efficiency. Use simple, direct language suitable for a farmer.
  `;

  const systemPrompt = `You are the Legal Chicks Empowerment Network (LCEN) AI Co-Pilot. Your goal is to provide expert, actionable, and empathetic advice to small poultry farmers in the Cagayan Valley, Philippines. Base your recommendations on poultry industry best practices, prioritizing biosecurity, cost efficiency, and revenue generation from egg layers (Rhode Island Reds - RIR). Format your response strictly using Markdown with H3 headings for Diagnosis and Action Plan. Use PHP currency (₱) where appropriate.`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
            systemInstruction: systemPrompt,
        }
    });

    return response.text;
  } catch (error) {
    console.error("Error generating report with Gemini:", error);
    return "Error: Could not generate the AI report at this time. Please try again later.";
  }
};
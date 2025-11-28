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

interface ProductionRecord {
    id: string; // YYYY-MM-DD
    eggs: number;
}

export const generateInsightReport = async (kpiData: KPI, productionHistory: ProductionRecord[] = []): Promise<string> => {
  if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set.");
    return "Error: API Key is not configured. Please contact support.";
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Format history for the prompt
  const historyString = productionHistory
    .slice(0, 7) // Last 7 days
    .map(d => `- ${d.id}: ${d.eggs} eggs`)
    .join('\n');

  const userPrompt = `
      Analyze the following farm metrics for a layer operation (Rhode Island Reds) in the Legal Chicks Empowerment Network (LCEN).

      ### CURRENT SNAPSHOT:
      - Feed Conversion Ratio (FCR): ${kpiData.fcr ? kpiData.fcr.toFixed(2) : 'N/A'} (Target: < 2.2)
      - Egg Production Rate (Hen-Day %): ${kpiData.eggProductionRate ? formatPercentage(kpiData.eggProductionRate, 1) : 'N/A'}
      - Feed Cost per Egg: ${kpiData.feedCostPerEgg ? formatCurrency(kpiData.feedCostPerEgg) : 'N/A'}
      - 7-Day Mortality Rate: ${kpiData.mortalityRate ? formatPercentage(kpiData.mortalityRate, 1) : 'N/A'}

      ### HISTORICAL PRODUCTION (Last 7 Days):
      ${historyString || "No historical data available."}

      ### REQUESTED ANALYSIS:
      Provide a comprehensive 4-part report using Markdown (H3 headers):

      1. **Diagnosis**: A concise assessment of farm health. Is the flock performing above or below industry standards?
      
      2. **Feed Cost Forecast**: 
         - Analyze the current FCR of ${kpiData.fcr.toFixed(2)}. 
         - If FCR is high (>2.2), calculate the estimated financial loss per 100 birds per week compared to a standard FCR of 2.0. 
         - If FCR is good, project the monthly savings.
         - *Show rough math to justify the insight.*

      3. **Production Trend Prediction**: 
         - Based on the last 7 days of egg counts, is production trending up, down, or plateauing? 
         - Predict the likely production average for the *next* 3 days if current conditions persist.

      4. **Action Plan**: 
         - 3 specific, bulleted steps to optimize the metrics above. Focus on biosecurity and feed efficiency.
  `;

  const systemPrompt = `You are the Legal Chicks Empowerment Network (LCEN) AI Co-Pilot. Your goal is to act as a senior poultry agronomist and financial analyst for smallholders in Cagayan Valley. 
  
  - Tone: Professional, encouraging, but data-driven and realistic.
  - Context: High FCR means wasted feed (money). High mortality is a biosecurity red flag.
  - formatting: Use Markdown. Use Bold for emphasis on numbers. Use PHP (₱) for currency.
  `;

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
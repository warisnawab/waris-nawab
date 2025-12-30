
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const EXTRACTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    fileNumber: { type: Type.STRING, description: "Official reference number of the letter" },
    date: { type: Type.STRING, description: "Date of the letter in YYYY-MM-DD format" },
    district: { type: Type.STRING, description: "The district concerned in the document" },
    signingAuthority: { type: Type.STRING, description: "Name/Designation of the person who signed the letter" },
    oneLineSummary: { type: Type.STRING, description: "Neutral, factual one-line summary" },
    departmentBreakdown: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          department: { type: Type.STRING, description: "Name of department involved" },
          summary: { type: Type.STRING, description: "What this department is required to do or its role in this specific file section" }
        },
        required: ["department", "summary"]
      }
    }
  },
  required: ["oneLineSummary"]
};

export const processLargeDocument = async (file: File): Promise<any> => {
  const text = await extractPDFText(file);
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an expert administrative clerk for the Finance Department, Sindh. 
      Analyze this official treasury document text and extract structured information.
      If there are multiple pages discussing different departments, provide a breakdown in the departmentBreakdown array.
      
      Text to analyze:
      ${text.substring(0, 30000)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: EXTRACTION_SCHEMA
      },
    });

    const result = JSON.parse(response.text || "{}");
    return {
      text,
      metadata: {
        fileNumber: result.fileNumber || "NOT FOUND",
        date: result.date || new Date().toISOString().split('T')[0],
        district: result.district || "SINDH",
        authority: result.signingAuthority || "NOT SPECIFIED"
      },
      summary: result.oneLineSummary || "Extracted content from official documentation.",
      sections: result.departmentBreakdown || []
    };
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      text,
      metadata: { fileNumber: "ERROR", date: "", district: "", authority: "" },
      summary: "AI analysis was unavailable for this specific file.",
      sections: []
    };
  }
};

export const extractPDFText = async (file: File): Promise<string> => {
  // In a browser environment, we'd use PDF.js. 
  // For simulation, we wait and return a mock extracted text that Gemini would normally see.
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(`GOVERNMENT OF SINDH
      FINANCE DEPARTMENT
      IGTA OFFICE, KARACHI
      
      No. IGTA/ADMIN/2024/782-X
      Dated: 15th October, 2024
      
      Subject: INSPECTION OF DAO HYDERABAD REGARDING PENSION DISBURSEMENTS.
      
      The Inspector General has directed the AIG to conduct a field visit to Hyderabad District.
      The Department of Education and Department of Health are also requested to provide payroll records.
      The Audit Department shall assist in verifying the signatures on Pension Vouchers.
      
      (Signed)
      Ghulam Murtaza
      Additional Secretary (Admin)`);
    };
    reader.readAsArrayBuffer(file);
  });
};

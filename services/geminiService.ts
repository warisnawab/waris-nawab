
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const EXTRACTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    fileNumber: { type: Type.STRING, description: "Official reference number of the letter (e.g., No. FD/ADMIN/2024/123)" },
    date: { type: Type.STRING, description: "Date of the letter in YYYY-MM-DD format" },
    district: { type: Type.STRING, description: "The district concerned in the document (e.g., Karachi, Hyderabad)" },
    signingAuthority: { type: Type.STRING, description: "Name/Designation of the person who signed the letter" },
    oneLineSummary: { type: Type.STRING, description: "A strictly neutral, factual one-line summary of the core instruction or finding." },
    departmentBreakdown: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          department: { type: Type.STRING, description: "Name of department involved" },
          summary: { type: Type.STRING, description: "Specific action required from this department" }
        },
        required: ["department", "summary"]
      }
    }
  },
  required: ["oneLineSummary"]
};

/**
 * Extracts text from a PDF file using PDF.js.
 * Handles potential memory issues with large files by processing pages sequentially.
 */
export const extractPDFText = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const typedarray = new Uint8Array(reader.result as ArrayBuffer);
        // @ts-ignore - pdfjsLib is loaded via CDN in index.html
        const pdf = await window.pdfjsLib.getDocument({ data: typedarray }).promise;
        let fullText = "";
        
        // Process up to 50 pages for speed, or more if needed
        const maxPages = Math.min(pdf.numPages, 100); 
        for (let i = 1; i <= maxPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(" ");
          fullText += pageText + "\n";
        }
        resolve(fullText);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

export const processLargeDocument = async (file: File): Promise<any> => {
  let text = "";
  try {
    text = await extractPDFText(file);
  } catch (e) {
    console.error("PDF Extraction failed, using fallback mock", e);
    text = "Error extracting text. Proceeding with filename analysis.";
  }
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a Senior Administrative Analyst for the Inspector General of Treasuries & Accounts, Finance Department, Sindh. 
      Analyze the following text extracted from an official government document. 
      Provide a highly professional, neutral, and structured summary. 
      Focus on extracting reference numbers, dates, and actionable instructions.
      
      Document Content Snippet:
      ${text.substring(0, 35000)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: EXTRACTION_SCHEMA
      },
    });

    const result = JSON.parse(response.text || "{}");
    return {
      text,
      metadata: {
        fileNumber: result.fileNumber || "REF-NOT-FOUND",
        date: result.date || new Date().toISOString().split('T')[0],
        district: result.district || "Sindh",
        authority: result.signingAuthority || "Under Secretary"
      },
      summary: result.oneLineSummary || "Official correspondence uploaded for record.",
      sections: result.departmentBreakdown || []
    };
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      text,
      metadata: { fileNumber: "MANUAL-ENTRY", date: "", district: "", authority: "" },
      summary: "AI was unable to generate a summary for this document. Manual review required.",
      sections: []
    };
  }
};

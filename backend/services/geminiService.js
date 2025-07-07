const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  // Convert file to base64 and get mime type
  fileToGenerativePart(filePath) {
    const fileData = fs.readFileSync(filePath);
    const mimeType = this.getMimeType(filePath);
    
    return {
      inlineData: {
        data: fileData.toString('base64'),
        mimeType: mimeType
      }
    };
  }

  // Get mime type based on file extension
  getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.bmp': 'image/bmp',
      '.webp': 'image/webp'
    };
    
    return mimeTypes[ext] || 'image/jpeg';
  }

  // Analyze document with Gemini API
  async analyzeDocument(filePath) {
    try {
      const imagePart = this.fileToGenerativePart(filePath);
      
      const prompt = `
        Analyze this document image and provide the following information in JSON format:
        
        1. Document Type: Identify if this is a "passport" or "driving_license" or "unknown"
        2. Extract all relevant information based on the document type
        
        For Passport, extract:
        - Document Type
        - Passport Number
        - Full Name
        - Date of Birth
        - Place of Birth
        - Nationality
        - Gender
        - Issue Date
        - Expiry Date
        - Issuing Authority
        - Country Code
        
        For Driving License, extract:
        - Document Type
        - License Number
        - Full Name
        - Date of Birth
        - Address
        - Issue Date
        - Expiry Date
        - License Classes/Categories
        - Issuing Authority
        - State/Region
        
        If the document is unclear or not a passport/driving license, return document type as "unknown" and provide whatever information is visible.
        
        Format the response as a clean JSON object with the following structure:
        {
          "documentType": "passport" | "driving_license" | "unknown",
          "extractedData": {
            // relevant fields based on document type
          },
          "confidence": "high" | "medium" | "low"
        }
        
        Only return the JSON object, no additional text.
      `;

      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      // Clean and parse the JSON response
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      try {
        const parsedResult = JSON.parse(cleanedText);
        return parsedResult;
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Raw response:', text);
        
        // Fallback response if JSON parsing fails
        return {
          documentType: 'unknown',
          extractedData: {
            rawResponse: text,
            error: 'Failed to parse structured response'
          },
          confidence: 'low'
        };
      }
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error(`Document analysis failed: ${error.message}`);
    }
  }

  // Rate limiting helper (basic implementation)
  async withRateLimit(operation) {
    const delay = 1000; // 1 second delay between requests
    
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const result = await operation();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  }
}

module.exports = GeminiService;
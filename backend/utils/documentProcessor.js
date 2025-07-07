const fs = require('fs');
const path = require('path');

class DocumentProcessor {
  // Clean up uploaded file after processing
  static async cleanupFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up file: ${filePath}`);
      }
    } catch (error) {
      console.error(`Error cleaning up file ${filePath}:`, error);
    }
  }

  // Validate extracted data based on document type
  static validateExtractedData(documentType, extractedData) {
    const validationResults = {
      isValid: true,
      missingFields: [],
      warnings: []
    };

    if (documentType === 'passport') {
      const requiredFields = ['passportNumber', 'fullName', 'nationality'];
      const recommendedFields = ['dateOfBirth', 'expiryDate', 'issueDate'];

      requiredFields.forEach(field => {
        if (!extractedData[field] || extractedData[field].trim() === '') {
          validationResults.missingFields.push(field);
          validationResults.isValid = false;
        }
      });

      recommendedFields.forEach(field => {
        if (!extractedData[field] || extractedData[field].trim() === '') {
          validationResults.warnings.push(`${field} is recommended but missing`);
        }
      });
    }

    if (documentType === 'driving_license') {
      const requiredFields = ['licenseNumber', 'fullName'];
      const recommendedFields = ['dateOfBirth', 'expiryDate', 'issueDate', 'address'];

      requiredFields.forEach(field => {
        if (!extractedData[field] || extractedData[field].trim() === '') {
          validationResults.missingFields.push(field);
          validationResults.isValid = false;
        }
      });

      recommendedFields.forEach(field => {
        if (!extractedData[field] || extractedData[field].trim() === '') {
          validationResults.warnings.push(`${field} is recommended but missing`);
        }
      });
    }

    return validationResults;
  }

  // Format extracted data for better presentation
  static formatExtractedData(documentType, extractedData) {
    const formatted = { ...extractedData };

    // Format dates if they exist
    const dateFields = ['dateOfBirth', 'issueDate', 'expiryDate'];
    dateFields.forEach(field => {
      if (formatted[field]) {
        formatted[field] = this.formatDate(formatted[field]);
      }
    });

    // Capitalize names
    if (formatted.fullName) {
      formatted.fullName = this.capitalizeWords(formatted.fullName);
    }

    // Format passport number (uppercase)
    if (formatted.passportNumber) {
      formatted.passportNumber = formatted.passportNumber.toUpperCase();
    }

    // Format license number (uppercase)
    if (formatted.licenseNumber) {
      formatted.licenseNumber = formatted.licenseNumber.toUpperCase();
    }

    return formatted;
  }

  // Helper function to format dates
  static formatDate(dateString) {
    if (!dateString) return dateString;
    
    try {
      // Try to parse the date and format it consistently
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      }
    } catch (error) {
      console.warn('Date formatting error:', error);
    }
    
    return dateString; // Return original if formatting fails
  }

  // Helper function to capitalize words
  static capitalizeWords(str) {
    if (!str) return str;
    
    return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  // Generate processing summary
  static generateProcessingSummary(documentType, extractedData, validation) {
    const summary = {
      documentType,
      totalFieldsExtracted: Object.keys(extractedData).length,
      validationStatus: validation.isValid ? 'passed' : 'failed',
      missingRequiredFields: validation.missingFields.length,
      warnings: validation.warnings.length,
      processingTimestamp: new Date().toISOString()
    };

    return summary;
  }

  // Check if file exists and is readable
  static validateFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error('File does not exist');
      }
      
      const stats = fs.statSync(filePath);
      if (!stats.isFile()) {
        throw new Error('Path is not a file');
      }
      
      if (stats.size === 0) {
        throw new Error('File is empty');
      }
      
      if (stats.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('File is too large');
      }
      
      return true;
    } catch (error) {
      throw new Error(`File validation failed: ${error.message}`);
    }
  }
}

module.exports = DocumentProcessor;
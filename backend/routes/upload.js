const express = require('express');
const router = express.Router();
const { upload, handleUploadError } = require('../middleware/upload');
const GeminiService = require('../services/geminiService');
const DocumentProcessor = require('../utils/documentProcessor');

// Initialize Gemini service
const geminiService = new GeminiService();

// Document upload and analysis endpoint
router.post('/analyze', upload, handleUploadError, async (req, res) => {
  let filePath = null;
  
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please select a document to analyze.'
      });
    }

    filePath = req.file.path;
    console.log(`Processing file: ${filePath}`);

    // Validate the uploaded file
    try {
      DocumentProcessor.validateFile(filePath);
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError.message
      });
    }

    // Analyze document with Gemini API
    const analysisResult = await geminiService.withRateLimit(async () => {
      return await geminiService.analyzeDocument(filePath);
    });

    // Validate and format extracted data
    const validation = DocumentProcessor.validateExtractedData(
      analysisResult.documentType,
      analysisResult.extractedData
    );

    const formattedData = DocumentProcessor.formatExtractedData(
      analysisResult.documentType,
      analysisResult.extractedData
    );

    // Generate processing summary
    const summary = DocumentProcessor.generateProcessingSummary(
      analysisResult.documentType,
      formattedData,
      validation
    );

    // Prepare response
    const response = {
      success: true,
      message: 'Document analyzed successfully',
      data: {
        documentType: analysisResult.documentType,
        extractedData: formattedData,
        confidence: analysisResult.confidence,
        validation: validation,
        summary: summary
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Document analysis error:', error);
    
    // Handle specific error types
    if (error.message.includes('API key')) {
      return res.status(500).json({
        success: false,
        message: 'API configuration error. Please check server configuration.'
      });
    }
    
    if (error.message.includes('rate limit')) {
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded. Please try again later.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to analyze document. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    // Clean up uploaded file
    if (filePath) {
      setTimeout(() => {
        DocumentProcessor.cleanupFile(filePath);
      }, 1000); // Small delay to ensure response is sent
    }
  }
});

// Health check for upload service
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Upload service is healthy',
    timestamp: new Date().toISOString()
  });
});

// Get supported document types
router.get('/supported-types', (req, res) => {
  res.json({
    success: true,
    supportedTypes: [
      {
        type: 'passport',
        description: 'International passport documents',
        fields: [
          'passportNumber',
          'fullName',
          'dateOfBirth',
          'placeOfBirth',
          'nationality',
          'gender',
          'issueDate',
          'expiryDate',
          'issuingAuthority',
          'countryCode'
        ]
      },
      {
        type: 'driving_license',
        description: 'Driving license documents',
        fields: [
          'licenseNumber',
          'fullName',
          'dateOfBirth',
          'address',
          'issueDate',
          'expiryDate',
          'licenseClasses',
          'issuingAuthority',
          'stateRegion'
        ]
      }
    ],
    supportedFormats: ['JPEG', 'PNG', 'GIF', 'BMP', 'WEBP'],
    maxFileSize: '10MB'
  });
});

module.exports = router;
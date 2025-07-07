import React, { useState, useRef, useCallback } from 'react';
import { apiService, fileUtils } from '../services/api';
import './DocumentUpload.css';

const DocumentUpload = ({ onSuccess, onError, onLoading }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileSelect = useCallback((file) => {
    // Validate file
    const validationErrors = fileUtils.validateFile(file);
    if (validationErrors.length > 0) {
      onError(validationErrors.join(', '));
      return;
    }

    // Clean up previous preview
    if (previewUrl) {
      fileUtils.cleanupFilePreview(previewUrl);
    }

    // Set new file and preview
    setSelectedFile(file);
    const newPreviewUrl = fileUtils.getFilePreview(file);
    setPreviewUrl(newPreviewUrl);
    setUploadProgress(0);
  }, [previewUrl, onError]);

  // Handle file input change
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) {
      onError('Please select a file first');
      return;
    }

    try {
      onLoading(true);
      setUploadProgress(0);

      const result = await apiService.analyzeDocument(
        selectedFile,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      if (result.success) {
        onSuccess(result.data);
      } else {
        onError(result.message || 'Failed to analyze document');
      }
    } catch (error) {
      onError(error.message || 'Upload failed');
    } finally {
      onLoading(false);
    }
  };

  // Clear selected file
  const clearFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    if (previewUrl) {
      fileUtils.cleanupFilePreview(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="document-upload">
      <div className="upload-container">
        <div className="upload-header">
          <h2>Upload Identity Document</h2>
          <p>Upload your passport or driving license for analysis</p>
        </div>

        <div
          className={`upload-area ${isDragOver ? 'drag-over' : ''} ${selectedFile ? 'has-file' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file-input"
          />

          {!selectedFile ? (
            <div className="upload-prompt">
              <div className="upload-icon">📄</div>
              <h3>Drop your document here</h3>
              <p>or click to browse files</p>
              <div className="supported-formats">
                <span>Supported formats: JPEG, PNG, GIF, BMP, WebP</span>
                <span>Maximum size: 10MB</span>
              </div>
            </div>
          ) : (
            <div className="file-preview">
              <div className="preview-image">
                {previewUrl && (
                  <img src={previewUrl} alt="Document preview" />
                )}
              </div>
              <div className="file-info">
                <h4>{selectedFile.name}</h4>
                <p>{fileUtils.formatFileSize(selectedFile.size)}</p>
                <button
                  type="button"
                  className="clear-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFile();
                  }}
                >
                  ✕ Remove
                </button>
              </div>
            </div>
          )}
        </div>

        {selectedFile && (
          <div className="upload-actions">
            <button
              className="upload-button"
              onClick={handleUpload}
              disabled={uploadProgress > 0}
            >
              {uploadProgress > 0 ? (
                <>
                  <span className="upload-progress-text">
                    Uploading... {uploadProgress}%
                  </span>
                  <div className="upload-progress-bar">
                    <div
                      className="upload-progress-fill"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </>
              ) : (
                <>
                  <span className="upload-icon">🔍</span>
                  Analyze Document
                </>
              )}
            </button>
          </div>
        )}

        <div className="upload-info">
          <div className="info-section">
            <h4>📋 What we analyze:</h4>
            <ul>
              <li><strong>Passport:</strong> Number, Name, DOB, Nationality, Expiry Date</li>
              <li><strong>Driving License:</strong> Number, Name, DOB, Address, Classes</li>
            </ul>
          </div>
          <div className="info-section">
            <h4>🔒 Security:</h4>
            <ul>
              <li>Files are processed securely and deleted after analysis</li>
              <li>No data is stored permanently on our servers</li>
              <li>All processing is done using encrypted connections</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
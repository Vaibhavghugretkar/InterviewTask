import React, { useState } from 'react';
import './DocumentResult.css';

const DocumentResult = ({ result, onReset }) => {
  const [activeTab, setActiveTab] = useState('extracted');

  if (!result) {
    return null;
  }

  const { documentType, extractedData, confidence, validation, summary } = result;

  // Get document type display info
  const getDocumentTypeInfo = (type) => {
    switch (type) {
      case 'passport':
        return {
          icon: '🛂',
          label: 'Passport',
          color: 'blue'
        };
      case 'driving_license':
        return {
          icon: '🚗',
          label: 'Driving License',
          color: 'green'
        };
      default:
        return {
          icon: '❓',
          label: 'Unknown Document',
          color: 'gray'
        };
    }
  };

  // Get confidence level display info
  const getConfidenceInfo = (level) => {
    switch (level) {
      case 'high':
        return { color: 'success', percentage: '90-100%' };
      case 'medium':
        return { color: 'warning', percentage: '70-89%' };
      case 'low':
        return { color: 'error', percentage: '50-69%' };
      default:
        return { color: 'gray', percentage: 'Unknown' };
    }
  };

  const docTypeInfo = getDocumentTypeInfo(documentType);
  const confidenceInfo = getConfidenceInfo(confidence);

  // Format field names for display
  const formatFieldName = (fieldName) => {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  // Render extracted data fields
  const renderExtractedFields = () => {
    if (!extractedData || Object.keys(extractedData).length === 0) {
      return (
        <div className="no-data">
          <p>No data could be extracted from the document.</p>
        </div>
      );
    }

    return Object.entries(extractedData).map(([key, value]) => {
      if (!value || value.toString().trim() === '') return null;
      
      return (
        <div key={key} className="data-field">
          <label className="field-label">{formatFieldName(key)}:</label>
          <span className="field-value">{value}</span>
        </div>
      );
    }).filter(Boolean);
  };

  // Render validation results
  const renderValidation = () => {
    if (!validation) return null;

    return (
      <div className="validation-section">
        <div className={`validation-status ${validation.isValid ? 'valid' : 'invalid'}`}>
          <span className="status-icon">
            {validation.isValid ? '✅' : '⚠️'}
          </span>
          <span className="status-text">
            {validation.isValid ? 'Validation Passed' : 'Validation Issues Found'}
          </span>
        </div>

        {validation.missingFields && validation.missingFields.length > 0 && (
          <div className="missing-fields">
            <h4>Missing Required Fields:</h4>
            <ul>
              {validation.missingFields.map((field, index) => (
                <li key={index}>{formatFieldName(field)}</li>
              ))}
            </ul>
          </div>
        )}

        {validation.warnings && validation.warnings.length > 0 && (
          <div className="warnings">
            <h4>Warnings:</h4>
            <ul>
              {validation.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Render processing summary
  const renderSummary = () => {
    if (!summary) return null;

    return (
      <div className="summary-section">
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Fields Extracted:</span>
            <span className="summary-value">{summary.totalFieldsExtracted}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Validation Status:</span>
            <span className={`summary-value status-${summary.validationStatus}`}>
              {summary.validationStatus}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Missing Fields:</span>
            <span className="summary-value">{summary.missingRequiredFields}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Warnings:</span>
            <span className="summary-value">{summary.warnings}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Processed At:</span>
            <span className="summary-value">
              {new Date(summary.processingTimestamp).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="document-result">
      <div className="result-container">
        {/* Header */}
        <div className="result-header">
          <div className="document-type-badge">
            <span className="doc-icon">{docTypeInfo.icon}</span>
            <div className="doc-info">
              <h2>Document Analyzed</h2>
              <p className={`doc-type ${docTypeInfo.color}`}>
                {docTypeInfo.label}
              </p>
            </div>
          </div>
          
          <div className="confidence-badge">
            <span className="confidence-label">Confidence:</span>
            <span className={`confidence-value ${confidenceInfo.color}`}>
              {confidence} ({confidenceInfo.percentage})
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="result-tabs">
          <button
            className={`tab-button ${activeTab === 'extracted' ? 'active' : ''}`}
            onClick={() => setActiveTab('extracted')}
          >
            📄 Extracted Data
          </button>
          <button
            className={`tab-button ${activeTab === 'validation' ? 'active' : ''}`}
            onClick={() => setActiveTab('validation')}
          >
            ✓ Validation
          </button>
          <button
            className={`tab-button ${activeTab === 'summary' ? 'active' : ''}`}
            onClick={() => setActiveTab('summary')}
          >
            📊 Summary
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'extracted' && (
            <div className="extracted-data">
              <h3>Extracted Information</h3>
              <div className="data-grid">
                {renderExtractedFields()}
              </div>
            </div>
          )}

          {activeTab === 'validation' && (
            <div className="validation-data">
              <h3>Validation Results</h3>
              {renderValidation()}
            </div>
          )}

          {activeTab === 'summary' && (
            <div className="summary-data">
              <h3>Processing Summary</h3>
              {renderSummary()}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="result-actions">
          <button className="action-button secondary" onClick={onReset}>
            📁 Analyze Another Document
          </button>
          <button 
            className="action-button primary"
            onClick={() => {
              const dataStr = JSON.stringify(result, null, 2);
              const dataBlob = new Blob([dataStr], {type: 'application/json'});
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `document-analysis-${Date.now()}.json`;
              link.click();
              URL.revokeObjectURL(url);
            }}
          >
            💾 Download Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentResult;
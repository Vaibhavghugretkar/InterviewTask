import React, { useState } from 'react';
import './App.css';
import DocumentUpload from './components/DocumentUpload';
import DocumentResult from './components/DocumentResult';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const [uploadResult, setUploadResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUploadSuccess = (result) => {
    setUploadResult(result);
    setError(null);
  };

  const handleUploadError = (errorMessage) => {
    setError(errorMessage);
    setUploadResult(null);
  };

  const handleReset = () => {
    setUploadResult(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Document Analysis System</h1>
        <p>Upload your passport or driving license for instant analysis</p>
      </header>

      <main className="App-main">
        <div className="container">
          {!uploadResult && !isLoading && (
            <DocumentUpload
              onSuccess={handleUploadSuccess}
              onError={handleUploadError}
              onLoading={setIsLoading}
            />
          )}

          {isLoading && (
            <div className="loading-container">
              <LoadingSpinner />
              <p className="loading-text">
                Analyzing your document... This may take a few moments.
              </p>
            </div>
          )}

          {error && (
            <div className="error-container">
              <div className="error-message">
                <h3>⚠️ Error</h3>
                <p>{error}</p>
                <button onClick={handleReset} className="retry-button">
                  Try Again
                </button>
              </div>
            </div>
          )}

          {uploadResult && !isLoading && (
            <DocumentResult 
              result={uploadResult} 
              onReset={handleReset}
            />
          )}
        </div>
      </main>

      <footer className="App-footer">
        <p>&copy; 2024 Document Analysis System. Powered by Google Gemini AI.</p>
      </footer>
    </div>
  );
}

export default App;
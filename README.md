# Document Analysis Application

A full-stack web application that allows users to upload identity documents (passport or driving license) and automatically extract information using Google's Gemini AI API.

## Features

- **Document Upload**: Drag-and-drop or click-to-upload interface
- **Document Type Detection**: Automatically identifies passport vs driving license
- **Information Extraction**: Extracts relevant fields based on document type
- **Validation**: Validates extracted data and provides feedback
- **Secure Processing**: Files are processed securely and deleted after analysis
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

### Frontend
- **React.js 18** - Modern React with hooks
- **CSS3** - Custom styling with modern features (backdrop-filter, gradients)
- **Axios** - HTTP client for API requests

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **Multer** - File upload handling
- **Google Generative AI** - Gemini API integration
- **CORS** - Cross-origin resource sharing

## Prerequisites

- Node.js 16 or higher
- npm or yarn package manager
- Google Gemini API key

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd document-analysis-app
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
NODE_ENV=development
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Optionally, create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Running the Application

### 1. Start the Backend Server
```bash
cd backend
npm run dev
```
The backend server will start on `http://localhost:5000`

### 2. Start the Frontend Development Server
```bash
cd frontend
npm start
```
The frontend will start on `http://localhost:3000`

## API Endpoints

### Document Analysis
- **POST** `/api/upload/analyze`
  - Upload and analyze a document
  - Body: multipart/form-data with 'document' field
  - Returns: Analysis results with extracted data

### Health Checks
- **GET** `/api/health` - Main API health check
- **GET** `/api/upload/health` - Upload service health check

### Supported Types
- **GET** `/api/upload/supported-types` - Get supported document types and formats

## Supported Document Types

### Passport
Extracts:
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

### Driving License
Extracts:
- License Number
- Full Name
- Date of Birth
- Address
- Issue Date
- Expiry Date
- License Classes/Categories
- Issuing Authority
- State/Region

## File Requirements

- **Supported Formats**: JPEG, PNG, GIF, BMP, WebP
- **Maximum Size**: 10MB
- **Quality**: Clear, well-lit images for best results

## Security Features

- File validation and sanitization
- Automatic file cleanup after processing
- Rate limiting protection
- Error handling and validation
- No permanent storage of uploaded documents

## Error Handling

The application includes comprehensive error handling for:
- Invalid file types or sizes
- Network connectivity issues
- API rate limits
- Server errors
- Validation failures

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Development

### Backend Development
- Uses nodemon for auto-restart during development
- Express middleware for CORS, file uploads, and error handling
- Modular structure with separate services and utilities

### Frontend Development
- React development server with hot reload
- Component-based architecture
- Custom CSS with modern features
- Responsive design principles

## Production Deployment

### Backend
1. Set `NODE_ENV=production`
2. Use a process manager like PM2
3. Configure proper HTTPS
4. Set up proper logging

### Frontend
1. Build the production bundle: `npm run build`
2. Serve static files with a web server (nginx, Apache)
3. Configure proper routing for SPA

## Troubleshooting

### Common Issues

1. **API Key Error**
   - Ensure your Gemini API key is valid and properly set in `.env`

2. **File Upload Fails**
   - Check file size (must be under 10MB)
   - Ensure file is a supported image format

3. **CORS Issues**
   - Verify frontend and backend URLs are properly configured

4. **Poor Extraction Results**
   - Ensure document image is clear and well-lit
   - Try different image orientation if needed

## License

MIT License - see LICENSE file for details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Create an issue in the repository

# Case Creation System

A web application that allows users to upload QA BRD documents and automatically generates test case scenarios using AI.

## Features

- Upload QA BRD documents in .docx format
- AI-powered analysis of the document
- Automatic generation of test case scenarios
- Download generated test cases

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- OpenAI API key

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```
4. Create an `uploads` directory in the root folder:
   ```bash
   mkdir uploads
   ```

## Running the Application

1. Start the server:
   ```bash
   npm start
   ```
2. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Click the "Upload QA BRD Document" button
2. Select your .docx file containing the QA BRD document
3. Click "Upload and Analyze"
4. Wait for the AI to analyze the document and generate test cases
5. View the generated test cases on screen
6. Click "Download Test Cases" to save the results

## Notes

- Only .docx files are supported
- The application uses OpenAI's GPT model for document analysis
- Generated test cases are saved in text format 
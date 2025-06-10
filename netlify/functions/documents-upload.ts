import { Handler } from '@netlify/functions';
import { supabase } from './lib/supabase';
import { driveService } from './lib/drive';
import { geminiService } from './lib/gemini';

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
];

interface AIProcessingResult {
  extractedText: string;
  summary: string;
  keywords: string[];
}

interface DocumentAnalysis {
  category: string;
  priority: 'low' | 'medium' | 'high';
  suggestedTags: string[];
  actionItems: string[];
}

export const handler: Handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    if (!event.body) {
      throw new Error('No request body');
    }

    const { 
      title,
      description,
      file,
      document_type = 'uploaded',
      tags = [],
      priority = 'medium'
    } = JSON.parse(event.body);

    // Validate required fields
    if (!title || !description || !file || !document_type || !priority) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required fields',
          details: {
            title: !title ? 'Title is required' : null,
            description: !description ? 'Description is required' : null,
            file: !file ? 'File is required' : null,
            document_type: !document_type ? 'Document type is required' : null,
            priority: !priority ? 'Priority is required' : null
          }
        }),
      };
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid file type',
          allowedTypes: ALLOWED_FILE_TYPES
        }),
      };
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'File too large',
          maxSize: MAX_FILE_SIZE,
          currentSize: file.size
        }),
      };
    }

    // 1. Upload to Google Drive
    const driveFile = await driveService.uploadFile({
      name: file.name,
      mimeType: file.type,
      content: file.content,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID!]
    });

    if (!driveFile.id) {
      throw new Error('Failed to upload file to Google Drive');
    }

    // 2. Create document record in Supabase
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert([{
        title,
        description,
        file_url: driveFile.webViewLink,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        document_type,
        tags,
        priority,
        status: 'pending',
        google_drive_id: driveFile.id,
        google_drive_url: driveFile.webViewLink,
        created_by: event.headers.authorization?.split(' ')[1] // JWT token
      }])
      .select()
      .single();

    if (dbError) throw dbError;

    // 3. Process with AI if enabled
    let aiProcessing = null;
    let documentAnalysis = null;

    if (process.env.VITE_ENABLE_AI_PROCESSING === 'true') {
      try {
        // Extract text from document
        aiProcessing = await driveService.extractText(driveFile.id);
        
        // Analyze with Gemini
        if (aiProcessing?.extractedText) {
          documentAnalysis = await geminiService.analyzeDocument(aiProcessing.extractedText);
          
          // Update document with analysis results
          if (documentAnalysis) {
            await supabase
              .from('documents')
              .update({
                document_type: documentAnalysis.category,
                priority: documentAnalysis.priority,
                tags: documentAnalysis.suggestedTags,
                ai_summary: documentAnalysis.summary,
                ai_keywords: documentAnalysis.keywords,
                status: 'completed'
              })
              .eq('id', document.id);
          }
        }
      } catch (error) {
        console.warn('AI processing failed:', error);
        // Update document status to indicate AI processing failed
        await supabase
          .from('documents')
          .update({
            status: 'completed',
            metadata: {
              processing_status: 'failed',
              processing_error: error.message
            }
          })
          .eq('id', document.id);
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        document: {
          ...document,
          driveFile,
          aiProcessing,
          documentAnalysis
        }
      })
    };

  } catch (error: any) {
    console.error('Error in document upload:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message
      })
    };
  }
}; 
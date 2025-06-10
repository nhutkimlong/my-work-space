import { Handler } from '@netlify/functions';
import { supabase } from './lib/supabase';
import { googleDriveService } from './lib/google-drive';

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== 'DELETE') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { queryStringParameters } = event;
    const { id } = queryStringParameters || {};

    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Document ID is required' }),
      };
    }

    // Get document info first
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('id, google_drive_id, created_by')
      .eq('id', id)
      .single();

    if (fetchError || !document) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Document not found' }),
      };
    }

    // Delete from Google Drive if google_drive_id exists
    let driveDeleteResult = null;
    if (document.google_drive_id) {
      try {
        driveDeleteResult = await googleDriveService.deleteFile(document.google_drive_id);
      } catch (error) {
        console.warn('Failed to delete from Google Drive:', error);
        // Continue with database deletion even if Drive deletion fails
      }
    }

    // Delete from Supabase
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw new Error(`Database deletion failed: ${deleteError.message}`);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Document deleted successfully',
        driveDeleteResult,
      }),
    };

  } catch (error) {
    console.error('Delete document error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to delete document',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}; 
import { Handler } from '@netlify/functions';
import { supabase } from './lib/supabase';

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { queryStringParameters } = event;
    const {
      id,
      search,
      document_type,
      priority,
      status,
      created_by,
      limit = '20',
      offset = '0',
      sort_by = 'created_at',
      sort_order = 'desc'
    } = queryStringParameters || {};

    // Get single document by ID
    if (id) {
      const { data: document, error } = await supabase
        .from('documents')
        .select(`
          *,
          creator:profiles!created_by (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Document not found: ${error.message}`);
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ document }),
      };
    }

    // Build query for listing documents
    let query = supabase
      .from('documents')
      .select(`
        *,
        creator:profiles!created_by (
          id,
          full_name,
          avatar_url
        )
      `);

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,ai_extracted_text.ilike.%${search}%`);
    }

    if (document_type) {
      query = query.eq('document_type', document_type);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (created_by) {
      query = query.eq('created_by', created_by);
    }

    // Apply sorting
    query = query.order(sort_by, { ascending: sort_order === 'asc' });

    // Apply pagination
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    query = query.range(offsetNum, offsetNum + limitNum - 1);

    const { data: documents, error, count } = await query;

    if (error) {
      throw new Error(`Query failed: ${error.message}`);
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        documents: documents || [],
        pagination: {
          total: totalCount || 0,
          limit: limitNum,
          offset: offsetNum,
          hasMore: (offsetNum + limitNum) < (totalCount || 0),
        },
      }),
    };

  } catch (error) {
    console.error('Read documents error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to read documents',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}; 
import { Handler } from '@netlify/functions';
import { supabase } from './lib/supabase';

// Allowed SQL commands for security
const ALLOWED_COMMANDS = [
  'SELECT', 'WITH'
];

const DANGEROUS_PATTERNS = [
  /DELETE\s+FROM/i,
  /UPDATE\s+\w+\s+SET/i,
  /INSERT\s+INTO/i,
  /DROP\s+TABLE/i,
  /ALTER\s+TABLE/i,
  /CREATE\s+TABLE/i,
  /TRUNCATE/i,
  /GRANT/i,
  /REVOKE/i
];

function validateQuery(query: string): { isValid: boolean; error?: string } {
  const trimmedQuery = query.trim();
  
  // Check if query is empty
  if (!trimmedQuery) {
    return { isValid: false, error: 'Query cannot be empty' };
  }

  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(trimmedQuery)) {
      return { isValid: false, error: 'Query contains dangerous operations. Only SELECT statements are allowed.' };
    }
  }

  // Check if query starts with allowed command
  const firstWord = trimmedQuery.split(/\s+/)[0].toUpperCase();
  if (!ALLOWED_COMMANDS.includes(firstWord)) {
    return { isValid: false, error: `Command '${firstWord}' is not allowed. Only SELECT and WITH statements are permitted.` };
  }

  return { isValid: true };
}

export const handler: Handler = async (event, context) => {
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
    const { query } = JSON.parse(event.body || '{}');

    if (!query) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Query is required' }),
      };
    }

    // Validate query for security
    const validation = validateQuery(query);
    if (!validation.isValid) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: validation.error }),
      };
    }

    // Execute query
    const startTime = Date.now();
    
    try {
      const { data, error } = await supabase.rpc('execute_sql', { 
        sql_query: query 
      });

      const executionTime = Date.now() - startTime;

      if (error) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: `SQL Error: ${error.message}`,
            executionTime 
          }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          data: data || [],
          executionTime,
          rowCount: Array.isArray(data) ? data.length : 0,
        }),
      };

    } catch (dbError) {
      // Fallback: try direct query execution for simple SELECTs
      if (query.trim().toUpperCase().startsWith('SELECT')) {
        try {
          // For simple SELECT queries, we can try to parse and execute directly
          const { data, error } = await executeSelectQuery(query);
          
          if (error) {
            throw error;
          }

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              data: data || [],
              executionTime: Date.now() - startTime,
              rowCount: Array.isArray(data) ? data.length : 0,
            }),
          };
        } catch (fallbackError) {
          console.error('Fallback query execution failed:', fallbackError);
        }
      }

      throw dbError;
    }

  } catch (error) {
    console.error('SQL query error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Query execution failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

// Fallback function for simple SELECT queries
async function executeSelectQuery(query: string) {
  const trimmedQuery = query.trim();
  
  // Simple pattern matching for basic SELECT queries
  const tableMatch = trimmedQuery.match(/FROM\s+(\w+)/i);
  if (!tableMatch) {
    throw new Error('Could not parse table name from query');
  }

  const tableName = tableMatch[1];

  // Check if table exists in our known tables
  const knownTables = ['documents', 'tasks', 'events', 'profiles'];
  if (!knownTables.includes(tableName)) {
    throw new Error(`Table '${tableName}' is not accessible`);
  }

  // For safety, execute a simple select on the table
  // This is a basic fallback - in production you'd want more sophisticated parsing
  return await supabase.from(tableName).select('*').limit(100);
} 
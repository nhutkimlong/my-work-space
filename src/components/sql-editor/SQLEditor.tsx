import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Save, 
  History, 
  Database, 
  Table, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Download,
  Trash
} from 'lucide-react';

interface QueryResult {
  data?: any[];
  error?: string;
  executionTime?: number;
  rowCount?: number;
}

interface QueryHistory {
  id: string;
  query: string;
  timestamp: Date;
  executionTime?: number;
  status: 'success' | 'error';
}

const SQLEditor: React.FC = () => {
  const [query, setQuery] = useState(`-- SQL Editor cho Supabase
-- Ví dụ queries:

-- 1. Xem tất cả documents
SELECT 
  id,
  title,
  document_type,
  priority,
  status,
  created_at
FROM documents 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. Thống kê documents theo loại
SELECT 
  document_type,
  COUNT(*) as total,
  AVG(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) * 100 as completion_rate
FROM documents 
GROUP BY document_type;

-- 3. Tìm documents có AI summary
SELECT 
  title,
  ai_summary,
  ai_keywords
FROM documents 
WHERE ai_summary IS NOT NULL;`);

  const [result, setResult] = useState<QueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [history, setHistory] = useState<QueryHistory[]>([]);
  const [savedQueries, setSavedQueries] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Predefined common queries
  const commonQueries = {
    'Tất cả documents': `SELECT * FROM documents ORDER BY created_at DESC LIMIT 20;`,
    'Tasks theo trạng thái': `SELECT status, COUNT(*) as count FROM tasks GROUP BY status;`,
    'Events sắp tới': `SELECT * FROM events WHERE start_date > NOW() ORDER BY start_date LIMIT 10;`,
    'Users và profiles': `SELECT u.id, u.email, p.full_name, p.role, p.department FROM auth.users u LEFT JOIN profiles p ON u.id = p.id;`,
    'Documents với AI processing': `SELECT title, document_type, ai_summary, array_length(ai_keywords, 1) as keyword_count FROM documents WHERE ai_summary IS NOT NULL;`,
    'Thống kê theo tháng': `SELECT 
      DATE_TRUNC('month', created_at) as month,
      COUNT(*) as total_documents,
      COUNT(CASE WHEN ai_summary IS NOT NULL THEN 1 END) as ai_processed
    FROM documents 
    GROUP BY month 
    ORDER BY month DESC;`
  };

  const executeQuery = async () => {
    if (!query.trim()) return;

    setIsExecuting(true);
    const startTime = Date.now();

    try {
      // Call Netlify Function to execute query
      const response = await fetch('/.netlify/functions/sql-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      const executionTime = Date.now() - startTime;

      if (response.ok) {
        setResult({
          data: data.data,
          executionTime,
          rowCount: data.data?.length || 0,
        });

        // Add to history
        const historyItem: QueryHistory = {
          id: Date.now().toString(),
          query,
          timestamp: new Date(),
          executionTime,
          status: 'success',
        };
        setHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Keep last 10
      } else {
        setResult({
          error: data.error || 'Query execution failed',
          executionTime,
        });

        const historyItem: QueryHistory = {
          id: Date.now().toString(),
          query,
          timestamp: new Date(),
          executionTime,
          status: 'error',
        };
        setHistory(prev => [historyItem, ...prev.slice(0, 9)]);
      }
    } catch (error) {
      const executionTime = Date.now() - startTime;
      setResult({
        error: 'Network error or server unavailable',
        executionTime,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const saveQuery = () => {
    if (query.trim() && !savedQueries.includes(query)) {
      setSavedQueries(prev => [...prev, query]);
    }
  };

  const loadQuery = (queryText: string) => {
    setQuery(queryText);
  };

  const exportResults = () => {
    if (!result?.data) return;

    const csv = [
      Object.keys(result.data[0]).join(','),
      ...result.data.map(row => 
        Object.values(row).map(val => 
          typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_results_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            SQL Editor - Supabase Database
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Query Editor */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Query Editor</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={saveQuery}>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={executeQuery} 
                    disabled={isExecuting || !query.trim()}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    {isExecuting ? 'Executing...' : 'Execute'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                ref={textareaRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your SQL query here..."
                className="min-h-[300px] font-mono text-sm"
                style={{ resize: 'vertical' }}
              />
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Results</CardTitle>
                {result?.data && (
                  <Button size="sm" variant="outline" onClick={exportResults}>
                    <Download className="h-4 w-4 mr-1" />
                    Export CSV
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!result && (
                <div className="text-center py-8 text-muted-foreground">
                  Execute a query to see results
                </div>
              )}

              {result?.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{result.error}</AlertDescription>
                </Alert>
              )}

              {result?.data && (
                <div className="space-y-3">
                  {/* Execution info */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {result.rowCount} rows
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {result.executionTime}ms
                    </div>
                  </div>

                  {/* Data table */}
                  <ScrollArea className="h-[400px] border rounded">
                    <div className="p-4">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            {Object.keys(result.data[0] || {}).map(column => (
                              <th key={column} className="text-left p-2 font-medium">
                                {column}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {result.data.map((row, index) => (
                            <tr key={index} className="border-b last:border-0 hover:bg-muted/50">
                              {Object.values(row).map((value, i) => (
                                <td key={i} className="p-2">
                                  {value === null ? (
                                    <span className="text-muted-foreground italic">null</span>
                                  ) : typeof value === 'object' ? (
                                    <span className="text-blue-600">{JSON.stringify(value)}</span>
                                  ) : (
                                    String(value)
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Tabs defaultValue="common" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="common">Common</TabsTrigger>
              <TabsTrigger value="saved">Saved</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            {/* Common Queries */}
            <TabsContent value="common" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Common Queries</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(commonQueries).map(([name, queryText]) => (
                    <Button
                      key={name}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left h-auto p-2"
                      onClick={() => loadQuery(queryText)}
                    >
                      <div>
                        <div className="font-medium">{name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {queryText.split('\n')[0].slice(0, 40)}...
                        </div>
                      </div>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Saved Queries */}
            <TabsContent value="saved" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Saved Queries</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {savedQueries.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      No saved queries
                    </div>
                  ) : (
                    savedQueries.map((savedQuery, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 justify-start text-left h-auto p-2"
                          onClick={() => loadQuery(savedQuery)}
                        >
                          <div className="text-xs truncate">
                            {savedQuery.split('\n')[0].slice(0, 30)}...
                          </div>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSavedQueries(prev => prev.filter((_, i) => i !== index))}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Query History */}
            <TabsContent value="history" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Query History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {history.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      No query history
                    </div>
                  ) : (
                    history.map((item) => (
                      <Button
                        key={item.id}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left h-auto p-2"
                        onClick={() => loadQuery(item.query)}
                      >
                        <div className="w-full">
                          <div className="flex items-center justify-between mb-1">
                            <Badge 
                              variant={item.status === 'success' ? 'default' : 'destructive'}
                              className="text-xs"
                            >
                              {item.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {item.executionTime}ms
                            </span>
                          </div>
                          <div className="text-xs truncate">
                            {item.query.split('\n')[0].slice(0, 30)}...
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </Button>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SQLEditor; 
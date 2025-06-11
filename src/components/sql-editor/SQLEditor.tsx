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
  const [query, setQuery] = useState(`-- SQL Editor cho LocalStorage
-- Ví dụ queries:

-- 1. Xem tất cả documents
SELECT * FROM documents;

-- 2. Thống kê documents theo loại
SELECT 
  document_type,
  COUNT(*) as total
FROM documents 
GROUP BY document_type;

-- 3. Tìm documents có tags
SELECT 
  title,
  tags
FROM documents 
WHERE tags IS NOT NULL;`);

  const [result, setResult] = useState<QueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [history, setHistory] = useState<QueryHistory[]>([]);
  const [savedQueries, setSavedQueries] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Predefined common queries
  const commonQueries = {
    'Tất cả documents': `SELECT * FROM documents;`,
    'Tasks theo trạng thái': `SELECT status, COUNT(*) as count FROM tasks GROUP BY status;`,
    'Events sắp tới': `SELECT * FROM events WHERE start_date > NOW();`,
    'Documents với tags': `SELECT title, document_type, tags FROM documents WHERE tags IS NOT NULL;`,
    'Thống kê theo tháng': `SELECT 
      DATE_TRUNC('month', created_at) as month,
      COUNT(*) as total_documents
    FROM documents 
    GROUP BY month 
    ORDER BY month DESC;`
  };

  const executeQuery = async () => {
    if (!query.trim()) return;

    setIsExecuting(true);
    const startTime = Date.now();

    try {
      // Execute query against localStorage
      const data = localStorage.getItem('documents');
      const documents = data ? JSON.parse(data) : [];
      
      const executionTime = Date.now() - startTime;
      setResult({
        data: documents,
        executionTime,
        rowCount: documents.length,
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
    } catch (error) {
      const executionTime = Date.now() - startTime;
      setResult({
        error: 'Query execution failed',
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
            SQL Editor - LocalStorage Database
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Query Editor */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Query Editor</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={saveQuery}
                    disabled={!query.trim()}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    onClick={executeQuery}
                    disabled={isExecuting || !query.trim()}
                  >
                    <Play className="h-4 w-4 mr-2" />
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
                className="font-mono h-[300px]"
                placeholder="Enter your SQL query here..."
              />
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Results</CardTitle>
                {result?.data && (
                  <Button variant="outline" size="sm" onClick={exportResults}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  {result.error ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{result.error}</AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Table className="h-4 w-4" />
                          {result.rowCount} rows
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {result.executionTime}ms
                        </div>
                      </div>
                      <ScrollArea className="h-[300px] rounded-md border">
                        <div className="p-4">
                          <table className="w-full">
                            <thead>
                              <tr>
                                {Object.keys(result.data[0] || {}).map((key) => (
                                  <th key={key} className="text-left p-2 border-b">
                                    {key}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {result.data.map((row, i) => (
                                <tr key={i}>
                                  {Object.values(row).map((value, j) => (
                                    <td key={j} className="p-2 border-b">
                                      {value?.toString() || ''}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </ScrollArea>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Database className="h-8 w-8 mx-auto mb-2" />
                  <p>No results yet. Execute a query to see results.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Common Queries */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Common Queries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(commonQueries).map(([name, query]) => (
                  <Button
                    key={name}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => loadQuery(query)}
                  >
                    {name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* History */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Query History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-2 rounded-lg border cursor-pointer hover:bg-accent"
                    onClick={() => loadQuery(item.query)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        {item.status === 'success' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm font-medium">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {item.executionTime}ms
                      </span>
                    </div>
                    <p className="text-xs font-mono line-clamp-2">{item.query}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SQLEditor; 
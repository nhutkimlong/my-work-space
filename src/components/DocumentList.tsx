import { useEffect, useState } from 'react'
import { supabaseService, Document } from '../services/supabaseService'

export function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadDocuments() {
      try {
        const data = await supabaseService.getDocuments()
        setDocuments(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load documents')
      } finally {
        setLoading(false)
      }
    }

    loadDocuments()
  }, [])

  if (loading) {
    return <div className="p-4">Loading documents...</div>
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Documents</h2>
      <div className="grid gap-4">
        {documents.map((doc) => (
          <div key={doc.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold mb-2">{doc.title}</h3>
            {doc.description && (
              <p className="text-gray-600 mb-2">{doc.description}</p>
            )}
            <div className="flex flex-wrap gap-2 mb-2">
              {doc.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Type: {doc.document_type}</span>
              <span>Status: {doc.status}</span>
              <span>Priority: {doc.priority}</span>
            </div>
            {doc.google_drive_url && (
              <a
                href={doc.google_drive_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-blue-600 hover:underline"
              >
                View in Google Drive
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 
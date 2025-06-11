import { useEffect, useState } from 'react'
import { Document } from '@/types'
import { localStorageService } from '@/services/localStorage'

export const DocumentList = () => {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const data = await localStorageService.getDocuments()
        setDocuments(data)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load documents')
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <div key={doc.id} className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold">{doc.title}</h3>
          <p className="text-sm text-gray-500">{doc.description}</p>
          <div className="mt-2 flex gap-2">
            {doc.tags.map((tag) => (
              <span key={tag} className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
} 
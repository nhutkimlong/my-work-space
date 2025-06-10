import { apiClient, buildQueryParams, uploadFile } from '@/lib/api';
import { 
  Document, 
  CreateDocumentForm, 
  SearchFilters, 
  PaginatedResponse, 
  ApiResponse,
  DocumentStatistics,
  Comment 
} from '@/types';

export class DocumentService {
  private basePath = '/documents';

  // Get all documents with filtering and pagination
  async getDocuments(
    filters: SearchFilters = {}, 
    page: number = 1, 
    perPage: number = 20
  ): Promise<PaginatedResponse<Document>> {
    const params = {
      ...buildQueryParams(filters),
      page,
      per_page: perPage,
    };

    return apiClient.get(`${this.basePath}`, params);
  }

  // Get document by ID
  async getDocument(id: string): Promise<ApiResponse<Document>> {
    return apiClient.get(`${this.basePath}/${id}`);
  }

  // Create new document
  async createDocument(data: CreateDocumentForm): Promise<ApiResponse<Document>> {
    const formData = new FormData();
    
    // Add file
    formData.append('file', data.file);
    
    // Add metadata
    formData.append('title', data.title);
    formData.append('document_type', data.document_type);
    formData.append('priority', data.priority);
    formData.append('tags', JSON.stringify(data.tags));
    
    if (data.description) formData.append('description', data.description);
    if (data.assigned_to?.length) formData.append('assigned_to', JSON.stringify(data.assigned_to));
    if (data.due_date) formData.append('due_date', data.due_date);

    return apiClient.post(this.basePath, formData);
  }

  // Update document
  async updateDocument(id: string, data: Partial<Document>): Promise<ApiResponse<Document>> {
    return apiClient.put(`${this.basePath}/${id}`, data);
  }

  // Delete document
  async deleteDocument(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`${this.basePath}/${id}`);
  }

  // Upload new version of document
  async uploadNewVersion(id: string, file: File): Promise<ApiResponse<Document>> {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiClient.post(`${this.basePath}/${id}/versions`, formData);
  }

  // Get document versions
  async getDocumentVersions(id: string): Promise<ApiResponse<Document[]>> {
    return apiClient.get(`${this.basePath}/${id}/versions`);
  }

  // Share document with users
  async shareDocument(id: string, userIds: string[], permissions: 'read' | 'write' = 'read'): Promise<ApiResponse<void>> {
    return apiClient.post(`${this.basePath}/${id}/share`, {
      user_ids: userIds,
      permissions,
    });
  }

  // Remove document sharing
  async unshareDocument(id: string, userIds: string[]): Promise<ApiResponse<void>> {
    return apiClient.post(`${this.basePath}/${id}/unshare`, {
      user_ids: userIds,
    });
  }

  // Get shared documents
  async getSharedDocuments(): Promise<ApiResponse<Document[]>> {
    return apiClient.get(`${this.basePath}/shared`);
  }

  // AI-powered features
  async processDocumentWithAI(id: string): Promise<ApiResponse<{
    summary: string;
    extracted_text: string;
    keywords: string[];
    sentiment?: string;
  }>> {
    return apiClient.post(`${this.basePath}/${id}/ai-process`);
  }

  // Search documents using AI semantic search
  async searchDocumentsAI(query: string, limit: number = 10): Promise<ApiResponse<Document[]>> {
    return apiClient.post(`${this.basePath}/ai-search`, {
      query,
      limit,
    });
  }

  // Get AI suggestions for document categorization
  async getAICategorizationSuggestions(id: string): Promise<ApiResponse<{
    suggested_type: string;
    suggested_tags: string[];
    confidence: number;
  }>> {
    return apiClient.get(`${this.basePath}/${id}/ai-categorize`);
  }

  // Generate document summary using AI
  async generateAISummary(id: string): Promise<ApiResponse<{
    summary: string;
    key_points: string[];
    action_items: string[];
  }>> {
    return apiClient.post(`${this.basePath}/${id}/ai-summarize`);
  }

  // Extract text from document using OCR
  async extractTextOCR(id: string): Promise<ApiResponse<{
    extracted_text: string;
    confidence: number;
    pages: Array<{
      page_number: number;
      text: string;
      confidence: number;
    }>;
  }>> {
    return apiClient.post(`${this.basePath}/${id}/ocr`);
  }

  // Get document statistics
  async getDocumentStatistics(dateRange?: { start: string; end: string }): Promise<ApiResponse<DocumentStatistics>> {
    const params = dateRange ? {
      start_date: dateRange.start,
      end_date: dateRange.end,
    } : {};
    
    return apiClient.get(`${this.basePath}/statistics`, params);
  }

  // Download document
  async downloadDocument(id: string): Promise<ApiResponse<{ download_url: string }>> {
    return apiClient.get(`${this.basePath}/${id}/download`);
  }

  // Get document preview
  async getDocumentPreview(id: string): Promise<ApiResponse<{ preview_url: string }>> {
    return apiClient.get(`${this.basePath}/${id}/preview`);
  }

  // Add comment to document
  async addComment(id: string, content: string, parentId?: string): Promise<ApiResponse<Comment>> {
    return apiClient.post(`${this.basePath}/${id}/comments`, {
      content,
      parent_id: parentId,
    });
  }

  // Get document comments
  async getComments(id: string): Promise<ApiResponse<Comment[]>> {
    return apiClient.get(`${this.basePath}/${id}/comments`);
  }

  // Update document tags
  async updateTags(id: string, tags: string[]): Promise<ApiResponse<Document>> {
    return apiClient.patch(`${this.basePath}/${id}/tags`, { tags });
  }

  // Get documents by tag
  async getDocumentsByTag(tag: string): Promise<ApiResponse<Document[]>> {
    return apiClient.get(`${this.basePath}/tag/${encodeURIComponent(tag)}`);
  }

  // Get all available tags
  async getAllTags(): Promise<ApiResponse<string[]>> {
    return apiClient.get(`${this.basePath}/tags`);
  }

  // Bulk operations
  async bulkUpdateStatus(documentIds: string[], status: string): Promise<ApiResponse<void>> {
    return apiClient.patch(`${this.basePath}/bulk/status`, {
      document_ids: documentIds,
      status,
    });
  }

  async bulkDelete(documentIds: string[]): Promise<ApiResponse<void>> {
    return apiClient.post(`${this.basePath}/bulk/delete`, {
      document_ids: documentIds,
    });
  }

  async bulkAssign(documentIds: string[], userIds: string[]): Promise<ApiResponse<void>> {
    return apiClient.patch(`${this.basePath}/bulk/assign`, {
      document_ids: documentIds,
      user_ids: userIds,
    });
  }

  // Google Drive integration
  async syncWithGoogleDrive(): Promise<ApiResponse<{ synced_count: number }>> {
    return apiClient.post(`${this.basePath}/google-drive/sync`);
  }

  async importFromGoogleDrive(fileIds: string[]): Promise<ApiResponse<Document[]>> {
    return apiClient.post(`${this.basePath}/google-drive/import`, {
      file_ids: fileIds,
    });
  }

  async exportToGoogleDrive(documentIds: string[]): Promise<ApiResponse<{ exported_files: Array<{ id: string; drive_id: string }> }>> {
    return apiClient.post(`${this.basePath}/google-drive/export`, {
      document_ids: documentIds,
    });
  }
}

// Export singleton instance
export const documentService = new DocumentService(); 
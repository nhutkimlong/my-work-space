import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from '@/services/documentService';
import { Document, CreateDocumentForm, SearchFilters } from '@/types';
import { toast } from 'sonner';

// Query keys
export const documentKeys = {
  all: ['documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  list: (filters: SearchFilters, page: number, perPage: number) => 
    [...documentKeys.lists(), { filters, page, perPage }] as const,
  details: () => [...documentKeys.all, 'detail'] as const,
  detail: (id: string) => [...documentKeys.details(), id] as const,
  statistics: () => [...documentKeys.all, 'statistics'] as const,
  tags: () => [...documentKeys.all, 'tags'] as const,
  shared: () => [...documentKeys.all, 'shared'] as const,
};

// Hook for fetching documents list
export const useDocuments = (
  filters: SearchFilters = {},
  page: number = 1,
  perPage: number = 20
) => {
  return useQuery({
    queryKey: documentKeys.list(filters, page, perPage),
    queryFn: () => documentService.getDocuments(filters, page, perPage),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook for fetching single document
export const useDocument = (id: string) => {
  return useQuery({
    queryKey: documentKeys.detail(id),
    queryFn: () => documentService.getDocument(id),
    enabled: !!id,
  });
};

// Hook for creating document
export const useCreateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDocumentForm) => documentService.createDocument(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: documentKeys.statistics() });
      toast.success('Tài liệu đã được tạo thành công');
    },
    onError: (error: any) => {
      toast.error('Có lỗi xảy ra khi tạo tài liệu: ' + error.message);
    },
  });
};

// Hook for updating document
export const useUpdateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Document> }) =>
      documentService.updateDocument(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      toast.success('Tài liệu đã được cập nhật');
    },
    onError: (error: any) => {
      toast.error('Có lỗi xảy ra khi cập nhật tài liệu: ' + error.message);
    },
  });
};

// Hook for deleting document
export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentService.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: documentKeys.statistics() });
      toast.success('Tài liệu đã được xóa');
    },
    onError: (error: any) => {
      toast.error('Có lỗi xảy ra khi xóa tài liệu: ' + error.message);
    },
  });
};

// Hook for AI document processing
export const useProcessDocumentAI = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentService.processDocumentWithAI(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(id) });
      toast.success('Tài liệu đã được xử lý bằng AI');
    },
    onError: (error: any) => {
      toast.error('Có lỗi xảy ra khi xử lý AI: ' + error.message);
    },
  });
};

// Hook for AI document search
export const useSearchDocumentsAI = () => {
  return useMutation({
    mutationFn: ({ query, limit }: { query: string; limit?: number }) =>
      documentService.searchDocumentsAI(query, limit),
    onError: (error: any) => {
      toast.error('Có lỗi xảy ra khi tìm kiếm: ' + error.message);
    },
  });
};

// Hook for generating AI summary
export const useGenerateDocumentSummary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentService.generateAISummary(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(id) });
      toast.success('Tóm tắt AI đã được tạo');
    },
    onError: (error: any) => {
      toast.error('Có lỗi xảy ra khi tạo tóm tắt: ' + error.message);
    },
  });
};

// Hook for OCR text extraction
export const useExtractTextOCR = () => {
  return useMutation({
    mutationFn: (id: string) => documentService.extractTextOCR(id),
    onError: (error: any) => {
      toast.error('Có lỗi xảy ra khi trích xuất văn bản: ' + error.message);
    },
  });
};

// Hook for document statistics
export const useDocumentStatistics = (dateRange?: { start: string; end: string }) => {
  return useQuery({
    queryKey: [...documentKeys.statistics(), dateRange],
    queryFn: () => documentService.getDocumentStatistics(dateRange),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Hook for sharing document
export const useShareDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      id, 
      userIds, 
      permissions 
    }: { 
      id: string; 
      userIds: string[]; 
      permissions?: 'read' | 'write' 
    }) => documentService.shareDocument(id, userIds, permissions),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(id) });
      toast.success('Tài liệu đã được chia sẻ');
    },
    onError: (error: any) => {
      toast.error('Có lỗi xảy ra khi chia sẻ tài liệu: ' + error.message);
    },
  });
};

// Hook for document tags
export const useDocumentTags = () => {
  return useQuery({
    queryKey: documentKeys.tags(),
    queryFn: () => documentService.getAllTags(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

// Hook for updating document tags
export const useUpdateDocumentTags = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, tags }: { id: string; tags: string[] }) =>
      documentService.updateTags(id, tags),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: documentKeys.tags() });
      toast.success('Thẻ tài liệu đã được cập nhật');
    },
    onError: (error: any) => {
      toast.error('Có lỗi xảy ra khi cập nhật thẻ: ' + error.message);
    },
  });
};

// Hook for shared documents
export const useSharedDocuments = () => {
  return useQuery({
    queryKey: documentKeys.shared(),
    queryFn: () => documentService.getSharedDocuments(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook for bulk operations
export const useBulkUpdateDocuments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      documentIds, 
      operation, 
      data 
    }: { 
      documentIds: string[]; 
      operation: 'status' | 'assign' | 'delete';
      data: any;
    }) => {
      switch (operation) {
        case 'status':
          return documentService.bulkUpdateStatus(documentIds, data.status);
        case 'assign':
          return documentService.bulkAssign(documentIds, data.userIds);
        case 'delete':
          return documentService.bulkDelete(documentIds);
        default:
          throw new Error('Invalid operation');
      }
    },
    onSuccess: (response, { operation, documentIds }) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: documentKeys.statistics() });
      
      // Invalidate specific documents if not deleted
      if (operation !== 'delete') {
        documentIds.forEach(id => {
          queryClient.invalidateQueries({ queryKey: documentKeys.detail(id) });
        });
      }
      
      toast.success(`Đã ${operation === 'delete' ? 'xóa' : 'cập nhật'} ${documentIds.length} tài liệu`);
    },
    onError: (error: any) => {
      toast.error('Có lỗi xảy ra trong thao tác hàng loạt: ' + error.message);
    },
  });
};

// Hook for document comments
export const useDocumentComments = (documentId: string) => {
  return useQuery({
    queryKey: [...documentKeys.detail(documentId), 'comments'],
    queryFn: () => documentService.getComments(documentId),
    enabled: !!documentId,
  });
};

// Hook for adding comment
export const useAddDocumentComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      id, 
      content, 
      parentId 
    }: { 
      id: string; 
      content: string; 
      parentId?: string; 
    }) => documentService.addComment(id, content, parentId),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ 
        queryKey: [...documentKeys.detail(id), 'comments'] 
      });
      toast.success('Bình luận đã được thêm');
    },
    onError: (error: any) => {
      toast.error('Có lỗi xảy ra khi thêm bình luận: ' + error.message);
    },
  });
};

// Hook for Google Drive sync
export const useGoogleDriveSync = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => documentService.syncWithGoogleDrive(),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      toast.success(`Đã đồng bộ ${response.data.synced_count} tài liệu từ Google Drive`);
    },
    onError: (error: any) => {
      toast.error('Có lỗi xảy ra khi đồng bộ Google Drive: ' + error.message);
    },
  });
}; 
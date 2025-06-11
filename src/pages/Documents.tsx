import { useState, useEffect } from "react";
import { Plus, Search, Filter, Eye, Edit, Trash2, Brain, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { Document } from "@/types";
import { localStorageService } from "@/services/localStorage";
import { DocumentList } from "@/components/DocumentList";
import ReactSelect from 'react-select';
import { DocumentForm } from "@/components/DocumentForm";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const Documents = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editDoc, setEditDoc] = useState<Document | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newAttachments, setNewAttachments] = useState<File[]>([]);

  const documentTypes = [
    { value: "công văn", label: "Công văn" },
    { value: "kế hoạch", label: "Kế hoạch" },
    { value: "quyết định", label: "Quyết định" },
    { value: "biên bản", label: "Biên bản" },
    { value: "tờ trình", label: "Tờ trình" },
    { value: "nghị định", label: "Nghị định" },
    { value: "khác", label: "Khác" }
  ] as const;

  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("");
  const [filterIssuer, setFilterIssuer] = useState<string>("");
  const [filterDateFrom, setFilterDateTo] = useState<string>("");
  const [filterDateTo, setFilterDateFrom] = useState<string>("");
  const [filterTags, setFilterTags] = useState<string>("");

  const [addDocument, setAddDocument] = useState<Omit<Document, 'id' | 'created_at' | 'updated_at'>>({
    title: '',
    document_code: '',
    issue_date: '',
    expiration_date: '',
    issuer: '',
    abstract: '',
    file_url: '',
    file_name: '',
    file_size: 0,
    file_type: '',
    document_type: 'công văn',
    tags: [],
    status: 'pending',
    priority: 'low',
    google_drive_id: '',
    google_drive_url: '',
  });

  const [tagInputValue, setTagInputValue] = useState("");
  const [isComposing, setIsComposing] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9; // Số card mỗi trang

  // Fetch documents using React Query
  const { data: documentsData = [], isLoading, error: queryError } = useQuery({
    queryKey: ['documents'],
    queryFn: () => localStorageService.getDocuments(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Create document mutation
  const createDocumentMutation = useMutation({
    mutationFn: (documentData: Omit<Document, 'id' | 'created_at' | 'updated_at'>) => 
      localStorageService.createDocument(documentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setIsAddDialogOpen(false);
      toast.success('Văn bản đã được tạo thành công');
    },
    onError: (error) => {
      toast.error('Không thể tạo văn bản: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
    }
  });

  // Update document mutation
  const updateDocumentMutation = useMutation({
    mutationFn: (updatedDocument: Document) => 
      localStorageService.updateDocument(updatedDocument.id, updatedDocument),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setIsEditDialogOpen(false);
      toast.success('Văn bản đã được cập nhật thành công');
    },
    onError: (error) => {
      toast.error('Không thể cập nhật văn bản: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
    }
  });

  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: (id: string) => localStorageService.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Văn bản đã được xóa thành công');
    },
    onError: (error) => {
      toast.error('Không thể xóa văn bản: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
    }
  });

  const handleCreateDocument = async (documentData: Omit<Document, 'id' | 'created_at' | 'updated_at'>) => {
    createDocumentMutation.mutate(documentData);
  };

  const handleDeleteDocument = async (id: string) => {
    deleteDocumentMutation.mutate(id);
  };

  const handleUpdateDocument = async (updatedDocument: Document) => {
    updateDocumentMutation.mutate(updatedDocument);
  };

  const handleAddDocument = async () => {
    try {
      const newDoc = await localStorageService.createDocument({
        ...addDocument,
      });
      setDocuments([...documents, newDoc]);
      setIsAddDialogOpen(false);
      setAddDocument({
        title: '',
        document_code: '',
        issue_date: '',
        issuer: '',
        abstract: '',
        file_url: '',
        file_name: '',
        file_size: 0,
        file_type: '',
        document_type: 'công văn',
        tags: [],
        status: 'pending',
        priority: 'low',
        google_drive_id: '',
        google_drive_url: '',
      });
    } catch (error) {
      console.error("Error adding document:", error);
    }
  };

  const handleEditOpen = (doc: Document) => {
    setEditDoc({ ...doc });
    setIsEditDialogOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewAttachments(Array.from(e.target.files));
    }
  };

  const handleEditSave = async (updatedDoc: Document) => {
    try {
      const updated = await localStorageService.updateDocument(updatedDoc.id, updatedDoc);
      setDocuments(documents.map(doc => doc.id === updated.id ? updated : doc));
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  const handleAISummary = async () => {
    if (files.length === 0) return;
    setAiLoading(true);
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      const response = await fetch('/api/documents-upload', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data?.documents?.length > 0 && data.documents[0].ai_summary) {
        setAiSummary(data.documents[0].ai_summary);
      } else {
        setAiSummary("Không thể sinh tóm tắt tự động.");
      }
    } catch (err) {
      setAiSummary("Có lỗi khi sinh tóm tắt AI.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyFilter = () => {
    setIsFilterDialogOpen(false);
  };

  const handleClearFilter = () => {
    setFilterType("");
    setFilterIssuer("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setFilterTags("");
    setIsFilterDialogOpen(false);
  };

  if (isLoading) {
    return <div className="p-4">Loading documents...</div>;
  }

  if (queryError) {
    return <div className="p-4 text-red-500">Error: {queryError instanceof Error ? queryError.message : 'An error occurred'}</div>;
  }

  const filteredDocuments = documentsData.filter(doc => {
    const matchType = !filterType || filterType === "__all__" || doc.document_type === filterType;
    const matchIssuer = !filterIssuer || doc.title.toLowerCase().includes(filterIssuer.toLowerCase());
    const matchDateFrom = !filterDateFrom || doc.created_at >= filterDateFrom;
    const matchDateTo = !filterDateTo || doc.created_at <= filterDateTo;
    const matchTags = !filterTags || filterTags.split(",").every(tag => doc.tags.map(t => t.toLowerCase()).includes(tag.trim().toLowerCase()));
    const matchSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || doc.abstract?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchIssuer && matchDateFrom && matchDateTo && matchTags && matchSearch;
  });

  // Sắp xếp văn bản mới nhất lên đầu
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    const dateA = new Date(a.issue_date || a.created_at || 0);
    const dateB = new Date(b.issue_date || b.created_at || 0);
    return dateB.getTime() - dateA.getTime();
  });

  // Phân trang
  const totalPages = Math.ceil(sortedDocuments.length / pageSize);
  const paginatedDocuments = sortedDocuments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Dialog sửa nhanh */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa văn bản</DialogTitle>
            <DialogDescription>Cập nhật thông tin văn bản</DialogDescription>
          </DialogHeader>
          {editDoc && (
            <DocumentForm
              initialData={editDoc}
              onSubmit={data => handleUpdateDocument({ ...editDoc, ...data })}
              onCancel={() => setIsEditDialogOpen(false)}
              mode="edit"
              documentsList={documentsData}
            />
          )}
        </DialogContent>
      </Dialog>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Văn bản</h1>
          <p className="text-muted-foreground">
            Quản lý và tìm kiếm các văn bản hành chính
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Thêm văn bản mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Thêm văn bản mới</DialogTitle>
              <DialogDescription>
                Nhập thông tin chi tiết của văn bản
              </DialogDescription>
            </DialogHeader>
            <DocumentForm
              initialData={{}}
              onSubmit={handleCreateDocument}
              onCancel={() => setIsAddDialogOpen(false)}
              mode="add"
              documentsList={documentsData}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo số văn bản, nội dung..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2" onClick={() => setIsFilterDialogOpen(true)}>
          <Filter className="h-4 w-4" />
          Bộ lọc
        </Button>
      </div>

      {/* Documents Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {paginatedDocuments.map((doc, index) => (
          <Card key={doc.id} className="animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold mb-1">{doc.title || "Chưa có tên"}</CardTitle>
              <div className="flex flex-wrap items-center gap-1 text-xs mb-1">
                {doc.document_code && (
                  <>
                    <Badge className="font-semibold bg-blue-100 text-blue-800 border-blue-200">{doc.document_code}</Badge>
                    <span className="mx-1 text-gray-400">·</span>
                  </>
                )}
                <Badge className="font-semibold bg-yellow-100 text-yellow-800 border-yellow-200">
                  {doc.issue_date ? new Date(doc.issue_date).toLocaleDateString('vi-VN') : "Chưa có ngày"}
                </Badge>
                <span className="mx-1 text-gray-400">·</span>
                <Badge className="font-semibold bg-purple-100 text-purple-800 border-purple-200">{doc.issuer || "Chưa rõ CQBH"}</Badge>
              </div>
              {doc.abstract && (
                <p
                  className="text-xs text-gray-500 mb-1 clamp-2"
                  title={doc.abstract}
                >
                  {doc.abstract}
                </p>
              )}
              {doc.tags && doc.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1">
                  {doc.tags.map((tag, tagIndex) => (
                    <Badge key={tagIndex} variant="outline" className="text-xs px-2 py-0.5">{tag}</Badge>
                  ))}
                </div>
              )}
              {doc.file_name && (
                <div className="flex items-center gap-1 text-xs mt-1">
                  <FileText className="h-3 w-3" />
                  {doc.file_url ? (
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {doc.file_name}
                    </a>
                  ) : (
                    <span>{doc.file_name}</span>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex justify-between border-t pt-2 mt-2">
                <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={() => navigate(`/documents/${doc.id}`)}>
                  <Eye className="h-3 w-3" />
                  Xem
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={() => handleEditOpen(doc)}>
                  <Edit className="h-3 w-3" />
                  Sửa
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-1 text-destructive" onClick={() => handleDeleteDocument(doc.id)}>
                  <Trash2 className="h-3 w-3" />
                  Xóa
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {paginatedDocuments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">Không tìm thấy văn bản</h3>
          <p className="text-muted-foreground">Thử thay đổi từ khóa tìm kiếm hoặc thêm văn bản mới</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Trang trước</Button>
          <span className="px-2 py-1 text-sm">Trang {currentPage} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Trang sau</Button>
        </div>
      )}

      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bộ lọc văn bản</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Loại văn bản</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại văn bản" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Tất cả</SelectItem>
                  {documentTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Cơ quan ban hành</Label>
              <Input value={filterIssuer} onChange={e => setFilterIssuer(e.target.value)} placeholder="Nhập tên cơ quan..." />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Từ ngày</Label>
                <Input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} />
              </div>
              <div>
                <Label>Đến ngày</Label>
                <Input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Từ khóa (cách nhau bởi dấu phẩy)</Label>
              <Input value={filterTags} onChange={e => setFilterTags(e.target.value)} placeholder="VD: kinh tế, ngân sách" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={handleClearFilter}>Xóa lọc</Button>
            <Button onClick={handleApplyFilter}>Áp dụng</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Documents;

/* Thêm CSS ở cuối file hoặc vào file global */
/*
.clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
*/

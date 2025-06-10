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
import { supabaseService, Document } from "@/services/supabaseService";
import { DocumentList } from "@/components/DocumentList";

const Documents = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const navigate = useNavigate();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editDoc, setEditDoc] = useState<Document | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newAttachments, setNewAttachments] = useState<File[]>([]);

  const documentTypes = [
    { value: "công văn", label: "Công văn" },
    { value: "báo cáo", label: "Báo cáo" },
    { value: "quyết định", label: "Quyết định" },
    { value: "thông báo", label: "Thông báo" },
    { value: "uploaded", label: "Đã tải lên" },
    { value: "other", label: "Khác" }
  ] as const;

  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("");
  const [filterIssuer, setFilterIssuer] = useState<string>("");
  const [filterDateFrom, setFilterDateTo] = useState<string>("");
  const [filterDateTo, setFilterDateFrom] = useState<string>("");
  const [filterTags, setFilterTags] = useState<string>("");

  const [addDocument, setAddDocument] = useState<Omit<Document, 'id' | 'created_at' | 'updated_at'>>({
    title: '',
    description: '',
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
    google_drive_id: null,
    google_drive_url: null,
    ai_summary: null,
    ai_keywords: []
  });

  useEffect(() => {
    async function loadDocuments() {
      try {
        const data = await supabaseService.getDocuments();
        setDocuments(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load documents');
      } finally {
        setLoading(false);
      }
    }

    loadDocuments();
  }, []);

  const handleAddDocument = async () => {
    try {
      const newDoc = await supabaseService.createDocument({
        ...addDocument,
        google_drive_id: null,
        google_drive_url: null
      });
      setDocuments([...documents, newDoc]);
      setIsAddDialogOpen(false);
      setAddDocument({
        title: '',
        description: '',
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
        google_drive_id: null,
        google_drive_url: null,
        ai_summary: null,
        ai_keywords: []
      });
    } catch (error) {
      console.error('Error adding document:', error);
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
      const { data, error } = await supabaseService.updateDocument(updatedDoc.id, updatedDoc);
      if (error) {
        setError(error.message);
        return;
      }
      setDocuments(prev => prev.map(doc => doc.id === updatedDoc.id ? data : doc));
      setIsEditDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update document');
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      const { error } = await supabaseService.deleteDocument(id);
      if (error) {
        setError(error.message);
        return;
      }
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document');
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

  const filteredDocuments = documents.filter(doc => {
    const matchType = !filterType || filterType === "__all__" || doc.document_type === filterType;
    const matchIssuer = !filterIssuer || doc.title.toLowerCase().includes(filterIssuer.toLowerCase());
    const matchDateFrom = !filterDateFrom || doc.created_at >= filterDateFrom;
    const matchDateTo = !filterDateTo || doc.created_at <= filterDateTo;
    const matchTags = !filterTags || filterTags.split(",").every(tag => doc.tags.map(t => t.toLowerCase()).includes(tag.trim().toLowerCase()));
    const matchSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || doc.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchIssuer && matchDateFrom && matchDateTo && matchTags && matchSearch;
  });

  if (loading) {
    return <div className="p-4">Loading documents...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

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
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Tên văn bản</Label>
                <Input id="edit-title" value={editDoc.title} onChange={e => setEditDoc({ ...editDoc, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-documentType">Loại văn bản</Label>
                  <Select value={editDoc.document_type} onValueChange={val => setEditDoc({ ...editDoc, document_type: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại văn bản" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-aiSummary">Tóm tắt nội dung (AI)</Label>
                <Textarea id="edit-aiSummary" value={editDoc.ai_summary || ""} onChange={e => setEditDoc({ ...editDoc, ai_summary: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tags">Từ khóa (cách nhau bởi dấu phẩy)</Label>
                <Input id="edit-tags" value={editDoc.tags.join(", ")} onChange={e => setEditDoc({ ...editDoc, tags: e.target.value.split(",").map(t => t.trim()) })} />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={() => handleEditSave(editDoc)}>
              Lưu
            </Button>
          </div>
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
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tên văn bản</Label>
                <Input id="title" value={addDocument.title} onChange={e => setAddDocument({ ...addDocument, title: e.target.value })} placeholder="VD: Quyết định về việc phê duyệt..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="documentCode">Số/Ký hiệu văn bản</Label>
                  <Input id="documentCode" value={addDocument.document_code} onChange={e => setAddDocument({ ...addDocument, document_code: e.target.value })} placeholder="VD: 123/QĐ-UBND" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documentType">Loại văn bản</Label>
                  <Select value={addDocument.document_type} onValueChange={val => setAddDocument({ ...addDocument, document_type: val as Document['document_type'] })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại văn bản" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="issueDate">Ngày ban hành</Label>
                  <Input id="issueDate" type="date" value={addDocument.issue_date} onChange={e => setAddDocument({ ...addDocument, issue_date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issuer">Cơ quan ban hành</Label>
                  <Input id="issuer" value={addDocument.issuer} onChange={e => setAddDocument({ ...addDocument, issuer: e.target.value })} placeholder="VD: UBND tỉnh" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="abstract">Trích yếu nội dung</Label>
                <Textarea id="abstract" value={addDocument.abstract} onChange={e => setAddDocument({ ...addDocument, abstract: e.target.value })} placeholder="Nhập trích yếu nội dung văn bản..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Nội dung chi tiết</Label>
                <Textarea id="description" value={addDocument.description} onChange={e => setAddDocument({ ...addDocument, description: e.target.value })} placeholder="Nhập nội dung chi tiết văn bản..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">Tệp đính kèm</Label>
                <Input id="file" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" multiple onChange={e => setFiles(e.target.files ? Array.from(e.target.files) : [])} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aiSummary">Tóm tắt nội dung (AI)</Label>
                <Textarea id="aiSummary" placeholder="Tóm tắt sẽ được sinh tự động từ AI hoặc nhập tay..." rows={3} value={addDocument.ai_summary} onChange={e => setAddDocument({ ...addDocument, ai_summary: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Từ khóa (cách nhau bởi dấu phẩy)</Label>
                <Input id="tags" value={addDocument.tags.join(", ")} onChange={e => setAddDocument({ ...addDocument, tags: e.target.value.split(",").map(t => t.trim()) })} placeholder="VD: kinh tế, kế hoạch, 2024" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleAddDocument}>
                Lưu văn bản
              </Button>
            </div>
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
        {filteredDocuments.map((doc, index) => (
          <Card key={doc.id} className="animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base">{doc.title || "Chưa có tên"}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {doc.document_type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{doc.created_at}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Số/Ký hiệu:</p>
                <p className="text-sm">{doc.document_code || "Chưa có"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cơ quan ban hành:</p>
                <p className="text-sm">{doc.issuer || "Chưa có"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Trích yếu:</p>
                <p className="text-sm line-clamp-2">{doc.abstract || "Chưa có"}</p>
              </div>

              {doc.tags && (
                <div className="flex flex-wrap gap-1">
                  {doc.tags.map((tag, tagIndex) => (
                    <Badge key={tagIndex} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {doc.ai_summary && (
                <div className="bg-accent/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Brain className="h-3 w-3 text-primary" />
                    <span className="text-xs font-medium text-primary">Tóm tắt AI</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{doc.ai_summary}</p>
                </div>
              )}

              {/* Hiển thị file đính kèm ở cuối cùng */}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tệp đính kèm:</p>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <a 
                    href={doc.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {doc.file_name}
                  </a>
                </div>
              </div>

              <div className="flex justify-between pt-2 border-t">
                <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={() => navigate(`/documents/${doc.id}`)}>
                  <Eye className="h-3 w-3" />
                  Xem
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={() => handleEditOpen(doc)}>
                  <Edit className="h-3 w-3" />
                  Sửa
                </Button>
                {!doc.ai_summary && (
                  <Button variant="ghost" size="sm" className="flex items-center gap-1 text-primary">
                    <Brain className="h-3 w-3" />
                    Tóm tắt AI
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="flex items-center gap-1 text-destructive" onClick={() => handleDeleteDocument(doc.id)}>
                  <Trash2 className="h-3 w-3" />
                  Xóa
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">Không tìm thấy văn bản</h3>
          <p className="text-muted-foreground">Thử thay đổi từ khóa tìm kiếm hoặc thêm văn bản mới</p>
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

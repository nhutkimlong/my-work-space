import { ArrowLeft, Download, Edit, Trash2, Brain, Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNavigate, useParams } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { supabaseService, Document } from "@/services/supabaseService";

const DocumentDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
  const [editData, setEditData] = useState<Document | null>(null);
  const [newAttachments, setNewAttachments] = useState<File[]>([]);

  useEffect(() => {
    async function loadDocument() {
      if (!id) return;
      try {
        const data = await supabaseService.getDocumentById(id);
        setDocument(data);
        setEditData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load document');
      } finally {
        setLoading(false);
      }
    }

    loadDocument();
  }, [id]);

  const handleSaveEdit = async () => {
    if (!editData) return;
    try {
      const { data, error } = await supabaseService.updateDocument(editData.id, editData);
      if (error) {
        setError(error.message);
        return;
      }
      setDocument(data);
      setIsEditOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update document');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewAttachments(Array.from(e.target.files));
    }
  };

  const handleDelete = async () => {
    if (!document) return;
    try {
      const { error } = await supabaseService.deleteDocument(document.id);
      if (error) {
        setError(error.message);
        return;
      }
      setIsDeleteConfirm(false);
      navigate("/documents");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document');
    }
  };

  if (loading) {
    return <div className="p-4">Loading document...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (!document) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Không tìm thấy văn bản</h2>
        <Button onClick={() => navigate(-1)}>Quay lại</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Dialog chỉnh sửa */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa văn bản</DialogTitle>
            <DialogDescription>Cập nhật thông tin văn bản</DialogDescription>
          </DialogHeader>
          {editData && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Tên văn bản</Label>
                <Input id="edit-title" value={editData.title} onChange={e => setEditData({ ...editData, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Mô tả</Label>
                <Textarea id="edit-description" value={editData.description || ""} onChange={e => setEditData({ ...editData, description: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-documentType">Loại văn bản</Label>
                <select
                  id="edit-documentType"
                  className="w-full border rounded px-2 py-1"
                  value={editData.document_type}
                  onChange={e => setEditData({ ...editData, document_type: e.target.value as Document['document_type'] })}
                >
                  <option value="công văn">Công văn</option>
                  <option value="báo cáo">Báo cáo</option>
                  <option value="quyết định">Quyết định</option>
                  <option value="thông báo">Thông báo</option>
                  <option value="uploaded">Đã tải lên</option>
                  <option value="other">Khác</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-aiSummary">Tóm tắt nội dung (AI)</Label>
                <Textarea id="edit-aiSummary" value={editData.ai_summary || ""} onChange={e => setEditData({ ...editData, ai_summary: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tags">Từ khóa (cách nhau bởi dấu phẩy)</Label>
                <Input id="edit-tags" value={editData.tags.join(", ")} onChange={e => setEditData({ ...editData, tags: e.target.value.split(",").map(t => t.trim()) })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-documentCode">Số/Ký hiệu văn bản</Label>
                <Input id="edit-documentCode" value={editData.document_code || ""} onChange={e => setEditData({ ...editData, document_code: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-issueDate">Ngày ban hành</Label>
                <Input id="edit-issueDate" type="date" value={editData.issue_date || ""} onChange={e => setEditData({ ...editData, issue_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-issuer">Cơ quan ban hành</Label>
                <Input id="edit-issuer" value={editData.issuer || ""} onChange={e => setEditData({ ...editData, issuer: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-abstract">Trích yếu nội dung</Label>
                <Textarea id="edit-abstract" value={editData.abstract || ""} onChange={e => setEditData({ ...editData, abstract: e.target.value })} />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Hủy</Button>
            <Button onClick={handleSaveEdit}>Lưu</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận xóa */}
      <Dialog open={isDeleteConfirm} onOpenChange={setIsDeleteConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <p>Bạn có chắc chắn muốn xóa văn bản này?</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteConfirm(false)}>Hủy</Button>
            <Button variant="destructive" onClick={handleDelete}>Xóa</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {document.title}
            </h1>
            <p className="text-muted-foreground">Chi tiết văn bản</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Xem trước
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Tải về
          </Button>
          <Button variant="outline" className="flex items-center gap-2" onClick={() => { setEditData(document); setIsEditOpen(true); }}>
            <Edit className="h-4 w-4" />
            Chỉnh sửa
          </Button>
          <Button variant="destructive" className="flex items-center gap-2" onClick={() => setIsDeleteConfirm(true)}>
            <Trash2 className="h-4 w-4" />
            Xóa
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Document Info */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin văn bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Số/Ký hiệu</p>
                  <p className="font-medium">{document.document_code || "Chưa có"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Loại văn bản</p>
                  <Badge variant="secondary">{document.document_type}</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ngày ban hành</p>
                  <p>{document.issue_date ? new Date(document.issue_date).toLocaleDateString('vi-VN') : "Chưa có"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cơ quan ban hành</p>
                  <p>{document.issuer || "Chưa có"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ngày tạo</p>
                  <p>{new Date(document.created_at).toLocaleDateString('vi-VN')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cập nhật lần cuối</p>
                  <p>{new Date(document.updated_at).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Trích yếu nội dung</p>
                <p className="text-sm leading-relaxed">{document.abstract || "Chưa có"}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Mô tả</p>
                <p className="text-sm leading-relaxed">{document.description || "Chưa có"}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Từ khóa</p>
                <div className="flex flex-wrap gap-2">
                  {document.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>

              {/* File Info */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Tệp đính kèm:</p>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <a 
                    href={document.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {document.file_name}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Summary */}
          {document.ai_summary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Tóm tắt bằng AI
                </CardTitle>
                <CardDescription>
                  Tóm tắt tự động được tạo bởi trí tuệ nhân tạo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-accent/50 p-4 rounded-lg">
                  <p className="text-sm leading-relaxed">{document.ai_summary}</p>
                </div>
                <div className="flex justify-end mt-4">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Brain className="h-3 w-3" />
                    Tạo lại tóm tắt
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!document.ai_summary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Tóm tắt bằng AI
                </CardTitle>
                <CardDescription>
                  Chưa có tóm tắt tự động cho văn bản này
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Tạo tóm tắt tự động để nhanh chóng nắm bắt nội dung chính của văn bản.
                </p>
                <Button className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Tạo tóm tắt AI
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* File Info */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin tệp</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tên tệp</p>
                <p className="text-sm">{document.file_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Kích thước</p>
                <p className="text-sm">{(document.file_size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Loại tệp</p>
                <p className="text-sm">{document.file_type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Được tạo</p>
                <p className="text-sm">{new Date(document.created_at).toLocaleString('vi-VN')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cập nhật lần cuối</p>
                <p className="text-sm">{new Date(document.updated_at).toLocaleString('vi-VN')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Related Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Công việc liên quan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-4">
                Chưa có công việc nào liên quan đến văn bản này
              </p>
            </CardContent>
          </Card>

          {/* Related Events */}
          <Card>
            <CardHeader>
              <CardTitle>Sự kiện liên quan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-4">
                Chưa có sự kiện nào liên quan đến văn bản này
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetail;

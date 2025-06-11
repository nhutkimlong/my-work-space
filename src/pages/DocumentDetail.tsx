import { ArrowLeft, Download, Edit, Trash2, Brain, Eye, FileText, Share2, Copy, Link2 } from "lucide-react";
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
import { Document } from "@/types";
import { localStorageService } from "@/services/localStorage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { DocumentForm } from "@/components/DocumentForm";

const DocumentDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [editData, setEditData] = useState<Document | null>(null);
  const [newAttachments, setNewAttachments] = useState<File[]>([]);
  const [shareLink, setShareLink] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);

  const documentTypes = [
    { value: "công văn", label: "Công văn" },
    { value: "kế hoạch", label: "Kế hoạch" },
    { value: "quyết định", label: "Quyết định" },
    { value: "biên bản", label: "Biên bản" },
    { value: "tờ trình", label: "Tờ trình" },
    { value: "nghị định", label: "Nghị định" },
    { value: "khác", label: "Khác" }
  ] as const;

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const data = await localStorageService.getDocuments();
        setDocuments(data);
        const doc = data.find(d => d.id === id);
        if (doc) {
          setDocument(doc);
          setEditData(doc);
          setShareLink(`${window.location.origin}/documents/${doc.id}`);
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load document');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  const handleUpdateDocument = async (updatedDoc: Document) => {
    try {
      const updated = await localStorageService.updateDocument(updatedDoc.id, updatedDoc);
      setDocument(updated);
      setIsEditOpen(false);
      toast.success("Cập nhật văn bản thành công");
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update document');
      toast.error("Cập nhật văn bản thất bại");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewAttachments(Array.from(e.target.files));
    }
  };

  const handleDeleteDocument = async () => {
    if (!document) return;
    try {
      await localStorageService.deleteDocument(document.id);
      setIsDeleteConfirm(false);
      toast.success("Xóa văn bản thành công");
      navigate('/documents');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete document');
      toast.error("Xóa văn bản thất bại");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success("Đã sao chép liên kết");
  };

  const handleDownload = () => {
    if (document?.file_url) {
      window.open(document.file_url, '_blank');
    } else {
      toast.error("Không có tệp để tải xuống");
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
            <DocumentForm
              initialData={editData}
              onSubmit={data => handleUpdateDocument({ ...editData, ...data })}
              onCancel={() => setIsEditOpen(false)}
              mode="edit"
              documentsList={documents}
            />
          )}
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
            <Button variant="destructive" onClick={handleDeleteDocument}>Xóa</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog chia sẻ */}
      <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chia sẻ văn bản</DialogTitle>
            <DialogDescription>
              Sao chép liên kết để chia sẻ văn bản này
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Input value={shareLink} readOnly />
            <Button variant="outline" size="icon" onClick={handleCopyLink}>
              <Copy className="h-4 w-4" />
            </Button>
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
          <Button variant="outline" className="flex items-center gap-2" onClick={() => setIsShareOpen(true)}>
            <Share2 className="h-4 w-4" />
            Chia sẻ
          </Button>
          <Button variant="outline" className="flex items-center gap-2" onClick={handleDownload}>
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
            </CardContent>
          </Card>

          {/* Nội dung tóm tắt (trước đây là AI Summary) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Nội dung tóm tắt
              </CardTitle>
              <CardDescription>
                Tóm tắt do người dùng nhập khi thêm hoặc chỉnh sửa văn bản. Bạn có thể sử dụng AI để sinh tóm tắt tự động từ file đính kèm trong tương lai.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {document.abstract && document.abstract.trim() ? (
                <div className="bg-accent/50 p-4 rounded-lg">
                  <p className="text-sm leading-relaxed">{document.abstract}</p>
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">
                  Chưa có tóm tắt cho văn bản này.
                </div>
              )}
              <div className="flex justify-end mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => toast.info('Tính năng sắp ra mắt: Sử dụng AI để tóm tắt nội dung từ file đính kèm!')}
                >
                  <Brain className="h-4 w-4" />
                  Tóm tắt bằng AI
                </Button>
              </div>
            </CardContent>
          </Card>
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
                <p className="text-sm font-medium text-muted-foreground mb-2">Từ khóa</p>
                <div className="flex flex-wrap gap-2">
                  {document.tags && document.tags.length > 0
                    ? document.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">{tag}</Badge>
                      ))
                    : <span className="text-muted-foreground text-xs">Không có từ khóa</span>
                  }
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Tệp đính kèm</p>
                {document.file_name && document.file_url ? (
                  <div className="flex items-center gap-1 text-xs mt-1">
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
                ) : (
                  <span className="text-muted-foreground text-xs">Không có tệp đính kèm</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Related Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Văn bản liên quan</CardTitle>
            </CardHeader>
            <CardContent>
              {document.related_documents && document.related_documents.length > 0 ? (
                <div className="space-y-2">
                  {document.related_documents.map((docId) => {
                    const relatedDoc = documents.find(d => d.id === docId);
                    return relatedDoc ? (
                      <a
                        key={docId}
                        href={`/documents/${relatedDoc.id}`}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent hover:underline cursor-pointer transition"
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{relatedDoc.title}</p>
                          <p className="text-xs text-muted-foreground">{relatedDoc.document_code}</p>
                        </div>
                      </a>
                    ) : null;
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Chưa có văn bản liên quan
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetail;

import { useState } from "react";
import { ArrowLeft, Edit, Trash2, Brain, Users, Calendar, MapPin, Clock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useParams } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getLocalData, setLocalData } from "@/lib/localStorage";

const EventDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Get event from localStorage
  const events = getLocalData("events", []);
  const event = events.find(e => e.id === Number(id));

  const [editEvent, setEditEvent] = useState(event);

  const getStatusText = (status: string) => {
    switch (status) {
      case "upcoming": return "Sắp diễn ra";
      case "completed": return "Đã hoàn thành";
      case "cancelled": return "Đã hủy";
      default: return "Không xác định";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming": return "default";
      case "completed": return "secondary";
      case "cancelled": return "destructive";
      default: return "secondary";
    }
  };

  const handleEditEvent = () => {
    const updatedEvents = events.map(e => e.id === editEvent.id ? editEvent : e);
    setLocalData("events", updatedEvents);
    setIsEditDialogOpen(false);
  };

  const handleDeleteEvent = () => {
    const updatedEvents = events.filter(e => e.id !== event.id);
    setLocalData("events", updatedEvents);
    navigate("/events");
  };

  if (!event) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">Không tìm thấy sự kiện</h3>
        <p className="text-muted-foreground">Sự kiện này có thể đã bị xóa hoặc không tồn tại</p>
        <Button className="mt-4" onClick={() => navigate("/events")}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const linkedDocs = Array.isArray(event.linkedDocuments) ? event.linkedDocuments : [];

  return (
    <div className="space-y-6 animate-fade-in">
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
              {event.title}
            </h1>
            <p className="text-muted-foreground">Chi tiết sự kiện</p>
          </div>
        </div>
        
        <div className="flex items-center gap-8 border-b pb-2 mb-4">
          <Button variant="ghost" className="flex items-center gap-2 font-medium">
            <Eye className="h-4 w-4" />
            Xem
          </Button>
          <Button variant="ghost" className="flex items-center gap-2 font-medium" onClick={() => { setEditEvent(event); setIsEditDialogOpen(true); }}>
            <Edit className="h-4 w-4" />
            Sửa
          </Button>
          <Button variant="ghost" className="flex items-center gap-2 text-primary font-medium">
            <Brain className="h-4 w-4 text-primary" />
            Tóm tắt AI
          </Button>
          <Button variant="ghost" className="flex items-center gap-2 text-destructive font-medium" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4" />
            Xóa
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Info */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin sự kiện</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Trạng thái</p>
                  <Badge variant={getStatusColor(event.status)}>{getStatusText(event.status)}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Thời gian</p>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(event.eventDate).toLocaleDateString('vi-VN')}
                    <Clock className="h-4 w-4 ml-2" />
                    {new Date(event.eventDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Địa điểm</p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Mô tả chi tiết</p>
                <p className="text-sm leading-relaxed">{event.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* AI Synthesis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Tổng hợp tài liệu
              </CardTitle>
              <CardDescription>
                Tạo bản tổng hợp tự động từ các tài liệu liên quan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Tự động tổng hợp và phân tích các tài liệu chuẩn bị cho sự kiện, tạo bản tóm tắt các điểm chính cần thảo luận.
              </p>
              <Button className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Tạo tổng hợp AI
              </Button>
            </CardContent>
          </Card>

          {/* Linked Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Tài liệu chuẩn bị ({linkedDocs.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {linkedDocs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{doc.title}</p>
                    <Badge variant="outline" className="text-xs mt-1">{doc.type}</Badge>
                  </div>
                  <Button variant="ghost" size="sm">
                    Xem
                  </Button>
                </div>
              ))}
              
              <Button variant="outline" className="w-full">
                <Users className="h-4 w-4 mr-2" />
                Thêm tài liệu
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Thời gian</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Được tạo</p>
                <p className="text-sm">{new Date(event.createdAt).toLocaleString('vi-VN')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cập nhật lần cuối</p>
                <p className="text-sm">{new Date(event.updatedAt).toLocaleString('vi-VN')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle>Chi tiết thêm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Loại sự kiện</p>
                <p className="text-sm">Cuộc họp nội bộ</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Thời gian dự kiến</p>
                <p className="text-sm">2 giờ</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Số người tham gia</p>
                <p className="text-sm">8-10 người</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                Gửi lời mời tham gia
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Thay đổi thời gian
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Đánh dấu hoàn thành
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa sự kiện</DialogTitle>
          </DialogHeader>
          {editEvent && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Tên sự kiện</Label>
                <Input 
                  id="edit-title" 
                  value={editEvent.title} 
                  onChange={e => setEditEvent({ ...editEvent, title: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Mô tả</Label>
                <Textarea 
                  id="edit-description" 
                  value={editEvent.description} 
                  onChange={e => setEditEvent({ ...editEvent, description: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-eventDate">Thời gian</Label>
                <Input 
                  id="edit-eventDate" 
                  type="datetime-local" 
                  value={editEvent.eventDate} 
                  onChange={e => setEditEvent({ ...editEvent, eventDate: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-location">Địa điểm</Label>
                <Input 
                  id="edit-location" 
                  value={editEvent.location} 
                  onChange={e => setEditEvent({ ...editEvent, location: e.target.value })} 
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleEditEvent}>Lưu</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <p>Bạn có chắc chắn muốn xóa sự kiện này?</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Hủy</Button>
            <Button variant="destructive" onClick={handleDeleteEvent}>Xóa</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventDetail;

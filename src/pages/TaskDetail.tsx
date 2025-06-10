import { useState } from "react";
import { ArrowLeft, Edit, Trash2, Brain, Users, Calendar, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useParams } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getLocalData, setLocalData } from "@/lib/localStorage";

const TaskDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Get task from localStorage
  const tasks = getLocalData("tasks", []);
  const task = tasks.find(t => String(t.id) === String(id));

  const [editTask, setEditTask] = useState(task);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Mới giao": return "secondary";
      case "Đang thực hiện": return "default";
      case "Đã hoàn thành": return "outline";
      case "Tạm hoãn": return "secondary";
      default: return "secondary";
    }
  };

  const handleEditTask = () => {
    const updatedTasks = tasks.map(t => t.id === editTask.id ? editTask : t);
    setLocalData("tasks", updatedTasks);
    setIsEditDialogOpen(false);
  };

  const handleDeleteTask = () => {
    const updatedTasks = tasks.filter(t => t.id !== task.id);
    setLocalData("tasks", updatedTasks);
    navigate("/tasks");
  };

  if (!task) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">Không tìm thấy công việc</h3>
        <p className="text-muted-foreground">Công việc này có thể đã bị xóa hoặc không tồn tại</p>
        <Button className="mt-4" onClick={() => navigate("/tasks")}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const linkedDocs = Array.isArray(task.linkedDocuments) ? task.linkedDocuments : [];

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
              {task.title}
            </h1>
            <p className="text-muted-foreground">Chi tiết công việc</p>
          </div>
        </div>
        
        <div className="flex items-center gap-8 border-b pb-2 mb-4">
          <Button variant="ghost" className="flex items-center gap-2 font-medium">
            <Eye className="h-4 w-4" />
            Xem
          </Button>
          <Button variant="ghost" className="flex items-center gap-2 font-medium" onClick={() => { setEditTask(task); setIsEditDialogOpen(true); }}>
            <Edit className="h-4 w-4" />
            Sửa
          </Button>
          <Button variant="ghost" className="flex items-center gap-2 text-primary font-medium">
            <Brain className="h-4 w-4 text-primary" />
            Gợi ý AI
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
          {/* Task Info */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin công việc</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Trạng thái</p>
                  <Badge variant={getStatusColor(task.status)}>{task.status}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Hạn chót</p>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(task.dueDate).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Mô tả chi tiết</p>
                <p className="text-sm leading-relaxed">{task.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Gợi ý việc tiếp theo
              </CardTitle>
              <CardDescription>
                Đề xuất tự động dựa trên nội dung công việc và tài liệu liên quan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Nhận gợi ý thông minh về các bước tiếp theo cần thực hiện cho công việc này.
              </p>
              <Button className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Tạo gợi ý AI
              </Button>
            </CardContent>
          </Card>

          {/* Linked Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Tài liệu liên quan ({linkedDocs.length})
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
                <p className="text-sm">{new Date(task.createdAt).toLocaleString('vi-VN')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cập nhật lần cuối</p>
                <p className="text-sm">{new Date(task.updatedAt).toLocaleString('vi-VN')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Tiến độ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Hoàn thành</span>
                  <span>25%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
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
                Chuyển sang "Đang thực hiện"
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Đánh dấu hoàn thành
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Gia hạn thời gian
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa công việc</DialogTitle>
          </DialogHeader>
          {editTask && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Tiêu đề công việc</Label>
                <Input 
                  id="edit-title" 
                  value={editTask.title} 
                  onChange={e => setEditTask({ ...editTask, title: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Mô tả chi tiết</Label>
                <Textarea 
                  id="edit-description" 
                  value={editTask.description} 
                  onChange={e => setEditTask({ ...editTask, description: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-dueDate">Hạn chót</Label>
                <Input 
                  id="edit-dueDate" 
                  type="datetime-local" 
                  value={editTask.dueDate} 
                  onChange={e => setEditTask({ ...editTask, dueDate: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Trạng thái</Label>
                <Select 
                  value={editTask.status} 
                  onValueChange={val => setEditTask({ ...editTask, status: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mới giao">Mới giao</SelectItem>
                    <SelectItem value="Đang thực hiện">Đang thực hiện</SelectItem>
                    <SelectItem value="Đã hoàn thành">Đã hoàn thành</SelectItem>
                    <SelectItem value="Tạm hoãn">Tạm hoãn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleEditTask}>Lưu</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <p>Bạn có chắc chắn muốn xóa công việc này?</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Hủy</Button>
            <Button variant="destructive" onClick={handleDeleteTask}>Xóa</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskDetail;

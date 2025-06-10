import { useState, useEffect } from "react";
import { Plus, Search, Filter, Users, Calendar, Brain, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getLocalData, setLocalData } from "@/lib/localStorage";
import { useNavigate } from "react-router-dom";
import { supabaseService, Task } from "@/services/supabaseService";

const Tasks = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addTask, setAddTask] = useState({
    title: "",
    description: "",
    status: "pending" as const,
    priority: "medium" as const,
    due_date: "",
    start_date: new Date().toISOString().split('T')[0],
    tags: [] as string[],
    progress: 0,
    document_id: null,
    completion_date: null
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Lấy danh sách tài liệu đang có hiệu lực
  const allDocuments = getLocalData("documents") || [];
  const today = new Date().toISOString().split('T')[0];
  const validDocuments = Array.isArray(allDocuments) ? allDocuments.filter(doc => !doc.issueDate || doc.issueDate <= today) : [];

  useEffect(() => {
    async function loadTasks() {
      try {
        const data = await supabaseService.getTasks();
        setTasks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, []);

  // Mock data for kanban columns
  const taskColumns = [
    {
      id: "new",
      title: "Mới giao",
      color: "bg-blue-100 dark:bg-blue-900/20 border-blue-200",
      tasks: tasks.filter(t => t.status === "pending"),
    },
    {
      id: "in-progress",
      title: "Đang thực hiện",
      color: "bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200",
      tasks: tasks.filter(t => t.status === "in_progress"),
    },
    {
      id: "completed",
      title: "Đã hoàn thành",
      color: "bg-green-100 dark:bg-green-900/20 border-green-200",
      tasks: tasks.filter(t => t.status === "completed"),
    },
    {
      id: "paused",
      title: "Tạm hoãn",
      color: "bg-gray-100 dark:bg-gray-900/20 border-gray-200",
      tasks: tasks.filter(t => t.status === "on_hold"),
    },
  ];

  const handleAddTask = async () => {
    try {
      const { data, error } = await supabaseService.createTask({
        title: addTask.title,
        description: addTask.description,
        status: addTask.status,
        priority: addTask.priority,
        due_date: addTask.due_date,
        start_date: addTask.start_date,
        tags: addTask.tags,
        progress: addTask.progress,
        document_id: addTask.document_id,
        completion_date: addTask.completion_date
      });

      if (error) {
        setError(error.message);
        return;
      }

      setTasks(prev => [...prev, data]);
      setAddTask({
        title: "",
        description: "",
        status: "pending" as const,
        priority: "medium" as const,
        due_date: "",
        start_date: new Date().toISOString().split('T')[0],
        tags: [],
        progress: 0,
        document_id: null,
        completion_date: null
      });
      setIsAddDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const { error } = await supabaseService.deleteTask(id);
      if (error) {
        setError(error.message);
        return;
      }
      setTasks(prev => prev.filter(task => task.id !== id));
      setIsDeleteDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const handleEditTask = async (updatedTask: Task) => {
    try {
      const { data, error } = await supabaseService.updateTask(updatedTask.id, {
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status,
        due_date: updatedTask.due_date,
        start_date: updatedTask.start_date,
        progress: updatedTask.progress || 0,
        tags: updatedTask.tags || [],
        document_id: updatedTask.document_id,
        completion_date: updatedTask.completion_date
      });

      if (error) {
        setError(error.message);
        return;
      }

      setTasks(prev => prev.map(task => task.id === updatedTask.id ? data : task));
      setIsEditDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const getStatusBadgeVariant = (status: Task['status']) => {
    switch (status) {
      case "pending": return "secondary";
      case "in_progress": return "default";
      case "completed": return "outline";
      case "on_hold": return "secondary";
      default: return "secondary";
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      try {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("file", file);
        });

        const res = await fetch("/api/documents-upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (data?.files?.length > 0) {
          setAddTask(prev => ({
            ...prev,
            attachments: [
              ...(prev.attachments || []),
              ...data.files.map(file => ({
                fileName: file.name,
                fileUrl: file.url,
                fileType: file.type,
                fileId: file.id
              }))
            ]
          }));
        }
      } catch (err) {
        console.error("Error uploading files:", err);
      }
    }
  };

  if (loading) {
    return <div className="p-4">Loading tasks...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Công việc</h1>
          <p className="text-muted-foreground">
            Theo dõi và quản lý các nhiệm vụ công việc
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Thêm công việc mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Thêm công việc mới</DialogTitle>
              <DialogDescription>
                Tạo nhiệm vụ mới và gán tài liệu liên quan
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề công việc</Label>
                <Input
                  id="title"
                  placeholder="Nhập tiêu đề công việc..."
                  value={addTask.title}
                  onChange={(e) => setAddTask(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả chi tiết</Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả chi tiết về công việc cần thực hiện..."
                  rows={3}
                  value={addTask.description}
                  onChange={(e) => setAddTask(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Ngày được giao</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={addTask.start_date}
                    onChange={(e) => setAddTask(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due_date">Hạn chót</Label>
                  <Input
                    id="due_date"
                    type="datetime-local"
                    value={addTask.due_date}
                    onChange={(e) => setAddTask(prev => ({ ...prev, due_date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tài liệu liên quan</Label>
                <div className="max-h-40 overflow-y-auto border rounded p-2 bg-muted/30">
                  {validDocuments.length === 0 && <div className="text-xs text-muted-foreground">Không có tài liệu hiệu lực</div>}
                  {validDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-2 mb-1">
                      <input
                        type="checkbox"
                        checked={addTask.tags.some(t => t === doc.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setAddTask(prev => ({
                              ...prev,
                              tags: [...prev.tags, doc.id]
                            }));
                          } else {
                            setAddTask(prev => ({
                              ...prev,
                              tags: prev.tags.filter(t => t !== doc.id)
                            }));
                          }
                        }}
                      />
                      <span className="text-sm">{doc.documentCode} - {doc.abstract}</span>
                    </div>
                  ))}
                </div>
                {/* Hiển thị tài liệu đã chọn */}
                {addTask.tags.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-muted-foreground mb-1">Đã chọn:</div>
                    <ul className="list-disc pl-5">
                      {addTask.tags.map(tag => (
                        <li key={tag} className="text-xs">{tag}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleAddTask}>
                Tạo công việc
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
            placeholder="Tìm kiếm công việc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Bộ lọc
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {taskColumns.map((column, columnIndex) => (
          <div key={column.id} className="space-y-4">
            <div className={`p-4 rounded-lg border-2 border-dashed ${column.color}`}>
              <h3 className="font-semibold text-center">{column.title}</h3>
              <p className="text-sm text-center text-muted-foreground mt-1">
                {column.tasks.length} công việc
              </p>
            </div>
            
            <div className="space-y-3">
              {column.tasks.map((task, taskIndex) => (
                <Card 
                  key={task.id}
                  className={`${column.color} border cursor-pointer hover:shadow-md transition-shadow`}
                  onClick={() => navigate(`/tasks/${task.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm font-medium leading-tight">
                        {task.title}
                      </CardTitle>
                      {isOverdue(task.due_date) && column.id !== "completed" && (
                        <Badge variant="destructive" className="text-xs">
                          Quá hạn
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {task.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {task.due_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {task.due_date}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Ngày giao: {task.start_date}
                        </div>
                      </div>

                      {task.attachments && task.attachments.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground">Tệp đính kèm:</p>
                          <ul className="list-disc pl-5">
                            {task.attachments.map((file, idx) => (
                              <li key={idx}>
                                <a 
                                  href={file.fileUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-blue-600 hover:underline flex items-center gap-1"
                                >
                                  <FileText className="inline h-4 w-4" />
                                  {file.fileName}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {task.tags && task.tags.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground">Tài liệu liên quan:</p>
                          <ul className="list-disc pl-5">
                            {task.tags.map((tag, idx) => (
                              <li key={tag || idx}>
                                <a href={`/documents/${tag}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline flex items-center gap-1">
                                  <FileText className="inline h-4 w-4" />
                                  {tag}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {column.tasks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">Chưa có công việc nào</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa công việc</DialogTitle>
          </DialogHeader>
          {editTask && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Tiêu đề công việc</Label>
                <Input id="edit-title" value={editTask.title} onChange={e => setEditTask({ ...editTask, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Mô tả chi tiết</Label>
                <Textarea id="edit-description" value={editTask.description} onChange={e => setEditTask({ ...editTask, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-start_date">Ngày được giao</Label>
                  <Input id="edit-start_date" type="date" value={editTask.start_date} onChange={e => setEditTask({ ...editTask, start_date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-due_date">Hạn chót</Label>
                  <Input id="edit-due_date" type="datetime-local" value={editTask.due_date} onChange={e => setEditTask({ ...editTask, due_date: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tài liệu đính kèm</Label>
                <div className="space-y-2">
                  {editTask.attachments?.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">{file.fileName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <a 
                          href={file.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Xem
                        </a>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditTask(prev => ({
                            ...prev,
                            attachments: prev.attachments.filter((_, i) => i !== index)
                          }))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      multiple
                      onChange={async (e) => {
                        if (e.target.files) {
                          const files = Array.from(e.target.files);
                          try {
                            const formData = new FormData();
                            files.forEach((file) => {
                              formData.append("file", file);
                            });
                            const res = await fetch("/api/documents-upload", {
                              method: "POST",
                              body: formData,
                            });
                            const data = await res.json();
                            if (data?.files?.length > 0) {
                              setEditTask(prev => ({
                                ...prev,
                                attachments: [
                                  ...(prev.attachments || []),
                                  ...data.files.map(file => ({
                                    fileName: file.name,
                                    fileUrl: file.url,
                                    fileType: file.type,
                                    fileId: file.id
                                  }))
                                ]
                              }));
                            }
                          } catch (err) {
                            console.error("Error uploading files:", err);
                          }
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      Thêm tệp
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Hủy</Button>
            <Button onClick={() => handleEditTask(editTask!)}>Lưu</Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <p>Bạn có chắc chắn muốn xóa công việc này?</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Hủy</Button>
            <Button variant="destructive" onClick={() => deleteTaskId && handleDeleteTask(deleteTaskId)}>Xóa</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tasks;

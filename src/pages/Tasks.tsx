import { useState, useEffect } from "react";
import { Plus, Search, Filter, Users, Calendar, Brain, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { localStorageService } from "@/services/localStorage";
import { Task, Document, Event } from "@/types";
import { TaskForm } from "@/components/TaskForm";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

const Tasks = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksData, documentsData, eventsData] = await Promise.all([
          localStorageService.getTasks(),
          localStorageService.getDocuments(),
          localStorageService.getEvents()
        ]);
        setTasks(tasksData);
        setDocuments(documentsData);
        setEvents(eventsData);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter events: only upcoming or ongoing (status 'pending' or 'in_progress' and end_date in the future)
  const now = new Date();
  const filteredEvents = events.filter(event =>
    (event.status === 'pending' || event.status === 'in_progress') &&
    new Date(event.end_date) > now
  );

  // Mock data for kanban columns
  const taskColumns = [
    {
      id: "pending",
      title: "Mới giao",
      color: "bg-blue-100 dark:bg-blue-900/20 border-blue-200",
      tasks: tasks.filter(t => t.status === "pending"),
    },
    {
      id: "in_progress",
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
      id: "on_hold",
      title: "Tạm hoãn",
      color: "bg-gray-100 dark:bg-gray-900/20 border-gray-200",
      tasks: tasks.filter(t => t.status === "on_hold"), 
    },
  ];

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newTask = await localStorageService.createTask(taskData);
      setTasks([...tasks, newTask]);
      setIsAddDialogOpen(false);
      toast.success('Công việc đã được tạo thành công');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create task');
      toast.error('Không thể tạo công việc: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await localStorageService.deleteTask(id);
      setTasks(tasks.filter(task => task.id !== id));
      setIsDeleteDialogOpen(false);
      toast.success('Công việc đã được xóa thành công');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete task');
      toast.error('Không thể xóa công việc: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    try {
      const updated = await localStorageService.updateTask(updatedTask.id, updatedTask);
      setTasks(tasks.map(task => task.id === updated.id ? updated : task));
      setIsEditDialogOpen(false);
      toast.success('Công việc đã được cập nhật thành công');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update task');
      toast.error('Không thể cập nhật công việc: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  // Xử lý kéo thả
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const { draggableId, destination, source } = result;
    if (destination.droppableId === source.droppableId) return;
    // Tìm task và cập nhật status
    const task = tasks.find(t => t.id === draggableId);
    if (!task) return;
    const newStatus = destination.droppableId;
    try {
      const updated = await localStorageService.updateTask(task.id, { ...task, status: newStatus });
      setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
      toast.success('Cập nhật trạng thái công việc thành công');
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái công việc');
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
            <TaskForm
              initialData={{}}
              onSubmit={handleCreateTask}
              onCancel={() => setIsAddDialogOpen(false)}
              mode="add"
              documentsList={documents}
              eventsList={filteredEvents}
            />
          </DialogContent>
        </Dialog>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {taskColumns.map((column) => (
            <Droppable droppableId={column.id} key={column.id}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4">
                  <div className={`p-4 rounded-lg border-2 border-dashed ${column.color}`}>
                    <h3 className="font-semibold text-center">{column.title}</h3>
                    <p className="text-sm text-center text-muted-foreground mt-1">
                      {column.tasks.length} công việc
                    </p>
                  </div>
                  <div className="space-y-3">
                    {column.tasks.map((task, i) => (
                      <Draggable draggableId={task.id} index={i} key={task.id}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
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
                                      <span>Hạn: {new Date(task.due_date).toLocaleDateString('vi-VN')}</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    <span>Tiến độ: {task.progress}%</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {column.tasks.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">Chưa có công việc nào</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa công việc</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <TaskForm
              initialData={selectedTask}
              onSubmit={handleUpdateTask}
              onCancel={() => setIsEditDialogOpen(false)}
              mode="edit"
              documentsList={documents}
              eventsList={filteredEvents}
            />
          )}
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
            <Button variant="destructive" onClick={() => selectedTask && handleDeleteTask(selectedTask.id)}>Xóa</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tasks;

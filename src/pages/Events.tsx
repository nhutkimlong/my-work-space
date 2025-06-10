import { useState, useEffect } from "react";
import { Plus, Search, Filter, Calendar, MapPin, Clock, Users, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getLocalData, setLocalData } from "@/lib/localStorage";
import { useNavigate } from "react-router-dom";
import { supabaseService, Event } from "@/services/supabaseService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Events = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteEventId, setDeleteEventId] = useState(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addEvent, setAddEvent] = useState({
    id: crypto.randomUUID(),
    title: "",
    description: "",
    event_type: "meeting" as const,
    start_date: new Date().toISOString(),
    end_date: new Date().toISOString(),
    all_day: false,
    location: "",
    meeting_link: "",
    status: "pending" as const,
    priority: "medium" as const,
    tags: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  const navigate = useNavigate();

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await supabaseService.getEvents();
        setEvents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load events');
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('vi-VN'),
      time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming": return "default";
      case "completed": return "secondary";
      case "cancelled": return "destructive";
      default: return "secondary";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "upcoming": return "Sắp diễn ra";
      case "completed": return "Đã hoàn thành";
      case "cancelled": return "Đã hủy";
      default: return "Không xác định";
    }
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date();
  };

  const handleAddEvent = async () => {
    try {
      const { data, error } = await supabaseService.createEvent({
        title: addEvent.title,
        description: addEvent.description,
        event_type: addEvent.event_type,
        start_date: addEvent.start_date,
        end_date: addEvent.end_date,
        all_day: addEvent.all_day,
        location: addEvent.location,
        meeting_link: addEvent.meeting_link,
        status: addEvent.status,
        priority: addEvent.priority,
        tags: addEvent.tags
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (!data) {
        setError('Failed to create event');
        return;
      }

      setEvents(prev => [...prev, data]);
      setAddEvent({
        id: crypto.randomUUID(),
        title: "",
        description: "",
        event_type: "meeting" as const,
        start_date: new Date().toISOString(),
        end_date: new Date().toISOString(),
        all_day: false,
        location: "",
        meeting_link: "",
        status: "pending" as const,
        priority: "medium" as const,
        tags: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      setIsAddDialogOpen(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      const { error } = await supabaseService.deleteEvent(id);
      if (error) {
        setError(error.message);
        return;
      }
      setEvents(prev => prev.filter(event => event.id !== id));
      setIsDeleteDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
    }
  };

  const handleEditEvent = async (updatedEvent) => {
    try {
      const { data, error } = await supabaseService.updateEvent(updatedEvent.id, updatedEvent);
      if (error) {
        setError(error.message);
        return;
      }
      setEvents(prev => prev.map(event => event.id === updatedEvent.id ? data : event));
      setIsEditDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event');
    }
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="p-4">Loading events...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Sự kiện</h1>
          <p className="text-muted-foreground">
            Lên lịch và quản lý các cuộc họp, sự kiện
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              Danh sách
            </Button>
            <Button
              variant={viewMode === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("calendar")}
            >
              Lịch
            </Button>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Thêm sự kiện mới
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Thêm sự kiện mới</DialogTitle>
                <DialogDescription>
                  Tạo cuộc họp hoặc sự kiện mới
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Tên sự kiện</Label>
                  <Input id="title" placeholder="Nhập tên sự kiện..." value={addEvent.title} onChange={(e) => setAddEvent(prev => ({ ...prev, title: e.target.value }))} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Mô tả chi tiết về sự kiện..."
                    rows={3}
                    value={addEvent.description}
                    onChange={(e) => setAddEvent(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventDate">Thời gian</Label>
                    <Input id="eventDate" type="datetime-local" value={addEvent.start_date} onChange={(e) => setAddEvent(prev => ({ ...prev, start_date: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Địa điểm</Label>
                    <Input id="location" placeholder="VD: Phòng họp A" value={addEvent.location} onChange={(e) => setAddEvent(prev => ({ ...prev, location: e.target.value }))} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tài liệu liên quan</Label>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Chọn tài liệu đính kèm
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleAddEvent}>
                  Tạo sự kiện
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm sự kiện..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="deadline">Deadline</SelectItem>
            <SelectItem value="reminder">Reminder</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Events Display */}
      {viewMode === "list" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event, index) => {
            const { date, time } = formatDate(event.start_date);
            return (
              <Card 
                key={event.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/events/${event.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{event.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Badge variant={getStatusColor(event.status)} className="text-xs">
                          {getStatusText(event.status)}
                        </Badge>
                        {isUpcoming(event.start_date) && (
                          <Badge variant="outline" className="text-xs">
                            Sắp tới
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {event.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {date}
                      <Clock className="h-3 w-3 ml-2" />
                      {time}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                      {event.tags.length > 0 && (
                        <>
                          <Users className="h-3 w-3 ml-2" />
                          {event.tags.length} tags
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t">
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => { setEditEvent(event); setIsEditDialogOpen(true); }}>Sửa</Button>
                    <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => { setDeleteEventId(event.id); setIsDeleteDialogOpen(true); }}>Xóa</Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1 text-primary text-xs">
                      <Brain className="h-3 w-3" />
                      Tổng hợp AI
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-6">
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Chế độ xem lịch</h3>
            <p className="text-muted-foreground">Tính năng lịch sẽ được phát triển trong phiên bản tiếp theo</p>
          </div>
        </Card>
      )}

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">Không tìm thấy sự kiện</h3>
          <p className="text-muted-foreground">Thử thay đổi từ khóa tìm kiếm hoặc thêm sự kiện mới</p>
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa sự kiện</DialogTitle>
          </DialogHeader>
          {editEvent && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Tên sự kiện</Label>
                <Input id="edit-title" value={editEvent.title} onChange={e => setEditEvent({ ...editEvent, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Mô tả</Label>
                <Textarea id="edit-description" value={editEvent.description} onChange={e => setEditEvent({ ...editEvent, description: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-eventDate">Thời gian</Label>
                <Input id="edit-eventDate" type="datetime-local" value={editEvent.start_date} onChange={e => setEditEvent({ ...editEvent, start_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-location">Địa điểm</Label>
                <Input id="edit-location" value={editEvent.location} onChange={e => setEditEvent({ ...editEvent, location: e.target.value })} />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Hủy</Button>
            <Button onClick={() => handleEditEvent(editEvent)}>Lưu</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <p>Bạn có chắc chắn muốn xóa sự kiện này?</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Hủy</Button>
            <Button variant="destructive" onClick={() => handleDeleteEvent(deleteEventId)}>Xóa</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Events;

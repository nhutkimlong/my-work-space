import { useState, useEffect } from "react";
import { Plus, Search, Filter, Calendar, MapPin, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { localStorageService } from "@/services/localStorage";
import { Event, Document } from "@/types";
import { EventForm } from "@/components/EventForm";
import { toast } from "sonner";

const Events = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsData, documentsData] = await Promise.all([
          localStorageService.getEvents(),
          localStorageService.getDocuments()
        ]);
        setEvents(eventsData);
        setDocuments(documentsData);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateEvent = async (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newEvent = await localStorageService.createEvent(eventData);
      setEvents([...events, newEvent]);
      setIsAddDialogOpen(false);
      toast.success('Sự kiện đã được tạo thành công');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create event');
      toast.error('Không thể tạo sự kiện: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await localStorageService.deleteEvent(id);
      setEvents(events.filter(event => event.id !== id));
      setIsDeleteDialogOpen(false);
      toast.success('Sự kiện đã được xóa thành công');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete event');
      toast.error('Không thể xóa sự kiện: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
    }
  };

  const handleUpdateEvent = async (updatedEvent: Event) => {
    try {
      const updated = await localStorageService.updateEvent(updatedEvent.id, updatedEvent);
      setEvents(events.map(event => event.id === updated.id ? updated : event));
      setIsEditDialogOpen(false);
      toast.success('Sự kiện đã được cập nhật thành công');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update event');
      toast.error('Không thể cập nhật sự kiện: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Sắp diễn ra';
      case 'in_progress': return 'Đang diễn ra';
      case 'completed': return 'Đã kết thúc';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date();
  };

  if (loading) {
    return <div className="p-4">Loading events...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  const filteredEvents = events.filter(event => {
    const matchSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      event.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  // Sắp xếp sự kiện theo thời gian bắt đầu
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Sự kiện</h1>
          <p className="text-muted-foreground">
            Theo dõi và quản lý các sự kiện, cuộc họp
          </p>
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
                Tạo sự kiện mới và gán tài liệu liên quan
                </DialogDescription>
              </DialogHeader>
            <EventForm
              initialData={{}}
              onSubmit={handleCreateEvent}
              onCancel={() => setIsAddDialogOpen(false)}
              mode="add"
              documentsList={documents}
            />
            </DialogContent>
          </Dialog>
      </div>

      {/* Events Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedEvents.map((event) => (
              <Card 
                key={event.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/events/${event.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                <CardTitle className="text-base font-medium leading-tight">
                  {event.title}
                </CardTitle>
                <Badge className={getStatusColor(event.status)}>
                          {getStatusText(event.status)}
                        </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {event.description}
                  </p>
                  
                  <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(event.start_date)}</span>
                    </div>
                    
                {event.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                )}

                {event.organizer && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Người tổ chức: {event.organizer}</span>
                    </div>
                )}

                {event.document_id && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>Văn bản liên quan: {documents.find(d => d.id === event.document_id)?.title}</span>
                  </div>
                )}

                {event.department && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Phòng ban: {event.department}</span>
                  </div>
                )}
                  </div>
                </CardContent>
              </Card>
        ))}

        {sortedEvents.length === 0 && (
          <div className="col-span-full text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">Không tìm thấy sự kiện</h3>
          <p className="text-muted-foreground">Thử thay đổi từ khóa tìm kiếm hoặc thêm sự kiện mới</p>
        </div>
      )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa sự kiện</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <EventForm
              initialData={selectedEvent}
              onSubmit={handleUpdateEvent}
              onCancel={() => setIsEditDialogOpen(false)}
              mode="edit"
              documentsList={documents}
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
          <p>Bạn có chắc chắn muốn xóa sự kiện này?</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Hủy</Button>
            <Button variant="destructive" onClick={() => selectedEvent && handleDeleteEvent(selectedEvent.id)}>Xóa</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Events;

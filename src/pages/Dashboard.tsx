import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, FileText, CheckSquare2, AlertCircle, TrendingUp } from "lucide-react";
import { getLocalData } from "@/lib/localStorage";
import { useQuery } from "@tanstack/react-query";
import { Document, Task, Event } from "@/types";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  // Fetch documents with React Query
  const { data: documents = [] } = useQuery({
    queryKey: ['documents'],
    queryFn: () => getLocalData("documents"),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch tasks with React Query
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => getLocalData("tasks"),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch events with React Query
  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => getLocalData("events"),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Lấy công việc sắp hết hạn (5 task gần nhất theo dueDate)
  const upcomingTasks = [...(tasks || [])]
    .filter(task => task?.dueDate)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  // Lấy sự kiện sắp diễn ra (5 event gần nhất theo eventDate)
  const upcomingEvents = [...(events || [])]
    .filter(e => e?.status === "upcoming" && e?.eventDate)
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate))
    .slice(0, 5)
    .map(e => ({
      id: e.id,
      title: e.title,
      date: e.eventDate.split("T")[0],
      time: e.eventDate.split("T")[1]?.slice(0,5) || "",
    }));

  // Lấy văn bản mới nhận trong 3 ngày gần nhất
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const recentDocuments = [...(documents || [])]
    .filter(doc => {
      if (!doc?.issue_date) return false;
      const issueDate = new Date(doc.issue_date);
      return issueDate >= threeDaysAgo;
    })
    .sort((a, b) => new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime())
    .slice(0, 5)
    .map(doc => ({
      id: doc.id,
      document_code: doc.document_code,
      title: doc.title,
      type: doc.document_type,
      date: doc.issue_date,
    }));

  // Chỉ giữ 2 stats: Công việc cần xử lý, Sự kiện sắp tới
  const stats = [
    { label: "Công việc cần xử lý", value: (tasks || []).filter(t => t.status !== "Đã hoàn thành").length.toString(), icon: AlertCircle },
    { label: "Sự kiện sắp tới", value: (events || []).filter(e => e.status === "upcoming").length.toString(), icon: CalendarDays },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Trang chủ</h1>
        <p className="text-muted-foreground">
          Tổng quan hoạt động và thông tin quan trọng
        </p>
      </div>

      {/* Thao tác nhanh */}
      <div className="flex gap-2 mb-2">
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded" onClick={() => navigate('/tasks')}>Thêm công việc</button>
        <button className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded" onClick={() => navigate('/events')}>Thêm sự kiện</button>
        <button className="bg-purple-500 hover:bg-purple-600 text-white font-medium px-4 py-2 rounded" onClick={() => navigate('/documents')}>Thêm văn bản</button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {stats.map((stat, index) => (
          <Card key={index} className="animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Công việc sắp hết hạn
            </CardTitle>
            <CardDescription>Trong tuần này</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-start justify-between p-3 rounded-lg border">
                <div className="flex-1">
                  <p className="font-medium text-sm">{task.title}</p>
                  <p className="text-xs text-muted-foreground">Hạn: {task.dueDate}</p>
                </div>
                <Badge variant={task.status === "Mới giao" ? "secondary" : "default"} className="text-xs">
                  {task.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-blue-500" />
              Sự kiện sắp diễn ra
            </CardTitle>
            <CardDescription>Trong tuần này</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-start justify-between p-3 rounded-lg border">
                <div className="flex-1">
                  <p className="font-medium text-sm">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{event.date} • {event.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-500" />
              Văn bản mới nhận
            </CardTitle>
            <CardDescription>3 ngày gần đây</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentDocuments.map((doc) => (
              <div key={doc.id} className="flex items-start justify-between p-3 rounded-lg border">
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    <span className="font-bold text-black">{doc.document_code}</span>
                    {doc.document_code && doc.title ? " - " : ""}
                    {doc.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{doc.type} • {doc.date}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

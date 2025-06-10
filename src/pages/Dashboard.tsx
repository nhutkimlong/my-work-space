import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, FileText, CheckSquare2, AlertCircle, TrendingUp } from "lucide-react";
import { getLocalData } from "@/lib/localStorage";
import { useQuery } from "@tanstack/react-query";

const Dashboard = () => {
  const { data: documents = [] } = useQuery({
    queryKey: ['documents'],
    queryFn: () => getLocalData("documents")
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => getLocalData("tasks")
  });

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => getLocalData("events")
  });

  // Lấy công việc sắp hết hạn (3 task gần nhất theo dueDate)
  const upcomingTasks = [...(tasks || [])]
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 3);

  // Lấy sự kiện sắp diễn ra (3 event gần nhất theo eventDate)
  const upcomingEvents = [...(events || [])]
    .filter(e => e.status === "upcoming")
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate))
    .slice(0, 3)
    .map(e => ({
      id: e.id,
      title: e.title,
      date: e.eventDate.split("T")[0],
      time: e.eventDate.split("T")[1]?.slice(0,5) || "",
    }));

  // Lấy 3 văn bản mới nhất
  const recentDocuments = [...(documents || [])]
    .sort((a, b) => b.issueDate.localeCompare(a.issueDate))
    .slice(0, 3)
    .map(doc => ({
      id: doc.id,
      title: doc.documentCode + (doc.abstract ? ` - ${doc.abstract}` : ""),
      type: doc.documentType,
      date: doc.issueDate,
    }));

  const stats = [
    { label: "Tổng văn bản", value: (documents || []).length.toString(), icon: FileText, trend: "+12%" },
    { label: "Công việc hoàn thành", value: (tasks || []).filter(t => t.status === "Đã hoàn thành").length.toString(), icon: CheckSquare2, trend: "+5%" },
    { label: "Sự kiện sắp tới", value: (events || []).filter(e => e.status === "upcoming").length.toString(), icon: CalendarDays, trend: "+3%" },
    { label: "Công việc cần xử lý", value: (tasks || []).filter(t => t.status !== "Đã hoàn thành").length.toString(), icon: AlertCircle, trend: "-2%" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Trang chủ</h1>
        <p className="text-muted-foreground">
          Tổng quan hoạt động và thông tin quan trọng
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-3 w-3" />
                {stat.trend} so với tháng trước
              </div>
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
                  <p className="font-medium text-sm">{doc.title}</p>
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

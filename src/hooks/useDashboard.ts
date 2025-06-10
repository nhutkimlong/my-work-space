import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';
import { DashboardData, DashboardStats, AIInsight, Activity } from '@/types';
import { toast } from 'sonner';

// Query keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  data: () => [...dashboardKeys.all, 'data'] as const,
  stats: (dateRange?: { start: string; end: string }) => 
    [...dashboardKeys.all, 'stats', dateRange] as const,
  activities: (limit?: number) => 
    [...dashboardKeys.all, 'activities', limit] as const,
  deadlines: (days?: number) => 
    [...dashboardKeys.all, 'deadlines', days] as const,
  insights: (type?: string) => 
    [...dashboardKeys.all, 'insights', type] as const,
  metrics: () => [...dashboardKeys.all, 'metrics'] as const,
  analytics: (type: string, period?: string) => 
    [...dashboardKeys.all, 'analytics', type, period] as const,
  config: () => [...dashboardKeys.all, 'config'] as const,
  widgets: () => [...dashboardKeys.all, 'widgets'] as const,
  goals: () => [...dashboardKeys.all, 'goals'] as const,
  alerts: () => [...dashboardKeys.all, 'alerts'] as const,
};

// Hook for fetching comprehensive dashboard data
export const useDashboardData = () => {
  return useQuery({
    queryKey: dashboardKeys.data(),
    queryFn: () => dashboardService.getDashboardData(),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // Auto-refresh every 5 minutes
  });
};

// Hook for dashboard statistics
export const useDashboardStats = (dateRange?: { start: string; end: string }) => {
  return useQuery({
    queryKey: dashboardKeys.stats(dateRange),
    queryFn: () => dashboardService.getDashboardStats(dateRange),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook for recent activities
export const useRecentActivities = (limit: number = 20) => {
  return useQuery({
    queryKey: dashboardKeys.activities(limit),
    queryFn: () => dashboardService.getRecentActivities(limit),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 3, // Auto-refresh every 3 minutes
  });
};

// Hook for upcoming deadlines
export const useUpcomingDeadlines = (days: number = 7) => {
  return useQuery({
    queryKey: dashboardKeys.deadlines(days),
    queryFn: () => dashboardService.getUpcomingDeadlines(days),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook for AI insights
export const useAIInsights = (type?: string) => {
  return useQuery({
    queryKey: dashboardKeys.insights(type),
    queryFn: () => dashboardService.getAIInsights(type),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Hook for quick metrics
export const useQuickMetrics = () => {
  return useQuery({
    queryKey: dashboardKeys.metrics(),
    queryFn: () => dashboardService.getQuickMetrics(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // Auto-refresh every 10 minutes
  });
};

// Hook for productivity analytics
export const useProductivityAnalytics = (period: 'week' | 'month' | 'quarter' | 'year' = 'month') => {
  return useQuery({
    queryKey: dashboardKeys.analytics('productivity', period),
    queryFn: () => dashboardService.getProductivityAnalytics(period),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};

// Hook for workload analytics
export const useWorkloadAnalytics = () => {
  return useQuery({
    queryKey: dashboardKeys.analytics('workload'),
    queryFn: () => dashboardService.getWorkloadAnalytics(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Hook for personalized AI insights
export const usePersonalizedInsights = () => {
  return useQuery({
    queryKey: dashboardKeys.analytics('personalized'),
    queryFn: () => dashboardService.getPersonalizedInsights(),
    staleTime: 1000 * 60 * 30, // 30 minutes - less frequent updates for personalized insights
  });
};

// Hook for team performance insights
export const useTeamPerformanceInsights = () => {
  return useQuery({
    queryKey: dashboardKeys.analytics('team-performance'),
    queryFn: () => dashboardService.getTeamPerformanceInsights(),
    staleTime: 1000 * 60 * 20, // 20 minutes
  });
};

// Hook for predictive analytics
export const usePredictiveAnalytics = () => {
  return useQuery({
    queryKey: dashboardKeys.analytics('predictive'),
    queryFn: () => dashboardService.getPredictiveAnalytics(),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};

// Hook for smart alerts
export const useSmartAlerts = () => {
  return useQuery({
    queryKey: dashboardKeys.alerts(),
    queryFn: () => dashboardService.getSmartAlerts(),
    staleTime: 1000 * 30, // 30 seconds - alerts should be fresh
    refetchInterval: 1000 * 60 * 2, // Auto-refresh every 2 minutes
  });
};

// Hook for dismissing alerts
export const useDismissAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alertId: string) => dashboardService.dismissAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.alerts() });
      toast.success('Thông báo đã được ẩn');
    },
    onError: (error: any) => {
      toast.error('Có lỗi xảy ra: ' + error.message);
    },
  });
};

// Hook for taking alert action
export const useTakeAlertAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ alertId, action }: { alertId: string; action: string }) =>
      dashboardService.takeAlertAction(alertId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.alerts() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.data() });
      toast.success('Hành động đã được thực hiện');
    },
    onError: (error: any) => {
      toast.error('Có lỗi xảy ra: ' + error.message);
    },
  });
};

// Hook for goal progress
export const useGoalProgress = () => {
  return useQuery({
    queryKey: dashboardKeys.goals(),
    queryFn: () => dashboardService.getGoalProgress(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Hook for setting goals
export const useSetGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      title: string;
      description: string;
      target_value: number;
      target_date: string;
      metric_type: string;
      milestones?: Array<{
        title: string;
        target_date: string;
      }>;
    }) => dashboardService.setGoal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.goals() });
      toast.success('Mục tiêu đã được thiết lập');
    },
    onError: (error: any) => {
      toast.error('Có lỗi xảy ra khi thiết lập mục tiêu: ' + error.message);
    },
  });
};

// Hook for updating goal progress
export const useUpdateGoalProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ goalId, currentValue }: { goalId: string; currentValue: number }) =>
      dashboardService.updateGoalProgress(goalId, currentValue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.goals() });
      toast.success('Tiến độ mục tiêu đã được cập nhật');
    },
    onError: (error: any) => {
      toast.error('Có lỗi xảy ra: ' + error.message);
    },
  });
};

// Hook for custom widgets
export const useCustomWidgets = () => {
  return useQuery({
    queryKey: dashboardKeys.widgets(),
    queryFn: () => dashboardService.getCustomWidgets(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook for creating custom widget
export const useCreateCustomWidget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      type: 'chart' | 'metric' | 'list' | 'calendar' | 'progress';
      title: string;
      configuration: any;
      position: { x: number; y: number; width: number; height: number };
    }) => dashboardService.createCustomWidget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.widgets() });
      toast.success('Widget tùy chỉnh đã được tạo');
    },
    onError: (error: any) => {
      toast.error('Có lỗi xảy ra khi tạo widget: ' + error.message);
    },
  });
};

// Hook for updating custom widget
export const useUpdateCustomWidget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      widgetId, 
      data 
    }: { 
      widgetId: string; 
      data: Partial<{
        title: string;
        configuration: any;
        position: { x: number; y: number; width: number; height: number };
      }>;
    }) => dashboardService.updateCustomWidget(widgetId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.widgets() });
      toast.success('Widget đã được cập nhật');
    },
    onError: (error: any) => {
      toast.error('Có lỗi xảy ra khi cập nhật widget: ' + error.message);
    },
  });
};

// Hook for deleting custom widget
export const useDeleteCustomWidget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (widgetId: string) => dashboardService.deleteCustomWidget(widgetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.widgets() });
      toast.success('Widget đã được xóa');
    },
    onError: (error: any) => {
      toast.error('Có lỗi xảy ra khi xóa widget: ' + error.message);
    },
  });
};

// Hook for dashboard configuration
export const useDashboardConfig = () => {
  return useQuery({
    queryKey: dashboardKeys.config(),
    queryFn: () => dashboardService.getDashboardConfig(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

// Hook for updating dashboard configuration
export const useUpdateDashboardConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: {
      layout?: 'grid' | 'masonry' | 'list';
      refresh_interval?: number;
      enabled_widgets?: string[];
      widget_preferences?: Record<string, any>;
    }) => dashboardService.updateDashboardConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.config() });
      toast.success('Cấu hình dashboard đã được cập nhật');
    },
    onError: (error: any) => {
      toast.error('Có lỗi xảy ra: ' + error.message);
    },
  });
};

// Hook for exporting dashboard data
export const useExportDashboardData = () => {
  return useMutation({
    mutationFn: ({ 
      format, 
      dateRange 
    }: { 
      format: 'pdf' | 'excel' | 'json'; 
      dateRange?: { start: string; end: string };
    }) => dashboardService.exportDashboardData(format, dateRange),
    onSuccess: (response) => {
      // Open download URL in new tab
      window.open(response.data.download_url, '_blank');
      toast.success('Đã xuất dữ liệu dashboard');
    },
    onError: (error: any) => {
      toast.error('Có lỗi xảy ra khi xuất dữ liệu: ' + error.message);
    },
  });
};

// Hook for generating dashboard report
export const useGenerateDashboardReport = () => {
  return useMutation({
    mutationFn: ({ 
      type, 
      recipients 
    }: { 
      type: 'weekly' | 'monthly' | 'quarterly'; 
      recipients?: string[];
    }) => dashboardService.generateDashboardReport(type, recipients),
    onSuccess: () => {
      toast.success('Báo cáo đã được tạo và gửi');
    },
    onError: (error: any) => {
      toast.error('Có lỗi xảy ra khi tạo báo cáo: ' + error.message);
    },
  });
};

// Hook for AI dashboard optimization
export const useOptimizeDashboardLayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => dashboardService.optimizeDashboardLayout(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.widgets() });
      toast.success('Layout dashboard đã được tối ưu hóa bằng AI');
    },
    onError: (error: any) => {
      toast.error('Có lỗi xảy ra khi tối ưu hóa: ' + error.message);
    },
  });
};

// Hook for AI content recommendations
export const useContentRecommendations = () => {
  return useQuery({
    queryKey: [...dashboardKeys.all, 'content-recommendations'],
    queryFn: () => dashboardService.getContentRecommendations(),
    staleTime: 1000 * 60 * 60, // 1 hour - recommendations don't change frequently
  });
};

// Real-time updates hook
export const useDashboardRealtime = () => {
  const queryClient = useQueryClient();

  const connectEventSource = () => {
    const eventSource = dashboardService.subscribeToDashboardUpdates();
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Invalidate relevant queries based on update type
      switch (data.type) {
        case 'stats_update':
          queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() });
          break;
        case 'activity_update':
          queryClient.invalidateQueries({ queryKey: dashboardKeys.activities() });
          break;
        case 'alert_update':
          queryClient.invalidateQueries({ queryKey: dashboardKeys.alerts() });
          break;
        case 'insight_update':
          queryClient.invalidateQueries({ queryKey: dashboardKeys.insights() });
          break;
        default:
          queryClient.invalidateQueries({ queryKey: dashboardKeys.data() });
      }
    };

    eventSource.onerror = (error) => {
      console.error('Dashboard SSE error:', error);
      eventSource.close();
      
      // Reconnect after 5 seconds
      setTimeout(() => {
        connectEventSource();
      }, 5000);
    };

    return eventSource;
  };

  return { connectEventSource };
}; 
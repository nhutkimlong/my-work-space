import { apiClient } from '@/lib/api';
import { 
  DashboardData, 
  DashboardStats, 
  AIInsight, 
  Activity, 
  QuickMetric,
  ApiResponse,
  Task,
  Event,
  Document 
} from '@/types';
import { localStorageService } from './localStorage';

export class DashboardService {
  private basePath = '/dashboard';

  // Get comprehensive dashboard data
  async getDashboardData(): Promise<DashboardData> {
    return localStorageService.getDashboardData();
  }

  // Get dashboard statistics
  async getDashboardStats(dateRange?: { start: string; end: string }): Promise<ApiResponse<DashboardStats>> {
    const params = dateRange ? {
      start_date: dateRange.start,
      end_date: dateRange.end,
    } : {};
    
    return apiClient.get(`${this.basePath}/stats`, params);
  }

  // Get recent activities
  async getRecentActivities(limit: number = 20): Promise<ApiResponse<Activity[]>> {
    return apiClient.get(`${this.basePath}/activities`, { limit });
  }

  // Get upcoming deadlines
  async getUpcomingDeadlines(days: number = 7): Promise<ApiResponse<(Task | Event)[]>> {
    return apiClient.get(`${this.basePath}/upcoming-deadlines`, { days });
  }

  // Get AI insights
  async getAIInsights(type?: string): Promise<ApiResponse<AIInsight[]>> {
    const params = type ? { type } : {};
    return apiClient.get(`${this.basePath}/ai-insights`, params);
  }

  // Get quick metrics
  async getQuickMetrics(): Promise<ApiResponse<QuickMetric[]>> {
    return apiClient.get(`${this.basePath}/quick-metrics`);
  }

  // Performance analytics
  async getProductivityAnalytics(period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<ApiResponse<{
    productivity_score: number;
    task_completion_rate: number;
    efficiency_trend: Array<{
      date: string;
      score: number;
      tasks_completed: number;
      hours_worked: number;
    }>;
    top_performing_areas: Array<{
      area: string;
      score: number;
      improvement: number;
    }>;
    bottlenecks: Array<{
      area: string;
      impact_score: number;
      suggested_actions: string[];
    }>;
  }>> {
    return apiClient.get(`${this.basePath}/productivity-analytics`, { period });
  }

  // Workload analysis
  async getWorkloadAnalytics(): Promise<ApiResponse<{
    current_capacity: number;
    utilization_rate: number;
    overload_alerts: Array<{
      user_id: string;
      user_name: string;
      overload_percentage: number;
      critical_tasks: number;
      recommendations: string[];
    }>;
    resource_distribution: Array<{
      department: string;
      active_tasks: number;
      capacity_usage: number;
      efficiency_score: number;
    }>;
    predicted_workload: Array<{
      week: string;
      predicted_tasks: number;
      estimated_hours: number;
      capacity_alert: boolean;
    }>;
  }>> {
    return apiClient.get(`${this.basePath}/workload-analytics`);
  }

  // AI-powered insights and recommendations
  async getPersonalizedInsights(): Promise<ApiResponse<{
    productivity_insights: Array<{
      insight: string;
      impact: 'high' | 'medium' | 'low';
      actionable_steps: string[];
      estimated_improvement: string;
    }>;
    optimization_suggestions: Array<{
      area: 'time_management' | 'task_prioritization' | 'resource_allocation' | 'workflow';
      suggestion: string;
      reasoning: string;
      implementation_difficulty: 'easy' | 'medium' | 'hard';
      expected_benefit: string;
    }>;
    habit_recommendations: Array<{
      habit: string;
      current_score: number;
      target_score: number;
      weekly_actions: string[];
    }>;
  }>> {
    return apiClient.get(`${this.basePath}/ai-personalized-insights`);
  }

  async getTeamPerformanceInsights(): Promise<ApiResponse<{
    team_productivity_score: number;
    collaboration_effectiveness: number;
    communication_quality: number;
    performance_trends: Array<{
      metric: string;
      current_value: number;
      trend: 'improving' | 'declining' | 'stable';
      change_percentage: number;
    }>;
    team_strengths: string[];
    improvement_areas: Array<{
      area: string;
      current_score: number;
      target_score: number;
      action_plan: string[];
    }>;
    success_patterns: Array<{
      pattern: string;
      frequency: number;
      impact_on_performance: number;
      recommended_amplification: string;
    }>;
  }>> {
    return apiClient.get(`${this.basePath}/ai-team-insights`);
  }

  async getPredictiveAnalytics(): Promise<ApiResponse<{
    deadline_risk_predictions: Array<{
      entity_id: string;
      entity_type: 'task' | 'document' | 'event';
      title: string;
      due_date: string;
      risk_level: 'low' | 'medium' | 'high' | 'critical';
      probability_of_delay: number;
      contributing_factors: string[];
      recommended_actions: string[];
    }>;
    resource_demand_forecast: Array<{
      week: string;
      predicted_demand: number;
      available_capacity: number;
      gap_analysis: {
        shortage_hours: number;
        surplus_hours: number;
        recommended_adjustments: string[];
      };
    }>;
    success_probability_scores: Array<{
      entity_id: string;
      entity_type: 'task' | 'project' | 'event';
      title: string;
      success_probability: number;
      key_success_factors: string[];
      risk_mitigation_suggestions: string[];
    }>;
  }>> {
    return apiClient.get(`${this.basePath}/ai-predictive-analytics`);
  }

  // Smart notifications and alerts
  async getSmartAlerts(): Promise<ApiResponse<Array<{
    id: string;
    type: 'deadline_risk' | 'overload_warning' | 'opportunity' | 'performance_alert';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    title: string;
    message: string;
    action_required: boolean;
    suggested_actions: string[];
    expires_at?: string;
    created_at: string;
  }>>> {
    return apiClient.get(`${this.basePath}/smart-alerts`);
  }

  async dismissAlert(alertId: string): Promise<ApiResponse<void>> {
    return apiClient.post(`${this.basePath}/smart-alerts/${alertId}/dismiss`);
  }

  async takeAlertAction(alertId: string, action: string): Promise<ApiResponse<void>> {
    return apiClient.post(`${this.basePath}/smart-alerts/${alertId}/action`, { action });
  }

  // Goal tracking and KPIs
  async getGoalProgress(): Promise<ApiResponse<Array<{
    goal_id: string;
    title: string;
    description: string;
    target_value: number;
    current_value: number;
    progress_percentage: number;
    target_date: string;
    is_on_track: boolean;
    trend: 'ahead' | 'on_track' | 'behind' | 'at_risk';
    milestones: Array<{
      title: string;
      target_date: string;
      status: 'completed' | 'in_progress' | 'pending' | 'overdue';
    }>;
    recommendations: string[];
  }>>> {
    return apiClient.get(`${this.basePath}/goal-progress`);
  }

  async setGoal(data: {
    title: string;
    description: string;
    target_value: number;
    target_date: string;
    metric_type: string;
    milestones?: Array<{
      title: string;
      target_date: string;
    }>;
  }): Promise<ApiResponse<{ goal_id: string }>> {
    return apiClient.post(`${this.basePath}/goals`, data);
  }

  async updateGoalProgress(goalId: string, currentValue: number): Promise<ApiResponse<void>> {
    return apiClient.patch(`${this.basePath}/goals/${goalId}/progress`, {
      current_value: currentValue,
    });
  }

  // Custom widgets
  async getCustomWidgets(): Promise<ApiResponse<Array<{
    widget_id: string;
    type: 'chart' | 'metric' | 'list' | 'calendar' | 'progress';
    title: string;
    configuration: any;
    position: { x: number; y: number; width: number; height: number };
    data: any;
  }>>> {
    return apiClient.get(`${this.basePath}/custom-widgets`);
  }

  async createCustomWidget(data: {
    type: 'chart' | 'metric' | 'list' | 'calendar' | 'progress';
    title: string;
    configuration: any;
    position: { x: number; y: number; width: number; height: number };
  }): Promise<ApiResponse<{ widget_id: string }>> {
    return apiClient.post(`${this.basePath}/custom-widgets`, data);
  }

  async updateCustomWidget(widgetId: string, data: Partial<{
    title: string;
    configuration: any;
    position: { x: number; y: number; width: number; height: number };
  }>): Promise<ApiResponse<void>> {
    return apiClient.put(`${this.basePath}/custom-widgets/${widgetId}`, data);
  }

  async deleteCustomWidget(widgetId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`${this.basePath}/custom-widgets/${widgetId}`);
  }

  // Dashboard configuration
  async getDashboardConfig(): Promise<ApiResponse<{
    layout: 'grid' | 'masonry' | 'list';
    refresh_interval: number;
    enabled_widgets: string[];
    widget_preferences: Record<string, any>;
  }>> {
    return apiClient.get(`${this.basePath}/config`);
  }

  async updateDashboardConfig(config: {
    layout?: 'grid' | 'masonry' | 'list';
    refresh_interval?: number;
    enabled_widgets?: string[];
    widget_preferences?: Record<string, any>;
  }): Promise<ApiResponse<void>> {
    return apiClient.patch(`${this.basePath}/config`, config);
  }

  // Export and sharing
  async exportDashboardData(format: 'pdf' | 'excel' | 'json', dateRange?: { start: string; end: string }): Promise<ApiResponse<{ download_url: string }>> {
    const params = {
      format,
      ...(dateRange && {
        start_date: dateRange.start,
        end_date: dateRange.end,
      }),
    };
    
    return apiClient.get(`${this.basePath}/export`, params);
  }

  async generateDashboardReport(type: 'weekly' | 'monthly' | 'quarterly', recipients?: string[]): Promise<ApiResponse<{ report_id: string }>> {
    return apiClient.post(`${this.basePath}/generate-report`, {
      report_type: type,
      recipients,
    });
  }

  // Real-time updates
  subscribeToDashboardUpdates(): EventSource {
    const url = `${apiClient['baseURL']}${this.basePath}/stream`;
    return new EventSource(url);
  }

  // AI-powered dashboard optimization
  async optimizeDashboardLayout(): Promise<ApiResponse<{
    suggested_layout: Array<{
      widget_type: string;
      position: { x: number; y: number; width: number; height: number };
      reasoning: string;
    }>;
    usage_insights: Array<{
      widget_type: string;
      usage_frequency: number;
      importance_score: number;
      optimization_suggestion: string;
    }>;
  }>> {
    return apiClient.post(`${this.basePath}/ai-optimize-layout`);
  }

  async getContentRecommendations(): Promise<ApiResponse<Array<{
    type: 'widget' | 'metric' | 'insight';
    title: string;
    description: string;
    relevance_score: number;
    category: string;
    implementation_effort: 'low' | 'medium' | 'high';
    value_proposition: string;
  }>>> {
    return apiClient.get(`${this.basePath}/ai-content-recommendations`);
  }
}

// Export singleton instance
export const dashboardService = new DashboardService(); 
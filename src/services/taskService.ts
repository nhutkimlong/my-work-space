import { apiClient, buildQueryParams } from '@/lib/api';
import { 
  Task, 
  CreateTaskForm, 
  SearchFilters, 
  PaginatedResponse, 
  ApiResponse,
  TaskStatistics,
  AISuggestion,
  SubTask,
  Comment 
} from '@/types';
import { localStorageService } from './localStorage';

export class TaskService {
  private basePath = '/tasks';

  // Get all tasks with filtering and pagination
  async getTasks(
    filters: SearchFilters = {}, 
    page: number = 1, 
    perPage: number = 20
  ): Promise<PaginatedResponse<Task>> {
    const params = {
      ...buildQueryParams(filters),
      page,
      per_page: perPage,
    };

    return apiClient.get(`${this.basePath}`, params);
  }

  // Get task by ID
  async getTask(id: string): Promise<ApiResponse<Task>> {
    return apiClient.get(`${this.basePath}/${id}`);
  }

  // Create new task
  async createTask(data: CreateTaskForm): Promise<ApiResponse<Task>> {
    return apiClient.post(this.basePath, data);
  }

  // Update task
  async updateTask(id: string, data: Partial<Task>): Promise<ApiResponse<Task>> {
    return apiClient.put(`${this.basePath}/${id}`, data);
  }

  // Delete task
  async deleteTask(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`${this.basePath}/${id}`);
  }

  // Update task status
  async updateTaskStatus(id: string, status: string): Promise<ApiResponse<Task>> {
    return apiClient.patch(`${this.basePath}/${id}/status`, { status });
  }

  // Update task progress
  async updateTaskProgress(id: string, progress: number): Promise<ApiResponse<Task>> {
    return apiClient.patch(`${this.basePath}/${id}/progress`, { progress });
  }

  // Assign task to users
  async assignTask(id: string, userIds: string[]): Promise<ApiResponse<Task>> {
    return apiClient.patch(`${this.basePath}/${id}/assign`, {
      assigned_to: userIds,
    });
  }

  // Get assigned tasks for current user
  async getMyTasks(): Promise<ApiResponse<Task[]>> {
    return apiClient.get(`${this.basePath}/my-tasks`);
  }

  // Get tasks assigned by current user
  async getTasksCreatedByMe(): Promise<ApiResponse<Task[]>> {
    return apiClient.get(`${this.basePath}/created-by-me`);
  }

  // Get overdue tasks
  async getOverdueTasks(): Promise<ApiResponse<Task[]>> {
    return apiClient.get(`${this.basePath}/overdue`);
  }

  // Get upcoming deadline tasks
  async getUpcomingDeadlines(days: number = 7): Promise<ApiResponse<Task[]>> {
    return apiClient.get(`${this.basePath}/upcoming-deadlines`, { days });
  }

  // SubTask operations
  async createSubTask(taskId: string, subTaskData: Omit<SubTask, 'id' | 'task_id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<SubTask>> {
    return apiClient.post(`${this.basePath}/${taskId}/subtasks`, subTaskData);
  }

  async updateSubTask(taskId: string, subTaskId: string, data: Partial<SubTask>): Promise<ApiResponse<SubTask>> {
    return apiClient.put(`${this.basePath}/${taskId}/subtasks/${subTaskId}`, data);
  }

  async deleteSubTask(taskId: string, subTaskId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`${this.basePath}/${taskId}/subtasks/${subTaskId}`);
  }

  async getSubTasks(taskId: string): Promise<ApiResponse<SubTask[]>> {
    return apiClient.get(`${this.basePath}/${taskId}/subtasks`);
  }

  // Comments
  async addComment(id: string, content: string, parentId?: string): Promise<ApiResponse<Comment>> {
    return apiClient.post(`${this.basePath}/${id}/comments`, {
      content,
      parent_id: parentId,
    });
  }

  async getComments(id: string): Promise<ApiResponse<Comment[]>> {
    return apiClient.get(`${this.basePath}/${id}/comments`);
  }

  async updateComment(taskId: string, commentId: string, content: string): Promise<ApiResponse<Comment>> {
    return apiClient.put(`${this.basePath}/${taskId}/comments/${commentId}`, { content });
  }

  async deleteComment(taskId: string, commentId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`${this.basePath}/${taskId}/comments/${commentId}`);
  }

  // AI-powered features
  async getAISuggestions(id: string): Promise<ApiResponse<AISuggestion[]>> {
    return apiClient.get(`${this.basePath}/${id}/ai-suggestions`);
  }

  async applyAISuggestion(id: string, suggestionId: string): Promise<ApiResponse<Task>> {
    return apiClient.post(`${this.basePath}/${id}/ai-suggestions/${suggestionId}/apply`);
  }

  async getSmartPriorityRecommendations(): Promise<ApiResponse<Array<{
    task_id: string;
    current_priority: string;
    suggested_priority: string;
    reasoning: string;
    confidence: number;
  }>>> {
    return apiClient.get(`${this.basePath}/ai-priority-recommendations`);
  }

  async getTaskOptimizationSuggestions(id: string): Promise<ApiResponse<{
    estimated_duration: number;
    optimal_start_time: string;
    resource_requirements: string[];
    potential_blockers: string[];
    success_probability: number;
  }>> {
    return apiClient.get(`${this.basePath}/${id}/ai-optimization`);
  }

  async getWorkloadAnalysis(userId?: string): Promise<ApiResponse<{
    current_workload: number;
    capacity_utilization: number;
    overload_risk: 'low' | 'medium' | 'high';
    recommendations: string[];
    optimal_task_distribution: Array<{
      task_id: string;
      recommended_assignee: string;
      reasoning: string;
    }>;
  }>> {
    const params = userId ? { user_id: userId } : {};
    return apiClient.get(`${this.basePath}/ai-workload-analysis`, params);
  }

  async generateTaskFromDescription(description: string): Promise<ApiResponse<{
    suggested_title: string;
    suggested_description: string;
    suggested_priority: string;
    suggested_tags: string[];
    suggested_due_date: string;
    estimated_hours: number;
    suggested_subtasks: Array<{
      title: string;
      description: string;
    }>;
  }>> {
    return apiClient.post(`${this.basePath}/ai-generate`, { description });
  }

  async getTaskDependencyAnalysis(): Promise<ApiResponse<{
    dependencies: Array<{
      task_id: string;
      depends_on: string[];
      blocks: string[];
      critical_path: boolean;
    }>;
    suggestions: Array<{
      type: 'reorder' | 'parallelize' | 'resource_allocation';
      description: string;
      impact: string;
    }>;
  }>> {
    return apiClient.get(`${this.basePath}/ai-dependency-analysis`);
  }

  // Task statistics
  async getTaskStatistics(dateRange?: { start: string; end: string }): Promise<ApiResponse<TaskStatistics>> {
    const params = dateRange ? {
      start_date: dateRange.start,
      end_date: dateRange.end,
    } : {};
    
    return apiClient.get(`${this.basePath}/statistics`, params);
  }

  // Bulk operations
  async bulkUpdateStatus(taskIds: string[], status: string): Promise<ApiResponse<void>> {
    return apiClient.patch(`${this.basePath}/bulk/status`, {
      task_ids: taskIds,
      status,
    });
  }

  async bulkAssign(taskIds: string[], userIds: string[]): Promise<ApiResponse<void>> {
    return apiClient.patch(`${this.basePath}/bulk/assign`, {
      task_ids: taskIds,
      user_ids: userIds,
    });
  }

  async bulkDelete(taskIds: string[]): Promise<ApiResponse<void>> {
    return apiClient.post(`${this.basePath}/bulk/delete`, {
      task_ids: taskIds,
    });
  }

  async bulkUpdatePriority(taskIds: string[], priority: string): Promise<ApiResponse<void>> {
    return apiClient.patch(`${this.basePath}/bulk/priority`, {
      task_ids: taskIds,
      priority,
    });
  }

  // Time tracking
  async startTimeTracking(id: string): Promise<ApiResponse<{ started_at: string }>> {
    return apiClient.post(`${this.basePath}/${id}/time-tracking/start`);
  }

  async stopTimeTracking(id: string): Promise<ApiResponse<{ 
    stopped_at: string; 
    duration_minutes: number;
    total_time_today: number;
  }>> {
    return apiClient.post(`${this.basePath}/${id}/time-tracking/stop`);
  }

  async getTimeTrackingHistory(id: string): Promise<ApiResponse<Array<{
    date: string;
    duration_minutes: number;
    sessions: Array<{
      start_time: string;
      end_time: string;
      duration_minutes: number;
    }>;
  }>>> {
    return apiClient.get(`${this.basePath}/${id}/time-tracking/history`);
  }

  // Task templates
  async createTaskFromTemplate(templateId: string, customData?: Partial<CreateTaskForm>): Promise<ApiResponse<Task>> {
    return apiClient.post(`${this.basePath}/templates/${templateId}/create`, customData);
  }

  async getTaskTemplates(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    description: string;
    default_data: Partial<CreateTaskForm>;
    tags: string[];
  }>>> {
    return apiClient.get(`${this.basePath}/templates`);
  }

  async saveAsTemplate(id: string, templateName: string): Promise<ApiResponse<{ template_id: string }>> {
    return apiClient.post(`${this.basePath}/${id}/save-as-template`, {
      template_name: templateName,
    });
  }

  // Integration with documents and events
  async linkToDocument(taskId: string, documentId: string): Promise<ApiResponse<void>> {
    return apiClient.post(`${this.basePath}/${taskId}/link-document`, {
      document_id: documentId,
    });
  }

  async unlinkFromDocument(taskId: string, documentId: string): Promise<ApiResponse<void>> {
    return apiClient.post(`${this.basePath}/${taskId}/unlink-document`, {
      document_id: documentId,
    });
  }

  async linkToEvent(taskId: string, eventId: string): Promise<ApiResponse<void>> {
    return apiClient.post(`${this.basePath}/${taskId}/link-event`, {
      event_id: eventId,
    });
  }

  async unlinkFromEvent(taskId: string, eventId: string): Promise<ApiResponse<void>> {
    return apiClient.post(`${this.basePath}/${taskId}/unlink-event`, {
      event_id: eventId,
    });
  }
}

// Export singleton instance
export const taskService = new TaskService(); 
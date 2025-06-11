import { apiClient, buildQueryParams } from '@/lib/api';
import { 
  Event, 
  CreateEventForm, 
  SearchFilters, 
  PaginatedResponse, 
  ApiResponse,
  Comment 
} from '@/types';
import { localStorageService } from './localStorage';

export class EventService {
  private basePath = '/events';

  // Get all events with filtering and pagination
  async getEvents(
    filters: SearchFilters = {}, 
    page: number = 1, 
    perPage: number = 20
  ): Promise<PaginatedResponse<Event>> {
    const params = {
      ...buildQueryParams(filters),
      page,
      per_page: perPage,
    };

    return apiClient.get(`${this.basePath}`, params);
  }

  // Get event by ID
  async getEvent(id: string): Promise<ApiResponse<Event>> {
    return apiClient.get(`${this.basePath}/${id}`);
  }

  // Create new event
  async createEvent(data: CreateEventForm): Promise<ApiResponse<Event>> {
    return apiClient.post(this.basePath, data);
  }

  // Update event
  async updateEvent(id: string, data: Partial<Event>): Promise<ApiResponse<Event>> {
    return apiClient.put(`${this.basePath}/${id}`, data);
  }

  // Delete event
  async deleteEvent(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`${this.basePath}/${id}`);
  }

  // Get events for calendar view
  async getCalendarEvents(start: string, end: string): Promise<ApiResponse<Event[]>> {
    return apiClient.get(`${this.basePath}/calendar`, {
      start_date: start,
      end_date: end,
    });
  }

  // Get upcoming events
  async getUpcomingEvents(days: number = 7): Promise<ApiResponse<Event[]>> {
    return apiClient.get(`${this.basePath}/upcoming`, { days });
  }

  // Get my events (where user is organizer or attendee)
  async getMyEvents(): Promise<ApiResponse<Event[]>> {
    return apiClient.get(`${this.basePath}/my-events`);
  }

  // Get events I'm organizing
  async getEventsIOrganize(): Promise<ApiResponse<Event[]>> {
    return apiClient.get(`${this.basePath}/organizing`);
  }

  // Event attendance management
  async respondToInvitation(id: string, response: 'accepted' | 'declined' | 'maybe'): Promise<ApiResponse<void>> {
    return apiClient.post(`${this.basePath}/${id}/respond`, { response });
  }

  async getEventAttendees(id: string): Promise<ApiResponse<Array<{
    user_id: string;
    user_name: string;
    response: 'accepted' | 'declined' | 'maybe' | 'pending';
    responded_at?: string;
  }>>> {
    return apiClient.get(`${this.basePath}/${id}/attendees`);
  }

  async inviteUsers(id: string, userIds: string[]): Promise<ApiResponse<void>> {
    return apiClient.post(`${this.basePath}/${id}/invite`, {
      user_ids: userIds,
    });
  }

  async removeAttendees(id: string, userIds: string[]): Promise<ApiResponse<void>> {
    return apiClient.post(`${this.basePath}/${id}/remove-attendees`, {
      user_ids: userIds,
    });
  }

  // Event agenda management
  async updateAgenda(id: string, agenda: string[]): Promise<ApiResponse<Event>> {
    return apiClient.patch(`${this.basePath}/${id}/agenda`, { agenda });
  }

  async addAgendaItem(id: string, item: string): Promise<ApiResponse<Event>> {
    return apiClient.post(`${this.basePath}/${id}/agenda/items`, { item });
  }

  async removeAgendaItem(id: string, itemIndex: number): Promise<ApiResponse<Event>> {
    return apiClient.delete(`${this.basePath}/${id}/agenda/items/${itemIndex}`);
  }

  // Comments and notes
  async addComment(id: string, content: string, parentId?: string): Promise<ApiResponse<Comment>> {
    return apiClient.post(`${this.basePath}/${id}/comments`, {
      content,
      parent_id: parentId,
    });
  }

  async getComments(id: string): Promise<ApiResponse<Comment[]>> {
    return apiClient.get(`${this.basePath}/${id}/comments`);
  }

  // Meeting minutes and recordings
  async saveMeetingMinutes(id: string, minutes: string): Promise<ApiResponse<void>> {
    return apiClient.post(`${this.basePath}/${id}/minutes`, { minutes });
  }

  async getMeetingMinutes(id: string): Promise<ApiResponse<{ minutes: string; saved_at: string }>> {
    return apiClient.get(`${this.basePath}/${id}/minutes`);
  }

  async uploadRecording(id: string, recording: File): Promise<ApiResponse<{ recording_url: string }>> {
    const formData = new FormData();
    formData.append('recording', recording);
    
    return apiClient.post(`${this.basePath}/${id}/recording`, formData);
  }

  // AI-powered features
  async generateEventSummary(id: string): Promise<ApiResponse<{
    summary: string;
    key_points: string[];
    action_items: string[];
    decisions_made: string[];
    participants_summary: string;
  }>> {
    return apiClient.post(`${this.basePath}/${id}/ai-summary`);
  }

  async extractActionItems(id: string): Promise<ApiResponse<Array<{
    description: string;
    assigned_to?: string;
    due_date?: string;
    priority: 'low' | 'medium' | 'high';
    confidence: number;
  }>>> {
    return apiClient.post(`${this.basePath}/${id}/ai-action-items`);
  }

  async getSmartSchedulingSuggestions(data: {
    duration_minutes: number;
    attendees: string[];
    preferred_time_slots?: string[];
    urgency?: 'low' | 'medium' | 'high';
  }): Promise<ApiResponse<Array<{
    start_time: string;
    end_time: string;
    availability_score: number;
    conflicts: Array<{
      user_id: string;
      conflict_type: 'busy' | 'tentative' | 'preference';
      details: string;
    }>;
    reasoning: string;
  }>>> {
    return apiClient.post(`${this.basePath}/ai-smart-scheduling`, data);
  }

  async getOptimalMeetingTime(data: {
    attendees: string[];
    duration_minutes: number;
    date_range: { start: string; end: string };
    preferences?: {
      avoid_early_morning?: boolean;
      avoid_late_afternoon?: boolean;
      prefer_morning?: boolean;
      prefer_afternoon?: boolean;
    };
  }): Promise<ApiResponse<{
    suggested_time: string;
    confidence: number;
    reasoning: string;
    alternative_times: Array<{
      time: string;
      score: number;
      issues: string[];
    }>;
  }>> {
    return apiClient.post(`${this.basePath}/ai-optimal-time`, data);
  }

  async generateMeetingAgenda(data: {
    title: string;
    purpose: string;
    duration_minutes: number;
    attendees: string[];
    context?: string;
  }): Promise<ApiResponse<{
    suggested_agenda: string[];
    time_allocation: Array<{
      item: string;
      duration_minutes: number;
      type: 'discussion' | 'presentation' | 'decision' | 'break';
    }>;
    preparation_items: string[];
  }>> {
    return apiClient.post(`${this.basePath}/ai-generate-agenda`, data);
  }

  async analyzeEventPatterns(): Promise<ApiResponse<{
    meeting_frequency_by_type: Array<{
      type: string;
      weekly_average: number;
      trend: 'increasing' | 'decreasing' | 'stable';
    }>;
    optimal_meeting_times: Array<{
      day_of_week: string;
      time_range: string;
      success_rate: number;
    }>;
    productivity_insights: Array<{
      insight: string;
      recommendation: string;
      impact: 'high' | 'medium' | 'low';
    }>;
  }>> {
    return apiClient.get(`${this.basePath}/ai-pattern-analysis`);
  }

  // Calendar integration
  async exportToCalendar(id: string, calendarType: 'google' | 'outlook' | 'ical'): Promise<ApiResponse<{ export_url: string }>> {
    return apiClient.post(`${this.basePath}/${id}/export-calendar`, {
      calendar_type: calendarType,
    });
  }

  async syncWithExternalCalendar(calendarId: string): Promise<ApiResponse<{ synced_events: number }>> {
    return apiClient.post(`${this.basePath}/sync-external`, {
      calendar_id: calendarId,
    });
  }

  // Recurring events
  async createRecurringEvent(data: CreateEventForm & {
    recurrence: {
      frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
      interval: number;
      end_date?: string;
      count?: number;
      days_of_week?: number[]; // 0-6, 0 = Sunday
    };
  }): Promise<ApiResponse<{ created_events: Event[]; series_id: string }>> {
    return apiClient.post(`${this.basePath}/recurring`, data);
  }

  async updateRecurringSeries(seriesId: string, data: Partial<Event>): Promise<ApiResponse<void>> {
    return apiClient.put(`${this.basePath}/recurring/${seriesId}`, data);
  }

  async deleteRecurringSeries(seriesId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`${this.basePath}/recurring/${seriesId}`);
  }

  // Event notifications
  async setReminders(id: string, reminders: Array<{
    type: 'email' | 'push' | 'sms';
    minutes_before: number;
  }>): Promise<ApiResponse<void>> {
    return apiClient.post(`${this.basePath}/${id}/reminders`, { reminders });
  }

  async getEventReminders(id: string): Promise<ApiResponse<Array<{
    type: 'email' | 'push' | 'sms';
    minutes_before: number;
    scheduled_for: string;
    status: 'scheduled' | 'sent' | 'failed';
  }>>> {
    return apiClient.get(`${this.basePath}/${id}/reminders`);
  }

  // Bulk operations
  async bulkUpdateStatus(eventIds: string[], status: string): Promise<ApiResponse<void>> {
    return apiClient.patch(`${this.basePath}/bulk/status`, {
      event_ids: eventIds,
      status,
    });
  }

  async bulkDelete(eventIds: string[]): Promise<ApiResponse<void>> {
    return apiClient.post(`${this.basePath}/bulk/delete`, {
      event_ids: eventIds,
    });
  }

  async bulkInvite(eventIds: string[], userIds: string[]): Promise<ApiResponse<void>> {
    return apiClient.post(`${this.basePath}/bulk/invite`, {
      event_ids: eventIds,
      user_ids: userIds,
    });
  }

  // Statistics and analytics
  async getEventStatistics(dateRange?: { start: string; end: string }): Promise<ApiResponse<{
    total_events: number;
    events_by_type: Array<{ type: string; count: number }>;
    attendance_rate: number;
    average_duration: number;
    busiest_days: Array<{ day: string; event_count: number }>;
    monthly_trend: Array<{ month: string; count: number }>;
  }>> {
    const params = dateRange ? {
      start_date: dateRange.start,
      end_date: dateRange.end,
    } : {};
    
    return apiClient.get(`${this.basePath}/statistics`, params);
  }

  // Integration with tasks and documents
  async linkToTask(eventId: string, taskId: string): Promise<ApiResponse<void>> {
    return apiClient.post(`${this.basePath}/${eventId}/link-task`, {
      task_id: taskId,
    });
  }

  async unlinkFromTask(eventId: string, taskId: string): Promise<ApiResponse<void>> {
    return apiClient.post(`${this.basePath}/${eventId}/unlink-task`, {
      task_id: taskId,
    });
  }

  async linkToDocument(eventId: string, documentId: string): Promise<ApiResponse<void>> {
    return apiClient.post(`${this.basePath}/${eventId}/link-document`, {
      document_id: documentId,
    });
  }

  async unlinkFromDocument(eventId: string, documentId: string): Promise<ApiResponse<void>> {
    return apiClient.post(`${this.basePath}/${eventId}/unlink-document`, {
      document_id: documentId,
    });
  }
}

// Export singleton instance
export const eventService = new EventService(); 
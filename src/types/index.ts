// Base types
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Status = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
export type DocumentType = 'internal' | 'external' | 'template' | 'report' | 'contract';
export type EventType = 'meeting' | 'deadline' | 'conference' | 'training' | 'other';

// User interface
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: 'admin' | 'manager' | 'employee';
  department?: string;
  created_at: string;
  updated_at: string;
}

// Document interface
export interface Document {
  id: string;
  title: string;
  description?: string;
  document_code?: string;
  issue_date?: string;
  expiration_date?: string;
  issuer?: string;
  abstract?: string;
  ai_summary?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  document_type: string;
  tags: string[];
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  google_drive_id?: string;
  google_drive_url?: string;
  related_documents?: string[];
  created_at: string;
  updated_at: string;
}

// Task interface
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assigned_to?: string[];
  created_by: string;
  due_date?: string;
  start_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  progress: number;
  tags: string[];
  attachments?: Attachment[];
  related_documents?: string[];
  related_events?: string[];
  created_at: string;
  updated_at: string;
}

// Event interface
export interface Event {
  id: string;
  title: string;
  description?: string;
  event_type: string;
  start_date: string;
  end_date: string;
  location?: string;
  meeting_link?: string;
  attendees?: string[];
  organizer: string;
  agenda?: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  document_id?: string;
  department?: string;
  created_at: string;
  updated_at: string;
}

// Comment interface
export interface Comment {
  id: string;
  content: string;
  author: string;
  created_at: string;
  updated_at: string;
  parent_id?: string; // For nested comments
}

// Attachment interface
export interface Attachment {
  id: string;
  name: string;
  url: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
}

// AI-related interfaces
export interface AISuggestion {
  id: string;
  type: 'task_optimization' | 'resource_allocation' | 'deadline_adjustment' | 'priority_change';
  title: string;
  description: string;
  confidence: number; // 0-1
  rationale: string;
  suggested_action: any;
  created_at: string;
  is_applied: boolean;
}

export interface AIInsight {
  id: string;
  type: 'performance' | 'bottleneck' | 'opportunity' | 'risk';
  title: string;
  description: string;
  data: any;
  created_at: string;
  severity: 'low' | 'medium' | 'high';
}

// Dashboard data interfaces
export interface DashboardData {
  totalDocuments: number;
  totalTasks: number;
  totalEvents: number;
  recentDocuments: Document[];
  recentTasks: Task[];
  upcomingEvents: Event[];
  taskStatus: {
    pending: number;
    inProgress: number;
    completed: number;
  };
}

export interface Activity {
  id: string;
  type: 'task_created' | 'task_completed' | 'document_uploaded' | 'event_scheduled' | 'comment_added';
  title: string;
  description: string;
  user: string;
  timestamp: string;
  entity_id: string;
  entity_type: 'task' | 'document' | 'event';
}

export interface QuickMetric {
  label: string;
  value: number;
  change: number; // percentage change
  trend: 'up' | 'down' | 'stable';
  color: string;
}

// Search and filter interfaces
export interface SearchFilters {
  query?: string;
  status?: Status[];
  priority?: Priority[];
  assigned_to?: string[];
  created_by?: string[];
  date_range?: {
    start: string;
    end: string;
  };
  tags?: string[];
  document_type?: DocumentType[];
  event_type?: EventType[];
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

// API Response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: SearchResult<T>;
  message?: string;
  error?: string;
}

// Form interfaces
export interface CreateDocumentForm {
  title: string;
  description?: string;
  document_type: DocumentType;
  tags: string[];
  priority: Priority;
  assigned_to?: string[];
  due_date?: string;
  file: File;
}

export interface CreateTaskForm {
  title: string;
  description?: string;
  priority: Priority;
  assigned_to: string[];
  due_date?: string;
  start_date?: string;
  estimated_hours?: number;
  tags: string[];
  related_documents?: string[];
}

export interface CreateEventForm {
  title: string;
  description?: string;
  event_type: EventType;
  start_date: string;
  end_date: string;
  location?: string;
  meeting_link?: string;
  attendees: string[];
  agenda?: string[];
  priority: Priority;
  tags: string[];
}

// Notification interfaces
export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  user_id: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

// Settings interfaces
export interface UserSettings {
  user_id: string;
  language: 'vi' | 'en';
  notifications: {
    email: boolean;
    push: boolean;
    deadline_reminders: boolean;
    task_assignments: boolean;
    document_shares: boolean;
  };
  ai_preferences: {
    auto_suggestions: boolean;
    smart_prioritization: boolean;
    automated_summaries: boolean;
  };
}

// Statistics interfaces
export interface TaskStatistics {
  completion_rate: number;
  average_completion_time: number;
  overdue_rate: number;
  productivity_trend: Array<{
    date: string;
    completed: number;
    created: number;
  }>;
  priority_distribution: Array<{
    priority: Priority;
    count: number;
  }>;
  status_distribution: Array<{
    status: Status;
    count: number;
  }>;
}

export interface DocumentStatistics {
  total_storage_used: number;
  document_type_distribution: Array<{
    type: DocumentType;
    count: number;
  }>;
  monthly_uploads: Array<{
    month: string;
    count: number;
    size_mb: number;
  }>;
  ai_processing_stats: {
    documents_processed: number;
    success_rate: number;
    average_processing_time: number;
  };
} 
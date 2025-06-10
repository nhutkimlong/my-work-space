import { supabase } from '../lib/supabase'

export interface Document {
  id: string
  title: string
  description: string | null
  document_code: string | null  // Số/Ký hiệu văn bản
  issue_date: string | null    // Ngày ban hành
  issuer: string | null        // Cơ quan ban hành
  abstract: string | null      // Trích yếu nội dung
  file_url: string
  file_name: string
  file_size: number
  file_type: string
  document_type: 'công văn' | 'báo cáo' | 'quyết định' | 'thông báo' | 'uploaded' | 'other'
  tags: string[]
  status: 'pending' | 'processing' | 'completed' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  created_at: string
  updated_at: string
  google_drive_id: string | null
  google_drive_url: string | null
  ai_summary: string | null
  ai_keywords: string[]
}

export interface Task {
  id: string
  title: string
  description: string | null
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date: string | null
  start_date: string | null
  completion_date: string | null
  progress: number
  tags: string[]
  created_at: string
  updated_at: string
  document_id: string | null
  attachments: string[]
}

export interface Event {
  id: string
  title: string
  description: string | null
  event_type: 'meeting' | 'deadline' | 'reminder' | 'holiday' | 'training' | 'other'
  start_date: string
  end_date: string
  all_day: boolean
  location: string | null
  meeting_link: string | null
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  tags: string[]
  created_at: string
  updated_at: string
}

class SupabaseService {
  // Documents
  async getDocuments() {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Document[]
  }

  async getDocumentById(id: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .is('is_deleted', false)
      .single()
    
    if (error) throw error
    return data as Document
  }

  async getDocumentsByType(type: Document['document_type']) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('document_type', type)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Document[]
  }

  // Tasks
  async getTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Task[]
  }

  async getTaskById(id: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as Task
  }

  async getTasksByStatus(status: Task['status']) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Task[]
  }

  // Events
  async getEvents() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('start_date', { ascending: true })
    
    if (error) throw error
    return data as Event[]
  }

  async getEventById(id: string) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as Event
  }

  async getEventsByDateRange(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('start_date', startDate)
      .lte('end_date', endDate)
      .order('start_date', { ascending: true })
    
    if (error) throw error
    return data as Event[]
  }

  // Search
  async searchDocuments(query: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Document[]
  }

  async searchTasks(query: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Task[]
  }

  async searchEvents(query: string) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('start_date', { ascending: true })
    
    if (error) throw error
    return data as Event[]
  }

  async createEvent(eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('events')
      .insert([{
        ...eventData,
        organizer: (await supabase.auth.getUser()).data.user?.id
      }])
      .select()
      .single()
    
    if (error) throw error
    return { data, error: null }
  }

  async updateEvent(id: string, eventData: Partial<Event>) {
    const { data, error } = await supabase
      .from('events')
      .update(eventData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return { data, error: null }
  }

  async deleteEvent(id: string) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return { error: null }
  }

  async createTask(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select()
      .single()
    
    if (error) throw error
    return { data, error: null }
  }

  async updateTask(id: string, taskData: Partial<Task>) {
    const { data, error } = await supabase
      .from('tasks')
      .update(taskData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return { data, error: null }
  }

  async deleteTask(id: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return { error: null }
  }

  async createDocument(documentData: Omit<Document, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('documents')
      .insert([{
        ...documentData,
        created_by: (await supabase.auth.getUser()).data.user?.id,
        status: 'pending',
        metadata: {
          processing_status: 'pending',
          ocr_processed: false,
          language: 'vi',
          page_count: 0,
          security_level: 'normal'
        }
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async updateDocument(id: string, updates: Partial<Document>) {
    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async deleteDocument(id: string) {
    const { error } = await supabase
      .from('documents')
      .update({ 
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: (await supabase.auth.getUser()).data.user?.id
      })
      .eq('id', id)
    
    if (error) throw error
    return true
  }

  // Document processing status
  async updateDocumentProcessingStatus(id: string, status: 'pending' | 'processing' | 'completed' | 'failed', error?: string) {
    const { data, error: updateError } = await supabase
      .from('documents')
      .update({
        metadata: {
          processing_status: status,
          processing_error: error || null
        }
      })
      .eq('id', id)
      .select()
      .single()
    
    if (updateError) throw updateError
    return data
  }

  // Document AI processing results
  async updateDocumentAIResults(id: string, results: {
    summary?: string;
    extracted_text?: string;
    keywords?: string[];
    category?: string;
    confidence_score?: number;
  }) {
    const { data, error } = await supabase
      .from('documents')
      .update({
        ai_summary: results.summary,
        ai_extracted_text: results.extracted_text,
        ai_keywords: results.keywords,
        ai_category: results.category,
        ai_confidence_score: results.confidence_score,
        ai_processed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async getDocuments(filters?: {
    type?: string;
    status?: string;
    priority?: string;
    search?: string;
  }) {
    let query = supabase
      .from('documents')
      .select('*')
      .is('is_deleted', false)
      .order('created_at', { ascending: false })

    if (filters?.type) {
      query = query.eq('document_type', filters.type)
    }
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority)
    }
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  }
}

export const supabaseService = new SupabaseService() 
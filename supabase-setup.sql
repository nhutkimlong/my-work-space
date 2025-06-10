-- =====================================================
-- SUPABASE DATABASE SETUP SCRIPT
-- Quan ly Cong viec So (Government Digital Assistant)
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search optimization

-- =====================================================
-- ENUMS
-- =====================================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'manager', 'employee', 'viewer');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type') THEN
        CREATE TYPE document_type AS ENUM ('công văn', 'báo cáo', 'quyết định', 'thông báo', 'uploaded', 'other');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_status') THEN
        CREATE TYPE document_status AS ENUM ('pending', 'processing', 'completed', 'archived');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority_level') THEN
        CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
        CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled', 'on_hold');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_type') THEN
        CREATE TYPE event_type AS ENUM ('meeting', 'deadline', 'reminder', 'holiday', 'training', 'other');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_status') THEN
        CREATE TYPE event_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error', 'task', 'document', 'event');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'entity_type') THEN
        CREATE TYPE entity_type AS ENUM ('document', 'task', 'event', 'profile', 'system');
    END IF;
END $$;

-- =====================================================
-- PROFILES TABLE (extends auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role user_role DEFAULT 'employee',
  department TEXT,
  position TEXT,
  phone TEXT,
  address TEXT,
  bio TEXT,
  email TEXT UNIQUE,
  settings JSONB DEFAULT '{
    "theme": "light",
    "notifications": {
      "email": true,
      "push": true,
      "desktop": true
    },
    "language": "vi",
    "timezone": "Asia/Ho_Chi_Minh"
  }',
  last_active_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- DOCUMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  document_type document_type DEFAULT 'other',
  tags TEXT[] DEFAULT '{}',
  status document_status DEFAULT 'pending',
  priority priority_level DEFAULT 'medium',
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  assigned_to UUID[] DEFAULT '{}',
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- AI Processing fields
  ai_summary TEXT,
  ai_extracted_text TEXT,
  ai_keywords TEXT[] DEFAULT '{}',
  ai_category TEXT,
  ai_confidence_score FLOAT,
  ai_processed_at TIMESTAMP WITH TIME ZONE,
  
  -- Google Drive integration
  google_drive_id TEXT UNIQUE,
  google_drive_url TEXT,
  google_drive_version INTEGER DEFAULT 1,
  
  -- Version control
  version INTEGER DEFAULT 1,
  previous_versions JSONB DEFAULT '[]',
  
  -- Metadata
  metadata JSONB DEFAULT '{
    "processing_status": "pending",
    "ocr_processed": false,
    "language": "vi",
    "page_count": 0,
    "security_level": "normal"
  }',
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id)
);

-- =====================================================
-- TASKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'pending',
  priority priority_level DEFAULT 'medium',
  assigned_to UUID[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  start_date TIMESTAMP WITH TIME ZONE,
  completion_date TIMESTAMP WITH TIME ZONE,
  estimated_hours INTEGER,
  actual_hours INTEGER,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Relations
  parent_task_id UUID REFERENCES public.tasks(id),
  document_id UUID REFERENCES public.documents(id),
  
  -- Dependencies
  dependencies UUID[] DEFAULT '{}',
  blockers UUID[] DEFAULT '{}',
  
  -- AI suggestions
  ai_suggestions JSONB DEFAULT '{
    "priority": null,
    "estimated_time": null,
    "similar_tasks": [],
    "recommended_assignees": []
  }',
  ai_priority_score FLOAT,
  
  -- Metadata
  metadata JSONB DEFAULT '{
    "complexity": "medium",
    "risk_level": "low",
    "checklist": [],
    "attachments": []
  }',
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id)
);

-- =====================================================
-- EVENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_type event_type NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  all_day BOOLEAN DEFAULT FALSE,
  location TEXT,
  meeting_link TEXT,
  attendees UUID[] DEFAULT '{}',
  organizer UUID REFERENCES auth.users(id) NOT NULL,
  agenda TEXT[] DEFAULT '{}',
  status event_status DEFAULT 'pending',
  priority priority_level DEFAULT 'medium',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Recurrence
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule JSONB DEFAULT '{
    "frequency": null,
    "interval": 1,
    "end_date": null,
    "exceptions": []
  }',
  
  -- Relations
  document_id UUID REFERENCES public.documents(id),
  task_id UUID REFERENCES public.tasks(id),
  
  -- Metadata
  metadata JSONB DEFAULT '{
    "meeting_type": "online",
    "required_attendees": [],
    "optional_attendees": [],
    "resources": []
  }',
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  CONSTRAINT valid_date_range CHECK (start_date <= end_date)
);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type notification_type DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Relations
  document_id UUID REFERENCES public.documents(id),
  task_id UUID REFERENCES public.tasks(id),
  event_id UUID REFERENCES public.events(id),
  
  -- Metadata
  metadata JSONB DEFAULT '{
    "importance": "normal",
    "category": "system",
    "expires_at": null
  }'
);

-- =====================================================
-- ACTIVITY LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  action TEXT NOT NULL,
  entity_type entity_type NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Additional context
  context JSONB DEFAULT '{
    "browser": null,
    "os": null,
    "device": null,
    "location": null
  }'
);

-- =====================================================
-- COMMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  entity_type entity_type NOT NULL,
  entity_id UUID NOT NULL,
  parent_id UUID REFERENCES public.comments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  metadata JSONB DEFAULT '{
    "mentions": [],
    "attachments": []
  }'
);

-- =====================================================
-- APP SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Profiles policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can view all profiles'
    ) THEN
        CREATE POLICY "Users can view all profiles" ON public.profiles
            FOR SELECT USING (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile" ON public.profiles
            FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can insert own profile'
    ) THEN
        CREATE POLICY "Users can insert own profile" ON public.profiles
            FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- Documents policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'documents' 
        AND policyname = 'Users can view all documents'
    ) THEN
        CREATE POLICY "Users can view all documents" ON public.documents
            FOR SELECT USING (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'documents' 
        AND policyname = 'Users can create documents'
    ) THEN
        CREATE POLICY "Users can create documents" ON public.documents
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'documents' 
        AND policyname = 'Users can update own documents'
    ) THEN
        CREATE POLICY "Users can update own documents" ON public.documents
            FOR UPDATE USING (auth.uid() = created_by);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'documents' 
        AND policyname = 'Users can delete own documents'
    ) THEN
        CREATE POLICY "Users can delete own documents" ON public.documents
            FOR DELETE USING (auth.uid() = created_by);
    END IF;
END $$;

-- Tasks policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'tasks' 
        AND policyname = 'Users can view all tasks'
    ) THEN
        CREATE POLICY "Users can view all tasks" ON public.tasks
            FOR SELECT USING (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'tasks' 
        AND policyname = 'Users can create tasks'
    ) THEN
        CREATE POLICY "Users can create tasks" ON public.tasks
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'tasks' 
        AND policyname = 'Users can update own tasks'
    ) THEN
        CREATE POLICY "Users can update own tasks" ON public.tasks
            FOR UPDATE USING (auth.uid() = created_by);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'tasks' 
        AND policyname = 'Users can delete own tasks'
    ) THEN
        CREATE POLICY "Users can delete own tasks" ON public.tasks
            FOR DELETE USING (auth.uid() = created_by);
    END IF;
END $$;

-- Events policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'events' 
        AND policyname = 'Users can view all events'
    ) THEN
        CREATE POLICY "Users can view all events" ON public.events
            FOR SELECT USING (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'events' 
        AND policyname = 'Users can create events'
    ) THEN
        CREATE POLICY "Users can create events" ON public.events
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'events' 
        AND policyname = 'Users can update own events'
    ) THEN
        CREATE POLICY "Users can update own events" ON public.events
            FOR UPDATE USING (auth.uid() = organizer);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'events' 
        AND policyname = 'Users can delete own events'
    ) THEN
        CREATE POLICY "Users can delete own events" ON public.events
            FOR DELETE USING (auth.uid() = organizer);
    END IF;
END $$;

-- Notifications policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' 
        AND policyname = 'Users can view own notifications'
    ) THEN
        CREATE POLICY "Users can view own notifications" ON public.notifications
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' 
        AND policyname = 'Users can update own notifications'
    ) THEN
        CREATE POLICY "Users can update own notifications" ON public.notifications
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Activity logs policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'activity_logs' 
        AND policyname = 'Users can view all activity logs'
    ) THEN
        CREATE POLICY "Users can view all activity logs" ON public.activity_logs
            FOR SELECT USING (true);
    END IF;
END $$;

-- Comments policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'comments' 
        AND policyname = 'Users can view all comments'
    ) THEN
        CREATE POLICY "Users can view all comments" ON public.comments
            FOR SELECT USING (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'comments' 
        AND policyname = 'Users can create comments'
    ) THEN
        CREATE POLICY "Users can create comments" ON public.comments
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'comments' 
        AND policyname = 'Users can update own comments'
    ) THEN
        CREATE POLICY "Users can update own comments" ON public.comments
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'comments' 
        AND policyname = 'Users can delete own comments'
    ) THEN
        CREATE POLICY "Users can delete own comments" ON public.comments
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- App settings policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'app_settings' 
        AND policyname = 'Allow public read access to app settings'
    ) THEN
        CREATE POLICY "Allow public read access to app settings" ON public.app_settings
            FOR SELECT USING (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'app_settings' 
        AND policyname = 'Allow public access to theme settings'
    ) THEN
        CREATE POLICY "Allow public access to theme settings" ON public.app_settings
            FOR ALL USING (key = 'vite-ui-theme' OR key = 'government-assistant-theme');
    END IF;
END $$;

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to handle soft delete
CREATE OR REPLACE FUNCTION handle_soft_delete()
RETURNS TRIGGER AS $$
BEGIN
  NEW.is_deleted = TRUE;
  NEW.deleted_at = NOW();
  NEW.deleted_by = auth.uid();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to create user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.activity_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values,
    ip_address,
    user_agent
  )
  VALUES (
    auth.uid(),
    TG_OP,
    TG_ARGV[0],
    NEW.id,
    CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    current_setting('request.headers', true)::json->>'x-forwarded-for',
    current_setting('request.headers', true)::json->>'user-agent'
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Function for safe SQL execution (for SQL editor)
CREATE OR REPLACE FUNCTION public.execute_sql(sql_query TEXT)
RETURNS SETOF JSONB AS $$
DECLARE
  rec RECORD;
BEGIN
  -- Security check: only allow SELECT statements
  IF UPPER(TRIM(sql_query)) NOT LIKE 'SELECT%' AND UPPER(TRIM(sql_query)) NOT LIKE 'WITH%' THEN
    RAISE EXCEPTION 'Only SELECT and WITH statements are allowed';
  END IF;
  
  -- Execute the query and return as JSONB
  FOR rec IN EXECUTE sql_query LOOP
    RETURN NEXT to_jsonb(rec);
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Updated at triggers
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_profiles_updated_at'
    ) THEN
        CREATE TRIGGER update_profiles_updated_at 
            BEFORE UPDATE ON public.profiles 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_documents_updated_at'
    ) THEN
        CREATE TRIGGER update_documents_updated_at 
            BEFORE UPDATE ON public.documents 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_tasks_updated_at'
    ) THEN
        CREATE TRIGGER update_tasks_updated_at 
            BEFORE UPDATE ON public.tasks 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_events_updated_at'
    ) THEN
        CREATE TRIGGER update_events_updated_at 
            BEFORE UPDATE ON public.events 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_comments_updated_at'
    ) THEN
        CREATE TRIGGER update_comments_updated_at 
            BEFORE UPDATE ON public.comments 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Soft delete triggers
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'soft_delete_document'
    ) THEN
        CREATE TRIGGER soft_delete_document 
            BEFORE DELETE ON public.documents
            FOR EACH ROW EXECUTE FUNCTION handle_soft_delete();
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'soft_delete_task'
    ) THEN
        CREATE TRIGGER soft_delete_task 
            BEFORE DELETE ON public.tasks
            FOR EACH ROW EXECUTE FUNCTION handle_soft_delete();
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'soft_delete_event'
    ) THEN
        CREATE TRIGGER soft_delete_event 
            BEFORE DELETE ON public.events
            FOR EACH ROW EXECUTE FUNCTION handle_soft_delete();
    END IF;
END $$;

-- Auth triggers
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'on_auth_user_created'
    ) THEN
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$;

-- Activity log triggers
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'log_document_activity'
    ) THEN
        CREATE TRIGGER log_document_activity
            AFTER INSERT OR UPDATE OR DELETE ON public.documents
            FOR EACH ROW EXECUTE FUNCTION log_activity('document');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'log_task_activity'
    ) THEN
        CREATE TRIGGER log_task_activity
            AFTER INSERT OR UPDATE OR DELETE ON public.tasks
            FOR EACH ROW EXECUTE FUNCTION log_activity('task');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'log_event_activity'
    ) THEN
        CREATE TRIGGER log_event_activity
            AFTER INSERT OR UPDATE OR DELETE ON public.events
            FOR EACH ROW EXECUTE FUNCTION log_activity('event');
    END IF;
END $$;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON public.profiles(department);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON public.profiles(last_active_at DESC);

-- Documents indexes
CREATE INDEX IF NOT EXISTS idx_documents_created_by ON public.documents(created_by);
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON public.documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_priority ON public.documents(priority);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_due_date ON public.documents(due_date);
CREATE INDEX IF NOT EXISTS idx_documents_google_drive_id ON public.documents(google_drive_id);
CREATE INDEX IF NOT EXISTS idx_documents_assigned_to ON public.documents USING GIN(assigned_to);
CREATE INDEX IF NOT EXISTS idx_documents_tags ON public.documents USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_documents_ai_keywords ON public.documents USING GIN(ai_keywords);
CREATE INDEX IF NOT EXISTS idx_documents_text_search ON public.documents USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(ai_extracted_text, '')));
CREATE INDEX IF NOT EXISTS idx_documents_is_deleted ON public.documents(is_deleted);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON public.tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks USING GIN(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id ON public.tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_document_id ON public.tasks(document_id);
CREATE INDEX IF NOT EXISTS idx_tasks_dependencies ON public.tasks USING GIN(dependencies);
CREATE INDEX IF NOT EXISTS idx_tasks_blockers ON public.tasks USING GIN(blockers);
CREATE INDEX IF NOT EXISTS idx_tasks_is_deleted ON public.tasks(is_deleted);

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_organizer ON public.events(organizer);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON public.events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_attendees ON public.events USING GIN(attendees);
CREATE INDEX IF NOT EXISTS idx_events_is_deleted ON public.events(is_deleted);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- Activity logs indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON public.activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_entity ON public.comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_is_deleted ON public.comments(is_deleted);

-- App settings indexes
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON public.app_settings(key);

-- =====================================================
-- GRANTS AND PERMISSIONS
-- =====================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant permissions on sequences
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.execute_sql(TEXT) TO authenticated;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE 'Supabase database setup completed successfully!';
  RAISE NOTICE 'You can now:';
  RAISE NOTICE '1. Configure your environment variables';
  RAISE NOTICE '2. Deploy your Netlify Functions';
  RAISE NOTICE '3. Start using the SQL Editor';
  RAISE NOTICE '4. Upload documents with AI processing';
END $$; 
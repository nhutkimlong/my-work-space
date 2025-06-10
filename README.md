# 🏛️ Trợ lý Công vụ số (Government Digital Assistant)

Hệ thống quản lý công việc thông minh với AI cho cơ quan nhà nước, được xây dựng với React, TypeScript, và tích hợp đầy đủ các tính năng AI tiên tiến.

## ✨ Tính năng chính

### 🤖 AI-Powered Features
- **AI Document Processing**: OCR, tóm tắt tự động, phân loại tài liệu
- **Smart Task Management**: Gợi ý ưu tiên, tối ưu hóa workflow
- **Intelligent Scheduling**: Đề xuất thời gian họp tối ưu
- **Predictive Analytics**: Dự đoán rủi ro deadline, phân tích hiệu suất
- **Auto-categorization**: Phân loại tự động tài liệu và công việc

### 📋 Core Modules
- **Dashboard Analytics**: Tổng quan thông minh với insights AI
- **Document Management**: Quản lý tài liệu với Google Drive sync
- **Task Management**: Hệ thống công việc với time tracking
- **Event Management**: Quản lý sự kiện và lịch họp
- **Real-time Collaboration**: Cộng tác trực tuyến

### 🔧 Technical Features
- **Modern Stack**: React 18, TypeScript, Vite
- **UI Components**: Shadcn/UI với Tailwind CSS
- **State Management**: React Query cho server state
- **Real-time Updates**: Server-Sent Events
- **Progressive Web App**: Offline support
- **Responsive Design**: Mobile-first approach

## 🏗️ Kiến trúc hệ thống

```
src/
├── components/           # UI Components
│   ├── ui/              # Base UI components (shadcn/ui)
│   └── layout/          # Layout components
├── pages/               # Page components
├── hooks/               # Custom React hooks
├── services/            # API service classes
├── lib/                 # Utilities and configurations
├── types/               # TypeScript type definitions
└── assets/              # Static assets
```

### 🔗 Backend Architecture

```
Backend (Netlify Functions + Supabase)
├── Authentication       # Supabase Auth
├── Database            # PostgreSQL with RLS
├── File Storage        # Supabase Storage + Google Drive
├── AI Processing       # Google Gemini API
├── Real-time Updates   # Supabase Realtime
└── API Functions       # Netlify Functions
```

## 🚀 Cài đặt và Setup

### Prerequisites
- Node.js 18+ 
- Bun hoặc npm
- Supabase account
- Google Cloud Platform account
- Netlify account

### 1. Clone repository
```bash
git clone https://github.com/your-org/quan-ly-cong-viec-so.git
cd quan-ly-cong-viec-so
```

### 2. Install dependencies
```bash
bun install
# hoặc
npm install
```

### 3. Environment setup
Tạo file `.env.local` với nội dung:

```env
# API Configuration
VITE_API_BASE_URL=/.netlify/functions
VITE_APP_URL=http://localhost:5173

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google API Configuration  
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_API_KEY=your_google_api_key

# AI Services Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key

# Feature Flags
VITE_ENABLE_AI_PROCESSING=true
VITE_ENABLE_GOOGLE_DRIVE_SYNC=true
VITE_ENABLE_REAL_TIME_UPDATES=true
```

### 4. Database setup (Supabase)

1. Tạo project mới trên [Supabase](https://supabase.com)
2. Chạy migration scripts:

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'employee',
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table
CREATE TABLE public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  document_type TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  created_by UUID REFERENCES auth.users NOT NULL,
  assigned_to UUID[] DEFAULT '{}',
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ai_summary TEXT,
  ai_extracted_text TEXT,
  ai_keywords TEXT[] DEFAULT '{}',
  google_drive_id TEXT
);

-- Tasks table
CREATE TABLE public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  assigned_to UUID[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  start_date TIMESTAMP WITH TIME ZONE,
  estimated_hours INTEGER,
  actual_hours INTEGER,
  progress INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  meeting_link TEXT,
  attendees UUID[] DEFAULT '{}',
  organizer UUID REFERENCES auth.users NOT NULL,
  agenda TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policies (example)
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
```

### 5. Google Cloud Platform setup

1. Tạo project mới trên [Google Cloud Console](https://console.cloud.google.com)
2. Enable APIs:
   - Google Drive API
   - Google Gemini API
   - Google Calendar API (optional)
3. Tạo credentials (OAuth 2.0 và API key)
4. Configure OAuth consent screen

### 6. Netlify Functions setup

Tạo thư mục `netlify/functions/` và implement API endpoints theo Master Prompt.

### 7. Development server

```bash
bun dev
# hoặc
npm run dev
```

## 📝 API Documentation

### Document Service
- `GET /documents` - Lấy danh sách tài liệu
- `POST /documents` - Tạo tài liệu mới
- `PUT /documents/:id` - Cập nhật tài liệu
- `DELETE /documents/:id` - Xóa tài liệu
- `POST /documents/:id/ai-process` - Xử lý AI
- `POST /documents/ai-search` - Tìm kiếm AI

### Task Service
- `GET /tasks` - Lấy danh sách công việc
- `POST /tasks` - Tạo công việc mới
- `GET /tasks/:id/ai-suggestions` - Gợi ý AI
- `POST /tasks/ai-generate` - Tạo task từ mô tả

### Event Service
- `GET /events` - Lấy danh sách sự kiện
- `POST /events` - Tạo sự kiện mới
- `POST /events/:id/ai-summary` - Tóm tắt AI
- `POST /events/ai-smart-scheduling` - Lập lịch thông minh

### Dashboard Service
- `GET /dashboard` - Dữ liệu dashboard
- `GET /dashboard/ai-insights` - Insights AI
- `GET /dashboard/predictive-analytics` - Phân tích dự đoán

## 🔧 Configuration

### Feature Flags
Bạn có thể bật/tắt các tính năng thông qua environment variables:

```env
VITE_ENABLE_AI_PROCESSING=true      # AI processing features
VITE_ENABLE_GOOGLE_DRIVE_SYNC=true  # Google Drive integration
VITE_ENABLE_REAL_TIME_UPDATES=true  # Real-time updates
VITE_ENABLE_ADVANCED_ANALYTICS=true # Advanced analytics
```

### Theme Customization
Customize theme trong `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      // Government color scheme
      primary: {
        50: '#eff6ff',
        500: '#3b82f6',
        900: '#1e3a8a',
      }
    }
  }
}
```

## 🧪 Testing

```bash
# Unit tests
bun test

# E2E tests
bun test:e2e

# Coverage
bun test:coverage
```

## 📦 Build và Deploy

### Development build
```bash
bun build:dev
```

### Production build
```bash
bun build
```

### Deploy to Netlify
```bash
# Auto-deploy từ main branch
git push origin main

# Manual deploy
netlify deploy --prod
```

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👥 Team

- **Frontend Team**: React, TypeScript, UI/UX
- **Backend Team**: Supabase, Netlify Functions
- **AI Team**: Google Gemini integration
- **DevOps Team**: Deployment, monitoring

## 📞 Support

- 📧 Email: support@government-assistant.com
- 📱 Hotline: 1900-xxx-xxx
- 💬 Discord: [Join our community](https://discord.gg/xxx)
- 📖 Documentation: [Full docs](https://docs.government-assistant.com)

---

**Made with ❤️ for Vietnamese Government Digital Transformation**
# 🚀 Hướng dẫn Setup Dự án Quản lý Công việc Số

## 📋 Tổng quan

Dự án này sử dụng kiến trúc hiện đại với:
- **Frontend**: React + TypeScript + Vite + Shadcn/UI
- **Backend**: Netlify Functions (TypeScript)
- **Database**: Supabase (PostgreSQL)
- **File Storage**: Google Drive
- **AI Engine**: Google Gemini API
- **Deployment**: Netlify

## 🛠️ Cài đặt từ đầu

### 1. Clone và cài đặt dependencies

```bash
git clone https://github.com/your-org/quan-ly-cong-viec-so.git
cd quan-ly-cong-viec-so

# Cài đặt dependencies cho frontend
npm install

# Cài đặt dependencies cho Netlify Functions
cd netlify/functions
npm install
cd ../..
```

### 2. Setup Supabase

1. **Tạo project Supabase mới:**
   - Đi tới [Supabase](https://supabase.com)
   - Tạo project mới
   - Lưu lại URL và anon key

2. **Chạy script setup database:**
   - Mở SQL Editor trong Supabase Dashboard
   - Copy toàn bộ nội dung file `supabase-setup.sql`
   - Paste và chạy script

3. **Lấy Service Role Key:**
   - Đi tới Project Settings > API
   - Copy `service_role` key (cần cho Netlify Functions)

### 3. Setup Google Cloud Platform

#### 3.1 Tạo Service Account

```bash
# 1. Tạo project mới hoặc chọn project có sẵn
gcloud projects create your-project-id

# 2. Enable APIs
gcloud services enable drive.googleapis.com
gcloud services enable generativelanguage.googleapis.com

# 3. Tạo service account
gcloud iam service-accounts create govt-digital-assistant \
    --description="Service account for Government Digital Assistant" \
    --display-name="Government Digital Assistant"

# 4. Download key file
gcloud iam service-accounts keys create credentials.json \
    --iam-account=govt-digital-assistant@your-project-id.iam.gserviceaccount.com
```

#### 3.2 Cấp quyền Google Drive

1. Đi tới [Google Drive](https://drive.google.com)
2. Tạo folder cho project
3. Share folder với service account email
4. Cấp quyền Editor

### 4. Setup Google Gemini API

1. Đi tới [Google AI Studio](https://aistudio.google.com)
2. Tạo API key mới
3. Lưu lại API key

### 5. Environment Variables

Tạo file `.env.local` từ `env.example`:

```bash
cp env.example .env.local
```

Điền các thông tin:

```env
# Frontend Environment Variables
VITE_API_BASE_URL=/.netlify/functions
VITE_APP_URL=http://localhost:5173

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
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

# Backend Environment Variables (Netlify Functions)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Service Account
GOOGLE_SERVICE_ACCOUNT_EMAIL=govt-digital-assistant@your-project-id.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"
GOOGLE_PROJECT_ID=your-project-id

# Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Optional: Google Drive Folder ID
GOOGLE_DRIVE_FOLDER_ID=your_drive_folder_id
```

### 6. Development

```bash
# Chạy development server
npm run dev

# Chạy với Netlify Dev (để test Functions)
npx netlify dev
```

### 7. Deployment trên Netlify

#### 7.1 Deploy lần đầu

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy

# Deploy production
netlify deploy --prod
```

#### 7.2 Cấu hình Environment Variables trên Netlify

1. Đi tới Netlify Dashboard
2. Chọn site của bạn
3. Site Settings > Environment Variables
4. Thêm tất cả environment variables từ `.env.local`

## 🔧 API Endpoints

### Documents API
- `POST /.netlify/functions/documents-upload` - Upload và xử lý document với AI
- `GET /.netlify/functions/documents-read` - Lấy danh sách documents
- `DELETE /.netlify/functions/documents-delete` - Xóa document

### SQL Editor
- `POST /.netlify/functions/sql-query` - Thực thi SQL query an toàn

## 📊 Sử dụng SQL Editor

1. Đi tới `/sql-editor` trong ứng dụng
2. Viết SQL query (chỉ cho phép SELECT)
3. Click Execute để chạy
4. Xem kết quả và export CSV nếu cần

### Các query mẫu:

```sql
-- Xem tất cả documents
SELECT * FROM documents ORDER BY created_at DESC LIMIT 20;

-- Thống kê documents theo loại
SELECT 
  document_type,
  COUNT(*) as total,
  AVG(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) * 100 as completion_rate
FROM documents 
GROUP BY document_type;

-- Documents đã được AI xử lý
SELECT 
  title,
  ai_summary,
  ai_keywords,
  ai_confidence_score
FROM documents 
WHERE ai_summary IS NOT NULL;
```

## 🤖 Tính năng AI

### 1. OCR từ Google Drive
- Upload hình ảnh lên Google Drive
- Gemini AI tự động trích xuất text
- Tóm tắt nội dung
- Tạo keywords

### 2. Phân tích Document
- Phân loại tự động
- Đánh giá độ ưu tiên
- Đề xuất tags
- Gợi ý hành động

### 3. Tối ưu hóa Workflow
- Phân tích hiệu suất
- Đề xuất cải thiện
- Dự đoán deadline

## 🔒 Bảo mật

- Row Level Security (RLS) trên Supabase
- Chỉ cho phép SELECT trong SQL Editor
- Service Account cho Google APIs
- CORS được cấu hình đúng

## 🐛 Troubleshooting

### Lỗi thường gặp:

1. **Netlify Functions không hoạt động:**
   ```bash
   # Kiểm tra dependencies
   cd netlify/functions && npm install
   ```

2. **Google Drive API lỗi:**
   - Kiểm tra service account có quyền
   - Verify private key format (có `\n` chưa)

3. **Supabase connection lỗi:**
   - Kiểm tra URL và keys
   - Verify RLS policies

4. **Gemini API lỗi:**
   - Kiểm tra API key
   - Verify billing account

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy:
1. Kiểm tra logs trong Netlify Functions
2. Xem Network tab trong DevTools
3. Kiểm tra Supabase logs
4. Tạo issue trên GitHub

## 🚀 Next Steps

1. Tích hợp thêm Google Calendar
2. Thêm tính năng chat với AI
3. Báo cáo và analytics nâng cao
4. Mobile app với React Native
5. Notifications qua email/SMS 
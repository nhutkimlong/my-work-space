// Application constants
export const APP_CONFIG = {
  NAME: 'Trợ lý Công vụ số',
  VERSION: '1.0.0',
  DESCRIPTION: 'Hệ thống quản lý công việc thông minh với AI',
  AUTHOR: 'Government Digital Assistant Team',
} as const;

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '/.netlify/functions',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const;

// File upload constraints
export const FILE_UPLOAD = {
  MAX_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp',
  ],
  SUPPORTED_EXTENSIONS: [
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', 
    '.ppt', '.pptx', '.txt', '.jpg', '.jpeg', 
    '.png', '.gif', '.bmp', '.webp'
  ],
} as const;

// Status and priority options
export const STATUS_OPTIONS = [
  { value: 'pending', label: 'Đang chờ', color: 'warning' },
  { value: 'in_progress', label: 'Đang thực hiện', color: 'info' },
  { value: 'completed', label: 'Hoàn thành', color: 'success' },
  { value: 'cancelled', label: 'Đã hủy', color: 'secondary' },
  { value: 'overdue', label: 'Quá hạn', color: 'destructive' },
] as const;

export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Thấp', color: 'secondary' },
  { value: 'medium', label: 'Trung bình', color: 'warning' },
  { value: 'high', label: 'Cao', color: 'info' },
  { value: 'urgent', label: 'Khẩn cấp', color: 'destructive' },
] as const;

export const DOCUMENT_TYPE_OPTIONS = [
  { value: 'internal', label: 'Nội bộ', icon: 'Building' },
  { value: 'external', label: 'Bên ngoài', icon: 'Globe' },
  { value: 'template', label: 'Mẫu', icon: 'Template' },
  { value: 'report', label: 'Báo cáo', icon: 'FileText' },
  { value: 'contract', label: 'Hợp đồng', icon: 'FileContract' },
] as const;

export const EVENT_TYPE_OPTIONS = [
  { value: 'meeting', label: 'Họp', icon: 'Users' },
  { value: 'deadline', label: 'Hạn chót', icon: 'Clock' },
  { value: 'conference', label: 'Hội nghị', icon: 'Presentation' },
  { value: 'training', label: 'Đào tạo', icon: 'GraduationCap' },
  { value: 'other', label: 'Khác', icon: 'Calendar' },
] as const;

// Date and time formats
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  DISPLAY_WITH_TIME: 'dd/MM/yyyy HH:mm',
  API: 'yyyy-MM-dd',
  API_WITH_TIME: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  MONTH_YEAR: 'MM/yyyy',
  TIME_ONLY: 'HH:mm',
} as const;

// Notification settings
export const NOTIFICATION_CONFIG = {
  DURATION: {
    SUCCESS: 3000,
    ERROR: 5000,
    WARNING: 4000,
    INFO: 3000,
  },
  MAX_NOTIFICATIONS: 5,
  AUTO_DISMISS: true,
} as const;

// Cache settings
export const CACHE_CONFIG = {
  STALE_TIME: {
    SHORT: 1000 * 60 * 2, // 2 minutes
    MEDIUM: 1000 * 60 * 5, // 5 minutes
    LONG: 1000 * 60 * 15, // 15 minutes
    VERY_LONG: 1000 * 60 * 60, // 1 hour
  },
  GC_TIME: 1000 * 60 * 60 * 24, // 24 hours
} as const;

// AI Configuration
export const AI_CONFIG = {
  PROCESSING_TIMEOUT: 60000, // 60 seconds
  CONFIDENCE_THRESHOLD: 0.7,
  MAX_SUGGESTIONS: 5,
  SUPPORTED_LANGUAGES: ['vi', 'en'],
  OCR_CONFIDENCE_THRESHOLD: 0.8,
} as const;

// Feature flags
export const FEATURES = {
  AI_PROCESSING: true,
  GOOGLE_DRIVE_SYNC: true,
  REAL_TIME_UPDATES: true,
  ADVANCED_ANALYTICS: true,
  CUSTOM_WIDGETS: true,
  BULK_OPERATIONS: true,
  COLLABORATION: true,
  NOTIFICATIONS: true,
  EXPORT_IMPORT: true,
} as const;

// Route paths
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/',
  DOCUMENTS: '/documents',
  DOCUMENT_DETAIL: '/documents/:id',
  TASKS: '/tasks',
  TASK_DETAIL: '/tasks/:id',
  EVENTS: '/events',
  EVENT_DETAIL: '/events/:id',
  SQL_EDITOR: '/sql-editor',
  NOT_FOUND: '/404',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'government-assistant-preferences',
  DASHBOARD_CONFIG: 'government-assistant-dashboard-config',
  SEARCH_HISTORY: 'government-assistant-search-history',
  RECENT_ITEMS: 'government-assistant-recent-items',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.',
  SERVER_ERROR: 'Lỗi máy chủ. Vui lòng thử lại sau.',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
  UNAUTHORIZED: 'Bạn không có quyền truy cập tính năng này.',
  FORBIDDEN: 'Truy cập bị từ chối.',
  NOT_FOUND: 'Không tìm thấy tài nguyên yêu cầu.',
  FILE_TOO_LARGE: 'Tệp quá lớn. Kích thước tối đa cho phép là 50MB.',
  INVALID_FILE_TYPE: 'Loại tệp không được hỗ trợ.',
  PROCESSING_ERROR: 'Có lỗi xảy ra trong quá trình xử lý.',
  AI_PROCESSING_ERROR: 'Lỗi xử lý AI. Vui lòng thử lại sau.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  CREATED: 'Tạo thành công!',
  UPDATED: 'Cập nhật thành công!',
  DELETED: 'Xóa thành công!',
  SAVED: 'Lưu thành công!',
  UPLOADED: 'Tải lên thành công!',
  SHARED: 'Chia sẻ thành công!',
  EXPORTED: 'Xuất dữ liệu thành công!',
  IMPORTED: 'Nhập dữ liệu thành công!',
  SYNCHRONIZED: 'Đồng bộ thành công!',
  AI_PROCESSED: 'Xử lý AI hoàn tất!',
} as const;

// Validation rules
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_TITLE_LENGTH: 255,
  MAX_DESCRIPTION_LENGTH: 2000,
  MAX_COMMENT_LENGTH: 1000,
  MIN_SEARCH_QUERY_LENGTH: 2,
  MAX_TAGS: 10,
  MAX_ATTACHMENTS: 10,
} as const;

// Dashboard widget types
export const WIDGET_TYPES = [
  { value: 'chart', label: 'Biểu đồ', icon: 'BarChart' },
  { value: 'metric', label: 'Chỉ số', icon: 'Activity' },
  { value: 'list', label: 'Danh sách', icon: 'List' },
  { value: 'calendar', label: 'Lịch', icon: 'Calendar' },
  { value: 'progress', label: 'Tiến độ', icon: 'ProgressBar' },
] as const;

// Chart colors - Aligned with src/index.css theme variables
export const CHART_COLORS = {
  // Converted from HSL variables in src/index.css for JS consumption
  PRIMARY: 'hsl(221 83% 53%)', // --primary: 29 78 216 -> Blue-700
  SUCCESS: 'hsl(142 64% 42%)', // A suitable green for success states
  WARNING: 'hsl(24 95% 53%)', // Orange color instead of yellow for warnings
  DESTRUCTIVE: 'hsl(0 84% 60%)', // --destructive: 220 38 38 -> Red-600 (using a slightly brighter red for charts)
  INFO: 'hsl(195 82% 52%)', // A suitable cyan for info
  SECONDARY: 'hsl(215 14% 34%)', // A suitable gray for secondary data
  
  // Gradient palette for multi-series charts
  GRADIENT: [
    'hsl(221 83% 53%)', // Primary
    'hsl(142 64% 42%)', // Success
    'hsl(195 82% 52%)', // Info
    'hsl(262 82% 62%)', // A vibrant purple
    'hsl(330 82% 62%)', // A vibrant pink
    'hsl(28 92% 62%)', // A vibrant orange
  ],
} as const;

// Animation settings
export const ANIMATION = {
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  EASING: {
    EASE_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
    EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// Responsive breakpoints
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const; 
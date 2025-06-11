# Quản Lý Công Việc Số

Ứng dụng quản lý công việc số hiện đại, được xây dựng với React, TypeScript và các công nghệ web hiện đại.

## Tính năng chính

- Quản lý tài liệu và công việc
- Giao diện người dùng hiện đại và thân thiện
- Tích hợp AI để phân tích và xử lý dữ liệu
- Đồng bộ hóa với Google Drive
- Quản lý deadline và thông báo
- Phân tích và báo cáo

## Công nghệ sử dụng

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI
- React Query
- React Router
- Zustand
- Framer Motion

## Yêu cầu hệ thống

- Node.js 18.0.0 trở lên
- npm 9.0.0 trở lên

## Cài đặt

1. Clone repository:
```bash
git clone [repository-url]
cd quan-ly-cong-viec-so
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file môi trường:
```bash
cp .env.example .env
```

4. Chạy ứng dụng ở môi trường development:
```bash
npm run dev
```

## Cấu trúc dự án

```
src/
  ├── components/     # React components
  ├── pages/         # Page components
  ├── services/      # API services
  ├── hooks/         # Custom hooks
  ├── lib/           # Utility functions
  ├── types/         # TypeScript types
  └── styles/        # Global styles
```

## Scripts

- `npm run dev`: Chạy ứng dụng ở môi trường development
- `npm run build`: Build ứng dụng cho production
- `npm run preview`: Preview bản build
- `npm run lint`: Kiểm tra lỗi code

## Đóng góp

Mọi đóng góp đều được hoan nghênh! Vui lòng đọc [CONTRIBUTING.md](CONTRIBUTING.md) để biết thêm chi tiết.

## Giấy phép

Dự án này được cấp phép theo [MIT License](LICENSE).
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Event, Document } from "@/types";
import { Badge } from "@/components/ui/badge";
import ReactSelect from 'react-select';

interface EventFormProps {
  initialData?: Partial<Event>;
  onSubmit: (data: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  mode?: 'add' | 'edit';
  documentsList?: Document[];
}

const eventTypes = [
  { value: "meeting", label: "Cuộc họp" },
  { value: "conference", label: "Hội nghị" },
  { value: "workshop", label: "Hội thảo" },
  { value: "training", label: "Đào tạo" },
  { value: "ceremony", label: "Lễ kỷ niệm" },
  { value: "other", label: "Khác" }
] as const;

const eventStatuses = [
  { value: "pending", label: "Sắp diễn ra" },
  { value: "in_progress", label: "Đang diễn ra" },
  { value: "completed", label: "Đã kết thúc" },
  { value: "cancelled", label: "Đã hủy" }
] as const;

export function EventForm({ initialData = {}, onSubmit, onCancel, mode = 'add', documentsList = [] }: EventFormProps) {
  const [form, setForm] = useState<Omit<Event, 'id' | 'created_at' | 'updated_at'>>({
    title: initialData.title || '',
    description: initialData.description || '',
    type: initialData.type || 'meeting',
    status: initialData.status || 'pending',
    start_date: initialData.start_date || '',
    end_date: initialData.end_date || '',
    location: initialData.location || '',
    organizer: initialData.organizer || '',
    participants: initialData.participants || [],
    agenda: initialData.agenda || '',
    notes: initialData.notes || '',
    attachments: initialData.attachments || [],
    document_id: initialData.document_id || null,
    department: initialData.department || '',
    category: initialData.category || '',
    is_public: initialData.is_public || false,
    max_participants: initialData.max_participants || 0,
    registration_deadline: initialData.registration_deadline || '',
    contact_info: initialData.contact_info || '',
    requirements: initialData.requirements || ''
  });

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="grid gap-4 py-4"
    >
      <div className="space-y-2">
        <Label htmlFor="title">Tên sự kiện</Label>
        <Input 
          id="title" 
          value={form.title} 
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))} 
          placeholder="Nhập tên sự kiện..." 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Mô tả</Label>
        <Textarea 
          id="description" 
          value={form.description} 
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
          placeholder="Mô tả chi tiết về sự kiện..." 
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Loại sự kiện</Label>
          <Select value={form.type} onValueChange={val => setForm(f => ({ ...f, type: val as Event['type'] }))}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn loại sự kiện" />
            </SelectTrigger>
            <SelectContent>
              {eventTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Trạng thái</Label>
          <Select value={form.status} onValueChange={val => setForm(f => ({ ...f, status: val as Event['status'] }))}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {eventStatuses.map(status => (
                <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Thời gian bắt đầu</Label>
          <Input 
            id="start_date" 
            type="datetime-local" 
            value={form.start_date} 
            onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">Thời gian kết thúc</Label>
          <Input 
            id="end_date" 
            type="datetime-local" 
            value={form.end_date} 
            onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} 
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Địa điểm</Label>
          <Input 
            id="location" 
            value={form.location} 
            onChange={e => setForm(f => ({ ...f, location: e.target.value }))} 
            placeholder="Nhập địa điểm tổ chức..." 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="organizer">Người tổ chức</Label>
          <Input 
            id="organizer" 
            value={form.organizer} 
            onChange={e => setForm(f => ({ ...f, organizer: e.target.value }))} 
            placeholder="Nhập tên người tổ chức..." 
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="agenda">Chương trình</Label>
        <Textarea 
          id="agenda" 
          value={form.agenda} 
          onChange={e => setForm(f => ({ ...f, agenda: e.target.value }))} 
          placeholder="Nhập chương trình chi tiết..." 
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Văn bản liên quan</Label>
        <ReactSelect
          isMulti
          isSearchable
          options={documentsList.map(doc => ({
            value: doc.id,
            label: `${doc.document_code ? doc.document_code + ' - ' : ''}${doc.title}`
          }))}
          value={(form.document_id ? [form.document_id] : []).map(id => {
            const doc = documentsList.find(d => d.id === id);
            return doc ? {
              value: doc.id,
              label: `${doc.document_code ? doc.document_code + ' - ' : ''}${doc.title}`
            } : null;
          }).filter(Boolean)}
          onChange={selected => {
            setForm(f => ({
              ...f,
              document_id: selected.length > 0 ? selected[0].value : null
            }));
          }}
          placeholder="Tìm kiếm và chọn văn bản liên quan..."
          classNamePrefix="react-select"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="department">Phòng ban</Label>
          <Input 
            id="department" 
            value={form.department} 
            onChange={e => setForm(f => ({ ...f, department: e.target.value }))} 
            placeholder="Nhập phòng ban tổ chức..." 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Phân loại</Label>
          <Input 
            id="category" 
            value={form.category} 
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))} 
            placeholder="Nhập phân loại sự kiện..." 
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="max_participants">Số lượng tham gia tối đa</Label>
          <Input 
            id="max_participants" 
            type="number" 
            value={form.max_participants} 
            onChange={e => setForm(f => ({ ...f, max_participants: parseInt(e.target.value) }))} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="registration_deadline">Hạn đăng ký</Label>
          <Input 
            id="registration_deadline" 
            type="datetime-local" 
            value={form.registration_deadline} 
            onChange={e => setForm(f => ({ ...f, registration_deadline: e.target.value }))} 
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact_info">Thông tin liên hệ</Label>
        <Input 
          id="contact_info" 
          value={form.contact_info} 
          onChange={e => setForm(f => ({ ...f, contact_info: e.target.value }))} 
          placeholder="Nhập thông tin liên hệ..." 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="requirements">Yêu cầu tham gia</Label>
        <Textarea 
          id="requirements" 
          value={form.requirements} 
          onChange={e => setForm(f => ({ ...f, requirements: e.target.value }))} 
          placeholder="Nhập các yêu cầu tham gia..." 
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Ghi chú</Label>
        <Textarea 
          id="notes" 
          value={form.notes} 
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} 
          placeholder="Thêm ghi chú về sự kiện..." 
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit">
          {mode === 'edit' ? 'Lưu' : 'Thêm'}
        </Button>
      </div>
    </form>
  );
} 
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Task, Document, Event } from "@/types";
import { Badge } from "@/components/ui/badge";
import ReactSelect from 'react-select';

interface TaskFormProps {
  initialData?: Partial<Task>;
  onSubmit: (data: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  mode?: 'add' | 'edit';
  documentsList?: Document[];
  eventsList?: Event[];
}

const taskPriorities = [
  { value: "low", label: "Thấp" },
  { value: "medium", label: "Trung bình" },
  { value: "high", label: "Cao" },
  { value: "urgent", label: "Khẩn cấp" }
] as const;

const taskStatuses = [
  { value: "pending", label: "Mới giao" },
  { value: "in_progress", label: "Đang thực hiện" },
  { value: "completed", label: "Đã hoàn thành" },
  { value: "on_hold", label: "Tạm hoãn" }
] as const;

export function TaskForm({ initialData = {}, onSubmit, onCancel, mode = 'add', documentsList = [], eventsList = [] }: TaskFormProps) {
  const [form, setForm] = useState<Omit<Task, 'id' | 'created_at' | 'updated_at'> & { related_documents: string[]; related_events: string[] }>({
    title: initialData.title || '',
    description: initialData.description || '',
    status: initialData.status || 'pending',
    priority: initialData.priority || 'medium',
    assigned_to: initialData.assigned_to || [],
    created_by: initialData.created_by || '',
    due_date: initialData.due_date || '',
    start_date: initialData.start_date || '',
    tags: initialData.tags || [],
    attachments: initialData.attachments || [],
    progress: typeof initialData.progress === 'number' ? initialData.progress : 0,
    related_documents: initialData.related_documents || [],
    related_events: initialData.related_events || []
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
        <Label htmlFor="title">Tiêu đề công việc</Label>
        <Input 
          id="title" 
          value={form.title} 
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))} 
          placeholder="Nhập tiêu đề công việc..." 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Mô tả chi tiết</Label>
        <Textarea 
          id="description" 
          value={form.description} 
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
          placeholder="Mô tả chi tiết về công việc cần thực hiện..." 
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Trạng thái</Label>
          <Select value={form.status} onValueChange={val => setForm(f => ({ ...f, status: val as Task['status'] }))}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {taskStatuses.map(status => (
                <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Mức độ ưu tiên</Label>
          <Select value={form.priority} onValueChange={val => setForm(f => ({ ...f, priority: val as Task['priority'] }))}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn mức độ ưu tiên" />
            </SelectTrigger>
            <SelectContent>
              {taskPriorities.map(priority => (
                <SelectItem key={priority.value} value={priority.value}>{priority.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Ngày bắt đầu</Label>
          <Input 
            id="start_date" 
            type="date" 
            value={form.start_date} 
            onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="due_date">Hạn chót</Label>
          <Input 
            id="due_date" 
            type="datetime-local" 
            value={form.due_date} 
            onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} 
          />
        </div>
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
          value={form.related_documents.map(id => {
            const doc = documentsList.find(d => d.id === id);
            return doc ? {
              value: doc.id,
              label: `${doc.document_code ? doc.document_code + ' - ' : ''}${doc.title}`
            } : null;
          }).filter(Boolean)}
          onChange={selected => {
            setForm(f => ({
              ...f,
              related_documents: selected.map(s => s.value)
            }));
          }}
          placeholder="Tìm kiếm và chọn văn bản liên quan..."
          classNamePrefix="react-select"
        />
      </div>

      <div className="space-y-2">
        <Label>Sự kiện liên quan</Label>
        <ReactSelect
          isMulti
          isSearchable
          options={(eventsList || []).map(event => ({
            value: event.id,
            label: `${event.title} (${event.start_date})`
          }))}
          value={form.related_events.map(id => {
            const event = (eventsList || []).find(e => e.id === id);
            return event ? {
              value: event.id,
              label: `${event.title} (${event.start_date})`
            } : null;
          }).filter(Boolean)}
          onChange={selected => {
            setForm(f => ({
              ...f,
              related_events: selected.map(s => s.value)
            }));
          }}
          placeholder="Tìm kiếm và chọn sự kiện liên quan..."
          classNamePrefix="react-select"
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
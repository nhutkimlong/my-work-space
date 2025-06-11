import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReactSelect from 'react-select';
import { Document } from "@/types";
import { Badge } from "@/components/ui/badge";
import React from "react";

interface DocumentFormProps {
  initialData?: Partial<Document>;
  onSubmit: (data: Omit<Document, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  mode?: 'add' | 'edit';
  documentsList?: Document[]; // để chọn văn bản liên quan
}

const documentTypes = [
  { value: "công văn", label: "Công văn" },
  { value: "kế hoạch", label: "Kế hoạch" },
  { value: "quyết định", label: "Quyết định" },
  { value: "biên bản", label: "Biên bản" },
  { value: "tờ trình", label: "Tờ trình" },
  { value: "nghị định", label: "Nghị định" },
  { value: "khác", label: "Khác" }
] as const;

export function DocumentForm({ initialData = {}, onSubmit, onCancel, mode = 'add', documentsList = [] }: DocumentFormProps) {
  const [form, setForm] = useState<Omit<Document, 'id' | 'created_at' | 'updated_at'>>({
    title: initialData.title || '',
    document_code: initialData.document_code || '',
    issue_date: initialData.issue_date || '',
    expiration_date: initialData.expiration_date || '',
    issuer: initialData.issuer || '',
    abstract: initialData.abstract || '',
    file_url: initialData.file_url || '',
    file_name: initialData.file_name || '',
    file_size: initialData.file_size || 0,
    file_type: initialData.file_type || '',
    document_type: initialData.document_type || 'công văn',
    tags: initialData.tags || [],
    status: initialData.status || 'pending',
    priority: initialData.priority || 'low',
    google_drive_id: initialData.google_drive_id || '',
    google_drive_url: initialData.google_drive_url || '',
    related_documents: initialData.related_documents || [],
  });
  const [tagInputValue, setTagInputValue] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [files, setFiles] = useState<File[]>([]); // file mới chọn
  const [removedFiles, setRemovedFiles] = useState<string[]>([]); // tên file đã xóa (khi sửa)
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Xử lý xóa file đã đính kèm (khi sửa)
  const handleRemoveOldFile = () => {
    if (form.file_name) {
      setRemovedFiles([...removedFiles, form.file_name]);
      setForm(f => ({ ...f, file_name: '', file_url: '', file_size: 0, file_type: '' }));
    }
  };

  // Xử lý xóa file mới chọn (khi thêm/sửa)
  const handleRemoveNewFile = (idx: number) => {
    setFiles(files.filter((_, i) => i !== idx));
    if (files.length === 1 && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit({ ...form, files, removedFiles });
      }}
      className="grid gap-4 py-4"
    >
      <div className="space-y-2">
        <Label htmlFor="title">Tên văn bản</Label>
        <Input id="title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="VD: Quyết định về việc phê duyệt..." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="documentCode">Số/Ký hiệu văn bản</Label>
          <Input id="documentCode" value={form.document_code} onChange={e => setForm(f => ({ ...f, document_code: e.target.value }))} placeholder="VD: 123/QĐ-UBND" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="documentType">Loại văn bản</Label>
          <Select value={form.document_type} onValueChange={val => setForm(f => ({ ...f, document_type: val as Document['document_type'] }))}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn loại văn bản" />
            </SelectTrigger>
            <SelectContent>
              {documentTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="issueDate">Ngày ban hành</Label>
          <Input id="issueDate" type="date" value={form.issue_date} onChange={e => setForm(f => ({ ...f, issue_date: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expirationDate">Ngày hết hạn</Label>
          <Input id="expirationDate" type="date" value={form.expiration_date || ''} onChange={e => setForm(f => ({ ...f, expiration_date: e.target.value }))} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="issuer">Cơ quan ban hành</Label>
          <Input id="issuer" value={form.issuer} onChange={e => setForm(f => ({ ...f, issuer: e.target.value }))} placeholder="VD: UBND tỉnh" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="abstract">Tóm tắt nội dung</Label>
          <Textarea id="abstract" value={form.abstract || ''} onChange={e => setForm(f => ({ ...f, abstract: e.target.value }))} placeholder="Nhập tóm tắt nội dung văn bản..." />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="tags">Từ khóa (cách nhau bởi dấu phẩy hoặc dấu cách)</Label>
        <Input
          id="tags"
          value={tagInputValue}
          onChange={e => setTagInputValue(e.target.value)}
          onKeyDown={e => {
            if (isComposing) return;
            if ((e.key === ',' || e.key === 'Enter') && tagInputValue.trim()) {
              e.preventDefault();
              const newTag = tagInputValue.trim().replace(/,$/, "");
              if (newTag && !form.tags.includes(newTag)) {
                setForm(f => ({ ...f, tags: [...f.tags, newTag] }));
              }
              setTagInputValue("");
            }
          }}
          onBlur={() => {
            if (tagInputValue.trim() && !form.tags.includes(tagInputValue.trim())) {
              setForm(f => ({ ...f, tags: [...f.tags, tagInputValue.trim()] }));
            }
            setTagInputValue("");
          }}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          placeholder="VD: kinh tế, kế hoạch, phát triển"
        />
        {/* Badge preview */}
        <div className="flex flex-wrap gap-1 mt-1">
          {form.tags.map((tag, idx) => (
            <Badge key={idx} variant="outline">{tag}</Badge>
          ))}
        </div>
      </div>
      {/* Văn bản liên quan */}
      <div className="space-y-2">
        <Label htmlFor="relatedDocuments">Văn bản liên quan</Label>
        <ReactSelect
          isMulti
          isSearchable
          options={documentsList.map(doc => ({
            value: doc.id,
            label: `${doc.document_code ? doc.document_code + ' - ' : ''}${doc.title}`
          }))}
          value={(form.related_documents || []).map(id => {
            const doc = documentsList.find(d => d.id === id);
            return doc ? {
              value: doc.id,
              label: `${doc.document_code ? doc.document_code + ' - ' : ''}${doc.title}`
            } : null;
          }).filter(Boolean)}
          onChange={selected => {
            setForm(f => ({
              ...f,
              related_documents: selected.map(opt => opt.value)
            }));
          }}
          placeholder="Tìm kiếm và chọn văn bản liên quan..."
          classNamePrefix="react-select"
          styles={{
            container: (base) => ({ ...base, width: '100%' }),
            valueContainer: (base) => ({ ...base, flexWrap: 'wrap', maxHeight: 80, overflowY: 'auto' }),
            multiValue: (base) => ({ ...base, maxWidth: '100%', whiteSpace: 'normal' }),
            menu: (base) => ({ ...base, zIndex: 9999 }),
          }}
          components={{
            MultiValueLabel: (props) => (
              <div
                title={props.data.label}
                style={{
                  maxWidth: 180,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block',
                }}
              >
                {props.children}
              </div>
            )
          }}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="file">Tệp đính kèm</Label>
        <input
          id="file"
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
          multiple
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={e => setFiles(e.target.files ? Array.from(e.target.files) : [])}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1 border rounded bg-white hover:bg-gray-100"
        >
          Chọn tệp
        </button>
        <span className="ml-2 text-sm text-muted-foreground">
          {files.length > 0 ? `${files.length} tệp đã chọn` : 'Không có tệp nào được chọn'}
        </span>
        {/* Danh sách file mới chọn */}
        {files.length > 0 && (
          <div className="mt-2 space-y-1">
            {files.map((file, idx) => (
              <div key={file.name + idx} className="flex items-center gap-2 text-sm">
                <span>{idx + 1}. {file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                <button
                  type="button"
                  className="text-red-500 hover:underline"
                  onClick={() => handleRemoveNewFile(idx)}
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>
        )}
        {/* Danh sách file đã đính kèm (khi sửa) */}
        {mode === 'edit' && form.file_name && (
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span>Đã đính kèm: {form.file_name}</span>
            <button
              type="button"
              className="text-red-500 hover:underline"
              onClick={handleRemoveOldFile}
            >
              Xóa
            </button>
          </div>
        )}
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
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, X, Upload, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { courseService, CourseRequest } from '@/services/courseService';
import { ResponseCode } from '@/types/types';
import { toast } from 'react-hot-toast';

export default function CreateCoursePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const [form, setForm] = useState<CourseRequest>({
    title: '',
    description: '',
    price: 0,
    tags: [],
    coverImage: '',
    isPublished: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags?.includes(tag)) {
      setForm(prev => ({ ...prev, tags: [...(prev.tags || []), tag] }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setForm(prev => ({ ...prev, tags: (prev.tags || []).filter(t => t !== tagToRemove) }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent, publish = false) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error('Vui lòng nhập tên khóa học');
      return;
    }
    if (!form.description.trim()) {
      toast.error('Vui lòng nhập mô tả khóa học');
      return;
    }

    setSaving(true);
    try {
      const data: CourseRequest = { ...form, isPublished: publish };
      const response = await courseService.create(data);
      if (response.code === ResponseCode.SUCCESS) {
        toast.success(publish ? 'Đã tạo và xuất bản khóa học!' : 'Đã tạo khóa học!');
        router.push('/instructor/courses');
      } else {
        toast.error(response.message || 'Không thể tạo khóa học');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo khóa học');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/instructor/courses">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />Quay lại
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tạo khóa học mới</h1>
          <p className="mt-1 text-gray-600">Điền thông tin để tạo một khóa học mới</p>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cơ bản</CardTitle>
                <CardDescription>Điền các thông tin chính của khóa học</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Tên khóa học <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="VD: Lập trình Java từ cơ bản đến nâng cao"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Mô tả <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={5}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Mô tả chi tiết về khóa học, những gì học viên sẽ học được..."
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    URL ảnh bìa
                  </label>
                  <Input
                    name="coverImage"
                    value={form.coverImage || ''}
                    onChange={handleChange}
                    placeholder="https://example.com/cover-image.jpg"
                  />
                  {form.coverImage && (
                    <div className="mt-2 overflow-hidden rounded-lg border">
                      <img src={form.coverImage} alt="Cover preview" className="h-48 w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tags & Phân loại</CardTitle>
                <CardDescription>Thêm tags để học viên dễ tìm kiếm</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Nhập tag rồi nhấn Enter..."
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {(form.tags?.length || 0) > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {form.tags?.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700"
                      >
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="ml-1 rounded-full p-0.5 hover:bg-blue-200">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Giá & Xuất bản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Giá khóa học (VNĐ)
                  </label>
                  <Input
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    min={0}
                    step={10000}
                  />
                  <p className="mt-1 text-xs text-gray-500">Đặt 0 cho khóa học miễn phí</p>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <Button type="submit" className="w-full" disabled={saving}>
                    {saving ? 'Đang lưu...' : 'Lưu nháp'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={saving}
                    onClick={(e) => handleSubmit(e as any, true)}
                  >
                    Lưu & Xuất bản
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-3">
                  <BookOpen className="mt-0.5 h-5 w-5 text-blue-600 shrink-0" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium">Mẹo</p>
                    <p className="mt-1">Sau khi tạo khóa học, bạn có thể thêm chương và bài học trong trang chỉnh sửa.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, X, BookOpen, Check } from 'lucide-react';
import Link from 'next/link';
import { courseService, CourseRequest } from '@/services/courseService';
import { useAuth } from '@/contexts/AuthContext';
import { isSuccess } from '@/types/types';
import { toast } from 'react-hot-toast';

type Step = 1 | 2 | 3;

export default function CreateCoursePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [step, setStep] = useState<Step>(1);

  const [form, setForm] = useState<CourseRequest>({
    title: '',
    description: '',
    price: 0,
    tags: [],
    coverImage: '',
    isPublished: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const validateStep = (targetStep: Step) => {
    if (targetStep >= 2) {
      if (!form.title.trim()) {
        toast.error('Vui lòng nhập tên khóa học');
        return false;
      }
      if (!form.description.trim()) {
        toast.error('Vui lòng nhập mô tả khóa học');
        return false;
      }
    }
    if (targetStep >= 3 && Number(form.price) < 0) {
      toast.error('Giá khóa học không hợp lệ');
      return false;
    }
    return true;
  };

  const goToStep = (targetStep: Step) => {
    if (!validateStep(targetStep)) return;
    setStep(targetStep);
  };

  const handleSubmit = async (publish: boolean) => {
    if (!validateStep(3)) return;
    if (!user?.id) {
      toast.error('Không xác định được giảng viên tạo khóa học');
      return;
    }

    setSaving(true);
    try {
      const payload: CourseRequest = {
        ...form,
        price: Number(form.price || 0),
        isPublished: publish,
        instructorId: user.id,
      };

      const response = await courseService.create(payload);
      if (isSuccess(response.code)) {
        toast.success(publish ? 'Đã tạo và xuất bản khóa học!' : 'Đã tạo khóa học nháp!');
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

  const stepItems = [
    { id: 1, title: 'Thông tin cơ bản' },
    { id: 2, title: 'Giá & xuất bản' },
    { id: 3, title: 'Tags & hoàn tất' },
  ] as const;

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
          <p className="mt-1 text-gray-600">Wizard 3 bước theo kế hoạch Giai đoạn 3</p>
        </div>
      </div>

      <div className="grid gap-3 rounded-lg border bg-white p-4 sm:grid-cols-3">
        {stepItems.map(item => {
          const isActive = step === item.id;
          const isDone = step > item.id;
          return (
            <button
              key={item.id}
              onClick={() => goToStep(item.id)}
              className={`flex items-center gap-3 rounded-md border p-3 text-left transition-colors ${
                isActive
                  ? 'border-blue-600 bg-blue-50'
                  : isDone
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                isDone ? 'bg-green-600 text-white' : isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {isDone ? <Check className="h-4 w-4" /> : item.id}
              </div>
              <span className="text-sm font-medium text-gray-800">{item.title}</span>
            </button>
          );
        })}
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
            <CardDescription>Tên, mô tả, ảnh bìa khóa học</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Tên khóa học <span className="text-red-500">*</span></label>
              <Input name="title" value={form.title} onChange={handleChange} placeholder="VD: Lập trình Java từ cơ bản đến nâng cao" />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Mô tả <span className="text-red-500">*</span></label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={5}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="Mô tả chi tiết nội dung, mục tiêu và đối tượng học viên..."
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">URL ảnh bìa</label>
              <Input name="coverImage" value={form.coverImage || ''} onChange={handleChange} placeholder="https://example.com/cover-image.jpg" />
              {form.coverImage && (
                <div className="mt-3 overflow-hidden rounded-lg border">
                  <img src={form.coverImage} alt="Cover preview" className="h-52 w-full object-cover" />
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button onClick={() => goToStep(2)}>Tiếp tục</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Giá và cài đặt xuất bản</CardTitle>
            <CardDescription>Thiết lập monetization và trạng thái khóa học</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Giá khóa học (VNĐ)</label>
              <Input name="price" type="number" value={form.price} onChange={handleChange} min={0} step={10000} />
              <p className="mt-1 text-xs text-gray-500">Đặt 0 cho khóa học miễn phí</p>
            </div>

            <div className="rounded-lg border bg-gray-50 p-4">
              <p className="text-sm text-gray-700">Trạng thái sau khi tạo: <span className="font-semibold">Bản nháp</span></p>
              <p className="mt-1 text-xs text-gray-500">Bạn có thể xuất bản ngay ở bước cuối.</p>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>Quay lại</Button>
              <Button onClick={() => goToStep(3)}>Tiếp tục</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Tags và phân loại</CardTitle>
                <CardDescription>Gắn tag để học viên dễ tìm khóa học hơn</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Nhập tag rồi Enter..."
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {(form.tags?.length || 0) > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {form.tags?.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
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

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>Quay lại</Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleSubmit(false)} disabled={saving}>
                  {saving ? 'Đang lưu...' : 'Lưu nháp'}
                </Button>
                <Button onClick={() => handleSubmit(true)} disabled={saving}>
                  {saving ? 'Đang xuất bản...' : 'Lưu & Xuất bản'}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Xem trước</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm font-semibold text-gray-900">{form.title || 'Tên khóa học'}</p>
                <p className="line-clamp-4 text-sm text-gray-600">{form.description || 'Mô tả khóa học sẽ hiển thị ở đây.'}</p>
                <p className="text-sm text-gray-700">Giá: <span className="font-semibold">{Number(form.price || 0).toLocaleString('vi-VN')}đ</span></p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-3">
                  <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium">Mẹo</p>
                    <p className="mt-1">Sau khi tạo khóa học, bạn có thể thêm chương/bài học và tài liệu media ở trang chỉnh sửa.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

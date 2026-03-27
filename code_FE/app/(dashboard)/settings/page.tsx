'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageLoading } from '@/components/ui/loading';
import { User, Lock, Bell, Camera, Upload, GraduationCap, ArrowRight, CheckCircle2, Clock3, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { userService } from '@/services';
import { isSuccess } from '@/types/types';
import type { UpdateProfileRequest, ChangePasswordRequest } from '@/types/types';

export default function SettingsPage() {
  const { user, isLoading, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'notifications' | 'teaching'>('profile');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phoneNumber: '',
    dateOfBirth: '',
    address: '',
    gender: '',
    schoolId: '',
  });

  // Initialize form when user loads
  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || '',
        dateOfBirth: user.dateOfBirth || '',
        address: user.address || '',
        gender: user.gender || '',
        schoolId: user.schoolId || '',
      });
    }
  }, [user]);

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  if (isLoading) {
    return <PageLoading message="Đang tải cài đặt..." />;
  }

  if (!user) {
    return null;
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfileForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data: UpdateProfileRequest = {
        fullName: profileForm.fullName,
        phoneNumber: profileForm.phoneNumber || undefined,
        dateOfBirth: profileForm.dateOfBirth || undefined,
        address: profileForm.address || undefined,
        gender: profileForm.gender as 'MALE' | 'FEMALE' | 'OTHER' | undefined,
        schoolId: profileForm.schoolId || undefined,
      };
      const response = await userService.updateProfile(data);
      if (isSuccess(response.code)) {
        toast.success('Cập nhật hồ sơ thành công!');
        refreshUser?.();
      } else {
        toast.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật hồ sơ');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    setSaving(true);
    try {
      const data: ChangePasswordRequest = {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      };
      const response = await userService.changePassword(data);
      if (isSuccess(response.code)) {
        toast.success('Đổi mật khẩu thành công!');
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể đổi mật khẩu');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file tối đa là 5MB');
      return;
    }

    setUploading(true);
    try {
      const response = await userService.uploadAvatar(file);
      if (isSuccess(response.code)) {
        toast.success('Cập nhật ảnh đại diện thành công!');
        refreshUser?.();
      } else {
        toast.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tải lên ảnh');
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const tabs = [
    { id: 'profile', label: 'Hồ sơ cá nhân', icon: User, visible: true },
    { id: 'password', label: 'Đổi mật khẩu', icon: Lock, visible: true },
    { id: 'notifications', label: 'Thông báo', icon: Bell, visible: true },
    { id: 'teaching', label: 'Cộng đồng giảng dạy', icon: GraduationCap, visible: user.role === 'STUDENT' },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Cài đặt</h1>
        <p className="mt-2 text-gray-600">Quản lý tài khoản và cài đặt cá nhân của bạn</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="w-full lg:w-64">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-1">
                {tabs.filter(tab => tab.visible).map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        activeTab === tab.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Hồ sơ cá nhân</CardTitle>
                <CardDescription>Cập nhật thông tin cá nhân của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6 flex items-center gap-4">
                  <div className="relative">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-2xl font-semibold text-blue-600 overflow-hidden">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.fullName} className="h-full w-full rounded-full object-cover" />
                      ) : (
                        user.fullName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="absolute bottom-0 right-0 rounded-full bg-white p-1.5 shadow-md hover:bg-gray-50 disabled:opacity-50"
                    >
                      {uploading ? (
                        <Upload className="h-4 w-4 text-gray-600 animate-pulse" />
                      ) : (
                        <Camera className="h-4 w-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.fullName}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-400 mt-1">Click vào icon camera để đổi ảnh</p>
                  </div>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">Họ và tên</label>
                      <Input name="fullName" value={profileForm.fullName} onChange={handleProfileChange} required />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">Số điện thoại</label>
                      <Input name="phoneNumber" value={profileForm.phoneNumber} onChange={handleProfileChange} placeholder="0xxx xxx xxx" />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">Ngày sinh</label>
                      <Input type="date" name="dateOfBirth" value={profileForm.dateOfBirth} onChange={handleProfileChange} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">Giới tính</label>
                      <select name="gender" value={profileForm.gender} onChange={handleProfileChange} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                        <option value="">Chọn giới tính</option>
                        <option value="MALE">Nam</option>
                        <option value="FEMALE">Nữ</option>
                        <option value="OTHER">Khác</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Địa chỉ</label>
                    <Input name="address" value={profileForm.address} onChange={handleProfileChange} placeholder="Nhập địa chỉ của bạn" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Mã sinh viên / Nhân viên</label>
                    <Input name="schoolId" value={profileForm.schoolId} onChange={handleProfileChange} placeholder="VD: SV001" />
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'password' && (
            <Card>
              <CardHeader>
                <CardTitle>Đổi mật khẩu</CardTitle>
                <CardDescription>Cập nhật mật khẩu để bảo mật tài khoản</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Mật khẩu hiện tại</label>
                    <Input type="password" name="oldPassword" value={passwordForm.oldPassword} onChange={handlePasswordChange} required />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Mật khẩu mới</label>
                    <Input type="password" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} required minLength={6} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</label>
                    <Input type="password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordChange} required />
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={saving}>{saving ? 'Đang lưu...' : 'Đổi mật khẩu'}</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Cài đặt thông báo</CardTitle>
                <CardDescription>Quản lý cách bạn nhận thông báo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { title: 'Thông báo email', desc: 'Nhận email về hoạt động quan trọng' },
                    { title: 'Thông báo bài thi', desc: 'Nhận thông báo khi có bài thi mới' },
                    { title: 'Thông báo kết quả', desc: 'Nhận thông báo khi có kết quả thi' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input type="checkbox" className="peer sr-only" defaultChecked />
                        <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'teaching' && user.role === 'STUDENT' && (
            <Card className="overflow-hidden border-0 shadow-sm">
              <CardContent className="space-y-6 p-0">
                <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 px-6 py-6 text-white">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                    <Sparkles className="h-3.5 w-3.5" />
                    Cơ hội trở thành giảng viên
                  </div>
                  <h3 className="text-2xl font-bold">Tham gia cộng đồng giảng dạy của chúng tôi</h3>
                  <p className="mt-2 text-sm text-blue-50">
                    Chia sẻ kiến thức, xây dựng khóa học của bạn và nhận hỗ trợ xét duyệt nhanh từ đội ngũ quản trị.
                  </p>
                </div>

                <div className="px-6 pb-6">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-blue-600">Quy trình xét duyệt</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">2-5 ngày làm việc</p>
                    </div>
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">Điều kiện</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">Tài khoản học viên hợp lệ</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3 rounded-xl border border-gray-200 bg-white p-4">
                    <div className="flex items-start gap-3 text-sm text-gray-700">
                      <Clock3 className="mt-0.5 h-4 w-4 text-blue-600" />
                      <span>Gửi yêu cầu với thông tin kinh nghiệm hoặc định hướng giảng dạy.</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-gray-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-blue-600" />
                      <span>Admin xem xét và phản hồi trực tiếp trong hệ thống.</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-gray-700">
                      <GraduationCap className="mt-0.5 h-4 w-4 text-blue-600" />
                      <span>Sau khi duyệt, vai trò sẽ được nâng cấp thành giảng viên.</span>
                    </div>
                  </div>

                  <div className="mt-5">
                    <Link href="/student/instructor-request">
                      <Button className="h-11 w-full sm:w-auto">
                        Đăng ký giảng viên
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}


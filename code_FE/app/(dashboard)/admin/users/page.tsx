'use client';

import { useEffect, useState } from 'react';
import { Ban, CheckCircle, Filter, Mail, Search, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { adminService, AdminUserResponse } from '@/services/adminService';
import { isSuccess } from '@/types/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageLoading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { toast } from 'react-hot-toast';
import { authApi } from '@/lib/api';

export default function AdminUsersPage() {
  const { isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'STUDENT' | 'INSTRUCTOR' | 'ADMIN'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isFallbackData, setIsFallbackData] = useState(false);

  useEffect(() => {
    void fetchUsers();
  }, []);

  const extractUsers = (result: any): AdminUserResponse[] => {
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.content)) return result.content;
    if (Array.isArray(result?.items)) return result.items;
    if (Array.isArray(result?.data)) return result.data;
    return [];
  };

  const fetchUsers = async () => {
    try {
      const response = await adminService.getAllUsers(0, 200);
      if (!isSuccess(response.code)) {
        throw new Error(response.message || 'Không tải được danh sách người dùng');
      }

      const list = extractUsers(response.result);
      if (list.length > 0) {
        setUsers(list);
        setIsFallbackData(false);
        return;
      }

      // Fallback: nếu API admin trả rỗng thì vẫn hiển thị user hiện tại để tránh màn hình trắng dữ liệu
      const meResponse = await authApi.getCurrentUser();
      if (isSuccess(meResponse.code) && meResponse.result) {
        setUsers([
          {
            ...meResponse.result,
            isActive: true,
            createdAt: meResponse.result.createdAt || new Date().toISOString(),
            updatedAt: meResponse.result.updatedAt,
          },
        ]);
        setIsFallbackData(true);
        toast('API quản lý user đang trả rỗng, đang hiển thị dữ liệu tài khoản hiện tại.');
      } else {
        setUsers([]);
        setIsFallbackData(false);
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setIsFallbackData(false);
      toast.error(error?.response?.data?.message || error?.message || 'Không tải được danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (user: AdminUserResponse) => {
    try {
      const response = await adminService.updateUserStatus(user.id, !user.isActive);
      if (isSuccess(response.code)) {
        setUsers(prev => prev.map(item => (item.id === user.id ? { ...item, isActive: !item.isActive } : item)));
        toast.success(user.isActive ? 'Đã vô hiệu hóa người dùng' : 'Đã kích hoạt người dùng');
      } else {
        toast.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const changeUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await adminService.updateUserRole(userId, newRole);
      if (isSuccess(response.code)) {
        setUsers(prev => prev.map(item => (item.id === userId ? { ...item, role: newRole as any } : item)));
        toast.success('Đã cập nhật vai trò');
      } else {
        toast.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  if (authLoading || loading) return <PageLoading message="Đang tải danh sách người dùng..." />;

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: users.length,
    students: users.filter(user => user.role === 'STUDENT').length,
    instructors: users.filter(user => user.role === 'INSTRUCTOR').length,
    admins: users.filter(user => user.role === 'ADMIN').length,
  };

  const getRoleBadge = (role: string) => (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
        role === 'ADMIN'
          ? 'bg-purple-100 text-purple-700'
          : role === 'INSTRUCTOR'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-green-100 text-green-700'
      }`}
    >
      {role}
    </span>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="mt-2 text-gray-600">Trang này đang kết nối trực tiếp với API quản lý người dùng của backend</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Tổng người dùng', value: stats.total, color: 'bg-gray-100 text-gray-600' },
          { label: 'Học viên', value: stats.students, color: 'bg-green-100 text-green-600' },
          { label: 'Giảng viên', value: stats.instructors, color: 'bg-blue-100 text-blue-600' },
          { label: 'Admin', value: stats.admins, color: 'bg-purple-100 text-purple-600' },
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${stat.color}`}>
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isFallbackData && (
        <Card>
          <CardContent className="p-4 text-sm text-amber-700">
            Đang hiển thị dữ liệu fallback vì endpoint <code>/api/admin/users</code> trả về danh sách rỗng.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Tìm kiếm người dùng..." className="pl-10" />
            </div>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as typeof roleFilter)} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
              <option value="all">Tất cả vai trò</option>
              <option value="STUDENT">Học viên</option>
              <option value="INSTRUCTOR">Giảng viên</option>
              <option value="ADMIN">Admin</option>
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Đã vô hiệu</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {filteredUsers.length === 0 ? (
        <EmptyState icon={Users} title="Không tìm thấy người dùng" description="Không có người dùng nào phù hợp với bộ lọc" />
      ) : (
        <div className="space-y-3">
          {filteredUsers.map(user => (
            <Card key={user.id}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-semibold text-blue-600">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{user.fullName}</h3>
                        {getRoleBadge(user.role)}
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {user.isActive ? 'Hoạt động' : 'Vô hiệu'}
                        </span>
                      </div>
                      <p className="flex items-center gap-1 text-sm text-gray-500">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select value={user.role} onChange={e => changeUserRole(user.id, e.target.value)} className="rounded-md border border-gray-300 px-2 py-1 text-sm">
                      <option value="STUDENT">Học viên</option>
                      <option value="INSTRUCTOR">Giảng viên</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <Button variant="outline" size="sm" onClick={() => toggleUserStatus(user)}>
                      {user.isActive ? (
                        <>
                          <Ban className="mr-2 h-4 w-4" />
                          Vô hiệu
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Kích hoạt
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

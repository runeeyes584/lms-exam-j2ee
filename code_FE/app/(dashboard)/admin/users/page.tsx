'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageLoading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { Users, Search, Mail, Shield, Ban, CheckCircle, Filter, MoreVertical, UserPlus } from 'lucide-react';
import { adminService, AdminUserResponse } from '@/services/adminService';
import { ResponseCode } from '@/types/types';
import { toast } from 'react-hot-toast';

export default function AdminUsersPage() {
  const { isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'STUDENT' | 'INSTRUCTOR' | 'ADMIN'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminService.getAllUsers(0, 100);
      if (response.code === ResponseCode.SUCCESS) {
        setUsers(response.result?.content || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // Mock data for demo
      setUsers([
        { id: '1', email: 'admin@test.com', fullName: 'Admin User', role: 'ADMIN', isActive: true, createdAt: '2024-01-01' },
        { id: '2', email: 'instructor@test.com', fullName: 'Nguyễn Văn Giảng', role: 'INSTRUCTOR', isActive: true, createdAt: '2024-01-15' },
        { id: '3', email: 'student1@test.com', fullName: 'Trần Thị Học', role: 'STUDENT', isActive: true, createdAt: '2024-02-01' },
        { id: '4', email: 'student2@test.com', fullName: 'Lê Văn Sinh', role: 'STUDENT', isActive: false, createdAt: '2024-02-15' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (user: AdminUserResponse) => {
    try {
      const response = await adminService.updateUserStatus(user.id, !user.isActive);
      if (response.code === ResponseCode.SUCCESS) {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
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
      if (response.code === ResponseCode.SUCCESS) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
        toast.success('Đã cập nhật vai trò');
      } else {
        toast.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  if (authLoading || loading) return <PageLoading message="Đang tải danh sách người dùng..." />;

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' && u.isActive) || (statusFilter === 'inactive' && !u.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: users.length,
    students: users.filter(u => u.role === 'STUDENT').length,
    instructors: users.filter(u => u.role === 'INSTRUCTOR').length,
    admins: users.filter(u => u.role === 'ADMIN').length,
  };

  const getRoleBadge = (role: string) => {
    const badges: Record<string, JSX.Element> = {
      ADMIN: <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">Admin</span>,
      INSTRUCTOR: <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">Giảng viên</span>,
      STUDENT: <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">Học viên</span>,
    };
    return badges[role] || <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">{role}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="mt-2 text-gray-600">Quản lý tất cả người dùng trong hệ thống</p>
        </div>
        <Button><UserPlus className="mr-2 h-4 w-4" />Thêm người dùng</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Tổng người dùng', value: stats.total, color: 'bg-gray-100 text-gray-600' },
          { label: 'Học viên', value: stats.students, color: 'bg-green-100 text-green-600' },
          { label: 'Giảng viên', value: stats.instructors, color: 'bg-blue-100 text-blue-600' },
          { label: 'Admin', value: stats.admins, color: 'bg-purple-100 text-purple-600' },
        ].map((stat, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${stat.color}`}><Users className="h-5 w-5" /></div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5" />Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input type="text" placeholder="Tìm kiếm người dùng..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
              <option value="all">Tất cả vai trò</option>
              <option value="STUDENT">Học viên</option>
              <option value="INSTRUCTOR">Giảng viên</option>
              <option value="ADMIN">Admin</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
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
                      <p className="flex items-center gap-1 text-sm text-gray-500"><Mail className="h-3 w-3" />{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select value={user.role} onChange={(e) => changeUserRole(user.id, e.target.value)} className="rounded-md border border-gray-300 px-2 py-1 text-sm">
                      <option value="STUDENT">Học viên</option>
                      <option value="INSTRUCTOR">Giảng viên</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <Button variant="outline" size="sm" onClick={() => toggleUserStatus(user)}>
                      {user.isActive ? <><Ban className="mr-2 h-4 w-4" />Vô hiệu</> : <><CheckCircle className="mr-2 h-4 w-4" />Kích hoạt</>}
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

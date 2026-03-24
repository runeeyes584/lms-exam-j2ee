'use client';

import { useEffect, useState } from 'react';
import { Ban, CheckCircle, Filter, Mail, Search, UserPlus, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { adminService, AdminUserResponse } from '@/services/adminService';
import { isSuccess } from '@/types/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageLoading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { toast } from 'react-hot-toast';

export default function AdminUsersPage() {
  const { isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'STUDENT' | 'INSTRUCTOR' | 'ADMIN'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    void fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminService.getAllUsers(0, 200);
      setUsers(isSuccess(response.code) ? response.result?.content || [] : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (user: AdminUserResponse) => {
    try {
      const response = await adminService.updateUserStatus(user.id, !user.isActive);
      if (isSuccess(response.code)) {
        setUsers(prev => prev.map(item => (item.id === user.id ? { ...item, isActive: !item.isActive } : item)));
        toast.success(user.isActive ? 'Da vo hieu hoa nguoi dung' : 'Da kich hoat nguoi dung');
      } else {
        toast.error(response.message || 'Co loi xay ra');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Co loi xay ra');
    }
  };

  const changeUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await adminService.updateUserRole(userId, newRole);
      if (isSuccess(response.code)) {
        setUsers(prev => prev.map(item => (item.id === userId ? { ...item, role: newRole as any } : item)));
        toast.success('Da cap nhat vai tro');
      } else {
        toast.error(response.message || 'Co loi xay ra');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Co loi xay ra');
    }
  };

  if (authLoading || loading) return <PageLoading message="Dang tai danh sach nguoi dung..." />;

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
          <h1 className="text-3xl font-bold text-gray-900">Quan ly nguoi dung</h1>
          <p className="mt-2 text-gray-600">Trang nay dang map truc tiep voi API admin users cua backend</p>
        </div>
        <Button variant="outline" disabled>
          <UserPlus className="mr-2 h-4 w-4" />
          API tao user chua co
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Tong nguoi dung', value: stats.total, color: 'bg-gray-100 text-gray-600' },
          { label: 'Hoc vien', value: stats.students, color: 'bg-green-100 text-green-600' },
          { label: 'Giang vien', value: stats.instructors, color: 'bg-blue-100 text-blue-600' },
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bo loc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Tim kiem nguoi dung..." className="pl-10" />
            </div>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as typeof roleFilter)} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
              <option value="all">Tat ca vai tro</option>
              <option value="STUDENT">Hoc vien</option>
              <option value="INSTRUCTOR">Giang vien</option>
              <option value="ADMIN">Admin</option>
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
              <option value="all">Tat ca trang thai</option>
              <option value="active">Dang hoat dong</option>
              <option value="inactive">Da vo hieu</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {filteredUsers.length === 0 ? (
        <EmptyState icon={Users} title="Khong tim thay nguoi dung" description="Khong co nguoi dung nao phu hop voi bo loc" />
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
                          {user.isActive ? 'Hoat dong' : 'Vo hieu'}
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
                      <option value="STUDENT">Hoc vien</option>
                      <option value="INSTRUCTOR">Giang vien</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <Button variant="outline" size="sm" onClick={() => toggleUserStatus(user)}>
                      {user.isActive ? (
                        <>
                          <Ban className="mr-2 h-4 w-4" />
                          Vo hieu
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Kich hoat
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

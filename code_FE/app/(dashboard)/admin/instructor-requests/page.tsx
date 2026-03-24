'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { GraduationCap, CheckCircle, XCircle, Clock, Mail, Calendar, FileText, User } from 'lucide-react';
import { adminService, InstructorApprovalResponse } from '@/services/adminService';
import { ResponseCode } from '@/types/types';
import { toast } from 'react-hot-toast';

export default function InstructorRequestsPage() {
  const { isLoading: authLoading } = useAuth();
  const [requests, setRequests] = useState<InstructorApprovalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await adminService.getInstructorRequests();
      if (response.code === ResponseCode.SUCCESS) {
        setRequests(response.result || []);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      // Mock data for demo
      setRequests([
        { id: '1', user: { id: '1', email: 'instructor1@test.com', fullName: 'Nguyễn Văn A', role: 'STUDENT' }, requestDate: '2024-03-01', status: 'PENDING', qualifications: 'Thạc sĩ CNTT', experience: '5 năm giảng dạy', specialization: 'Java, Spring Boot' },
        { id: '2', user: { id: '2', email: 'instructor2@test.com', fullName: 'Trần Thị B', role: 'STUDENT' }, requestDate: '2024-03-10', status: 'PENDING', qualifications: 'Tiến sĩ KHMT', experience: '10 năm nghiên cứu', specialization: 'AI, Machine Learning' },
        { id: '3', user: { id: '3', email: 'instructor3@test.com', fullName: 'Lê Văn C', role: 'INSTRUCTOR' }, requestDate: '2024-02-15', status: 'APPROVED', qualifications: 'Cử nhân CNTT', experience: '3 năm', specialization: 'React, Node.js' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      const response = await adminService.approveInstructor(requestId);
      if (response.code === ResponseCode.SUCCESS) {
        setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'APPROVED' } : r));
        toast.success('Đã duyệt yêu cầu');
      } else {
        toast.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleReject = async (requestId: string) => {
    const reason = prompt('Nhập lý do từ chối:');
    if (!reason) return;
    try {
      const response = await adminService.rejectInstructor(requestId, reason);
      if (response.code === ResponseCode.SUCCESS) {
        setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'REJECTED', rejectionReason: reason } : r));
        toast.success('Đã từ chối yêu cầu');
      } else {
        toast.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  if (authLoading || loading) return <PageLoading message="Đang tải yêu cầu..." />;

  const filteredRequests = requests.filter(r => filter === 'all' || r.status === filter);
  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  const getStatusBadge = (status: string) => {
    const badges: Record<string, JSX.Element> = {
      PENDING: <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700"><Clock className="h-3 w-3" />Chờ duyệt</span>,
      APPROVED: <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700"><CheckCircle className="h-3 w-3" />Đã duyệt</span>,
      REJECTED: <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700"><XCircle className="h-3 w-3" />Từ chối</span>,
    };
    return badges[status];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Duyệt giảng viên</h1>
          <p className="mt-2 text-gray-600">Xem xét và duyệt yêu cầu trở thành giảng viên</p>
        </div>
        {pendingCount > 0 && (
          <div className="rounded-lg bg-yellow-50 px-4 py-2 text-sm text-yellow-700">
            <strong>{pendingCount}</strong> yêu cầu đang chờ duyệt
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {(['PENDING', 'APPROVED', 'REJECTED', 'all'] as const).map(f => (
          <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
            {f === 'all' ? 'Tất cả' : f === 'PENDING' ? 'Chờ duyệt' : f === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}
            {f === 'PENDING' && pendingCount > 0 && <span className="ml-1 rounded-full bg-yellow-500 px-1.5 text-xs text-white">{pendingCount}</span>}
          </Button>
        ))}
      </div>

      {filteredRequests.length === 0 ? (
        <EmptyState icon={GraduationCap} title="Không có yêu cầu nào" description="Không có yêu cầu trở thành giảng viên nào phù hợp với bộ lọc" />
      ) : (
        <div className="space-y-4">
          {filteredRequests.map(request => (
            <Card key={request.id}>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-semibold text-blue-600">
                        {request.user.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">{request.user.fullName}</h3>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="flex items-center gap-1 text-sm text-gray-500"><Mail className="h-3 w-3" />{request.user.email}</p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {request.qualifications && (
                        <div className="rounded-lg bg-gray-50 p-3">
                          <p className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-500"><FileText className="h-3 w-3" />Bằng cấp</p>
                          <p className="text-sm text-gray-900">{request.qualifications}</p>
                        </div>
                      )}
                      {request.experience && (
                        <div className="rounded-lg bg-gray-50 p-3">
                          <p className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-500"><User className="h-3 w-3" />Kinh nghiệm</p>
                          <p className="text-sm text-gray-900">{request.experience}</p>
                        </div>
                      )}
                      {request.specialization && (
                        <div className="rounded-lg bg-gray-50 p-3">
                          <p className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-500"><GraduationCap className="h-3 w-3" />Chuyên môn</p>
                          <p className="text-sm text-gray-900">{request.specialization}</p>
                        </div>
                      )}
                    </div>

                    <p className="mt-3 flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />Ngày gửi: {new Date(request.requestDate).toLocaleDateString('vi-VN')}
                    </p>

                    {request.rejectionReason && (
                      <div className="mt-3 rounded-lg bg-red-50 p-3">
                        <p className="text-sm text-red-700"><strong>Lý do từ chối:</strong> {request.rejectionReason}</p>
                      </div>
                    )}
                  </div>

                  {request.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <Button onClick={() => handleApprove(request.id)}><CheckCircle className="mr-2 h-4 w-4" />Duyệt</Button>
                      <Button variant="outline" onClick={() => handleReject(request.id)}><XCircle className="mr-2 h-4 w-4" />Từ chối</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

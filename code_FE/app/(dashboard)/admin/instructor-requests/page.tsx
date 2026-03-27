'use client';

import { useEffect, useState } from 'react';
import { Calendar, CheckCircle, Clock, ExternalLink, FileText, GraduationCap, Mail, User, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { adminService, InstructorApprovalResponse } from '@/services/adminService';
import { isSuccess } from '@/types/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { toast } from 'react-hot-toast';

export default function InstructorRequestsPage() {
  const backendBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api').replace(/\/api\/?$/, '');
  const { isLoading: authLoading } = useAuth();
  const [requests, setRequests] = useState<InstructorApprovalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  useEffect(() => {
    void fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await adminService.getInstructorRequests();
      setRequests(isSuccess(response.code) ? response.result || [] : []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      const response = await adminService.approveInstructor(requestId);
      if (isSuccess(response.code)) {
        setRequests(prev => prev.map(item => (item.id === requestId ? { ...item, status: 'APPROVED' } : item)));
        toast.success('Đã duyệt yêu cầu');
      } else {
        toast.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const response = await adminService.rejectInstructor(requestId);
      if (isSuccess(response.code)) {
        setRequests(prev => prev.map(item => (item.id === requestId ? { ...item, status: 'REJECTED' } : item)));
        toast.success('Đã từ chối yêu cầu');
      } else {
        toast.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  if (authLoading || loading) return <PageLoading message="Đang tải yêu cầu..." />;

  const filteredRequests = requests.filter(request => filter === 'all' || request.status === filter);
  const pendingCount = requests.filter(request => request.status === 'PENDING').length;

  const getStatusBadge = (status: string) => {
    const badges: Record<string, JSX.Element> = {
      PENDING: <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700"><Clock className="h-3 w-3" />Chờ duyệt</span>,
      APPROVED: <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700"><CheckCircle className="h-3 w-3" />Đã duyệt</span>,
      REJECTED: <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700"><XCircle className="h-3 w-3" />Từ chối</span>,
    };
    return badges[status];
  };

  const resolveCvUrl = (cvFileUrl?: string) => {
    if (!cvFileUrl) return '';
    if (cvFileUrl.startsWith('http://') || cvFileUrl.startsWith('https://')) {
      return cvFileUrl;
    }
    return `${backendBaseUrl}${cvFileUrl}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Duyệt giảng viên</h1>
          <p className="mt-2 text-gray-600">Trang này đang kết nối trực tiếp với API duyệt giảng viên của backend</p>
        </div>
        {pendingCount > 0 && (
          <div className="rounded-lg bg-yellow-50 px-4 py-2 text-sm text-yellow-700">
            <strong>{pendingCount}</strong> yêu cầu đang chờ duyệt
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {(['PENDING', 'APPROVED', 'REJECTED', 'all'] as const).map(value => (
          <Button key={value} variant={filter === value ? 'default' : 'outline'} size="sm" onClick={() => setFilter(value)}>
            {value === 'all' ? 'Tất cả' : value === 'PENDING' ? 'Chờ duyệt' : value === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}
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
                        {(request.user?.fullName || request.userId).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">{request.user?.fullName || `User ${request.userId}`}</h3>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="flex items-center gap-1 text-sm text-gray-500">
                          <Mail className="h-3 w-3" />
                          {request.user?.email || 'Không có email'}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-500"><User className="h-3 w-3" />User ID</p>
                        <p className="text-sm text-gray-900">{request.userId}</p>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-500"><GraduationCap className="h-3 w-3" />Vai trò hiện tại</p>
                        <p className="text-sm text-gray-900">{request.user?.role || 'N/A'}</p>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="mb-1 text-xs font-medium text-gray-500">Ghi chú</p>
                        <p className="text-sm text-gray-900">{request.note || 'Không có ghi chú'}</p>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-500"><FileText className="h-3 w-3" />CV đính kèm</p>
                        {request.cvFileUrl ? (
                          <a
                            href={resolveCvUrl(request.cvFileUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-blue-700 hover:text-blue-900"
                          >
                            {request.cvOriginalFileName || 'Mở file CV'}
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <p className="text-sm text-gray-900">Không có CV</p>
                        )}
                      </div>
                    </div>

                    <p className="mt-3 flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />Ngày gửi: {new Date(request.createdAt).toLocaleDateString('vi-VN')}
                    </p>
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

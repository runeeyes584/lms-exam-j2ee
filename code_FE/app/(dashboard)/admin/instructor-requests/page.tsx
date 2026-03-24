'use client';

import { useEffect, useState } from 'react';
import { Calendar, CheckCircle, Clock, GraduationCap, Mail, User, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { adminService, InstructorApprovalResponse } from '@/services/adminService';
import { isSuccess } from '@/types/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { toast } from 'react-hot-toast';

export default function InstructorRequestsPage() {
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
        toast.success('Da duyet yeu cau');
      } else {
        toast.error(response.message || 'Co loi xay ra');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Co loi xay ra');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const response = await adminService.rejectInstructor(requestId);
      if (isSuccess(response.code)) {
        setRequests(prev => prev.map(item => (item.id === requestId ? { ...item, status: 'REJECTED' } : item)));
        toast.success('Da tu choi yeu cau');
      } else {
        toast.error(response.message || 'Co loi xay ra');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Co loi xay ra');
    }
  };

  if (authLoading || loading) return <PageLoading message="Dang tai yeu cau..." />;

  const filteredRequests = requests.filter(request => filter === 'all' || request.status === filter);
  const pendingCount = requests.filter(request => request.status === 'PENDING').length;

  const getStatusBadge = (status: string) => {
    const badges: Record<string, JSX.Element> = {
      PENDING: <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700"><Clock className="h-3 w-3" />Cho duyet</span>,
      APPROVED: <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700"><CheckCircle className="h-3 w-3" />Da duyet</span>,
      REJECTED: <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700"><XCircle className="h-3 w-3" />Tu choi</span>,
    };
    return badges[status];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Duyet giang vien</h1>
          <p className="mt-2 text-gray-600">Trang nay dang map truc tiep voi API instructor requests cua backend</p>
        </div>
        {pendingCount > 0 && (
          <div className="rounded-lg bg-yellow-50 px-4 py-2 text-sm text-yellow-700">
            <strong>{pendingCount}</strong> yeu cau dang cho duyet
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {(['PENDING', 'APPROVED', 'REJECTED', 'all'] as const).map(value => (
          <Button key={value} variant={filter === value ? 'default' : 'outline'} size="sm" onClick={() => setFilter(value)}>
            {value === 'all' ? 'Tat ca' : value === 'PENDING' ? 'Cho duyet' : value === 'APPROVED' ? 'Da duyet' : 'Tu choi'}
          </Button>
        ))}
      </div>

      {filteredRequests.length === 0 ? (
        <EmptyState icon={GraduationCap} title="Khong co yeu cau nao" description="Khong co yeu cau tro thanh giang vien nao phu hop voi bo loc" />
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
                          {request.user?.email || 'Khong co email'}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-500"><User className="h-3 w-3" />User ID</p>
                        <p className="text-sm text-gray-900">{request.userId}</p>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-500"><GraduationCap className="h-3 w-3" />Vai tro hien tai</p>
                        <p className="text-sm text-gray-900">{request.user?.role || 'N/A'}</p>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="mb-1 text-xs font-medium text-gray-500">Ghi chu</p>
                        <p className="text-sm text-gray-900">{request.note || 'Khong co ghi chu'}</p>
                      </div>
                    </div>

                    <p className="mt-3 flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />Ngay gui: {new Date(request.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>

                  {request.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <Button onClick={() => handleApprove(request.id)}><CheckCircle className="mr-2 h-4 w-4" />Duyet</Button>
                      <Button variant="outline" onClick={() => handleReject(request.id)}><XCircle className="mr-2 h-4 w-4" />Tu choi</Button>
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

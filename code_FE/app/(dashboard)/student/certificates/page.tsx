'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { Award, Download, Share2, Calendar } from 'lucide-react';
import { certificateService } from '@/services';
import { ResponseCode } from '@/types/types';
import { toast } from 'react-hot-toast';

interface Certificate {
  id: string;
  courseId: string;
  courseName: string;
  studentName: string;
  issueDate: string;
  certificateNumber: string;
}

export default function CertificatesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      // TODO: Khi BE có endpoint /certificates/my, sử dụng:
      // const response = await certificateService.getMyCertificates();
      // if (response.code === ResponseCode.SUCCESS) setCertificates(response.result || []);
      
      // Mock data cho demo
      setCertificates([
        { id: '1', courseId: '1', courseName: 'Lập trình Java cơ bản', studentName: user?.fullName || 'Học viên', issueDate: '2024-01-15', certificateNumber: 'CERT-2024-001' },
        { id: '2', courseId: '2', courseName: 'React và NextJS nâng cao', studentName: user?.fullName || 'Học viên', issueDate: '2024-02-20', certificateNumber: 'CERT-2024-002' },
      ]);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (certificate: Certificate) => {
    try {
      toast.loading('Đang tải chứng chỉ...');
      const blob = await certificateService.download(user!.id, certificate.courseId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${certificate.certificateNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.dismiss();
      toast.success('Đã tải chứng chỉ!');
    } catch (error) {
      toast.dismiss();
      toast.error('Không thể tải chứng chỉ');
    }
  };

  const handleShare = async (certificate: Certificate) => {
    const shareUrl = `${window.location.origin}/verify-certificate/${certificate.certificateNumber}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Chứng chỉ - ${certificate.courseName}`, text: `Tôi đã hoàn thành khóa học ${certificate.courseName}!`, url: shareUrl });
      } catch (error) {}
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Đã sao chép link chia sẻ!');
    }
  };

  if (authLoading || loading) return <PageLoading message="Đang tải chứng chỉ..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Chứng chỉ của tôi</h1>
        <p className="mt-2 text-gray-600">Các chứng chỉ bạn đã đạt được sau khi hoàn thành khóa học</p>
      </div>

      {certificates.length === 0 ? (
        <EmptyState icon={Award} title="Chưa có chứng chỉ nào" description="Hoàn thành các khóa học để nhận chứng chỉ" action={<Button onClick={() => window.location.href = '/student/courses'}>Xem khóa học</Button>} />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map(cert => (
            <Card key={cert.id} className="overflow-hidden">
              <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-6 text-white">
                <div className="absolute right-4 top-4 opacity-20"><Award className="h-16 w-16" /></div>
                <div className="relative">
                  <p className="text-xs font-medium uppercase tracking-wider text-blue-200">Chứng chỉ hoàn thành</p>
                  <h3 className="mt-2 text-lg font-bold line-clamp-2">{cert.courseName}</h3>
                  <p className="mt-2 text-sm text-blue-100">{cert.studentName}</p>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="mb-4 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /><span>Ngày cấp: {new Date(cert.issueDate).toLocaleDateString('vi-VN')}</span></div>
                  <div className="flex items-center gap-2"><Award className="h-4 w-4" /><span>Mã số: {cert.certificateNumber}</span></div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDownload(cert)}><Download className="mr-2 h-4 w-4" />Tải về</Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleShare(cert)}><Share2 className="mr-2 h-4 w-4" />Chia sẻ</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

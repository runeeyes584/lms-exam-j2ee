'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Award, Calendar, Download, Share2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { certificateService } from '@/services';
import { isSuccess } from '@/types/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
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
  const router = useRouter();
  const { isLoading: authLoading } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await certificateService.getMyCertificates();
      if (isSuccess(response.code)) {
        setCertificates(
          (response.result || []).map((item: any) => ({
            id: item.id,
            courseId: item.courseId,
            courseName: item.courseName,
            studentName: item.studentName,
            issueDate: item.issuedAt,
            certificateNumber: item.certificateNumber,
          }))
        );
      } else {
        setCertificates([]);
      }
    } catch (error) {
      console.error('Lỗi tải chứng chỉ:', error);
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (certificate: Certificate) => {
    try {
      toast.loading('Đang tải chứng chỉ...');
      const blob = await certificateService.download(certificate.courseId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `chung-chi-${certificate.certificateNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.dismiss();
      toast.success('Đã tải chứng chỉ');
    } catch (error) {
      toast.dismiss();
      toast.error('Không thể tải chứng chỉ');
    }
  };

  const handleShare = async (certificate: Certificate) => {
    const shareText = `Tôi đã hoàn thành khóa học ${certificate.courseName}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Chứng chỉ - ${certificate.courseName}`, text: shareText });
      } catch (error) {
        return;
      }
    } else {
      await navigator.clipboard.writeText(`${shareText} - Mã chứng chỉ: ${certificate.certificateNumber}`);
      toast.success('Đã sao chép nội dung chia sẻ');
    }
  };

  if (authLoading || loading) return <PageLoading message="Đang tải chứng chỉ..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Chứng chỉ</h1>
        <p className="mt-2 text-gray-600">Các chứng chỉ bạn đã nhận sau khi hoàn thành khóa học</p>
      </div>

      {certificates.length === 0 ? (
        <EmptyState
          icon={Award}
          title="Chưa có chứng chỉ nào"
          description="Hoàn thành các khóa học để nhận chứng chỉ"
          action={<Button onClick={() => router.push('/student/courses')}>Xem khóa học của tôi</Button>}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map(certificate => (
            <Card key={certificate.id} className="overflow-hidden">
              <div className="relative bg-gradient-to-br from-blue-600 via-cyan-700 to-emerald-700 p-6 text-white">
                <div className="absolute right-4 top-4 opacity-20">
                  <Award className="h-16 w-16" />
                </div>
                <div className="relative">
                  <p className="text-xs font-medium uppercase tracking-wider text-cyan-100">Chứng chỉ hoàn thành</p>
                  <h3 className="mt-2 line-clamp-2 text-lg font-bold">{certificate.courseName}</h3>
                  <p className="mt-2 text-sm text-cyan-50">{certificate.studentName}</p>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="mb-4 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Ngày cấp: {new Date(certificate.issueDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    <span>Mã số: {certificate.certificateNumber}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDownload(certificate)}>
                    <Download className="mr-2 h-4 w-4" />
                    Tải về
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleShare(certificate)}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Chia sẻ
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

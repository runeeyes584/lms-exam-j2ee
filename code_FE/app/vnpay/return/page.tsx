'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { paymentService } from '@/services';
import { AlertCircle, CheckCircle2, CircleDashed, Home, ReceiptText } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type VerifyState = 'loading' | 'success' | 'failed';

const formatCurrency = (amount: string | null): string => {
  if (!amount) return 'N/A';
  const numeric = Number(amount) / 100;
  if (Number.isNaN(numeric)) return amount;
  return `${numeric.toLocaleString('vi-VN')} đ`;
};

const formatPayDate = (payDate: string | null): string => {
  if (!payDate || payDate.length !== 14) return payDate || 'N/A';

  const year = payDate.slice(0, 4);
  const month = payDate.slice(4, 6);
  const day = payDate.slice(6, 8);
  const hour = payDate.slice(8, 10);
  const minute = payDate.slice(10, 12);
  const second = payDate.slice(12, 14);

  return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
};

export default function VNPayReturnPage() {
  const searchParams = useSearchParams();
  const [verifyState, setVerifyState] = useState<VerifyState>('loading');
  const [verifyMessage, setVerifyMessage] = useState('Đang xác nhận kết quả giao dịch...');

  const vnpParams = useMemo(() => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key.startsWith('vnp_')) {
        params[key] = value;
      }
    });
    return params;
  }, [searchParams]);

  const responseCode = searchParams.get('vnp_ResponseCode');
  const transactionStatus = searchParams.get('vnp_TransactionStatus');
  const txnRef = searchParams.get('vnp_TxnRef');
  const payDate = searchParams.get('vnp_PayDate');
  const amount = searchParams.get('vnp_Amount');

  useEffect(() => {
    const verify = async () => {
      if (!txnRef) {
        setVerifyState('failed');
        setVerifyMessage('Thiếu thông tin giao dịch VNPay.');
        return;
      }

      try {
        const result = await paymentService.verifyPayment(vnpParams);
        const isGatewaySuccess = responseCode === '00' && (!transactionStatus || transactionStatus === '00');

        if (typeof result === 'string') {
          setVerifyState(isGatewaySuccess ? 'success' : 'failed');
          setVerifyMessage(result);
          return;
        }

        setVerifyState(isGatewaySuccess ? 'success' : 'failed');
        setVerifyMessage(isGatewaySuccess ? 'Thanh toán thành công.' : 'Thanh toán thất bại hoặc đã bị hủy.');
      } catch {
        setVerifyState('failed');
        setVerifyMessage('Xác thực kết quả thanh toán thất bại. Vui lòng liên hệ hỗ trợ.');
      }
    };

    verify();
  }, [responseCode, transactionStatus, txnRef, vnpParams]);

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Card className="w-full border-gray-200 bg-white shadow-sm">
          <CardHeader className="border-b pb-5">
            <CardTitle className="flex items-center gap-3 text-xl text-gray-900 sm:text-2xl">
              <ReceiptText className="h-6 w-6 text-blue-600" />
              Kết quả thanh toán VNPay
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 p-6 sm:p-8">
            <div
              className={`flex items-start gap-4 rounded-xl border p-4 ${
                verifyState === 'success'
                  ? 'border-green-200 bg-green-50'
                  : verifyState === 'failed'
                    ? 'border-red-200 bg-red-50'
                    : 'border-blue-200 bg-blue-50'
              }`}
            >
              {verifyState === 'loading' && <CircleDashed className="mt-0.5 h-6 w-6 animate-spin text-blue-600" />}
              {verifyState === 'success' && <CheckCircle2 className="mt-0.5 h-6 w-6 text-green-600" />}
              {verifyState === 'failed' && <AlertCircle className="mt-0.5 h-6 w-6 text-red-600" />}

              <div>
                <p className="text-base font-semibold text-gray-900">
                  {verifyState === 'loading' && 'Đang xử lý giao dịch'}
                  {verifyState === 'success' && 'Giao dịch thành công'}
                  {verifyState === 'failed' && 'Giao dịch không thành công'}
                </p>
                <p className="mt-1 text-sm text-gray-700">{verifyMessage}</p>
              </div>
            </div>

            <div className="grid gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-gray-500">Mã giao dịch</p>
                <p className="font-medium text-gray-900">{txnRef || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Số tiền</p>
                <p className="font-medium text-gray-900">{formatCurrency(amount)}</p>
              </div>
              <div>
                <p className="text-gray-500">Mã phản hồi</p>
                <p className="font-medium text-gray-900">{responseCode || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Thời gian thanh toán</p>
                <p className="font-medium text-gray-900">{formatPayDate(payDate)}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-11 bg-blue-600 font-semibold hover:bg-blue-700">
                <Link href={verifyState === 'failed' ? '/student/catalog' : '/student/courses'}>
                  {verifyState === 'failed' ? 'Quay lại chọn khóa học' : 'Đến khóa học của tôi'}
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Về trang chủ
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

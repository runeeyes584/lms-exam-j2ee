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
      } catch (error) {
        setVerifyState('failed');
        setVerifyMessage('Xác thực kết quả thanh toán thất bại. Vui lòng liên hệ hỗ trợ.');
      }
    };

    verify();
  }, [responseCode, transactionStatus, txnRef, vnpParams]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.20),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(34,197,94,0.20),transparent_35%),radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.15),transparent_45%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-10 sm:px-6">
        <Card className="w-full border-slate-700/60 bg-slate-900/80 shadow-2xl backdrop-blur-sm">
          <CardHeader className="border-b border-slate-800 pb-5">
            <CardTitle className="flex items-center gap-3 text-xl text-white sm:text-2xl">
              <ReceiptText className="h-6 w-6 text-cyan-300" />
              Kết Quả Thanh Toán VNPay
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 p-6 sm:p-8">
            <div className="flex items-start gap-4 rounded-xl border border-slate-700 bg-slate-800/70 p-4">
              {verifyState === 'loading' && <CircleDashed className="mt-0.5 h-6 w-6 animate-spin text-cyan-300" />}
              {verifyState === 'success' && <CheckCircle2 className="mt-0.5 h-6 w-6 text-emerald-400" />}
              {verifyState === 'failed' && <AlertCircle className="mt-0.5 h-6 w-6 text-rose-400" />}

              <div>
                <p className="text-base font-semibold text-white">
                  {verifyState === 'loading' && 'Đang xử lý giao dịch'}
                  {verifyState === 'success' && 'Giao dịch thành công'}
                  {verifyState === 'failed' && 'Giao dịch không thành công'}
                </p>
                <p className="mt-1 text-sm text-slate-300">{verifyMessage}</p>
              </div>
            </div>

            <div className="grid gap-3 rounded-xl border border-slate-700 bg-slate-800/50 p-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-slate-400">Mã giao dịch</p>
                <p className="font-medium text-white">{txnRef || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-400">Số tiền</p>
                <p className="font-medium text-white">{formatCurrency(amount)}</p>
              </div>
              <div>
                <p className="text-slate-400">Mã phản hồi</p>
                <p className="font-medium text-white">{responseCode || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-400">Thời gian thanh toán</p>
                <p className="font-medium text-white">{payDate || 'N/A'}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-11 bg-cyan-500 font-semibold text-slate-950 hover:bg-cyan-400">
                <Link href="/student/courses">Đến khóa học của tôi</Link>
              </Button>
              <Button asChild variant="outline" className="h-11 border-slate-600 bg-transparent text-slate-100 hover:bg-slate-800">
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

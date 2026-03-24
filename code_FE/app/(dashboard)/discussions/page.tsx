'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageLoading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { MessageSquare, Search, Plus, ChevronRight, Clock, User, MessageCircle, ThumbsUp } from 'lucide-react';
import Link from 'next/link';
import { commentService } from '@/services';
import { ResponseCode } from '@/types/types';

interface Discussion {
  id: string;
  title: string;
  content: string;
  author: { id: string; fullName: string; avatarUrl?: string };
  courseId?: string;
  courseName?: string;
  createdAt: string;
  replyCount: number;
  likeCount: number;
  lastReplyAt?: string;
}

export default function DiscussionsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const fetchDiscussions = async () => {
    try {
      // TODO: Khi BE có endpoint /discussions hoặc /comments chung, sử dụng:
      // const response = await commentService.getByCourse('global', undefined, 0, 20);
      // if (response.code === ResponseCode.SUCCESS) setDiscussions(response.result?.content || []);
      
      // Mock data cho demo
      setDiscussions([
        { id: '1', title: 'Cách học Java hiệu quả?', content: 'Mình mới bắt đầu học Java, mọi người có kinh nghiệm gì không?', author: { id: '1', fullName: 'Nguyễn Văn A' }, courseName: 'Java cơ bản', createdAt: new Date().toISOString(), replyCount: 12, likeCount: 25, lastReplyAt: new Date().toISOString() },
        { id: '2', title: 'Lỗi khi deploy React app', content: 'Mình gặp lỗi khi deploy lên Vercel, ai giúp với?', author: { id: '2', fullName: 'Trần Thị B' }, courseName: 'React & NextJS', createdAt: new Date(Date.now() - 86400000).toISOString(), replyCount: 8, likeCount: 15, lastReplyAt: new Date(Date.now() - 3600000).toISOString() },
        { id: '3', title: 'Tài liệu học Spring Boot', content: 'Ai có tài liệu học Spring Boot hay không? Share cho mình với!', author: { id: '3', fullName: 'Lê Văn C' }, createdAt: new Date(Date.now() - 172800000).toISOString(), replyCount: 20, likeCount: 45 },
      ]);
    } catch (error) {
      console.error('Error fetching discussions:', error);
      setDiscussions([]);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) return <PageLoading message="Đang tải thảo luận..." />;

  const filteredDiscussions = discussions.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thảo luận</h1>
          <p className="mt-2 text-gray-600">Trao đổi và học hỏi cùng cộng đồng</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" />Tạo bài viết mới</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input type="text" placeholder="Tìm kiếm thảo luận..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
      </div>

      {filteredDiscussions.length === 0 ? (
        <EmptyState icon={MessageSquare} title="Chưa có thảo luận nào" description={searchQuery ? 'Không tìm thấy thảo luận phù hợp' : 'Hãy bắt đầu cuộc thảo luận đầu tiên!'} action={!searchQuery ? <Button>Tạo bài viết mới</Button> : undefined} />
      ) : (
        <div className="space-y-4">
          {filteredDiscussions.map(discussion => (
            <Card key={discussion.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                    {discussion.author.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <Link href={`/discussions/${discussion.id}`} className="font-semibold text-gray-900 hover:text-blue-600">
                        {discussion.title}
                      </Link>
                      {discussion.courseName && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">{discussion.courseName}</span>
                      )}
                    </div>
                    <p className="mb-2 text-sm text-gray-500 line-clamp-2">{discussion.content}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" />{discussion.author.fullName}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatTimeAgo(discussion.createdAt)}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{discussion.replyCount} phản hồi</span>
                      <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" />{discussion.likeCount} thích</span>
                    </div>
                  </div>
                  <Link href={`/discussions/${discussion.id}`}>
                    <Button variant="ghost" size="sm"><ChevronRight className="h-4 w-4" /></Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

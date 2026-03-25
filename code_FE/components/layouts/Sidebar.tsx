'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Library,
  FileText,
  GraduationCap,
  Users,
  Settings,
  BarChart3,
  MessageSquare,
  Award,
  ClipboardList,
  FolderOpen,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: Array<'STUDENT' | 'INSTRUCTOR' | 'ADMIN'>;
}

const navItems: NavItem[] = [
  // Common
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['STUDENT', 'INSTRUCTOR', 'ADMIN'],
  },
  
  // Student
  {
    title: 'Khóa học của tôi',
    href: '/student/courses',
    icon: BookOpen,
    roles: ['STUDENT'],
  },
  {
    title: 'Kho khóa học',
    href: '/student/catalog',
    icon: Library,
    roles: ['STUDENT'],
  },
  {
    title: 'Bài thi của tôi',
    href: '/student/exams',
    icon: FileText,
    roles: ['STUDENT'],
  },
  {
    title: 'Chứng chỉ',
    href: '/student/certificates',
    icon: Award,
    roles: ['STUDENT'],
  },
  
  // Instructor
  {
    title: 'Quản lý khóa học',
    href: '/instructor/courses',
    icon: FolderOpen,
    roles: ['INSTRUCTOR', 'ADMIN'],
  },
  {
    title: 'Ngân hàng câu hỏi',
    href: '/instructor/questions',
    icon: ClipboardList,
    roles: ['INSTRUCTOR', 'ADMIN'],
  },
  {
    title: 'Quản lý đề thi',
    href: '/instructor/exams',
    icon: FileText,
    roles: ['INSTRUCTOR', 'ADMIN'],
  },
  {
    title: 'Chấm điểm',
    href: '/instructor/grading',
    icon: GraduationCap,
    roles: ['INSTRUCTOR', 'ADMIN'],
  },
  {
    title: 'Lớp của tôi',
    href: '/instructor/students',
    icon: Users,
    roles: ['INSTRUCTOR', 'ADMIN'],
  },
  
  // Admin
  {
    title: 'Quản lý người dùng',
    href: '/admin/users',
    icon: Users,
    roles: ['ADMIN'],
  },
  {
    title: 'Duyệt giảng viên',
    href: '/admin/instructor-requests',
    icon: GraduationCap,
    roles: ['ADMIN'],
  },
  {
    title: 'Báo cáo & Thống kê',
    href: '/admin/analytics',
    icon: BarChart3,
    roles: ['ADMIN'],
  },
  
  // Common
  {
    title: 'Thảo luận',
    href: '/discussions',
    icon: MessageSquare,
    roles: ['STUDENT', 'INSTRUCTOR', 'ADMIN'],
  },
  {
    title: 'Cài đặt',
    href: '/settings',
    icon: Settings,
    roles: ['STUDENT', 'INSTRUCTOR', 'ADMIN'],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user.role)
  );

  return (
    <aside className="fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-64 overflow-y-auto border-r bg-white">
      <nav className="flex flex-col gap-1 p-4">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

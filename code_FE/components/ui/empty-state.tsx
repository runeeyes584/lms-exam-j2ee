import React from 'react';
import { Inbox, Search, AlertCircle, LucideIcon } from 'lucide-react';
import { Button } from './button';

interface EmptyStateProps {
  icon?: React.ReactNode | LucideIcon | React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode | { label: string; onClick: () => void };
}

// Helper to check if something is a valid React component (function or forwardRef)
const isComponentType = (icon: unknown): icon is React.ComponentType<{ className?: string }> => {
  if (!icon) return false;
  // Check for function component
  if (typeof icon === 'function') return true;
  // Check for forwardRef component (has $$typeof and render)
  if (typeof icon === 'object' && icon !== null && '$$typeof' in icon) return true;
  return false;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  let IconEl: React.ReactNode;
  if (isComponentType(icon)) {
    const IconComponent = icon as React.ComponentType<{ className?: string }>;
    IconEl = <IconComponent className="h-16 w-16" />;
  } else {
    IconEl = icon as React.ReactNode;
  }

  const ActionEl = action && typeof action === 'object' && 'label' in (action as object)
    ? <Button onClick={(action as { label: string; onClick: () => void }).onClick}>{(action as { label: string; onClick: () => void }).label}</Button>
    : action as React.ReactNode;

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
      <div className="mb-4 text-gray-400">
        {IconEl || <Inbox className="h-16 w-16" />}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      {description && (
        <p className="mb-6 max-w-sm text-sm text-gray-600">{description}</p>
      )}
      {ActionEl && (
        <div>{ActionEl}</div>
      )}
    </div>
  );
}

export function NoResults() {
  return (
    <EmptyState
      icon={<Search className="h-16 w-16" />}
      title="Không tìm thấy kết quả"
      description="Thử điều chỉnh bộ lọc hoặc tìm kiếm của bạn"
    />
  );
}

export function NoData({ message = 'Chưa có dữ liệu' }: { message?: string }) {
  return (
    <EmptyState
      icon={<Inbox className="h-16 w-16" />}
      title={message}
      description="Dữ liệu sẽ xuất hiện ở đây khi có sẵn"
    />
  );
}

export function ErrorState({
  message = 'Đã có lỗi xảy ra',
  onRetry
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      icon={<AlertCircle className="h-16 w-16 text-red-500" />}
      title={message}
      description="Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp diễn"
      action={onRetry ? { label: 'Thử lại', onClick: onRetry } : undefined}
    />
  );
}

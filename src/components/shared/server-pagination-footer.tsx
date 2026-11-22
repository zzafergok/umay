'use client';

import {
  PaginationControls,
  type PaginationInfo,
} from '@/components/core/pagination';

interface ServerPaginationFooterProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function ServerPaginationFooter({
  page,
  pageSize,
  total,
  totalPages,
  disabled = false,
  onPageChange,
  onPageSizeChange,
}: ServerPaginationFooterProps) {
  if (total <= 0) return null;

  const pagination: PaginationInfo = {
    current: page,
    pageSize,
    total,
    totalPages,
  };

  return (
    <div className="border-t border-border/70 pt-3">
      <PaginationControls
        pagination={pagination}
        disabled={disabled}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        showSizeChanger
        pageSizeOptions={[10, 20, 50, 100]}
        pageSizeLabel="Sayfa başına:"
        showTotal
        labels={{
          firstPage: 'İlk sayfa',
          previousPage: 'Önceki sayfa',
          nextPage: 'Sonraki sayfa',
          lastPage: 'Son sayfa',
          jumpPrevious: '5 sayfa geri',
          jumpNext: '5 sayfa ileri',
        }}
      />
    </div>
  );
}

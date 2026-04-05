import { useMemo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import type { Pagination as PaginationType } from '@/types';

interface PaginationProps {
  pagination: PaginationType;
  onPageChange: (page: number) => void;
}

const SIBLING_COUNT = 1;

const range = (start: number, end: number): number[] =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);

const buildPageNumbers = (currentPage: number, totalPages: number): (number | 'dots')[] => {
  const totalSlots = SIBLING_COUNT * 2 + 5;

  if (totalPages <= totalSlots) {
    return range(1, totalPages);
  }

  const leftSibling = Math.max(currentPage - SIBLING_COUNT, 1);
  const rightSibling = Math.min(currentPage + SIBLING_COUNT, totalPages);

  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < totalPages - 1;

  if (!showLeftDots && showRightDots) {
    const leftRange = range(1, 3 + SIBLING_COUNT * 2);
    return [...leftRange, 'dots', totalPages];
  }

  if (showLeftDots && !showRightDots) {
    const rightRange = range(totalPages - (2 + SIBLING_COUNT * 2), totalPages);
    return [1, 'dots', ...rightRange];
  }

  return [1, 'dots', ...range(leftSibling, rightSibling), 'dots', totalPages];
};

const Pagination = ({ pagination, onPageChange }: PaginationProps) => {
  const { currentPage, totalPages, totalCount, limit, hasNextPage, hasPrevPage } = pagination;

  const pages = useMemo(
    () => buildPageNumbers(currentPage, totalPages),
    [currentPage, totalPages],
  );

  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalCount);

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <p className="text-sm text-gray-500">
        Showing <span className="font-medium text-gray-700">{startItem}</span>
        {' – '}
        <span className="font-medium text-gray-700">{endItem}</span>
        {' of '}
        <span className="font-medium text-gray-700">{totalCount}</span> results
      </p>

      <nav aria-label="Pagination" className="flex items-center gap-1">
        {/* Previous */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage}
          aria-label="Previous page"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>

        {/* Page Numbers */}
        {pages.map((page, idx) =>
          page === 'dots' ? (
            <span
              key={`dots-${idx}`}
              className="flex h-9 w-9 items-center justify-center text-sm text-gray-400"
            >
              &hellip;
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              aria-current={page === currentPage ? 'page' : undefined}
              className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors ${
                page === currentPage
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ),
        )}

        {/* Next */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          aria-label="Next page"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
};

export default Pagination;

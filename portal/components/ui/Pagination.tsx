'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface PaginationProps {
    pagination: PaginationInfo;
    onPageChange: (page: number) => void;
    onLimitChange?: (limit: number) => void;
    className?: string;
}

export default function Pagination({
    pagination,
    onPageChange,
    onLimitChange,
    className = '',
}: PaginationProps) {
    const { page, limit, total, totalPages, hasNext, hasPrev } = pagination;

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Show first page
            pages.push(1);

            if (page > 3) {
                pages.push('...');
            }

            // Show pages around current page
            const start = Math.max(2, page - 1);
            const end = Math.min(totalPages - 1, page + 1);

            for (let i = start; i <= end; i++) {
                if (i !== 1 && i !== totalPages) {
                    pages.push(i);
                }
            }

            if (page < totalPages - 2) {
                pages.push('...');
            }

            // Show last page
            if (totalPages > 1) {
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className={`flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 ${className}`}>
            {/* Results info */}
            <div className="flex items-center text-sm text-gray-700">
                <span>
                    Showing {Math.min((page - 1) * limit + 1, total)} to {Math.min(page * limit, total)} of {total} results
                </span>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center space-x-2">
                {/* Previous button */}
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={!hasPrev}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${hasPrev
                        ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900'
                        : 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
                        }`}
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                </button>

                {/* Page numbers */}
                <div className="flex items-center space-x-1">
                    {pageNumbers.map((pageNum, index) => (
                        <button
                            key={index}
                            onClick={() => typeof pageNum === 'number' ? onPageChange(pageNum) : undefined}
                            disabled={typeof pageNum !== 'number'}
                            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${pageNum === page
                                ? 'text-white bg-blue-600 border border-blue-600'
                                : typeof pageNum === 'number'
                                    ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900'
                                    : 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
                                }`}
                        >
                            {pageNum}
                        </button>
                    ))}
                </div>

                {/* Next button */}
                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={!hasNext}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${hasNext
                        ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900'
                        : 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
                        }`}
                >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                </button>
            </div>

            {/* Optional: Items per page selector */}
            {onLimitChange && (
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <span>Items per page:</span>
                    <select
                        value={limit}
                        onChange={(e) => onLimitChange(Number(e.target.value))}
                        className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>
            )}
        </div>
    );
}

'use client';

import { ReactNode } from 'react';
import Pagination, { PaginationInfo } from './Pagination';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T, value: unknown) => ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  emptyAction?: ReactNode;
  className?: string;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export default function DataTable<T extends Record<string, unknown> = Record<string, unknown>>({
  data,
  columns,
  onRowClick,
  emptyMessage = 'No data found',
  emptyAction,
  className = '',
  pagination,
  onPageChange,
  onLimitChange,
}: DataTableProps<T>) {
  // Ensure data is always an array
  const safeData = Array.isArray(data) ? data : [];

  if (safeData.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyMessage}</h3>
        {emptyAction && <div className="mt-4">{emptyAction}</div>}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''
                    }`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {safeData.map((item, rowIndex) => (
              <tr
                key={rowIndex}
                className={`${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } hover:bg-gray-100 ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column, colIndex) => {
                  const value = typeof column.key === 'string'
                    ? (() => {
                      let result: unknown = item;
                      for (const key of column.key.split('.')) {
                        if (result && typeof result === 'object' && key in result) {
                          result = (result as Record<string, unknown>)[key];
                        } else {
                          return undefined;
                        }
                      }
                      return result;
                    })()
                    : item[column.key];

                  const renderedValue = column.render ? column.render(item, value) : value;

                  return (
                    <td key={colIndex} className="px-4 py-2 whitespace-nowrap">
                      {renderedValue as ReactNode}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && onPageChange && (
        <Pagination
          pagination={pagination}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
        />
      )}
    </div>
  );
}

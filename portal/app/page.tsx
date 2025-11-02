"use client";
import AuthWrapper from '@/components/auth/AuthWrapper';
import Layout from '@/components/layout/Layout';
import MetricsCards from '@/components/dashboard/MetricsCards';
import ChartPie from '@/components/ui/ChartPie';
import ChartLine from '@/components/ui/ChartLine';
import { useDashboard } from '@/hooks/useDashboard';
import { RefreshCw } from 'lucide-react';

export default function Home() {
  const { data, loading, error, reload } = useDashboard();
  return (
    <AuthWrapper>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Welcome to ProjectEast</p>
            </div>
            <button
              onClick={reload}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {error && (
            <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">{error}</div>
          )}

          {loading && !data ? (
            <div className="p-6 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded text-gray-900 dark:text-gray-100">Loading metrics...</div>
          ) : data ? (
            <>
              <MetricsCards counts={data.counts} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Messages by Type</h3>
                  <ChartPie data={data.breakdowns.messagesByType.map((d) => ({ label: d.type, value: d.count }))} />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Calls by Type</h3>
                  <ChartPie data={data.breakdowns.callsByType.map((d) => ({ label: d.type, value: d.count }))} />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Media by Type</h3>
                  <ChartPie data={data.breakdowns.mediaByType.map((d) => ({ label: d.type, value: d.count }))} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Messages per Day (last {data.scope.days} days)</h3>
                  <ChartLine data={data.series.messagesPerDay} label="Messages" />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Calls per Day (last {data.scope.days} days)</h3>
                  <ChartLine data={data.series.callsPerDay} label="Calls" />
                </div>
              </div>
            </>
          ) : null}
        </div>
      </Layout>
    </AuthWrapper>
  );
}
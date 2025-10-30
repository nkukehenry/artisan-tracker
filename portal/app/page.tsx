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
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome to Mutindo Tracker Portal</p>
            </div>
            <button
              onClick={reload}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {error && (
            <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded">{error}</div>
          )}

          {loading && !data ? (
            <div className="p-6 bg-white border rounded">Loading metrics...</div>
          ) : data ? (
            <>
              <MetricsCards counts={data.counts} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Messages by Type</h3>
                  <ChartPie data={data.breakdowns.messagesByType.map((d) => ({ label: d.type, value: d.count }))} />
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Calls by Type</h3>
                  <ChartPie data={data.breakdowns.callsByType.map((d) => ({ label: d.type, value: d.count }))} />
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Media by Type</h3>
                  <ChartPie data={data.breakdowns.mediaByType.map((d) => ({ label: d.type, value: d.count }))} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Messages per Day (last {data.scope.days} days)</h3>
                  <ChartLine data={data.series.messagesPerDay} label="Messages" />
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Calls per Day (last {data.scope.days} days)</h3>
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
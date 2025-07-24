import React, { useState, useEffect } from 'react';
import KpiCard from '../components/admin/KpiCard';
import ActivityChart from '../components/admin/ActivityChart';
import RecentEvents from '../components/admin/RecentEvents';
import ResourceUtilization from '../components/admin/ResourceUtilization';
import QuickActions from '../components/admin/QuickActions';
import useApi from '../hooks/useApi';
import DateRangePicker from '../components/ui/DateRangePicker';
import Card from '../components/ui/Card';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: { value: 0, change: 0 },
    apiRequests: { value: 0, avgResponseTime: 0 },
    serverHealth: 'Operational',
    failedJobs: 0,
  });
  const { loading, callApi } = useApi();

  useEffect(() => {
    const fetchStats = async () => {
      // const data = await callApi('get', '/admin/stats');
      // setStats(data);

      // Mock data for now
      setStats({
        totalUsers: { value: 1234, change: 5.4 },
        apiRequests: { value: 2100000, avgResponseTime: 120 },
        serverHealth: 'Operational',
        failedJobs: 12,
      });
    };

    fetchStats();
  }, [callApi]);

  return (
    <Card className="flex-grow p-6 bg-black text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Card>
          <DateRangePicker />
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Total Active Users"
          value={stats.totalUsers.value.toLocaleString()}
          change={`${stats.totalUsers.change}% from yesterday`}
          loading={loading}
        />
        <KpiCard
          title="API Requests"
          value={stats.apiRequests.value.toLocaleString()}
          change={`avg. ${stats.apiRequests.avgResponseTime}ms`}
          loading={loading}
        />
        <KpiCard
          title="Server Health"
          value={stats.serverHealth}
          change="All systems green"
          loading={loading}
        />
        <KpiCard
          title="Failed Jobs"
          value={stats.failedJobs}
          change="in last 24h"
          loading={loading}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <ActivityChart />
        </div>
        <div className="grid gap-6">
          <ResourceUtilization />
          <QuickActions />
        </div>
      </div>
      <div className="mt-6">
        <RecentEvents />
      </div>
    </Card>
  );
}

export default AdminDashboard;
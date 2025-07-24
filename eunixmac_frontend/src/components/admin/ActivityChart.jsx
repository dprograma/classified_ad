import React from 'react';
import React from 'react';
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../ui/Card';
import Skeleton from '../ui/Skeleton';
import useApi from '../../hooks/useApi';

const ActivityChart = () => {
  const [data, setData] = useState([]);
  const { loading, callApi } = useApi();

  useEffect(() => {
    const fetchData = async () => {
      // const result = await callApi('get', '/admin/activity');
      // setData(result);

      // Mock data for now
      setData([
        { name: 'Jan', 'API Requests': 4000, 'New Users': 2400 },
        { name: 'Feb', 'API Requests': 3000, 'New Users': 1398 },
        { name: 'Mar', 'API Requests': 2000, 'New Users': 9800 },
        { name: 'Apr', 'API Requests': 2780, 'New Users': 3908 },
        { name: 'May', 'API Requests': 1890, 'New Users': 4800 },
        { name: 'Jun', 'API Requests': 2390, 'New Users': 3800 },
        { name: 'Jul', 'API Requests': 3490, 'New Users': 4300 },
      ]);
    };

    fetchData();
  }, [callApi]);

  if (loading) {
    return (
      <Card className="h-80">
        <Skeleton className="h-full w-full" />
      </Card>
    );
  }

  return (
    <Card className="h-80">
      <h3 className="text-gray-400 text-sm font-medium mb-4">Activity Timeline</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} aria-label="Activity Timeline Chart">
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              borderColor: '#374151',
            }}
          />
          <Legend wrapperStyle={{ color: '#9CA3AF' }} />
          <Line type="monotone" dataKey="API Requests" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="New Users" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default ActivityChart;
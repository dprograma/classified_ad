import React from 'react';
import React from 'react';
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import Card from '../ui/Card';
import Skeleton from '../ui/Skeleton';
import useApi from '../../hooks/useApi';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

const ResourceUtilization = () => {
  const [data, setData] = useState([]);
  const { loading, callApi } = useApi();

  useEffect(() => {
    const fetchData = async () => {
      // const result = await callApi('get', '/admin/resources');
      // setData(result);

      // Mock data for now
      setData([
        { name: 'CPU Load', value: 65 },
        { name: 'Memory Usage', value: 80 },
        { name: 'Database Storage', value: 45 },
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
      <h3 className="text-gray-400 text-sm font-medium mb-4">Resource Utilization</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            aria-label="Resource Utilization Chart"
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend wrapperStyle={{ color: '#9CA3AF' }} />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default ResourceUtilization;
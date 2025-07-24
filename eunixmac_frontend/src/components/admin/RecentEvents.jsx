import React, { useState, useEffect } from 'react';
import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Skeleton from '../ui/Skeleton';
import useApi from '../../hooks/useApi';

const RecentEvents = () => {
  const [events, setEvents] = useState([]);
  const { loading, callApi } = useApi();

  useEffect(() => {
    const fetchEvents = async () => {
      // const data = await callApi('get', '/admin/events');
      // setEvents(data);

      // Mock data for now
      setEvents([
        { id: 1, type: 'User Login Failed', timestamp: '2023-10-27T10:00:00Z', userId: 'user-123' },
        { id: 2, type: 'Database Backup Complete', timestamp: '2023-10-27T09:30:00Z', userId: 'system' },
        { id: 3, type: 'New Admin Added', timestamp: '2023-10-27T09:00:00Z', userId: 'admin-456' },
        { id: 4, type: 'API Key Revoked', timestamp: '2023-10-27T08:30:00Z', userId: 'user-789' },
        { id: 5, type: 'Server Restarted', timestamp: '2023-10-27T08:00:00Z', userId: 'system' },
      ]);
    };

    fetchEvents();
  }, [callApi]);

  if (loading) {
    return (
      <Card>
        <h3 className="text-gray-400 text-sm font-medium mb-4">Recent Events</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-400 uppercase bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3">Event</th>
                <th scope="col" className="px-6 py-3">Timestamp</th>
                <th scope="col" className="px-6 py-3">User/System ID</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="bg-gray-800 border-b border-gray-700">
                  <td className="px-6 py-4"><Skeleton className="h-4 w-3/4" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-1/2" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-1/4" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-gray-400 text-sm font-medium mb-4">Recent Events</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-400">
          <thead className="text-xs text-gray-400 uppercase bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3">Event</th>
              <th scope="col" className="px-6 py-3">Timestamp</th>
              <th scope="col" className="px-6 py-3">User/System ID</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="bg-gray-800 border-b border-gray-700">
                <td className="px-6 py-4">{event.type}</td>
                <td className="px-6 py-4">{new Date(event.timestamp).toLocaleString()}</td>
                <td className="px-6 py-4">{event.userId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default RecentEvents;
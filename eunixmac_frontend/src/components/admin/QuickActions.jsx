import React from 'react';
import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Skeleton from '../ui/Skeleton';
import useApi from '../../hooks/useApi';

const QuickActions = () => {
  const { loading, callApi } = useApi();

  if (loading) {
    return (
      <Card>
        <h3 className="text-gray-400 text-sm font-medium mb-4">Quick Actions</h3>
        <div className="flex flex-col space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-gray-400 text-sm font-medium mb-4">Quick Actions</h3>
      <div className="flex flex-col space-y-2">
        <Button>Clear Cache</Button>
        <Button>Run System Diagnostics</Button>
        <Button>Create New User</Button>
      </div>
    </Card>
  );
};

export default QuickActions;
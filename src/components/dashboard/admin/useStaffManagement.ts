// src/components/dashboard/admin/useStaffManagement.ts
'use client';

import { useState, useEffect } from 'react';

interface Staff {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  employeeId: string;
  department: string;
  createdAt: string;
  updatedAt: string;
}

export const useStaffManagement = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/staff');
      
      if (!response.ok) {
        throw new Error('Failed to fetch staff');
      }
      
      const data = await response.json();
      setStaff(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const deleteStaff = async (id: string) => {
    try {
      const response = await fetch(`/api/staff/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete staff');
      }

      // Remove from local state
      setStaff(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  return {
    staff,
    loading,
    error,
    refetchStaff: fetchStaff,
    deleteStaff
  };
};
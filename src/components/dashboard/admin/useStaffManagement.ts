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
      console.log('🔄 Fetching staff from API...');
      
      const response = await fetch('/api/staff', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add cache busting to ensure fresh data
        cache: 'no-store'
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('📊 Raw API data:', data);
      console.log('📊 Data type:', typeof data);
      console.log('📊 Is array:', Array.isArray(data));
      console.log('📊 Data length:', Array.isArray(data) ? data.length : 'Not array');
      
      if (Array.isArray(data)) {
        console.log('👥 Staff received:', data.map(s => ({
          id: s.id,
          name: s.name,
          role: s.role,
          employeeId: s.employeeId
        })));
        setStaff(data);
        setError(''); // Clear any previous error
      } else {
        console.error('❌ Data is not an array:', data);
        throw new Error('Invalid data format received from server');
      }
    } catch (error) {
      console.error('❌ fetchStaff error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      setStaff([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const deleteStaff = async (id: string) => {
    try {
      console.log('🗑️ Deleting staff with ID:', id);
      
      const response = await fetch(`/api/staff/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Delete error response:', errorText);
        throw new Error(`Failed to delete staff: ${errorText}`);
      }

      console.log('✅ Staff deleted successfully');
      
      // Remove from local state
      setStaff(prev => {
        const updated = prev.filter(s => s.id !== id);
        console.log('📊 Updated staff list length:', updated.length);
        return updated;
      });
    } catch (error) {
      console.error('❌ deleteStaff error:', error);
      throw error;
    }
  };

  useEffect(() => {
    console.log('🚀 useStaffManagement hook mounted, fetching staff...');
    fetchStaff();
  }, []);

  // Debug log whenever staff state changes
  useEffect(() => {
    console.log('📊 Staff state updated:', {
      count: staff.length,
      loading,
      error,
      staff: staff.map(s => ({ name: s.name, role: s.role }))
    });
  }, [staff, loading, error]);

  return {
    staff,
    setStaff,
    loading,
    error,
    refetchStaff: fetchStaff,
    deleteStaff
  };
};
// src/components/dashboard/admin/StaffForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { Shield, X } from 'lucide-react';

interface StaffData {
  id?: string;
  name: string;
  email: string;
  username: string;
  password: string;
  role: string;
  employeeId: string;
  createdAt?: string;
  updatedAt?: string;
}

interface StaffFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingStaff?: StaffData | null;
  mode: 'add' | 'edit' | 'view';
}

const ROLES = [
  { value: 'DOKTER_SPESIALIS', label: 'Dokter Spesialis' },
  { value: 'PERAWAT_RUANGAN', label: 'Perawat Ruangan' },
  { value: 'PERAWAT_POLI', label: 'Perawat Poli' },
  { value: 'FARMASI', label: 'Farmasi' },
  { value: 'ADMINISTRASI', label: 'Administrasi' },
  { value: 'MANAJER', label: 'Manajer' },
  { value: 'AHLI_GIZI', label: 'Ahli Gizi' }
];

export default function StaffForm({ isOpen, onClose, onSuccess, editingStaff, mode }: StaffFormProps) {
  const [formData, setFormData] = useState<StaffData>({
    name: '',
    email: '',
    username: '',
    password: '',
    role: '',
    employeeId: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode === 'add') {
      setFormData({
        name: '',
        email: '',
        username: '',
        password: '',
        role: '',
        employeeId: ''
      });
    } else if (editingStaff && (mode === 'edit' || mode === 'view')) {
      setFormData({
        ...editingStaff,
        password: ''
      });
    }
    setError('');
  }, [editingStaff, mode, isOpen]);

  const generateEmployeeId = async (role: string, excludeCurrentId?: string) => {
    const prefixes: { [key: string]: string } = {
      'DOKTER_SPESIALIS': 'DOK',
      'PERAWAT_RUANGAN': 'NUR',
      'PERAWAT_POLI': 'NUP',
      'FARMASI': 'PHA',
      'ADMINISTRASI': 'AS',
      'MANAJER': 'MN',
      'AHLI_GIZI': 'NUT'
    };

    const prefix = prefixes[role] || 'EMP';

    try {
      const response = await fetch('/api/staff');
      if (response.ok) {
        const staffList = await response.json();
        const sameRoleStaff = staffList.filter((staff: any) =>
          staff.role === role && staff.id !== excludeCurrentId
        );
        const nextNumber = (sameRoleStaff.length + 1).toString().padStart(3, '0');
        return `${prefix}${nextNumber}`;
      }
    } catch (error) {
      console.error('Error generating employee ID:', error);
    }

    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${randomNum}`;
  };

  const handleRoleChange = async (role: string) => {
    const excludeId = mode === 'edit' && editingStaff ? editingStaff.id : undefined;
    const employeeId = await generateEmployeeId(role, excludeId);

    setFormData(prev => ({
      ...prev,
      role,
      employeeId
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'view') return;

    setIsLoading(true);
    setError('');

    try {
      const url = mode === 'edit' && editingStaff
        ? `/api/staff/${editingStaff.id}`
        : '/api/staff';

      const method = mode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong');
      }

      onSuccess();
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'add':
        return 'Tambah Staff Baru';
      case 'edit':
        return 'Edit Staff';
      case 'view':
        return 'Detail Staff';
      default:
        return 'Staff Form';
    }
  };

  const getRoleDisplayName = (role: string) => {
    const roleData = ROLES.find(r => r.value === role);
    return roleData ? roleData.label : role;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-green-50">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Shield className="h-6 w-6 mr-2 text-green-600" />
            {getModalTitle()}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-900 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role {mode !== "view" && (
                  <span className="text-red-500">*</span>
                )}
              </label>
              {mode === 'view' ? (
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {getRoleDisplayName(formData.role)}
                </div>
              ) : (
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                >
                  <option value="">Pilih role</option>
                  {ROLES.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee ID
              </label>
              <input
                type="text"
                readOnly
                value={formData.employeeId}
                className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                {mode === 'add' ? 'Auto-generate' : 'Auto-generate'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Lengkap {mode !== "view" && (
                  <span className="text-red-500">*</span>
                )}
              </label>
              {mode === 'view' ? (
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {formData.name}
                </div>
              ) : (
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Masukkan nama lengkap"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email {mode !== "view" && (
                  <span className="text-red-500">*</span>
                )}
              </label>
              {mode === 'view' ? (
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {formData.email}
                </div>
              ) : (
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Masukkan email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username {mode !== "view" && (
                  <span className="text-red-500">*</span>
                )}
              </label>
              {mode === 'view' ? (
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {formData.username}
                </div>
              ) : (
                <input
                  type="text"
                  required
                  autoComplete="off"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700"
                  placeholder="Masukkan username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              )}
            </div>

            {mode !== 'view' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password {mode === 'add' && <span className="text-red-500">*</span>}

                </label>
                <input
                  type="password"
                  required={mode === 'add'}
                  autoComplete="new-password"
                  className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder={mode === 'edit' ? "" : "Masukkan password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                {mode === 'edit' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Kosongkan jika tidak ingin mengubah password
                  </p>
                )}
              </div>
            )}

            {mode === 'view' && formData.createdAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Dibuat
                </label>
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {new Date(formData.createdAt).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            )}
          </div>

          {mode !== 'view' && (
            <div className="text-xs text-gray-500 mt-4">
              <span className="text-red-500">*</span> Field wajib diisi
            </div>
          )}


          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              disabled={isLoading}
            >
              {mode === 'view' ? 'Tutup' : 'Batal'}
            </button>
            {mode !== 'view' && (
              <button
                type="submit"
                disabled={isLoading}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Menyimpan...' : (mode === 'edit' ? 'Update Staff' : 'Simpan Staff')}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
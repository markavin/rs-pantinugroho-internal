import React, { useState, useEffect } from 'react';
import { Search, Plus, Users, Activity, TrendingUp, AlertCircle, Shield, UserCheck, Settings, BarChart3, PieChart, Calendar, FileText, Database } from 'lucide-react';

// Mock data for admin dashboard
const mockStaff = [
  {
    id: '1',
    name: 'Dr. Sarah Ahmad',
    role: 'DOKTER_SPESIALIS',
    username: 'sarah.ahmad',
    email: 'sarah.ahmad@rspn.com',
    employeeId: 'DOK001',
    department: 'Penyakit Dalam',
    status: 'Aktif',
    lastLogin: '2024-01-15 09:30'
  },
  {
    id: '2',
    name: 'Ns. Maya Sari',
    role: 'PERAWAT_RUANGAN',
    username: 'maya.sari',
    email: 'maya.sari@rspn.com',
    employeeId: 'PER001',
    department: 'Ruang Diabetes',
    status: 'Aktif',
    lastLogin: '2024-01-15 08:15'
  },
  {
    id: '3',
    name: 'Ns. Andi Pratama',
    role: 'PERAWAT_POLI',
    username: 'andi.pratama',
    email: 'andi.pratama@rspn.com',
    employeeId: 'PER002',
    department: 'Poli Endokrin',
    status: 'Aktif',
    lastLogin: '2024-01-15 07:45'
  },
  {
    id: '4',
    name: 'Apt. Lisa Dewi',
    role: 'FARMASI',
    username: 'lisa.dewi',
    email: 'lisa.dewi@rspn.com',
    employeeId: 'FAR001',
    department: 'Farmasi',
    status: 'Aktif',
    lastLogin: '2024-01-15 08:30'
  },
  {
    id: '5',
    name: 'Nutr. Rini Wati',
    role: 'AHLI_GIZI',
    username: 'rini.wati',
    email: 'rini.wati@rspn.com',
    employeeId: 'GIZ001',
    department: 'Gizi',
    status: 'Aktif',
    lastLogin: '2024-01-15 09:00'
  }
];

const systemStats = {
  totalStaff: 25,
  activeUsers: 23,
  totalPatients: 156,
  systemUptime: 99.8,
  dailyLogins: 18,
  pendingRegistrations: 3
};

const chartData = {
  staffByRole: [
    { role: 'Dokter', count: 5, color: 'bg-blue-500' },
    { role: 'Perawat Ruangan', count: 8, color: 'bg-teal-500' },
    { role: 'Perawat Poli', count: 6, color: 'bg-cyan-500' },
    { role: 'Farmasi', count: 3, color: 'bg-emerald-500' },
    { role: 'Ahli Gizi', count: 3, color: 'bg-green-500' }
  ],
  weeklyActivity: [
    { day: 'Sen', logins: 22 },
    { day: 'Sel', logins: 25 },
    { day: 'Rab', logins: 18 },
    { day: 'Kam', logins: 21 },
    { day: 'Jum', logins: 19 },
    { day: 'Sab', logins: 15 },
    { day: 'Min', logins: 12 }
  ]
};

interface NewStaff {
  name: string;
  role: string;
  username: string;
  email: string;
  employeeId: string;
  department: string;
  password: string;
}

const AdminDashboard = () => {
  const [staff, setStaff] = useState(mockStaff);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'staff' | 'reports' | 'system'>('dashboard');
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [newStaff, setNewStaff] = useState<NewStaff>({
    name: '',
    role: '',
    username: '',
    email: '',
    employeeId: '',
    department: '',
    password: ''
  });

  const getRoleDisplayName = (role: string) => {
    const roleNames: { [key: string]: string } = {
      'DOKTER_SPESIALIS': 'Dokter Spesialis',
      'PERAWAT_RUANGAN': 'Perawat Ruangan',
      'PERAWAT_POLI': 'Perawat Poli',
      'FARMASI': 'Farmasi',
      'AHLI_GIZI': 'Ahli Gizi'
    };
    return roleNames[role] || role;
  };

  const getRoleColor = (role: string) => {
    const roleColors: { [key: string]: string } = {
      'DOKTER_SPESIALIS': 'text-blue-700 bg-blue-50 border-blue-200',
      'PERAWAT_RUANGAN': 'text-teal-700 bg-teal-50 border-teal-200',
      'PERAWAT_POLI': 'text-cyan-700 bg-cyan-50 border-cyan-200',
      'FARMASI': 'text-emerald-700 bg-emerald-50 border-emerald-200',
      'AHLI_GIZI': 'text-green-700 bg-green-50 border-green-200'
    };
    return roleColors[role] || 'text-gray-700 bg-gray-50 border-gray-200';
  };

  const filteredStaff = staff.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();

    const staffMember = {
      id: (staff.length + 1).toString(),
      name: newStaff.name,
      role: newStaff.role,
      username: newStaff.username,
      email: newStaff.email,
      employeeId: newStaff.employeeId,
      department: newStaff.department,
      status: 'Aktif',
      lastLogin: 'Belum pernah login'
    };

    setStaff([...staff, staffMember]);
    setNewStaff({
      name: '',
      role: '',
      username: '',
      email: '',
      employeeId: '',
      department: '',
      password: ''
    });
    setShowAddStaff(false);
  };

  const maxLogins = Math.max(...chartData.weeklyActivity.map(d => d.logins));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Search and Actions Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari staff..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
            System Status
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { key: 'dashboard', label: 'Dashboard', icon: Activity },
                { key: 'staff', label: 'Manajemen Staff', icon: Users },
                { key: 'reports', label: 'Laporan', icon: BarChart3 },
                { key: 'system', label: 'Sistem', icon: Settings }
              ].map(tab => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.key
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Staff</p>
                    <p className="text-2xl font-bold text-gray-900">{systemStats.totalStaff}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserCheck className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">User Aktif</p>
                    <p className="text-2xl font-bold text-gray-900">{systemStats.activeUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Activity className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Login Hari Ini</p>
                    <p className="text-2xl font-bold text-gray-900">{systemStats.dailyLogins}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Database className="h-8 w-8 text-teal-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Pasien</p>
                    <p className="text-2xl font-bold text-gray-900">{systemStats.totalPatients}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Shield className="h-8 w-8 text-emerald-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">System Uptime</p>
                    <p className="text-2xl font-bold text-gray-900">{systemStats.systemUptime}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{systemStats.pendingRegistrations}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Staff Distribution Chart */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribusi Staff by Role</h3>
                <div className="space-y-4">
                  {chartData.staffByRole.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded ${item.color}`}></div>
                        <span className="text-sm font-medium text-gray-700">{item.role}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${item.color}`}
                            style={{ width: `${(item.count / 25) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-gray-900 w-8 text-right">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Login Activity */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Aktivitas Login 7 Hari Terakhir</h3>
                <div className="flex items-end space-x-2 h-40">
                  {chartData.weeklyActivity.map((day, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="bg-green-500 rounded-t w-full transition-all hover:bg-green-600"
                        style={{ height: `${(day.logins / maxLogins) * 120}px` }}
                      ></div>
                      <div className="mt-2 text-center">
                        <p className="text-xs font-medium text-gray-900">{day.logins}</p>
                        <p className="text-xs text-gray-500">{day.day}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Staff Management Tab */}
        {activeTab === 'staff' && (
          <div className="space-y-6">
            {showAddStaff && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Tambah Staff Baru</h3>

                <form onSubmit={handleAddStaff}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Masukkan nama lengkap"
                        value={newStaff.name}
                        onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role
                      </label>
                      <select
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={newStaff.role}
                        onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                      >
                        <option value="">Pilih role</option>
                        <option value="DOKTER_SPESIALIS">Dokter Spesialis</option>
                        <option value="PERAWAT_RUANGAN">Perawat Ruangan</option>
                        <option value="PERAWAT_POLI">Perawat Poli</option>
                        <option value="FARMASI">Farmasi</option>
                        <option value="AHLI_GIZI">Ahli Gizi</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Username"
                        value={newStaff.username}
                        onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Email"
                        value={newStaff.email}
                        onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employee ID
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Employee ID"
                        value={newStaff.employeeId}
                        onChange={(e) => setNewStaff({ ...newStaff, employeeId: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Department"
                        value={newStaff.department}
                        onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Password"
                        value={newStaff.password}
                        onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mt-6 space-x-4">
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Simpan Staff
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddStaff(false)}
                      className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Daftar Staff</h3>
                <button
                  onClick={() => setShowAddStaff(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Staff Baru</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID Karyawan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nama
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStaff.map((person) => (
                      <tr key={person.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {person.employeeId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {person.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(person.role)}`}>
                            {getRoleDisplayName(person.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {person.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium text-green-700 bg-green-50 border border-green-200">
                            {person.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {person.lastLogin}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <button className="text-green-600 hover:text-green-900 font-medium">
                            Edit
                          </button>
                          <button className="text-red-600 hover:text-red-900 font-medium">
                            Reset
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Laporan Sistem</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-blue-900">Laporan Aktivitas User</h4>
                      <p className="text-sm text-blue-700 mt-1">Login & logout tracking</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
                    Generate
                  </button>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-green-900">Laporan Penggunaan Sistem</h4>
                      <p className="text-sm text-green-700 mt-1">Feature usage analytics</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-green-600" />
                  </div>
                  <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">
                    Generate
                  </button>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-green-900">Laporan Security</h4>
                      <p className="text-sm text-green-700 mt-1">Access logs & security events</p>
                    </div>
                    <Shield className="h-8 w-8 text-green-600" />
                  </div>
                  <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">
                    Generate
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Pengaturan Sistem</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Database Status</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Connection Status</span>
                      <span className="text-sm font-medium text-green-600">Connected</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Last Backup</span>
                      <span className="text-sm text-gray-900">2024-01-15 03:00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Database Size</span>
                      <span className="text-sm text-gray-900">2.3 GB</span>
                    </div>
                  </div>
                  <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
                    Backup Now
                  </button>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-4">System Configuration</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Session Timeout</span>
                      <span className="text-sm text-gray-900">30 minutes</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Password Policy</span>
                      <span className="text-sm text-gray-900">Strong</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Auto Logout</span>
                      <span className="text-sm text-green-600">Enabled</span>
                    </div>
                  </div>
                  <button className="mt-4 bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700">
                    Configure
                  </button>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4">System Maintenance</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors">
                    Clear Cache
                  </button>
                  <button className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors">
                    System Health Check
                  </button>
                  <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors">
                    Restart Services
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Audit Logs</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Resource
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        2024-01-15 09:30:15
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        sarah.ahmad
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        LOGIN
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        /dashboard/doctor
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          SUCCESS
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        2024-01-15 09:25:42
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        maya.sari
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        CREATE_PATIENT
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Patient RM1015
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          SUCCESS
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        2024-01-15 09:20:18
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        admin
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        CREATE_USER
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Staff DOK002
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          SUCCESS
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        2024-01-15 08:45:33
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        unknown
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        FAILED_LOGIN
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        /auth/login
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                          FAILED
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
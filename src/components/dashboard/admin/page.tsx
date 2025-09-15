import React, { useState, useEffect } from 'react';
import { Search, Plus, Users, Activity, TrendingUp, AlertCircle, Shield, UserCheck, Settings, BarChart3, PieChart, Calendar, FileText, Database, Edit, Trash2, Eye, Menu, X } from 'lucide-react';
import StaffForm from './StaffForm';
import { useStaffManagement } from './useStaffManagement';

const AdminDashboard = () => {
  const { staff, setStaff, loading, error, refetchStaff, deleteStaff } = useStaffManagement();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'staff' | 'system'>('dashboard');
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formMode, setFormMode] = useState<'add' | 'edit' | 'view'>('add');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [realTimeStats, setRealTimeStats] = useState({
    totalStaff: 0,
    dailyLogins: 0,
    weeklyActivity: [],
    distribution: []
  });

  // Fetch real-time statistics
  useEffect(() => {
    const fetchRealTimeStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        if (response.ok) {
          const data = await response.json();
          setRealTimeStats(data);
        }
      } catch (error) {
        console.error('Error fetching real-time stats:', error);
      }
    };

    // Initial fetch
    fetchRealTimeStats();

    // Update every 30 seconds for real-time data
    const interval = setInterval(fetchRealTimeStats, 30000);

    return () => clearInterval(interval);
  }, []);


  const getRoleDisplayName = (role: string) => {
    const roleNames: { [key: string]: string } = {
      'DOKTER_SPESIALIS': 'Dokter Spesialis',
      'PERAWAT_RUANGAN': 'Perawat Ruangan',
      'PERAWAT_POLI': 'Perawat Poli',
      'FARMASI': 'Farmasi',
      'ADMINISTRASI': 'Administrasi',
      'MANAJER': 'Manajer',
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
      'ADMINISTRASI': 'text-gray-700 bg-gray-50 border-gray-200',
      'MANAJER': 'text-amber-700 bg-amber-50 border-amber-200',
      'AHLI_GIZI': 'text-green-700 bg-green-50 border-green-200'
    };
    return roleColors[role] || 'text-gray-700 bg-gray-50 border-gray-200';
  };

  const refreshData = async () => {
    const fetchData = async () => {
      try {
        const staffResponse = await fetch('api/dashboard?type=staff');
        if (staffResponse.ok) {
          const staffData = await staffResponse.json();
          setStaff(staffData);
        }
      } catch (error) {
        console.error('Error Refreshing data:', error)
      }
    };

    await fetchData();
  };
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredStaff = staff.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStaff = () => {
    setEditingStaff(null);
    setFormMode('add');
    setShowStaffForm(true);
  };

  const handleViewStaff = (staffMember) => {
    setEditingStaff(staffMember);
    setFormMode('view');
    setShowStaffForm(true);
  };

  const handleEditStaff = (staffMember) => {
    setEditingStaff(staffMember);
    setFormMode('edit');
    setShowStaffForm(true);
  };

  const handleDeleteStaff = async (staffId: string, staffName: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus staff ${staffName}? Data akan dihapus permanen dari database.`)) {
      try {
        await deleteStaff(staffId);
        alert('Staff berhasil dihapus');
      } catch (error) {
        alert('Gagal menghapus staff: ' + error.message);
      }
    }
  };

  const handleStaffFormSuccess = () => {
    refetchStaff();
  };

  const handleCloseStaffForm = () => {
    setShowStaffForm(false);
    setEditingStaff(null);
    setFormMode('add');
  };

  const handleTabChange = (tab: 'dashboard' | 'staff' | 'system') => {
    setActiveTab(tab);
    setIsMobileSidebarOpen(false); // Close sidebar when tab is selected
  };

  const maxLogins = Math.max(...realTimeStats.weeklyActivity.map(d => d.logins || 0), 1);

  // Navigation items
  const navigationItems = [
    { key: 'dashboard', label: 'Dashboard', icon: Activity },
    { key: 'staff', label: 'Staff', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 lg:hidden ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-m font-semibold text-gray-900">Menu Admin</h2>
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="p-4 space-y-2">
          {navigationItems.map(item => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => handleTabChange(item.key as any)}
                className={`flex items-center space-x-3 w-full p-3 rounded-lg font-medium text-sm transition-colors ${activeTab === item.key
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <IconComponent className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Mobile Header with Menu Button */}
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="flex items-center space-x-2 bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>

          <button
            onClick={async () => {
              setIsRefreshing(true);
              await refreshData();
              setIsRefreshing(false);
            }}
            disabled={isRefreshing}
            className="flex items-center bg-white px-3 py-2 rounded-lg shadow-sm border border-emerald-500 text-sm text-gray-600 hover:bg-emerald-300 transition-colors disabled:opacity-50"
          >
            {isRefreshing ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full mr-2"></div>
                <span>Refreshing...</span>
              </>
            ) : (
              <>
                <Activity className="h-4 w-4 mr-2 text-emerald-600" />
                <span>Refresh</span>
              </>
            )}
          </button>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-end mb-6">
          <div className="flex items-center justify-center md:justify-end space-x-2 md:space-x-3">
            <button
              onClick={async () => {
                setIsRefreshing(true);
                await refreshData();
                setIsRefreshing(false);
              }}
              disabled={isRefreshing}
              className="flex items-center bg-white px-3 md:px-4 py-2 rounded-lg shadow-sm border border-emerald-500 
                       text-xs md:text-sm text-gray-600 hover:bg-emerald-300 transition-colors disabled:opacity-50"
            >
              {isRefreshing ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full mr-2"></div>
                  <span>Refreshing...</span>
                </>
              ) : (
                <>
                  <Activity className="h-4 w-4 mr-2 text-emerald-600" />
                  <span>Refresh Data</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs - Desktop Only */}
        <div className="bg-white rounded-lg shadow-sm mb-6 hidden lg:block">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-125 px-3 sm:px-6 justify-center overflow-x-auto">
              {navigationItems.map(tab => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-3 sm:px-6 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${activeTab === tab.key
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden xs:inline sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Real-time Stats Cards */}

            <div className="grid grid-cols-2 gap-3 sm:gap-6">
              <div className="bg-gradient-to-br from-white to-green-50 p-3 sm:p-6 rounded-xl shadow-sm border border-green-100 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-2 sm:mb-0">
                    <p className="text-xs sm:text-sm font-medium text-green-600">Total Staff</p>
                    <div className="text-center sm:text-left">
                      <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 text-center">{realTimeStats.totalStaff}</p>
                    </div>
                  </div>
                  <div className="bg-green-100 p-2 sm:p-3 rounded-full w-fit">
                    <Users className="h-5 w-5 sm:h-8 sm:w-8 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-blue-50 p-3 sm:p-6 rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-2 sm:mb-0">
                    <p className="text-xs sm:text-sm font-medium text-blue-600">Login Hari Ini</p>
                    <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 text-center">{realTimeStats.dailyLogins}</p>
                  </div>
                  <div className="bg-blue-100 p-2 sm:p-3 rounded-full w-fit">
                    <Activity className="h-5 w-5 sm:h-8 sm:w-8 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Modern Staff Distribution Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Distribusi Staff by Role</h3>
                  <div className="flex items-center space-x-2 bg-green-50 px-2 sm:px-3 py-1 rounded-full w-fit">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600 font-medium">Live</span>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {realTimeStats.distribution.length > 0 ? realTimeStats.distribution.map((item, index) => {
                    const percentage = (item.count / realTimeStats.totalStaff) * 100;
                    return (
                      <div key={index} className="group">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${item.color} shadow-lg`}></div>
                            <span className="text-xs sm:text-sm font-medium text-gray-700">{item.role}</span>
                          </div>
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <span className="text-xs sm:text-sm text-gray-500">{percentage.toFixed(1)}%</span>
                            <span className="text-xs sm:text-sm font-bold text-gray-900">{item.count}</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 overflow-hidden">
                          <div
                            className={`h-2 sm:h-3 rounded-full transition-all duration-1000 ease-out group-hover:shadow-lg ${item.color}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="text-center py-6 sm:py-8 text-gray-500">
                      <Users className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Memuat distribusi staff...</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Ultra Modern Weekly Activity Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 space-y-2 sm:space-y-0">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900">Aktivitas Login 7 Hari</h3>
                  <div className="flex items-center space-x-2 bg-blue-50 px-2 md:px-3 py-1 rounded-full self-start sm:self-auto">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-blue-600 font-medium">Real-time</span>
                  </div>
                </div>

                <div className="relative">
                  {/* Modern Chart Container */}
                  <div className="flex items-end justify-between space-x-1 sm:space-x-2 md:space-x-3 h-32 sm:h-40 md:h-48 mb-4 md:mb-6 bg-gradient-to-t from-gray-50 to-transparent rounded-lg p-2 md:p-4">
                    {realTimeStats.weeklyActivity.length > 0 ? realTimeStats.weeklyActivity.map((day, index) => {
                      const height = Math.max((day.logins / maxLogins) * (window.innerWidth < 768 ? 80 : 120), 6);
                      const isToday = day.isToday;

                      return (
                        <div key={index} className="flex-1 flex flex-col items-center group relative">
                          {/* Animated Tooltip - Hidden on mobile */}
                          <div className="hidden md:block absolute -top-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                            <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap shadow-lg">
                              <div className="text-center">
                                <div className="font-semibold">{day.logins} login{day.logins !== 1 ? 's' : ''}</div>
                                <div className="text-gray-300">{day.day}</div>
                              </div>
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                            </div>
                          </div>

                          {/* Modern Bar with Gradient */}
                          <div className="relative w-full max-w-4 sm:max-w-6 md:max-w-8 mb-2 md:mb-3">
                            <div
                              className={`w-full rounded-full transition-all duration-700 ease-out transform group-hover:scale-110 ${isToday
                                ? 'bg-gradient-to-t from-green-600 via-green-500 to-green-400 shadow-lg shadow-green-200'
                                : 'bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400 hover:from-blue-700 hover:via-blue-600 hover:to-blue-500 shadow-lg shadow-blue-200'
                                }`}
                              style={{ height: `${height}px` }}
                            >
                              {/* Glossy effect */}
                              <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white to-transparent opacity-30 rounded-full"></div>

                              {/* Today's pulse effect */}
                              {isToday && (
                                <div className="absolute inset-0 rounded-full animate-pulse bg-gradient-to-t from-green-400 to-transparent opacity-50"></div>
                              )}
                            </div>
                          </div>

                          {/* Day Label */}
                          <div className="text-center">
                            <div className={`text-xs sm:text-sm font-bold transition-colors ${isToday ? 'text-green-600' : 'text-gray-900 group-hover:text-blue-600'
                              }`}>
                              {day.logins}
                            </div>
                            <div className={`text-xs mt-1 transition-colors ${isToday ? 'text-green-600 font-semibold' : 'text-gray-500 group-hover:text-blue-500'
                              }`}>
                              {window.innerWidth < 640 ? day.day.substring(0, 3) : day.day}
                            </div>
                            {isToday && (
                              <div className="w-1 h-1 bg-green-400 rounded-full mx-auto mt-1 animate-pulse"></div>
                            )}
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="w-full flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                          <TrendingUp className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm md:text-base">Memuat data aktivitas...</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Summary Stats */}
                  <div className="bg-gray-50 rounded-lg p-3 md:p-4 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs md:text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total 7 hari:</span>
                        <span className="font-semibold text-gray-900">
                          {realTimeStats.weeklyActivity.reduce((sum, day) => sum + (day.logins || 0), 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rata-rata:</span>
                        <span className="font-semibold text-gray-900">
                          {Math.round(realTimeStats.weeklyActivity.reduce((sum, day) => sum + (day.logins || 0), 0) / 7)} /hari
                        </span>
                      </div>
                    </div>

                    {/* Trend indicator */}
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-center space-x-2 text-xs">
                        <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
                        <span className="text-gray-600">Data diperbarui setiap 30 detik</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Staff Management Tab */}
        {activeTab === "staff" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900">Daftar Staff</h3>

                  {/* Search + Button */}
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Search Input */}
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Cari staff..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full md:w-64 text-gray-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>

                    {/* Add Staff Button */}
                    <button
                      onClick={handleAddStaff}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4" />
                      Staff Baru
                    </button>
                  </div>
                </div>
              </div>

              {/* Isi Card */}
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  <span className="ml-2 text-gray-600">Loading...</span>
                </div>
              ) : error ? (
                <div className="p-6 text-center">
                  <p className="text-red-600">Error: {error}</p>
                  <button
                    onClick={refetchStaff}
                    className="mt-2 text-green-600 hover:text-green-800"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            ID Karyawan
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Nama
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Jabatan
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
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
                              <span
                                className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(
                                  person.role
                                )}`}
                              >
                                {getRoleDisplayName(person.role)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {person.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                              <button
                                onClick={() => handleViewStaff(person)}
                                className="text-gray-600 hover:text-gray-900 font-medium inline-flex items-center space-x-1"
                              >
                                <Eye className="h-4 w-4" />
                                <span>Detail</span>
                              </button>
                              <button
                                onClick={() => handleEditStaff(person)}
                                className="text-blue-600 hover:text-blue-900 font-medium inline-flex items-center space-x-1"
                              >
                                <Edit className="h-4 w-4" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteStaff(person.id, person.name)
                                }
                                className="text-red-600 hover:text-red-900 font-medium inline-flex items-center space-x-1"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Delete</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                        {filteredStaff.length === 0 && (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-6 py-8 text-center text-gray-500"
                            >
                              {searchTerm
                                ? "Tidak ada staff yang ditemukan"
                                : "Belum ada data staff"}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card Layout */}
                  <div className="lg:hidden space-y-4 p-4">
                    {filteredStaff.map((person) => (
                      <div
                        key={person.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                      >
                        {/* Header dengan nama dan ID */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-lg">
                              {person.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              ID: {person.employeeId}
                            </p>
                          </div>
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(
                              person.role
                            )}`}
                          >
                            {getRoleDisplayName(person.role)}
                          </span>
                        </div>

                        {/* Email */}
                        <div className="mb-4">
                          <p className="text-sm text-gray-600">{person.email}</p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewStaff(person)}
                            className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
                          >
                            <Eye className="h-4 w-4" />
                            <span>Detail</span>
                          </button>
                          <button
                            onClick={() => handleEditStaff(person)}
                            className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors flex items-center justify-center space-x-1"
                          >
                            <Edit className="h-4 w-4" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteStaff(person.id, person.name)}
                            className="flex-1 bg-red-100 text-red-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-red-200 transition-colors flex items-center justify-center space-x-1"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}

                    {filteredStaff.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>
                          {searchTerm
                            ? "Tidak ada staff yang ditemukan"
                            : "Belum ada data staff"}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Staff Form Modal */}
        <StaffForm
          isOpen={showStaffForm}
          onClose={handleCloseStaffForm}
          onSuccess={handleStaffFormSuccess}
          editingStaff={editingStaff}
          mode={formMode}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
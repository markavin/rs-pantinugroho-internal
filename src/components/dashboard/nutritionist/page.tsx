import React, { useState, useEffect } from 'react';
import {
  Search, Plus, Filter, TrendingUp, Calendar, Users, FileText, Bell, Settings,
  Eye, Edit3, Download, AlertTriangle, CheckCircle, Clock, Target, Activity,
  Scale, Apple, Utensils, BarChart3, PieChart, LineChart, Bookmark,
  X, User, Menu
} from 'lucide-react';

const NutritionistDashboard = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'meal-planning' | 'food-recall' | 'database' | 'analytics' | 'education'>('dashboard');
  const [patients, setPatients] = useState([]);
  const [foodDatabase, setFoodDatabase] = useState([]);
  const [mealEntries, setMealEntries] = useState([]);
  const [nutritionPlans, setNutritionPlans] = useState([]);
  const [foodRecalls, setFoodRecalls] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateMeal, setShowCreateMeal] = useState(false);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showPatientDetail, setShowPatientDetail] = useState(false);
  const [showFoodRecall, setShowFoodRecall] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [realTimeStats, setRealTimeStats] = useState({
    totalPatients: 0,
    activeNutritionPlans: 0,
    foodDatabaseItems: 0,
    averageCompliance: 0,
    weeklyActivity: [],
    complianceDistribution: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch patients from API
        const patientsResponse = await fetch('/api/dashboard?type=patients');
        if (patientsResponse.ok) {
          const patientsData = await patientsResponse.json();
          setPatients(patientsData);
        }

        const foodDatabase = await fetch('/api/dashboard?type=food-items');
        if (foodDatabase.ok) {
          const foodData = await foodDatabase.json();
          setFoodDatabase(foodData);
        }

        const nutritionPlans = await fetch('/api/dashboard?type=nutrition-plans');
        if (nutritionPlans.ok) {
          const nutritionplan = await nutritionPlans.json();
          setNutritionPlans(nutritionplan);
        }

        const mealEntry = await fetch('/api/dashboard?type=meal-entries');
        if (mealEntry.ok) {
          const mealentries = await mealEntry.json();
          setMealEntries(mealentries);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to empty arrays if API fails
        setPatients([]);
        setFoodDatabase([]);
        setNutritionPlans([]);
        setMealEntries([]);
      }
    };

    fetchData();
  }, []);

  // Fetch real-time statistics
  useEffect(() => {
    const fetchRealTimeStats = async () => {
      try {
        const response = await fetch('/api/nutritionist/stats');
        if (response.ok) {
          const data = await response.json();
          setRealTimeStats(data);
        }
      } catch (error) {
        console.error('Error fetching real-time stats:', error);
        // Set default stats
        setRealTimeStats({
          totalPatients: patients.length || 0,
          activeNutritionPlans: nutritionPlans.length || 0,
          foodDatabaseItems: foodDatabase.length || 0,
          averageCompliance: 0,
          weeklyActivity: [],
          complianceDistribution: []
        });
      }
    };

    // Initial fetch
    fetchRealTimeStats();

    // Update every 30 seconds for real-time data
    const interval = setInterval(fetchRealTimeStats, 30000);

    return () => clearInterval(interval);
  }, [patients, nutritionPlans, foodDatabase]);
  
  const refreshData = async () => {
    setIsRefreshing(true);
    const fetchData = async () => {
      try {
        const patientsResponse = await fetch('/api/dashboard?type=patients');
        if (patientsResponse.ok) {
          const patientsData = await patientsResponse.json();
          setPatients(patientsData);
        }
      } catch (error) {
        console.error('Error refreshing data:', error);
      }
    };

    await fetchData();
    setIsRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'monitoring': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'follow_up': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'HIGH': return 'text-red-700 bg-red-50 border-red-200';
      case 'MEDIUM': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'LOW': return 'text-green-700 bg-green-50 border-green-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { category: 'Normal', color: 'text-green-600' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-600' };
    return { category: 'Obese', color: 'text-red-600' };
  };

  const filteredFoods = foodDatabase.filter(food =>
    food.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    food.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPatients = patients.filter(patient =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.mrNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTabChange = (tab: 'dashboard' | 'patients' | 'meal-planning' | 'food-recall' | 'database' | 'analytics' | 'education') => {
    setActiveTab(tab);
    setIsMobileSidebarOpen(false);
  };

  // Navigation items
  const navigationItems = [
    { key: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { key: 'patients', label: 'Pasien', icon: Users },
    { key: 'meal-planning', label: 'Rencana Makan', icon: Utensils },
    { key: 'food-recall', label: 'Food Recall', icon: FileText },
    { key: 'database', label: 'Database Makanan', icon: Apple },
    { key: 'analytics', label: 'Analisis', icon: BarChart3 },
    { key: 'education', label: 'Edukasi', icon: Bookmark }
  ];

  const maxCompliance = Math.max(...realTimeStats.complianceDistribution.map(d => d.count || 0), 1);

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Real-time Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-gradient-to-br from-white to-emerald-50 p-3 sm:p-6 rounded-xl shadow-sm border border-emerald-100 hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <p className="text-xs sm:text-sm font-medium text-emerald-600">Total Pasien</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 text-center">{realTimeStats.totalPatients}</p>
            </div>
            <div className="bg-emerald-100 p-2 sm:p-3 rounded-full w-fit">
              <Users className="h-5 w-5 sm:h-8 sm:w-8 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-blue-50 p-3 sm:p-6 rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <p className="text-xs sm:text-sm font-medium text-blue-600">Rencana Aktif</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 text-center">{realTimeStats.activeNutritionPlans}</p>
            </div>
            <div className="bg-blue-100 p-2 sm:p-3 rounded-full w-fit">
              <Target className="h-5 w-5 sm:h-8 sm:w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-green-50 p-3 sm:p-6 rounded-xl shadow-sm border border-green-100 hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <p className="text-xs sm:text-sm font-medium text-green-600">Database Makanan</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 text-center">{realTimeStats.foodDatabaseItems}</p>
            </div>
            <div className="bg-green-100 p-2 sm:p-3 rounded-full w-fit">
              <Apple className="h-5 w-5 sm:h-8 sm:w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-purple-50 p-3 sm:p-6 rounded-xl shadow-sm border border-purple-100 hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <p className="text-xs sm:text-sm font-medium text-purple-600">Rata-rata Kepatuhan</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 text-center">{realTimeStats.averageCompliance}%</p>
            </div>
            <div className="bg-purple-100 p-2 sm:p-3 rounded-full w-fit">
              <TrendingUp className="h-5 w-5 sm:h-8 sm:w-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Compliance Distribution Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Distribusi Kepatuhan Pasien</h3>
            <div className="flex items-center space-x-2 bg-emerald-50 px-2 sm:px-3 py-1 rounded-full w-fit">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-emerald-600 font-medium">Live</span>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {realTimeStats.complianceDistribution.length > 0 ? realTimeStats.complianceDistribution.map((item, index) => {
              const percentage = realTimeStats.totalPatients > 0 ? (item.count / realTimeStats.totalPatients) * 100 : 0;
              return (
                <div key={index} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${item.color} shadow-lg`}></div>
                      <span className="text-xs sm:text-sm font-medium text-gray-700">{item.range}</span>
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
                <PieChart className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Memuat distribusi kepatuhan...</p>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Activity Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 space-y-2 sm:space-y-0">
            <h3 className="text-base md:text-lg font-semibold text-gray-900">Aktivitas Food Recall 7 Hari</h3>
            <div className="flex items-center space-x-2 bg-blue-50 px-2 md:px-3 py-1 rounded-full self-start sm:self-auto">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-blue-600 font-medium">Real-time</span>
            </div>
          </div>

          <div className="relative">
            {/* Modern Chart Container */}
            <div className="flex items-end justify-between space-x-1 sm:space-x-2 md:space-x-3 h-32 sm:h-40 md:h-48 mb-4 md:mb-6 bg-gradient-to-t from-gray-50 to-transparent rounded-lg p-2 md:p-4">
              {realTimeStats.weeklyActivity.length > 0 ? realTimeStats.weeklyActivity.map((day, index) => {
                const maxRecalls = Math.max(...realTimeStats.weeklyActivity.map(d => d.recalls || 0), 1);
                const height = Math.max((day.recalls / maxRecalls) * (window.innerWidth < 768 ? 80 : 120), 6);
                const isToday = day.isToday;

                return (
                  <div key={index} className="flex-1 flex flex-col items-center group relative">
                    {/* Animated Tooltip - Hidden on mobile */}
                    <div className="hidden md:block absolute -top-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                      <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap shadow-lg">
                        <div className="text-center">
                          <div className="font-semibold">{day.recalls} recall{day.recalls !== 1 ? 's' : ''}</div>
                          <div className="text-gray-300">{day.day}</div>
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>

                    {/* Modern Bar with Gradient */}
                    <div className="relative w-full max-w-4 sm:max-w-6 md:max-w-8 mb-2 md:mb-3">
                      <div
                        className={`w-full rounded-full transition-all duration-700 ease-out transform group-hover:scale-110 ${isToday
                          ? 'bg-gradient-to-t from-emerald-600 via-emerald-500 to-emerald-400 shadow-lg shadow-emerald-200'
                          : 'bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400 hover:from-blue-700 hover:via-blue-600 hover:to-blue-500 shadow-lg shadow-blue-200'
                          }`}
                        style={{ height: `${height}px` }}
                      >
                        {/* Glossy effect */}
                        <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white to-transparent opacity-30 rounded-full"></div>

                        {/* Today's pulse effect */}
                        {isToday && (
                          <div className="absolute inset-0 rounded-full animate-pulse bg-gradient-to-t from-emerald-400 to-transparent opacity-50"></div>
                        )}
                      </div>
                    </div>

                    {/* Day Label */}
                    <div className="text-center">
                      <div className={`text-xs sm:text-sm font-bold transition-colors ${isToday ? 'text-emerald-600' : 'text-gray-900 group-hover:text-blue-600'
                        }`}>
                        {day.recalls}
                      </div>
                      <div className={`text-xs mt-1 transition-colors ${isToday ? 'text-emerald-600 font-semibold' : 'text-gray-500 group-hover:text-blue-500'
                        }`}>
                        {window.innerWidth < 640 ? day.day.substring(0, 3) : day.day}
                      </div>
                      {isToday && (
                        <div className="w-1 h-1 bg-emerald-400 rounded-full mx-auto mt-1 animate-pulse"></div>
                      )}
                    </div>
                  </div>
                );
              }) : (
                <div className="w-full flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Activity className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-2 opacity-50" />
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
                    {realTimeStats.weeklyActivity.reduce((sum, day) => sum + (day.recalls || 0), 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rata-rata:</span>
                  <span className="font-semibold text-gray-900">
                    {Math.round(realTimeStats.weeklyActivity.reduce((sum, day) => sum + (day.recalls || 0), 0) / 7)} /hari
                  </span>
                </div>
              </div>

              {/* Trend indicator */}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-2 text-xs">
                  <Activity className="h-3 w-3 md:h-4 md:w-4 text-emerald-500" />
                  <span className="text-gray-600">Data diperbarui setiap 30 detik</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPatients = () => (
    <div className="space-y-6">
      {/* Patient List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-lg font-semibold text-gray-900">Daftar Pasien</h3>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Cari pasien..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-full md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium whitespace-nowrap">
                <Plus className="w-4 h-4" />
                Pasien Baru
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Pasien
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Data Fisik
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status Nutrisi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Kepatuhan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? "Tidak ada pasien yang ditemukan" : "Belum ada data pasien"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Layout */}
        <div className="lg:hidden space-y-4 p-4">
          {filteredPatients.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{searchTerm ? "Tidak ada pasien yang ditemukan" : "Belum ada data pasien"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderMealPlanning = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Rencana Makan</h3>
      <div className="text-center py-8 text-gray-500">
        <Utensils className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>Fitur rencana makan akan segera tersedia</p>
      </div>
    </div>
  );

  const renderFoodRecall = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Food Recall</h3>
      <div className="text-center py-8 text-gray-500">
        <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>Fitur food recall akan segera tersedia</p>
      </div>
    </div>
  );

  const renderFoodDatabase = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Database Makanan</h3>
      <div className="text-center py-8 text-gray-500">
        <Apple className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>Database makanan akan segera tersedia</p>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Analisis</h3>
      <div className="text-center py-8 text-gray-500">
        <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>Fitur analisis akan segera tersedia</p>
      </div>
    </div>
  );

  const renderEducation = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Edukasi</h3>
      <div className="text-center py-8 text-gray-500">
        <Bookmark className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>Modul edukasi akan segera tersedia</p>
      </div>
    </div>
  );

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
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
          <h2 className="text-lg font-bold">Menu Gizi</h2>
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="h-5 w-5" />
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
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
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
            <nav className="-mb-px flex space-x-8 px-3 sm:px-6 justify-center overflow-x-auto">
              {navigationItems.map(tab => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-3 sm:px-6 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${activeTab === tab.key
                        ? 'border-emerald-500 text-emerald-600'
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

        {/* Tab Content */}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'patients' && renderPatients()}
        {activeTab === 'meal-planning' && renderMealPlanning()}
        {activeTab === 'food-recall' && renderFoodRecall()}
        {activeTab === 'database' && renderFoodDatabase()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'education' && renderEducation()}
      </div>
    </div>
  );
};

export default NutritionistDashboard;
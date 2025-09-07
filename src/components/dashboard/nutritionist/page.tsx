import React, { useState, useEffect } from 'react';
import {
  Search, Plus, Filter, TrendingUp, Calendar, Users, FileText, Bell, Settings,
  Eye, Edit3, Download, AlertTriangle, CheckCircle, Clock, Target, Activity,
  Scale, Apple, Utensils, BarChart3, PieChart, LineChart, Bookmark,
  X,
  User
} from 'lucide-react';
import { mockPatients, Patient, FoodItem, MealEntry, NutritionPlan, FoodRecall, mockFoodData, mockNutritionPlans, mockMealEntries } from '@/data/mockData';

const NutritionistDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'meal-planning' | 'food-recall' | 'database' | 'analytics' | 'education'>('overview');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [foodDatabase, setFoodDatabase] = useState<FoodItem[]>([]);
  const [mealEntries, setMealEntries] = useState<MealEntry[]>([]);
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>([]);
  const [foodRecalls, setFoodRecalls] = useState<FoodRecall[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateMeal, setShowCreateMeal] = useState(false);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showPatientDetail, setShowPatientDetail] = useState(false);
  const [showFoodRecall, setShowFoodRecall] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Initialize demo data (integrated with doctor data)
  useEffect(() => {
    // Patient data from doctor dashboard
    setPatients(mockPatients)
    // Enhanced food database with Indonesian foods
    setFoodDatabase(mockFoodData)
    // Nutrition plans
    setNutritionPlans(mockNutritionPlans);
    // Sample meal entries
    setMealEntries(mockMealEntries);
  }, []);

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

  const getGIColor = (gi: number) => {
    if (gi <= 55) return 'text-green-600 bg-green-50 border-green-200';
    if (gi <= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { category: 'Normal', color: 'text-green-600' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-600' };
    return { category: 'Obese', color: 'text-red-600' };
  };

  const filteredFoods = foodDatabase.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    food.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.mrNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTodayCalorieIntake = (patientId: string) => {
    const today = new Date().toISOString().split('T')[0];
    return mealEntries
      .filter(entry => entry.patientId === patientId && entry.date === today)
      .reduce((total, entry) => total + entry.totalCalories, 0);
  };

  const getPatientCompliance = (patientId: string) => {
    const plan = nutritionPlans.find(p => p.patientId === patientId);
    return plan ? plan.compliance : 0;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pasien</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">{patients.length}</p>
              <p className="text-xs text-gray-500 mt-1">pasien dalam program</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl">
              <Users className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rencana Aktif</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">{nutritionPlans.length}</p>
              <p className="text-xs text-gray-500 mt-1">rencana nutrisi</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl">
              <Target className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Database Makanan</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">{foodDatabase.length}</p>
              <p className="text-xs text-gray-500 mt-1">item tersedia</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl">
              <Apple className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rata-rata Kepatuhan</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">
                {Math.round(nutritionPlans.reduce((acc, plan) => acc + plan.compliance, 0) / nutritionPlans.length || 0)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">kepatuhan diet</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>
      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Status Overview */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            Status Nutrisi Pasien Hari Ini
          </h3>
          <div className="space-y-4">
            {patients.map((patient) => {
              const todayIntake = getTodayCalorieIntake(patient.id);
              const percentage = (todayIntake / patient.calorieNeeds) * 100;
              const compliance = getPatientCompliance(patient.id);
              const bmiInfo = getBMICategory(patient.bmi);

              return (
                <div key={patient.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-emerald-700">
                          {patient.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{patient.name}</p>
                        <p className="text-sm text-gray-600">{patient.mrNumber} • {patient.diabetesType}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskColor(patient.riskLevel)}`}>
                        {patient.riskLevel}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${bmiInfo.color}`}>
                        BMI: {patient.bmi}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-600">GDS Terakhir</p>
                      <p className={`text-lg font-semibold ${patient.bloodSugar.value > 140 ? 'text-red-600' : 'text-green-600'}`}>
                        {patient.bloodSugar.value}
                      </p>
                      <p className="text-xs text-gray-500">mg/dL</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-600">Target Kalori</p>
                      <p className="text-lg font-semibold text-green-600">{patient.calorieNeeds}</p>
                      <p className="text-xs text-gray-500">kal/hari</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-600">BB Saat Ini</p>
                      <p className="text-lg font-semibold text-purple-600">{patient.weight}</p>
                      <p className="text-xs text-gray-500">kg</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-600">Kepatuhan</p>
                      <p className={`text-lg font-semibold ${compliance >= 80 ? 'text-green-600' : compliance >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {compliance}%
                      </p>
                      <p className="text-xs text-gray-500">diet</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Kalori Hari Ini</span>
                      <span className="font-medium">{todayIntake} / {patient.calorieNeeds} kal</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div
                        className={`h-full rounded-full transition-all ${percentage > 110 ? 'bg-red-500' :
                            percentage > 90 ? 'bg-yellow-500' : 'bg-emerald-500'
                          }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Food Allergies */}
                  {patient.allergies.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-600 mb-1">Alergi Makanan:</p>
                      <div className="flex flex-wrap gap-1">
                        {patient.allergies.map((allergy, index) => (
                          <span key={index} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full border border-red-200">
                            {allergy}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedPatient(patient);
                        setShowPatientDetail(true);
                      }}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      Detail
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPatient(patient);
                        setShowFoodRecall(true);
                      }}
                      className="flex-1 border border-emerald-500 text-emerald-600 hover:bg-emerald-50 py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 text-sm"
                    >
                      <Utensils className="w-4 h-4" />
                      Recall
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions & Alerts */}
        <div className="space-y-6">
          {/* Nutritional Alerts */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100"><h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-600" />
            Peringatan Nutrisi
          </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Budi Santoso</p>
                  <p className="text-xs text-red-600">Kepatuhan diet sangat rendah (40%). Konsultasi segera diperlukan.</p>
                  <p className="text-xs text-gray-500 mt-1">5 menit lalu</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Ahmad Wijaya</p>
                  <p className="text-xs text-yellow-600">Konsumsi kalori berlebih 150% dari target hari ini.</p>
                  <p className="text-xs text-gray-500 mt-1">15 menit lalu</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Siti Rahayu</p>
                  <p className="text-xs text-blue-600">Food recall belum diisi untuk 2 hari terakhir.</p>
                  <p className="text-xs text-gray-500 mt-1">1 jam lalu</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              Tindakan Cepat
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowCreatePlan(true)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <Target className="w-4 h-4" />
                Buat Rencana Nutrisi
              </button>

              <button
                onClick={() => setShowCreateMeal(true)}
                className="w-full border border-emerald-500 text-emerald-600 hover:bg-emerald-50 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <Utensils className="w-4 h-4" />
                Input Makanan
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className="w-full border border-gray-300 text-gray-600 hover:bg-gray-50 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Analisis Nutrisi
              </button>
            </div>
          </div>

          {/* Weekly Progress Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Kepatuhan Diet 7 Hari
            </h3>
            <div className="space-y-4">
              {patients.slice(0, 3).map((patient) => {
                const compliance = getPatientCompliance(patient.id);
                return (
                  <div key={patient.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{patient.name}</span>
                      <span className="font-medium">{compliance}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div
                        className={`h-full rounded-full ${compliance >= 80 ? 'bg-green-500' :
                            compliance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                        style={{ width: `${compliance}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Education Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-emerald-600" />
          Edukasi & Tips Nutrisi
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-3">
              <Apple className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-blue-800 mb-2">Porsi Makanan Diabetik</h4>
            <p className="text-sm text-blue-700">Panduan praktis mengatur porsi makanan untuk kontrol gula darah optimal.</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-3">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-green-800 mb-2">Cara Menghitung Kalori</h4>
            <p className="text-sm text-green-700">Metode mudah menghitung kebutuhan kalori harian berdasarkan aktivitas.</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-3">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-purple-800 mb-2">Indeks Glikemik</h4>
            <p className="text-sm text-purple-700">Memahami indeks glikemik untuk memilih makanan yang tepat.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPatients = () => (
    <div className="space-y-6">
      {/* Patient List */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Daftar Pasien</h3>
            <div className="flex gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari pasien..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pasien
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Fisik
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status Nutrisi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kepatuhan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.map((patient) => {
                const compliance = getPatientCompliance(patient.id);
                const bmiInfo = getBMICategory(patient.bmi);
                const todayIntake = getTodayCalorieIntake(patient.id);

                return (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-emerald-700">
                            {patient.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                          <div className="text-sm text-gray-500">{patient.mrNumber} • {patient.age}th</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>BB: {patient.weight} kg</div>
                        <div>TB: {patient.height} cm</div>
                        <div className={`${bmiInfo.color}`}>BMI: {patient.bmi}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>Target: {patient.calorieNeeds} kal</div>
                        <div>Hari ini: {todayIntake} kal</div>
                        <div className={`${patient.bloodSugar.value > 140 ? 'text-red-600' : 'text-green-600'}`}>
                          GDS: {patient.bloodSugar.value} mg/dL
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${compliance >= 80 ? 'bg-green-500' :
                                compliance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                            style={{ width: `${compliance}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{compliance}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => {
                          setSelectedPatient(patient);
                          setShowPatientDetail(true);
                        }}
                        className="text-emerald-600 hover:text-emerald-900"
                      >
                        Detail
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPatient(patient);
                          setShowFoodRecall(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Recall
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderMealPlanning = () => (
    <div className="space-y-6">
      {/* Create Meal Plan Form */}
      {showCreatePlan && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Buat Rencana Nutrisi</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Pasien</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                <option value="">Pilih pasien...</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>{patient.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Kalori (kal/hari)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="Contoh: 1800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Batas Karbohidrat (g)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="Contoh: 225"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Protein (g)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="Contoh: 90"
              />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium">
              Simpan Rencana
            </button>
            <button
              onClick={() => setShowCreatePlan(false)}
              className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-lg font-medium"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Existing Nutrition Plans */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Rencana Nutrisi Aktif</h3>
            <button
              onClick={() => setShowCreatePlan(true)}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium"
            >
              <Plus className="w-4 h-4" />
              Buat Rencana
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {nutritionPlans.map((plan) => {
            const patient = patients.find(p => p.id === plan.patientId);
            if (!patient) return null;

            return (
              <div key={plan.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">{patient.name}</h4>
                    <p className="text-sm text-gray-600">{patient.mrNumber} • {patient.diabetesType}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${plan.compliance >= 80 ? 'bg-green-100 text-green-800' :
                        plan.compliance >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                      Kepatuhan: {plan.compliance}%
                    </span>
                    <button className="text-emerald-600 hover:text-emerald-900">
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-600">Target Kalori</p>
                    <p className="text-lg font-semibold text-blue-600">{plan.targetCalories}</p>
                    <p className="text-xs text-gray-500">kal/hari</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-600">Karbohidrat</p>
                    <p className="text-lg font-semibold text-orange-600">{plan.carbLimit}</p>
                    <p className="text-xs text-gray-500">gram</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-600">Protein</p>
                    <p className="text-lg font-semibold text-green-600">{plan.proteinGoal}</p>
                    <p className="text-xs text-gray-500">gram</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-600">Lemak</p>
                    <p className="text-lg font-semibold text-purple-600">{plan.fatLimit}</p>
                    <p className="text-xs text-gray-500">gram</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Distribusi Makanan:</p>
                  <div className="flex gap-2">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">Sarapan: {plan.mealDistribution.breakfast}%</span>
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">Makan Siang: {plan.mealDistribution.lunch}%</span>
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">Makan Malam: {plan.mealDistribution.dinner}%</span>
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">Snack: {plan.mealDistribution.snacks}%</span>
                  </div>
                </div>

                {plan.restrictions.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Pembatasan:</p>
                    <div className="flex flex-wrap gap-1">
                      {plan.restrictions.map((restriction, index) => (
                        <span key={index} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded border border-red-200">
                          {restriction}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Target:</p>
                  <div className="flex flex-wrap gap-1">
                    {plan.goals.map((goal, index) => (
                      <span key={index} className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded border border-emerald-200">
                        {goal}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderFoodDatabase = () => (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Database Makanan</h3>
          <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium">
            <Plus className="w-4 h-4" />
            Tambah Makanan
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Cari makanan..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
            <option value="">Semua Kategori</option>
            <option value="Karbohidrat">Karbohidrat</option>
            <option value="Protein Hewani">Protein Hewani</option>
            <option value="Protein Nabati">Protein Nabati</option>
            <option value="Sayuran">Sayuran</option>
            <option value="Buah">Buah</option>
            <option value="Lemak Sehat">Lemak Sehat</option>
            <option value="Snack Sehat">Snack Sehat</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFoods.map((food) => (
            <div key={food.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{food.name}</h4>
                  <p className="text-sm text-gray-600">{food.category}</p>
                  <p className="text-xs text-gray-500">{food.portion}</p>
                </div>
                <div className="flex gap-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getGIColor(food.glycemicIndex)}`}>
                    GI: {food.glycemicIndex}
                  </span>
                  {food.diabeticFriendly && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                      Aman
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div className="bg-blue-50 rounded p-2 text-center">
                  <p className="text-blue-600 font-medium">{food.calories}</p>
                  <p className="text-gray-600">Kalori</p>
                </div>
                <div className="bg-orange-50 rounded p-2 text-center">
                  <p className="text-orange-600 font-medium">{food.carbs}g</p>
                  <p className="text-gray-600">Karbo</p>
                </div>
                <div className="bg-green-50 rounded p-2 text-center">
                  <p className="text-green-600 font-medium">{food.protein}g</p>
                  <p className="text-gray-600">Protein</p>
                </div>
                <div className="bg-purple-50 rounded p-2 text-center">
                  <p className="text-purple-600 font-medium">{food.fat}g</p>
                  <p className="text-gray-600">Lemak</p>
                </div>
              </div>

              <div className="text-xs text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Serat:</span>
                  <span className="font-medium">{food.fiber}g</span>
                </div>
                <div className="flex justify-between">
                  <span>Sodium:</span>
                  <span className="font-medium">{food.sodium}mg</span>
                </div>
                <div className="flex justify-between">
                  <span>Gula:</span>
                  <span className="font-medium">{food.sugar}g</span>
                </div>
              </div>

              <button className="w-full mt-3 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg font-medium text-sm">
                Pilih Makanan
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rata-rata Kepatuhan</p>
              <p className="text-2xl font-bold text-emerald-600">
                {Math.round(nutritionPlans.reduce((acc, plan) => acc + plan.compliance, 0) / nutritionPlans.length || 0)}%
              </p>
            </div>
            <PieChart className="w-8 h-8 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pasien Risiko Tinggi</p>
              <p className="text-2xl font-bold text-red-600">
                {patients.filter(p => p.riskLevel === 'HIGH').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rata-rata BMI</p>
              <p className="text-2xl font-bold text-blue-600">
                {(patients.reduce((acc, p) => acc + p.bmi, 0) / patients.length).toFixed(1)}
              </p>
            </div>
            <Scale className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Food Recalls</p>
              <p className="text-2xl font-bold text-purple-600">
                {mealEntries.length}
              </p>
            </div>
            <FileText className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Detailed Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Compliance Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribusi Kepatuhan Pasien</h3>
          <div className="space-y-4">
            {patients.map((patient) => {
              const compliance = getPatientCompliance(patient.id);
              return (
                <div key={patient.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-emerald-700">
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{patient.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${compliance >= 80 ? 'bg-green-500' :
                            compliance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                        style={{ width: `${compliance}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12">{compliance}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Risk Level Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribusi Tingkat Risiko</h3>
          <div className="space-y-4">
            {['HIGH', 'MEDIUM', 'LOW'].map((risk) => {
              const count = patients.filter(p => p.riskLevel === risk).length;
              const percentage = (count / patients.length) * 100;
              return (
                <div key={risk} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded ${risk === 'HIGH' ? 'bg-red-500' :
                        risk === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                    <span className="text-sm font-medium text-gray-700">
                      Risiko {risk === 'HIGH' ? 'Tinggi' : risk === 'MEDIUM' ? 'Sedang' : 'Rendah'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${risk === 'HIGH' ? 'bg-red-500' :
                            risk === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12">{count} org</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Weekly Nutrition Trends */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tren Nutrisi Mingguan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {patients.slice(0, 3).map((patient) => (
            <div key={patient.id} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">{patient.name}</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Kalori Harian</span>
                  <span className="font-medium">{getTodayCalorieIntake(patient.id)} / {patient.calorieNeeds}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-blue-500 rounded-full"
                    style={{ width: `${Math.min((getTodayCalorieIntake(patient.id) / patient.calorieNeeds) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>GDS: {patient.bloodSugar.value} mg/dL</span>
                  <span>BMI: {patient.bmi}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFoodRecall = () => (
    <div className="space-y-6">
      {showFoodRecall && selectedPatient && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">
              Food Recall - {selectedPatient.name}
            </h3>
            <button
              onClick={() => setShowFoodRecall(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Recall
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Meal Entries for Selected Date */}
          <div className="space-y-4">
            {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => {
              const mealData = mealEntries.filter(entry =>
                entry.patientId === selectedPatient.id &&
                entry.date === selectedDate &&
                entry.mealType === mealType
              );

              return (
                <div key={mealType} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900 capitalize">
                      {mealType === 'breakfast' ? 'Sarapan' :
                        mealType === 'lunch' ? 'Makan Siang' :
                          mealType === 'dinner' ? 'Makan Malam' : 'Snack'}
                    </h4>
                    <button className="text-emerald-600 hover:text-emerald-800 text-sm font-medium">
                      + Tambah Makanan
                    </button>
                  </div>

                  {mealData.length > 0 ? (
                    <div className="space-y-2">
                      {mealData.map((meal) => (
                        <div key={meal.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium text-gray-900">Total: {meal.totalCalories} kalori</p>
                              <p className="text-sm text-gray-600">
                                Karbo: {meal.totalCarbs}g | Protein: {meal.totalProtein}g | Lemak: {meal.totalFat}g
                              </p>
                            </div>
                            {meal.bloodSugarBefore && meal.bloodSugarAfter && (
                              <div className="text-sm text-gray-600">
                                <p>GDS Sebelum: {meal.bloodSugarBefore}</p>
                                <p>GDS Sesudah: {meal.bloodSugarAfter}</p>
                              </div>
                            )}
                          </div>
                          <div className="space-y-1">
                            {meal.foods.map((food, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span>{food.foodName} ({food.portion}g)</span>
                                <span>{food.calories} kal</span>
                              </div>
                            ))}
                          </div>
                          {meal.notes && (
                            <p className="text-sm text-gray-600 mt-2 italic">
                              Catatan: {meal.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Utensils className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Belum ada data makanan untuk {mealType}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Daily Summary */}
          <div className="mt-6 bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <h4 className="font-medium text-emerald-800 mb-3">Ringkasan Harian</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-700">
                  {mealEntries
                    .filter(entry => entry.patientId === selectedPatient.id && entry.date === selectedDate)
                    .reduce((total, entry) => total + entry.totalCalories, 0)
                  }
                </p>
                <p className="text-sm text-emerald-600">Total Kalori</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-700">
                  {mealEntries
                    .filter(entry => entry.patientId === selectedPatient.id && entry.date === selectedDate)
                    .reduce((total, entry) => total + entry.totalCarbs, 0).toFixed(1)
                  }g
                </p>
                <p className="text-sm text-orange-600">Karbohidrat</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-700">
                  {mealEntries
                    .filter(entry => entry.patientId === selectedPatient.id && entry.date === selectedDate)
                    .reduce((total, entry) => total + entry.totalProtein, 0).toFixed(1)
                  }g
                </p>
                <p className="text-sm text-green-600">Protein</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-700">
                  {mealEntries
                    .filter(entry => entry.patientId === selectedPatient.id && entry.date === selectedDate)
                    .reduce((total, entry) => total + entry.totalFat, 0).toFixed(1)
                  }g
                </p>
                <p className="text-sm text-purple-600">Lemak</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Food Recall History */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Riwayat Food Recall</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {patients.map((patient) => (
            <div key={patient.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-emerald-700">
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{patient.name}</h4>
                    <p className="text-sm text-gray-600">{patient.mrNumber} • {patient.diabetesType}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedPatient(patient);
                    setShowFoodRecall(true);
                  }}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium text-sm"
                >
                  Lihat Recall
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-600">Recall Bulan Ini</p>
                  <p className="text-lg font-semibold text-blue-600">12</p>
                  <p className="text-xs text-gray-500">hari</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-600">Rata-rata Kalori</p>
                  <p className="text-lg font-semibold text-green-600">{getTodayCalorieIntake(patient.id) || 1650}</p>
                  <p className="text-xs text-gray-500">kal/hari</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-600">Kepatuhan</p>
                  <p className="text-lg font-semibold text-yellow-600">{getPatientCompliance(patient.id)}%</p>
                  <p className="text-xs text-gray-500">diet</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-600">Tren BB</p>
                  <p className="text-lg font-semibold text-purple-600">-2.3kg</p>
                  <p className="text-xs text-gray-500">30 hari</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {/* <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-emerald-600 text-white rounded-lg p-2 font-bold text-lg">
                KD
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">KAWAN DIABETES</h1>
                <p className="text-sm text-gray-600">Dashboard Ahli Gizi</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="w-6 h-6 text-gray-400 hover:text-gray-600 cursor-pointer" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Ahli Gizi</span>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-sm mb-6 border border-emerald-100">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { key: 'overview', label: 'Overview', icon: TrendingUp },
                { key: 'patients', label: 'Pasien', icon: Users },
                { key: 'meal-planning', label: 'Rencana Makan', icon: Utensils },
                { key: 'food-recall', label: 'Food Recall', icon: FileText },
                { key: 'database', label: 'Database Makanan', icon: Apple },
                { key: 'analytics', label: 'Analisis', icon: BarChart3 },
                { key: 'education', label: 'Edukasi', icon: Bookmark }
              ].map(tab => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.key
                        ? 'border-emerald-500 text-emerald-600'
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

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'patients' && renderPatients()}
        {activeTab === 'meal-planning' && renderMealPlanning()}
        {activeTab === 'food-recall' && renderFoodRecall()}
        {activeTab === 'database' && renderFoodDatabase()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'education' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Modul Edukasi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                <Apple className="w-12 h-12 text-blue-600 mb-4" />
                <h4 className="font-semibold text-blue-800 mb-2">Panduan Nutrisi Diabetes</h4>
                <p className="text-sm text-blue-700 mb-4">Materi lengkap tentang nutrisi untuk penderita diabetes.</p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                  Lihat Materi
                </button>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                <Utensils className="w-12 h-12 text-green-600 mb-4" />
                <h4 className="font-semibold text-green-800 mb-2">Resep Makanan Sehat</h4>
                <p className="text-sm text-green-700 mb-4">Kumpulan resep makanan ramah diabetes.</p>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                  Lihat Resep
                </button>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                <Activity className="w-12 h-12 text-purple-600 mb-4" />
                <h4 className="font-semibold text-purple-800 mb-2">Tips Gaya Hidup</h4>
                <p className="text-sm text-purple-700 mb-4">Panduan gaya hidup sehat untuk diabetesi.</p>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700">
                  Baca Tips
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Patient Detail Modal */}
      {showPatientDetail && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Detail Pasien</h3>
              <button
                onClick={() => setShowPatientDetail(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Informasi Dasar</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nama:</span>
                    <span className="font-medium">{selectedPatient.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">No. RM:</span>
                    <span className="font-medium">{selectedPatient.mrNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Umur:</span>
                    <span className="font-medium">{selectedPatient.age} tahun</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Jenis Kelamin:</span>
                    <span className="font-medium">{selectedPatient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipe Diabetes:</span>
                    <span className="font-medium">{selectedPatient.diabetesType}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Data Antropometri</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Berat Badan:</span>
                    <span className="font-medium">{selectedPatient.weight} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tinggi Badan:</span>
                    <span className="font-medium">{selectedPatient.height} cm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">BMI:</span>
                    <span className={`font-medium ${getBMICategory(selectedPatient.bmi).color}`}>
                      {selectedPatient.bmi} ({getBMICategory(selectedPatient.bmi).category})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kebutuhan Kalori:</span>
                    <span className="font-medium">{selectedPatient.calorieNeeds} kal/hari</span>
                  </div>
                </div>
              </div>
            </div>

            {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-3">Alergi Makanan</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPatient.allergies.map((allergy, index) => (
                    <span key={index} className="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full border border-red-200">
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionistDashboard;
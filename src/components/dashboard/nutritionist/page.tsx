import React, { useState, useEffect } from 'react';
import {
  Search, Plus, Filter, TrendingUp, Calendar, Users, FileText, Bell, Settings,
  Eye, Edit3, Download, AlertTriangle, CheckCircle, Clock, Target, Activity,
  Scale, Apple, Utensils, BarChart3, PieChart, LineChart, Bookmark,
  X, User, Menu, Calculator, ClipboardList, TrendingDown, Heart,
  Zap, ChevronRight, Save, RefreshCw
} from 'lucide-react';
import SplashScreen from '@/components/SplashScreen';

type TabType = 'dashboard' | 'patients' | 'diet-plans' | 'monitoring' | 'food-recall' | 'database' | 'analytics' | 'education';

const NutritionistDashboard = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'diet-plans' | 'monitoring' | 'food-recall' | 'database' | 'analytics' | 'education'>('dashboard');
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPatientDetail, setShowPatientDetail] = useState(false);
  const [showDietPlanForm, setShowDietPlanForm] = useState(false);
  const [showMonitoringForm, setShowMonitoringForm] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showRefreshSplash, setShowRefreshSplash] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Real-time stats berdasarkan data patient
  const [realTimeStats, setRealTimeStats] = useState({
    totalPatients: 0,
    activeDietPlans: 0,
    avgCompliance: 0,
    highRiskPatients: 0,
    weeklyActivity: [],
    complianceDistribution: [],
    bmiCategories: []
  });

  const [dietPlanForm, setDietPlanForm] = useState({
    calorieRequirement: '',
    dietType: '',
    mealDistribution: {
      breakfast: 25,
      morningSnack: 10,
      lunch: 30,
      afternoonSnack: 10,
      dinner: 25
    },
    restrictions: [],
    specialInstructions: '',
    monitoringSchedule: 'weekly'
  });

  const [monitoringForm, setMonitoringForm] = useState({
    currentWeight: '',
    dietCompliance: '',
    bloodSugarTrend: '',
    challenges: '',
    achievements: '',
    recommendations: '',
    nextVisitDate: ''
  });

  // Fetch patients from API
  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/nutrition-patients', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch nutrition patients');
      }

      const nutritionPatientsData = await response.json();
      setPatients(nutritionPatientsData);
      calculateStats(nutritionPatientsData);

    } catch (err) {
      setError(err.message);
      console.error('Error fetching nutrition patients:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics from patient data
  const calculateStats = (patientsData) => {
    const totalPatients = patientsData.length;
    const activeDietPlans = patientsData.filter(p => p.dietPlan).length;
    const complianceValues = patientsData.filter(p => p.dietCompliance !== null).map(p => p.dietCompliance || 0);
    const avgCompliance = complianceValues.length > 0
      ? Math.round(complianceValues.reduce((sum, val) => sum + val, 0) / complianceValues.length)
      : 0;
    const highRiskPatients = patientsData.filter(p => p.riskLevel === 'HIGH').length;
    // type TabType = 'dashboard' | 'patients' | 'diet-plans' | 'monitoring' | 'food-recall' | 'database' | 'analytics' | 'education';

    // const [activeTab, setActiveTab] = useState<TabType>('dashboard');

    // BMI Categories
    const bmiCategories = [
      { category: 'Underweight', count: 0, color: 'bg-blue-500', percentage: 0 },
      { category: 'Normal', count: 0, color: 'bg-green-500', percentage: 0 },
      { category: 'Overweight', count: 0, color: 'bg-yellow-500', percentage: 0 },
      { category: 'Obesity', count: 0, color: 'bg-red-500', percentage: 0 }
    ];

    patientsData.forEach(patient => {
      if (patient.bmi) {
        if (patient.bmi < 18.5) bmiCategories[0].count++;
        else if (patient.bmi < 25) bmiCategories[1].count++;
        else if (patient.bmi < 30) bmiCategories[2].count++;
        else bmiCategories[3].count++;
      }
    });

    bmiCategories.forEach(category => {
      category.percentage = totalPatients > 0 ? Math.round((category.count / totalPatients) * 100) : 0;
    });

    // Compliance Distribution
    const complianceDistribution = [
      { range: '90-100%', count: 0, color: 'bg-green-500', percentage: 0 },
      { range: '70-89%', count: 0, color: 'bg-green-400', percentage: 0 },
      { range: '50-69%', count: 0, color: 'bg-yellow-400', percentage: 0 },
      { range: '0-49%', count: 0, color: 'bg-red-400', percentage: 0 }
    ];

    complianceValues.forEach(compliance => {
      if (compliance >= 90) complianceDistribution[0].count++;
      else if (compliance >= 70) complianceDistribution[1].count++;
      else if (compliance >= 50) complianceDistribution[2].count++;
      else complianceDistribution[3].count++;
    });

    complianceDistribution.forEach(dist => {
      dist.percentage = complianceValues.length > 0 ? Math.round((dist.count / complianceValues.length) * 100) : 0;
    });

    // Mock weekly activity (would be calculated from actual visit data)
    const weeklyActivity = [
      { day: 'Sen', consultations: Math.floor(Math.random() * 20), compliance: 85, isToday: false },
      { day: 'Sel', consultations: Math.floor(Math.random() * 20), compliance: 72, isToday: false },
      { day: 'Rab', consultations: Math.floor(Math.random() * 20), compliance: 88, isToday: false },
      { day: 'Kam', consultations: Math.floor(Math.random() * 20), compliance: 76, isToday: false },
      { day: 'Jum', consultations: Math.floor(Math.random() * 20), compliance: 91, isToday: false },
      { day: 'Sab', consultations: Math.floor(Math.random() * 20), compliance: 68, isToday: false },
      { day: 'Min', consultations: Math.floor(Math.random() * 20), compliance: 82, isToday: true }
    ];

    setRealTimeStats({
      totalPatients,
      activeDietPlans,
      avgCompliance,
      highRiskPatients,
      weeklyActivity,
      complianceDistribution,
      bmiCategories
    });
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(patient =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.mrNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBMIColor = (bmi) => {
    if (!bmi) return 'text-gray-600 bg-gray-50';
    if (bmi < 18.5) return 'text-blue-600 bg-blue-50';
    if (bmi < 25) return 'text-green-600 bg-green-50';
    if (bmi < 30) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getBMICategory = (bmi) => {
    if (!bmi) return 'Unknown';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obesity';
  };

  const getComplianceColor = (compliance) => {
    if (!compliance) return 'text-gray-600 bg-gray-50';
    if (compliance >= 90) return 'text-green-600 bg-green-50';
    if (compliance >= 70) return 'text-green-600 bg-green-50';
    if (compliance >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const calculateCalorieNeed = (weight, height, age, gender, activityLevel = 1.3) => {
    if (!weight || !height || !age) return 0;

    let bmr;
    if (gender === 'MALE') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
    return Math.round(bmr * activityLevel);
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return 0;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Update diet plan for patient
  const updatePatientDietPlan = async (patientId, dietData) => {
    try {
      const response = await fetch('/api/nutrition-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patientId,
          targetCalories: parseInt(dietData.calorieRequirement) || 1800,
          dietPlan: `${dietData.dietType} - ${dietData.calorieRequirement} kkal/hari`,
          nutritionGoals: ['Kontrol diabetes', 'Manajemen berat badan'],
          recommendations: dietData.specialInstructions ? [dietData.specialInstructions] : [],
          mealDistribution: dietData.mealDistribution || {
            breakfast: 25,
            morningSnack: 10,
            lunch: 30,
            afternoonSnack: 10,
            dinner: 25
          },
          foodRecall: {
            planType: dietData.dietType,
            createdDate: new Date().toISOString(),
            instructions: dietData.specialInstructions || ''
          },
          dietaryPattern: dietData.dietType,
          foodAllergies: []
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create nutrition record');
      }

      await fetchPatients();
      setShowDietPlanForm(false);
      setSelectedPatient(null);
    } catch (err) {
      setError(err.message);
      console.error('Error creating nutrition record:', err);
    }
  };

  // Update patient monitoring data
  const updatePatientMonitoring = async (patientId, monitoringData) => {
    try {
      const currentPatient = patients.find(p => p.id === patientId);
      let weightChange = null;
      if (currentPatient?.weight && monitoringData.currentWeight) {
        weightChange = parseFloat(monitoringData.currentWeight) - currentPatient.weight;
      }

      const response = await fetch('/api/nutrition-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patientId,
          targetCalories: currentPatient?.calorieRequirement || 1800,
          dietPlan: currentPatient?.dietPlan || 'Diet Diabetes Standar',
          complianceScore: monitoringData.dietCompliance ? parseInt(monitoringData.dietCompliance) : null,
          weightChange: weightChange,
          recommendations: [
            monitoringData.recommendations,
            `Tantangan: ${monitoringData.challenges}`,
            `Pencapaian: ${monitoringData.achievements}`
          ].filter(Boolean),
          nutritionGoals: ['Kontrol gula darah', 'Pertahankan berat badan ideal'],
          foodRecall: {
            monitoringDate: new Date().toISOString().split('T')[0],
            challenges: monitoringData.challenges,
            achievements: monitoringData.achievements,
            nextVisit: monitoringData.nextVisitDate
          },
          dietaryPattern: 'Diabetes Management'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create nutrition record');
      }

      await fetchPatients();
      setShowMonitoringForm(false);
      setSelectedPatient(null);
    } catch (err) {
      setError(err.message);
      console.error('Error creating nutrition record:', err);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setIsMobileSidebarOpen(false);
  };

  const refreshData = async () => {
    setShowRefreshSplash(true);
    await fetchPatients();
  };
  const handleRefreshSplashFinish = () => {
    setShowRefreshSplash(false);
    setIsRefreshing(false);
  };

  const navigationItems: { key: TabType; label: string; icon: any }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { key: 'patients', label: 'Kelola Pasien', icon: Users },
    { key: 'diet-plans', label: 'Rencana Diet', icon: Utensils },
    { key: 'monitoring', label: 'Monitoring Pola Makan', icon: Activity },
    { key: 'food-recall', label: 'Food Recall', icon: FileText },
    { key: 'database', label: 'Database Makanan', icon: Apple },
    { key: 'analytics', label: 'Analisis Gizi', icon: BarChart3 },
    { key: 'education', label: 'Edukasi Gizi', icon: Bookmark }
  ];

  const maxConsultations = Math.max(...realTimeStats.weeklyActivity.map(d => d.consultations || 0), 1);

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-gradient-to-br from-white to-green-50 p-3 sm:p-6 rounded-xl shadow-sm border border-green-100 hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <p className="text-xs sm:text-sm font-medium text-green-600">Total Pasien</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 text-center">{realTimeStats.totalPatients}</p>
              <p className="text-xs text-green-600 mt-1 text-center">Diabetes Management</p>
            </div>
            <div className="bg-green-100 p-2 sm:p-3 rounded-full w-fit">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-blue-50 p-3 sm:p-6 rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <p className="text-xs sm:text-sm font-medium text-blue-600">Rencana Diet Aktif</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 text-center">{realTimeStats.activeDietPlans}</p>
              <p className="text-xs text-blue-600 mt-1 text-center">dari {realTimeStats.totalPatients} pasien</p>
            </div>
            <div className="bg-blue-100 p-2 sm:p-3 rounded-full w-fit">
              <Target className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-purple-50 p-3 sm:p-6 rounded-xl shadow-sm border border-purple-100 hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <p className="text-xs sm:text-sm font-medium text-purple-600">Rata-rata Kepatuhan</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 text-center">{realTimeStats.avgCompliance}%</p>
              <p className="text-xs text-purple-600 mt-1 text-center">Diet Compliance</p>
            </div>
            <div className="bg-purple-100 p-2 sm:p-3 rounded-full w-fit">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-red-50 p-3 sm:p-6 rounded-xl shadow-sm border border-red-100 hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <p className="text-xs sm:text-sm font-medium text-red-600">Pasien Risiko Tinggi</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 text-center">{realTimeStats.highRiskPatients}</p>
              <p className="text-xs text-red-600 mt-1 text-center">perlu perhatian khusus</p>
            </div>
            <div className="bg-red-100 p-2 sm:p-3 rounded-full w-fit">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* BMI Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Distribusi BMI Pasien</h3>
            <div className="flex items-center space-x-2 bg-green-50 px-2 sm:px-3 py-1 rounded-full w-fit">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 font-medium">Live</span>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {realTimeStats.bmiCategories.length > 0 ? realTimeStats.bmiCategories.map((item, index) => (
              <div key={index} className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${item.color} shadow-lg`}></div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700">{item.category}</span>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <span className="text-xs sm:text-sm text-gray-500">{item.percentage}%</span>
                    <span className="text-xs sm:text-sm font-bold text-gray-900">{item.count}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 overflow-hidden">
                  <div
                    className={`h-2 sm:h-3 rounded-full transition-all duration-1000 ease-out group-hover:shadow-lg ${item.color}`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            )) : (
              <div className="text-center py-6 sm:py-8 text-gray-500">
                <Scale className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Memuat distribusi BMI...</p>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Activity Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 space-y-2 sm:space-y-0">
            <h3 className="text-base md:text-lg font-semibold text-gray-900">Aktivitas Konsultasi 7 Hari</h3>
            <div className="flex items-center space-x-2 bg-blue-50 px-2 md:px-3 py-1 rounded-full self-start sm:self-auto">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-blue-600 font-medium">Real-time</span>
            </div>
          </div>

          <div className="relative">
            <div className="flex items-end justify-between space-x-1 sm:space-x-2 md:space-x-3 h-32 sm:h-40 md:h-48 mb-4 md:mb-6 bg-gradient-to-t from-gray-50 to-transparent rounded-lg p-2 md:p-4">
              {realTimeStats.weeklyActivity.length > 0 ? realTimeStats.weeklyActivity.map((day, index) => {
                const height = Math.max((day.consultations / maxConsultations) * (window.innerWidth < 768 ? 80 : 120), 6);
                const isToday = day.isToday;

                return (
                  <div key={index} className="flex-1 flex flex-col items-center group relative">
                    <div className="hidden md:block absolute -top-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                      <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap shadow-lg">
                        <div className="text-center">
                          <div className="font-semibold">{day.consultations} konsultasi</div>
                          <div className="text-gray-300">Kepatuhan: {day.compliance}%</div>
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>

                    <div className="relative w-full max-w-4 sm:max-w-6 md:max-w-8 mb-2 md:mb-3">
                      <div
                        className={`w-full rounded-full transition-all duration-700 ease-out transform group-hover:scale-110 ${isToday
                          ? 'bg-gradient-to-t from-green-600 via-green-500 to-green-400 shadow-lg shadow-green-200'
                          : 'bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400 hover:from-blue-700 hover:via-blue-600 hover:to-blue-500 shadow-lg shadow-blue-200'
                          }`}
                        style={{ height: `${height}px` }}
                      >
                        <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white to-transparent opacity-30 rounded-full"></div>
                        {isToday && (
                          <div className="absolute inset-0 rounded-full animate-pulse bg-gradient-to-t from-green-400 to-transparent opacity-50"></div>
                        )}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className={`text-xs sm:text-sm font-bold transition-colors ${isToday ? 'text-green-600' : 'text-gray-900 group-hover:text-blue-600'}`}>
                        {day.consultations}
                      </div>
                      <div className={`text-xs mt-1 transition-colors ${isToday ? 'text-green-600 font-semibold' : 'text-gray-500 group-hover:text-blue-500'}`}>
                        {window.innerWidth < 640 ? day.day.substring(0, 3) : day.day}
                      </div>
                      <div className={`text-xs ${isToday ? 'text-green-600' : 'text-gray-400'}`}>
                        {day.compliance}%
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

            <div className="bg-gray-50 rounded-lg p-3 md:p-4 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs md:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total 7 hari:</span>
                  <span className="font-semibold text-gray-900">
                    {realTimeStats.weeklyActivity.reduce((sum, day) => sum + (day.consultations || 0), 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rata-rata:</span>
                  <span className="font-semibold text-gray-900">
                    {Math.round(realTimeStats.weeklyActivity.reduce((sum, day) => sum + (day.consultations || 0), 0) / 7)} /hari
                  </span>
                </div>
              </div>
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

      {/* Compliance Distribution */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Distribusi Kepatuhan Diet Pasien</h3>
          <div className="flex items-center space-x-2 bg-green-50 px-2 sm:px-3 py-1 rounded-full w-fit">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600 font-medium">Live Data</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {realTimeStats.complianceDistribution.map((item, index) => (
            <div key={index} className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${item.color} shadow-lg`}></div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700">{item.range}</span>
                </div>
                <span className="text-xs sm:text-sm font-bold text-gray-900">{item.count}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 overflow-hidden">
                <div
                  className={`h-2 sm:h-3 rounded-full transition-all duration-1000 ${item.color}`}
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPatients = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Kelola Pasien</h3>
              <p className="text-gray-600 text-sm mt-1">Pilih pasien untuk analisis dan perencanaan gizi</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Cari pasien atau MR..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full md:w-64 text-gray-700"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <button
                onClick={() => {
                  setSelectedPatient(null);
                  setShowDietPlanForm(true);
                }}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Rencana Baru
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-2 text-gray-600">Memuat data pasien...</span>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-red-500 mr-2" />
              <span className="text-red-600">Error: {error}</span>
            </div>
            <button
              onClick={fetchPatients}
              className="text-green-600 hover:text-green-800"
            >
              Coba Lagi
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
                      MR Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Nama
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      BMI
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Kepatuhan Diet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPatients.map((patient) => {
                    const age = calculateAge(patient.birthDate);
                    return (
                      <tr key={patient.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {patient.mrNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                            <div className="text-sm text-gray-500">{age} thn • {patient.gender} • {patient.diabetesType || 'No diabetes type'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getBMIColor(patient.bmi)}`}>
                            {patient.bmi ? `${patient.bmi.toFixed(1)} (${getBMICategory(patient.bmi)})` : 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getComplianceColor(patient.dietCompliance)}`}>
                            {patient.dietCompliance ? `${patient.dietCompliance}%` : 'Belum diinput'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {patient.riskLevel && (
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${patient.riskLevel === 'HIGH' ? 'bg-red-100 text-red-700' :
                              patient.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                              {patient.riskLevel}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <button
                            onClick={() => {
                              setSelectedPatient(patient);
                              setShowPatientDetail(true);
                            }}
                            className="text-gray-600 hover:text-gray-900 font-medium inline-flex items-center space-x-1"
                          >
                            <Eye className="h-4 w-4" />
                            <span>Detail</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPatient(patient);
                              const calculatedCalorieNeed = patient.calorieRequirement || calculateCalorieNeed(patient.weight, patient.height, age, patient.gender);
                              setDietPlanForm({
                                ...dietPlanForm,
                                calorieRequirement: calculatedCalorieNeed.toString()
                              });
                              setShowDietPlanForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 font-medium inline-flex items-center space-x-1"
                          >
                            <Edit3 className="h-4 w-4" />
                            <span>Diet</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPatient(patient);
                              setShowMonitoringForm(true);
                            }}
                            className="text-green-600 hover:text-green-900 font-medium inline-flex items-center space-x-1"
                          >
                            <Activity className="h-4 w-4" />
                            <span>Monitor</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredPatients.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        {searchTerm ? "Tidak ada pasien yang ditemukan" : "Belum ada data pasien"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="lg:hidden space-y-4 p-4">
              {filteredPatients.map((patient) => {
                const age = calculateAge(patient.birthDate);
                const calculatedCalorieNeed = patient.calorieRequirement || calculateCalorieNeed(patient.weight, patient.height, age, patient.gender);

                return (
                  <div key={patient.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-lg">{patient.name}</h4>
                        <p className="text-sm text-gray-600">
                          {patient.mrNumber} • {age} thn • {patient.gender} • {patient.diabetesType || 'No diabetes type'}
                        </p>
                      </div>
                      {patient.riskLevel && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${patient.riskLevel === 'HIGH' ? 'bg-red-100 text-red-700' :
                          patient.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                          {patient.riskLevel}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">BMI</span>
                          <Scale className="h-3 w-3 text-gray-400" />
                        </div>
                        <div className="mt-1">
                          <span className={`text-lg font-bold px-2 py-1 rounded ${getBMIColor(patient.bmi)}`}>
                            {patient.bmi ? patient.bmi.toFixed(1) : 'N/A'}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">{getBMICategory(patient.bmi)}</p>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Kepatuhan</span>
                          <Target className="h-3 w-3 text-gray-400" />
                        </div>
                        <div className="mt-1">
                          <span className={`text-lg font-bold px-2 py-1 rounded ${getComplianceColor(patient.dietCompliance)}`}>
                            {patient.dietCompliance ? `${patient.dietCompliance}%` : 'N/A'}
                          </span>
                          {patient.dietCompliance && (
                            <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                              <div
                                className="bg-green-500 h-1 rounded-full transition-all"
                                style={{ width: `${patient.dietCompliance}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Kebutuhan Kalori:</span>
                        <span className="font-medium">{calculatedCalorieNeed} kkal/hari</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tinggi/Berat:</span>
                        <span className="font-medium">
                          {patient.height ? `${patient.height} cm` : 'N/A'} / {patient.weight ? `${patient.weight} kg` : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {patient.dietPlan && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Utensils className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Rencana Diet Aktif</span>
                        </div>
                        <p className="text-sm text-green-700">{patient.dietPlan}</p>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedPatient(patient);
                          setShowPatientDetail(true);
                        }}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Detail</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPatient(patient);
                          setDietPlanForm({
                            ...dietPlanForm,
                            calorieRequirement: calculatedCalorieNeed.toString()
                          });
                          setShowDietPlanForm(true);
                        }}
                        className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Edit3 className="h-4 w-4" />
                        <span>Diet</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPatient(patient);
                          setShowMonitoringForm(true);
                        }}
                        className="flex-1 bg-green-100 text-green-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-green-200 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Activity className="h-4 w-4" />
                        <span>Monitor</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredPatients.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>{searchTerm ? "Tidak ada pasien yang ditemukan" : "Belum ada data pasien"}</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderDietPlans = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Rencana Diet</h2>
            <p className="text-gray-600 text-sm mt-1">Buat dan kelola rencana diet untuk pasien</p>
          </div>
          <button
            onClick={() => setShowDietPlanForm(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            <Plus className="w-4 h-4" />
            Rencana Baru
          </button>
        </div>

        {/* Diet Plan Templates */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              name: 'Diet Mediterania',
              description: 'Diet seimbang dengan emphasis pada lemak sehat dan serat',
              calories: '1800-2200 kkal',
              suitableFor: 'Diabetes Type 2, Hipertensi',
              color: 'green'
            },
            {
              name: 'Diet Rendah Karbohidrat',
              description: 'Pembatasan karbohidrat untuk kontrol gula darah',
              calories: '1600-2000 kkal',
              suitableFor: 'Diabetes Type 2, Obesitas',
              color: 'blue'
            },
            {
              name: 'Diet DASH',
              description: 'Diet untuk menurunkan tekanan darah',
              calories: '1800-2400 kkal',
              suitableFor: 'Hipertensi, Penyakit Jantung',
              color: 'purple'
            }
          ].map((template, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className={`w-4 h-4 rounded-full bg-${template.color}-500 mb-3`}></div>
              <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{template.description}</p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Kalori:</span>
                  <span className="font-medium">{template.calories}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Cocok untuk:</span>
                  <span className="font-medium text-right">{template.suitableFor}</span>
                </div>
              </div>
              <button className={`w-full mt-4 bg-${template.color}-600 hover:bg-${template.color}-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors`}>
                Gunakan Template
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMonitoring = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Header with button on the right */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Monitoring Pola Makan</h2>
          <button
            onClick={() => setShowMonitoringForm(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-green-300 transition-all duration-300"
          >
            <ClipboardList className="w-4 h-4" />
            Input Monitoring
          </button>
        </div>

        {/* Patient Selection for Monitoring */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Monitoring Activities */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Aktivitas Monitoring Terbaru</h3>
            {filteredPatients.slice(0, 3).map((patient, index) => {
              const weightChange = Math.random() > 0.5 ? -(Math.random() * 2).toFixed(1) : (Math.random() * 2).toFixed(1);
              const compliance = patient.dietCompliance || Math.floor(Math.random() * 40) + 60;
              const lastVisit = patient.lastVisit || new Date().toISOString().split('T')[0];

              return (
                <div key={patient.id} className="bg-gradient-to-br from-white to-green-50 border border-green-100 rounded-xl p-5 hover:shadow-lg hover:shadow-green-100 transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 group-hover:text-green-800 transition-colors">{patient.name}</h4>
                      <p className="text-sm text-green-600 font-medium">{patient.mrNumber}</p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${compliance >= 90
                      ? 'bg-green-100 text-green-700 border border-green-200' :
                      compliance >= 70
                        ? 'bg-green-50 text-green-600 border border-green-150' :
                        'bg-yellow-100 text-yellow-700 border border-yellow-200'
                      }`}>
                      {compliance}% kepatuhan
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Perubahan berat:</span>
                      <span className={`font-semibold px-2 py-1 rounded-lg ${Number(weightChange) < 0
                        ? 'text-green-700 bg-green-50' :
                        Number(weightChange) > 0
                          ? 'text-red-600 bg-red-50' :
                          'text-gray-600 bg-gray-50'
                        }`}>
                        {Number(weightChange) > 0 ? '+' : ''}{weightChange} kg
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Terakhir dievaluasi:</span>
                      <span className="font-medium text-green-700">{lastVisit}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modern Compliance Trends Chart */}
          <div className="bg-gradient-to-br from-white to-green-50 border border-green-100 rounded-xl p-6 hover:shadow-lg hover:shadow-green-100 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-800">Tren Kepatuhan Bulanan</h3>
              <div className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-green-700">Live Data</span>
              </div>
            </div>

            <div className="relative h-56 bg-gradient-to-t from-green-50 to-transparent rounded-xl p-4 border border-green-100">
              <div className="flex items-end justify-between h-full space-x-3">
                {['Jan', 'Feb', 'Mar', 'Apr', 'Mei'].map((month, index) => {
                  const values = [72, 78, 85, 82, 88];
                  const height = (values[index] / 100) * 140;
                  const isHighest = values[index] === Math.max(...values);

                  return (
                    <div key={month} className="flex-1 flex flex-col items-center group relative">
                      {/* Tooltip */}
                      <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-none">
                        <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap shadow-xl">
                          <div className="font-semibold">{values[index]}% Kepatuhan</div>
                          <div className="text-gray-300">{month} 2024</div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>

                      {/* Bar */}
                      <div className="relative w-full max-w-8 mb-3">
                        <div
                          className={`w-full rounded-t-lg transition-all duration-700 ease-out transform group-hover:scale-105 relative overflow-hidden ${isHighest
                            ? 'bg-gradient-to-t from-green-600 via-green-500 to-green-400 shadow-lg shadow-green-200'
                            : 'bg-gradient-to-t from-green-500 via-green-400 to-green-300 hover:from-green-600 hover:via-green-500 hover:to-green-400 shadow-md shadow-green-150'
                            }`}
                          style={{ height: `${height}px` }}
                        >
                          {/* Shine effect */}
                          <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white to-transparent opacity-30 rounded-t-lg"></div>

                          {/* Animated glow for highest value */}
                          {isHighest && (
                            <div className="absolute inset-0 rounded-t-lg animate-pulse bg-gradient-to-t from-green-400 to-transparent opacity-40"></div>
                          )}
                        </div>
                      </div>

                      {/* Labels */}
                      <div className="text-center">
                        <div className={`text-sm font-bold transition-colors ${isHighest ? 'text-green-700' : 'text-gray-700 group-hover:text-green-600'
                          }`}>
                          {values[index]}%
                        </div>
                        <div className={`text-xs mt-1 transition-colors ${isHighest ? 'text-green-600 font-semibold' : 'text-gray-500 group-hover:text-green-500'
                          }`}>
                          {month}
                        </div>
                        {isHighest && (
                          <div className="w-1 h-1 bg-green-500 rounded-full mx-auto mt-1 animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chart footer stats */}
              <div className="mt-4 pt-4 border-t border-green-200 bg-white/50 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rata-rata:</span>
                    <span className="font-semibold text-green-700">81%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tertinggi:</span>
                    <span className="font-semibold text-green-700">88%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render other tabs with placeholder content
  const renderFoodRecall = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Food Recall 24 Jam</h3>
      <div className="text-center py-8 text-gray-500">
        <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>Modul food recall 24 jam akan segera tersedia</p>
        <p className="text-sm mt-1">Untuk dokumentasi asupan makanan pasien</p>
      </div>
    </div>
  );

  const renderFoodDatabase = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Database Makanan & Gizi</h3>
      <div className="text-center py-8 text-gray-500">
        <Apple className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>Database komposisi gizi makanan Indonesia</p>
        <p className="text-sm mt-1">Akan tersedia dengan 2000+ item makanan</p>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Analisis Gizi Lanjutan</h3>
      <div className="text-center py-8 text-gray-500">
        <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>Analisis mendalam status gizi pasien</p>
        <p className="text-sm mt-1">Grafik tren, prediksi, dan rekomendasi AI</p>
      </div>
    </div>
  );

  const renderEducation = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Edukasi Gizi</h3>
      <div className="text-center py-8 text-gray-500">
        <Bookmark className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>Materi edukasi untuk pasien diabetes</p>
        <p className="text-sm mt-1">Panduan diet, resep sehat, dan tips nutrisi</p>
      </div>
    </div>
  );

  // Modal untuk Detail Pasien (Patient Detail Modal)
  const PatientDetailModal = () => {
    if (!showPatientDetail || !selectedPatient) return null;

    const age = calculateAge(selectedPatient.birthDate);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Analisis Gizi - {selectedPatient.name}</h2>
              <button
                onClick={() => setShowPatientDetail(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Patient Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Data Antropometri</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Tinggi Badan:</span>
                    <span className="font-medium">{selectedPatient.height || 'N/A'} cm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Berat Badan:</span>
                    <span className="font-medium">{selectedPatient.weight || 'N/A'} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>BMI:</span>
                    <span className={`font-medium px-2 py-1 rounded ${getBMIColor(selectedPatient.bmi)}`}>
                      {selectedPatient.bmi ? `${selectedPatient.bmi.toFixed(1)} (${getBMICategory(selectedPatient.bmi)})` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Umur:</span>
                    <span className="font-medium">{age} tahun</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Status Gizi</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Kebutuhan Kalori:</span>
                    <span className="font-medium">
                      {selectedPatient.calorieRequirement || calculateCalorieNeed(selectedPatient.weight, selectedPatient.height, age, selectedPatient.gender)} kkal
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kepatuhan Diet:</span>
                    <span className={`font-medium px-2 py-1 rounded ${getComplianceColor(selectedPatient.dietCompliance)}`}>
                      {selectedPatient.dietCompliance ? `${selectedPatient.dietCompliance}%` : 'Belum diinput'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tipe Diabetes:</span>
                    <span className="font-medium">{selectedPatient.diabetesType || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Riwayat Medis</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Komorbiditas:</span>
                    <div className="mt-1">
                      {selectedPatient.comorbidities && selectedPatient.comorbidities.length > 0 ? (
                        selectedPatient.comorbidities.map((condition, index) => (
                          <span key={index} className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded text-xs mr-1 mb-1">
                            {condition}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">Tidak ada</span>
                      )}
                    </div>
                  </div>
                  {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
                    <div>
                      <span className="text-gray-600">Alergi:</span>
                      <div className="mt-1">
                        {selectedPatient.allergies.map((allergy, index) => (
                          <span key={index} className="inline-block bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs mr-1 mb-1">
                            {allergy}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Current Diet Plan */}
            {selectedPatient.dietPlan && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-3">Rencana Diet Saat Ini</h3>
                <p className="text-blue-700">{selectedPatient.dietPlan}</p>
              </div>
            )}

            {/* Recommendations */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-3">Rekomendasi Gizi</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-green-700">
                <li>Pertahankan pola makan 3 kali makan utama dan 2 kali snack</li>
                <li>Batasi karbohidrat sederhana, tingkatkan serat</li>
                <li>Monitor gula darah sebelum dan sesudah makan</li>
                <li>Kontrol porsi menggunakan piring diabetes</li>
                {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
                  <li>Hindari makanan alergen: {selectedPatient.allergies.join(', ')}</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Modal untuk Diet Plan Form
  const DietPlanFormModal = () => {
    if (!showDietPlanForm) return null;

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (selectedPatient) {
        const dietPlanData = {
          dietPlan: `${dietPlanForm.dietType} - ${dietPlanForm.calorieRequirement} kkal/hari`,
          calorieRequirement: dietPlanForm.calorieRequirement
        };

        await updatePatientDietPlan(selectedPatient.id, dietPlanData);
        setShowDietPlanForm(false);
        setDietPlanForm({
          calorieRequirement: '',
          dietType: '',
          mealDistribution: {
            breakfast: 25,
            morningSnack: 10,
            lunch: 30,
            afternoonSnack: 10,
            dinner: 25
          },
          restrictions: [],
          specialInstructions: '',
          monitoringSchedule: 'weekly'
        });
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Rencana Diet - {selectedPatient?.name || 'Pasien Baru'}
              </h2>
              <button
                onClick={() => setShowDietPlanForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kebutuhan Kalori (kkal/hari)
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={dietPlanForm.calorieRequirement}
                  onChange={(e) => setDietPlanForm({ ...dietPlanForm, calorieRequirement: e.target.value })}
                  placeholder="1800"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipe Diet
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={dietPlanForm.dietType}
                  onChange={(e) => setDietPlanForm({ ...dietPlanForm, dietType: e.target.value })}
                  required
                >
                  <option value="">Pilih Tipe Diet</option>
                  <option value="Diet Mediterania">Diet Mediterania</option>
                  <option value="Diet Rendah Karbohidrat">Diet Rendah Karbohidrat</option>
                  <option value="Diet DASH">Diet DASH</option>
                  <option value="Diet Seimbang">Diet Seimbang</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instruksi Khusus
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={4}
                value={dietPlanForm.specialInstructions}
                onChange={(e) => setDietPlanForm({ ...dietPlanForm, specialInstructions: e.target.value })}
                placeholder="Tambahkan instruksi khusus untuk pasien..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDietPlanForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Simpan Rencana Diet
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Modal untuk Monitoring Form
  const MonitoringFormModal = () => {
    if (!showMonitoringForm) return null;

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (selectedPatient) {
        await updatePatientMonitoring(selectedPatient.id, monitoringForm);
        setShowMonitoringForm(false);
        setMonitoringForm({
          currentWeight: '',
          dietCompliance: '',
          bloodSugarTrend: '',
          challenges: '',
          achievements: '',
          recommendations: '',
          nextVisitDate: ''
        });
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Monitoring Pola Makan - {selectedPatient?.name || 'Pilih Pasien'}
              </h2>
              <button
                onClick={() => setShowMonitoringForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Berat Badan Saat Ini (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={monitoringForm.currentWeight}
                  onChange={(e) => setMonitoringForm({ ...monitoringForm, currentWeight: e.target.value })}
                  placeholder="70.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kepatuhan Diet (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={monitoringForm.dietCompliance}
                  onChange={(e) => setMonitoringForm({ ...monitoringForm, dietCompliance: e.target.value })}
                  placeholder="85"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tantangan yang Dihadapi
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                value={monitoringForm.challenges}
                onChange={(e) => setMonitoringForm({ ...monitoringForm, challenges: e.target.value })}
                placeholder="Kesulitan menahan makanan manis di malam hari..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pencapaian Positif
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                value={monitoringForm.achievements}
                onChange={(e) => setMonitoringForm({ ...monitoringForm, achievements: e.target.value })}
                placeholder="Berhasil mengurangi porsi nasi dan rajin olahraga..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rekomendasi Tindak Lanjut
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                value={monitoringForm.recommendations}
                onChange={(e) => setMonitoringForm({ ...monitoringForm, recommendations: e.target.value })}
                placeholder="Lanjutkan pola makan saat ini, tambahkan variasi sayuran..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jadwal Kunjungan Berikutnya
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={monitoringForm.nextVisitDate}
                onChange={(e) => setMonitoringForm({ ...monitoringForm, nextVisitDate: e.target.value })}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowMonitoringForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Simpan Monitoring
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

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
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-green-500 to-green-600 text-white">
          <h2 className="text-lg font-bold">NutriCare Menu</h2>
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
                onClick={() => handleTabChange(item.key)}
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
        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="flex items-center space-x-2 bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>

          <button
            onClick={() => {
              setIsRefreshing(true);
              refreshData();
            }}
            disabled={isRefreshing}
            className="flex items-center bg-white px-3 py-2 rounded-lg shadow-sm border border-green-500 text-sm text-gray-600 hover:bg-green-300 transition-colors disabled:opacity-50"
          >
            {isRefreshing ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full mr-2"></div>
                <span>Refreshing...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2 text-green-600" />
                <span>Refresh</span>
              </>
            )}
          </button>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-end mb-6">
          <div className="flex items-center justify-center md:justify-end space-x-2 md:space-x-3">
            <button
              onClick={() => {
                setIsRefreshing(true);
                refreshData();
              }}
              disabled={isRefreshing}
              className="flex items-center bg-white px-3 md:px-4 py-2 rounded-lg shadow-sm border border-green-500 
                       text-xs md:text-sm text-gray-600 hover:bg-green-300 transition-colors disabled:opacity-50"
            >
              {isRefreshing ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full mr-2"></div>
                  <span>Refreshing...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 text-green-600" />
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
                    onClick={() => setActiveTab(tab.key)}
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

        {/* Content */}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'patients' && renderPatients()}
        {activeTab === 'diet-plans' && renderDietPlans()}
        {activeTab === 'monitoring' && renderMonitoring()}
        {activeTab === 'food-recall' && renderFoodRecall()}
        {activeTab === 'database' && renderFoodDatabase()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'education' && renderEducation()}

        {/* Modals */}
        <PatientDetailModal />
        <DietPlanFormModal />
        <MonitoringFormModal />

      </div>

      {showRefreshSplash && (
        <SplashScreen
          onFinish={handleRefreshSplashFinish}
          message="Memuat ulang data..."
          duration={1500}
        />
      )}
    </div>
  );
};

export default NutritionistDashboard;
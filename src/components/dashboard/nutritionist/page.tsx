'use client';

import React, { useState, useEffect } from 'react';
import {
  Search, Plus, TrendingUp, Calendar, Users, Eye, Edit3, AlertTriangle, CheckCircle,
  Activity, Scale, Utensils, BarChart3, RefreshCw, Menu, X, Bell,
  Info,
  Calculator,
  ChefHat,
  Save,
  ChevronRight,
  ChevronLeft,
  History
} from 'lucide-react';
import SplashScreen from '@/components/SplashScreen';
import DietIssueModal from './DietIssueModal';
import DetailDietHistoryModal from './DetailDietHistoryModal';
import MenuPlanningSection from './MenuPlanningSection';
import ViewMenuModal from './ViewMenuModal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import SystemHistoryView from '../SystemHistoryView';

interface MealItem {
  id: string;
  name: string;
  portion: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}

interface MenuPlan {
  breakfast: MealItem[];
  morningSnack: MealItem[];
  lunch: MealItem[];
  afternoonSnack: MealItem[];
  dinner: MealItem[];
}

interface Patient {
  id: string;
  mrNumber: string;
  name: string;
  birthDate: string;
  gender: 'MALE' | 'FEMALE';
  height?: number;
  weight?: number;
  bmi?: number;
  diabetesType?: string;
  allergies?: string[];
  dietPlan?: string;
  dietCompliance?: number;
  calorieRequirement?: number;
  visitationHistory?: any[];
  hasDietIssue?: boolean;
  dietAlert?: any;

  latestEnergyCalculation?: number;
  latestBMI?: number;
  energyCalculationDetail?: {
    bbi: number;
    bmr: number;
    activityLevel: string;
    stressLevel: string;
    stressFactor: number;
    nutritionStatus: string;
    ageFactor: number;
    breakdown: {
      baseEnergy: number;
      withActivity: number;
      withAge: number;
      withNutrition: number;
      withStress: number;
      final: number;
    };
    calculatedAt: string;
    calculatedBy: string;
  };
  lastWeightUpdate?: string;
  currentWeight?: number;
  currentHeight?: number;

  mealDistribution?: MenuPlan | null;
  latestNutritionRecord?: any;
}

type TabType = 'dashboard' | 'patients' | 'monitoring' | 'system-history';

const NutritionistDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [patients, setPatients] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPatientDetail, setShowPatientDetail] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showRefreshSplash, setShowRefreshSplash] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDietIssuesModal, setShowDietIssuesModal] = useState(false);
  const [selectedDietIssue, setSelectedDietIssue] = useState(null);
  const [showDietHistoryModal, setShowDietHistoryModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [selectedMenuPatient, setSelectedMenuPatient] = useState<Patient | null>(null);
  const [selectedPatientForHistory, setSelectedPatientForHistory] = useState<Patient | null>(null);
  const [dietHistoryVisitations, setDietHistoryVisitations] = useState([]);
  const [compliancePeriod, setCompliancePeriod] = useState('7');
  const [customDietTypes, setCustomDietTypes] = useState<string[]>([]);
  const [showAddDietForm, setShowAddDietForm] = useState(false);
  const [newDietType, setNewDietType] = useState('');
  const [realTimeStats, setRealTimeStats] = useState({
    totalPatients: 0,
    activeDietPlans: 0,
    avgCompliance: 0,
    patientsWithAlert: 0,
    bmiCategories: [],
    complianceDistribution: []
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [selectedMonitoringDate, setSelectedMonitoringDate] = useState(new Date().toISOString().split('T')[0]);
  const [monitoringForm, setMonitoringForm] = useState({
    evaluationDate: new Date().toISOString().split('T')[0],
    weight: '',
    evaluationNotes: '',
    complianceStatus: 'stable',
    reviseDiet: false,
    dietRevisionNotes: ''
  });

  // const [mealComplianceData, setMealComplianceData] = useState({
  //   breakfast: { percentage: 0, notes: '' },
  //   midMorning: { percentage: 0, notes: '' },
  //   lunch: { percentage: 0, notes: '' },
  //   afternoon: { percentage: 0, notes: '' },
  //   dinner: { percentage: 0, notes: '' }
  // });

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
    specialInstructions: ''
  });

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const [patientsRes, allPatientsRes, visitationsRes, alertsRes, nutritionRes] = await Promise.all([
        fetch('/api/nutrition-patients?status=RAWAT_INAP'),
        fetch('/api/patients'),
        fetch('/api/visitations'),
        fetch('/api/alerts?category=NUTRITION&unreadOnly=false'),
        fetch('/api/nutrition-records')
      ]);

      if (patientsRes.ok && allPatientsRes.ok && visitationsRes.ok && alertsRes.ok && nutritionRes.ok) {
        const patientsData = await patientsRes.json();
        const allPatientsData = await allPatientsRes.json();
        const visitationsData = await visitationsRes.json();
        const alertsData = await alertsRes.json();
        const nutritionData = await nutritionRes.json();

        const enrichedPatients = patientsData.map((patient) => {
          const patientVisitations = visitationsData
            .filter((v) => v.patientId === patient.id)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

          const dietAlert = alertsData.find((a) => a.patientId === patient.id && !a.isRead);

          const latestNutrition = nutritionData
            .filter((n) => n.patientId === patient.id)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

          return {
            ...patient,
            visitationHistory: patientVisitations,
            hasDietIssue: !!dietAlert,
            dietAlert,
            mealDistribution: latestNutrition?.mealDistribution || null,
            latestNutritionRecord: latestNutrition || null
          };
        });

        const enrichedAllPatients = allPatientsData.map((patient) => {
          const patientVisitations = visitationsData
            .filter((v) => v.patientId === patient.id)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

          const dietAlert = alertsData.find((a) => a.patientId === patient.id && !a.isRead);

          const latestNutrition = nutritionData
            .filter((n) => n.patientId === patient.id)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

          return {
            ...patient,
            visitationHistory: patientVisitations,
            hasDietIssue: !!dietAlert,
            dietAlert,
            mealDistribution: latestNutrition?.mealDistribution || null,
            latestNutritionRecord: latestNutrition || null
          };
        });

        setPatients(enrichedPatients);
        setAllPatients(enrichedAllPatients); // 👈 TAMBAH INI
        calculateStats(enrichedPatients);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (patientsData) => {
    const totalPatients = patientsData.length;
    const activeDietPlans = patientsData.filter(p => p.dietPlan).length;
    const complianceValues = patientsData.filter(p => p.dietCompliance !== null).map(p => p.dietCompliance || 0);
    const avgCompliance = complianceValues.length > 0
      ? Math.round(complianceValues.reduce((sum, val) => sum + val, 0) / complianceValues.length)
      : 0;
    const patientsWithAlert = patientsData.filter(p => p.hasDietIssue).length;

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

    bmiCategories.forEach(cat => {
      cat.percentage = totalPatients > 0 ? Math.round((cat.count / totalPatients) * 100) : 0;
    });

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

    setRealTimeStats({
      totalPatients,
      activeDietPlans,
      avgCompliance,
      patientsWithAlert,
      bmiCategories,
      complianceDistribution
    });
  };

  const handleResolveDietIssue = async (alertId) => {
    try {
      await fetch(`/api/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true })
      });
      await fetchPatients();
    } catch (error) {
      console.error('Error resolving diet issue:', error);
    }
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

  const calculateCalorieNeed = (weight, height, age, gender, activityLevel = 1.3) => {
    if (!weight || !height || !age) return 1800;
    let bmr;
    if (gender === 'MALE') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
    return Math.round(bmr * activityLevel);
  };

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
    if (compliance >= 80) return 'text-green-600 bg-green-50';
    if (compliance >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const updatePatientDietPlan = async (patientId, dietData) => {
    try {
      const response = await fetch('/api/nutrition-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          targetCalories: parseInt(dietData.calorieRequirement) || 1800,
          dietPlan: `${dietData.dietType} - ${dietData.calorieRequirement} kkal/hari`,
          mealDistribution: dietData.mealDistribution || {},
          foodRecall: {
            planType: dietData.dietType,
            createdDate: new Date().toISOString(),
            instructions: dietData.specialInstructions || '',
            energyCalculationSource: selectedPatient.energyCalculationDetail ? 'nurse_calculation' : 'nutritionist_estimation',
            nurseCalculationDetail: selectedPatient.energyCalculationDetail || null,
            lastWeightRecorded: selectedPatient.currentWeight,
            lastHeightRecorded: selectedPatient.currentHeight
          }
        })
      });

      if (!response.ok) throw new Error('Failed to create nutrition record');

      alert('Rencana diet berhasil disimpan!');
      await fetchPatients();

      const updatedPatients = await fetch('/api/nutrition-patients?status=RAWAT_INAP').then(r => r.json());
      const updatedPatient = updatedPatients.find(p => p.id === patientId);
      if (updatedPatient) {
        setSelectedPatient(updatedPatient);
      }
    } catch (err) {
      setError(err.message);
      alert('Gagal menyimpan rencana diet: ' + err.message);
    }
  };

  const refreshData = async () => {
    setShowRefreshSplash(true);
    await fetchPatients();
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      const age = calculateAge(selectedPatient.birthDate);

      const calculatedCalories = selectedPatient.latestEnergyCalculation ||
        selectedPatient.calorieRequirement ||
        calculateCalorieNeed(
          selectedPatient.currentWeight || selectedPatient.weight,
          selectedPatient.currentHeight || selectedPatient.height,
          age,
          selectedPatient.gender
        );

      setDietPlanForm({
        ...dietPlanForm,
        calorieRequirement: calculatedCalories.toString()
      });
    }
  }, [selectedPatient?.id]);

  const filteredPatients = patients.filter(patient =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.mrNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPatients = filteredPatients.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  const navigationItems = [
    { key: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { key: 'patients', label: 'Daftar Pasien Rawat Inap', icon: Users },
    { key: 'monitoring', label: 'Monitoring Diet & Asupan', icon: Activity },
    { key: 'system-history', label: 'Riwayat Sistem', icon: History }
  ];

  const renderDashboard = () => (
    <div className="space-y-8">


      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-gradient-to-br from-white to-green-50 p-4 sm:p-6 rounded-xl shadow-sm border border-green-100">
          <p className="text-xs sm:text-sm font-medium text-green-600">Total Pasien Rawat Inap</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{realTimeStats.totalPatients}</p>
        </div>
        <div className="bg-gradient-to-br from-white to-blue-50 p-4 sm:p-6 rounded-xl shadow-sm border border-blue-100">
          <p className="text-xs sm:text-sm font-medium text-blue-600">Rencana Diet Aktif</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{realTimeStats.activeDietPlans}</p>
        </div>
        <div className="bg-gradient-to-br from-white to-purple-50 p-4 sm:p-6 rounded-xl shadow-sm border border-purple-100">
          <p className="text-xs sm:text-sm font-medium text-purple-600">Rata-rata Kepatuhan</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{realTimeStats.avgCompliance}%</p>
        </div>
        <div className="bg-gradient-to-br from-white to-red-50 p-4 sm:p-6 rounded-xl shadow-sm border border-red-100">
          <p className="text-xs sm:text-sm font-medium text-red-600">Pasien Dengan Alert</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{realTimeStats.patientsWithAlert}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Distribusi BMI Pasien</h3>
          <div className="space-y-3 sm:space-y-4">
            {realTimeStats.bmiCategories.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-700">{item.category}</span>
                  <span className="text-xs sm:text-sm font-bold text-gray-900">{item.count} ({item.percentage}%)</span>
                </div>
                <div className="w-full bg-+-200 rounded-full h-2 sm:h-3">
                  <div
                    className={`h-2 sm:h-3 rounded-full transition-all ${item.color}`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Distribusi Kepatuhan Diet</h3>
          <div className="space-y-3 sm:space-y-4">
            {realTimeStats.complianceDistribution.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-700">{item.range}</span>
                  <span className="text-xs sm:text-sm font-bold text-gray-900">{item.count} ({item.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                  <div
                    className={`h-2 sm:h-3 rounded-full transition-all ${item.color}`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPatients = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-900">Daftar Pasien Aktif</h3>
            <div className="relative w-full sm:w-auto sm:min-w-[250px] sm:max-w-[300px]">
              <input
                type="text"
                placeholder="Cari pasien atau MR..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 w-full text-gray-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>




        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">MR</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Nama Pasien</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Status Rawat</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Diet Saat Ini</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Kepatuhan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Alert</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{patient.mrNumber}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                        <div className="text-xs text-gray-500">{patient.gender} | {calculateAge(patient.birthDate)} thn</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          Rawat Inap
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {patient.dietPlan || <span className="text-gray-400">Belum ada</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${patient.dietCompliance >= 80
                            ? 'bg-green-100 text-green-700'
                            : patient.dietCompliance >= 60
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                            }`}
                        >
                          {patient.dietCompliance ? `${patient.dietCompliance}%` : 'Belum ada'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {patient.hasDietIssue ? (
                          <button
                            onClick={() => {
                              setSelectedDietIssue(patient.dietAlert);
                              setShowDietIssuesModal(true);
                            }}
                            className="flex items-center space-x-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-medium hover:bg-orange-200"
                          >
                            <AlertTriangle className="h-3 w-3" />
                            <span>Ada Masalah</span>
                          </button>
                        ) : (
                          <span className="text-gray-700 text-xs">Aman</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm w-48">
                        <div className="flex flex-col space-y-2">

                          {/* Kelola Diet */}
                          <button
                            onClick={() => {
                              setSelectedPatient(patient);
                              const age = calculateAge(patient.birthDate);
                              const calories =
                                patient.calorieRequirement ||
                                calculateCalorieNeed(patient.weight, patient.height, age, patient.gender);

                              setDietPlanForm({
                                ...dietPlanForm,
                                calorieRequirement: calories.toString(),
                              });

                              setActiveTab('monitoring');
                            }}
                            className="text-green-600 hover:text-green-900 font-medium text-left"
                          >
                            Kelola Diet
                          </button>

                          {/* Riwayat Diet */}
                          <button
                            onClick={async () => {
                              setSelectedPatientForHistory(patient);

                              const response = await fetch(`/api/visitations?patientId=${patient.id}`);
                              if (response.ok) {
                                const visitations = await response.json();
                                setDietHistoryVisitations(visitations);
                              }

                              setShowDietHistoryModal(true);
                            }}
                            className="text-gray-600 hover:text-gray-900 font-medium text-left"
                          >
                            Riwayat Diet
                          </button>

                          {/* Lihat Menu */}
                          <button
                            onClick={() => {
                              const hasMenu =
                                patient.mealDistribution &&
                                typeof patient.mealDistribution === 'object' &&
                                Object.values(patient.mealDistribution).some(
                                  (meals: any) => Array.isArray(meals) && meals.length > 0
                                );

                              if (hasMenu) {
                                setSelectedMenuPatient(patient);
                                setShowMenuModal(true);
                              } else {
                                alert(
                                  'Belum ada menu makanan untuk pasien ini.\nSilakan buat menu terlebih dahulu di Tab Monitoring.'
                                );
                              }
                            }}
                            className={`text-blue-600 font-medium text-left transition-colors duration-200 ${patient.mealDistribution &&
                              typeof patient.mealDistribution === 'object' &&
                              Object.values(patient.mealDistribution).some(
                                (meals: any) => Array.isArray(meals) && meals.length > 0
                              )
                              ? 'text-blue-700 hover:text-blue-900 cursor-pointer'
                              : 'text-gray-400 cursor-not-allowed'
                              }`}
                          >
                            {patient.mealDistribution &&
                              typeof patient.mealDistribution === 'object' &&
                              Object.values(patient.mealDistribution).some(
                                (meals: any) => Array.isArray(meals) && meals.length > 0
                              )
                              ? 'Lihat Menu'
                              : 'Menu (Belum ada)'}
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                  {filteredPatients.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        {searchTerm ? 'Tidak ada pasien yang ditemukan' : 'Belum ada data pasien'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {filteredPatients.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">Tampilkan</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                      className="px-3 py-1 border border-gray-400 rounded-lg text-sm focus:ring-2 focus:ring-green-500 text-gray-700"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span className="text-sm text-gray-700">dari {filteredPatients.length} pasien</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <div className="flex gap-1">
                      {getPageNumbers().map((page, index) => (
                        <button
                          key={index}
                          onClick={() => typeof page === 'number' && handlePageChange(page)}
                          disabled={page === '...'}
                          className={`px-3 py-1 rounded-lg text-sm font-medium ${page === currentPage ? 'bg-green-600 text-white' :
                            page === '...' ? 'cursor-default text-gray-400' :
                              'border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronRight className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:hidden space-y-4 p-4">
              {paginatedPatients.map((patient) => {
                const age = calculateAge(patient.birthDate);
                const calories = patient.calorieRequirement || calculateCalorieNeed(patient.weight, patient.height, age, patient.gender);
                return (
                  <div key={patient.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{patient.name}</h4>
                        <p className="text-xs text-gray-600">{patient.mrNumber} | {age} thn | {patient.gender}</p>
                      </div>
                    </div>
                    {patient.hasDietIssue && (
                      <div className="bg-orange-50 border border-orange-200 rounded p-3 mb-4">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                          <span className="text-sm font-medium text-orange-800">Ada Masalah Diet</span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedDietIssue(patient.dietAlert);
                            setShowDietIssuesModal(true);
                          }}
                          className="mt-2 text-xs bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700"
                        >
                          Lihat Detail
                        </button>
                      </div>
                    )}
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Diet:</span>
                        <span className="font-medium">{patient.dietPlan || 'Belum ada'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Kepatuhan:</span>
                        <span className={`font-medium ${patient.dietCompliance >= 80 ? 'text-green-600' :
                          patient.dietCompliance >= 60 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                          {patient.dietCompliance ? `${patient.dietCompliance}%` : 'Belum ada'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Kebutuhan Kalori:</span>
                        <span className="font-medium">{calories} kkal</span>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setSelectedPatient(patient);
                          setDietPlanForm({ ...dietPlanForm, calorieRequirement: calories.toString() });
                          setActiveTab('monitoring');
                        }}
                        className="flex-1 bg-green-100 text-green-700 py-2 px-3 rounded text-sm font-medium hover:bg-green-200"
                      >
                        Kelola Diet
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPatientForHistory(patient);
                          setShowDietHistoryModal(true);
                        }}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded text-sm font-medium hover:bg-gray-200 "
                      >
                        Riwayat Diet
                      </button>
                      <button
                        onClick={() => {
                          // Cek apakah ada data menu dari nutrition record
                          const hasMenu = patient.mealDistribution &&
                            typeof patient.mealDistribution === 'object' &&
                            Object.values(patient.mealDistribution).some((meals: any) =>
                              Array.isArray(meals) && meals.length > 0
                            );

                          if (hasMenu) {
                            setSelectedMenuPatient(patient);
                            setShowMenuModal(true);
                          } else {
                            alert('Belum ada menu makanan untuk pasien ini.\nSilakan buat menu terlebih dahulu di Tab Monitoring.');
                          }
                        }}
                        className={`flex-1 py-2 px-3 rounded text-sm font-medium flex items-center justify-center space-x-1 ${patient.mealDistribution &&
                          typeof patient.mealDistribution === 'object' &&
                          Object.values(patient.mealDistribution).some((meals: any) =>
                            Array.isArray(meals) && meals.length > 0
                          )
                          ? 'bg-purple-100 text-blue-700 hover:bg-blue-200 cursor-pointer'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                      >
                        <span>
                          {patient.mealDistribution &&
                            typeof patient.mealDistribution === 'object' &&
                            Object.values(patient.mealDistribution).some((meals: any) =>
                              Array.isArray(meals) && meals.length > 0
                            ) ? 'Lihat Menu' : 'Menu (Belum ada)'}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredPatients.length > 0 && (
                <div className="lg:hidden px-4 pb-4 border-t border-gray-200">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-700">Tampilkan</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                        className="px-2 py-1 border border-gray-400 rounded-lg text-xs text-gray-700"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronLeft className="h-4 w-4 text-gray-600" />
                      </button>
                      <span className="text-xs text-gray-700 px-2">{currentPage}/{totalPages}</span>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronRight className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderMonitoring = () => (
    <div className="space-y-6">
      {selectedPatient ? (
        <>
          {/* SECTION 1: INFORMASI PASIEN & RENCANA DIET */}
          <div id="section-rencana-diet" className="bg-white rounded-xl shadow-lg border-2 border-green-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-green-50">
              <h2 className="text-xl font-semibold flex items-center text-gray-900">
                <Users className="h-6 w-6 mr-3 text-green-600" />
                Informasi Pasien & Rencana Diet
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Informasi Dasar Pasien */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <p className="text-xs text-gray-600 mb-1">Nama Pasien</p>
                  <p className="text-base font-bold text-gray-900">{selectedPatient.name}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <p className="text-xs text-gray-600 mb-1">No RM</p>
                  <p className="text-base font-bold text-gray-900">{selectedPatient.mrNumber}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <p className="text-xs text-gray-600 mb-1">Umur</p>
                  <p className="text-base font-bold text-gray-900">
                    {calculateAge(selectedPatient.birthDate)} tahun
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <p className="text-xs text-gray-600 mb-1">Diabetes Type</p>
                  <p className="text-base font-bold text-gray-900">
                    {selectedPatient.diabetesType || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Data Antropometri & Energi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Antropometri */}
                <div className="bg-green-50 p-4 rounded-lg border-2 border-green-300">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                    <Scale className="h-5 w-5 mr-2 text-green-600" />
                    Data Antropometri Terbaru
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded shadow-sm">
                      <label className="text-xs text-green-600">Tinggi Badan</label>
                      <p className="text-lg font-bold text-gray-900">
                        {selectedPatient.currentHeight || selectedPatient.height || '-'} cm
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded shadow-sm">
                      <label className="text-xs text-green-600">Berat Badan</label>
                      <p className="text-lg font-bold text-gray-900">
                        {selectedPatient.currentWeight || selectedPatient.weight || '-'} kg
                      </p>
                      {selectedPatient.lastWeightUpdate && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(selectedPatient.lastWeightUpdate).toLocaleDateString('id-ID')}
                        </p>
                      )}
                    </div>
                    <div className="bg-white p-3 rounded shadow-sm">
                      <label className="text-xs text-green-600">BMI</label>
                      <p className={`text-lg font-bold ${selectedPatient.latestBMI < 18.5 ? 'text-blue-600' :
                        selectedPatient.latestBMI < 25 ? 'text-green-600' :
                          selectedPatient.latestBMI < 30 ? 'text-yellow-600' :
                            'text-red-600'
                        }`}>
                        {selectedPatient.latestBMI ? selectedPatient.latestBMI.toFixed(1) : '-'}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {selectedPatient.latestBMI ? getBMICategory(selectedPatient.latestBMI) : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded shadow-sm">
                      <label className="text-xs text-green-600">Status Gizi</label>
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedPatient.energyCalculationDetail?.nutritionStatus || 'Normal'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Perhitungan Energi */}
                <div className="bg-green-50 p-4 rounded-lg border-2 border-green-300">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                    <Calculator className="h-5 w-5 mr-2 text-green-600" />
                    Kebutuhan Energi (PERKENI 2015)
                  </h4>
                  {selectedPatient.energyCalculationDetail ? (
                    <div className="space-y-2">
                      <div className="bg-white p-3 rounded shadow-sm">
                        <p className="text-xs text-green-600">Total Kebutuhan Energi</p>
                        <p className="text-3xl font-bold text-gray-900 text-center">
                          {selectedPatient.latestEnergyCalculation}
                          <span className="text-sm font-normal ml-1">kkal/hari</span>
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white p-2 rounded">
                          <span className="text-green-600">BBI:</span>
                          <span className="ml-1 font-bold text-gray-600">{selectedPatient.energyCalculationDetail.bbi} kg</span>
                        </div>
                        <div className="bg-white p-2 rounded">
                          <span className="text-green-600">BMR:</span>
                          <span className="ml-1 font-bold text-gray-600">{selectedPatient.energyCalculationDetail.bmr} kkal</span>
                        </div>
                        <div className="bg-white p-2 rounded">
                          <span className="text-green-600">Aktivitas:</span>
                          <span className="ml-1 font-bold capitalize text-gray-600">{selectedPatient.energyCalculationDetail.activityLevel}</span>
                        </div>
                        <div className="bg-white p-2 rounded">
                          <span className="text-green-600">F. Stres:</span>
                          <span className="ml-1 font-bold text-gray-600">{selectedPatient.energyCalculationDetail.stressFactor}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-2 flex items-center">
                        <Info className="h-3 w-3 mr-1" />
                        Dihitung: {new Date(selectedPatient.energyCalculationDetail.calculatedAt).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white p-4 rounded text-center">
                      <p className="text-sm text-gray-500">Belum ada perhitungan energi dari perawat</p>
                      <p className="text-xs text-gray-400 mt-1">Sistem akan menggunakan estimasi otomatis</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Alergi */}
              {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                  <h4 className="font-bold text-red-900 mb-2 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Peringatan Alergi
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPatient.allergies.map((allergy, idx) => (
                      <span key={idx} className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium border border-red-300">
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Form Rencana Diet */}
              <div className="border-t-2 border-gray-200 pt-6">
                <h4 className="font-bold text-gray-900 mb-4 text-lg flex items-center">
                  <Utensils className="h-5 w-5 mr-2 text-green-600" />
                  Rencana Diet Pasien
                </h4>

                {selectedPatient.dietPlan && (
                  <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-4">
                    <p className="text-lg font-medium text-green-800 mb-2">Diet Saat Ini:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <span className="text-sm text-gray-700">Jenis Diet:</span>
                        <p className="font-bold text-gray-900">{selectedPatient.dietPlan}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-700">Target Kalori:</span>
                        <p className="font-bold text-green-600">
                          {selectedPatient.calorieRequirement || selectedPatient.latestEnergyCalculation || 1800} kkal/hari
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                      Kebutuhan Kalori (kkal/hari)
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 font-bold text-lg"
                      value={dietPlanForm.calorieRequirement}
                      onChange={(e) => setDietPlanForm({ ...dietPlanForm, calorieRequirement: e.target.value })}
                      placeholder="1800"
                    />
                    {selectedPatient.latestEnergyCalculation && (
                      <div className="mt-2 flex items-center text-xs text-green-700 bg-green-50 p-2 rounded">
                        <CheckCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span>Menggunakan data perhitungan PERKENI 2015 dari perawat</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                      Jenis Diet
                    </label>
                    <select
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 font-medium"
                      value={dietPlanForm.dietType}
                      onChange={(e) => setDietPlanForm({ ...dietPlanForm, dietType: e.target.value })}
                    >
                      <option value="">-- Pilih Jenis Diet --</option>
                      <option value="Diet Diabetes">Diet Diabetes</option>
                      <option value="Diet Rendah Garam">Diet Rendah Garam</option>
                      <option value="Diet Tinggi Protein">Diet Tinggi Protein</option>
                      <option value="Diet Rendah Lemak">Diet Rendah Lemak</option>
                      <option value="Diet Lunak">Diet Lunak</option>
                      <option value="Diet Cair">Diet Cair</option>
                      {customDietTypes.map((diet, idx) => (
                        <option key={idx} value={diet}>{diet}</option>
                      ))}
                    </select>

                    {!showAddDietForm ? (
                      <button
                        onClick={() => setShowAddDietForm(true)}
                        className="mt-2 text-sm text-green-600 hover:text-green-700 font-medium flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Tambah Jenis Diet
                      </button>
                    ) : (
                      <div className="mt-3 p-3 bg-green-50 border-2 border-green-300 rounded-lg">
                        <label className="block text-xs font-semibold text-gray-700 mb-2">
                          Nama Jenis Diet Baru:
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white text-gray-900 mb-2"
                          placeholder="Contoh: Diet Mediterania"
                          value={newDietType}
                          onChange={(e) => setNewDietType(e.target.value)}
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              if (newDietType.trim()) {
                                setCustomDietTypes([...customDietTypes, newDietType.trim()]);
                                setDietPlanForm({ ...dietPlanForm, dietType: newDietType.trim() });
                                setNewDietType('');
                                setShowAddDietForm(false);
                              }
                            }}
                            className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                          >
                            Simpan
                          </button>
                          <button
                            onClick={() => {
                              setNewDietType('');
                              setShowAddDietForm(false);
                            }}
                            className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm font-medium"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Instruksi Khusus (Opsional)
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900"
                    rows={3}
                    value={dietPlanForm.specialInstructions}
                    onChange={(e) => setDietPlanForm({ ...dietPlanForm, specialInstructions: e.target.value })}
                    placeholder="Contoh: Hindari makanan tinggi gula, porsi kecil tapi sering, dll..."
                  />
                </div>

                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    onClick={() => updatePatientDietPlan(selectedPatient.id, dietPlanForm)}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!dietPlanForm.calorieRequirement || !dietPlanForm.dietType}
                  >
                    <Save className="h-4 w-4 inline mr-2" />
                    Simpan Rencana Diet
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: PERENCANAAN MENU MAKANAN */}
          <div id="section-menu-makanan" className="bg-white rounded-xl shadow-lg border-2 border-green-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-green-50">
              <h2 className="text-xl font-semibold flex items-center text-gray-900">
                <ChefHat className="h-6 w-6 mr-3 text-green-600" />
                Perencanaan Menu Makanan
              </h2>
            </div>

            <div className="p-6">
              {dietPlanForm.calorieRequirement ? (
                <MenuPlanningSection
                  targetCalories={parseInt(dietPlanForm.calorieRequirement)}
                  onSave={async (menuPlan) => {
                    try {
                      await fetch('/api/nutrition-records', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          patientId: selectedPatient.id,
                          targetCalories: parseInt(dietPlanForm.calorieRequirement),
                          dietPlan: selectedPatient.dietPlan || dietPlanForm.dietType,
                          mealDistribution: {
                            breakfast: menuPlan.breakfast,
                            morningSnack: menuPlan.morningSnack,
                            lunch: menuPlan.lunch,
                            afternoonSnack: menuPlan.afternoonSnack,
                            dinner: menuPlan.dinner
                          },
                          recommendations: [`Menu makanan telah diatur untuk diet ${selectedPatient.dietPlan || dietPlanForm.dietType}`]
                        })
                      });

                      await fetch('/api/alerts', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          type: 'INFO',
                          message: `Menu makanan telah ditetapkan untuk pasien ${selectedPatient.name} (${selectedPatient.mrNumber}). Diet: ${selectedPatient.dietPlan || dietPlanForm.dietType}, Target: ${dietPlanForm.calorieRequirement} kkal/hari. Mohon pastikan pasien menerima makanan sesuai rencana.`,
                          patientId: selectedPatient.id,
                          category: 'NUTRITION',
                          priority: 'MEDIUM',
                          targetRole: 'PERAWAT_RUANGAN'
                        })
                      });

                      alert('Menu makanan berhasil disimpan dan dikirim ke perawat!');
                      await fetchPatients();
                    } catch (error) {
                      console.error('Error saving menu plan:', error);
                      alert('Gagal menyimpan menu makanan');
                    }
                  }}
                />
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <ChefHat className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 font-medium mb-2">Masukkan Kebutuhan Kalori Terlebih Dahulu</p>
                  <p className="text-sm text-gray-500">Isi form Rencana Diet di atas untuk mulai merencanakan menu makanan</p>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: MONITORING KEPATUHAN DIET */}
          <div id="section-monitoring-kepatuhan" className="bg-white rounded-xl shadow-lg border-2 border-green-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-green-50">
              <h2 className="text-xl font-semibold flex items-center text-gray-900">
                <BarChart3 className="h-6 w-6 mr-3 text-green-600" />
                Monitoring Kepatuhan Diet
              </h2>
            </div>

            <div className="bg-white p-6 rounded-lg ">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h4 className="font-bold text-gray-900 flex items-center text-lg">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  Tren Kepatuhan Diet
                </h4>
                <select
                  value={compliancePeriod}
                  onChange={(e) => setCompliancePeriod(e.target.value)}
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-400 bg-white text-gray-900 font-medium w-full sm:w-auto"
                >
                  <option value="7">7 Hari Terakhir</option>
                  <option value="30">30 Hari Terakhir</option>
                  <option value="90">3 Bulan Terakhir</option>
                </select>
              </div>

              {selectedPatient.visitationHistory && selectedPatient.visitationHistory.length > 0 ? (
                <>
                  <div className="w-full overflow-x-auto">
                    <div className="min-w-[500px] h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          key={`chart-${compliancePeriod}-${selectedPatient.id}`} // ← TAMBAH INI
                          data={selectedPatient.visitationHistory
                            .filter(v => v.dietCompliance !== null)
                            .slice(0, parseInt(compliancePeriod))
                            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                            .map((visit, index) => ({
                              index: index,
                              date: new Date(visit.createdAt).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'short'
                              }),
                              fullDate: new Date(visit.createdAt).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric'
                              }),
                              time: new Date(visit.createdAt).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit'
                              }),
                              kepatuhan: visit.dietCompliance,
                              shift: visit.shift,
                              nurse: visit.nurse?.name || 'N/A',
                              issues: visit.dietIssues || null
                            }))}
                          margin={{ top: 5, right: 20, left: 10, bottom: 40 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis
                            domain={[0, 100]}
                            tick={{ fontSize: 12 }}
                            label={{ value: 'Kepatuhan (%)', angle: -90, position: 'insideLeft' }}
                          />

                          <Tooltip
                            cursor={{ stroke: '#10B981', strokeWidth: 2 }}
                            content={({ active, payload }) => {
                              if (!active || !payload || !payload[0]) return null;

                              const data = payload[0].payload;

                              return (
                                <div className="bg-white p-3 border-2 border-green-500 rounded-lg shadow-xl">
                                  <p className="font-bold text-green-700 text-sm mb-1">
                                    {data.fullDate}
                                  </p>
                                  <p className="text-xs text-gray-600 mb-2">
                                    {data.time} - Shift {data.shift}
                                  </p>
                                  <div className="bg-green-50 p-2 rounded mb-2 text-center">
                                    <p className={`text-2xl font-bold ${data.kepatuhan >= 80 ? 'text-green-600' :
                                      data.kepatuhan >= 60 ? 'text-yellow-600' : 'text-red-600'
                                      }`}>
                                      {data.kepatuhan}%
                                    </p>
                                    <p className="text-xs text-gray-600">Kepatuhan Diet</p>
                                  </div>
                                  <p className="text-xs text-gray-600 border-t pt-2">
                                    Perawat: {data.nurse}
                                  </p>
                                  {data.issues && (
                                    <div className="mt-2 p-2 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                                      <p className="text-xs font-semibold text-yellow-900">Kendala:</p>
                                      <p className="text-xs text-yellow-800">
                                        {data.issues.length > 60 ? data.issues.substring(0, 60) + '...' : data.issues}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              );
                            }}
                          />

                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="kepatuhan"
                            stroke="#10B981"
                            strokeWidth={3}
                            dot={{ fill: '#10B981', r: 4 }}
                            activeDot={{
                              r: 6,
                              onClick: (data) => console.log(data)
                            }}
                            name="Kepatuhan Diet (%)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-white rounded-lg border border-gray-300 mt-6">
                    <div className="flex flex-col items-center sm:items-start">
                      <span className="text-sm text-gray-600">Rata-rata</span>
                      <span className="font-bold text-xl text-gray-900">
                        {Math.round(
                          selectedPatient.visitationHistory
                            .filter(v => v.dietCompliance !== null)
                            .slice(0, parseInt(compliancePeriod))
                            .reduce((sum, v) => sum + (v.dietCompliance || 0), 0) /
                          Math.max(selectedPatient.visitationHistory.filter(v => v.dietCompliance !== null).slice(0, parseInt(compliancePeriod)).length, 1)
                        )}%
                      </span>
                    </div>
                    <div className="flex flex-col items-center sm:items-start">
                      <span className="text-sm text-gray-600">Tertinggi</span>
                      <span className="font-bold text-xl text-green-600">
                        {Math.max(...selectedPatient.visitationHistory
                          .filter(v => v.dietCompliance !== null)
                          .slice(0, parseInt(compliancePeriod))
                          .map(v => v.dietCompliance || 0))}%
                      </span>
                    </div>
                    <div className="flex flex-col items-center sm:items-start">
                      <span className="text-sm text-gray-600">Terendah</span>
                      <span className="font-bold text-xl text-red-600">
                        {Math.min(...selectedPatient.visitationHistory
                          .filter(v => v.dietCompliance !== null)
                          .slice(0, parseInt(compliancePeriod))
                          .map(v => v.dietCompliance || 0))}%
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-10 bg-white rounded-lg border-2 border-dashed border-gray-300">
                  <Activity className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600 font-medium">Belum ada data kepatuhan diet</p>
                  <p className="text-sm text-gray-500 mt-1">Data akan muncul setelah perawat melakukan monitoring</p>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 4: EVALUASI & REVISI DIET */}
          <div id="section-evaluasi-revisi" className="bg-white rounded-xl shadow-lg border-2 border-green-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-green-50">
              <h2 className="text-xl font-semibold flex items-center text-gray-900">
                <Edit3 className="h-6 w-6 mr-3 text-green-600" />
                Evaluasi & Revisi Diet
              </h2>
            </div>

            <div className="p-6">
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                      Tanggal Evaluasi
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white text-gray-900 font-medium"
                      value={monitoringForm.evaluationDate}
                      onChange={(e) => setMonitoringForm({ ...monitoringForm, evaluationDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                      Berat Badan (kg)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-900 font-medium cursor-not-allowed"
                        value={`${selectedPatient.currentWeight || selectedPatient.weight || '-'} kg (dari data terakhir)`}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="mt-2 flex items-center text-xs text-gray-600 bg-blue-50 p-2 rounded">
                      <Info className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span>
                        Data otomatis dari visitasi perawat terakhir
                        {selectedPatient.lastWeightUpdate && (
                          <span className="ml-1 font-medium">
                            ({new Date(selectedPatient.lastWeightUpdate).toLocaleDateString('id-ID')})
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Riwayat Perubahan BB */}
                    {selectedPatient.visitationHistory &&
                      selectedPatient.visitationHistory.filter(v => v.weight).length > 1 && (
                        <div className="mt-3 bg-gray-50 border border-gray-200 rounded p-3">
                          <p className="text-xs font-semibold text-gray-700 mb-2">Riwayat Perubahan BB:</p>
                          <div className="space-y-1 max-h-24 overflow-y-auto">
                            {selectedPatient.visitationHistory
                              .filter(v => v.weight)
                              .slice(0, 5)
                              .map((visit, idx) => (
                                <div key={idx} className="flex justify-between text-xs">
                                  <span className="text-gray-600">
                                    {new Date(visit.createdAt).toLocaleDateString('id-ID')}:
                                  </span>
                                  <span className="font-medium text-gray-900">{visit.weight} kg</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Status Kepatuhan
                  </label>
                  <select
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 font-medium"
                    value={monitoringForm.complianceStatus}
                    onChange={(e) => setMonitoringForm({ ...monitoringForm, complianceStatus: e.target.value })}
                  >
                    <option value="improving">Meningkat (Kepatuhan membaik)</option>
                    <option value="stable">Stabil (Kepatuhan konsisten)</option>
                    <option value="declining">Menurun (Kepatuhan berkurang)</option>
                    <option value="critical">Kritis (Perlu intervensi segera)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Catatan Evaluasi
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 bg-white text-gray-900"
                    rows={4}
                    value={monitoringForm.evaluationNotes}
                    onChange={(e) => setMonitoringForm({ ...monitoringForm, evaluationNotes: e.target.value })}
                    placeholder="Hasil evaluasi, observasi, catatan khusus..."
                  />
                </div>

                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={monitoringForm.reviseDiet}
                      onChange={(e) => setMonitoringForm({ ...monitoringForm, reviseDiet: e.target.checked })}
                      className="w-5 h-5 text-purple-600 rounded border-2 border-gray-400 focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-base font-bold text-gray-900">
                      Perlu Revisi Rencana Diet
                    </span>
                  </label>

                  {monitoringForm.reviseDiet && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">
                          Alasan Revisi
                        </label>
                        <textarea
                          className="w-full px-4 py-3 border-2 border-yellow-400 rounded-lg focus:ring-2 focus:ring-yellow-500 bg-white text-gray-900"
                          rows={3}
                          value={monitoringForm.dietRevisionNotes}
                          onChange={(e) => setMonitoringForm({ ...monitoringForm, dietRevisionNotes: e.target.value })}
                          placeholder="Jelaskan alasan revisi (mis: kepatuhan rendah, perubahan berat badan signifikan, masalah toleransi makanan, komplikasi kesehatan)..."
                        />
                      </div>

                      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                        <p className="text-sm font-bold text-blue-900 mb-3 flex items-center">
                          <Info className="h-4 w-4 mr-2" />
                          Panduan Pemilihan Jenis Diet
                        </p>
                        <div className="space-y-2 text-xs text-blue-900">
                          <p><strong className="text-blue-800">Diet Diabetes:</strong> Kontrol gula darah, DM Tipe 1 & 2</p>
                          <p><strong className="text-blue-800">Diet Rendah Garam:</strong> Hipertensi, gangguan jantung, edema</p>
                          <p><strong className="text-blue-800">Diet Tinggi Protein:</strong> Penyembuhan luka, post-operasi, malnutrisi</p>
                          <p><strong className="text-blue-800">Diet Rendah Lemak:</strong> Gangguan hati, pankreas, kolesterol tinggi</p>
                          <p><strong className="text-blue-800">Diet Lunak:</strong> Fase transisi, gangguan pencernaan ringan</p>
                          <p><strong className="text-blue-800">Diet Cair:</strong> Post-operasi, kesulitan menelan</p>
                        </div>
                      </div>

                      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                        <p className="text-sm text-red-900 flex items-start font-medium">
                          <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                          <span>
                            <strong>Perhatian:</strong> Revisi diet akan dikirim sebagai alert <strong>PRIORITAS TINGGI</strong> ke Perawat Ruangan melalui sistem notifikasi.
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t-2 border-gray-200">
                  <button
                    onClick={async () => {
                      try {
                        const recentVisitations = selectedPatient.visitationHistory
                          ?.filter(v => v.dietCompliance !== null)
                          .slice(0, 7) || [];

                        const avgCompliance = recentVisitations.length > 0
                          ? Math.round(
                            recentVisitations.reduce((sum, v) => sum + (v.dietCompliance || 0), 0) /
                            recentVisitations.length
                          )
                          : 0;

                        console.log('Calculated avgCompliance:', avgCompliance);

                        const nutritionResponse = await fetch('/api/nutrition-records', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            patientId: selectedPatient.id,
                            complianceScore: avgCompliance,
                            targetCalories: selectedPatient.latestEnergyCalculation || selectedPatient.calorieRequirement,
                            dietPlan: selectedPatient.dietPlan,
                            weightChange: monitoringForm.weight ?
                              parseFloat(monitoringForm.weight) - (selectedPatient.currentWeight || selectedPatient.weight || 0) : null,
                            recommendations: [
                              monitoringForm.evaluationNotes,
                              monitoringForm.dietRevisionNotes
                            ].filter(Boolean),
                            foodRecall: {
                              evaluationDate: monitoringForm.evaluationDate,
                              complianceStatus: monitoringForm.complianceStatus,
                              evaluationNotes: monitoringForm.evaluationNotes
                            }
                          })
                        });

                        if (!nutritionResponse.ok) {
                          const errorData = await nutritionResponse.json();
                          throw new Error(errorData.error || 'Failed to save nutrition record');
                        }

                        console.log('Nutrition record saved successfully');

                        // 3. MARK ALERT AS READ jika ada diet issue
                        if (selectedPatient.dietAlert?.id) {
                          await fetch(`/api/alerts/${selectedPatient.dietAlert.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ isRead: true })
                          });
                          console.log('Alert marked as read');
                        }

                        // 4. Buat alert baru jika perlu revisi
                        if (monitoringForm.reviseDiet && monitoringForm.dietRevisionNotes) {
                          await fetch('/api/alerts', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              type: 'WARNING',
                              message: `REVISI DIET - ${selectedPatient.name} (${selectedPatient.mrNumber}): ${monitoringForm.dietRevisionNotes}. Diet saat ini: ${selectedPatient.dietPlan || 'Belum ada'}. Mohon perhatikan perubahan instruksi diet.`,
                              patientId: selectedPatient.id,
                              category: 'NUTRITION',
                              priority: 'HIGH',
                              targetRole: 'PERAWAT_RUANGAN'
                            })
                          });
                          console.log('Revision alert created');
                        }

                        alert('Evaluasi berhasil disimpan!' + (monitoringForm.reviseDiet ? '\nAlert revisi diet telah dikirim ke perawat' : ''));

                        await fetchPatients();

                        // 6. Reset form
                        setMonitoringForm({
                          evaluationDate: new Date().toISOString().split('T')[0],
                          weight: '',
                          evaluationNotes: '',
                          complianceStatus: 'stable',
                          reviseDiet: false,
                          dietRevisionNotes: ''
                        });

                      } catch (error) {
                        console.error('Error saving evaluation:', error);
                        alert('Gagal menyimpan evaluasi: ' + (error instanceof Error ? error.message : 'Unknown error'));
                      }
                    }}
                    disabled={!monitoringForm.evaluationNotes}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="h-5 w-5 inline mr-2" />
                    Simpan Evaluasi
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tombol Kembali ke Daftar Pasien */}
          <div className="flex justify-center">
            <button
              onClick={() => {
                setSelectedPatient(null);
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
                  specialInstructions: ''
                });
                setMonitoringForm({
                  evaluationDate: new Date().toISOString().split('T')[0],
                  weight: '',
                  evaluationNotes: '',
                  complianceStatus: 'stable',
                  reviseDiet: false,
                  dietRevisionNotes: ''
                });
              }}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium flex items-center space-x-2"
            >
              <Users className="h-5 w-5" />
              <span>Kembali ke Daftar Pasien</span>
            </button>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border-2 border-gray-300 p-12 text-center">
          <Activity className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Pilih Pasien untuk Monitoring</h3>
          <p className="text-gray-600 mb-6">
            Silakan pilih pasien dari <strong>Tab Daftar Pasien</strong> untuk memulai monitoring diet & asupan
          </p>
          <button
            onClick={() => setActiveTab('patients')}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold inline-flex items-center"
          >
            <Users className="h-5 w-5 mr-2" />
            Lihat Daftar Pasien
          </button>
        </div>
      )}
    </div>
  );

  const PatientDetailModal = () => {
    if (!showPatientDetail || !selectedPatient) return null;
    const age = calculateAge(selectedPatient.birthDate);

    // State untuk filter visitasi
    const [visitationFilter, setVisitationFilter] = useState({
      date: new Date().toISOString().split('T')[0],
      showAll: false
    });

    // Filter visitasi berdasarkan tanggal atau tampilkan semua
    const filteredVisitations = selectedPatient.visitationHistory?.filter(v => {
      if (visitationFilter.showAll) return true;
      const visitDate = new Date(v.createdAt).toISOString().split('T')[0];
      return visitDate === visitationFilter.date;
    }) || [];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Users className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Detail Pasien</h3>
                  <p className="text-sm text-gray-600">Informasi lengkap pasien rawat inap</p>
                </div>
              </div>
              <button
                onClick={() => setShowPatientDetail(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Identitas Section */}
            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <div className="flex items-center mb-4">
                <Users className="h-5 w-5 text-green-600 mr-2" />
                <h4 className="font-semibold text-gray-900">Identitas Pasien</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">No. Rekam Medis</label>
                  <p className="text-base font-semibold text-gray-900 mt-1">{selectedPatient.mrNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Nama Lengkap</label>
                  <p className="text-base font-semibold text-gray-900 mt-1">{selectedPatient.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Jenis Kelamin</label>
                  <p className="text-base text-gray-900 mt-1">
                    {selectedPatient.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Usia</label>
                  <p className="text-base text-gray-900 mt-1">{age} tahun</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Tanggal Lahir</label>
                  <p className="text-base text-gray-900 mt-1">
                    {new Date(selectedPatient.birthDate).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Telepon</label>
                  <p className="text-base text-gray-900 mt-1 flex items-center">
                    <Bell className="h-4 w-4 mr-2 text-gray-400" />
                    {selectedPatient.phone || '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Section */}
            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <div className="flex items-center mb-4">
                <Activity className="h-5 w-5 text-green-600 mr-2" />
                <h4 className="font-semibold text-gray-900">Status Perawatan</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Status Rawat</label>
                  <div className="mt-1">
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                      RAWAT INAP
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Tingkat Risiko</label>
                  <div className="mt-1">
                    {selectedPatient.riskLevel ? (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${selectedPatient.riskLevel === 'HIGH' ? 'bg-red-100 text-red-800' :
                        selectedPatient.riskLevel === 'MEDIUM' ? 'bg-orange-100 text-orange-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                        {selectedPatient.riskLevel === 'HIGH' ? 'Tinggi' :
                          selectedPatient.riskLevel === 'MEDIUM' ? 'Sedang' : 'Rendah'}
                      </span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Antropometri Section */}
            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <div className="flex items-center mb-4">
                <Scale className="h-5 w-5 text-green-600 mr-2" />
                <h4 className="font-semibold text-gray-900">Data Antropometri</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Tinggi Badan</label>
                  <p className="text-base text-gray-900 mt-1">
                    {selectedPatient.height || selectedPatient.currentHeight || '-'} cm
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Berat Badan</label>
                  <p className="text-base text-gray-900 mt-1">
                    {selectedPatient.weight || selectedPatient.currentWeight || '-'} kg
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">BMI</label>
                  <p className="text-base text-gray-900 mt-1">
                    {selectedPatient.bmi || selectedPatient.latestBMI ? (
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getBMIColor(selectedPatient.bmi || selectedPatient.latestBMI)}`}>
                        {(selectedPatient.bmi || selectedPatient.latestBMI).toFixed(1)} ({getBMICategory(selectedPatient.bmi || selectedPatient.latestBMI)})
                      </span>
                    ) : '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Kebutuhan Kalori</label>
                  <p className="text-base text-gray-900 mt-1 font-medium">
                    {selectedPatient.latestEnergyCalculation || selectedPatient.calorieRequirement ||
                      calculateCalorieNeed(
                        selectedPatient.currentWeight || selectedPatient.weight,
                        selectedPatient.currentHeight || selectedPatient.height,
                        age,
                        selectedPatient.gender
                      )}{' '}
                    kkal/hari
                  </p>
                </div>
              </div>
            </div>

            {/* Medical Info Section */}
            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <div className="flex items-center mb-4">
                <Utensils className="h-5 w-5 text-green-600 mr-2" />
                <h4 className="font-semibold text-gray-900">Informasi Medis & Nutrisi</h4>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Diagnosis Diabetes</label>
                  <p className="text-base text-gray-900 mt-1 font-medium">
                    {selectedPatient.diabetesType || 'Tidak ada data'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Rencana Diet Saat Ini</label>
                  <p className="text-base text-gray-900 mt-1">
                    {selectedPatient.dietPlan || 'Belum ada rencana diet'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Kepatuhan Diet</label>
                  <p className="text-base text-gray-900 mt-1">
                    {selectedPatient.dietCompliance ? (
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getComplianceColor(selectedPatient.dietCompliance)}`}>
                        {selectedPatient.dietCompliance}%
                      </span>
                    ) : (
                      <span className="text-gray-500">Belum ada data</span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1 text-red-500" />
                    Alergi
                  </label>
                  <div className="mt-2">
                    {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedPatient.allergies.map((allergy, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium border border-red-200"
                          >
                            {allergy}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-base text-gray-500">Tidak ada alergi yang tercatat</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Riwayat Visitasi Section dengan Filter */}
            {selectedPatient.visitationHistory && selectedPatient.visitationHistory.length > 0 && (
              <div className="bg-white border border-gray-300 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-green-600 mr-2" />
                    <h4 className="font-semibold text-gray-900">Riwayat Visitasi</h4>
                  </div>
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={visitationFilter.showAll}
                        onChange={(e) => setVisitationFilter({ ...visitationFilter, showAll: e.target.checked })}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-gray-700">Tampilkan Semua</span>
                    </label>
                    {!visitationFilter.showAll && (
                      <input
                        type="date"
                        value={visitationFilter.date}
                        onChange={(e) => setVisitationFilter({ ...visitationFilter, date: e.target.value })}
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredVisitations.length > 0 ? (
                    filteredVisitations.map((visit, idx) => (
                      <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-medium text-gray-600">
                            {new Date(visit.createdAt).toLocaleString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            {visit.visitType || 'Visitasi Rutin'}
                          </span>
                        </div>
                        {visit.notes && (
                          <p className="text-sm text-gray-700 mb-2">{visit.notes}</p>
                        )}
                        {visit.vitalSigns && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                            {visit.vitalSigns.bloodPressure && (
                              <div className="bg-white p-2 rounded">
                                <span className="text-gray-600">TD: </span>
                                <span className="font-medium">{visit.vitalSigns.bloodPressure}</span>
                              </div>
                            )}
                            {visit.vitalSigns.heartRate && (
                              <div className="bg-white p-2 rounded">
                                <span className="text-gray-600">HR: </span>
                                <span className="font-medium">{visit.vitalSigns.heartRate} bpm</span>
                              </div>
                            )}
                            {visit.vitalSigns.temperature && (
                              <div className="bg-white p-2 rounded">
                                <span className="text-gray-600">Temp: </span>
                                <span className="font-medium">{visit.vitalSigns.temperature}°C</span>
                              </div>
                            )}
                            {visit.vitalSigns.bloodSugar && (
                              <div className="bg-white p-2 rounded">
                                <span className="text-gray-600">GD: </span>
                                <span className="font-medium">{visit.vitalSigns.bloodSugar} mg/dL</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">
                        {visitationFilter.showAll
                          ? 'Belum ada riwayat visitasi'
                          : 'Tidak ada visitasi pada tanggal ini'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
            <button
              onClick={() => setShowPatientDetail(false)}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 z-50 lg:hidden ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Menu Ahli Gizi</h2>
            <button onClick={() => setIsMobileSidebarOpen(false)} className="text-white hover:bg-white/20 p-2 rounded">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setActiveTab(item.key as TabType);
                  setIsMobileSidebarOpen(false);
                }}
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


      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Mobile controls - setelah sidebar mobile */}
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="flex items-center space-x-2 bg-white p-3 rounded-lg shadow-sm border border-gray-200"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={() => {
              setIsRefreshing(true);
              refreshData();
            }}
            disabled={isRefreshing}
            className="flex items-center bg-white px-3 py-2 rounded-lg shadow-sm border border-green-500 text-sm text-gray-600 hover:bg-green-50 transition-colors disabled:opacity-50"
          >
            {isRefreshing ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full mr-2"></div>
                <span>Refresh...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2 text-green-600" />
                <span>Refresh</span>
              </>
            )}
          </button>
        </div>

        {/* Desktop controls */}
        <div className="hidden lg:flex items-center justify-end mb-6">
          <button
            onClick={() => {
              setIsRefreshing(true);
              refreshData();
            }}
            disabled={isRefreshing}
            className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm border border-green-500 text-sm text-gray-600 hover:bg-green-50 transition-colors disabled:opacity-50"
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


        <div className="bg-white rounded-lg shadow-sm mb-6 hidden lg:block">

          <div className="border-b border-gray-200">
            <nav className="flex space-x-25 px-6 justify-center">
              {navigationItems.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as TabType)}
                    className={`flex items-center space-x-2 py-4 px-6 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.key
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300'
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



        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'patients' && renderPatients()}
        {activeTab === 'monitoring' && renderMonitoring()}

        {activeTab === 'system-history' && (
          <SystemHistoryView
            patients={allPatients}
            selectedPatient={selectedPatient}
            onPatientSelect={(patient: any) => setSelectedPatient(patient)}
          />
        )}

        <DetailDietHistoryModal
          isOpen={showDietHistoryModal}
          onClose={() => {
            setShowDietHistoryModal(false);
            setSelectedPatientForHistory(null);
            setDietHistoryVisitations([]);
          }}
          patient={selectedPatientForHistory}
          visitations={dietHistoryVisitations}
          loading={loading}
        />
      </div>

      {showRefreshSplash && (
        <SplashScreen
          onFinish={() => {
            setShowRefreshSplash(false);
            setIsRefreshing(false);
          }}
          message="Memuat ulang data..."
          duration={1500}
        />
      )}

      <DietIssueModal
        isOpen={showDietIssuesModal}
        onClose={() => {
          setShowDietIssuesModal(false);
          setSelectedDietIssue(null);
        }}
        alert={selectedDietIssue}
        onResolve={handleResolveDietIssue}
      />

      <ViewMenuModal
        isOpen={showMenuModal}
        onClose={() => {
          setShowMenuModal(false);
          setSelectedMenuPatient(null);
        }}
        patientName={selectedMenuPatient?.name || ''}
        menuPlan={selectedMenuPatient?.mealDistribution || null}
        targetCalories={
          selectedMenuPatient?.latestEnergyCalculation ||
          selectedMenuPatient?.calorieRequirement ||
          selectedMenuPatient?.latestNutritionRecord?.targetCalories ||
          1800
        }
      />
    </div>
  );
};

export default NutritionistDashboard;
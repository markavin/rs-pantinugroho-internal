'use client';

import React, { useState, useEffect } from 'react';
import {
  Search, Plus, TrendingUp, Calendar, Users, Eye, Edit3, AlertTriangle, CheckCircle,
  Activity, Scale, Utensils, BarChart3, RefreshCw, Menu, X, Bell,
  Info,
  Calculator
} from 'lucide-react';
import SplashScreen from '@/components/SplashScreen';
import DietIssueModal from './DietIssueModal';

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

  // TAMBAHKAN INI
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
}

type TabType = 'dashboard' | 'patients' | 'monitoring';

const NutritionistDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [patients, setPatients] = useState([]);
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

  const [realTimeStats, setRealTimeStats] = useState({
    totalPatients: 0,
    activeDietPlans: 0,
    avgCompliance: 0,
    patientsWithAlert: 0,
    bmiCategories: [],
    complianceDistribution: []
  });

  const [selectedMonitoringDate, setSelectedMonitoringDate] = useState(new Date().toISOString().split('T')[0]);
  const [monitoringForm, setMonitoringForm] = useState({
    evaluationDate: new Date().toISOString().split('T')[0],
    weight: '',
    evaluationNotes: '',
    complianceStatus: 'stable',
    reviseDiet: false,
    dietRevisionNotes: ''
  });

  const [mealComplianceData, setMealComplianceData] = useState({
    breakfast: { percentage: 0, notes: '' },
    midMorning: { percentage: 0, notes: '' },
    lunch: { percentage: 0, notes: '' },
    afternoon: { percentage: 0, notes: '' },
    dinner: { percentage: 0, notes: '' }
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
    specialInstructions: ''
  });

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const [patientsRes, visitationsRes, alertsRes] = await Promise.all([
        fetch('/api/nutrition-patients?status=RAWAT_INAP'),
        fetch('/api/visitations'),
        fetch('/api/alerts?category=NUTRITION&unreadOnly=false')
      ]);

      if (patientsRes.ok && visitationsRes.ok && alertsRes.ok) {
        const patientsData = await patientsRes.json();
        const visitationsData = await visitationsRes.json();
        const alertsData = await alertsRes.json();

        const enrichedPatients = patientsData.map((patient) => {
          const patientVisitations = visitationsData
            .filter((v) => v.patientId === patient.id)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

          const dietAlert = alertsData.find((a) => a.patientId === patient.id && !a.isRead);

          return {
            ...patient,
            visitationHistory: patientVisitations,
            hasDietIssue: !!dietAlert,
            dietAlert
          };
        });

        setPatients(enrichedPatients);
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

      await fetchPatients();
      setSelectedPatient(null);
      setDietPlanForm({
        calorieRequirement: '',
        dietType: '',
        mealDistribution: { breakfast: 25, morningSnack: 10, lunch: 30, afternoonSnack: 10, dinner: 25 },
        specialInstructions: ''
      });
    } catch (err) {
      setError(err.message);
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

  const navigationItems = [
    { key: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { key: 'patients', label: 'Daftar Pasien Rawat Inap', icon: Users },
    { key: 'monitoring', label: 'Monitoring Diet & Asupan', icon: Activity }
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
                  <span className="text-xs sm:text-sm font-bold">{item.count} ({item.percentage}%)</span>
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Distribusi Kepatuhan Diet</h3>
          <div className="space-y-3 sm:space-y-4">
            {realTimeStats.complianceDistribution.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-700">{item.range}</span>
                  <span className="text-xs sm:text-sm font-bold">{item.count} ({item.percentage}%)</span>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari pasien atau MR..."
                className="pl-10 pr-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 w-full md:w-64 text-sm text-gray-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-600" />
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
                  {filteredPatients.map((patient) => (
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
                          <span className="text-gray-400 text-xs">Aman</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button
                          onClick={() => {
                            setSelectedPatient(patient);
                            setShowPatientDetail(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPatient(patient);
                            const age = calculateAge(patient.birthDate);
                            const calories =
                              patient.calorieRequirement ||
                              calculateCalorieNeed(patient.weight, patient.height, age, patient.gender);
                            setDietPlanForm({ ...dietPlanForm, calorieRequirement: calories.toString() });
                            setActiveTab('monitoring');
                          }}
                          className="text-green-600 hover:text-green-900 font-medium"
                        >
                          Kelola Diet
                        </button>
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
            </div>

            <div className="lg:hidden space-y-4 p-4">
              {filteredPatients.map((patient) => {
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
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedPatient(patient);
                          setShowPatientDetail(true);
                        }}
                        className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded text-sm font-medium hover:bg-blue-200 "
                      >
                        Detail
                      </button>
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
                    </div>
                  </div>
                );
              })}
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Pasien</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Nama</p>
                <p className="text-sm font-semibold text-gray-900">{selectedPatient.name}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">No RM</p>
                <p className="text-sm font-semibold text-gray-900">{selectedPatient.mrNumber}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Umur</p>
                <p className="text-sm font-semibold text-gray-900">{calculateAge(selectedPatient.birthDate)} tahun</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Diabetes Type</p>
                <p className="text-sm font-semibold text-gray-900">{selectedPatient.diabetesType || 'N/A'}</p>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-600 font-medium">Perhitungan Energi Terbaru</p>
                {selectedPatient.latestEnergyCalculation ? (
                  <>
                    <p className="text-2xl font-bold text-blue-900 mt-1">
                      {selectedPatient.latestEnergyCalculation} <span className="text-sm font-normal">kkal/hari</span>
                    </p>
                    {selectedPatient.lastWeightUpdate && (
                      <p className="text-xs text-blue-600 mt-1">
                        Dihitung: {new Date(selectedPatient.lastWeightUpdate).toLocaleDateString('id-ID')}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-500 mt-1">Belum ada perhitungan</p>
                )}
              </div>
            </div>
            {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-2">Alergi Makanan</p>
                <div className="flex flex-wrap gap-2">
                  {selectedPatient.allergies.map((allergy, idx) => (
                    <span key={idx} className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium">
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <button
              onClick={() => setSelectedPatient(null)}
              className="mt-4 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 font-medium"
            >
              Pilih Pasien Lain
            </button>
          </div>


          {selectedPatient.energyCalculationDetail && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calculator className="h-5 w-5 mr-2 text-indigo-600" />
                Detail Perhitungan Energi (PERKENI 2015)
              </h3>

              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">BBI:</span>
                    <p className="font-semibold text-gray-900">
                      {selectedPatient.energyCalculationDetail.bbi} kg
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">BMR:</span>
                    <p className="font-semibold text-gray-900">
                      {selectedPatient.energyCalculationDetail.bmr} kkal
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Aktivitas:</span>
                    <p className="font-semibold text-gray-900 capitalize">
                      {selectedPatient.energyCalculationDetail.activityLevel}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Faktor Stres:</span>
                    <p className="font-semibold text-gray-900">
                      {selectedPatient.energyCalculationDetail.stressFactor}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">BMR Dasar:</span>
                  <span className="font-medium">{selectedPatient.energyCalculationDetail.breakdown.baseEnergy} kkal</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">+ Aktivitas Fisik:</span>
                  <span className="font-medium">{selectedPatient.energyCalculationDetail.breakdown.withActivity} kkal</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">- Koreksi Usia:</span>
                  <span className="font-medium">{selectedPatient.energyCalculationDetail.breakdown.withAge} kkal</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">± Koreksi Status Gizi ({selectedPatient.energyCalculationDetail.nutritionStatus}):</span>
                  <span className="font-medium">{selectedPatient.energyCalculationDetail.breakdown.withNutrition} kkal</span>
                </div>
                <div className="flex justify-between py-2 bg-green-50 px-3 rounded-lg mt-2">
                  <span className="font-semibold text-green-800">Total Kebutuhan Energi:</span>
                  <span className="font-bold text-green-900">{selectedPatient.energyCalculationDetail.breakdown.final} kkal/hari</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800 flex items-start">
                  <Info className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                  <span>
                    Data perhitungan ini berasal dari visitasi perawat pada{' '}
                    {new Date(selectedPatient.energyCalculationDetail.calculatedAt).toLocaleString('id-ID')}.
                  </span>
                </p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rencana Diet Pasien</h3>
            {selectedPatient.dietPlan ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Jenis Diet</p>
                    <p className="text-base font-semibold text-gray-900">{selectedPatient.dietPlan}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Kebutuhan Kalori</p>
                    <p className="text-base font-semibold text-gray-900">{selectedPatient.calorieRequirement || 1800} kkal/hari</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800">Belum ada rencana diet untuk pasien ini</p>
              </div>
            )}

            <div className="space-y-4 mt-6">
              <h4 className="font-semibold text-gray-900">Buat/Edit Rencana Diet</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kebutuhan Kalori (kkal/hari)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white text-gray-900 font-medium"
                    value={dietPlanForm.calorieRequirement}
                    onChange={(e) => setDietPlanForm({ ...dietPlanForm, calorieRequirement: e.target.value })}
                    placeholder="1800"
                  />
                  {selectedPatient.latestEnergyCalculation && (
                    <div className="mt-1 flex items-center text-xs text-blue-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      <span>Data dari perhitungan perawat (PERKENI 2015)</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Diet</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white text-gray-900 font-medium"
                    value={dietPlanForm.dietType}
                    onChange={(e) => setDietPlanForm({ ...dietPlanForm, dietType: e.target.value })}
                  >
                    <option value="">Pilih Jenis Diet</option>
                    <option value="Diet Diabetes">Diet Diabetes</option>
                    <option value="Diet Rendah Garam">Diet Rendah Garam</option>
                    <option value="Diet Tinggi Protein">Diet Tinggi Protein</option>
                    <option value="Diet Rendah Lemak">Diet Rendah Lemak</option>
                    <option value="Diet Lunak">Diet Lunak</option>
                    <option value="Diet Cair">Diet Cair</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instruksi Khusus</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white text-gray-900"
                  rows={3}
                  value={dietPlanForm.specialInstructions}
                  onChange={(e) => setDietPlanForm({ ...dietPlanForm, specialInstructions: e.target.value })}
                  placeholder="Catatan khusus untuk diet pasien..."
                />
              </div>

              <button
                onClick={() => updatePatientDietPlan(selectedPatient.id, dietPlanForm)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                disabled={!dietPlanForm.calorieRequirement || !dietPlanForm.dietType}
              >
                Simpan Rencana Diet
              </button>
            </div>
          </div>


          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monitoring Asupan Harian</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Tanggal</label>
              <input
                type="date"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 w-full md:w-48 bg-white text-gray-900 font-medium"
                value={selectedMonitoringDate}
                onChange={(e) => setSelectedMonitoringDate(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              {[
                { name: 'breakfast', label: 'Pagi (Sarapan)', time: '06:00 - 08:00' },
                { name: 'midMorning', label: 'Tengah Pagi (Snack)', time: '09:00 - 10:00' },
                { name: 'lunch', label: 'Siang (Makan Siang)', time: '12:00 - 13:00' },
                { name: 'afternoon', label: 'Sore (Snack)', time: '15:00 - 16:00' },
                { name: 'dinner', label: 'Malam (Makan Malam)', time: '18:00 - 19:00' }
              ].map((meal) => {
                const data = mealComplianceData[meal.name];
                const isLow = data.percentage < 50;
                return (
                  <div key={meal.name} className={`border rounded-lg p-4 ${isLow ? 'border-orange-200 bg-orange-50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{meal.label}</p>
                        <p className="text-xs text-gray-600">{meal.time}</p>
                      </div>
                      {isLow && (
                        <div className="flex items-center space-x-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Rendah</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Asupan (%)</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            className="px-3 py-2 border border-gray-300 rounded w-16 text-sm bg-white text-gray-900 font-semibold"
                            value={data.percentage}
                            onChange={(e) =>
                              setMealComplianceData({
                                ...mealComplianceData,
                                [meal.name]: { ...data, percentage: parseInt(e.target.value) || 0 }
                              })
                            }
                          />
                          <span className="text-sm font-medium text-gray-700">%</span>
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs text-gray-600 mb-1">Catatan</label>
                        <input
                          type="text"
                          className="px-3 py-2 border border-gray-300 rounded w-full text-sm bg-white text-gray-900"
                          placeholder="Cth: pasien menolak, mual, dst"
                          value={data.notes}
                          onChange={(e) =>
                            setMealComplianceData({
                              ...mealComplianceData,
                              [meal.name]: { ...data, notes: e.target.value }
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${data.percentage >= 80 ? 'bg-green-500' :
                          data.percentage >= 50 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                        style={{ width: `${data.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Rata-rata Kepatuhan Hari Ini:</strong> {Math.round(
                  (mealComplianceData.breakfast.percentage +
                    mealComplianceData.midMorning.percentage +
                    mealComplianceData.lunch.percentage +
                    mealComplianceData.afternoon.percentage +
                    mealComplianceData.dinner.percentage) / 5
                )}%
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Evaluasi & Revisi Diet</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Evaluasi</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white text-gray-900 font-medium"
                    value={monitoringForm.evaluationDate}
                    onChange={(e) => setMonitoringForm({ ...monitoringForm, evaluationDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Berat Badan Terbaru (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white text-gray-900 font-medium"
                    value={monitoringForm.weight}
                    onChange={(e) => setMonitoringForm({ ...monitoringForm, weight: e.target.value })}
                    placeholder={selectedPatient.weight || '0'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status Kepatuhan</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white text-gray-900 font-medium"
                  value={monitoringForm.complianceStatus}
                  onChange={(e) => setMonitoringForm({ ...monitoringForm, complianceStatus: e.target.value })}
                >
                  <option value="stable">Stabil</option>
                  <option value="improving">Meningkat</option>
                  <option value="declining">Menurun</option>
                  <option value="critical">Kritis</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catatan Evaluasi</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white text-gray-900"
                  rows={3}
                  value={monitoringForm.evaluationNotes}
                  onChange={(e) => setMonitoringForm({ ...monitoringForm, evaluationNotes: e.target.value })}
                  placeholder="Hasil evaluasi, observasi, catatan khusus..."
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={monitoringForm.reviseDiet}
                    onChange={(e) => setMonitoringForm({ ...monitoringForm, reviseDiet: e.target.checked })}
                    className="w-4 h-4 text-green-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Perlu Revisi Rencana Diet</span>
                </label>

                {monitoringForm.reviseDiet && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Alasan & Rekomendasi Revisi</label>
                    <textarea
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white text-gray-900"
                      rows={3}
                      value={monitoringForm.dietRevisionNotes}
                      onChange={(e) => setMonitoringForm({ ...monitoringForm, dietRevisionNotes: e.target.value })}
                      placeholder="Jelaskan alasan revisi dan rekomendasi perubahan..."
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={async () => {
                    try {
                      const avgCompliance = Math.round(
                        (mealComplianceData.breakfast.percentage +
                          mealComplianceData.midMorning.percentage +
                          mealComplianceData.lunch.percentage +
                          mealComplianceData.afternoon.percentage +
                          mealComplianceData.dinner.percentage) / 5
                      );

                      await fetch('/api/nutrition-records', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          patientId: selectedPatient.id,
                          complianceScore: avgCompliance,
                          weightChange: monitoringForm.weight ? parseFloat(monitoringForm.weight) - (selectedPatient.weight || 0) : null,
                          recommendations: [monitoringForm.evaluationNotes, monitoringForm.dietRevisionNotes].filter(Boolean)
                        })
                      });

                      if (monitoringForm.reviseDiet) {
                        await fetch('/api/alerts', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            type: 'WARNING',
                            message: `Revisi Diet untuk ${selectedPatient.name}: ${monitoringForm.dietRevisionNotes}`,
                            patientId: selectedPatient.id,
                            category: 'NUTRITION',
                            priority: 'HIGH',
                            targetRole: 'PERAWAT_RUANGAN'
                          })
                        });
                      }

                      await fetchPatients();
                      setSelectedPatient(null);
                      setMonitoringForm({
                        evaluationDate: new Date().toISOString().split('T')[0],
                        weight: '',
                        evaluationNotes: '',
                        complianceStatus: 'stable',
                        reviseDiet: false,
                        dietRevisionNotes: ''
                      });
                      setMealComplianceData({
                        breakfast: { percentage: 0, notes: '' },
                        midMorning: { percentage: 0, notes: '' },
                        lunch: { percentage: 0, notes: '' },
                        afternoon: { percentage: 0, notes: '' },
                        dinner: { percentage: 0, notes: '' }
                      });
                    } catch (error) {
                      console.error('Error saving evaluation:', error);
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  Simpan Evaluasi
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Activity className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-600">Pilih pasien dari tab Daftar Pasien untuk memulai monitoring</p>
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setIsRefreshing(true);
                refreshData();
              }}
              disabled={isRefreshing}
              className="ml-auto flex items-center bg-white px-3 py-2 rounded-lg shadow-sm border border-green-500 text-sm text-gray-600 hover:bg-green-50 disabled:opacity-50"
            >
              {isRefreshing ? (
                <div className="animate-spin h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full mr-2"></div>
              ) : (
                <RefreshCw className="h-4 w-4 mr-2 text-green-600" />
              )}
              <span>Refresh Data</span>
            </button>

            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden flex items-center bg-white p-2 rounded-lg shadow-sm border border-gray-200"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm mb-6 hidden lg:block">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6 justify-center">
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

        <PatientDetailModal />
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
    </div>
  );
};

export default NutritionistDashboard;
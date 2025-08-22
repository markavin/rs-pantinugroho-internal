// components/dashboard/NutritionistDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface NutritionPlan {
  id: string;
  patientName: string;
  patientMR: string;
  diabetesType: string;
  targetCalories: number;
  carbLimit: number;
  proteinGoal: number;
  fatLimit: number;
  status: 'ACTIVE' | 'UNDER_REVIEW' | 'COMPLETED';
  lastUpdated: string;
}

interface MealPlan {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  breakfast: MealItem[];
  lunch: MealItem[];
  dinner: MealItem[];
  snacks: MealItem[];
  totalCalories: number;
  totalCarbs: number;
  bloodSugarImpact: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface MealItem {
  food: string;
  portion: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}

interface FoodDatabase {
  id: string;
  name: string;
  category: string;
  calories: number; // per 100g
  carbs: number;
  protein: number;
  fat: number;
  fiber: number;
  glycemicIndex: number;
  diabeticFriendly: boolean;
}

const NutritionistDashboard = () => {
  const { data: session } = useSession();
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>([]);
  const [todayMealPlans, setTodayMealPlans] = useState<MealPlan[]>([]);
  const [foodDatabase, setFoodDatabase] = useState<FoodDatabase[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<NutritionPlan | null>(null);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [searchFood, setSearchFood] = useState('');

  // Demo data - nanti akan diganti dengan API calls
  useEffect(() => {
    setNutritionPlans([
      {
        id: '1',
        patientName: 'Ahmad Santoso',
        patientMR: 'MR-001',
        diabetesType: 'Tipe 2',
        targetCalories: 1800,
        carbLimit: 200,
        proteinGoal: 80,
        fatLimit: 60,
        status: 'ACTIVE',
        lastUpdated: '2024-01-15'
      },
      {
        id: '2',
        patientName: 'Siti Nurhaliza',
        patientMR: 'MR-002',
        diabetesType: 'Tipe 1',
        targetCalories: 2000,
        carbLimit: 250,
        proteinGoal: 90,
        fatLimit: 70,
        status: 'UNDER_REVIEW',
        lastUpdated: '2024-01-14'
      }
    ]);

    setTodayMealPlans([
      {
        id: '1',
        patientId: '1',
        patientName: 'Ahmad Santoso',
        date: '2024-01-16',
        breakfast: [
          { food: 'Oatmeal', portion: '50g', calories: 190, carbs: 32, protein: 7, fat: 3 },
          { food: 'Blueberry', portion: '80g', calories: 46, carbs: 11, protein: 0.6, fat: 0.2 }
        ],
        lunch: [
          { food: 'Nasi Merah', portion: '100g', calories: 110, carbs: 25, protein: 2.5, fat: 1 },
          { food: 'Ayam Panggang', portion: '100g', calories: 165, carbs: 0, protein: 31, fat: 3.6 }
        ],
        dinner: [
          { food: 'Ikan Salmon', portion: '120g', calories: 206, carbs: 0, protein: 28, fat: 12 },
          { food: 'Sayur Bayam', portion: '100g', calories: 23, carbs: 3.6, protein: 2.9, fat: 0.4 }
        ],
        snacks: [
          { food: 'Kacang Almond', portion: '30g', calories: 172, carbs: 6, protein: 6, fat: 15 }
        ],
        totalCalories: 912,
        totalCarbs: 77.6,
        bloodSugarImpact: 'MEDIUM'
      }
    ]);

    setFoodDatabase([
      { id: '1', name: 'Nasi Merah', category: 'Karbohidrat', calories: 110, carbs: 25, protein: 2.5, fat: 1, fiber: 1.8, glycemicIndex: 55, diabeticFriendly: true },
      { id: '2', name: 'Nasi Putih', category: 'Karbohidrat', calories: 130, carbs: 28, protein: 2.7, fat: 0.3, fiber: 0.4, glycemicIndex: 73, diabeticFriendly: false },
      { id: '3', name: 'Ayam Panggang', category: 'Protein', calories: 165, carbs: 0, protein: 31, fat: 3.6, fiber: 0, glycemicIndex: 0, diabeticFriendly: true },
      { id: '4', name: 'Ikan Salmon', category: 'Protein', calories: 206, carbs: 0, protein: 28, fat: 12, fiber: 0, glycemicIndex: 0, diabeticFriendly: true },
      { id: '5', name: 'Bayam', category: 'Sayuran', calories: 23, carbs: 3.6, protein: 2.9, fat: 0.4, fiber: 2.2, glycemicIndex: 15, diabeticFriendly: true }
    ]);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-100';
      case 'UNDER_REVIEW': return 'text-yellow-600 bg-yellow-100';
      case 'COMPLETED': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getBloodSugarImpactColor = (impact: string) => {
    switch (impact) {
      case 'LOW': return 'text-green-600 bg-green-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'HIGH': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredFoods = foodDatabase.filter(food =>
    food.name.toLowerCase().includes(searchFood.toLowerCase()) ||
    food.category.toLowerCase().includes(searchFood.toLowerCase())
  );

  const calculateMealStats = (meals: MealItem[]) => {
    return meals.reduce((acc, meal) => ({
      calories: acc.calories + meal.calories,
      carbs: acc.carbs + meal.carbs,
      protein: acc.protein + meal.protein,
      fat: acc.fat + meal.fat
    }), { calories: 0, carbs: 0, protein: 0, fat: 0 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Nutritionist Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {session?.user?.name} 🥗
              </h1>
              <p className="text-gray-600 mt-1">Nutritionist - Diabetes Nutrition Management</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rencana Nutrisi Aktif</p>
                <p className="text-2xl font-bold text-green-600">
                  {nutritionPlans.filter(p => p.status === 'ACTIVE').length}
                </p>
                <p className="text-xs text-gray-500">pasien terdaftar</p>
              </div>
              <div className="text-3xl">📋</div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Menu Hari Ini</p>
                <p className="text-2xl font-bold text-blue-600">{todayMealPlans.length}</p>
                <p className="text-xs text-gray-500">menu direncanakan</p>
              </div>
              <div className="text-3xl">🍽️</div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Perlu Review</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {nutritionPlans.filter(p => p.status === 'UNDER_REVIEW').length}
                </p>
                <p className="text-xs text-gray-500">rencana menunggu</p>
              </div>
              <div className="text-3xl">⏳</div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Database Makanan</p>
                <p className="text-2xl font-bold text-purple-600">{foodDatabase.length}</p>
                <p className="text-xs text-gray-500">item tersedia</p>
              </div>
              <div className="text-3xl">🏪</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Active Nutrition Plans */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                📋 Rencana Nutrisi Aktif
              </h2>
              <button
                onClick={() => setShowCreatePlan(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105"
              >
                + Buat Rencana Baru
              </button>
            </div>
            
            <div className="space-y-3">
              {nutritionPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedPlan(plan)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800">
                          {plan.patientName}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                          {plan.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {plan.patientMR} • {plan.diabetesType}
                      </p>
                      <div className="flex gap-4 text-xs text-gray-500 mt-2">
                        <span>🔥 {plan.targetCalories} kal</span>
                        <span>🍞 {plan.carbLimit}g karbo</span>
                        <span>🥩 {plan.proteinGoal}g protein</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Update terakhir</p>
                      <p className="text-sm font-medium">
                        {new Date(plan.lastUpdated).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Meal Plans */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              🍽️ Menu Hari Ini
            </h2>
            
            <div className="space-y-4">
              {todayMealPlans.map((mealPlan) => (
                <div
                  key={mealPlan.id}
                  className="p-4 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {mealPlan.patientName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(mealPlan.date).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBloodSugarImpactColor(mealPlan.bloodSugarImpact)}`}>
                      Impact: {mealPlan.bloodSugarImpact}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Total Kalori</p>
                      <p className="font-medium text-blue-600">{mealPlan.totalCalories} kal</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Karbohidrat</p>
                      <p className="font-medium text-orange-600">{mealPlan.totalCarbs.toFixed(1)}g</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex gap-2">
                    <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-sm">
                      Detail Menu
                    </button>
                    <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded text-sm">
                      Edit Menu
                    </button>
                  </div>
                </div>
              ))}
              
              {todayMealPlans.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🍽️</div>
                  <p>Belum ada menu yang direncanakan hari ini</p>
                  <button className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg">
                    Buat Menu Baru
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Food Database */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              🏪 Database Makanan
            </h2>
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105">
              + Tambah Makanan
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              value={searchFood}
              onChange={(e) => setSearchFood(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="🔍 Cari makanan berdasarkan nama atau kategori..."
            />
          </div>

          {/* Food List */}
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50 rounded-lg">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nama Makanan</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Kategori</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Kalori</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Karbohidrat</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Protein</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">GI</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredFoods.map((food) => (
                  <tr key={food.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {food.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {food.category}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {food.calories} kal
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {food.carbs}g
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {food.protein}g
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <span className={`font-medium ${
                        food.glycemicIndex <= 55 ? 'text-green-600' : 
                        food.glycemicIndex <= 70 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {food.glycemicIndex}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        food.diabeticFriendly 
                          ? 'text-green-600 bg-green-100' 
                          : 'text-red-600 bg-red-100'
                      }`}>
                        {food.diabeticFriendly ? '✅ Aman' : '⚠️ Hati-hati'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Edit
                        </button>
                        <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                          Tambah ke Menu
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredFoods.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🔍</div>
              <p>Tidak ada makanan yang ditemukan</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-6 text-white cursor-pointer hover:scale-105 transition-transform">
            <div className="flex items-center gap-4">
              <div className="text-4xl">📊</div>
              <div>
                <h3 className="font-bold text-lg">Analisis Nutrisi</h3>
                <p className="text-sm opacity-90">Evaluasi pola makan pasien</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 text-white cursor-pointer hover:scale-105 transition-transform">
            <div className="flex items-center gap-4">
              <div className="text-4xl">📚</div>
              <div>
                <h3 className="font-bold text-lg">Edukasi Gizi</h3>
                <p className="text-sm opacity-90">Materi pembelajaran nutrisi</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white cursor-pointer hover:scale-105 transition-transform">
            <div className="flex items-center gap-4">
              <div className="text-4xl">📈</div>
              <div>
                <h3 className="font-bold text-lg">Laporan Progres</h3>
                <p className="text-sm opacity-90">Monitoring hasil diet</p>
              </div>
            </div>
          </div>
        </div>

        {/* Create Nutrition Plan Modal */}
        {showCreatePlan && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Buat Rencana Nutrisi Baru</h3>
                <button
                  onClick={() => setShowCreatePlan(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pilih Pasien
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <option value="">Pilih pasien...</option>
                    <option value="1">Ahmad Santoso (MR-001)</option>
                    <option value="2">Siti Nurhaliza (MR-002)</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Kalori
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="1800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Limit Karbohidrat (g)
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="200"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Protein (g)
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="80"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Limit Lemak (g)
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="60"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan Khusus
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                    placeholder="Alergi, pantangan makanan, preferensi, dll..."
                  />
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreatePlan(false)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg"
                  >
                    Buat Rencana
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Nutrition Plan Detail Modal */}
        {selectedPlan && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Detail Rencana Nutrisi</h3>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Nama Pasien</label>
                    <p className="font-medium">{selectedPlan.patientName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Nomor MR</label>
                    <p className="font-medium">{selectedPlan.patientMR}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Tipe Diabetes</label>
                    <p className="font-medium">{selectedPlan.diabetesType}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Status</label>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPlan.status)}`}>
                      {selectedPlan.status}
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Target Nutrisi Harian</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Kalori</p>
                      <p className="text-lg font-bold text-blue-600">{selectedPlan.targetCalories} kal</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Karbohidrat</p>
                      <p className="text-lg font-bold text-orange-600">{selectedPlan.carbLimit}g</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Protein</p>
                      <p className="text-lg font-bold text-green-600">{selectedPlan.proteinGoal}g</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Lemak</p>
                      <p className="text-lg font-bold text-purple-600">{selectedPlan.fatLimit}g</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg">
                  Edit Rencana
                </button>
                <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg">
                  Buat Menu Hari Ini
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default NutritionistDashboard;
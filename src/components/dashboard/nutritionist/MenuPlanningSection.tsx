import React, { useState } from 'react';
import { Plus, Trash2, Save, ChefHat } from 'lucide-react';

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

interface MenuPlanningSectionProps {
  targetCalories: number;
  onSave: (menuPlan: MenuPlan) => void;
}

const MenuPlanningSection: React.FC<MenuPlanningSectionProps> = ({
  targetCalories,
  onSave
}) => {
  const [menuPlan, setMenuPlan] = useState<MenuPlan>({
    breakfast: [],
    morningSnack: [],
    lunch: [],
    afternoonSnack: [],
    dinner: []
  });

  const mealTimes = [
    { key: 'breakfast' as keyof MenuPlan, label: 'Sarapan (07:00)', percentage: 25 },
    { key: 'morningSnack' as keyof MenuPlan, label: 'Snack Pagi (10:00)', percentage: 10 },
    { key: 'lunch' as keyof MenuPlan, label: 'Makan Siang (12:00)', percentage: 30 },
    { key: 'afternoonSnack' as keyof MenuPlan, label: 'Snack Sore (15:00)', percentage: 10 },
    { key: 'dinner' as keyof MenuPlan, label: 'Makan Malam (18:00)', percentage: 25 }
  ];

  const addMealItem = (mealTime: keyof MenuPlan) => {
    const newItem: MealItem = {
      id: Date.now().toString(),
      name: '',
      portion: '',
      calories: 0,
      carbs: 0,
      protein: 0,
      fat: 0
    };

    setMenuPlan(prev => ({
      ...prev,
      [mealTime]: [...prev[mealTime], newItem]
    }));
  };

  const updateMealItem = (mealTime: keyof MenuPlan, itemId: string, field: keyof MealItem, value: any) => {
    setMenuPlan(prev => ({
      ...prev,
      [mealTime]: prev[mealTime].map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeMealItem = (mealTime: keyof MenuPlan, itemId: string) => {
    setMenuPlan(prev => ({
      ...prev,
      [mealTime]: prev[mealTime].filter(item => item.id !== itemId)
    }));
  };

  const calculateMealTotal = (items: MealItem[]) => {
    return items.reduce((sum, item) => sum + (item.calories || 0), 0);
  };

  const calculateTotalCalories = () => {
    return Object.values(menuPlan).reduce(
      (sum, items) => sum + calculateMealTotal(items),
      0
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <ChefHat className="h-6 w-6 text-green-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Menu Makanan</h3>
            <p className="text-sm text-gray-600">
              Target: {targetCalories} kkal/hari • Saat ini: {calculateTotalCalories()} kkal
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-end space-x-3">
          <button
            onClick={() => onSave(menuPlan)}
            disabled={Object.values(menuPlan).every(meals => meals.length === 0)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4 inline mr-2" />
            Simpan Menu
          </button>
        </div>


      </div>

      <div className="space-y-6">
        {mealTimes.map(({ key, label, percentage }) => {
          const targetMealCalories = Math.round(targetCalories * (percentage / 100));
          const currentMealCalories = calculateMealTotal(menuPlan[key]);
          const diff = currentMealCalories - targetMealCalories;

          return (
            <div key={key} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{label}</h4>
                  <p className="text-xs text-gray-600">
                    Target: {targetMealCalories} kkal ({percentage}%) • Saat ini: {currentMealCalories} kkal
                    {diff !== 0 && (
                      <span className={`ml-2 font-medium ${diff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ({diff > 0 ? '+' : ''}{diff} kkal)
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => addMealItem(key)}
                  className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-medium"
                >
                  <Plus className="h-4 w-4" />
                  <span>Tambah</span>
                </button>
              </div>

              {menuPlan[key].length > 0 ? (
                <div className="space-y-3">
                  {menuPlan[key].map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 gap-3 items-center bg-white border border-gray-200 shadow-sm rounded-lg p-3 hover:shadow-md transition"
                    >
                      {/* Nama makanan */}
                      <input
                        type="text"
                        placeholder="Nama makanan"
                        className="col-span-3 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800 focus:ring-2 focus:ring-green-400 focus:outline-none"
                        value={item.name}
                        onChange={(e) =>
                          updateMealItem(key, item.id, 'name', e.target.value)
                        }
                      />

                      {/* Porsi */}
                      <input
                        type="text"
                        placeholder="Porsi"
                        className="col-span-2 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800 focus:ring-2 focus:ring-green-400 focus:outline-none"
                        value={item.portion}
                        onChange={(e) =>
                          updateMealItem(key, item.id, 'portion', e.target.value)
                        }
                      />

                      {/* Kalori */}
                      <input
                        type="number"
                        placeholder="Kalori"
                        className="col-span-2 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800 focus:ring-2 focus:ring-green-400 focus:outline-none"
                        value={item.calories || ''}
                        onChange={(e) =>
                          updateMealItem(
                            key,
                            item.id,
                            'calories',
                            parseInt(e.target.value) || 0
                          )
                        }
                      />

                      {/* Karbo */}
                      <input
                        type="number"
                        placeholder="Karbo"
                        className="col-span-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800 focus:ring-2 focus:ring-green-400 focus:outline-none"
                        value={item.carbs || ''}
                        onChange={(e) =>
                          updateMealItem(
                            key,
                            item.id,
                            'carbs',
                            parseInt(e.target.value) || 0
                          )
                        }
                      />

                      {/* Protein */}
                      <input
                        type="number"
                        placeholder="Protein"
                        className="col-span-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800 focus:ring-2 focus:ring-green-400 focus:outline-none"
                        value={item.protein || ''}
                        onChange={(e) =>
                          updateMealItem(
                            key,
                            item.id,
                            'protein',
                            parseInt(e.target.value) || 0
                          )
                        }
                      />

                      {/* Lemak */}
                      <input
                        type="number"
                        placeholder="Lemak"
                        className="col-span-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800 focus:ring-2 focus:ring-green-400 focus:outline-none"
                        value={item.fat || ''}
                        onChange={(e) =>
                          updateMealItem(key, item.id, 'fat', parseInt(e.target.value) || 0)
                        }
                      />

                      {/* Hapus */}
                      <button
                        onClick={() => removeMealItem(key, item.id)}
                        className="col-span-1 flex justify-center items-center text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-md transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-3">Belum ada menu</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-600">Total Kalori</p>
            <p className="text-xl font-bold text-gray-900">{calculateTotalCalories()} kkal</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Target</p>
            <p className="text-xl font-bold text-gray-900">{targetCalories} kkal</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Selisih</p>
            <p className={`text-xl font-bold ${calculateTotalCalories() - targetCalories > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
              {calculateTotalCalories() - targetCalories > 0 ? '+' : ''}
              {calculateTotalCalories() - targetCalories} kkal
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Status</p>
            <p className={`text-sm font-bold ${Math.abs(calculateTotalCalories() - targetCalories) <= 50 ? 'text-green-600' :
              Math.abs(calculateTotalCalories() - targetCalories) <= 100 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
              {Math.abs(calculateTotalCalories() - targetCalories) <= 50 ? 'Sesuai Target' :
                Math.abs(calculateTotalCalories() - targetCalories) <= 100 ? 'Mendekati Target' :
                  'Perlu Penyesuaian'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuPlanningSection;
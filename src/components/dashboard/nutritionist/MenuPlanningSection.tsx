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

interface MealMenu {
  id: string;
  menuName: string;
  items: MealItem[];
}

interface MenuPlan {
  breakfast: MealMenu[];
  morningSnack: MealMenu[];
  lunch: MealMenu[];
  afternoonSnack: MealMenu[];
  dinner: MealMenu[];
}

interface MenuPlanningSectionProps {
  targetCalories: number;
  onSave: (menuPlan: any) => void;
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

  // Tambah menu baru per waktu makan
  const addMenu = (mealTime: keyof MenuPlan) => {
    const newMenu: MealMenu = {
      id: Date.now().toString(),
      menuName: `Menu ${menuPlan[mealTime].length + 1}`,
      items: []
    };

    setMenuPlan(prev => ({
      ...prev,
      [mealTime]: [...prev[mealTime], newMenu]
    }));
  };

  // Hapus menu
  const removeMenu = (mealTime: keyof MenuPlan, menuId: string) => {
    setMenuPlan(prev => ({
      ...prev,
      [mealTime]: prev[mealTime].filter(menu => menu.id !== menuId)
    }));
  };

  // Update nama menu
  const updateMenuName = (mealTime: keyof MenuPlan, menuId: string, newName: string) => {
    setMenuPlan(prev => ({
      ...prev,
      [mealTime]: prev[mealTime].map(menu =>
        menu.id === menuId ? { ...menu, menuName: newName } : menu
      )
    }));
  };

  // Tambah item makanan ke menu
  const addMealItem = (mealTime: keyof MenuPlan, menuId: string) => {
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
      [mealTime]: prev[mealTime].map(menu =>
        menu.id === menuId
          ? { ...menu, items: [...menu.items, newItem] }
          : menu
      )
    }));
  };

  // Update item makanan
  const updateMealItem = (
    mealTime: keyof MenuPlan,
    menuId: string,
    itemId: string,
    field: keyof MealItem,
    value: any
  ) => {
    setMenuPlan(prev => ({
      ...prev,
      [mealTime]: prev[mealTime].map(menu =>
        menu.id === menuId
          ? {
            ...menu,
            items: menu.items.map(item =>
              item.id === itemId ? { ...item, [field]: value } : item
            )
          }
          : menu
      )
    }));
  };

  // Hapus item makanan
  const removeMealItem = (mealTime: keyof MenuPlan, menuId: string, itemId: string) => {
    setMenuPlan(prev => ({
      ...prev,
      [mealTime]: prev[mealTime].map(menu =>
        menu.id === menuId
          ? { ...menu, items: menu.items.filter(item => item.id !== itemId) }
          : menu
      )
    }));
  };

  // Calculate total per menu
  const calculateMenuTotal = (menu: MealMenu) => {
    return {
      calories: menu.items.reduce((sum, item) => sum + (item.calories || 0), 0),
      carbs: menu.items.reduce((sum, item) => sum + (item.carbs || 0), 0),
      protein: menu.items.reduce((sum, item) => sum + (item.protein || 0), 0),
      fat: menu.items.reduce((sum, item) => sum + (item.fat || 0), 0)
    };
  };

  // Calculate total per waktu makan
  const calculateMealTimeTotal = (menus: MealMenu[]) => {
    return menus.reduce((sum, menu) => sum + calculateMenuTotal(menu).calories, 0);
  };

  const calculateTotalCalories = () => {
    return Object.values(menuPlan).reduce(
      (sum, menus) => sum + calculateMealTimeTotal(menus),
      0
    );
  };

  // Convert untuk save (flatten structure)
  const convertForSave = () => {
    const flattened: any = {};
    Object.entries(menuPlan).forEach(([mealTime, menus]) => {
      flattened[mealTime] = menus.flatMap(menu => menu.items);
    });
    return flattened;
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

        <button
          onClick={() => onSave(convertForSave())}
          disabled={Object.values(menuPlan).every(menus => menus.length === 0)}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>Simpan Menu</span>
        </button>
      </div>

      <div className="space-y-6">
        {mealTimes.map(({ key, label, percentage }) => {
          const targetMealCalories = Math.round(targetCalories * (percentage / 100));
          const currentMealCalories = calculateMealTimeTotal(menuPlan[key]);
          const diff = currentMealCalories - targetMealCalories;

          return (
            <div key={key} className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">{label}</h4>
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
                  onClick={() => addMenu(key)}
                  className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium shadow"
                >
                  <Plus className="h-4 w-4" />
                  <span>Tambah Menu</span>
                </button>
              </div>

              {menuPlan[key].length > 0 ? (
                <div className="space-y-4">
                  {menuPlan[key].map((menu) => {
                    const menuTotal = calculateMenuTotal(menu);
                    return (
                      <div key={menu.id} className="bg-white border-2 border-green-200 rounded-lg p-4">
                        {/* Header Menu */}
                        <div className="flex items-center justify-between mb-3">
                          <input
                            type="text"
                            className="text-base font-bold text-gray-900 border-b-2 border-transparent hover:border-green-500 focus:border-green-500 focus:outline-none px-2 py-1"
                            value={menu.menuName}
                            onChange={(e) => updateMenuName(key, menu.id, e.target.value)}
                            placeholder="Nama Menu"
                          />
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => addMealItem(key, menu.id)}
                              className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium"
                            >
                              <Plus className="h-3 w-3" />
                              <span>Tambah Makanan</span>
                            </button>
                            <button
                              onClick={() => removeMenu(key, menu.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Total Nutrisi Menu */}
                        <div className="grid grid-cols-4 gap-2 mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="text-center">
                            <span className="text-xs text-blue-600 block">Kalori</span>
                            <span className="font-bold text-sm text-gray-900">{menuTotal.calories} kkal</span>
                          </div>
                          <div className="text-center">
                            <span className="text-xs text-blue-600 block">Karbo</span>
                            <span className="font-bold text-sm text-gray-900">{menuTotal.carbs}g</span>
                          </div>
                          <div className="text-center">
                            <span className="text-xs text-blue-600 block">Protein</span>
                            <span className="font-bold text-sm text-gray-900">{menuTotal.protein}g</span>
                          </div>
                          <div className="text-center">
                            <span className="text-xs text-blue-600 block">Lemak</span>
                            <span className="font-bold text-sm text-gray-900">{menuTotal.fat}g</span>
                          </div>
                        </div>

                        {/* Daftar Makanan */}
                        {menu.items.length > 0 ? (
                          <div className="space-y-2">
                            {menu.items.map((item) => (
                              <div
                                key={item.id}
                                className="grid grid-cols-12 gap-2 items-center bg-gray-50 border border-gray-200 rounded-lg p-2"
                              >
                                <input
                                  type="text"
                                  placeholder="Nama makanan"
                                  className="col-span-3 px-2 py-1 border border-gray-300 rounded text-sm"
                                  value={item.name}
                                  onChange={(e) =>
                                    updateMealItem(key, menu.id, item.id, 'name', e.target.value)
                                  }
                                />
                                <input
                                  type="text"
                                  placeholder="Porsi"
                                  className="col-span-2 px-2 py-1 border border-gray-300 rounded text-sm"
                                  value={item.portion}
                                  onChange={(e) =>
                                    updateMealItem(key, menu.id, item.id, 'portion', e.target.value)
                                  }
                                />
                                <input
                                  type="number"
                                  placeholder="Kal"
                                  className="col-span-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                  value={item.calories || ''}
                                  onChange={(e) =>
                                    updateMealItem(
                                      key,
                                      menu.id,
                                      item.id,
                                      'calories',
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                />
                                <input
                                  type="number"
                                  placeholder="K"
                                  className="col-span-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                  value={item.carbs || ''}
                                  onChange={(e) =>
                                    updateMealItem(
                                      key,
                                      menu.id,
                                      item.id,
                                      'carbs',
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                />
                                <input
                                  type="number"
                                  placeholder="P"
                                  className="col-span-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                  value={item.protein || ''}
                                  onChange={(e) =>
                                    updateMealItem(
                                      key,
                                      menu.id,
                                      item.id,
                                      'protein',
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                />
                                <input
                                  type="number"
                                  placeholder="L"
                                  className="col-span-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                  value={item.fat || ''}
                                  onChange={(e) =>
                                    updateMealItem(key, menu.id, item.id, 'fat', parseInt(e.target.value) || 0)
                                  }
                                />
                                <button
                                  onClick={() => removeMealItem(key, menu.id, item.id)}
                                  className="col-span-1 flex justify-center items-center text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-3">Belum ada makanan. Klik "Tambah Makanan"</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Belum ada menu. Klik "Tambah Menu" untuk membuat menu baru
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Total */}
      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg">
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
            <p className={`text-xl font-bold ${calculateTotalCalories() - targetCalories > 0 ? 'text-red-600' : 'text-green-600'}`}>
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
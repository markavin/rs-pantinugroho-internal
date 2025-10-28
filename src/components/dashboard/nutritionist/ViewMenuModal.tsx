import React from 'react';
import { X, ChefHat, Clock } from 'lucide-react';

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

interface ViewMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  menuPlan: MenuPlan | null;
  targetCalories: number;
}

const ViewMenuModal: React.FC<ViewMenuModalProps> = ({
  isOpen,
  onClose,
  patientName,
  menuPlan,
  targetCalories
}) => {
  if (!isOpen || !menuPlan) return null;

  const mealTimes = [
    { key: 'breakfast' as keyof MenuPlan, label: 'Sarapan', time: '07:00' },
    { key: 'morningSnack' as keyof MenuPlan, label: 'Snack Pagi', time: '10:00'},
    { key: 'lunch' as keyof MenuPlan, label: 'Makan Siang', time: '12:00'},
    { key: 'afternoonSnack' as keyof MenuPlan, label: 'Snack Sore', time: '15:00'},
    { key: 'dinner' as keyof MenuPlan, label: 'Makan Malam', time: '18:00' }
  ];

  const calculateMealTotal = (items: MealItem[]) => {
    return items.reduce((sum, item) => sum + (item.calories || 0), 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ChefHat className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="text-lg font-bold text-gray-900">Menu Makanan Harian</h3>
                <p className="text-sm text-gray-600">{patientName} • Target: {targetCalories} kkal/hari</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {mealTimes.map(({ key, label, time }) => {
              const items = menuPlan[key];
              const totalCalories = calculateMealTotal(items);

              return (
                <div key={key} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {/* <span className="text-2xl">{icon}</span> */}
                      <div>
                        <h4 className="font-semibold text-gray-900">{label}</h4>
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <Clock className="h-3 w-3" />
                          <span>{time}</span>
                          <span>•</span>
                          <span className="font-medium text-green-600">{totalCalories} kkal</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {items.length > 0 ? (
                    <div className="space-y-2">
                      {items.map((item, idx) => (
                        <div key={idx} className="bg-gray-50 rounded p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <p className="text-xs text-gray-600">Porsi: {item.portion}</p>
                            </div>
                            <span className="font-bold text-green-600">{item.calories} kkal</span>
                          </div>
                          <div className="flex space-x-4 text-xs text-gray-600">
                            <span>K: {item.carbs}g</span>
                            <span>P: {item.protein}g</span>
                            <span>L: {item.fat}g</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-2">Belum ada menu</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewMenuModal;
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface DietComplianceCheckerProps {
  value: string;
  onChange: (value: string) => void;
}

const DietComplianceChecker: React.FC<DietComplianceCheckerProps> = ({ value, onChange }) => {
  const [checklist, setChecklist] = useState({
    finishedMeal: false,        // Menghabiskan porsi makan
    followSchedule: false,      // Mengikuti jadwal makan
    avoidSugar: false,         // Menghindari gula/makanan manis
    eatVegetables: false,      // Makan sayur sesuai anjuran
    drinkWater: false          // Minum air putih cukup
  });

  useEffect(() => {
    // Hitung persentase berdasarkan checklist
    const total = Object.keys(checklist).length;
    const checked = Object.values(checklist).filter(v => v).length;
    const percentage = Math.round((checked / total) * 100);
    onChange(percentage.toString());
  }, [checklist]);

  const handleCheck = (key: keyof typeof checklist) => {
    setChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const items = [
    { key: 'finishedMeal', label: 'Menghabiskan porsi makan yang disajikan' },
    { key: 'followSchedule', label: 'Mengikuti jadwal makan (3x makan utama + 2x snack)' },
    { key: 'avoidSugar', label: 'Menghindari makanan/minuman manis tambahan' },
    { key: 'eatVegetables', label: 'Makan sayur dan buah sesuai anjuran' },
    { key: 'drinkWater', label: 'Minum air putih minimal 8 gelas/hari' }
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">Observasi Kepatuhan Diet</label>
        <div className="bg-green-50 px-3 py-1 rounded-full">
          <span className="text-sm font-bold text-green-700">{value || 0}%</span>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => handleCheck(item.key as keyof typeof checklist)}
            className={`w-full flex items-start space-x-3 p-3 rounded-lg border-2 transition-all ${
              checklist[item.key as keyof typeof checklist]
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {checklist[item.key as keyof typeof checklist] ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
              )}
            </div>
            <span className={`text-sm text-left ${
              checklist[item.key as keyof typeof checklist]
                ? 'text-green-900 font-medium'
                : 'text-gray-700'
            }`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DietComplianceChecker;
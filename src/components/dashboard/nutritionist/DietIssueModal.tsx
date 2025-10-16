import React from 'react';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';

interface DietIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: any;
  onResolve: (alertId: string) => Promise<void>;
}

const DietIssueModal: React.FC<DietIssueModalProps> = ({
  isOpen,
  onClose,
  alert,
  onResolve
}) => {
  if (!isOpen || !alert) return null;

  const handleResolve = async () => {
    await onResolve(alert.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="px-6 py-4 border-b border-gray-200 bg-orange-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Masalah Diet dari Perawat</h3>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Pasien</label>
            <p className="text-base font-semibold text-gray-900 mt-1">
              {alert.patient?.name} ({alert.patient?.mrNumber})
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Waktu Laporan</label>
            <p className="text-base text-gray-900 mt-1">
              {new Date(alert.createdAt).toLocaleString('id-ID')}
            </p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <label className="text-sm font-medium text-orange-700 mb-2 block">Detail Masalah</label>
            <p className="text-base text-gray-900 whitespace-pre-wrap">{alert.message}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Saran:</strong> Evaluasi diet plan pasien dan buat rekomendasi penyesuaian jika diperlukan.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Tutup
          </button>
          <button
            onClick={handleResolve}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            
            <CheckCircle className="h-4 w-4" />
            <span>Tandai Sudah Ditangani</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DietIssueModal;
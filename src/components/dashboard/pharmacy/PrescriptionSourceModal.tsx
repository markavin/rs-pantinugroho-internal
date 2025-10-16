import React, { useState } from 'react';
import { FileText, User, AlertCircle, X } from 'lucide-react';

interface PrescriptionSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSource: (source: 'DOCTOR_PRESCRIPTION' | 'MANUAL') => void;
}

const PrescriptionSourceModal: React.FC<PrescriptionSourceModalProps> = ({
  isOpen,
  onClose,
  onSelectSource
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-green-50">
          <h3 className="text-lg font-semibold text-gray-900">Pilih Sumber Resep</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Pilih sumber resep untuk transaksi obat ini:
          </p>

          <button
            onClick={() => onSelectSource('DOCTOR_PRESCRIPTION')}
            className="w-full p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all group"
          >
            <div className="flex items-start space-x-3">
              <div className="bg-green-100 p-2 rounded-lg group-hover:bg-green-200">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-left flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Resep dari Dokter</h4>
                <p className="text-sm text-gray-600">
                  Transaksi berdasarkan resep dokter yang sudah ada di sistem
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onSelectSource('MANUAL')}
            className="w-full p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all group"
          >
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-left flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Input Manual</h4>
                <p className="text-sm text-gray-600">
                  Input obat secara manual (rujukan/non-resep dokter)
                </p>
              </div>
            </div>
          </button>

          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-yellow-800">
                Jika memilih "Resep dari Dokter", sistem akan menampilkan resep dokter yang belum diproses
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionSourceModal;
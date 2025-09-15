// src/components/dashboard/admin/PatientComplaintForm.tsx
import React, { useState } from 'react';
import { X, Save, AlertCircle, User } from 'lucide-react';

interface Patient {
  id: string;
  mrNumber: string;
  name: string;
  birthDate: Date;
  gender: 'MALE' | 'FEMALE';
  insuranceType: string;
}

interface PatientComplaintFormProps {
  patient: Patient;
  onClose: () => void;
  onComplaintAdded: () => void;
}

const PatientComplaintForm: React.FC<PatientComplaintFormProps> = ({
  patient,
  onClose,
  onComplaintAdded
}) => {
  const [loading, setLoading] = useState(false);
  const [complaintData, setComplaintData] = useState({
    complaint: '',
    severity: 'RINGAN' as 'RINGAN' | 'SEDANG' | 'BERAT',
    additionalNotes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/patient-complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: patient.id,
          complaint: complaintData.complaint.trim(),
          severity: complaintData.severity,
          notes: complaintData.additionalNotes.trim() || undefined,
          date: new Date()
        }),
      });

      if (response.ok) {
        onComplaintAdded();
        onClose();
        alert('Keluhan pasien berhasil ditambahkan!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Gagal menambahkan keluhan'}`);
      }
    } catch (error) {
      console.error('Error adding complaint:', error);
      alert('Terjadi kesalahan saat menambahkan keluhan');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'BERAT': return 'border-red-300 bg-red-50 text-red-800';
      case 'SEDANG': return 'border-orange-300 bg-orange-50 text-orange-800';
      case 'RINGAN': return 'border-green-300 bg-green-50 text-green-800';
      default: return 'border-gray-300 bg-gray-50 text-gray-800';
    }
  };

  const getSeverityDescription = (severity: string) => {
    switch (severity) {
      case 'BERAT': return 'Memerlukan perhatian segera, dapat mengganggu aktivitas sehari-hari secara signifikan';
      case 'SEDANG': return 'Memerlukan penanganan dalam waktu dekat, mengganggu aktivitas normal';
      case 'RINGAN': return 'Dapat ditangani pada kunjungan rutin, tidak terlalu mengganggu aktivitas';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <AlertCircle className="h-6 w-6 text-orange-600" />
            <span>Tambah Keluhan Pasien</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Patient Info */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                <p className="text-sm text-gray-600">
                  RM: {patient.mrNumber} | {calculateAge(patient.birthDate)} tahun | {patient.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}
                </p>
              </div>
            </div>
            <div className="text-sm text-blue-700">
              Penjamin: {patient.insuranceType}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Complaint Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keluhan Pasien <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Jelaskan keluhan pasien dengan detail..."
                rows={4}
                value={complaintData.complaint}
                onChange={(e) => setComplaintData({ ...complaintData, complaint: e.target.value })}
              />
              <p className="mt-1 text-xs text-gray-500">
                Contoh: Sakit kepala sejak 3 hari, mual setelah makan, penglihatan kabur, dll.
              </p>
            </div>

            {/* Severity Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tingkat Keparahan <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 gap-3">
                {(['RINGAN', 'SEDANG', 'BERAT'] as const).map((severity) => (
                  <label
                    key={severity}
                    className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      complaintData.severity === severity 
                        ? getSeverityColor(severity) 
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="severity"
                      value={severity}
                      checked={complaintData.severity === severity}
                      onChange={(e) => setComplaintData({ ...complaintData, severity: e.target.value as any })}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {severity}
                        </span>
                        {complaintData.severity === severity && (
                          <div className="w-4 h-4 bg-current rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                      <p className="text-xs mt-1 opacity-80">
                        {getSeverityDescription(severity)}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catatan Tambahan
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Catatan tambahan, riwayat keluhan serupa, atau informasi lain yang relevan..."
                rows={3}
                value={complaintData.additionalNotes}
                onChange={(e) => setComplaintData({ ...complaintData, additionalNotes: e.target.value })}
              />
            </div>

            {/* Important Notes */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <h4 className="font-medium text-yellow-800 mb-1">Catatan Penting:</h4>
                  <ul className="text-yellow-700 space-y-1 list-disc list-inside">
                    <li>Pastikan keluhan dicatat dengan akurat dan lengkap</li>
                    <li>Untuk keluhan BERAT, segera koordinasikan dengan perawat atau dokter</li>
                    <li>Keluhan ini akan menjadi bagian dari rekam medis pasien</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-500">
              * Field wajib diisi
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading || !complaintData.complaint.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Menyimpan...' : 'Simpan Keluhan'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PatientComplaintForm;
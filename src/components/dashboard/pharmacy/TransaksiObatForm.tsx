// src/components/dashboard/pharmacy/TransaksiObatForm.tsx

import React, { useState, useEffect } from 'react';
import { XCircle, Plus, Trash2, ShoppingCart, User, Package } from 'lucide-react';

interface DrugData {
  id: string;
  name: string;
  category: string;
  dosageForm: string;
  strength: string;
  manufacturer: string;
  stock: number;
  expiryDate: string;
}

interface Patient {
  id: string;
  name: string;
  mrNumber: string;
  phone?: string;
}

interface TransactionItem {
  drugId: string;
  drugName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Transaction {
  id: string;
  patientId: string;
  patientName: string;
  mrNumber: string;
  items: TransactionItem[];
  totalAmount: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

interface TransaksiObatFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  patients: Patient[];
  drugs: DrugData[];
  editingTransaction?: Transaction | null;
}

const TransaksiObatForm: React.FC<TransaksiObatFormProps> = ({
  isOpen,
  onClose,
  onSave,
  patients,
  drugs,
  editingTransaction
}) => {
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        setSelectedPatient(editingTransaction.patientId);
        setItems(editingTransaction.items);
        setNotes(editingTransaction.notes || '');
      } else {
        setSelectedPatient('');
        setItems([]);
        setNotes('');
      }
      setErrors({});
    }
  }, [isOpen, editingTransaction]);

  const addItem = () => {
    setItems([...items, {
      drugId: '',
      drugName: '',
      quantity: 1,
      price: 5000,
      subtotal: 5000
    }]);
  };

  const updateItem = (index: number, field: keyof TransactionItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'drugId') {
      const drug = drugs.find(d => d.id === value);
      if (drug) {
        newItems[index].drugName = drug.name;
        newItems[index].price = 5000; // Default price - you can modify this
      }
    }
    
    if (field === 'quantity' || field === 'price') {
      newItems[index].subtotal = newItems[index].quantity * newItems[index].price;
    }
    
    setItems(newItems);

    // Clear field-specific errors
    if (errors[`drug_${index}`] || errors[`quantity_${index}`] || errors[`stock_${index}`]) {
      const newErrors = { ...errors };
      delete newErrors[`drug_${index}`];
      delete newErrors[`quantity_${index}`];
      delete newErrors[`stock_${index}`];
      setErrors(newErrors);
    }
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);

    // Clean up errors for removed item
    const newErrors = { ...errors };
    delete newErrors[`drug_${index}`];
    delete newErrors[`quantity_${index}`];
    delete newErrors[`stock_${index}`];
    setErrors(newErrors);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedPatient) {
      newErrors.patient = 'Pasien harus dipilih';
    }

    if (items.length === 0) {
      newErrors.items = 'Minimal harus ada 1 item obat';
    }

    items.forEach((item, index) => {
      if (!item.drugId) {
        newErrors[`drug_${index}`] = 'Obat harus dipilih';
      }
      if (item.quantity <= 0) {
        newErrors[`quantity_${index}`] = 'Jumlah harus lebih dari 0';
      }
      if (item.price <= 0) {
        newErrors[`price_${index}`] = 'Harga harus lebih dari 0';
      }
      
      const drug = drugs.find(d => d.id === item.drugId);
      if (drug && item.quantity > drug.stock) {
        newErrors[`stock_${index}`] = `Stok tidak mencukupi (tersedia: ${drug.stock})`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const patient = patients.find(p => p.id === selectedPatient);
      if (!patient) return;

      await onSave({
        patientId: selectedPatient,
        patientName: patient.name,
        mrNumber: patient.mrNumber,
        items: items.map(item => ({
          drugId: item.drugId,
          drugName: item.drugName,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal
        })),
        totalAmount,
        status: 'PENDING',
        notes
      });

      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const selectedPatientData = patients.find(p => p.id === selectedPatient);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold text-gray-900">
            {editingTransaction ? 'Edit Transaksi Obat' : 'Transaksi Obat Baru'}
          </h3>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 p-1"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="space-y-6">
            {/* Patient Selection */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <User className="h-5 w-5 text-blue-600 mr-2" />
                <h4 className="font-medium text-blue-900">Informasi Pasien</h4>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pilih Pasien <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      errors.patient ? 'border-red-300' : 'border-gray-300'
                    }`}
                    value={selectedPatient}
                    onChange={(e) => {
                      setSelectedPatient(e.target.value);
                      if (errors.patient) {
                        const newErrors = { ...errors };
                        delete newErrors.patient;
                        setErrors(newErrors);
                      }
                    }}
                    disabled={isSubmitting}
                  >
                    <option value="">-- Pilih Pasien --</option>
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name} - {patient.mrNumber}
                      </option>
                    ))}
                  </select>
                  {errors.patient && <p className="mt-1 text-sm text-red-600">{errors.patient}</p>}
                </div>

                {selectedPatientData && (
                  <div className="bg-white rounded-lg p-3 border">
                    <h5 className="font-medium text-gray-900 mb-2">Detail Pasien</h5>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-600">Nama:</span> <span className="font-medium">{selectedPatientData.name}</span></p>
                      <p><span className="text-gray-600">No. RM:</span> <span className="font-medium">{selectedPatientData.mrNumber}</span></p>
                      {selectedPatientData.phone && (
                        <p><span className="text-gray-600">Telepon:</span> <span className="font-medium">{selectedPatientData.phone}</span></p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Items Section */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-green-600 mr-2" />
                  <h4 className="font-medium text-green-900">Daftar Obat</h4>
                  <span className="text-red-500 ml-1">*</span>
                </div>
                <button
                  type="button"
                  onClick={addItem}
                  disabled={isSubmitting}
                  className="bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2 text-sm disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  <span>Tambah Obat</span>
                </button>
              </div>

              {errors.items && <p className="text-sm text-red-600 mb-4">{errors.items}</p>}

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-medium text-gray-900">Item {index + 1}</h5>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        disabled={isSubmitting}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50 p-1"
                        title="Hapus item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Drug Selection */}
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nama Obat
                        </label>
                        <select
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm ${
                            errors[`drug_${index}`] ? 'border-red-300' : 'border-gray-300'
                          }`}
                          value={item.drugId}
                          onChange={(e) => updateItem(index, 'drugId', e.target.value)}
                          disabled={isSubmitting}
                        >
                          <option value="">-- Pilih Obat --</option>
                          {drugs.filter(drug => drug.stock > 0).map(drug => (
                            <option key={drug.id} value={drug.id}>
                              {drug.name} - {drug.strength} (Stok: {drug.stock})
                            </option>
                          ))}
                        </select>
                        {errors[`drug_${index}`] && <p className="mt-1 text-xs text-red-600">{errors[`drug_${index}`]}</p>}
                      </div>

                      {/* Quantity */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Jumlah
                        </label>
                        <input
                          type="number"
                          min="1"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm ${
                            errors[`quantity_${index}`] || errors[`stock_${index}`] ? 'border-red-300' : 'border-gray-300'
                          }`}
                          value={item.quantity || ''}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                          disabled={isSubmitting}
                        />
                        {errors[`quantity_${index}`] && <p className="mt-1 text-xs text-red-600">{errors[`quantity_${index}`]}</p>}
                        {errors[`stock_${index}`] && <p className="mt-1 text-xs text-red-600">{errors[`stock_${index}`]}</p>}
                      </div>

                      {/* Price */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Harga Satuan (Rp)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="100"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm ${
                            errors[`price_${index}`] ? 'border-red-300' : 'border-gray-300'
                          }`}
                          value={item.price || ''}
                          onChange={(e) => updateItem(index, 'price', parseInt(e.target.value) || 0)}
                          disabled={isSubmitting}
                        />
                        {errors[`price_${index}`] && <p className="mt-1 text-xs text-red-600">{errors[`price_${index}`]}</p>}
                      </div>
                    </div>

                    {/* Selected Drug Info */}
                    {item.drugId && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        {(() => {
                          const selectedDrug = drugs.find(d => d.id === item.drugId);
                          return selectedDrug ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                              <div>
                                <span className="text-gray-600">Kategori:</span>
                                <p className="font-medium text-gray-900">{selectedDrug.category}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Produsen:</span>
                                <p className="font-medium text-gray-900">{selectedDrug.manufacturer}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Stok Tersedia:</span>
                                <p className={`font-medium ${selectedDrug.stock < 50 ? 'text-red-600' : 'text-green-600'}`}>
                                  {selectedDrug.stock} unit
                                </p>
                              </div>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    )}

                    {/* Subtotal */}
                    <div className="mt-3 text-right">
                      <p className="text-sm text-gray-600">
                        Subtotal: <span className="font-semibold text-gray-900">Rp {item.subtotal.toLocaleString('id-ID')}</span>
                      </p>
                    </div>
                  </div>
                ))}

                {items.length === 0 && (
                  <div className="text-center py-8 px-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-4">Belum ada obat yang dipilih</p>
                    <button
                      type="button"
                      onClick={addItem}
                      disabled={isSubmitting}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors inline-flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Tambah Obat Pertama</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catatan Transaksi
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Tambahkan catatan atau instruksi khusus untuk transaksi ini..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isSubmitting}
              />
              <p className="mt-1 text-xs text-gray-500">Opsional - catatan ini akan tersimpan dalam riwayat transaksi</p>
            </div>

            {/* Summary */}
            {items.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-4">Ringkasan Transaksi</h4>
                <div className="space-y-2 text-sm">
                  {selectedPatientData && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pasien:</span>
                      <span className="font-medium text-gray-900">{selectedPatientData.name} ({selectedPatientData.mrNumber})</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Item:</span>
                    <span className="font-medium text-gray-900">{items.length} jenis obat</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Quantity:</span>
                    <span className="font-medium text-gray-900">{items.reduce((sum, item) => sum + item.quantity, 0)} unit</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total Pembayaran:</span>
                      <span className="text-xl font-bold text-emerald-600">
                        Rp {totalAmount.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-end border-t border-gray-200 pt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || items.length === 0 || !selectedPatient}
              className="w-full sm:w-auto bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 font-medium"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  <span>{editingTransaction ? 'Update Transaksi' : 'Buat Transaksi'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransaksiObatForm;
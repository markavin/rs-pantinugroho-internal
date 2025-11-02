// src/components/dashboard/pharmacy/TransaksiObatForm.tsx

import React, { useState, useEffect } from 'react';
import { XCircle, Plus, Trash2, ShoppingCart, User, Package, ChevronDown, FileText, Calendar, Pill, AlertCircle, Info } from 'lucide-react';

interface DrugData {
  id: string;
  name: string;
  category: string;
  categoryKehamilan: string;
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

interface DrugTransactionItem {
  id?: string;
  drugId: string;
  drugName: string;
  quantity: number;
}

interface DrugTransaction {
  id: string;
  patientId: string;
  patientName: string;
  mrNumber: string;
  items: DrugTransactionItem[];
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

interface TransaksiObatFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<DrugTransaction, 'id' | 'createdAt'>) => void;
  patients: Patient[];
  drugs: DrugData[];
  editingTransaction?: DrugTransaction | null;
  viewMode?: 'create' | 'edit' | 'detail';
  prescriptionSource?: 'DOCTOR_PRESCRIPTION' | 'MANUAL';
  relatedHandledPatientId?: string;
}

interface PrescriptionAlert {
  id: string;
  message: string;
  patientId: string;
  createdAt: string;
}

const TransaksiObatForm: React.FC<TransaksiObatFormProps> = ({
  isOpen,
  onClose,
  onSave,
  patients,
  drugs,
  editingTransaction,
  viewMode = 'create',
  prescriptionSource,
  relatedHandledPatientId
}) => {
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [items, setItems] = useState<DrugTransactionItem[]>([]);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDetailMode = viewMode === 'detail';
  const isEditMode = viewMode === 'edit';
  const isCreateMode = viewMode === 'create';
  const [prescriptionAlerts, setPrescriptionAlerts] = useState<PrescriptionAlert[]>([]);
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionAlert | null>(null);
  const [showPrescriptionInfo, setShowPrescriptionInfo] = useState(false);

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
    }]);
  };

  const updateItem = (index: number, field: keyof DrugTransactionItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'drugId') {
      const drug = drugs.find(d => d.id === value);
      if (drug) {
        newItems[index].drugName = drug.name;
      }
    }

    setItems(newItems);

    const newErrors = { ...errors };
    delete newErrors[`drug_${index}`];
    delete newErrors[`quantity_${index}`];
    delete newErrors[`stock_${index}`];
    setErrors(newErrors);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);

    const newErrors = { ...errors };
    delete newErrors[`drug_${index}`];
    delete newErrors[`quantity_${index}`];
    delete newErrors[`stock_${index}`];
    setErrors(newErrors);
  };

  useEffect(() => {
    if (selectedPatient) {
      if (prescriptionSource === 'DOCTOR_PRESCRIPTION') {
        fetchPrescriptionAlerts(selectedPatient);
      } else if (prescriptionSource === 'MANUAL') {
        fetchNurseRequestAlerts(selectedPatient);
      }
    }
  }, [selectedPatient, prescriptionSource]);

  const fetchNurseRequestAlerts = async (patientId: string) => {
    try {
      const response = await fetch(
        `/api/alerts?patientId=${patientId}&category=MEDICATION&targetRole=FARMASI&unreadOnly=true`
      );
      if (response.ok) {
        const alerts = await response.json();
        const nurseRequests = alerts.filter((a: any) =>
          a.message.includes('memerlukan obat tambahan')
        );

        if (nurseRequests.length > 0) {
          setSelectedPrescription(nurseRequests[0]);
          setShowPrescriptionInfo(true);
          parseAndFillPrescription(nurseRequests[0].message);
        }
      }
    } catch (error) {
      console.error('Error fetching nurse request alerts:', error);
    }
  };

  const fetchPrescriptionAlerts = async (patientId: string) => {
    try {
      const response = await fetch(`/api/alerts?patientId=${patientId}&category=MEDICATION`);
      if (response.ok) {
        const alerts = await response.json();
        const unprocessedAlerts = alerts.filter((a: any) => !a.isRead);
        setPrescriptionAlerts(unprocessedAlerts);

        if (unprocessedAlerts.length > 0) {
          setSelectedPrescription(unprocessedAlerts[0]);
          setShowPrescriptionInfo(true);
          parseAndFillPrescription(unprocessedAlerts[0].message);
        }
      }
    } catch (error) {
      console.error('Error fetching prescription alerts:', error);
    }
  };

  const parseAndFillPrescription = (prescriptionMessage: string) => {
    const resepMatch = prescriptionMessage.match(/Resep:\s*([\s\S]+?)(?:\n\n|$)/);
    if (!resepMatch) return;

    const resepText = resepMatch[1];
    setNotes(resepText);

    const medications = resepText.split(',').map(med => med.trim());
    console.log('Parsed medications:', medications);
  }

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

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

      const drug = drugs.find(d => d.id === item.drugId);
      if (drug) {
        let availableStock = drug.stock;
        if (isEditMode && editingTransaction) {
          const oldItem = editingTransaction.items.find(i => i.drugId === item.drugId);
          if (oldItem) {
            availableStock += oldItem.quantity;
          }
        }

        if (item.quantity > availableStock) {
          newErrors[`stock_${index}`] = `Stok tidak mencukupi (tersedia: ${availableStock})`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isDetailMode) {
      onClose();
      return;
    }

    if (!isEditMode && !prescriptionSource) {
      alert('Sumber resep harus ditentukan');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const patient = patients.find(p => p.id === selectedPatient);
      if (!patient) return;

      const transactionData = {
        patientId: selectedPatient,
        patientName: patient.name,
        mrNumber: patient.mrNumber,
        items: items.map(item => ({
          drugId: item.drugId,
          drugName: item.drugName,
          quantity: item.quantity
        })),
        status: 'COMPLETED' as const,
        notes: notes.trim() || undefined,
        prescriptionSource,
        relatedPrescriptionAlertId: selectedPrescription?.id
      };

      await onSave(transactionData);

      if (selectedPrescription && prescriptionSource === 'MANUAL') {
        try {
          await fetch(`/api/alerts/${selectedPrescription.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isRead: true })
          });

          const medicationList = items
            .map(item => `- ${item.drugName}: ${item.quantity} unit`)
            .join('\n');

          await fetch('/api/alerts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'INFO',
              message: `Obat tambahan yang diminta untuk pasien ${patient.name} (${patient.mrNumber}) sudah siap dan dapat diambil di farmasi.\n\nDaftar Obat:\n${medicationList}\n\nTotal: ${items.length} jenis obat, ${totalQuantity} unit\n\nSilakan ambil dan berikan kepada pasien sesuai kebutuhan.`,
              patientId: selectedPatient,
              category: 'MEDICATION',
              priority: 'HIGH',
              targetRole: 'PERAWAT_RUANGAN'
            })
          });
        } catch (err) {
          console.error('Error processing nurse request notification:', err);
        }
      }
      else if (selectedPrescription && prescriptionSource === 'DOCTOR_PRESCRIPTION') {
        try {
          await fetch(`/api/alerts/${selectedPrescription.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isRead: true })
          });
        } catch (err) {
          console.error('Error marking prescription as processed:', err);
        }
      }

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">COMPLETED</span>;
      case 'CANCELLED':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">CANCELLED</span>;
      default:
        return <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">PENDING</span>;
    }
  };

  const getTitle = () => {
    if (isDetailMode) return 'Detail Transaksi Obat';
    if (isEditMode) return 'Edit Transaksi Obat';
    return 'Transaksi Obat Baru';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[95vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-green-50">
          <div className="flex items-center space-x-3">
            <ShoppingCart className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{getTitle()}</h3>
              {editingTransaction && (
                <p className="text-sm text-gray-500">ID: #{editingTransaction.id.slice(-8)}</p>
              )}
            </div>
          </div>
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
            <div className="border border-gray-300 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <User className="h-5 w-5 text-green-600 mr-2" />
                <h4 className="font-medium text-gray-900">Informasi Pasien</h4>
                {!isDetailMode && <span className="text-red-500 ml-1">*</span>}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  {!isDetailMode ? (
                    <>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pilih Pasien
                      </label>
                      <div className="relative">
                        <select
                          className={`w-full px-4 py-3 pr-10 text-base border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none text-gray-900 font-medium ${errors.patient ? 'border-red-300' : 'border-gray-300'
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
                          disabled={isSubmitting || isEditMode}
                        >
                          <option value="">-- Pilih Pasien --</option>
                          {patients.map(patient => (
                            <option key={patient.id} value={patient.id}>
                              {patient.name} - {patient.mrNumber}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-gray-700 pointer-events-none" />
                      </div>
                      {errors.patient && <p className="mt-1 text-sm text-red-600">{errors.patient}</p>}
                    </>
                  ) : (
                    <div className="bg-white rounded-lg p-3 border">
                      <h5 className="font-medium text-gray-900 mb-2">Pasien</h5>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-gray-600">Nama   :</span> <span className="font-semibold text-gray-900">{selectedPatientData?.name}</span></p>
                        <p><span className="text-gray-600">No. RM :</span> <span className="font-semibold text-gray-900">{selectedPatientData?.mrNumber}</span></p>
                        {selectedPatientData?.phone && (
                          <p><span className="text-gray-600">Telepon:</span> <span className="font-semibold text-gray-900">{selectedPatientData.phone}</span></p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {selectedPatientData && !isDetailMode && (
                  <div className="bg-white rounded-lg p-3 border shadow-sm">
                    <h5 className="font-medium text-gray-900 mb-2">Detail Pasien</h5>
                    <table className="text-sm">
                      <tbody className="align-top">
                        <tr>
                          <td className="text-gray-600 pr-4">Nama</td>
                          <td className="px-1">:</td>
                          <td className="font-semibold text-gray-900">{selectedPatientData.name}</td>
                        </tr>
                        <tr>
                          <td className="text-gray-600 pr-4">No. RM</td>
                          <td className="px-1">:</td>
                          <td className="font-semibold text-gray-900">{selectedPatientData.mrNumber}</td>
                        </tr>
                        {selectedPatientData.phone && (
                          <tr>
                            <td className="text-gray-600 pr-4">Telepon</td>
                            <td className="px-1">:</td>
                            <td className="font-semibold text-gray-900">{selectedPatientData.phone}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {isDetailMode && editingTransaction && (
                  <div className="bg-white rounded-lg p-3 border">
                    <h5 className="font-medium text-gray-900 mb-2">Status & Waktu</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Status:</span>
                        {getStatusBadge(editingTransaction.status)}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-gray-600">Dibuat: <span className="font-semibold text-gray-900">{new Date(editingTransaction.createdAt).toLocaleString('id-ID')}</span></p>
                          {editingTransaction.completedAt && (
                            <p className="text-gray-600">Selesai: <span className="font-semibold text-green-600">{new Date(editingTransaction.completedAt).toLocaleString('id-ID')}</span></p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {prescriptionSource === 'DOCTOR_PRESCRIPTION' && selectedPatient && (
              <div className="bg-white border border-gray-300 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-green-600" />
                    Resep dari Dokter
                  </h4>
                  {prescriptionAlerts.length > 0 && (
                    <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                      {prescriptionAlerts.length} resep tersedia
                    </span>
                  )}
                </div>

                <div>
                  {prescriptionAlerts.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                      <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Tidak ada resep dokter untuk pasien ini
                      </p>
                      <p className="text-xs text-gray-500">
                        Silakan gunakan mode "Input Manual"
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {prescriptionAlerts.length > 1 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pilih Resep:
                          </label>
                          <div className="relative">
                            <select
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none pr-10"
                              value={selectedPrescription?.id || ''}
                              onChange={(e) => {
                                const alert = prescriptionAlerts.find(a => a.id === e.target.value);
                                setSelectedPrescription(alert || null);
                                if (alert) parseAndFillPrescription(alert.message);
                              }}
                            >
                              {prescriptionAlerts.map((alert, index) => (
                                <option key={alert.id} value={alert.id}>
                                  Resep #{index + 1} - {new Date(alert.createdAt).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                          </div>
                        </div>
                      )}

                      {selectedPrescription && (
                        <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center text-xs text-gray-600">
                              <Calendar className="h-4 w-4 mr-1.5" />
                              <span className="font-medium">
                                {new Date(selectedPrescription.createdAt).toLocaleDateString('id-ID', {
                                  weekday: 'long',
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowPrescriptionInfo(!showPrescriptionInfo)}
                              className="text-xs text-green-600 hover:text-green-800 font-medium flex items-center"
                            >
                              {showPrescriptionInfo ? (
                                <>
                                  <ChevronDown className="h-4 w-4 mr-1" />
                                  Sembunyikan
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4 mr-1 transform rotate-180" />
                                  Tampilkan Detail
                                </>
                              )}
                            </button>
                          </div>

                          {showPrescriptionInfo && (
                            <div className="mb-3">
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                  {selectedPrescription.message}
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                            <div className="flex items-start">
                              <Info className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-blue-800 leading-relaxed">
                                Resep ini akan otomatis ditandai sebagai <span className="font-semibold">"sudah diproses"</span> setelah transaksi berhasil dibuat
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {prescriptionSource === 'MANUAL' && selectedPatient && selectedPrescription && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium text-yellow-900 mb-2">Request Obat dari Perawat</h4>
                    <div className="bg-white rounded-lg p-3 border border-yellow-200 mb-3">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {selectedPrescription.message}
                      </p>
                    </div>
                    <p className="text-xs text-yellow-800">
                      Setelah transaksi selesai, notifikasi akan otomatis dikirim ke perawat bahwa obat sudah siap diambil
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Pill className="h-5 w-5 text-green-600 mr-2" />
                  <h4 className="font-medium text-gray-900">Daftar Obat</h4>
                  {!isDetailMode && <span className="text-red-500 ml-1">*</span>}
                </div>
                {!isDetailMode && (
                  <button
                    type="button"
                    onClick={addItem}
                    disabled={isSubmitting}
                    className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 text-sm disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Tambah Obat</span>
                  </button>
                )}
              </div>

              {errors.items && <p className="text-sm text-red-600 mb-4">{errors.items}</p>}

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-medium text-gray-900">Item {index + 1}</h5>
                      {!isDetailMode && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          disabled={isSubmitting}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50 p-1"
                          title="Hapus item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {isDetailMode ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Obat</label>
                          <p className="text-base font-semibold text-gray-900">{item.drugName}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
                          <p className="text-base font-semibold text-gray-900">{item.quantity} unit</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Obat</label>
                          <select
                            className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-medium text-gray-900 ${errors[`drug_${index}`] ? 'border-red-300' : 'border-gray-300'
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

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
                          <input
                            type="number"
                            min="0"
                            className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-medium text-gray-900 ${errors[`quantity_${index}`] || errors[`stock_${index}`] ? 'border-red-300' : 'border-gray-300'
                              }`}
                            value={item.quantity === 0 ? '' : item.quantity}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateItem(index, 'quantity', val === '' ? 0 : parseInt(val));
                            }}
                            disabled={isSubmitting}
                          />
                          {errors[`quantity_${index}`] && <p className="mt-1 text-xs text-red-600">{errors[`quantity_${index}`]}</p>}
                          {errors[`stock_${index}`] && <p className="mt-1 text-xs text-red-600">{errors[`stock_${index}`]}</p>}
                        </div>
                      </div>
                    )}

                    {item.drugId && !isDetailMode && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        {(() => {
                          const selectedDrug = drugs.find(d => d.id === item.drugId);
                          return selectedDrug ? (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                              <div>
                                <span className="text-gray-600">Kategori - Kehamilan:</span>
                                <p className="font-semibold text-gray-900">{selectedDrug.category} - {selectedDrug.categoryKehamilan}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Bentuk:</span>
                                <p className="font-semibold text-gray-900">{selectedDrug.dosageForm}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Produsen:</span>
                                <p className="font-semibold text-gray-900">{selectedDrug.manufacturer}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Stok Tersedia:</span>
                                <p className={`font-semibold ${selectedDrug.stock < 50 ? 'text-red-600' : 'text-green-600'}`}>
                                  {selectedDrug.stock} unit
                                </p>
                              </div>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </div>
                ))}

                {items.length === 0 && !isDetailMode && (
                  <div className="text-center py-8 px-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-4">Belum ada obat yang dipilih</p>
                    <button
                      type="button"
                      onClick={addItem}
                      disabled={isSubmitting}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Tambah Obat Pertama</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-base font-medium text-gray-800 mb-2">
                <FileText className="w-5 h-5 text-green-600" />
                Catatan Resep / Transaksi
              </label>
              {isDetailMode ? (
                <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-base text-gray-900 min-h-[80px] font-medium">
                  {notes || '-'}
                </div>
              ) : (
                <>
                  <textarea
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-gray-900"
                    rows={3}
                    placeholder="Catatan resep dokter atau instruksi khusus..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Opsional - misalnya resep manual dokter atau instruksi khusus
                  </p>
                </>
              )}
            </div>

            <div className="bg-white border border-green-400 rounded-xl p-5 shadow-md">
              <h4 className="font-semibold text-green-900 mb-4 flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2 text-green-600" />
                Ringkasan Transaksi
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Pasien</span>
                  <span className="font-semibold text-gray-900 text-base text-right">
                    {selectedPatientData
                      ? `${selectedPatientData.name} (${selectedPatientData.mrNumber})`
                      : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Jenis Obat</span>
                  <span className="font-semibold text-gray-900 text-base">
                    {items.length} jenis
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Quantity</span>
                  <span className="font-semibold text-gray-900 text-base">
                    {totalQuantity} unit
                  </span>
                </div>
                {isDetailMode && editingTransaction && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    {getStatusBadge(editingTransaction.status)}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-end border-t border-gray-200 pt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 font-medium"
            >
              {isDetailMode ? 'Tutup' : 'Batal'}
            </button>
            {!isDetailMode && (
              <button
                type="submit"
                disabled={isSubmitting || items.length === 0 || !selectedPatient}
                className="w-full sm:w-auto bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 font-medium"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    <span>{isEditMode ? 'Update Transaksi' : 'Tambah Transaksi'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransaksiObatForm;
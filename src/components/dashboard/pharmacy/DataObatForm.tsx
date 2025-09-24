// src/components/dashboard/pharmacy/DataObatForm.tsx

import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

// Interface untuk DrugData
export interface DrugData {
    id: string;
    name: string;
    category: string;
    dosageForm: string;
    strength: string;
    manufacturer: string;
    stock: number;
    expiryDate: string;
    interactions: string[];
    contraindications: string[];
    sideEffects: string[];
    indications: string[];
}

interface DataObatFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (drugData: Omit<DrugData, 'id'> | DrugData) => void;
    editingDrug?: DrugData | null;
    title?: string;
}

const DataObatForm: React.FC<DataObatFormProps> = ({
    isOpen,
    onClose,
    onSave,
    editingDrug,
    title
}) => {
    const [formData, setFormData] = useState<Partial<DrugData>>({
        name: '',
        category: '',
        dosageForm: '',
        strength: '',
        manufacturer: '',
        stock: 0,
        expiryDate: '',
        interactions: [],
        contraindications: [],
        sideEffects: [],
        indications: []
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Categories untuk dropdown
    const categories = [
        'Antidiabetes',
        'Antihipertensi',
        'Analgesik',
        'Antibiotik',
        'Antiinflamasi',
        'Kardiovaskular',
        'Neurologi',
        'Gastroenterologi',
        'Respiratori',
        'Endokrin',
        'Lain-lain'
    ];

    // Dosage forms untuk dropdown
    const dosageForms = [
        'Tablet',
        'Kapsul',
        'Sirup',
        'Injeksi',
        'Infus',
        'Topikal',
        'Tetes',
        'Spray',
        'Suppositoria',
        'Patch'
    ];

    // Reset form ketika modal dibuka/tutup
    useEffect(() => {
        if (isOpen) {
            if (editingDrug) {
                setFormData({
                    ...editingDrug,
                    expiryDate: editingDrug.expiryDate ?
                        new Date(editingDrug.expiryDate).toISOString().split('T')[0] :
                        ''
                });
            } else {
                setFormData({
                    name: '',
                    category: '',
                    dosageForm: '',
                    strength: '',
                    manufacturer: '',
                    stock: 0,
                    expiryDate: '',
                    interactions: [],
                    contraindications: [],
                    sideEffects: [],
                    indications: []
                });
            }
            setErrors({});
        }
    }, [isOpen, editingDrug]);

    // Handle input changes
    const handleInputChange = (field: keyof DrugData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    // Handle array field changes (interactions, contraindications, etc.)
    const handleArrayFieldChange = (field: 'interactions' | 'contraindications' | 'sideEffects' | 'indications', value: string) => {
        const arrayValue = value.split(',').map(item => item.trim()).filter(item => item !== '');
        handleInputChange(field, arrayValue);
    };

    // Validation
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name?.trim()) {
            newErrors.name = 'Nama obat wajib diisi';
        }

        if (!formData.category?.trim()) {
            newErrors.category = 'Kategori obat wajib dipilih';
        }

        if (!formData.dosageForm?.trim()) {
            newErrors.dosageForm = 'Bentuk sediaan wajib diisi';
        }

        if (!formData.strength?.trim()) {
            newErrors.strength = 'Kekuatan obat wajib diisi';
        }

        if (!formData.manufacturer?.trim()) {
            newErrors.manufacturer = 'Nama produsen wajib diisi';
        }

        if (!formData.stock || formData.stock < 0) {
            newErrors.stock = 'Jumlah stok harus lebih dari atau sama dengan 0';
        }

        if (!formData.expiryDate?.trim()) {
            newErrors.expiryDate = 'Tanggal kedaluwarsa wajib diisi';
        } else {
            const expiryDate = new Date(formData.expiryDate);
            const today = new Date();
            if (expiryDate <= today) {
                newErrors.expiryDate = 'Tanggal kedaluwarsa harus lebih dari hari ini';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const drugData = {
                ...formData,
                name: formData.name!,
                category: formData.category!,
                dosageForm: formData.dosageForm!,
                strength: formData.strength!,
                manufacturer: formData.manufacturer!,
                stock: formData.stock || 0,
                expiryDate: formData.expiryDate!,
                interactions: formData.interactions || [],
                contraindications: formData.contraindications || [],
                sideEffects: formData.sideEffects || [],
                indications: formData.indications || []
            };

            if (editingDrug) {
                onSave({ ...drugData, id: editingDrug.id });
            } else {
                onSave(drugData);
            }

            onClose();
        } catch (error) {
            console.error('Error saving drug data:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle close
    const handleClose = () => {
        if (!isSubmitting) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {title || (editingDrug ? 'Edit Data Obat' : 'Tambah Data Obat Baru')}
                    </h3>
                    <button
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nama Obat */}
                        {/* Nama Obat */}
                        <div className="md:col-span-1">
                            <label className="block text-base font-medium text-gray-800 mb-2">
                                Nama Obat <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                className={`w-full px-3 py-2 text-base border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700 ${errors.name ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                value={formData.name || ''}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="Contoh: Metformin 500mg"
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                        </div>

                        {/* Kategori */}
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Kategori <span className="text-red-500">*</span>
                            </label>
                            <select
                                required
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700 ${errors.category ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                value={formData.category || ''}
                                onChange={(e) => handleInputChange('category', e.target.value)}
                            >
                                <option value="">Pilih kategori</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                        </div>

                        {/* Bentuk Sediaan */}
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Bentuk Sediaan <span className="text-red-500">*</span>
                            </label>
                            <select
                                required
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700 ${errors.dosageForm ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                value={formData.dosageForm || ''}
                                onChange={(e) => handleInputChange('dosageForm', e.target.value)}
                            >
                                <option value="">Pilih bentuk sediaan</option>
                                {dosageForms.map(form => (
                                    <option key={form} value={form}>{form}</option>
                                ))}
                            </select>
                            {errors.dosageForm && <p className="mt-1 text-sm text-red-600">{errors.dosageForm}</p>}
                        </div>

                        {/* Kekuatan */}
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Kekuatan <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700 ${errors.strength ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                value={formData.strength || ''}
                                onChange={(e) => handleInputChange('strength', e.target.value)}
                                placeholder="Contoh: 500mg, 2.5mg/ml"
                            />
                            {errors.strength && <p className="mt-1 text-sm text-red-600">{errors.strength}</p>}
                        </div>

                        {/* Produsen */}
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Produsen <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700 ${errors.manufacturer ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                value={formData.manufacturer || ''}
                                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                                placeholder="Contoh: PT. Dexa Medica"
                            />
                            {errors.manufacturer && <p className="mt-1 text-sm text-red-600">{errors.manufacturer}</p>}
                        </div>

                        {/* Stok */}
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Jumlah Stok <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                required
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700 ${errors.stock ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                value={formData.stock || ''}
                                onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                                placeholder="Contoh: 100"
                            />
                            {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock}</p>}
                        </div>

                        {/* Tanggal Kedaluwarsa */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tanggal Kedaluwarsa <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                required
                                min={new Date().toISOString().split('T')[0]}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700 ${errors.expiryDate ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                value={formData.expiryDate || ''}
                                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                            />
                            {errors.expiryDate && <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>}
                        </div>

                        {/* Indikasi */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Indikasi
                            </label>
                            <textarea
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700"
                                rows={2}
                                placeholder="Pisahkan dengan koma. Contoh: Diabetes mellitus tipe 2, Kontrol gula darah"
                                value={formData.indications?.join(', ') || ''}
                                onChange={(e) => handleArrayFieldChange('indications', e.target.value)}
                            />
                            <p className="mt-1 text-xs text-gray-500">Pisahkan setiap indikasi dengan koma</p>
                        </div>

                        {/* Kontraindikasi */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Kontraindikasi
                            </label>
                            <textarea
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700"
                                rows={2}
                                placeholder="Pisahkan dengan koma. Contoh: Gagal ginjal berat, Ketoasidosis diabetik"
                                value={formData.contraindications?.join(', ') || ''}
                                onChange={(e) => handleArrayFieldChange('contraindications', e.target.value)}
                            />
                            <p className="mt-1 text-xs text-gray-500">Pisahkan setiap kontraindikasi dengan koma</p>
                        </div>

                        {/* Efek Samping */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Efek Samping
                            </label>
                            <textarea
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700"
                                rows={2}
                                placeholder="Pisahkan dengan koma. Contoh: Mual, Diare, Nyeri perut"
                                value={formData.sideEffects?.join(', ') || ''}
                                onChange={(e) => handleArrayFieldChange('sideEffects', e.target.value)}
                            />
                            <p className="mt-1 text-xs text-gray-500">Pisahkan setiap efek samping dengan koma</p>
                        </div>

                        {/* Interaksi Obat */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Interaksi Obat
                            </label>
                            <textarea
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700"
                                rows={2}
                                placeholder="Pisahkan dengan koma. Contoh: Glimepiride, Insulin, Aspirin"
                                value={formData.interactions?.join(', ') || ''}
                                onChange={(e) => handleArrayFieldChange('interactions', e.target.value)}
                            />
                            <p className="mt-1 text-xs text-gray-500">Pisahkan setiap obat yang berinteraksi dengan koma</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-end">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="w-full sm:w-auto bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full sm:w-auto bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    <span>{editingDrug ? 'Update' : 'Simpan'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DataObatForm;
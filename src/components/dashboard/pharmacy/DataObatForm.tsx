// src/components/dashboard/pharmacy/DataObatForm.tsx

import React, { useState, useEffect } from 'react';
import { X, Save, Eye, Package, Calendar, DollarSign, AlertTriangle, Info, Pill } from 'lucide-react';

// Interface untuk DrugData
export interface DrugData {
    id: string;
    name: string;
    category: string;
    categoryKehamilan: string;
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
    viewMode?: 'create' | 'edit' | 'detail';
    title?: string;
}

const DataObatForm: React.FC<DataObatFormProps> = ({
    isOpen,
    onClose,
    onSave,
    editingDrug,
    viewMode = 'create',
    title
}) => {
    const [formData, setFormData] = useState<Partial<DrugData>>({
        name: '',
        category: '',
        categoryKehamilan: '',
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

    const isDetailMode = viewMode === 'detail';
    const isEditMode = viewMode === 'edit';
    const isCreateMode = viewMode === 'create';

    // Categories untuk dropdown
    const categories = [
        'INSULINS',
        'ORAL ANTIDIABETIC AGENTS',
        'Lain-lain'
    ];

    // Dosage forms untuk dropdown
    const dosageForms = [
        'Injection',

        'Tablet',
        'Tablet 60 mg MR',
        'Tablet 30 mg',

        'Kapsul',
        'Sirup',
        'Suspensi',
        'Larutan',
        'Krim',
        'Salep',
    ];
    const categorieshamil = [
        'A',
        'B',
        'C',
        'NA'

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
                    categoryKehamilan: '',
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

        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    // Handle array field changes
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

        if (!formData.categoryKehamilan?.trim()) {
            newErrors.categoryKehamilan = 'Kategori Kehamilan wajib dipilih';
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

        if (formData.stock === undefined || formData.stock < 0) {
            newErrors.stock = 'Jumlah stok harus lebih dari atau sama dengan 0';
        }


        if (!formData.expiryDate?.trim()) {
            newErrors.expiryDate = 'Tanggal kedaluwarsa wajib diisi';
        } else {
            const expiryDate = new Date(formData.expiryDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
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

        if (isDetailMode) {
            onClose();
            return;
        }

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const drugData = {
                ...formData,
                name: formData.name!,
                category: formData.category!,
                categoryKehamilan: formData.categoryKehamilan!,
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

            if (editingDrug && isEditMode) {
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

    const handleClose = () => {
        if (!isSubmitting) {
            onClose();
        }
    };

    if (!isOpen) return null;

    const getTitle = () => {
        if (title) return title;
        if (isDetailMode) return 'Detail Data Obat';
        if (isEditMode) return 'Edit Data Obat';
        return 'Tambah Data Obat Baru';
    };

    const getStockStatus = () => {
        const stock = formData.stock || 0;
        if (stock === 0) return { color: 'text-red-600', bg: 'bg-red-100', text: 'HABIS' };
        if (stock < 10) return { color: 'text-red-600', bg: 'bg-red-100', text: 'KRITIS' };
        if (stock < 50) return { color: 'text-orange-600', bg: 'bg-orange-100', text: 'RENDAH' };
        return { color: 'text-green-600', bg: 'bg-green-100', text: 'AMAN' };
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-green-50">
                    <div className="flex items-center space-x-3">
                        {isDetailMode ? <Pill className="h-6 w-6 mr-2 text-green-600" /> : <Pill className="h-6 w-6 text-green-600" />}
                        <h3 className="text-lg font-semibold text-gray-900">
                            {getTitle()}
                        </h3>
                    </div>
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
                    {isDetailMode ? (
                        /* DETAIL MODE VIEW */
                        <div className="space-y-6">
                            {/* Basic Info Card */}
                            <div className="border border-gray-300 rounded-lg p-4">
                                <div className="flex items-center mb-3">
                                    <Info className="h-5 w-5 text-green-600 mr-2" />
                                    <h4 className="font-medium text-gray-900">Informasi Obat</h4>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div className="bg-white rounded-lg p-3 border">
                                        <table className="text-sm w-full">
                                            <tbody className="align-top">
                                                <tr>
                                                    <td className="text-gray-600 pr-4 py-1">Nama Obat</td>
                                                    <td className="px-1 py-1">:</td>
                                                    <td className="font-semibold text-gray-900 py-1">{formData.name}</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-gray-600 pr-4 py-1">Kekuatan</td>
                                                    <td className="px-1 py-1">:</td>
                                                    <td className="font-semibold text-gray-900 py-1">{formData.strength}</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-gray-600 pr-4 py-1">Bentuk Sediaan</td>
                                                    <td className="px-1 py-1">:</td>
                                                    <td className="font-semibold text-gray-900 py-1">{formData.dosageForm}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="bg-white rounded-lg p-3 border">
                                        <table className="text-sm w-full">
                                            <tbody className="align-top">
                                                <tr>
                                                    <td className="text-gray-600 pr-4 py-1">Kategori</td>
                                                    <td className="px-1 py-1">:</td>
                                                    <td className="font-semibold text-gray-900 py-1">{formData.category}</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-gray-600 pr-4 py-1">Kat. Kehamilan</td>
                                                    <td className="px-1 py-1">:</td>
                                                    <td className="font-semibold text-gray-900 py-1">{formData.categoryKehamilan}</td>
                                                </tr>
                                                <tr>
                                                    <td className="text-gray-600 pr-4 py-1">Produsen</td>
                                                    <td className="px-1 py-1">:</td>
                                                    <td className="font-semibold text-gray-900 py-1">{formData.manufacturer}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Stock & Price Card */}
                            <div className="border border-gray-300 rounded-lg p-4">
                                <div className="flex items-center mb-3">
                                    <Package className="h-5 w-5 text-green-600 mr-2" />
                                    <h4 className="font-medium text-gray-900">Stok & Harga</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-white rounded-lg p-3 border">
                                        <label className="block text-sm text-gray-600 mb-1">Jumlah Stok</label>
                                        <div className="flex items-center space-x-2">
                                            <p className="text-2xl font-bold text-gray-900">{formData.stock}</p>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockStatus().bg} ${getStockStatus().color}`}>
                                                {getStockStatus().text}
                                            </span>
                                        </div>
                                    </div>


                                </div>
                            </div>

                            {/* Expiry Date Card */}
                            <div className="border border-gray-300 rounded-lg p-4">
                                <div className="flex items-center mb-3">
                                    <Calendar className="h-5 w-5 text-green-600 mr-2" />
                                    <h4 className="font-medium text-gray-900">Tanggal Kedaluwarsa</h4>
                                </div>
                                <div className="bg-white rounded-lg p-3 border">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-sm text-gray-600">Tanggal Kadaluarsa:</span>
                                            <p className="text-base font-semibold text-gray-900 mt-1">
                                                {formData.expiryDate ? new Date(formData.expiryDate).toLocaleDateString('id-ID', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                }) : '-'}
                                            </p>
                                        </div>
                                        {formData.expiryDate && (() => {
                                            const daysUntilExpiry = Math.ceil((new Date(formData.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                            if (daysUntilExpiry < 30) {
                                                return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">SEGERA KADALUARSA</span>;
                                            } else if (daysUntilExpiry < 90) {
                                                return <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">PERHATIAN</span>;
                                            }
                                            return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">AMAN</span>;
                                        })()}
                                    </div>
                                </div>
                            </div>

                            {/* Medical Info Cards */}
                            <div className="space-y-4">
                                {formData.indications && formData.indications.length > 0 && (
                                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                                        <h5 className="font-semibold text-gray-900 mb-2">Indikasi</h5>
                                        <ul className="list-disc list-inside space-y-1">
                                            {formData.indications.map((item, idx) => (
                                                <li key={idx} className="text-sm text-gray-700">{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {formData.contraindications && formData.contraindications.length > 0 && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <h5 className="font-semibold text-red-900 mb-2 flex items-center">
                                            <AlertTriangle className="h-4 w-4 mr-2" />
                                            Kontraindikasi
                                        </h5>
                                        <ul className="list-disc list-inside space-y-1">
                                            {formData.contraindications.map((item, idx) => (
                                                <li key={idx} className="text-sm text-red-800">{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {formData.sideEffects && formData.sideEffects.length > 0 && (
                                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                                        <h5 className="font-semibold text-gray-900 mb-2">Efek Samping</h5>
                                        <ul className="list-disc list-inside space-y-1">
                                            {formData.sideEffects.map((item, idx) => (
                                                <li key={idx} className="text-sm text-gray-700">{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {formData.interactions && formData.interactions.length > 0 && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <h5 className="font-semibold text-yellow-900 mb-2">Interaksi Obat</h5>
                                        <ul className="list-disc list-inside space-y-1">
                                            {formData.interactions.map((item, idx) => (
                                                <li key={idx} className="text-sm text-yellow-800">{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* EDIT/CREATE MODE VIEW */
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nama Obat */}
                            <div className="md:col-span-1">
                                <label className="block text-base font-medium text-gray-800 mb-2">
                                    Nama Obat <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 font-medium ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
                                    value={formData.name || ''}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    placeholder="Contoh: Metformin 500mg"
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                            </div>

                            {/* Kategori */}
                            <div className="md:col-span-1">
                                <label className="block text-base font-medium text-gray-800 mb-2">
                                    Kategori <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 font-medium ${errors.category ? 'border-red-300' : 'border-gray-300'}`}
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

                            <div className="md:col-span-1">
                                <label className="block text-base font-medium text-gray-800 mb-2">
                                    Kategori Kehamilan<span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 font-medium ${errors.categoryKehamilan ? 'border-red-300' : 'border-gray-300'}`}
                                    value={formData.categoryKehamilan || ''}
                                    onChange={(e) => handleInputChange('categoryKehamilan', e.target.value)}
                                >
                                    <option value="">Pilih kategori</option>
                                    {categorieshamil.map(categoryhamil => (
                                        <option key={categoryhamil} value={categoryhamil}>{categoryhamil}</option>
                                    ))}
                                </select>
                                {errors.categorieshamil && <p className="mt-1 text-sm text-red-600">{errors.categorieshamil}</p>}
                            </div>

                            {/* Bentuk Sediaan */}
                            <div className="md:col-span-1">
                                <label className="block text-base font-medium text-gray-800 mb-2">
                                    Bentuk Sediaan <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 font-medium ${errors.dosageForm ? 'border-red-300' : 'border-gray-300'}`}
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
                                <label className="block text-base font-medium text-gray-800 mb-2">
                                    Kekuatan <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 font-medium ${errors.strength ? 'border-red-300' : 'border-gray-300'}`}
                                    value={formData.strength || ''}
                                    onChange={(e) => handleInputChange('strength', e.target.value)}
                                    placeholder="Contoh: 500mg, 2.5mg/ml"
                                />
                                {errors.strength && <p className="mt-1 text-sm text-red-600">{errors.strength}</p>}
                            </div>

                            {/* Produsen */}
                            <div className="md:col-span-1">
                                <label className="block text-base font-medium text-gray-800 mb-2">
                                    Produsen <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 font-medium ${errors.manufacturer ? 'border-red-300' : 'border-gray-300'}`}
                                    value={formData.manufacturer || ''}
                                    onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                                    placeholder="Contoh: PT. Dexa Medica"
                                />
                                {errors.manufacturer && <p className="mt-1 text-sm text-red-600">{errors.manufacturer}</p>}
                            </div>

                            {/* Stok */}
                            <div className="md:col-span-1">
                                <label className="block text-base font-medium text-gray-800 mb-2">
                                    Jumlah Stok <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    required
                                    className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 font-medium ${errors.stock ? 'border-red-300' : 'border-gray-300'}`}
                                    value={formData.stock || ''}
                                    onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                                    placeholder="Contoh: 100"
                                />
                                {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock}</p>}
                            </div>


                            {/* Tanggal Kedaluwarsa */}
                            <div className="md:col-span-2">
                                <label className="block text-base font-medium text-gray-800 mb-2">
                                    Tanggal Kedaluwarsa <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 font-medium ${errors.expiryDate ? 'border-red-300' : 'border-gray-300'}`}
                                    value={formData.expiryDate || ''}
                                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                                />
                                {errors.expiryDate && <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>}
                            </div>

                            {/* Indikasi */}
                            <div className="md:col-span-2">
                                <label className="block text-base font-medium text-gray-800 mb-2">
                                    Indikasi
                                </label>
                                <textarea
                                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                                    rows={2}
                                    placeholder="Pisahkan dengan koma. Contoh: Diabetes mellitus tipe 2, Kontrol gula darah"
                                    value={formData.indications?.join(', ') || ''}
                                    onChange={(e) => handleArrayFieldChange('indications', e.target.value)}
                                />
                                <p className="mt-1 text-xs text-gray-500">Pisahkan setiap indikasi dengan koma</p>
                            </div>

                            {/* Kontraindikasi */}
                            <div className="md:col-span-2">
                                <label className="block text-base font-medium text-gray-800 mb-2">
                                    Kontraindikasi
                                </label>
                                <textarea
                                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                                    rows={2}
                                    placeholder="Pisahkan dengan koma. Contoh: Gagal ginjal berat, Ketoasidosis diabetik"
                                    value={formData.contraindications?.join(', ') || ''}
                                    onChange={(e) => handleArrayFieldChange('contraindications', e.target.value)}
                                />
                                <p className="mt-1 text-xs text-gray-500">Pisahkan setiap kontraindikasi dengan koma</p>
                            </div>

                            {/* Efek Samping */}
                            <div className="md:col-span-2">
                                <label className="block text-base font-medium text-gray-800 mb-2">
                                    Efek Samping
                                </label>
                                <textarea
                                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                                    rows={2}
                                    placeholder="Pisahkan dengan koma. Contoh: Mual, Diare, Nyeri perut"
                                    value={formData.sideEffects?.join(', ') || ''}
                                    onChange={(e) => handleArrayFieldChange('sideEffects', e.target.value)}
                                />
                                <p className="mt-1 text-xs text-gray-500">Pisahkan setiap efek samping dengan koma</p>
                            </div>

                            {/* Interaksi Obat */}
                            <div className="md:col-span-2">
                                <label className="block text-base font-medium text-gray-800 mb-2">
                                    Interaksi Obat
                                </label>
                                <textarea
                                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                                    rows={2}
                                    placeholder="Pisahkan dengan koma. Contoh: Glimepiride, Insulin, Aspirin"
                                    value={formData.interactions?.join(', ') || ''}
                                    onChange={(e) => handleArrayFieldChange('interactions', e.target.value)}
                                />
                                <p className="mt-1 text-xs text-gray-500">Pisahkan setiap obat yang berinteraksi dengan koma</p>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
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
                                disabled={isSubmitting}
                                className="w-full sm:w-auto bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 font-medium"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                        <span>Menyimpan...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        <span>{isEditMode ? 'Update Obat' : 'Tambah Obat'}</span>
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

export default DataObatForm;
// import React, { useState, useEffect } from 'react';
// import { Search, Plus, X, Save, User, Calendar, Activity, AlertCircle, FileText, Edit, Eye, Trash2, Clock, Flag, CheckCircle2 } from 'lucide-react';

// interface Patient {
//   id: string;
//   mrNumber: string;
//   name: string;
//   birthDate: string;
//   gender: 'MALE' | 'FEMALE';
//   phone?: string;
//   address?: string;
//   height?: number;
//   weight?: number;
//   bmi?: number;
//   bloodType?: string;
//   allergies: string[];
//   medicalHistory?: string;
//   diabetesType?: string;
//   diagnosisDate?: string;
//   comorbidities: string[];
//   insuranceType: string;
//   insuranceNumber?: string;
//   lastVisit?: string;
//   nextAppointment?: string;
//   riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
//   status: 'ACTIVE' | 'INACTIVE' | 'RUJUK_BALIK' | 'SELESAI' | 'FOLLOW_UP';
//   dietCompliance?: number;
//   calorieNeeds?: number;
//   calorieRequirement?: number;
//   dietPlan?: string;
//   createdAt: string;
//   updatedAt: string;
//   user?: {
//     name: string;
//   };
// }

// interface HandledPatient {
//   id: string;
//   patientId: string;
//   handledBy: string;
//   handledDate: string;
//   diagnosis?: string;
//   treatmentPlan?: string;
//   notes?: string;
//   status: 'ACTIVE' | 'COMPLETED' | 'TRANSFERRED' | 'DISCONTINUED' | 'ON_HOLD';
//   priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
//   nextVisitDate?: string;
//   estimatedDuration?: string;
//   specialInstructions?: string;
//   patient: Patient;
//   handler: {
//     name: string;
//     role: string;
//     employeeId?: string;
//   };
// }

// const HandledPatientsPage = () => {
//   const [handledPatients, setHandledPatients] = useState<HandledPatient[]>([]);
//   const [availablePatients, setAvailablePatients] = useState<Patient[]>([]);
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [showEditForm, setShowEditForm] = useState(false);
//   const [editingHandledPatient, setEditingHandledPatient] = useState<HandledPatient | null>(null);
//   const [selectedPatientDetail, setSelectedPatientDetail] = useState<HandledPatient | null>(null);
//   const [showPatientDetail, setShowPatientDetail] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('ALL');
//   const [priorityFilter, setPriorityFilter] = useState('ALL');
//   const [loading, setLoading] = useState(true);

//   const [newHandledPatient, setNewHandledPatient] = useState({
//     patientId: '',
//     diagnosis: '',
//     treatmentPlan: '',
//     notes: '',
//     priority: 'NORMAL',
//     nextVisitDate: '',
//     estimatedDuration: '',
//     specialInstructions: ''
//   });

//   // Fetch handled patients
//   const fetchHandledPatients = async () => {
//     try {
//       const response = await fetch('/api/handled-patients');
//       if (response.ok) {
//         const data = await response.json();
//         setHandledPatients(data);
//       } else {
//         console.error('Failed to fetch handled patients');
//       }
//     } catch (error) {
//       console.error('Error fetching handled patients:', error);
//     }
//   };

//   // Fetch available patients
//   const fetchAvailablePatients = async () => {
//     try {
//       const response = await fetch('/api/patients');
//       if (response.ok) {
//         const data = await response.json();
//         setAvailablePatients(data);
//       } else {
//         console.error('Failed to fetch patients');
//       }
//     } catch (error) {
//       console.error('Error fetching patients:', error);
//     }
//   };

//   useEffect(() => {
//     const loadData = async () => {
//       setLoading(true);
//       await Promise.all([fetchHandledPatients(), fetchAvailablePatients()]);
//       setLoading(false);
//     };
//     loadData();
//   }, []);

//   const calculateAge = (birthDate: string) => {
//     const today = new Date();
//     const birth = new Date(birthDate);
//     let age = today.getFullYear() - birth.getFullYear();
//     const monthDiff = today.getMonth() - birth.getMonth();
//     if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
//       age--;
//     }
//     return age;
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'ACTIVE': return 'text-green-700 bg-green-50 border-green-200';
//       case 'COMPLETED': return 'text-blue-700 bg-blue-50 border-blue-200';
//       case 'TRANSFERRED': return 'text-purple-700 bg-purple-50 border-purple-200';
//       case 'DISCONTINUED': return 'text-red-700 bg-red-50 border-red-200';
//       case 'ON_HOLD': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
//       default: return 'text-gray-700 bg-gray-50 border-gray-200';
//     }
//   };

//   const getPriorityColor = (priority: string) => {
//     switch (priority) {
//       case 'URGENT': return 'text-red-700 bg-red-100 border-red-300';
//       case 'HIGH': return 'text-orange-700 bg-orange-100 border-orange-300';
//       case 'NORMAL': return 'text-blue-700 bg-blue-100 border-blue-300';
//       case 'LOW': return 'text-gray-700 bg-gray-100 border-gray-300';
//       default: return 'text-gray-700 bg-gray-100 border-gray-300';
//     }
//   };

//   const getRiskLevelColor = (level: string) => {
//     switch (level) {
//       case 'HIGH': return 'text-red-700 bg-red-50 border-red-200';
//       case 'MEDIUM': return 'text-orange-700 bg-orange-50 border-orange-200';
//       case 'LOW': return 'text-green-700 bg-green-50 border-green-200';
//       default: return 'text-gray-700 bg-gray-50 border-gray-200';
//     }
//   };

//   const handleAddHandledPatient = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       const response = await fetch('/api/handled-patients', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           ...newHandledPatient,
//           nextVisitDate: newHandledPatient.nextVisitDate || undefined
//         }),
//       });

//       if (response.ok) {
//         await fetchHandledPatients();
//         setNewHandledPatient({
//           patientId: '',
//           diagnosis: '',
//           treatmentPlan: '',
//           notes: '',
//           priority: 'NORMAL',
//           nextVisitDate: '',
//           estimatedDuration: '',
//           specialInstructions: ''
//         });
//         setShowAddForm(false);
//         alert('Pasien berhasil ditambahkan ke daftar yang ditangani!');
//       } else {
//         const error = await response.json();
//         alert(error.error || 'Failed to add handled patient');
//       }
//     } catch (error) {
//       console.error('Error adding handled patient:', error);
//       alert('Error adding handled patient');
//     }
//   };

//   const handleUpdateHandledPatient = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!editingHandledPatient) return;

//     try {
//       const response = await fetch(`/api/handled-patients/${editingHandledPatient.id}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           diagnosis: editingHandledPatient.diagnosis,
//           treatmentPlan: editingHandledPatient.treatmentPlan,
//           notes: editingHandledPatient.notes,
//           status: editingHandledPatient.status,
//           priority: editingHandledPatient.priority,
//           nextVisitDate: editingHandledPatient.nextVisitDate || undefined,
//           estimatedDuration: editingHandledPatient.estimatedDuration,
//           specialInstructions: editingHandledPatient.specialInstructions
//         }),
//       });

//       if (response.ok) {
//         await fetchHandledPatients();
//         setEditingHandledPatient(null);
//         setShowEditForm(false);
//         alert('Data pasien berhasil diperbarui!');
//       } else {
//         const error = await response.json();
//         alert(error.error || 'Failed to update handled patient');
//       }
//     } catch (error) {
//       console.error('Error updating handled patient:', error);
//       alert('Error updating handled patient');
//     }
//   };

//   const handleDeleteHandledPatient = async (id: string) => {
//     if (!confirm('Apakah Anda yakin ingin menghapus pasien dari daftar yang ditangani?')) return;

//     try {
//       const response = await fetch(`/api/handled-patients/${id}`, {
//         method: 'DELETE',
//       });

//       if (response.ok) {
//         await fetchHandledPatients();
//         alert('Pasien berhasil dihapus dari daftar yang ditangani!');
//       } else {
//         const error = await response.json();
//         alert(error.error || 'Failed to delete handled patient');
//       }
//     } catch (error) {
//       console.error('Error deleting handled patient:', error);
//       alert('Error deleting handled patient');
//     }
//   };

//   const viewHandledPatientDetail = async (id: string) => {
//     try {
//       const response = await fetch(`/api/handled-patients/${id}`);
//       if (response.ok) {
//         const data = await response.json();
//         setSelectedPatientDetail(data);
//         setShowPatientDetail(true);
//       } else {
//         console.error('Failed to fetch handled patient details');
//       }
//     } catch (error) {
//       console.error('Error fetching handled patient details:', error);
//     }
//   };

//   // Filter handled patients
//   const filteredHandledPatients = handledPatients.filter(handledPatient => {
//     const searchLower = searchTerm.toLowerCase().trim();
//     const matchesSearch = handledPatient.patient.name.toLowerCase().includes(searchLower) ||
//       handledPatient.patient.mrNumber.toLowerCase().includes(searchLower) ||
//       handledPatient.diagnosis?.toLowerCase().includes(searchLower) ||
//       handledPatient.handler.name.toLowerCase().includes(searchLower);

//     const matchesStatus = statusFilter === 'ALL' || handledPatient.status === statusFilter;
//     const matchesPriority = priorityFilter === 'ALL' || handledPatient.priority === priorityFilter;

//     return matchesSearch && matchesStatus && matchesPriority;
//   });

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
//           <p className="text-gray-600">Memuat data...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-7xl mx-auto px-6 py-6">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-6">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">Pasien Ditangani</h1>
//             <p className="text-gray-600 mt-1">Kelola daftar pasien yang sedang Anda tangani</p>
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
//           <div className="bg-white rounded-lg shadow-sm p-6">
//             <div className="flex items-center">
//               <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
//                 <CheckCircle2 className="h-5 w-5 text-green-600" />
//               </div>
//               <div className="ml-4">
//                 <p className="text-sm font-medium text-gray-600">Aktif</p>
//                 <p className="text-2xl font-bold text-gray-900">
//                   {handledPatients.filter(hp => hp.status === 'ACTIVE').length}
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-sm p-6">
//             <div className="flex items-center">
//               <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
//                 <Flag className="h-5 w-5 text-red-600" />
//               </div>
//               <div className="ml-4">
//                 <p className="text-sm font-medium text-gray-600">Prioritas Tinggi</p>
//                 <p className="text-2xl font-bold text-gray-900">
//                   {handledPatients.filter(hp => hp.priority === 'HIGH' || hp.priority === 'URGENT').length}
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-sm p-6">
//             <div className="flex items-center">
//               <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
//                 <Calendar className="h-5 w-5 text-blue-600" />
//               </div>
//               <div className="ml-4">
//                 <p className="text-sm font-medium text-gray-600">Kunjungan Hari Ini</p>
//                 <p className="text-2xl font-bold text-gray-900">
//                   {handledPatients.filter(hp => {
//                     if (!hp.nextVisitDate) return false;
//                     const today = new Date().toISOString().split('T')[0];
//                     return hp.nextVisitDate.split('T')[0] === today;
//                   }).length}
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-sm p-6">
//             <div className="flex items-center">
//               <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
//                 <Activity className="h-5 w-5 text-purple-600" />
//               </div>
//               <div className="ml-4">
//                 <p className="text-sm font-medium text-gray-600">Total Pasien</p>
//                 <p className="text-2xl font-bold text-gray-900">{handledPatients.length}</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Controls */}
//         <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//           <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//             <div className="flex flex-col sm:flex-row gap-4">
//               <div className="relative">
//                 <input
//                   type="text"
//                   placeholder="Cari pasien atau diagnosis..."
//                   className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-full sm:w-64"
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//                 <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
//               </div>

//               <select
//                 className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value)}
//               >
//                 <option value="ALL">Semua Status</option>
//                 <option value="ACTIVE">Aktif</option>
//                 <option value="COMPLETED">Selesai</option>
//                 <option value="ON_HOLD">Ditunda</option>
//                 <option value="TRANSFERRED">Transfer</option>
//                 <option value="DISCONTINUED">Dihentikan</option>
//               </select>

//               <select
//                 className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
//                 value={priorityFilter}
//                 onChange={(e) => setPriorityFilter(e.target.value)}
//               >
//                 <option value="ALL">Semua Prioritas</option>
//                 <option value="URGENT">Urgent</option>
//                 <option value="HIGH">Tinggi</option>
//                 <option value="NORMAL">Normal</option>
//                 <option value="LOW">Rendah</option>
//               </select>
//             </div>

//             <button
//               onClick={() => setShowAddForm(true)}
//               className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium"
//             >
//               <Plus className="w-4 h-4" />
//               Tambah Pasien
//             </button>
//           </div>
//         </div>

//         {/* Handled Patients List */}
//         <div className="bg-white rounded-lg shadow-sm">
//           <div className="p-6 border-b border-gray-200">
//             <h3 className="text-lg font-semibold text-gray-900">
//               Daftar Pasien Ditangani ({filteredHandledPatients.length})
//             </h3>
//           </div>

//           {/* Desktop Table */}
//           <div className="hidden lg:block overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
//                     Pasien
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
//                     Diagnosis
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
//                     Prioritas
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
//                     Kunjungan Berikutnya
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
//                     Aksi
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {filteredHandledPatients.map((handledPatient) => (
//                   <tr key={handledPatient.id} className="hover:bg-gray-50">
//                     <td className="px-6 py-4">
//                       <div className="flex items-center">
//                         <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
//                           <User className="h-5 w-5 text-gray-600" />
//                         </div>
//                         <div className="ml-3">
//                           <p className="text-sm font-medium text-gray-900">
//                             {handledPatient.patient.name}
//                           </p>
//                           <p className="text-xs text-gray-500">
//                             {handledPatient.patient.mrNumber} • {calculateAge(handledPatient.patient.birthDate)} tahun
//                           </p>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {handledPatient.diagnosis || '-'}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(handledPatient.status)}`}>
//                         {handledPatient.status.replace('_', ' ')}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(handledPatient.priority)}`}>
//                         {handledPatient.priority}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {handledPatient.nextVisitDate
//                         ? new Date(handledPatient.nextVisitDate).toLocaleDateString('id-ID')
//                         : '-'}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
//                       <button
//                         onClick={() => viewHandledPatientDetail(handledPatient.id)}
//                         className="text-gray-600 hover:text-gray-900 font-medium inline-flex items-center space-x-1"
//                       >
//                         <Eye className="h-4 w-4" />
//                         <span>Detail</span>
//                       </button>
//                       <button
//                         onClick={() => {
//                           setEditingHandledPatient(handledPatient);
//                           setShowEditForm(true);
//                         }}
//                         className="text-blue-600 hover:text-blue-900 font-medium inline-flex items-center space-x-1"
//                       >
//                         <Edit className="h-4 w-4" />
//                         <span>Edit</span>
//                       </button>
//                       <button
//                         onClick={() => handleDeleteHandledPatient(handledPatient.id)}
//                         className="text-red-600 hover:text-red-900 font-medium inline-flex items-center space-x-1"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                         <span>Hapus</span>
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Mobile Card Layout */}
//           <div className="lg:hidden space-y-4 p-4">
//             {filteredHandledPatients.map((handledPatient) => (
//               <div key={handledPatient.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
//                 <div className="flex items-start justify-between mb-3">
//                   <div className="flex items-center space-x-3">
//                     <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
//                       <User className="h-5 w-5 text-gray-600" />
//                     </div>
//                     <div>
//                       <h4 className="font-semibold text-gray-900">{handledPatient.patient.name}</h4>
//                       <p className="text-sm text-gray-600">
//                         {handledPatient.patient.mrNumber} • {calculateAge(handledPatient.patient.birthDate)} tahun
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex space-x-1">
//                     <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(handledPatient.status)}`}>
//                       {handledPatient.status.replace('_', ' ')}
//                     </span>
//                     <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(handledPatient.priority)}`}>
//                       {handledPatient.priority}
//                     </span>
//                   </div>
//                 </div>

//                 <div className="mb-4 space-y-2">
//                   <p className="text-sm text-gray-600">
//                     <span className="font-medium">Diagnosis: </span>
//                     {handledPatient.diagnosis || 'Belum ditetapkan'}
//                   </p>
//                   <p className="text-sm text-gray-600">
//                     <span className="font-medium">Kunjungan Berikutnya: </span>
//                     {handledPatient.nextVisitDate
//                       ? new Date(handledPatient.nextVisitDate).toLocaleDateString('id-ID')
//                       : 'Belum dijadwalkan'}
//                   </p>
//                 </div>

//                 <div className="flex space-x-2">
//                   <button
//                     onClick={() => viewHandledPatientDetail(handledPatient.id)}
//                     className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
//                   >
//                     <Eye className="h-4 w-4" />
//                     <span>Detail</span>
//                   </button>
//                   <button
//                     onClick={() => {
//                       setEditingHandledPatient(handledPatient);
//                       setShowEditForm(true);
//                     }}
//                     className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors flex items-center justify-center space-x-1"
//                   >
//                     <Edit className="h-4 w-4" />
//                     <span>Edit</span>
//                   </button>
//                   <button
//                     onClick={() => handleDeleteHandledPatient(handledPatient.id)}
//                     className="flex-1 bg-red-100 text-red-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-red-200 transition-colors flex items-center justify-center space-x-1"
//                   >
//                     <Trash2 className="h-4 w-4" />
//                     <span>Hapus</span>
//                   </button>
//                 </div>
//               </div>
//             ))}

//             {filteredHandledPatients.length === 0 && (
//               <div className="text-center py-8 text-gray-500">
//                 <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
//                 <p>{searchTerm ? "Tidak ada pasien yang ditemukan" : "Belum ada pasien yang ditangani"}</p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Add Form Modal */}
//         {showAddForm && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
//             <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//               <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
//                 <h3 className="text-xl font-semibold text-gray-900">Tambah Pasien Ditangani</h3>
//                 <button
//                   onClick={() => setShowAddForm(false)}
//                   className="text-gray-700 hover:text-gray-600"
//                 >
//                   <X className="h-6 w-6" />
//                 </button>
//               </div>

//               <form onSubmit={handleAddHandledPatient} className="p-6 space-y-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Pilih Pasien *
//                   </label>
//                   <select
//                     required
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 text-base font-medium"
//                     value={newHandledPatient.patientId}
//                     onChange={(e) =>
//                       setNewHandledPatient({ ...newHandledPatient, patientId: e.target.value })
//                     }
//                   >
//                     <option value="" className="text-gray-500">
//                       Pilih pasien...
//                     </option>
//                     {availablePatients.map((patient) => (
//                       <option
//                         key={patient.id}
//                         value={patient.id}
//                         className="text-gray-900 font-medium"
//                       >
//                         {patient.name} - {patient.mrNumber} (
//                         {calculateAge(patient.birthDate)} tahun,{" "}
//                         {patient.gender === "MALE" ? "L" : "P"})
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Diagnosis
//                     </label>
//                     <input
//                       type="text"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700"
//                       placeholder="Diagnosis pasien"
//                       value={newHandledPatient.diagnosis}
//                       onChange={(e) => setNewHandledPatient({ ...newHandledPatient, diagnosis: e.target.value })}
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Prioritas
//                     </label>
//                     <select
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
//                       value={newHandledPatient.priority}
//                       onChange={(e) => setNewHandledPatient({ ...newHandledPatient, priority: e.target.value })}
//                     >
//                       <option value="LOW">Rendah</option>
//                       <option value="NORMAL">Normal</option>
//                       <option value="HIGH">Tinggi</option>
//                       <option value="URGENT">Urgent</option>
//                     </select>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Rencana Pengobatan
//                   </label>
//                   <textarea
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
//                     rows={3}
//                     placeholder="Rencana pengobatan dan tindakan"
//                     value={newHandledPatient.treatmentPlan}
//                     onChange={(e) => setNewHandledPatient({ ...newHandledPatient, treatmentPlan: e.target.value })}
//                   />
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Kunjungan Berikutnya
//                     </label>
//                     <input
//                       type="date"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
//                       value={newHandledPatient.nextVisitDate}
//                       onChange={(e) => setNewHandledPatient({ ...newHandledPatient, nextVisitDate: e.target.value })}
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Estimasi Durasi
//                     </label>
//                     <input
//                       type="text"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
//                       placeholder="e.g., 2 minggu, 1 bulan"
//                       value={newHandledPatient.estimatedDuration}
//                       onChange={(e) => setNewHandledPatient({ ...newHandledPatient, estimatedDuration: e.target.value })}
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Instruksi Khusus
//                   </label>
//                   <textarea
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
//                     rows={2}
//                     placeholder="Instruksi khusus untuk pasien"
//                     value={newHandledPatient.specialInstructions}
//                     onChange={(e) => setNewHandledPatient({ ...newHandledPatient, specialInstructions: e.target.value })}
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Catatan
//                   </label>
//                   <textarea
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
//                     rows={3}
//                     placeholder="Catatan tambahan"
//                     value={newHandledPatient.notes}
//                     onChange={(e) => setNewHandledPatient({ ...newHandledPatient, notes: e.target.value })}
//                   />
//                 </div>

//                 <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
//                   <button
//                     type="button"
//                     onClick={() => setShowAddForm(false)}
//                     className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
//                   >
//                     Batal
//                   </button>
//                   <button
//                     type="submit"
//                     className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
//                   >
//                     <Save className="h-4 w-4" />
//                     <span>Simpan</span>
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}

//         {/* Edit Form Modal */}
//         {showEditForm && editingHandledPatient && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
//             <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//               <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
//                 <h3 className="text-xl font-semibold text-gray-900">Edit Pasien Ditangani</h3>
//                 <button
//                   onClick={() => setShowEditForm(false)}
//                   className="text-gray-400 hover:text-gray-600"
//                 >
//                   <X className="h-6 w-6" />
//                 </button>
//               </div>

//               <form onSubmit={handleUpdateHandledPatient} className="p-6 space-y-6">
//                 {/* Patient Info (Read-only) */}
//                 <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
//                   <div className="flex items-center space-x-3">
//                     <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
//                       <User className="h-5 w-5 text-blue-600" />
//                     </div>
//                     <div>
//                       <h4 className="font-semibold text-gray-900">{editingHandledPatient.patient.name}</h4>
//                       <p className="text-sm text-gray-600">
//                         {editingHandledPatient.patient.mrNumber} • {calculateAge(editingHandledPatient.patient.birthDate)} tahun
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Diagnosis
//                     </label>
//                     <input
//                       type="text"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
//                       placeholder="Diagnosis pasien"
//                       value={editingHandledPatient.diagnosis || ''}
//                       onChange={(e) => setEditingHandledPatient({ ...editingHandledPatient, diagnosis: e.target.value })}
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Status
//                     </label>
//                     <select
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
//                       value={editingHandledPatient.status}
//                       onChange={(e) => setEditingHandledPatient({ ...editingHandledPatient, status: e.target.value as any })}
//                     >
//                       <option value="ACTIVE">Aktif</option>
//                       <option value="COMPLETED">Selesai</option>
//                       <option value="ON_HOLD">Ditunda</option>
//                       <option value="TRANSFERRED">Transfer</option>
//                       <option value="DISCONTINUED">Dihentikan</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Prioritas
//                     </label>
//                     <select
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
//                       value={editingHandledPatient.priority}
//                       onChange={(e) => setEditingHandledPatient({ ...editingHandledPatient, priority: e.target.value as any })}
//                     >
//                       <option value="LOW">Rendah</option>
//                       <option value="NORMAL">Normal</option>
//                       <option value="HIGH">Tinggi</option>
//                       <option value="URGENT">Urgent</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Kunjungan Berikutnya
//                     </label>
//                     <input
//                       type="date"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
//                       value={editingHandledPatient.nextVisitDate ? editingHandledPatient.nextVisitDate.split('T')[0] : ''}
//                       onChange={(e) => setEditingHandledPatient({ ...editingHandledPatient, nextVisitDate: e.target.value })}
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Estimasi Durasi
//                     </label>
//                     <input
//                       type="text"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
//                       placeholder="e.g., 2 minggu, 1 bulan"
//                       value={editingHandledPatient.estimatedDuration || ''}
//                       onChange={(e) => setEditingHandledPatient({ ...editingHandledPatient, estimatedDuration: e.target.value })}
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Rencana Pengobatan
//                   </label>
//                   <textarea
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
//                     rows={3}
//                     placeholder="Rencana pengobatan dan tindakan"
//                     value={editingHandledPatient.treatmentPlan || ''}
//                     onChange={(e) => setEditingHandledPatient({ ...editingHandledPatient, treatmentPlan: e.target.value })}
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Instruksi Khusus
//                   </label>
//                   <textarea
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
//                     rows={2}
//                     placeholder="Instruksi khusus untuk pasien"
//                     value={editingHandledPatient.specialInstructions || ''}
//                     onChange={(e) => setEditingHandledPatient({ ...editingHandledPatient, specialInstructions: e.target.value })}
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Catatan
//                   </label>
//                   <textarea
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
//                     rows={3}
//                     placeholder="Catatan tambahan"
//                     value={editingHandledPatient.notes || ''}
//                     onChange={(e) => setEditingHandledPatient({ ...editingHandledPatient, notes: e.target.value })}
//                   />
//                 </div>

//                 <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
//                   <button
//                     type="button"
//                     onClick={() => setShowEditForm(false)}
//                     className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
//                   >
//                     Batal
//                   </button>
//                   <button
//                     type="submit"
//                     className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
//                   >
//                     <Save className="h-4 w-4" />
//                     <span>Simpan Perubahan</span>
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}

//         {/* Patient Detail Modal */}
//         {showPatientDetail && selectedPatientDetail && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
//             <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//               <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
//                 <h3 className="text-xl font-semibold text-gray-900">Detail Pasien Ditangani</h3>
//                 <button
//                   onClick={() => setShowPatientDetail(false)}
//                   className="text-gray-400 hover:text-gray-600"
//                 >
//                   <X className="h-6 w-6" />
//                 </button>
//               </div>

//               <div className="p-6 space-y-6">
//                 {/* Patient Basic Info */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
//                     <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
//                       <User className="h-5 w-5 mr-2 text-blue-600" />
//                       Informasi Pasien
//                     </h4>
//                     <div className="space-y-2 text-sm">
//                       <p><span className="font-medium">Nama:</span> {selectedPatientDetail.patient.name}</p>
//                       <p><span className="font-medium">No. RM:</span> {selectedPatientDetail.patient.mrNumber}</p>
//                       <p><span className="font-medium">Umur:</span> {calculateAge(selectedPatientDetail.patient.birthDate)} tahun</p>
//                       <p><span className="font-medium">Jenis Kelamin:</span> {selectedPatientDetail.patient.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}</p>
//                       <p><span className="font-medium">Penjamin:</span> {selectedPatientDetail.patient.insuranceType}</p>
//                       <p><span className="font-medium">Tipe DM:</span> {selectedPatientDetail.patient.diabetesType || '-'}</p>
//                     </div>
//                   </div>

//                   <div className="bg-green-50 p-4 rounded-lg border border-green-200">
//                     <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
//                       <FileText className="h-5 w-5 mr-2 text-green-600" />
//                       Status Penanganan
//                     </h4>
//                     <div className="space-y-2 text-sm">
//                       <p><span className="font-medium">Ditangani sejak:</span> {new Date(selectedPatientDetail.handledDate).toLocaleDateString('id-ID')}</p>
//                       <p><span className="font-medium">Status:</span>
//                         <span className={`ml-2 inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedPatientDetail.status)}`}>
//                           {selectedPatientDetail.status.replace('_', ' ')}
//                         </span>
//                       </p>
//                       <p><span className="font-medium">Prioritas:</span>
//                         <span className={`ml-2 inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(selectedPatientDetail.priority)}`}>
//                           {selectedPatientDetail.priority}
//                         </span>
//                       </p>
//                       <p><span className="font-medium">Risiko:</span>
//                         <span className={`ml-2 inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getRiskLevelColor(selectedPatientDetail.patient.riskLevel || 'LOW')}`}>
//                           {selectedPatientDetail.patient.riskLevel || 'LOW'}
//                         </span>
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Medical Information */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <h4 className="font-semibold text-gray-900 mb-2">Diagnosis</h4>
//                     <div className="bg-gray-50 p-3 rounded-lg">
//                       <p className="text-sm text-gray-700">{selectedPatientDetail.diagnosis || 'Belum ditetapkan'}</p>
//                     </div>
//                   </div>

//                   <div>
//                     <h4 className="font-semibold text-gray-900 mb-2">Jadwal & Durasi</h4>
//                     <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-sm">
//                       <p><span className="font-medium">Kunjungan Berikutnya:</span> {selectedPatientDetail.nextVisitDate ? new Date(selectedPatientDetail.nextVisitDate).toLocaleDateString('id-ID') : 'Belum dijadwalkan'}</p>
//                       <p><span className="font-medium">Estimasi Durasi:</span> {selectedPatientDetail.estimatedDuration || '-'}</p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Treatment Plan */}
//                 {selectedPatientDetail.treatmentPlan && (
//                   <div>
//                     <h4 className="font-semibold text-gray-900 mb-2">Rencana Pengobatan</h4>
//                     <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
//                       <p className="text-sm text-gray-700">{selectedPatientDetail.treatmentPlan}</p>
//                     </div>
//                   </div>
//                 )}

//                 {/* Special Instructions */}
//                 {selectedPatientDetail.specialInstructions && (
//                   <div>
//                     <h4 className="font-semibold text-gray-900 mb-2">Instruksi Khusus</h4>
//                     <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
//                       <p className="text-sm text-gray-700">{selectedPatientDetail.specialInstructions}</p>
//                     </div>
//                   </div>
//                 )}

//                 {/* Allergies */}
//                 {selectedPatientDetail.patient.allergies && selectedPatientDetail.patient.allergies.length > 0 && (
//                   <div>
//                     <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
//                       <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
//                       Alergi
//                     </h4>
//                     <div className="flex flex-wrap gap-2">
//                       {selectedPatientDetail.patient.allergies.map((allergy, index) => (
//                         <span key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm">
//                           {allergy}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* Notes */}
//                 {selectedPatientDetail.notes && (
//                   <div>
//                     <h4 className="font-semibold text-gray-900 mb-2">Catatan</h4>
//                     <div className="bg-gray-50 p-3 rounded-lg">
//                       <p className="text-sm text-gray-700">{selectedPatientDetail.notes}</p>
//                     </div>
//                   </div>
//                 )}

//                 {/* Handler Information */}
//                 <div className="bg-green-50 p-4 rounded-lg border border-green-200">
//                   <h4 className="font-semibold text-gray-900 mb-2">Informasi Penanganan</h4>
//                   <div className="text-sm text-gray-700">
//                     <p><span className="font-medium">Ditangani oleh:</span> {selectedPatientDetail.handler.name}</p>
//                     <p><span className="font-medium">Peran:</span> {selectedPatientDetail.handler.role}</p>
//                     {selectedPatientDetail.handler.employeeId && (
//                       <p><span className="font-medium">ID Karyawan:</span> {selectedPatientDetail.handler.employeeId}</p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default HandledPatientsPage;
// 'use client';

// import { useState, useEffect } from 'react';
// import { useSession, signOut } from 'next-auth/react';
// import { useToast } from '../../app/providers';
// import { getRoleTheme, ROLE_NAMES, type UserRole } from '@/lib/auth';
// import { Bell, LogOut, Menu, X, Clock, User, Shield, Heart } from 'lucide-react';

// // import AdminDashboard from './AdminDashboard';      
// import AdminDashboard from './admin/page';    
// import DoctorDashboard from './doctor/page';  
// import NutritionistDashboard from './nutritionist/page';      
// import NurseDashboard from './nurse/page';
// import NursePoliDashboard from './nursePoli/page';  
// import PharmacyDashboard from './pharmacy/page';

// const Dashboard = () => {
//   const { data: session } = useSession();
//   const [currentTime, setCurrentTime] = useState(new Date());
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const { addToast } = useToast();

//   const userRole = session?.user?.role as UserRole;
//   const roleTheme = getRoleTheme(userRole || 'SUPER_ADMIN');

//   // Update time every minute
//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentTime(new Date());
//     }, 60000);
//     return () => clearInterval(timer);
//   }, []);

//   const handleLogout = async () => {
//     try {
//       await signOut({ callbackUrl: '/' });
//       addToast({
//         message: 'Berhasil logout. Sampai jumpa!',
//         type: 'success'
//       });
//     } catch (error) {
//       addToast({
//         message: 'Terjadi kesalahan saat logout',
//         type: 'error'
//       });
//     }
//   };

//   const getGreeting = () => {
//     const hour = currentTime.getHours();
//     if (hour < 12) return 'Selamat Pagi';
//     if (hour < 15) return 'Selamat Siang';
//     if (hour < 18) return 'Selamat Sore';
//     return 'Selamat Malam';
//   };

//   const getShiftInfo = () => {
//     const hour = currentTime.getHours();
//     if (hour >= 7 && hour < 14) return { shift: 'Shift Pagi', time: '07:00-14:00', color: 'text-orange-600 bg-orange-100' };
//     if (hour >= 14 && hour < 21) return { shift: 'Shift Siang', time: '14:00-21:00', color: 'text-blue-600 bg-blue-100' };
//     return { shift: 'Shift Malam', time: '21:00-07:00', color: 'text-purple-600 bg-purple-100' };
//   };

//   const renderDashboardByRole = () => {
//     if (!session?.user?.role) return <AdminDashboard />; // Default fallback
    
//     switch (userRole) {
//       case 'SUPER_ADMIN':
//         return <AdminDashboard />; // Manajerial dengan grafik rekapitulasi

//       case 'DOKTER_SPESIALIS':
//         return <DoctorDashboard />; // Dokter Spesialis Penyakit Dalam

//       case 'PERAWAT_RUANGAN':
//         return <NurseDashboard />; // Perawat Ruangan dengan monitoring pasien

//       case 'PERAWAT_POLI':
//         // Reuse PatientDashboard tapi dengan fitur khusus perawat poli
//         return <NursePoliDashboard />; // Akan dimodifikasi untuk fitur interaktif & notifikasi

//       case 'AHLI_GIZI':
//         return <NutritionistDashboard />; 

//       case 'FARMASI':
//         return <PharmacyDashboard />;

//       default:
//         return <AdminDashboard />;
//     }
//   };

//   const shiftInfo = getShiftInfo();

//   return (
//     <div className={`min-h-screen bg-gradient-to-br ${roleTheme.gradient}`}>
//       {/* Modern Header */}
//       <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-white/20">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16">
            
//             {/* Left side - Hospital branding */}
//             <div className="flex items-center space-x-4">
//               <div className="flex items-center space-x-3">
//                 <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-2.5 shadow-md">
//                   <Heart className="h-6 w-6 text-white" />
//                 </div>
//                 <div>
//                   <h1 className="text-lg font-bold text-gray-900">RS Panti Nugroho</h1>
//                   <p className="text-sm text-gray-600 font-medium">Diabetes Care System</p>
//                 </div>
//               </div>
//             </div>

//             {/* Center - Time and shift info */}
//             <div className="hidden md:flex items-center space-x-6">
//               <div className="text-center">
//                 <p className="text-sm font-medium text-gray-600">
//                   {currentTime.toLocaleDateString('id-ID', { 
//                     weekday: 'long', 
//                     year: 'numeric', 
//                     month: 'long', 
//                     day: 'numeric' 
//                   })}
//                 </p>
//                 <div className="flex items-center justify-center space-x-3 mt-1">
//                   <div className="flex items-center space-x-2">
//                     <Clock className="h-4 w-4 text-gray-500" />
//                     <span className="text-lg font-bold text-gray-900">
//                       {currentTime.toLocaleTimeString('id-ID', { 
//                         hour: '2-digit', 
//                         minute: '2-digit' 
//                       })}
//                     </span>
//                   </div>
//                   <div className={`px-3 py-1 rounded-full text-xs font-medium ${shiftInfo.color}`}>
//                     {shiftInfo.shift}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Right side - User info and actions */}
//             <div className="flex items-center space-x-4">
              
//               {/* Notifications */}
//               <div className="flex items-center space-x-2">
//                 <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
//                   <Bell className="h-5 w-5" />
//                   <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
//                 </button>
                
//                 {/* Employee ID display */}
//                 {session?.user?.employeeId && (
//                   <div className="hidden sm:flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-lg">
//                     <User className="h-4 w-4 text-gray-500" />
//                     <span className="text-xs text-gray-600">ID:</span>
//                     <span className="font-mono font-medium text-gray-800 text-xs">
//                       {session.user.employeeId}
//                     </span>
//                   </div>
//                 )}
//               </div>

//               {/* User profile section */}
//               <div className="flex items-center space-x-3 bg-white/80 rounded-xl px-4 py-2 shadow-sm border border-white/30">
//                 <div className="hidden sm:block text-right">
//                   <p className="text-sm font-bold text-gray-900">
//                     {getGreeting()}, {session?.user?.name}!
//                   </p>
//                   <div className="flex items-center justify-end space-x-2">
//                     <Shield className="h-3 w-3 text-green-600" />
//                     <span className="text-xs font-medium text-green-700">
//                       {userRole ? ROLE_NAMES[userRole] : 'Staff Medis'}
//                     </span>
//                   </div>
//                   {session?.user?.department && (
//                     <p className="text-xs text-gray-500 mt-0.5">
//                       {session.user.department}
//                     </p>
//                   )}
//                 </div>
                
//                 <button 
//                   onClick={handleLogout}
//                   className="flex items-center justify-center w-8 h-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors group"
//                   title="Logout"
//                 >
//                   <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
//                 </button>
//               </div>

//               {/* Mobile menu button */}
//               <button 
//                 onClick={() => setSidebarOpen(!sidebarOpen)}
//                 className="md:hidden p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
//               >
//                 <Menu className="h-5 w-5" />
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Mobile sidebar overlay */}
//       {sidebarOpen && (
//         <div 
//           className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* Modern Mobile sidebar */}
//       <div className={`
//         fixed top-0 right-0 h-full w-80 bg-white/95 backdrop-blur-md shadow-2xl z-50 transform transition-transform duration-300 md:hidden
//         ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
//       `}>
        
//         {/* Sidebar Header */}
//         <div className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center space-x-3">
//               <div className="bg-white/20 rounded-lg p-2">
//                 <Heart className="h-6 w-6 text-white" />
//               </div>
//               <div>
//                 <p className="font-bold text-white text-lg">{session?.user?.name}</p>
//                 <p className="text-sm text-green-100">
//                   {userRole ? ROLE_NAMES[userRole] : 'Staff Medis'}
//                 </p>
//                 {session?.user?.department && (
//                   <p className="text-xs text-green-100 opacity-80">{session.user.department}</p>
//                 )}
//               </div>
//             </div>
//             <button 
//               onClick={() => setSidebarOpen(false)}
//               className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
//             >
//               <X className="h-5 w-5" />
//             </button>
//           </div>

//           {/* Employee info in sidebar */}
//           {session?.user?.employeeId && (
//             <div className="bg-white/20 rounded-lg p-3">
//               <div className="flex items-center space-x-2">
//                 <User className="h-4 w-4 text-white" />
//                 <span className="text-sm text-white">Employee ID</span>
//               </div>
//               <p className="font-mono font-bold text-white text-lg mt-1">
//                 {session.user.employeeId}
//               </p>
//             </div>
//           )}
//         </div>
        
//         {/* Sidebar Content */}
//         <div className="p-6 space-y-6">
          
//           {/* Current time and shift */}
//           <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
//             <div className="flex items-center space-x-2 mb-3">
//               <Clock className="h-5 w-5 text-blue-600" />
//               <span className="text-sm font-semibold text-blue-800">Waktu & Shift Saat Ini</span>
//             </div>
//             <p className="text-2xl font-bold text-blue-900 mb-2">
//               {currentTime.toLocaleTimeString('id-ID', { 
//                 hour: '2-digit', 
//                 minute: '2-digit' 
//               })}
//             </p>
//             <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${shiftInfo.color}`}>
//               {shiftInfo.shift}
//             </div>
//             <p className="text-xs text-blue-600 mt-2">{shiftInfo.time}</p>
//           </div>

//           {/* Current date */}
//           <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
//             <p className="text-sm font-medium text-gray-600 mb-1">Tanggal Hari Ini</p>
//             <p className="text-lg font-bold text-gray-900">
//               {currentTime.toLocaleDateString('id-ID', { 
//                 weekday: 'long', 
//                 year: 'numeric', 
//                 month: 'long', 
//                 day: 'numeric' 
//               })}
//             </p>
//           </div>

//           {/* Notifications */}
//           <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
//             <div className="flex items-center space-x-2 mb-2">
//               <Bell className="h-5 w-5 text-amber-600" />
//               <span className="text-sm font-semibold text-amber-800">Notifikasi Pending</span>
//             </div>
//             <p className="text-lg font-bold text-amber-900 mb-1">3</p>
//             <p className="text-xs text-amber-700">tugas menunggu perhatian</p>
//           </div>

//           {/* Logout button */}
//           <button 
//             onClick={handleLogout}
//             className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
//           >
//             <LogOut className="h-5 w-5" />
//             <span>Logout</span>
//           </button>
//         </div>
//       </div>

//       {/* Main content */}
//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {renderDashboardByRole()}
//       </main>

//       {/* Modern Motivational Footer */}
//       <footer className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-8 mt-16">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center space-y-4">
//             <div className="flex items-center justify-center space-x-3">
//               <Heart className="h-8 w-8 text-white" />
//               <h3 className="text-xl font-bold">RS Panti Nugroho</h3>
//             </div>
            
//             <p className="text-lg font-medium max-w-2xl mx-auto">
//               "Bersama kita berikan pelayanan diabetes terbaik untuk Indonesia"
//             </p>
            
//             <p className="text-sm text-green-100 max-w-xl mx-auto">
//               Tim Medis Profesional untuk Perawatan Diabetes Berkualitas
//             </p>
            
//             <div className="flex items-center justify-center space-x-6 text-xs text-green-200 pt-4 border-t border-green-500/30">
//               <div className="flex items-center space-x-1">
//                 <Shield className="h-3 w-3" />
//                 <span>{userRole ? ROLE_NAMES[userRole] : 'Staff Medis'}</span>
//               </div>
//               <div className="flex items-center space-x-1">
//                 <Clock className="h-3 w-3" />
//                 <span>{shiftInfo.shift}</span>
//               </div>
//               <span>Sistem Internal RS Panti Nugroho</span>
//             </div>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default Dashboard;
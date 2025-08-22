import React, { useState, useEffect } from 'react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPatients: 0,
    activeStaff: 0,
    systemAlerts: 0,
    monthlyAppointments: 0,
    systemUptime: '99.9%'
  });

  const [users, setUsers] = useState([
    { id: 1, name: 'Dr. Sarah Wilson', email: 'doctor@demo.com', role: 'DOCTOR', status: 'Active', lastLogin: '2 hours ago' },
    { id: 2, name: 'Nurse Johnson', email: 'nurse@demo.com', role: 'NURSE', status: 'Active', lastLogin: '30 minutes ago' },
    { id: 3, name: 'Lisa Chen', email: 'nutritionist@demo.com', role: 'NUTRITIONIST', status: 'Active', lastLogin: '1 hour ago' },
    { id: 4, name: 'Mark Davis', email: 'pharmacist@demo.com', role: 'PHARMACIST', status: 'Active', lastLogin: '45 minutes ago' },
    { id: 5, name: 'John Patient', email: 'patient@demo.com', role: 'PATIENT', status: 'Active', lastLogin: '15 minutes ago' }
  ]);

  const [systemLogs, setSystemLogs] = useState([
    { id: 1, timestamp: '2025-01-15 10:30:25', action: 'User Login', user: 'Dr. Sarah Wilson', details: 'Successful login from IP 192.168.1.100' },
    { id: 2, timestamp: '2025-01-15 10:25:12', action: 'Patient Created', user: 'Nurse Johnson', details: 'New patient MR-001234 registered' },
    { id: 3, timestamp: '2025-01-15 10:20:45', action: 'Prescription Added', user: 'Dr. Sarah Wilson', details: 'Metformin prescribed to patient MR-001233' },
    { id: 4, timestamp: '2025-01-15 10:15:30', action: 'Critical Alert', user: 'System', details: 'High blood sugar detected for patient MR-001232' },
    { id: 5, timestamp: '2025-01-15 10:10:18', action: 'Backup Complete', user: 'System', details: 'Daily database backup completed successfully' }
  ]);

  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'DOCTOR',
    password: ''
  });

  const roleColors = {
    ADMIN: 'bg-purple-100 text-purple-800',
    DOCTOR: 'bg-blue-100 text-blue-800',
    NURSE: 'bg-green-100 text-green-800',
    NUTRITIONIST: 'bg-yellow-100 text-yellow-800',
    PHARMACIST: 'bg-red-100 text-red-800',
    PATIENT: 'bg-gray-100 text-gray-800'
  };

  const roleIcons = {
    ADMIN: '👑',
    DOCTOR: '👨‍⚕️',
    NURSE: '👩‍⚕️',
    NUTRITIONIST: '🥗',
    PHARMACIST: '💊',
    PATIENT: '👤'
  };

  useEffect(() => {
    // Simulate loading stats
    setTimeout(() => {
      setStats({
        totalUsers: 156,
        totalPatients: 1234,
        activeStaff: 45,
        systemAlerts: 3,
        monthlyAppointments: 2891,
        systemUptime: '99.9%'
      });
    }, 1000);
  }, []);

  const handleCreateUser = () => {
    const user = {
      id: users.length + 1,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: 'Active',
      lastLogin: 'Never'
    };
    setUsers([...users, user]);
    setNewUser({ name: '', email: '', role: 'DOCTOR', password: '' });
    setShowUserModal(false);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      role: user.role,
      password: ''
    });
    setShowUserModal(true);
  };

  const handleUpdateUser = () => {
    setUsers(users.map(user => 
      user.id === selectedUser.id 
        ? { ...user, name: newUser.name, email: newUser.email, role: newUser.role }
        : user
    ));
    setSelectedUser(null);
    setNewUser({ name: '', email: '', role: 'DOCTOR', password: '' });
    setShowUserModal(false);
  };

  const handleToggleUserStatus = (userId) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'Active' ? 'Inactive' : 'Active' }
        : user
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">👑</span>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-gray-600">System administration and user management</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👥</span>
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏥</span>
              <div>
                <p className="text-sm text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalPatients}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚕️</span>
              <div>
                <p className="text-sm text-gray-600">Active Staff</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeStaff}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚨</span>
              <div>
                <p className="text-sm text-gray-600">System Alerts</p>
                <p className="text-2xl font-bold text-red-600">{stats.systemAlerts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📅</span>
              <div>
                <p className="text-sm text-gray-600">Monthly Appointments</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.monthlyAppointments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <p className="text-sm text-gray-600">System Uptime</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.systemUptime}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* User Management */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👥</span>
                <h2 className="text-xl font-semibold">User Management</h2>
              </div>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setNewUser({ name: '', email: '', role: 'DOCTOR', password: '' });
                  setShowUserModal(true);
                }}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:scale-105 transition-all duration-200 font-medium"
              >
                + Add User
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-white/30">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{roleIcons[user.role]}</span>
                    <div>
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                      {user.role}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleUserStatus(user.id)}
                        className={`text-sm font-medium ${
                          user.status === 'Active' ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'
                        }`}
                      >
                        {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Activity Logs */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">📊</span>
              <h2 className="text-xl font-semibold">System Activity Logs</h2>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {systemLogs.map((log) => (
                <div key={log.id} className="p-4 bg-white/50 rounded-lg border border-white/30">
                  <div className="flex items-start justify-between mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      log.action.includes('Critical') ? 'bg-red-100 text-red-800' :
                      log.action.includes('Login') ? 'bg-green-100 text-green-800' :
                      log.action.includes('Created') || log.action.includes('Added') ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {log.action}
                    </span>
                    <span className="text-xs text-gray-500">{log.timestamp}</span>
                  </div>
                  <p className="text-sm font-medium mb-1">{log.user}</p>
                  <p className="text-xs text-gray-600">{log.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Configuration */}
        <div className="mt-8 bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">⚙️</span>
            <h2 className="text-xl font-semibold">System Configuration</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button className="p-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl hover:scale-105 transition-all duration-200 text-center">
              <span className="text-2xl mb-2 block">🔧</span>
              <span className="font-medium">System Settings</span>
            </button>

            <button className="p-4 bg-gradient-to-r from-green-100 to-green-200 rounded-xl hover:scale-105 transition-all duration-200 text-center">
              <span className="text-2xl mb-2 block">💾</span>
              <span className="font-medium">Backup & Restore</span>
            </button>

            <button className="p-4 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-xl hover:scale-105 transition-all duration-200 text-center">
              <span className="text-2xl mb-2 block">📊</span>
              <span className="font-medium">Analytics Reports</span>
            </button>

            <button className="p-4 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl hover:scale-105 transition-all duration-200 text-center">
              <span className="text-2xl mb-2 block">🔔</span>
              <span className="font-medium">Alert Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              {selectedUser ? 'Edit User' : 'Add New User'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="ADMIN">👑 Admin</option>
                  <option value="DOCTOR">👨‍⚕️ Doctor</option>
                  <option value="NURSE">👩‍⚕️ Nurse</option>
                  <option value="NUTRITIONIST">🥗 Nutritionist</option>
                  <option value="PHARMACIST">💊 Pharmacist</option>
                  <option value="PATIENT">👤 Patient</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {selectedUser ? 'New Password (leave blank to keep current)' : 'Password'}
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter password"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowUserModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={selectedUser ? handleUpdateUser : handleCreateUser}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:scale-105 transition-all duration-200"
              >
                {selectedUser ? 'Update User' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
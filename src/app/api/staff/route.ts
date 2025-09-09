// import { NextRequest, NextResponse } from 'next/server';
// import bcrypt from 'bcryptjs';

// // Mock database - dalam implementasi nyata gunakan Prisma
// let staffDatabase = [
//   {
//     id: '1',
//     name: 'Dr. Sarah Ahmad',
//     role: 'DOKTER_SPESIALIS',
//     username: 'sarah.ahmad',
//     email: 'sarah.ahmad@rspn.com',
//     employeeId: 'DOK001',
//     department: 'Penyakit Dalam',
//     status: 'Aktif',
//     lastLogin: '2024-01-15 09:30',
//     createdAt: new Date('2024-01-01')
//   },
//   // ... staff lainnya dari mockData
// ];

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const search = searchParams.get('search') || '';
    
//     let filteredStaff = staffDatabase;
    
//     if (search) {
//       filteredStaff = staffDatabase.filter(staff =>
//         staff.name.toLowerCase().includes(search.toLowerCase()) ||
//         staff.username.toLowerCase().includes(search.toLowerCase()) ||
//         staff.employeeId.toLowerCase().includes(search.toLowerCase())
//       );
//     }
    
//     return NextResponse.json(filteredStaff);
//   } catch (error) {
//     return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const data = await request.json();
    
//     // Validasi data
//     const requiredFields = ['name', 'role', 'username', 'email', 'employeeId', 'department', 'password'];
//     for (const field of requiredFields) {
//       if (!data[field]) {
//         return NextResponse.json({ error: `Field ${field} is required` }, { status: 400 });
//       }
//     }
    
//     // Cek duplikat username/email/employeeId
//     const existingStaff = staffDatabase.find(s => 
//       s.username === data.username || 
//       s.email === data.email || 
//       s.employeeId === data.employeeId
//     );
    
//     if (existingStaff) {
//       return NextResponse.json({ error: 'Username, email, or employee ID already exists' }, { status: 409 });
//     }
    
//     // Hash password
//     const hashedPassword = await bcrypt.hash(data.password, 12);
    
//     // Create new staff
//     const newStaff = {
//       id: (staffDatabase.length + 1).toString(),
//       name: data.name,
//       role: data.role,
//       username: data.username,
//       email: data.email,
//       employeeId: data.employeeId,
//       department: data.department,
//       status: 'Aktif',
//       lastLogin: 'Belum pernah login',
//       password: hashedPassword, // Simpan hash password
//       createdAt: new Date()
//     };
    
//     staffDatabase.push(newStaff);
    
//     // Return without password
//     const { password, ...staffWithoutPassword } = newStaff;
//     return NextResponse.json(staffWithoutPassword, { status: 201 });
    
//   } catch (error) {
//     return NextResponse.json({ error: 'Failed to create staff' }, { status: 500 });
//   }
// }

// export async function PUT(request: NextRequest) {
//   try {
//     const data = await request.json();
//     const { id, ...updateData } = data;
    
//     if (!id) {
//       return NextResponse.json({ error: 'Staff ID is required' }, { status: 400 });
//     }
    
//     const staffIndex = staffDatabase.findIndex(s => s.id === id);
//     if (staffIndex === -1) {
//       return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
//     }
    
//     // Update staff data
//     staffDatabase[staffIndex] = {
//       ...staffDatabase[staffIndex],
//       ...updateData,
//       updatedAt: new Date()
//     };
    
//     const { password, ...staffWithoutPassword } = staffDatabase[staffIndex];
//     return NextResponse.json(staffWithoutPassword);
    
//   } catch (error) {
//     return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 });
//   }
// }

// export async function DELETE(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const id = searchParams.get('id');
    
//     if (!id) {
//       return NextResponse.json({ error: 'Staff ID is required' }, { status: 400 });
//     }
    
//     const staffIndex = staffDatabase.findIndex(s => s.id === id);
//     if (staffIndex === -1) {
//       return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
//     }
    
//     staffDatabase.splice(staffIndex, 1);
//     return NextResponse.json({ message: 'Staff deleted successfully' });
    
//   } catch (error) {
//     return NextResponse.json({ error: 'Failed to delete staff' }, { status: 500 });
//   }
// }
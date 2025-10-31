# PANDUAN ALUR PENGGUNAAN SISTEM MANAJEMEN PASIEN DIABETES

## 📋 DAFTAR ROLE & AKSES

### 1. **SUPER_ADMIN**
- Akses penuh ke semua fitur
- Manajemen staff
- Monitoring sistem keseluruhan

### 2. **ADMINISTRASI**
- Registrasi pasien baru
- Input keluhan pasien
- Manajemen data pasien

### 3. **PERAWAT_POLI**
- Pemeriksaan vital signs
- Input keluhan
- Koordinasi dengan dokter

### 4. **DOKTER_SPESIALIS**
- Diagnosis & treatment
- Resep obat
- Medical reports

### 5. **PERAWAT_RUANGAN**
- Visitasi pasien rawat inap
- Monitoring vital signs
- Input kepatuhan diet
- Perhitungan kebutuhan energi

### 6. **AHLI_GIZI**
- Perencanaan diet
- Menu planning
- Monitoring nutrisi
- Evaluasi kepatuhan diet

### 7. **FARMASI**
- Transaksi obat
- Manajemen stok
- Dispensing obat

---

## 🔄 ALUR KERJA SISTEM

### **FASE 1: REGISTRASI PASIEN**
**Role: ADMINISTRASI**

1. **Input Data Pasien Baru**
   - Buka form registrasi
   - Isi data:
     - Identitas (nama, tanggal lahir, gender)
     - Kontak (telepon, alamat)
     - Data medis (TB, BB, diabetes type, alergi)
     - Penjamin (BPJS/Umum/Asuransi)
   - Keluhan awal (opsional)
   
2. **Sistem Generate**
   - Nomor MR otomatis (RM1001, RM1002, dst)
   - Alert notifikasi ke perawat poli
   - Status: AKTIF

---

### **FASE 2: PEMERIKSAAN AWAL**
**Role: PERAWAT_POLI**

1. **Lihat Daftar Pasien Aktif**
   - Filter pasien status AKTIF/RAWAT_JALAN
   
2. **Input Vital Signs**
   - Tekanan darah
   - Suhu tubuh
   - Detak jantung
   - Gula darah
   - Berat badan
   
3. **Input Keluhan** (jika ada)
   - Deskripsi keluhan
   - Tingkat keparahan (Ringan/Sedang/Berat)
   
4. **Create Handled Patient Record**
   - Klik "Handle Patient" 
   - Buat record baru dengan:
     - Status: ANTRIAN (pasien siap untuk dokter)
     - Priority: NORMAL/HIGH/URGENT
     - Initial notes dari perawat
   - Sistem akan notif dokter

---

### **FASE 3: DIAGNOSIS & TREATMENT**
**Role: DOKTER_SPESIALIS**

1. **Lihat Daftar Handled Patients**
   - Filter status: ANTRIAN (pasien belum diperiksa dokter)
   - Review data dari perawat
   
2. **Pemeriksaan & Diagnosis**
   - Buka handled patient record
   - Review vital signs & keluhan
   - Input/update:
     - Diagnosis
     - Treatment plan
     - Notes dokter
   - Update status: SEDANG_DITANGANI
   
3. **Resep Obat** (jika perlu)
   - Pilih obat dari database
   - Tentukan dosis & jumlah
   - Sistem notif farmasi
   
4. **Lab Order** (jika perlu)
   - Request pemeriksaan lab
   - Jenis test (HbA1c, GDP, dll)
   
5. **Update Handled Patient Status**
   - **RAWAT_JALAN** → pasien bisa pulang dengan kontrol
   - **RAWAT_INAP** → perlu monitoring intensif di ruangan
   - **KONSULTASI** → perlu evaluasi lebih lanjut
   - **OBSERVASI** → perlu pengawasan beberapa waktu
   - **SELESAI** → treatment selesai, pasien pulang
   
6. **Update Patient Status** (otomatis dari handled status)
   - Sistem akan sync status patient sesuai handled status

---

### **FASE 4A: RAWAT JALAN (Pasien Pulang)**
**Role: FARMASI**

1. **Lihat Resep Pending**
   - Filter: belum diproses
   
2. **Proses Transaksi Obat**
   - Pilih sumber: Resep Dokter / Manual
   - Verifikasi stok
   - Input quantity
   - Generate transaksi
   - Stok otomatis berkurang
   - Sistem notif pasien untuk ambil obat

---

### **FASE 4B: RAWAT INAP (Monitoring Intensif)**

#### **A. PERAWAT_RUANGAN**

1. **Visitasi Rutin**
   - Cek vital signs berkala
   - Update berat badan
   - Observasi kondisi
   
2. **Perhitungan Kebutuhan Energi**
   - Input TB & BB terbaru
   - Pilih aktivitas fisik
   - Pilih tingkat stres
   - Sistem hitung otomatis (PERKENI 2015)
   - Hasil tersimpan untuk ahli gizi
   
3. **Monitoring Kepatuhan Diet**
   - Checklist:
     - ✅ Menghabiskan porsi
     - ✅ Ikut jadwal makan
     - ✅ Hindari gula
     - ✅ Makan sayur
     - ✅ Minum air cukup
   - Sistem hitung persentase kepatuhan
   
4. **Report Masalah Diet**
   - Jika kepatuhan < 70%
   - Input detail masalah
   - Sistem notif ahli gizi

#### **B. AHLI_GIZI**

1. **Lihat Daftar Pasien Rawat Inap**
   - Auto filter status: RAWAT_INAP
   - Lihat data:
     - BMI terbaru
     - Kebutuhan energi
     - Kepatuhan diet
     - Alert masalah diet
   
2. **Buka Detail Pasien**
   - Riwayat nutrisi
   - Grafik kepatuhan
   - Perhitungan energi dari perawat
   
3. **Input Nutrition Record**
   - Target kalori (ambil dari perhitungan energi)
   - Diet plan (Diabetes mellitus type 1/2)
   - Meal distribution
   - Compliance score
   - Rekomendasi
   
4. **Menu Planning**
   - Buat menu harian:
     - Sarapan (07:00)
     - Snack pagi (10:00)
     - Makan siang (12:00)
     - Snack sore (15:00)
     - Makan malam (18:00)
   - Per item:
     - Nama makanan
     - Porsi
     - Kalori, Karbohidrat, Protein, Lemak
   - Total harus sesuai target kalori
   
5. **Handle Alert Diet**
   - Lihat laporan dari perawat
   - Evaluasi masalah
   - Update diet plan jika perlu
   - Tandai sebagai ditangani

#### **C. FARMASI (untuk pasien rawat inap)**

1. **Proses Resep Dokter**
   - Pilih sumber: "Resep dari Dokter"
   - Sistem tampilkan resep pending
   - Proses transaksi
   - Sistem auto notif perawat ruangan
   
2. **Perawat Ambil & Berikan Obat**
   - Terima notifikasi
   - Ambil obat di farmasi
   - Berikan ke pasien sesuai jadwal

---

### **FASE 5: LAB RESULTS**
**Role: PERAWAT (input) / DOKTER (review)**

1. **Input Hasil Lab**
   - Pilih pasien
   - Jenis test (HbA1c, GDP, GD2PP, dll)
   - Value hasil
   - Normal range
   - Status (Normal/High/Low/Critical)
   
2. **Sistem Generate Alert**
   - Jika abnormal → notif dokter
   
3. **Dokter Review**
   - Evaluasi hasil lab
   - Update treatment jika perlu

---

### **FASE 6: MONITORING & FOLLOW-UP**

#### **Dashboard Stats (setiap role)**
- Total pasien
- Pending tasks
- Critical alerts
- Statistics

#### **Alert System**
- Real-time notifications
- Filter by category:
  - Pasien baru
  - Vital signs abnormal
  - Lab results
  - Resep pending
  - Masalah diet
- Priority levels: Low/Medium/High/Urgent
- Mark as read

#### **History & Reports**
- Riwayat medis lengkap
- Grafik trend (gula darah, BB, BMI)
- Compliance tracking
- Export reports

---

## 📊 FLOW DIAGRAM SEDERHANA

```
PASIEN BARU
    ↓
[ADMINISTRASI] Registrasi → Generate MR Number → Status: AKTIF
    ↓
[PERAWAT_POLI] 
    - Input Vital Signs + Keluhan
    - Create HandledPatient → Status: ANTRIAN
    ↓
[DOKTER] 
    - Lihat HandledPatient (filter: ANTRIAN)
    - Diagnosis + Update HandledPatient
    - Resep + Lab Order
    - Update Status HandledPatient
    ↓
    ├─→ Status: SELESAI (RAWAT_JALAN)
    │       - Patient Status → RAWAT_JALAN
    │       ↓
    │   [FARMASI] Proses Obat → Pasien Pulang
    │
    └─→ Status: OBSERVASI/STABIL (RAWAT_INAP)
            - Patient Status → RAWAT_INAP
            ↓
        [PERAWAT_RUANGAN]
            - Visitasi rutin (model Visitation)
            - Hitung kebutuhan energi
            - Monitor kepatuhan diet
            - Report masalah via Alert
            ↓
        [AHLI_GIZI]
            - Review patient (filter: RAWAT_INAP)
            - Review data energi dari Visitation
            - Create NutritionRecord
            - Planning menu harian
            - Handle Alert diet
            ↓
        [FARMASI] Proses resep → Obat ke perawat
            ↓
        [PERAWAT_RUANGAN] Berikan obat + Monitor
            ↓
        Loop monitoring sampai pasien stabil
            ↓
        [DOKTER] Update HandledPatient Status → SELESAI
            ↓
        Patient Status → PULANG / RUJUK_KELUAR
```

---

## 🎯 FITUR KUNCI SISTEM

### **1. Real-time Alerts**
- Notifikasi antar role
- Priority management
- Auto-routing ke role yang tepat

### **2. Perhitungan Otomatis**
- BMI auto calculate
- Kebutuhan energi (PERKENI 2015)
- Compliance percentage
- Menu calories total

### **3. Data Integration**
- Semua data terhubung by patient ID
- History tracking lengkap
- Cross-role data sharing

### **4. Smart Workflow**
- Status management otomatis
- Alert generation by condition
- Stock management (obat)

### **5. Comprehensive Dashboard**
- Role-specific stats
- Quick access menu
- Search & filter

---

## 💡 TIPS PENGGUNAAN

1. **Selalu update HandledPatient status** setelah menangani pasien
2. **Check alerts regularly** untuk task pending
3. **Input data lengkap** untuk akurasi sistem
4. **Koordinasi via alert** untuk komunikasi antar role
5. **Review history** sebelum membuat keputusan medis
6. **Verifikasi stok obat** sebelum resep
7. **Monitor compliance** untuk evaluasi efektivitas treatment
8. **HandledPatient vs Patient Status**: 
   - HandledPatient status = status penanganan medis
   - Patient status = status administratif pasien
   - Keduanya sync otomatis oleh sistem

---

## 🔑 STATUS PENTING

### HandledPatient Status:
- **ANTRIAN**: Pasien siap diperiksa dokter
- **SEDANG_DITANGANI**: Dokter sedang menangani
- **KONSULTASI**: Perlu evaluasi lanjutan
- **OBSERVASI**: Perlu pengawasan
- **EMERGENCY**: Kondisi darurat
- **STABIL**: Kondisi stabil (rawat inap)
- **SELESAI**: Treatment selesai
- **RUJUK_KELUAR**: Dirujuk ke RS lain
- **MENINGGAL**: Pasien meninggal

### Patient Status:
- **AKTIF**: Pasien terdaftar, belum ditangani
- **RAWAT_JALAN**: Pasien kontrol/berobat jalan
- **RAWAT_INAP**: Pasien dirawat di ruangan
- **PULANG**: Pasien sudah pulang
- **RUJUK_KELUAR**: Dirujuk keluar
- **PULANG_PAKSA**: Pulang atas permintaan sendiri
- **MENINGGAL**: Pasien meninggal

---

## ❗ CATATAN PENTING

- **Data Privacy**: Semua akses sesuai role authorization
- **Required Fields**: Tandai * wajib diisi
- **Validation**: Sistem validasi otomatis untuk data consistency
- **Backup**: Semua transaksi tercatat dengan timestamp
- **Audit Trail**: History lengkap untuk accountability

---

**Sistem ini dirancang untuk workflow terintegrasi dalam manajemen pasien diabetes, dari registrasi hingga monitoring jangka panjang.**

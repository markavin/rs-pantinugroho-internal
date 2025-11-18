import React, { useState, useEffect } from 'react';
import { XCircle, Save, FlaskConical, Heart, AlertCircle, TrendingUp, Activity, Microscope, TestTube } from 'lucide-react';

interface Patient {
  id: string;
  mrNumber: string;
  name: string;
  birthDate: Date;
  gender: 'MALE' | 'FEMALE';
  phone?: string;
  height?: number;
  weight?: number;
  bmi?: number;
  diabetesType?: string;
  insuranceType: string;
  lastVisit?: Date;
  status?: string;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  allergies?: string[];
  smokingStatus?: 'TIDAK_MEROKOK' | 'PEROKOK' | 'MANTAN_PEROKOK';
  medicalHistory?: string;
  createdAt: Date;
}

interface LabPatientExaminationFormProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onComplete: () => void;
}

interface PatientComplaint {
  id: string;
  patientId: string;
  recordType: 'COMPLAINTS';
  title: string;
  content: string;
  metadata?: {
    severity?: 'RINGAN' | 'SEDANG' | 'BERAT';
  };
  createdAt: Date;
}

const LabPatientExaminationForm: React.FC<LabPatientExaminationFormProps> = ({
  isOpen,
  onClose,
  patient,
  onComplete
}) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [existingComplaints, setExistingComplaints] = useState<PatientComplaint[]>([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);

  const [formData, setFormData] = useState({
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    temperature: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    labTests: {
      gulaDarahSewaktu: '',
      gulaDarahPuasa: '',
      glukosa2JamPP: '',
      hba1c: '',
      cholesterol: '',
      ldl: '',
      hdl: '',
      trigliseride: '',
      urea: '',
      creatinine: '',
      albumin: '',
      sgot: '',
      sgpt: '',
      hemoglobin: '',
      leukosit: ''
    },
    labNotes: ''
  });

  const labTestDefinitions: Record<string, { name: string; normalRange: string; unit: string; category: string }> = {
    gulaDarahSewaktu: { name: 'Gula Darah Sewaktu', normalRange: '<200', unit: 'mg/dL', category: 'Gula Darah' },
    gulaDarahPuasa: { name: 'Gula Darah Puasa', normalRange: '70-100', unit: 'mg/dL', category: 'Gula Darah' },
    glukosa2JamPP: { name: 'Glukosa 2 Jam PP', normalRange: '<140', unit: 'mg/dL', category: 'Gula Darah' },
    hba1c: { name: 'HbA1c', normalRange: '<5.7', unit: '%', category: 'Gula Darah' },
    cholesterol: { name: 'Kolesterol Total', normalRange: '<200', unit: 'mg/dL', category: 'Lipid' },
    ldl: { name: 'LDL', normalRange: '<100', unit: 'mg/dL', category: 'Lipid' },
    hdl: { name: 'HDL', normalRange: '>40 (L), >50 (P)', unit: 'mg/dL', category: 'Lipid' },
    trigliseride: { name: 'Trigliserida', normalRange: '<150', unit: 'mg/dL', category: 'Lipid' },
    urea: { name: 'Urea', normalRange: '10-50', unit: 'mg/dL', category: 'Fungsi Ginjal' },
    creatinine: { name: 'Kreatinin', normalRange: '0.6-1.3', unit: 'mg/dL', category: 'Fungsi Ginjal' },
    albumin: { name: 'Albumin', normalRange: '3.5-5.0', unit: 'g/dL', category: 'Protein' },
    sgot: { name: 'SGOT (AST)', normalRange: '<40', unit: 'U/L', category: 'Fungsi Hati' },
    sgpt: { name: 'SGPT (ALT)', normalRange: '<41', unit: 'U/L', category: 'Fungsi Hati' },
    hemoglobin: { name: 'Hemoglobin (Hb)', normalRange: '12-16 (P), 13-17 (L)', unit: 'g/dL', category: 'Darah Lengkap' },
    leukosit: { name: 'Leukosit (AL)', normalRange: '4000-11000', unit: '/µL', category: 'Darah Lengkap' }
  };

  useEffect(() => {
    if (isOpen && patient) {
      fetchExistingComplaints(patient.id);
      setFormData({
        bloodPressureSystolic: '',
        bloodPressureDiastolic: '',
        heartRate: '',
        temperature: '',
        respiratoryRate: '',
        oxygenSaturation: '',
        labTests: {
          gulaDarahSewaktu: '',
          gulaDarahPuasa: '',
          glukosa2JamPP: '',
          hba1c: '',
          cholesterol: '',
          ldl: '',
          hdl: '',
          trigliseride: '',
          urea: '',
          creatinine: '',
          albumin: '',
          sgot: '',
          sgpt: '',
          hemoglobin: '',
          leukosit: ''
        },
        labNotes: ''
      });
      setErrors({});
    }
  }, [isOpen, patient]);

  const fetchExistingComplaints = async (patientId: string) => {
    setLoadingComplaints(true);
    try {
      const response = await fetch(`/api/patient-records?patientId=${patientId}&type=COMPLAINTS`);
      if (response.ok) {
        const data = await response.json();
        const complaints = data.filter((record: any) => record.recordType === 'COMPLAINTS');
        setExistingComplaints(complaints);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoadingComplaints(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const hasAnyLabTest = Object.values(formData.labTests).some(val => val.trim() !== '');
    
    if (!hasAnyLabTest) {
      newErrors.labTests = 'Minimal satu pemeriksaan lab harus diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const determineLabStatus = (testKey: string, value: number): 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL' => {
    const ranges: Record<string, { low?: number; high?: number; critical?: number }> = {
      gulaDarahSewaktu: { high: 200, critical: 300 },
      gulaDarahPuasa: { low: 70, high: 100, critical: 126 },
      glukosa2JamPP: { high: 140, critical: 200 },
      hba1c: { high: 5.7, critical: 8.0 },
      cholesterol: { high: 200, critical: 240 },
      ldl: { high: 100, critical: 160 },
      hdl: { low: 40 },
      trigliseride: { high: 150, critical: 200 },
      urea: { low: 10, high: 50, critical: 80 },
      creatinine: { low: 0.6, high: 1.3, critical: 2.0 },
      albumin: { low: 3.5, high: 5.0 },
      sgot: { high: 40, critical: 100 },
      sgpt: { high: 41, critical: 100 },
      hemoglobin: { low: 12, high: 17 },
      leukosit: { low: 4000, high: 11000, critical: 20000 }
    };

    const range = ranges[testKey];
    if (!range) return 'NORMAL';

    if (range.critical && value >= range.critical) return 'CRITICAL';
    if (range.high && value > range.high) return 'HIGH';
    if (range.low && value < range.low) return 'LOW';

    return 'NORMAL';
  };

  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const convertCholesterolToMmol = (mgDl: number): number => {
    return parseFloat((mgDl / 38.67).toFixed(2));
  };

  const calculateSearBRisk = () => {
    if (!patient || !formData.bloodPressureSystolic || !formData.labTests.cholesterol) {
      return null;
    }

    const age = calculateAge(patient.birthDate);
    if (age < 40) return null;

    const getAgeGroup = (age: number): number => {
      if (age < 45) return 40;
      if (age < 55) return 50;
      if (age < 65) return 60;
      return 70;
    };

    const cholMmol = convertCholesterolToMmol(parseFloat(formData.labTests.cholesterol));
    const cholCol = Math.max(4, Math.min(8, Math.round(cholMmol)));

    const systolic = parseInt(formData.bloodPressureSystolic);
    const bpRow = Math.max(120, Math.min(180, Math.round(systolic / 20) * 20));

    const RISK_MATRIX: any = {
      'false-MALE-false': {
        40: { 120: [0, 0, 0, 0, 1], 140: [0, 0, 0, 1, 1], 160: [0, 0, 1, 1, 2], 180: [0, 1, 1, 2, 2] },
        50: { 120: [0, 0, 1, 1, 1], 140: [0, 1, 1, 1, 2], 160: [0, 1, 1, 2, 2], 180: [1, 1, 2, 2, 3] },
        60: { 120: [0, 1, 1, 1, 2], 140: [1, 1, 1, 2, 2], 160: [1, 1, 2, 2, 3], 180: [1, 2, 2, 3, 3] },
        70: { 120: [1, 1, 1, 2, 2], 140: [1, 1, 2, 2, 3], 160: [1, 2, 2, 3, 3], 180: [2, 2, 3, 3, 4] }
      },
      'false-MALE-true': {
        40: { 120: [0, 0, 1, 1, 1], 140: [0, 1, 1, 1, 2], 160: [0, 1, 1, 2, 2], 180: [1, 1, 2, 2, 3] },
        50: { 120: [0, 1, 1, 2, 2], 140: [1, 1, 2, 2, 2], 160: [1, 1, 2, 2, 3], 180: [1, 2, 2, 3, 3] },
        60: { 120: [1, 1, 2, 2, 2], 140: [1, 2, 2, 2, 3], 160: [1, 2, 2, 3, 3], 180: [2, 2, 3, 3, 4] },
        70: { 120: [1, 2, 2, 2, 3], 140: [2, 2, 2, 3, 3], 160: [2, 2, 3, 3, 4], 180: [2, 3, 3, 4, 4] }
      },
      'false-FEMALE-false': {
        40: { 120: [0, 0, 0, 0, 0], 140: [0, 0, 0, 0, 1], 160: [0, 0, 0, 1, 1], 180: [0, 0, 1, 1, 1] },
        50: { 120: [0, 0, 0, 1, 1], 140: [0, 0, 1, 1, 1], 160: [0, 1, 1, 1, 2], 180: [0, 1, 1, 2, 2] },
        60: { 120: [0, 0, 1, 1, 1], 140: [0, 1, 1, 1, 2], 160: [1, 1, 1, 2, 2], 180: [1, 1, 2, 2, 2] },
        70: { 120: [0, 1, 1, 1, 2], 140: [1, 1, 1, 2, 2], 160: [1, 1, 2, 2, 3], 180: [1, 2, 2, 2, 3] }
      },
      'false-FEMALE-true': {
        40: { 120: [0, 0, 0, 1, 1], 140: [0, 0, 1, 1, 1], 160: [0, 1, 1, 1, 2], 180: [0, 1, 1, 2, 2] },
        50: { 120: [0, 0, 1, 1, 1], 140: [0, 1, 1, 1, 2], 160: [1, 1, 1, 2, 2], 180: [1, 1, 2, 2, 2] },
        60: { 120: [0, 1, 1, 1, 2], 140: [1, 1, 1, 2, 2], 160: [1, 1, 2, 2, 3], 180: [1, 2, 2, 2, 3] },
        70: { 120: [1, 1, 1, 2, 2], 140: [1, 1, 2, 2, 3], 160: [1, 2, 2, 3, 3], 180: [2, 2, 2, 3, 3] }
      },
      'true-MALE-false': {
        40: { 120: [0, 0, 1, 1, 2], 140: [0, 1, 1, 2, 2], 160: [1, 1, 2, 2, 3], 180: [1, 2, 2, 3, 3] },
        50: { 120: [1, 1, 2, 2, 2], 140: [1, 2, 2, 2, 3], 160: [2, 2, 2, 3, 3], 180: [2, 2, 3, 3, 4] },
        60: { 120: [1, 2, 2, 3, 3], 140: [2, 2, 3, 3, 3], 160: [2, 3, 3, 3, 4], 180: [3, 3, 3, 4, 4] },
        70: { 120: [2, 2, 3, 3, 4], 140: [2, 3, 3, 4, 4], 160: [3, 3, 4, 4, 4], 180: [3, 4, 4, 4, 4] }
      },
      'true-MALE-true': {
        40: { 120: [1, 1, 2, 2, 3], 140: [1, 2, 2, 3, 3], 160: [2, 2, 3, 3, 3], 180: [2, 3, 3, 3, 4] },
        50: { 120: [2, 2, 2, 3, 3], 140: [2, 2, 3, 3, 4], 160: [2, 3, 3, 4, 4], 180: [3, 3, 4, 4, 4] },
        60: { 120: [2, 3, 3, 3, 4], 140: [3, 3, 3, 4, 4], 160: [3, 3, 4, 4, 4], 180: [3, 4, 4, 4, 4] },
        70: { 120: [3, 3, 4, 4, 4], 140: [3, 4, 4, 4, 4], 160: [4, 4, 4, 4, 4], 180: [4, 4, 4, 4, 4] }
      },
      'true-FEMALE-false': {
        40: { 120: [0, 0, 1, 1, 2], 140: [0, 1, 1, 2, 2], 160: [1, 1, 2, 2, 2], 180: [1, 2, 2, 2, 3] },
        50: { 120: [0, 1, 2, 2, 2], 140: [1, 1, 2, 2, 3], 160: [1, 2, 2, 3, 3], 180: [2, 2, 3, 3, 3] },
        60: { 120: [1, 2, 2, 2, 3], 140: [2, 2, 2, 3, 3], 160: [2, 2, 3, 3, 4], 180: [2, 3, 3, 3, 4] },
        70: { 120: [2, 2, 2, 3, 3], 140: [2, 2, 3, 3, 4], 160: [2, 3, 3, 4, 4], 180: [3, 3, 4, 4, 4] }
      },
      'true-FEMALE-true': {
        40: { 120: [0, 1, 2, 2, 2], 140: [1, 2, 2, 2, 3], 160: [1, 2, 2, 3, 3], 180: [2, 2, 3, 3, 3] },
        50: { 120: [1, 2, 2, 3, 3], 140: [2, 2, 3, 3, 3], 160: [2, 2, 3, 3, 4], 180: [2, 3, 3, 4, 4] },
        60: { 120: [2, 2, 3, 3, 4], 140: [2, 3, 3, 4, 4], 160: [2, 3, 4, 4, 4], 180: [3, 3, 4, 4, 4] },
        70: { 120: [2, 3, 3, 4, 4], 140: [3, 3, 4, 4, 4], 160: [3, 4, 4, 4, 4], 180: [3, 4, 4, 4, 4] }
      }
    };

    const isSmoker = patient.smokingStatus === 'PEROKOK';
    const hasDiabetes = !!patient.diabetesType;
    const matrixKey = `${hasDiabetes}-${patient.gender}-${isSmoker}`;

    const ageGrp = getAgeGroup(age);
    const cholIndex = cholCol - 4;

    const riskIndex = RISK_MATRIX[matrixKey]?.[ageGrp]?.[bpRow]?.[cholIndex];

    if (riskIndex === undefined) return null;

    const riskLevels = [
      { range: '<10%', level: 'Sangat Rendah', color: 'bg-green-100 text-green-800 border-green-300', percentage: 5 },
      { range: '10-20%', level: 'Rendah', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', percentage: 15 },
      { range: '20-30%', level: 'Sedang', color: 'bg-orange-100 text-orange-800 border-orange-300', percentage: 25 },
      { range: '30-40%', level: 'Tinggi', color: 'bg-red-100 text-red-800 border-red-300', percentage: 35 },
      { range: '≥40%', level: 'Sangat Tinggi', color: 'bg-red-900 text-white border-red-900', percentage: 45 }
    ];

    return riskLevels[riskIndex];
  };

  const searBResult = calculateSearBRisk();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patient) return;
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Save vital signs if any are filled
      const hasVitalSigns = formData.bloodPressureSystolic || formData.heartRate || formData.temperature;
      
      if (hasVitalSigns) {
        const vitalSigns = {
          bloodPressure: formData.bloodPressureSystolic && formData.bloodPressureDiastolic 
            ? `${formData.bloodPressureSystolic}/${formData.bloodPressureDiastolic}` 
            : null,
          heartRate: formData.heartRate ? parseInt(formData.heartRate) : null,
          temperature: formData.temperature ? parseFloat(formData.temperature) : null,
          respiratoryRate: formData.respiratoryRate ? parseInt(formData.respiratoryRate) : null,
          oxygenSaturation: formData.oxygenSaturation ? parseInt(formData.oxygenSaturation) : null,
          recordedAt: new Date().toISOString(),
          searB: searBResult ? {
            range: searBResult.range,
            level: searBResult.level,
            percentage: searBResult.percentage,
            cholesterol: formData.labTests.cholesterol ? parseFloat(formData.labTests.cholesterol) : null,
            cholesterolMmol: formData.labTests.cholesterol ? convertCholesterolToMmol(parseFloat(formData.labTests.cholesterol)) : null,
            age: calculateAge(patient.birthDate),
            isSmoker: patient.smokingStatus === 'PEROKOK',
            hasDiabetes: !!patient.diabetesType
          } : null
        };

        await fetch('/api/patient-records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId: patient.id,
            recordType: 'VITAL_SIGNS',
            title: 'Pemeriksaan Tanda Vital (Lab)',
            content: JSON.stringify(vitalSigns),
            bloodPressure: vitalSigns.bloodPressure,
            heartRate: vitalSigns.heartRate,
            temperature: vitalSigns.temperature,
            metadata: vitalSigns
          })
        });
      }

      // Save SEAR B risk if calculated
      if (searBResult) {
        await fetch(`/api/patients/${patient.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            searBRiskPercentage: searBResult.percentage,
            searBRiskLevel: searBResult.level,
            searBLastCalculated: new Date()
          })
        });

        if (searBResult.percentage >= 30) {
          await fetch('/api/alerts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: searBResult.percentage >= 40 ? 'CRITICAL' : 'WARNING',
              category: 'VITAL_SIGNS',
              priority: searBResult.percentage >= 40 ? 'URGENT' : 'HIGH',
              message: `Pasien ${patient.name} (${patient.mrNumber}) memiliki risiko SEARB ${searBResult.level} (${searBResult.percentage}%)`,
              patientId: patient.id,
              targetRole: 'DOKTER_SPESIALIS'
            })
          });
        }
      }

      // Save lab results
      const labPromises: Promise<any>[] = [];
      let hasAbnormal = false;
      const abnormalTests: string[] = [];

      Object.entries(formData.labTests).forEach(([key, value]) => {
        if (value) {
          const testDef = labTestDefinitions[key];
          const numValue = parseFloat(value);
          const status = determineLabStatus(key, numValue);

          if (status === 'HIGH' || status === 'CRITICAL' || status === 'LOW') {
            hasAbnormal = true;
            abnormalTests.push(`${testDef.name}: ${value} ${testDef.unit} (${status})`);
          }

          labPromises.push(
            fetch('/api/lab-results', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                patientId: patient.id,
                testType: testDef.name,
                value: `${value} ${testDef.unit}`,
                normalRange: testDef.normalRange,
                status: status,
                notes: formData.labNotes || null,
                testDate: new Date().toISOString()
              })
            })
          );
        }
      });

      await Promise.all(labPromises);

      // Send alert if abnormal results found
      if (hasAbnormal) {
        await fetch('/api/alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: abnormalTests.some(t => t.includes('CRITICAL')) ? 'CRITICAL' : 'WARNING',
            message: `Hasil lab abnormal untuk ${patient.name} (${patient.mrNumber}):\n\n${abnormalTests.join('\n')}`,
            patientId: patient.id,
            category: 'LAB_RESULT',
            priority: abnormalTests.some(t => t.includes('CRITICAL')) ? 'URGENT' : 'HIGH',
            targetRole: 'DOKTER_SPESIALIS'
          })
        });
      }

      alert(
        `Pemeriksaan laboratorium berhasil disimpan!${labPromises.length > 0 ? `\n${labPromises.length} hasil lab tersimpan.` : ''
        }${hasAbnormal ? '\nAda hasil abnormal, notifikasi telah dikirim ke dokter.' : ''}`
      );

      onComplete();
      onClose();
    } catch (error) {
      console.error('Error saving lab examination:', error);
      alert('Gagal menyimpan pemeriksaan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleLabTestChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      labTests: {
        ...prev.labTests,
        [key]: value
      }
    }));
  };

  const groupedTests: Record<string, string[]> = {
    'Gula Darah': ['gulaDarahSewaktu', 'gulaDarahPuasa', 'glukosa2JamPP', 'hba1c'],
    'Lipid': ['cholesterol', 'ldl', 'hdl', 'trigliseride'],
    'Fungsi Ginjal': ['urea', 'creatinine'],
    'Protein': ['albumin'],
    'Fungsi Hati': ['sgot', 'sgpt'],
    'Darah Lengkap': ['hemoglobin', 'leukosit']
  };

  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto my-4">
        <div className="px-6 py-4 border-b border-gray-200 bg-linear-to-r from-green-50 to-purple-50 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Microscope className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Pemeriksaan Laboratorium</h3>
                <p className="text-sm text-gray-600">{patient.name} - RM: {patient.mrNumber}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50 p-1"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Patient Info - Read Only */}
            <div className="bg-white border border-green-300 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <TestTube className="h-5 w-5 text-green-600 mt-1" />
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">RM:</span>{' '}
                    <span className="font-semibold text-gray-900">{patient.mrNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Nama:</span>{' '}
                    <span className="font-semibold text-gray-900">{patient.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Umur:</span>{' '}
                    <span className="font-semibold text-gray-900">{calculateAge(patient.birthDate)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Penjamin:</span>{' '}
                    <span className="font-semibold text-gray-900">{patient.insuranceType}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Patient Medical Data - Read Only */}
            <div className="border border-green-300 rounded-lg p-4 bg-white">
              <div className="border-b border-gray-300 mb-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <TestTube className="h-5 w-5 text-green-600" />
                  <span>Data Medis Pasien (Informasi)</span>
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Tinggi Badan</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {patient.height ? `${patient.height} cm` : '-'}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Berat Badan</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {patient.weight ? `${patient.weight} kg` : '-'}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">BMI</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {patient.bmi || '-'}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Status Merokok</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {patient.smokingStatus === 'PEROKOK' ? 'Perokok' :
                      patient.smokingStatus === 'MANTAN_PEROKOK' ? 'Mantan Perokok' : 
                      'Tidak Merokok'}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Diabetes</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {patient.diabetesType || 'Tidak ada'}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 md:col-span-2 lg:col-span-3">
                  <p className="text-xs text-gray-600 mb-1">Alergi</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {patient.allergies && patient.allergies.length > 0
                      ? patient.allergies.join(', ')
                      : 'Tidak ada'}
                  </p>
                </div>
              </div>
            </div>

            {/* Existing Complaints - Read Only */}
            {existingComplaints.length > 0 && (
              <div className="border border-green-300 rounded-lg p-4 bg-green-50">
                <div className="border-b border-gray-300 mb-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-green-600" />
                    <span>Keluhan Pasien (Informasi)</span>
                  </h4>
                </div>

                <div className="space-y-3">
                  {loadingComplaints ? (
                    <p className="text-sm text-gray-500">Memuat keluhan...</p>
                  ) : (
                    existingComplaints.slice(0, 3).map(complaint => (
                      <div key={complaint.id} className="bg-white border border-green-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500">
                            {new Date(complaint.createdAt).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {complaint.metadata?.severity && (
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              complaint.metadata.severity === 'BERAT' ? 'bg-red-100 text-red-800' :
                              complaint.metadata.severity === 'SEDANG' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {complaint.metadata.severity}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-900">{complaint.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Vital Signs - Editable */}
            <div className="border border-green-300 rounded-lg p-4 bg-white">
              <div className="border-b border-gray-300 mb-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-green-600" />
                  <span>1. Vital Signs</span>
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tekanan Darah (mmHg)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="120"
                      value={formData.bloodPressureSystolic}
                      onChange={(e) => setFormData(prev => ({ ...prev, bloodPressureSystolic: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900"
                      min="60"
                      max="250"
                      disabled={loading}
                    />
                    <span className="text-gray-500 font-bold">/</span>
                    <input
                      type="number"
                      placeholder="80"
                      value={formData.bloodPressureDiastolic}
                      onChange={(e) => setFormData(prev => ({ ...prev, bloodPressureDiastolic: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900"
                      min="40"
                      max="150"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Denyut Nadi (bpm)
                  </label>
                  <input
                    type="number"
                    value={formData.heartRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, heartRate: e.target.value }))}
                    placeholder="80"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900"
                    min="40"
                    max="200"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Suhu Tubuh (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => setFormData(prev => ({ ...prev, temperature: e.target.value }))}
                    placeholder="36.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900"
                    min="35"
                    max="42"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Laju Respirasi
                  </label>
                  <input
                    type="number"
                    value={formData.respiratoryRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, respiratoryRate: e.target.value }))}
                    placeholder="20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900"
                    min="10"
                    max="60"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">per menit (12-20)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Saturasi O₂ (%)
                  </label>
                  <input
                    type="number"
                    value={formData.oxygenSaturation}
                    onChange={(e) => setFormData(prev => ({ ...prev, oxygenSaturation: e.target.value }))}
                    placeholder="98"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900"
                    min="70"
                    max="100"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">&gt;95%</p>
                </div>
              </div>
            </div>

            {/* Lab Tests - Main Section */}
            <div className="border border-green-300 rounded-lg p-4 bg-white">
              <div className="border-b border-gray-300 mb-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <FlaskConical className="h-5 w-5 text-green-600" />
                  <span>2. Pemeriksaan Laboratorium</span>
                </h4>
              </div>

              {Object.entries(groupedTests).map(([category, tests]) => (
                <div key={category}>
                  <h5 className="font-medium text-gray-900 mb-2 mt-4 pb-2 border-b border-gray-200">
                    {category}
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tests.map(testKey => {
                      const testDef = labTestDefinitions[testKey];
                      return (
                        <div key={testKey}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {testDef.name}
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              step="0.01"
                              value={formData.labTests[testKey as keyof typeof formData.labTests]}
                              onChange={(e) => handleLabTestChange(testKey, e.target.value)}
                              placeholder={testDef.normalRange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 mb-4"
                              disabled={loading}
                            />
                            <span className="text-xs text-gray-500 whitespace-nowrap">{testDef.unit}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">Normal: {testDef.normalRange}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {errors.labTests && (
                <p className="mt-2 text-sm text-red-600">{errors.labTests}</p>
              )}

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan Laboratorium
                </label>
                <textarea
                  value={formData.labNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, labNotes: e.target.value }))}
                  placeholder="Catatan tambahan tentang pemeriksaan lab..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900"
                  disabled={loading}
                />
              </div>

              <div className="bg-green-50 p-3 rounded border border-green-300 flex items-start space-x-2 mt-4">
                <AlertCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700">
                  <strong>Info:</strong> Jika hasil abnormal terdeteksi, sistem akan otomatis membuat notifikasi untuk dokter.
                </p>
              </div>
            </div>

            {/* SEAR B Risk Calculation */}
            <div className="border border-green-300 rounded-lg p-4 bg-white">
              <div className="border-b border-gray-300 mb-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  <span>3. Prediksi Risiko Kardiovaskular (SEAR B WHO)</span>
                </h4>
              </div>

              <div className="p-3 space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="bg-green-50 border border-green-200 rounded p-2">
                    <p className="text-xs text-gray-600">Umur</p>
                    <p className="text-lg font-bold text-green-700">{calculateAge(patient.birthDate)} tahun</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded p-2">
                    <p className="text-xs text-gray-600">Gender</p>
                    <p className="text-lg font-bold text-purple-700">{patient.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}</p>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded p-2">
                    <p className="text-xs text-gray-600">Status Merokok</p>
                    <p className="text-lg font-bold text-orange-700">
                      {patient.smokingStatus === 'PEROKOK' ? 'Ya' : 'Tidak'}
                    </p>
                  </div>
                  <div className="bg-pink-50 border border-pink-200 rounded p-2">
                    <p className="text-xs text-gray-600">Diabetes</p>
                    <p className="text-lg font-bold text-pink-700">{patient.diabetesType ? 'Ya' : 'Tidak'}</p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded p-2">
                    <p className="text-xs text-gray-600">TD Sistolik</p>
                    <p className="text-lg font-bold text-red-700">
                      {formData.bloodPressureSystolic || '-'} mmHg
                    </p>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-200 rounded p-2">
                    <p className="text-xs text-gray-600">Kolesterol</p>
                    {formData.labTests.cholesterol ? (
                      <p className="text-sm font-bold text-indigo-700">
                        {convertCholesterolToMmol(parseFloat(formData.labTests.cholesterol))} mmol/L
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400">Belum diisi</p>
                    )}
                  </div>
                </div>

                {searBResult ? (
                  <div className={`rounded-lg border-2 p-4 ${searBResult.color}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-medium mb-1">Risiko Kardiovaskular 10 Tahun</h5>
                        <p className="text-3xl font-bold">{searBResult.range}</p>
                        <p className="text-lg font-semibold mt-1">Level: {searBResult.level}</p>
                      </div>
                      <div className="text-right">
                        <TrendingUp className="h-12 w-12 opacity-50 mb-2" />
                        <p className="text-xs">Perkiraan risiko serangan jantung atau stroke dalam 10 tahun ke depan</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                    <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {calculateAge(patient.birthDate) < 40
                        ? 'SEAR B hanya untuk pasien usia ≥40 tahun'
                        : 'Lengkapi data Tekanan Darah Sistolik dan Kolesterol Total untuk melihat prediksi risiko'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-900 bg-white hover:bg-gray-50 transition-colors font-medium"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Simpan Hasil Lab</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-3">
            * Minimal satu pemeriksaan lab harus diisi
          </p>
        </form>
      </div>
    </div>
  );
};

export default LabPatientExaminationForm;
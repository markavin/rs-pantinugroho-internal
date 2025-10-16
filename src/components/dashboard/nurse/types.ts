// src/components/dashboard/nurse/types.ts

export interface Patient {
    id: string;
    mrNumber: string;
    name: string;
}

export interface Visitation {
    id: string;
    patientId: string;
    patient: {
        name: string;
        mrNumber: string;
    };
    nurse: {
        name: string;
    };
    shift: 'PAGI' | 'SORE' | 'MALAM';
    vitalSigns: any;
    medicationsGiven: string[];
    education?: string;
    complications?: string;
    notes?: string;
    dietCompliance?: number | null;
    dietIssues?: string | null; 
    createdAt: string;
}
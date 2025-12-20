"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Patient } from "@/lib/types";

type PatientSelectorProps = {
  patients: Patient[];
  selectedPatientId: string | undefined;
  onSelectPatient: (patientId: string) => void;
};

export default function PatientSelector({
  patients,
  selectedPatientId,
  onSelectPatient,
}: PatientSelectorProps) {
  return (
    <Select value={selectedPatientId} onValueChange={onSelectPatient}>
      <SelectTrigger className="w-full md:w-[280px]">
        <SelectValue placeholder="Select a patient" />
      </SelectTrigger>
      <SelectContent>
        {patients.map((patient) => (
          <SelectItem key={patient.id} value={patient.id}>
            <div className="flex items-center gap-3">
              <Avatar className="h-6 w-6">
                <AvatarImage src={patient.avatarUrl} alt={patient.name} />
                <AvatarFallback>
                  {patient.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{patient.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

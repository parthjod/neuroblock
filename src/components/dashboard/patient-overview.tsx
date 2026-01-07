"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
import type { Patient, SessionWithRelations } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import PatientSelector from "./patient-selector";
import ProgressChart from "./progress-chart";
import SessionHistory from "./session-history";
import SessionModal from "../rehab/session-modal";

export default function PatientOverview() {
  const { data: session } = useSession();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>(undefined);
  const [isSessionModalOpen, setSessionModalOpen] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/neurologist/${session.user.id}/patients`)
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setPatients(data);
            setSelectedPatientId(data.find((p: Patient) => p.hasPermission)?.id || data[0]?.id)
          }
        });
    }
  }, [session]);

const selectedPatient = useMemo(
    () => patients.find((p) => p.id === selectedPatientId),
    [patients, selectedPatientId]
  );
  
const handleSessionCreated = async (newSession: SessionWithRelations) => {
    // Refresh patients list to get updated data
    if (session?.user?.id) {
      const data = await fetch(`/api/neurologist/${session.user.id}/patients`);
      const patientsData = await data.json();
      if (patientsData) {
        setPatients(patientsData);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Patient Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor patient progress and manage rehabilitation sessions.
          </p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <PatientSelector
            patients={patients}
            selectedPatientId={selectedPatientId}
            onSelectPatient={setSelectedPatientId}
          />
          <Button
            onClick={() => setSessionModalOpen(true)}
            disabled={!selectedPatient?.hasPermission}
            className="w-full md:w-auto"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Session
          </Button>
        </div>
      </div>

{selectedPatient ? (
        selectedPatient.hasPermission ? (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recovery Trend Score (RTS)</CardTitle>
                <CardDescription>
                  Progress timeline for {selectedPatient.name}. RTS ↑ indicates improving motor control.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProgressChart sessions={selectedPatient.sessions} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Session History</CardTitle>
                <CardDescription>
                  Detailed log of all rehabilitation sessions for {selectedPatient.name}.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SessionHistory patient={selectedPatient} />
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center py-20">
            <CardHeader className="text-center">
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                {selectedPatient.name} has not granted permission to view their data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Patient must grant access through their portal.
              </p>
            </CardContent>
          </Card>
        )
      ) : (
        <Card className="flex items-center justify-center py-20">
          <CardHeader className="text-center">
            <CardTitle>No Patient Selected</CardTitle>
            <CardDescription>
              Please select a patient to view their dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
      {isSessionModalOpen && selectedPatient && (
         <SessionModal
            patient={selectedPatient}
            isOpen={isSessionModalOpen}
            onClose={() => setSessionModalOpen(false)}
            onSessionCreated={handleSessionCreated}
         />
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PatientWithNeurologists } from '@/lib/types';
import { Neurologist } from '@prisma/client';

export default function PatientPortal() {
  const { data: session } = useSession();
  const [patient, setPatient] = useState<PatientWithNeurologists | null>(null);
  const [neurologists, setNeurologists] = useState<Neurologist[]>([]);
  const [selectedNeurologists, setSelectedNeurologists] = useState<string[]>(
    []
  );
  const [details, setDetails] = useState('');
  const [visibility, setVisibility] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      // Fetch patient data
      fetch(`/api/patient/${session.user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.neurologists) {
            setPatient(data);
            setDetails(data.details || '');
            setVisibility(data.visibility);
            setSelectedNeurologists(data.neurologists.map((n: any) => n.neurologistId));
          }
        });

      // Fetch neurologists
      fetch('/api/neurologists')
        .then((res) => res.json())
        .then(setNeurologists);
    }
  }, [session]);

  const handleSave = async () => {
    if (session?.user?.id) {
      await fetch(`/api/patient/${session.user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          details,
          visibility,
          neurologistIds: selectedNeurologists,
        }),
      });
    }
  };

  const handleNeurologistSelection = (neurologistId: string) => {
    setSelectedNeurologists((prev) =>
      prev.includes(neurologistId)
        ? prev.filter((id) => id !== neurologistId)
        : [...prev, neurologistId]
    );
  };

  if (!patient) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Patient Portal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="details">Your Details</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Enter your medical and personal information here."
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="visibility"
              checked={visibility}
              onCheckedChange={setVisibility}
            />
            <Label htmlFor="visibility">Data Visible to Neurologists</Label>
          </div>
          <div className="space-y-2">
            <Label>Select Your Neurologists</Label>
            <div className="space-y-2">
              {neurologists.map((neurologist) => (
                <div key={neurologist.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={neurologist.id}
                    checked={selectedNeurologists.includes(neurologist.id)}
                    onChange={() => handleNeurologistSelection(neurologist.id)}
                  />
                  <Label htmlFor={neurologist.id}>
                    {neurologist.profileInfo || `Neurologist ${neurologist.id}`}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <Button onClick={handleSave}>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}

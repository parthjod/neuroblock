"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export function useFormattedDate(dateString: string, formatString: string) {
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    // This ensures the date is formatted only on the client, after hydration.
    setFormattedDate(format(new Date(dateString), formatString));
  }, [dateString, formatString]);

  return formattedDate;
}

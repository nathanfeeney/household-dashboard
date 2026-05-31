'use client';

import { useEffect, useState } from 'react';

export default function DateTime() {
  const [dateTime, setDateTime] = useState<string>('');

  useEffect(() => {
    const fmt = () =>
      new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
    setDateTime(fmt());
    const interval = setInterval(() => setDateTime(fmt()), 60000);
    return () => clearInterval(interval);
  }, []);

  return <div className="dashboard-datetime">{dateTime}</div>;
}

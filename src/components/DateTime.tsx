'use client';

import { useEffect, useState } from 'react';

export default function DateTime() {
    const [dateTime, setDateTime] = useState<string>('');

    useEffect(() => {
        setDateTime(new Date().toLocaleString());
        const interval = setInterval(() => {
            setDateTime(new Date().toLocaleString());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return <div>{dateTime}</div>;
}
'use client';
import Link from 'next/link';

export default function FinancePage() {
    const sections = [
        { name: 'Savings', href: '/dashboard/savings' },
        { name: 'Spending', href: '/dashboard/spending' },
        { name: 'Bills', href: '/dashboard/bills' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-800 mb-8">Finance Dashboard</h1>
                
                <nav className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {sections.map((section) => (
                        <Link
                            key={section.href}
                            href={section.href}
                            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                        >
                            <div className="text-xl font-semibold text-indigo-600 hover:text-indigo-800">
                                {section.name}
                            </div>
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    );
}
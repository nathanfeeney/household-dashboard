'use client';

function getGreeting() {
    const hour = new Date().getHours();

    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
}

export default function WelcomeMessage({ user = 'User' }) {
    const greeting = getGreeting();

    return (
        <div className="flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-white mb-4">
                    {greeting}, {user}
                </h1>
            </div>
        </div>
    );
}
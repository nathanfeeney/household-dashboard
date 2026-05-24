import React from 'react';

export const DashboardGrid: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold mb-2">Widget 1</h3>
                <p className="text-gray-600">Content here</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold mb-2">Widget 2</h3>
                <p className="text-gray-600">Content here</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold mb-2">Widget 3</h3>
                <p className="text-gray-600">Content here</p>
            </div>
        </div>
    );
};
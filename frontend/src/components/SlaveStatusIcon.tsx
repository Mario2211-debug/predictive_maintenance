// SlaveStatusIcon.tsx
import React from 'react';

interface SlaveStatusIconProps {
    isActive: boolean;
}

const SlaveStatusIcon: React.FC<SlaveStatusIconProps> = ({ isActive }) => {
    return (
        <div className={`w-4 h-4 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-500'}`} />
    );
};

export default SlaveStatusIcon;

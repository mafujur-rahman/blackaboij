"use client"
import DashboardHome from '@/components/dashboard/DashboardHome';
import useAuthRedirect from '@/components/hooks/useAuthRedirect';
import React from 'react';

const DashboardPage = () => {
    // Only admin can access
    useAuthRedirect("ADMIN");
    return (
        <div>
            <DashboardHome />
        </div>
    );
};

export default DashboardPage;
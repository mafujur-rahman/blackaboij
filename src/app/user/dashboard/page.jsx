"use client"
import useAuthRedirect from '@/components/hooks/useAuthRedirect';
import UserDashboardHome from '@/components/user-dashboard/UserDashboardHome';
import React from 'react';

const UserDashboardPage = () => {
    // Only customer can access
    useAuthRedirect("CUSTOMER");
    return (
        <div>
            <UserDashboardHome />
        </div>
    );
};

export default UserDashboardPage;
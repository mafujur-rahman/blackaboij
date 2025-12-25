"use client"; // keep this

import SearchHome from '@/components/search/Search';
import React from 'react';

// Force Next.js to treat this page as fully dynamic (CSR)
export const dynamic = 'force-dynamic';

const SearchPage = () => {
    return (
        <div>
            <SearchHome />
        </div>
    );
};

export default SearchPage;

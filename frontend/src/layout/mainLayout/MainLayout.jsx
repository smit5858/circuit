import React, { memo } from 'react'
import Sidebar from '../sidebar/sidebar'

const MainLayout = memo(({ children }) => {
  return (
    <div className='flex'>
        <div className="sidebar">
            <Sidebar />
        </div>
        <main className='flex-1'>
            {children}
        </main>
    </div>
  );
});

export default MainLayout
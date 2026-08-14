import React, { memo } from 'react'
import Sidebar from '../sidebar/sidebar'
import { ModuleSelectionProvider } from '../../context/ModuleSelectionContext'

const MainLayout = memo(({ children }) => {
  return (
    <ModuleSelectionProvider>
      <div className='flex flex-col md:flex-row'>
        <div className="sidebar">
          <Sidebar />
        </div>
        <main className='flex-1'>
          {children}
        </main>
      </div>
    </ModuleSelectionProvider>
  );
});

export default MainLayout
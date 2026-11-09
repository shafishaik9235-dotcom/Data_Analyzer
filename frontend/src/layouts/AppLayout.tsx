import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { TopNav } from './TopNav';
import { ToastContainer } from '../components/common/ToastContainer';
import { Modal } from '../components/common/Modal';
import { UploadDropzone } from '../features/datasets/UploadDropzone';

export const AppLayout: React.FC = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col">
      <ToastContainer />

      {/* Top Navbar with All Navigation Options */}
      <TopNav onOpenUpload={() => setIsUploadModalOpen(true)} />

      {/* Full-Width Main Content Workspace */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <Outlet />
      </main>

      {/* Global Quick Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Dataset"
        description="Add a new CSV or Excel spreadsheet to your Data_Analyzer workspace."
        maxWidth="lg"
      >
        <UploadDropzone onSuccess={() => setIsUploadModalOpen(false)} />
      </Modal>
    </div>
  );
};

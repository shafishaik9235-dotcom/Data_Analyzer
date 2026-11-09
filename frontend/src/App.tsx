import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './layouts/AppLayout';
import { OverviewPage } from './pages/OverviewPage';
import { DatasetsPage } from './pages/DatasetsPage';
import { ExplorerPage } from './pages/ExplorerPage';
import { CleaningWorkbenchPage } from './pages/CleaningWorkbenchPage';
import { VisualizationBuilderPage } from './pages/VisualizationBuilderPage';
import { AIAnalystPage } from './pages/AIAnalystPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="overview" element={<Navigate to="/" replace />} />
            <Route path="dashboard" element={<Navigate to="/" replace />} />
            <Route path="datasets" element={<DatasetsPage />} />
            <Route path="explorer" element={<ExplorerPage />} />
            <Route path="cleaning" element={<CleaningWorkbenchPage />} />
            <Route path="visualizations" element={<VisualizationBuilderPage />} />
            <Route path="ai-analyst" element={<AIAnalystPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;

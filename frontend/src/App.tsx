import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { MainLayout } from './layouts/MainLayout';

// Module Pages
import { DashboardPage } from './modules/dashboard/DashboardPage';
import { SuppliersPage } from './modules/suppliers/SuppliersPage';
import { AllInventoryPage } from './modules/inventory/AllInventoryPage';
import { HotelsPage } from './modules/hotels/HotelsPage';
import { SightseeingPage } from './modules/sightseeing/SightseeingPage';
import { DuplicateDetectionPage } from './modules/matching/DuplicateDetectionPage';
import { RoomMappingPage } from './modules/matching/RoomMappingPage';
import { ExperienceMatchingPage } from './modules/matching/ExperienceMatchingPage';
import { HotelComparisonPage } from './modules/comparison/HotelComparisonPage';
import { SightseeingComparisonPage } from './modules/comparison/SightseeingComparisonPage';
import { SmartRankingPage } from './modules/ranking/SmartRankingPage';
import { SupplierAnalyticsPage } from './modules/analytics/SupplierAnalyticsPage';
import { AIInsightsPage } from './modules/insights/AIInsightsPage';
import { VerificationCenterPage } from './modules/verification/VerificationCenterPage';
import { ProcessingHistoryPage } from './modules/history/ProcessingHistoryPage';
import { SettingsPage } from './modules/settings/SettingsPage';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="overview" element={<Navigate to="/" replace />} />
            
            {/* Suppliers */}
            <Route path="suppliers" element={<SuppliersPage />} />

            {/* Inventory */}
            <Route path="inventory/all" element={<AllInventoryPage />} />
            <Route path="inventory/hotels" element={<HotelsPage />} />
            <Route path="inventory/sightseeing" element={<SightseeingPage />} />

            {/* AI Intelligence */}
            <Route path="ai/duplicates" element={<DuplicateDetectionPage />} />
            <Route path="ai/product-matching" element={<DuplicateDetectionPage />} />
            <Route path="ai/room-mapping" element={<RoomMappingPage />} />
            <Route path="ai/experience-matching" element={<ExperienceMatchingPage />} />

            {/* Optimization */}
            <Route path="optimization/hotel-comparison" element={<HotelComparisonPage />} />
            <Route path="optimization/sightseeing-comparison" element={<SightseeingComparisonPage />} />
            <Route path="optimization/smart-ranking" element={<SmartRankingPage />} />

            {/* Analytics & Insights */}
            <Route path="analytics/suppliers" element={<SupplierAnalyticsPage />} />
            <Route path="insights" element={<AIInsightsPage />} />
            <Route path="verification" element={<VerificationCenterPage />} />
            <Route path="history" element={<ProcessingHistoryPage />} />
            <Route path="settings" element={<SettingsPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;

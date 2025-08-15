import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "./Dashboard";

const Index = () => {
  return (
    <ProtectedRoute>
      <MainLayout>
        <Dashboard />
      </MainLayout>
    </ProtectedRoute>
  );
};

export default Index;

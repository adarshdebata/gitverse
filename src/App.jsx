import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import HomePage from "@/pages/HomePage";
import FundamentalsPage from "@/pages/FundamentalsPage";
import InternalsPage from "@/pages/InternalsPage";
import CommandsPage from "@/pages/CommandsPage";
import CommandDetailPage from "@/pages/CommandDetailPage";
import PlaygroundPage from "@/pages/PlaygroundPage";
import VisualizersPage from "@/pages/VisualizersPage";
import WorkflowsPage from "@/pages/WorkflowsPage";
import RecoveryPage from "@/pages/RecoveryPage";
import ComparePage from "@/pages/ComparePage";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/fundamentals" element={<FundamentalsPage />} />
        <Route path="/internals" element={<InternalsPage />} />
        <Route path="/commands" element={<CommandsPage />} />
        <Route path="/commands/:id" element={<CommandDetailPage />} />
        <Route path="/playground" element={<PlaygroundPage />} />
        <Route path="/visualizers" element={<VisualizersPage />} />
        <Route path="/workflows" element={<WorkflowsPage />} />
        <Route path="/recovery" element={<RecoveryPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

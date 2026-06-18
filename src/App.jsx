import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Layout from "./pages/Layout";
import { Toaster } from "react-hot-toast";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Team from "./pages/Team";
import ProjectDetails from "./pages/ProjectDetails";
import TaskDetails from "./pages/TaskDetails";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Backlog from "./pages/Backlog";
import CalendarPage from "./pages/CalendarPage";
import SearchPage from "./pages/SearchPage";
import AdminPage from "./pages/AdminPage";
import AIAssistant from "./pages/AIAssistant";
import NotificationsPage from "./pages/NotificationsPage";
import ErrorBoundary from "./components/ErrorBoundary";
const App = () => {
  const {
    user
  } = useSelector(state => state.auth);
  if (!user) {
    return <>         <Toaster />         <Routes>           <Route path="/login" element={<Login />} />           <Route path="*" element={<Navigate to="/login" replace />} />         </Routes>       </>;
  }
  return <ErrorBoundary>       <Toaster />       <Routes>         <Route path="/" element={<Layout />}>           <Route index element={<Dashboard />} />           <Route path="team" element={<Team />} />           <Route path="projects" element={<Projects />} />           <Route path="projectsDetail" element={<ProjectDetails />} />           <Route path="taskDetails" element={<TaskDetails />} />           <Route path="settings" element={<Settings />} />           <Route path="backlog" element={<Backlog />} />           <Route path="calendar" element={<CalendarPage />} />           <Route path="search" element={<SearchPage />} />           <Route path="admin" element={<AdminPage />} />           <Route path="ai" element={<AIAssistant />} />           <Route path="notifications" element={<NotificationsPage />} />         </Route>         <Route path="/login" element={<Navigate to="/" replace />} />       </Routes>     </ErrorBoundary>;
};
export default App;
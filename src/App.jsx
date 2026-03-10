
import React, { useState } from "react";
import { useAuth } from "./context/AuthContext";
import Login from "./Login";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./pages/Dashboard";
import AddItem from "./pages/AddItem";
import Movement from "./pages/Movement";
import Inventory from "./pages/Inventory";
import Configuration from "./pages/Configuration";

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { isAuthenticated, loading } = useAuth();
  const [currentView, setCurrentView] = useState("dashboard");


  const handleItemSaved = () => {
    setRefreshTrigger((t) => t + 1);
 
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F9FAFB]">
        <div className="w-8 h-8 border-4 border-[#E47926] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Login />;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F9FAFB] font-sans">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />
      <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-[#FCFAF8]">
        <Topbar
          onNavigate={setCurrentView}
          title={
            currentView === "dashboard"
              ? "Dashboard Overview"
              : currentView === "add-item"
                ? "Add New Item"
                : currentView === "movement"
                  ? "Stock Movement"
                  : currentView === "inventory"
                    ? "Inventory"
                    : currentView === "configuration"
                      ? "Configuration"
                      : ""
          }
        />
        {currentView === "dashboard" && (
          <Dashboard refreshTrigger={refreshTrigger} onNavigate={setCurrentView} />
        )}
        {currentView === "add-item" && (
          // ✅ Pass onItemSaved so AddItem can trigger dashboard refresh
          <AddItem onItemSaved={handleItemSaved} />
        )}
        {currentView === "movement" && (
          <Movement onMovementSaved={handleItemSaved} />
        )}
        {currentView === "inventory" && <Inventory />}
        {currentView === "configuration" && <Configuration />}
      </div>
    </div>
  );
}

export default App;
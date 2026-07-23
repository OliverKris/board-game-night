import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthPage } from "./pages/Auth";
import { Dashboard } from "./pages/Dashboard";
import { LandingPage } from "./pages/Landing";
import { OnboardingPage } from "./pages/Onboarding";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route
                    path="/register"
                    element={<Navigate to="/login?mode=signup" replace />}
                />

                {/* Protected Routes */}
                <Route
                    path="/onboarding"
                    element={
                        <ProtectedRoute>
                            <OnboardingPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Fallback  */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

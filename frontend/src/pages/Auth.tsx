// frontend/src/pages/Auth.tsx
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../api/client";

export const AuthPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const isSignUp = searchParams.get("mode") === "signup";

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const toggleMode = (mode: "login" | "signup") => {
        setError(null);
        if (mode === "signup") {
            setSearchParams({ mode: "signup" });
        } else {
            setSearchParams({});
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            let response;

            if (isSignUp) {
                response = await api.post("/auth/register", {
                    name,
                    email,
                    password,
                });
            } else {
                const params = new URLSearchParams();
                params.append("username", email);
                params.append("password", password);

                response = await api.post("/auth/login", params, {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                });
            }

            const token = response.data?.access_token;
            if (!token) {
                throw new Error("No access token received from server.");
            }

            localStorage.setItem("access_token", token);

            if (isSignUp) {
                localStorage.removeItem("onboarding_complete");
                navigate("/onboarding");
            } else {
                navigate("/dashboard");
            }
        } catch (err: any) {
            console.error("Auth error:", err);
            if (err.code === "ECONNABORTED") {
                setError(
                    "Server request timed out. Please check if the backend is running.",
                );
            } else if (err.response?.data?.detail) {
                const detail = err.response.data.detail;
                setError(
                    Array.isArray(detail)
                        ? detail.map((e: any) => e.msg).join(", ")
                        : detail,
                );
            } else {
                setError(
                    err.message || "An error occurred during authentication.",
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 font-sans text-slate-100 relative overflow-hidden">
            {/* Background Glow Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

            {/* Main Card Container */}
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="max-w-md w-full bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/80 p-8 relative z-10"
            >
                {/* Brand Header */}
                <div className="flex flex-col items-center mb-8">
                    <motion.div
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-indigo-500/30 mb-3 cursor-pointer"
                    >
                        M
                    </motion.div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                        MeepleUp
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Your tabletop game night workspace
                    </p>
                </div>

                {/* Sliding Tab Switcher */}
                <div className="grid grid-cols-2 p-1 bg-slate-900/80 rounded-xl mb-6 border border-slate-700/50 relative">
                    <button
                        type="button"
                        onClick={() => toggleMode("login")}
                        className={`py-2 text-sm font-semibold rounded-lg transition-colors duration-200 relative z-10 ${
                            !isSignUp
                                ? "text-white"
                                : "text-slate-400 hover:text-slate-200"
                        }`}
                    >
                        Sign In
                        {!isSignUp && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-indigo-600 rounded-lg -z-10 shadow-md"
                                transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 30,
                                }}
                            />
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => toggleMode("signup")}
                        className={`py-2 text-sm font-semibold rounded-lg transition-colors duration-200 relative z-10 ${
                            isSignUp
                                ? "text-white"
                                : "text-slate-400 hover:text-slate-200"
                        }`}
                    >
                        Create Account
                        {isSignUp && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-indigo-600 rounded-lg -z-10 shadow-md"
                                transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 30,
                                }}
                            />
                        )}
                    </button>
                </div>

                {/* Error Feedback */}
                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg mb-6 overflow-hidden"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Form Fields */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <AnimatePresence mode="wait" initial={false}>
                        {isSignUp ? (
                            <motion.div
                                key="signup-fields"
                                initial={{ opacity: 0, x: -15 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 15 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-4"
                            >
                                <div>
                                    <label
                                        htmlFor="signup-name"
                                        className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
                                    >
                                        Full Name
                                    </label>
                                    <input
                                        id="signup-name"
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        placeholder="Jane Doe"
                                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="signup-email"
                                        className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
                                    >
                                        Email Address
                                    </label>
                                    <input
                                        id="signup-email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        placeholder="gamer@example.com"
                                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="signup-password"
                                        className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
                                    >
                                        Password
                                    </label>
                                    <input
                                        id="signup-password"
                                        type="password"
                                        required
                                        minLength={6}
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        placeholder="••••••••"
                                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                                    />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="login-fields"
                                initial={{ opacity: 0, x: 15 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -15 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-4"
                            >
                                <div>
                                    <label
                                        htmlFor="login-email"
                                        className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
                                    >
                                        Email Address
                                    </label>
                                    <input
                                        id="login-email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        placeholder="gamer@example.com"
                                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="login-password"
                                        className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
                                    >
                                        Password
                                    </label>
                                    <input
                                        id="login-password"
                                        type="password"
                                        required
                                        minLength={6}
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        placeholder="••••••••"
                                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Submit Button */}
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition duration-200 disabled:opacity-50"
                    >
                        {loading
                            ? isSignUp
                                ? "Creating Account..."
                                : "Signing In..."
                            : isSignUp
                              ? "Get Started"
                              : "Sign In"}
                    </motion.button>
                </form>

                {/* Footer Toggle */}
                <div className="text-center mt-6 text-sm text-slate-400">
                    {isSignUp ? (
                        <p>
                            Already have an account?{" "}
                            <button
                                type="button"
                                onClick={() => toggleMode("login")}
                                className="text-indigo-400 font-medium hover:underline"
                            >
                                Sign In
                            </button>
                        </p>
                    ) : (
                        <p>
                            Don't have an account yet?{" "}
                            <button
                                type="button"
                                onClick={() => toggleMode("signup")}
                                className="text-indigo-400 font-medium hover:underline"
                            >
                                Create one now
                            </button>
                        </p>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

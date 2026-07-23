// frontend/src/pages/Landing.tsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const isAuthenticated = Boolean(localStorage.getItem("access_token"));

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
            {/* Navigation Header */}
            <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-indigo-500/30">
                            M
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">
                            MeepleUp
                        </span>
                    </div>

                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md transition duration-200"
                            >
                                Go to Dashboard →
                            </button>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/login?mode=signup"
                                    className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md transition duration-200"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1">
                <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
                    {/* Subtle Ambient Background Gradients */}
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
                        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-6">
                            <span>🎲 Board Game Night, Simplified</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
                            Find players. Host matches.{" "}
                            <br className="hidden sm:inline" />
                            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Play more board games.
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Organize game nights with your friends, match by
                            collection or player count, and track your favorite
                            tabletop sessions in one unified workspace.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() =>
                                    navigate(
                                        isAuthenticated
                                            ? "/dashboard"
                                            : "/login",
                                    )
                                }
                                className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition duration-200"
                            >
                                {isAuthenticated
                                    ? "Open App Dashboard"
                                    : "Start Hosting Games"}
                            </button>
                            <a
                                href="#features"
                                className="w-full sm:w-auto px-8 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold rounded-xl transition duration-200"
                            >
                                Explore Features
                            </a>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section
                    id="features"
                    className="py-20 bg-slate-950/60 border-t border-slate-800/80"
                >
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <h2 className="text-3xl font-bold text-white mb-4">
                                Everything you need for table top night
                            </h2>
                            <p className="text-slate-400">
                                Built specifically for tabletop hobbyists,
                                groups, and board game enthusiasts.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Feature 1 */}
                            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition">
                                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-2xl mb-4">
                                    📚
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">
                                    Collection Sync
                                </h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Log your board game library with player
                                    counts and details so your group always
                                    knows what's ready to play.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-2xl mb-4">
                                    🎯
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">
                                    Match Requests
                                </h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Looking to get a 4-player game of *Catan* or
                                    *Wingspan* together? Send match requests to
                                    your gaming buddies instantly.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition">
                                <div className="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center text-2xl mb-4">
                                    📅
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">
                                    Event Scheduling
                                </h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Host public or invite-only events with
                                    built-in RSVP status, capacity limits, and
                                    scheduled times.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-8 border-t border-slate-800/80 bg-slate-950 text-center text-xs text-slate-500">
                <p>
                    © {new Date().getFullYear()} MeepleUp. Built with FastAPI &
                    React.
                </p>
            </footer>
        </div>
    );
};

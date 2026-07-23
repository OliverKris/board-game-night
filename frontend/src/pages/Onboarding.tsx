// frontend/src/pages/Onboarding.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

export const OnboardingPage: React.FC = () => {
    const navigate = useNavigate();
    const [gatheringType, setGatheringType] = useState("small_group");
    const [loading, setLoading] = useState(false);

    const handleComplete = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Optional: Save preferences to backend user endpoint if available
            // await api.put('/users/me', { preferred_gathering_type: gatheringType });

            // Mark onboarding as completed in local storage/session
            localStorage.setItem("onboarding_complete", "true");
            navigate("/dashboard");
        } catch (err) {
            console.error("Failed to save preferences:", err);
            // Fallback navigation even if preference update fails
            navigate("/dashboard");
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        localStorage.setItem("onboarding_complete", "true");
        navigate("/dashboard");
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 font-sans text-slate-100">
            <div className="max-w-lg w-full bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-8">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 text-2xl mb-3">
                        🎯
                    </div>
                    <h1 className="text-2xl font-bold text-white">
                        Welcome to MeepleUp!
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Tell us a bit about your playstyle so we can personalize
                        your experience.
                    </p>
                </div>

                <form onSubmit={handleComplete} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-3">
                            How do you usually like to play?
                        </label>
                        <div className="grid grid-cols-1 gap-3">
                            {[
                                {
                                    id: "small_group",
                                    title: "Small Casual Groups",
                                    desc: "3-5 players at home or coffee shops",
                                },
                                {
                                    id: "store_event",
                                    title: "Game Store Events",
                                    desc: "Open meetups and local board game cafes",
                                },
                                {
                                    id: "large_event",
                                    title: "Large Tournaments",
                                    desc: "Competitive conventions and scheduled leagues",
                                },
                            ].map((item) => (
                                <label
                                    key={item.id}
                                    className={`flex items-start p-4 rounded-xl border cursor-pointer transition ${
                                        gatheringType === item.id
                                            ? "border-indigo-500 bg-indigo-500/10"
                                            : "border-slate-700 bg-slate-900/50 hover:border-slate-600"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="gathering_type"
                                        value={item.id}
                                        checked={gatheringType === item.id}
                                        onChange={(e) =>
                                            setGatheringType(e.target.value)
                                        }
                                        className="mt-1 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <div className="ml-3">
                                        <span className="block text-sm font-semibold text-white">
                                            {item.title}
                                        </span>
                                        <span className="block text-xs text-slate-400">
                                            {item.desc}
                                        </span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                        <button
                            type="button"
                            onClick={handleSkip}
                            className="text-sm font-medium text-slate-400 hover:text-white transition"
                        >
                            Skip for now
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Continue to Dashboard →"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

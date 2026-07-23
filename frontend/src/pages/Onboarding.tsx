// frontend/src/pages/Onboarding.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

interface Game {
    id: number;
    name: string;
    min_players: number;
    max_players: number;
}

interface Category {
    id: number;
    name: string;
}

interface Mechanic {
    id: number;
    name: string;
}

const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

const GATHERING_TYPES = [
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
];

const STEPS = [
    "Location",
    "Availability",
    "Taste",
    "Games",
    "Gathering Type",
] as const;

export const OnboardingPage: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Step 1: Location
    const [city, setCity] = useState("");

    // Step 2: Availability — selected days, each with a default evening window
    const [selectedDays, setSelectedDays] = useState<Set<number>>(new Set());

    // Step 3: Taste — categories & mechanics
    const [categories, setCategories] = useState<Category[]>([]);
    const [mechanics, setMechanics] = useState<Mechanic[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<Set<number>>(
        new Set(),
    );
    const [selectedMechanics, setSelectedMechanics] = useState<Set<number>>(
        new Set(),
    );

    // Step 4: Games — owned & wanted
    const [games, setGames] = useState<Game[]>([]);
    const [ownedGameIds, setOwnedGameIds] = useState<Set<number>>(new Set());
    const [wantedGameIds, setWantedGameIds] = useState<Set<number>>(new Set());

    // Step 5: Gathering type
    const [gatheringType, setGatheringType] = useState("small_group");

    useEffect(() => {
        // Load catalog data once, up front, so steps 3-4 aren't waiting on a
        // network round trip when the user gets there.
        const loadCatalog = async () => {
            try {
                const [categoriesRes, mechanicsRes, gamesRes] =
                    await Promise.all([
                        api.get<Category[]>("/categories"),
                        api.get<Mechanic[]>("/mechanics"),
                        api.get<Game[]>("/games"),
                    ]);
                setCategories(categoriesRes.data);
                setMechanics(mechanicsRes.data);
                setGames(gamesRes.data);
            } catch (err) {
                console.error("Failed to load catalog data:", err);
            }
        };
        loadCatalog();
    }, []);

    const toggle = (
        set: Set<number>,
        setSet: (s: Set<number>) => void,
        id: number,
    ) => {
        const next = new Set(set);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSet(next);
    };

    const toggleDay = (dayIndex: number) => {
        const next = new Set(selectedDays);
        if (next.has(dayIndex)) {
            next.delete(dayIndex);
        } else {
            next.add(dayIndex);
        }
        setSelectedDays(next);
    };

    const handleNext = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
    const handleBack = () => setStep((s) => Math.max(s - 1, 0));

    const handleSkip = () => {
        localStorage.setItem("onboarding_complete", "true");
        navigate("/dashboard");
    };

    const handleComplete = async () => {
        setSaving(true);
        setError(null);

        try {
            // Fire off everything the user selected. Individual failures (e.g.
            // one duplicate game) shouldn't block the rest, so we run these
            // independently rather than as one all-or-nothing transaction.
            const requests: Promise<unknown>[] = [];

            if (city.trim()) {
                requests.push(
                    api.patch("/users/me/location", { city: city.trim() }),
                );
            }

            requests.push(
                api.patch("/users/me/gathering-type", {
                    preferred_gathering_type: gatheringType,
                }),
            );

            selectedDays.forEach((dayIndex) => {
                requests.push(
                    api.post("/users/me/availability", {
                        day_of_week: dayIndex,
                        start_time: "18:00:00",
                        end_time: "22:00:00",
                    }),
                );
            });

            selectedCategories.forEach((categoryId) => {
                requests.push(
                    api.post(`/users/me/preferred-categories/${categoryId}`),
                );
            });

            selectedMechanics.forEach((mechanicId) => {
                requests.push(
                    api.post(`/users/me/preferred-mechanics/${mechanicId}`),
                );
            });

            ownedGameIds.forEach((gameId) => {
                requests.push(api.post(`/users/me/games/${gameId}`));
            });

            wantedGameIds.forEach((gameId) => {
                requests.push(api.post(`/users/me/wanted-games/${gameId}`));
            });

            await Promise.allSettled(requests);

            localStorage.setItem("onboarding_complete", "true");
            navigate("/dashboard");
        } catch (err) {
            console.error("Failed to save onboarding preferences:", err);
            setError(
                "Something went wrong saving your preferences. You can update these later from your profile.",
            );
        } finally {
            setSaving(false);
        }
    };

    const chipClass = (active: boolean) =>
        `px-3 py-1.5 rounded-full text-sm font-medium border cursor-pointer transition ${
            active
                ? "border-indigo-500 bg-indigo-500/10 text-indigo-300"
                : "border-slate-700 bg-slate-900/50 text-slate-300 hover:border-slate-600"
        }`;

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 font-sans text-slate-100">
            <div className="max-w-lg w-full bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-8">
                <div className="text-center mb-6">
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

                {/* Step progress */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    {STEPS.map((label, i) => (
                        <div
                            key={label}
                            className={`h-1.5 rounded-full transition-all ${
                                i === step
                                    ? "w-8 bg-indigo-500"
                                    : "w-4 bg-slate-700"
                            }`}
                            title={label}
                        />
                    ))}
                </div>

                <div className="space-y-6 min-h-[280px]">
                    {/* Step 0: Location */}
                    {step === 0 && (
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-3">
                                Where are you based?
                            </label>
                            <p className="text-xs text-slate-500 mb-3">
                                This helps us match you with people and events
                                nearby.
                            </p>
                            <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="e.g. Seattle, WA"
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    )}

                    {/* Step 1: Availability */}
                    {step === 1 && (
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-3">
                                What evenings are you usually free?
                            </label>
                            <p className="text-xs text-slate-500 mb-3">
                                We'll default these to evenings (6–10pm) — you
                                can fine-tune the times later.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {DAYS.map((day, i) => (
                                    <button
                                        type="button"
                                        key={day}
                                        onClick={() => toggleDay(i)}
                                        className={chipClass(
                                            selectedDays.has(i),
                                        )}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Taste - categories & mechanics */}
                    {step === 2 && (
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-3">
                                    What kinds of games do you like?
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map((c) => (
                                        <button
                                            type="button"
                                            key={c.id}
                                            onClick={() =>
                                                toggle(
                                                    selectedCategories,
                                                    setSelectedCategories,
                                                    c.id,
                                                )
                                            }
                                            className={chipClass(
                                                selectedCategories.has(c.id),
                                            )}
                                        >
                                            {c.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-3">
                                    Any favorite mechanics?
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {mechanics.map((m) => (
                                        <button
                                            type="button"
                                            key={m.id}
                                            onClick={() =>
                                                toggle(
                                                    selectedMechanics,
                                                    setSelectedMechanics,
                                                    m.id,
                                                )
                                            }
                                            className={chipClass(
                                                selectedMechanics.has(m.id),
                                            )}
                                        >
                                            {m.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Games - owned & wanted */}
                    {step === 3 && (
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-3">
                                    Games you own
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {games.map((g) => (
                                        <button
                                            type="button"
                                            key={g.id}
                                            onClick={() =>
                                                toggle(
                                                    ownedGameIds,
                                                    setOwnedGameIds,
                                                    g.id,
                                                )
                                            }
                                            className={chipClass(
                                                ownedGameIds.has(g.id),
                                            )}
                                        >
                                            {g.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-3">
                                    Games you want to play
                                </label>
                                <p className="text-xs text-slate-500 mb-2">
                                    Even if you don't own them — this helps us
                                    match you with hosts.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {games.map((g) => (
                                        <button
                                            type="button"
                                            key={g.id}
                                            onClick={() =>
                                                toggle(
                                                    wantedGameIds,
                                                    setWantedGameIds,
                                                    g.id,
                                                )
                                            }
                                            className={chipClass(
                                                wantedGameIds.has(g.id),
                                            )}
                                        >
                                            {g.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Gathering type */}
                    {step === 4 && (
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-3">
                                How do you usually like to play?
                            </label>
                            <div className="grid grid-cols-1 gap-3">
                                {GATHERING_TYPES.map((item) => (
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
                    )}
                </div>

                {error && <p className="text-sm text-red-400 mt-4">{error}</p>}

                <div className="flex items-center justify-between pt-6 mt-2 border-t border-slate-700">
                    <button
                        type="button"
                        onClick={handleSkip}
                        className="text-sm font-medium text-slate-400 hover:text-white transition"
                    >
                        Skip for now
                    </button>

                    <div className="flex items-center gap-3">
                        {step > 0 && (
                            <button
                                type="button"
                                onClick={handleBack}
                                className="px-4 py-2.5 text-sm font-semibold text-slate-300 hover:text-white transition"
                            >
                                ← Back
                            </button>
                        )}
                        {step < STEPS.length - 1 ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition"
                            >
                                Next →
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleComplete}
                                disabled={saving}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Finish →"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

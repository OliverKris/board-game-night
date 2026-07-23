// frontend/src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

interface Game {
    id: number;
    name: string;
    min_players: number;
    max_players: number;
    bgg_id?: number;
}

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchGames();
    }, []);

    const fetchGames = async () => {
        try {
            setLoading(true);
            setError(null);
            // Automatically uses baseURL ('/api/v1') and attaches Bearer token
            const response = await api.get<Game[]>('/games');
            setGames(response.data);
        } catch (err: any) {
            console.error('Error fetching games:', err);
            if (err.response?.status === 401) {
                // Token expired or invalid
                localStorage.removeItem('access_token');
                navigate('/login');
        } else {
            setError('Failed to load games from API.');
        }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">MeepleUp Dashboard</h1>
                    <p className="text-gray-500 text-sm">Testing Protected API Requests</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition"
                >
                    Sign Out
                </button>
                </div>

                {/* Content Zone */}
                <div className="bg-white rounded-xl shadow p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Available Games</h2>
                    <button
                    onClick={fetchGames}
                    className="px-3 py-1.5 text-sm bg-indigo-50 text-indigo-600 font-medium rounded-md hover:bg-indigo-100 transition"
                    >
                    Refresh List
                    </button>
                </div>

                {loading && <p className="text-gray-500 py-4">Loading games from `/api/v1/games`...</p>}

                {error && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-lg mb-4 text-sm">
                    {error}
                    </div>
                )}

                {!loading && !error && games.length === 0 && (
                    <p className="text-gray-500 py-4">No games found in the database. Run your seed script!</p>
                )}

                {!loading && games.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {games.map((game) => (
                        <div
                        key={game.id}
                        className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition"
                        >
                        <h3 className="font-bold text-lg text-gray-900">{game.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Players: {game.min_players} – {game.max_players}
                        </p>
                        </div>
                    ))}
                    </div>
                )}
                </div>
            </div>
        </div>
    );
};
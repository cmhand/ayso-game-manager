import { useEffect, useState } from "react";
import { Game, Team } from "../types";
import { Calendar, Clock, History, MapPin, Trophy, ChevronDown, ChevronUp } from "lucide-react";

export default function GameHistory({ teams }: { teams: Team[] }) {
  const [gameHistory, setGameHistory] = useState<Game[]>([]);
  const [expandedGames, setExpandedGames] = useState<Set<string>>(new Set());

  useEffect(() => {
    const savedGameHistory = localStorage.getItem("ayso-game-history");
    if (savedGameHistory) {
      try {
        const parsedGameHistory = JSON.parse(savedGameHistory).map(
          (game: Game) => ({
            ...game,
            date: new Date(game.date),
            createdAt: new Date(game.createdAt),
          })
        );
        setGameHistory(parsedGameHistory);
      } catch (error) {
        console.error("Error loading game history from localStorage:", error);
      }
    }
  }, []);

  const toggleGameExpansion = (gameId: string) => {
    setExpandedGames(prev => {
      const newSet = new Set(prev);
      if (newSet.has(gameId)) {
        newSet.delete(gameId);
      } else {
        newSet.add(gameId);
      }
      return newSet;
    });
  };

  return (
    <div className="flex flex-col items-center gap-4 mb-8">
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-2xl shadow-lg">
        <History className="text-white" size={28} />
      </div>

      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent">
        Game History
      </h1>
      <p className="text-gray-600 font-medium">
        Review past games and player statistics
      </p>

      {gameHistory.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-gray-200">
          <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-4 rounded-2xl inline-block mb-6">
            <History className="text-blue-600" size={48} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            No Games Recorded Yet
          </h3>
          <p className="text-gray-600 text-lg max-w-md mx-auto">
            Start playing games to see your team&apos;s history and player
            statistics here.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 w-full">
          {gameHistory.map((game) => {
            const isExpanded = expandedGames.has(game.id);
            return (
              <div
                key={game.id}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300"
              >
                <div 
                  className="p-6 cursor-pointer"
                  onClick={() => toggleGameExpansion(game.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-br from-green-600 to-green-700 p-2 rounded-xl">
                        <Trophy className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {game.teamName} vs {game.opponent || "Unknown Opponent"}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar size={16} />
                            {game.date.toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={16} />
                            {game.duration} minutes
                          </div>
                          {game.location && (
                            <div className="flex items-center gap-1">
                              <MapPin size={16} />
                              {game.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-gray-500 font-medium">
                        {game.finalStats.players.length} players
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="text-gray-400" size={20} />
                      ) : (
                        <ChevronDown className="text-gray-400" size={20} />
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-6 pb-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-800 mb-3">
                        Player Statistics
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {game.finalStats.players.map((playerStat) => {
                          const team = teams.find((t) => t.id === game.teamId);
                          const player = team?.players.find(
                            (p) => p.id === playerStat.playerId
                          );
                          return (
                            <div
                              key={playerStat.playerId}
                              className="bg-white rounded-lg p-3 border border-gray-200"
                            >
                              <div className="font-medium text-gray-800">
                                {player?.name || `Player ${playerStat.playerId}`}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                Playing: {Math.floor(playerStat.playingTime / 60)}:
                                {(playerStat.playingTime % 60)
                                  .toString()
                                  .padStart(2, "0")}{" "}
                                ({playerStat.playingPercentage.toFixed(1)}%)
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

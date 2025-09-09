import React, { useState, useEffect } from "react";
import { Play, Pause, UserPlus, Clock, Users, Trash2 } from "lucide-react";
import { GameStats, Player, Team, InProgressGame } from "../types";

const gameDurations = {
  "6U": 20,
  "8U": 40,
  "10U": 50,
  "12U": 60,
  "14U": 80,
  "16U": 80,
  "19U": 90,
};

const GameManager = ({
  team,
  onEndGame,
  inProgressGame,
}: {
  team: Team;
  onEndGame: (gameStats: GameStats) => void;
  inProgressGame?: InProgressGame;
}) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [gameDuration, setGameDuration] = useState(60);
  const [gameTime, setGameTime] = useState(0);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [verifyGameEnded, setVerifyGameEnded] = useState(false);
  const [gameId, setGameId] = useState<string>("");

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  // Initialize game state from in-progress game or team data
  useEffect(() => {
    if (inProgressGame) {
      // Restore from in-progress game
      // To update the game time, we need to add the difference between the current time and the started at time
      const currentTime = new Date();
      const lastUpdatedAt = new Date(inProgressGame.lastUpdatedAt);
      const timeDifference = inProgressGame.isGameRunning
        ? currentTime.getTime() - lastUpdatedAt.getTime()
        : 0;
      const timeToAdd = Math.round(timeDifference / 1000);
      const newGameTime = Math.floor(inProgressGame.gameTime + timeToAdd);
      setGameId(inProgressGame.id);
      setPlayers(inProgressGame.players);
      setGameDuration(inProgressGame.gameDuration);
      setGameTime(newGameTime);
      setIsGameRunning(inProgressGame.isGameRunning);
      setGameStarted(inProgressGame.gameStarted);
    } else {
      // Create new game
      setGameId(
        `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      );
    }
  }, [inProgressGame]);

  useEffect(() => {
    if (team && !inProgressGame) {
      setGameDuration(
        gameDurations[team.ageGroup as keyof typeof gameDurations]
      );
      // Reset all player stats when team changes (only for new games)
      const resetPlayers = team.players.map((player) => ({
        ...player,
        isPlaying: true,
        playingTime: 0,
        sittingTime: 0,
        playingPercentage: 0,
        sittingPercentage: 0,
        projectedPlayingPercentage: 0,
        projectedSittingPercentage: 0,
      }));
      setPlayers(resetPlayers);
    }
  }, [team, inProgressGame]);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isGameRunning) {
      interval = setInterval(() => {
        setGameTime((prevTime) => {
          const newTime = prevTime + 1;
          // Auto-pause at game duration
          if (newTime >= gameDuration * 60) {
            setIsGameRunning(false);
            return gameDuration * 60;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval as NodeJS.Timeout);
  }, [isGameRunning, gameDuration]);

  // Update player stats every second
  useEffect(() => {
    if (gameStarted) {
      setPlayers((prevPlayers) =>
        prevPlayers.map((player) => {
          const totalGameTimeSeconds = gameTime;
          const playingPercentage =
            totalGameTimeSeconds > 0 && player.playingTime > 0
              ? (player.playingTime / totalGameTimeSeconds) * 100
              : 0;
          const sittingPercentage =
            player.playingTime > 0 ? Math.max(100 - playingPercentage, 0) : 0;

          // Project final percentages
          const remainingTime = gameDuration * 60 - totalGameTimeSeconds;
          const projectedPlayingTime = player.playingTime + remainingTime;
          const projectedPlayingPercentage =
            (projectedPlayingTime / (gameDuration * 60)) * 100;
          const projectedSittingPercentage = Math.max(
            100 - projectedPlayingPercentage,
            0
          );

          return {
            ...player,
            playingPercentage: Math.min(Math.max(playingPercentage, 0), 100),
            sittingPercentage: Math.min(Math.max(sittingPercentage, 0), 100),
            projectedPlayingPercentage: Math.min(
              Math.max(projectedPlayingPercentage, 0),
              100
            ),
            projectedSittingPercentage: Math.min(
              Math.max(projectedSittingPercentage, 0),
              100
            ),
          };
        })
      );
    }
  }, [gameTime, gameDuration, gameStarted]);

  // Update playing/sitting time every second
  useEffect(() => {
    if (isGameRunning) {
      setPlayers((prevPlayers) =>
        prevPlayers.map((player) => ({
          ...player,
          playingTime: player.isPlaying
            ? player.playingTime + 1
            : player.playingTime,
          sittingTime: player.isPlaying
            ? player.sittingTime
            : player.sittingTime + 1,
        }))
      );
    }
  }, [gameTime, isGameRunning]);

  // Save in-progress game state to localStorage
  const saveInProgressGame = () => {
    if (gameStarted && gameId) {
      const inProgressGameState: InProgressGame = {
        id: gameId,
        teamId: team.id,
        teamName: team.name,
        players: players,
        gameTime: gameTime,
        gameDuration: gameDuration,
        isGameRunning: isGameRunning,
        gameStarted: gameStarted,
        startedAt: inProgressGame?.startedAt || new Date(),
        lastUpdatedAt: new Date(),
      };
      localStorage.setItem(
        "ayso-in-progress-game",
        JSON.stringify(inProgressGameState)
      );
    }
  };

  // Save game state whenever relevant state changes
  useEffect(() => {
    if (gameStarted) {
      saveInProgressGame();
    }
  }, [gameTime, players, isGameRunning, gameStarted, gameDuration]);

  // Clean up in-progress game from localStorage when game ends
  const clearInProgressGame = () => {
    localStorage.removeItem("ayso-in-progress-game");
  };

  const addPlayer = () => {
    if (newPlayerName.trim() && !gameStarted) {
      setPlayers([
        ...players,
        {
          id: Date.now(),
          name: newPlayerName.trim(),
          isPlaying: true,
          playingTime: 0,
          sittingTime: 0,
          playingPercentage: 0,
          sittingPercentage: 0,
          projectedPlayingPercentage: 0,
          projectedSittingPercentage: 0,
        },
      ]);
      setNewPlayerName("");
    }
  };

  const removePlayer = (playerId: number) => {
    setPlayers(players.filter((player) => player.id !== playerId));
  };

  const togglePlayerStatus = (playerId: number) => {
    if (gameStarted) {
      setPlayers(
        players.map((player) =>
          player.id === playerId
            ? { ...player, isPlaying: !player.isPlaying }
            : player
        )
      );
    }
  };

  const startGame = () => {
    if (players.length > 0) {
      setGameStarted(true);
      setIsGameRunning(true);
    }
  };

  const toggleTimer = () => {
    setIsGameRunning(!isGameRunning);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const resetGame = () => {
    setGameTime(0);
    setIsGameRunning(false);
    setGameStarted(false);
    setPlayers(
      players.map((player) => ({
        ...player,
        isPlaying: true,
        playingTime: 0,
        sittingTime: 0,
        playingPercentage: 0,
        sittingPercentage: 0,
        projectedPlayingPercentage: 0,
        projectedSittingPercentage: 0,
      }))
    );
    clearInProgressGame();
  };

  const verifyEndGame = () => {
    setVerifyGameEnded(true);
  };

  const endGame = () => {
    // First verify that the game has actually ended
    setIsGameRunning(false);
    setGameStarted(false);
    clearInProgressGame();
    onEndGame({
      players: players.map((player) => ({
        playerId: player.id,
        playingTime: player.playingTime,
        sittingTime: player.sittingTime,
        playingPercentage: player.playingPercentage,
      })),
      totalGameTime: gameTime,
    });
  };

  return (
    <div className="max-w-7xl mx-auto min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Users className="text-green-600" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-green-800">
              AYSO Team Manager
            </h1>
            {inProgressGame && (
              <p className="text-sm text-blue-600 font-semibold bg-blue-100 px-2 py-1 rounded mt-1 inline-block">
                ⏰ Resumed Game - Started{" "}
                {inProgressGame.startedAt.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {!gameStarted ? (
          <div className="space-y-6">
            {/* Game Setup */}
            <div className="bg-green-100 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-green-800">
                Game Setup
              </h2>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Game Duration
                </label>
                <select
                  value={gameDuration}
                  onChange={(e) => setGameDuration(Number(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg text-lg"
                >
                  <option value={60}>60 minutes</option>
                  <option value={70}>70 minutes</option>
                  <option value={80}>80 minutes</option>
                  <option value={90}>90 minutes</option>
                </select>
              </div>
            </div>

            {/* Player Management */}
            <div className="bg-blue-100 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-blue-800">
                Team Players
              </h2>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addPlayer()}
                  placeholder="Player name"
                  className="flex-1 p-3 border border-gray-300 rounded-lg text-lg"
                />
                <button
                  onClick={addPlayer}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <UserPlus size={20} />
                  Add
                </button>
              </div>

              {players.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium">
                    Roster ({players.length} players):
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {players.map((player) => (
                      <div
                        key={player.id}
                        className="bg-white p-2 rounded border flex items-center justify-between"
                      >
                        {player.name}
                        <button
                          className="cursor-pointer"
                          onClick={() => removePlayer(player.id)}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {players.length > 0 && (
              <button
                onClick={startGame}
                className="w-full py-4 bg-green-600 text-white text-xl font-bold rounded-lg hover:bg-green-700 flex items-center justify-center gap-3"
              >
                <Play size={24} />
                Start Game
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Game Timer */}
            <div className="bg-gray-900 text-white p-6 rounded-lg text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <Clock size={32} />
                <div>
                  <div className="text-4xl font-mono font-bold">
                    {formatTime(gameTime)}
                  </div>
                  <div className="text-lg opacity-75">
                    / {formatTime(gameDuration * 60)}
                  </div>
                </div>
              </div>

              {!verifyGameEnded && (
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={toggleTimer}
                    className={`px-6 py-3 rounded-lg flex items-center gap-2 text-lg font-semibold ${
                      isGameRunning
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {isGameRunning ? <Pause size={20} /> : <Play size={20} />}
                    {isGameRunning ? "Pause" : "Resume"}
                  </button>

                  {!isGameRunning && (
                    <button
                      onClick={resetGame}
                      className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg text-lg font-semibold"
                    >
                      Reset Game
                    </button>
                  )}
                  <button
                    onClick={verifyEndGame}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg text-lg font-semibold"
                  >
                    End Game
                  </button>
                </div>
              )}
              {verifyGameEnded && (
                <div className="text-lg font-semibold">
                  <div className="text-red-600">
                    Please verify that the game has actually ended.
                  </div>
                  <button
                    onClick={() => setVerifyGameEnded(false)}
                    className="px-6 py-3 mr-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={endGame}
                    className="px-6 py-3 bg-red-600 hover:bg-gray-700 rounded-lg text-lg font-semibold"
                  >
                    End Game
                  </button>
                </div>
              )}
            </div>

            {/* Players Status */}
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Player Status</h2>

              {/* Legend */}
              <div className="">
                <div className="flex flex-wrap gap-6 text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-600 rounded"></div>
                    <span>Current Playing %</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-600 rounded"></div>
                    <span>Current Sitting %</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-600 rounded"></div>
                    <span>Max Playing %</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-600 rounded"></div>
                    <span>Final Sitting %</span>
                  </div>
                </div>
              </div>

              <div className="border-b-2 border-gray-200">
                {players
                  .sort((a, b) => {
                    return a.name.localeCompare(b.name);
                  })
                  .map((player) => (
                    <div
                      key={player.id}
                      className="bg-white mb-0 border-2 border-b-0 border-gray-200 p-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">
                              {player.name}
                            </h3>
                            {!isMobile && player.jerseyNumber && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                                #{player.jerseyNumber}
                              </span>
                            )}
                            {!isMobile && player.position && (
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {player.position}
                              </span>
                            )}
                            {formatTime(player.playingTime)} |{" "}
                            {formatTime(player.sittingTime)}
                          </div>
                          <div className="text-sm text-gray-600 font-mono">
                            <div className="flex items-center gap-3 text-lg font-bold">
                              <span className="text-green-600">
                                {player.playingPercentage.toFixed(
                                  isMobile ? 0 : 1
                                )}
                                %
                              </span>
                              <span className="text-red-600">
                                {player.sittingPercentage.toFixed(
                                  isMobile ? 0 : 1
                                )}
                                %
                              </span>
                              <span className="text-blue-600">
                                {player.projectedPlayingPercentage.toFixed(
                                  isMobile ? 0 : 1
                                )}
                                %
                              </span>
                              <span className="text-orange-600">
                                {player.projectedSittingPercentage.toFixed(
                                  isMobile ? 0 : 1
                                )}
                                %
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => togglePlayerStatus(player.id)}
                            className={`px-4 py-2 rounded-lg font-semibold text-white text-lg ${
                              player.isPlaying
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-red-600 hover:bg-red-700"
                            }`}
                          >
                            {isMobile
                              ? player.isPlaying
                                ? "P"
                                : "S"
                              : player.isPlaying
                              ? "PLAYING"
                              : "SITTING"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameManager;

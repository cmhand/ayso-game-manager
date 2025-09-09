"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  History,
} from "lucide-react";
import { Team, TeamFormData, DashboardView, GameStats, Game, InProgressGame } from "../types";
import TeamManager from "./TeamManager";
import RosterManager from "./RosterManager";
import GameManager from "./GameManager";
import GameHistory from "./GameHistory";

const Dashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<DashboardView>("teams");
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [gameTeam, setGameTeam] = useState<Team | null>(null);
  const [gameHistory, setGameHistory] = useState<Game[]>([]);
  const [inProgressGame, setInProgressGame] = useState<InProgressGame | null>(null);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedTeams = localStorage.getItem("ayso-teams");
    if (savedTeams) {
      try {
        const parsedTeams = JSON.parse(savedTeams).map((team: Team) => ({
          ...team,
          createdAt: new Date(team.createdAt),
          updatedAt: new Date(team.updatedAt),
        }));
        setTeams(parsedTeams);
      } catch (error) {
        console.error("Error loading teams from localStorage:", error);
      }
    }

    // Check for in-progress games
    const savedInProgressGame = localStorage.getItem("ayso-in-progress-game");
    if (savedInProgressGame) {
      try {
        const parsedInProgressGame: InProgressGame = JSON.parse(savedInProgressGame);
        parsedInProgressGame.startedAt = new Date(parsedInProgressGame.startedAt);
        parsedInProgressGame.lastUpdatedAt = new Date(parsedInProgressGame.lastUpdatedAt);
        setInProgressGame(parsedInProgressGame);
      } catch (error) {
        console.error("Error loading in-progress game from localStorage:", error);
        // Clean up corrupted data
        localStorage.removeItem("ayso-in-progress-game");
      }
    }
  }, []);

  // Auto-resume in-progress game when teams are loaded
  useEffect(() => {
    if (inProgressGame && teams.length > 0) {
      const team = teams.find(t => t.id === inProgressGame.teamId);
      if (team) {
        setGameTeam(team);
        setCurrentView("game");
      } else {
        // Team not found, clean up the in-progress game
        localStorage.removeItem("ayso-in-progress-game");
        setInProgressGame(null);
      }
    }
  }, [inProgressGame, teams]);

  // Save teams to localStorage whenever teams change
  useEffect(() => {
    localStorage.setItem("ayso-teams", JSON.stringify(teams));
  }, [teams]);

  // Save game history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("ayso-game-history", JSON.stringify(gameHistory));
  }, [gameHistory]);

  const createTeam = (teamData: TeamFormData) => {
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      ...teamData,
      players: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTeams([...teams, newTeam]);
  };

  const editTeam = (teamId: string, teamData: TeamFormData) => {
    setTeams(
      teams.map((team) =>
        team.id === teamId
          ? { ...team, ...teamData, updatedAt: new Date() }
          : team
      )
    );
  };

  const deleteTeam = (teamId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this team? This action cannot be undone."
      )
    ) {
      setTeams(teams.filter((team) => team.id !== teamId));
      if (selectedTeam?.id === teamId) {
        setSelectedTeam(null);
        setCurrentView("teams");
      }
    }
  };

  const updateTeam = (updatedTeam: Team) => {
    setTeams(
      teams.map((team) => (team.id === updatedTeam.id ? updatedTeam : team))
    );
    setSelectedTeam(updatedTeam);
  };

  const selectTeam = (team: Team) => {
    setSelectedTeam(team);
    setCurrentView("roster");
  };

  const startGame = (team: Team) => {
    // Clear any existing in-progress game when starting a new one
    setInProgressGame(null);
    localStorage.removeItem("ayso-in-progress-game");
    setGameTeam(team);
    setCurrentView("game");
  };

  const backToTeams = () => {
    setSelectedTeam(null);
    setCurrentView("teams");
  };

  const backToRoster = () => {
    setGameTeam(null);
    setCurrentView("roster");
  };

  const onEndGame = (gameStats: GameStats) => {
    const newGame: Game = {
      id: `game-${Date.now()}`,
      teamId: gameTeam?.id || "",
      teamName: gameTeam?.name || "",
      opponent: "",
      date: new Date(),
      duration: Math.floor(gameStats.totalGameTime / 60),
      location: "",
      finalStats: gameStats,
      createdAt: new Date(),
    };

    setGameHistory([newGame, ...gameHistory]);
    setGameTeam(null);
    setInProgressGame(null);
    setCurrentView("teams");
  };

  const navigationItems = [
    { id: "teams" as DashboardView, label: "Teams", icon: Users },
    { id: "history" as DashboardView, label: "Game History", icon: History },
  ];

  return (
    <div className="min-h-screen max-h-screen flex flex-col bg-gradient-to-br from-green-50 via-blue-50 to-green-50">
      {/* In-Progress Game Banner */}
      {inProgressGame && currentView !== "game" && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 text-center">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
            <span className="text-lg">⏰</span>
            <span className="font-semibold">
              You have a game in progress with {inProgressGame.teamName}
            </span>
            <button
              onClick={() => {
                const team = teams.find(t => t.id === inProgressGame.teamId);
                if (team) {
                  setGameTeam(team);
                  setCurrentView("game");
                }
              }}
              className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
            >
              Resume Game
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-xl border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-green-600 to-green-700 p-3 rounded-2xl shadow-lg">
                <Users className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
                  AYSO Game Manager
                </h1>
                <p className="text-sm text-gray-600 font-medium">
                  Equal playing time for everyone
                </p>
              </div>
            </div>

            {/* Breadcrumb */}
            <div className="flex items-center gap-3 text-sm">
              <button
                onClick={() => setCurrentView("teams")}
                className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                  currentView === "teams"
                    ? "bg-green-100 text-green-700 font-semibold"
                    : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                }`}
              >
                Teams
              </button>
              {selectedTeam && (
                <>
                  <span className="text-gray-400">/</span>
                  <button
                    onClick={() => setCurrentView("roster")}
                    className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                      currentView === "roster"
                        ? "bg-green-100 text-green-700 font-semibold"
                        : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                    }`}
                  >
                    {selectedTeam.name}
                  </button>
                </>
              )}
              {gameTeam && (
                <>
                  <span className="text-gray-400">/</span>
                  <span className="px-3 py-2 bg-green-100 text-green-700 font-semibold rounded-lg">
                    Game
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      {currentView !== "game" && (
        <nav className="bg-white/60 backdrop-blur-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`flex items-center gap-3 px-8 py-4 text-sm font-semibold rounded-t-xl transition-all duration-200 transform ${
                      isActive
                        ? "bg-white text-green-700 shadow-md border-t-2 border-green-500"
                        : "text-gray-600 hover:text-green-600 hover:bg-white/80 hover:scale-102"
                    }`}
                  >
                    <Icon size={20} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className=" flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-8 sm:px-6 lg:px-8 py-8">
          {currentView === "teams" && (
            <TeamManager
              teams={teams}
              onCreateTeam={createTeam}
              onEditTeam={editTeam}
              onDeleteTeam={deleteTeam}
              onSelectTeam={selectTeam}
              onStartGame={startGame}
            />
          )}

          {currentView === "roster" && selectedTeam && (
            <RosterManager
              team={selectedTeam}
              onUpdateTeam={updateTeam}
              onStartGame={startGame}
              onBack={backToTeams}
            />
          )}

          {currentView === "game" && gameTeam && (
            <div className="space-y-6">
              <GameManager 
                team={gameTeam} 
                onEndGame={onEndGame} 
                inProgressGame={inProgressGame || undefined}
              />
            </div>
          )}

          {currentView === "history" && (
            <div className="space-y-6">
              <GameHistory teams={teams} />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 font-medium">
              Built for AYSO coaches • Promoting equal playing time and fair
              play
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;

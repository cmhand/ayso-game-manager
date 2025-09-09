import React, { useState } from "react";
import { Plus, Edit, Trash2, Users, Calendar, Trophy } from "lucide-react";
import { Team, TeamFormData } from "../types";

interface TeamManagerProps {
  teams: Team[];
  onCreateTeam: (teamData: TeamFormData) => void;
  onEditTeam: (teamId: string, teamData: TeamFormData) => void;
  onDeleteTeam: (teamId: string) => void;
  onSelectTeam: (team: Team) => void;
  onStartGame: (team: Team) => void;
}

const TeamManager: React.FC<TeamManagerProps> = ({
  teams,
  onCreateTeam,
  onEditTeam,
  onDeleteTeam,
  onSelectTeam,
  onStartGame,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState<TeamFormData>({
    name: "",
    season: "",
    ageGroup: "",
    division: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      season: "",
      ageGroup: "",
      division: "",
    });
    setIsCreating(false);
    setEditingTeam(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTeam) {
      onEditTeam(editingTeam.id, formData);
    } else {
      onCreateTeam(formData);
    }
    resetForm();
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      season: team.season,
      ageGroup: team.ageGroup,
      division: team.division || "",
    });
    setIsCreating(true);
  };

  const ageGroups = ["6U", "8U", "10U", "12U", "14U", "16U", "19U"];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
              Team Management
            </h2>
            <p className="text-gray-600 mt-1">
              Organize and manage your AYSO teams
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 font-semibold"
        >
          <Plus size={22} />
          New Team
        </button>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="bg-white/90 backdrop-blur-sm border-2 border-green-200 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
            <h3 className="text-2xl font-bold">
              {editingTeam ? "Edit Team" : "Create New Team"}
            </h3>
            <p className="text-green-100 mt-1">
              {editingTeam
                ? "Update team information"
                : "Set up a new team for the season"}
            </p>
          </div>
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Lightning Bolts"
                    className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700">
                    Age Group *
                  </label>
                  <select
                    value={formData.ageGroup}
                    onChange={(e) =>
                      setFormData({ ...formData, ageGroup: e.target.value })
                    }
                    className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                    required
                  >
                    <option value="">Select Age Group</option>
                    {ageGroups.map((age) => (
                      <option key={age} value={age}>
                        {age}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 font-semibold text-lg"
                >
                  {editingTeam ? "Update Team" : "Create Team"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 font-semibold text-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teams List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <div
            key={team.id}
            className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden"
          >
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-xl">
                    <Trophy className="text-white" size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-white truncate">
                    {team.name}
                  </h3>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(team)}
                    className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
                    title="Edit team"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => onDeleteTeam(team.id)}
                    className="p-2 text-white/80 hover:text-white hover:bg-red-500/30 rounded-lg transition-all duration-200"
                    title="Delete team"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-3 mb-6">
                {team.season && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Calendar size={16} className="text-green-600" />
                    <span className="font-medium">{team.season}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-gray-700">
                  <Trophy size={16} className="text-green-600" />
                  <span className="font-medium">
                    {team.ageGroup}
                    {team.division && (
                      <span className="text-gray-500"> • {team.division}</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Users size={16} className="text-green-600" />
                  <span className="font-medium">
                    {team.players.length} player
                    {team.players.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => onSelectTeam(team)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 font-semibold text-sm"
                >
                  Manage Roster
                </button>
                <button
                  onClick={() => onStartGame(team)}
                  className="flex-1 items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 font-semibold text-sm"
                  title="Start Game"
                >
                  Start Game
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {teams.length === 0 && !isCreating && (
        <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            No teams yet
          </h3>
          <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
            Create your first team to start managing rosters and tracking game
            time
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 font-semibold text-lg"
          >
            Create Your First Team
          </button>
        </div>
      )}
    </div>
  );
};

export default TeamManager;

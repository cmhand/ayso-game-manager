import React, { useState } from 'react';
import { Plus, Edit, Trash2, User, Play, ArrowLeft, Hash, MapPin, Calendar, Users } from 'lucide-react';
import { Team, Player } from '../types';

interface RosterManagerProps {
  team: Team;
  onUpdateTeam: (team: Team) => void;
  onStartGame: (team: Team) => void;
  onBack: () => void;
}

interface PlayerFormData {
  name: string;
  jerseyNumber: string;
  position: string;
}

const RosterManager: React.FC<RosterManagerProps> = ({
  team,
  onUpdateTeam,
  onStartGame,
  onBack,
}) => {
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [formData, setFormData] = useState<PlayerFormData>({
    name: '',
    jerseyNumber: '',
    position: '',
  });

  const positions = [
    'Forward', 'Midfielder', 'Defender', 'Goalkeeper', 'Utility'
  ];

  const resetForm = () => {
    setFormData({
      name: '',
      jerseyNumber: '',
      position: '',
    });
    setIsAddingPlayer(false);
    setEditingPlayer(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const playerData = {
      name: formData.name.trim(),
      jerseyNumber: formData.jerseyNumber ? parseInt(formData.jerseyNumber) : undefined,
      position: formData.position || undefined,
    };

    if (editingPlayer) {
      // Update existing player
      const updatedPlayers = team.players.map(player =>
        player.id === editingPlayer.id
          ? { ...player, ...playerData }
          : player
      );
      onUpdateTeam({ ...team, players: updatedPlayers, updatedAt: new Date() });
    } else {
      // Add new player
      const newPlayer: Player = {
        id: Date.now(),
        ...playerData,
        isPlaying: true,
        playingTime: 0,
        sittingTime: 0,
        playingPercentage: 0,
        sittingPercentage: 0,
        projectedPlayingPercentage: 0,
        projectedSittingPercentage: 0,
      };
      onUpdateTeam({
        ...team,
        players: [...team.players, newPlayer],
        updatedAt: new Date(),
      });
    }
    resetForm();
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setFormData({
      name: player.name,
      jerseyNumber: player.jerseyNumber?.toString() || '',
      position: player.position || '',
    });
    setIsAddingPlayer(true);
  };

  const handleDelete = (playerId: number) => {
    if (confirm('Are you sure you want to remove this player from the roster?')) {
      const updatedPlayers = team.players.filter(player => player.id !== playerId);
      onUpdateTeam({ ...team, players: updatedPlayers, updatedAt: new Date() });
    }
  };

  const usedJerseyNumbers = team.players
    .filter(p => p.jerseyNumber && (!editingPlayer || p.id !== editingPlayer.id))
    .map(p => p.jerseyNumber);

  const isJerseyNumberTaken = (num: string) => {
    const number = parseInt(num);
    return !isNaN(number) && usedJerseyNumbers.includes(number);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-3 text-green-600 hover:bg-green-100 rounded-xl transition-all duration-200 hover:scale-110"
          >
            <ArrowLeft size={28} />
          </button>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
              {team.name} Roster
            </h2>
            <div className="flex items-center gap-3 mt-2 text-gray-600">
              <span className="flex items-center gap-1">
                <Calendar size={16} />
                {team.season}
              </span>
              <span>•</span>
              <span>{team.ageGroup}</span>
              {team.division && (
                <>
                  <span>•</span>
                  <span>{team.division}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsAddingPlayer(true)}
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 font-semibold"
          >
            <Plus size={22} />
            Add Player
          </button>
          {team.players.length > 0 && (
            <button
              onClick={() => onStartGame(team)}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 font-semibold"
            >
              <Play size={22} />
              Start Game
            </button>
          )}
        </div>
      </div>

      {/* Add/Edit Player Form */}
      {isAddingPlayer && (
        <div className="bg-white/90 backdrop-blur-sm border-2 border-blue-200 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
            <h3 className="text-2xl font-bold">
              {editingPlayer ? 'Edit Player' : 'Add New Player'}
            </h3>
            <p className="text-blue-100 mt-1">
              {editingPlayer ? 'Update player information' : 'Add a new player to your roster'}
            </p>
          </div>
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700">Player Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter player name"
                    className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700">Jersey Number</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={formData.jerseyNumber}
                    onChange={(e) => setFormData({ ...formData, jerseyNumber: e.target.value })}
                    placeholder="1-99"
                    className={`w-full p-4 border-2 rounded-xl text-lg transition-all duration-200 ${
                      formData.jerseyNumber && isJerseyNumberTaken(formData.jerseyNumber)
                        ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                    }`}
                  />
                  {formData.jerseyNumber && isJerseyNumberTaken(formData.jerseyNumber) && (
                    <p className="text-red-600 text-sm mt-2 font-medium">Jersey number already taken</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700">Preferred Position</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  >
                    <option value="">Select Position</option>
                    {positions.map((position) => (
                      <option key={position} value={position}>
                        {position}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={!!(formData.jerseyNumber && isJerseyNumberTaken(formData.jerseyNumber))}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 font-semibold text-lg disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {editingPlayer ? 'Update Player' : 'Add Player'}
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

      {/* Roster List */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Users className="text-white" size={24} />
              </div>
              <h3 className="text-2xl font-bold">
                Team Roster
              </h3>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-xl">
              <span className="font-bold text-lg">{team.players.length} players</span>
            </div>
          </div>
        </div>
        
        {team.players.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {team.players.map((player, index) => (
              <div key={index} className="p-6 hover:bg-gray-50/80 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                        {player.jerseyNumber ? (
                          <span className="font-bold text-white text-lg">#{player.jerseyNumber}</span>
                        ) : (
                          <User className="text-white" size={24} />
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-xl text-gray-800">{player.name}</h4>
                      <div className="flex items-center gap-6 text-sm text-gray-600 mt-2">
                        {player.jerseyNumber && (
                          <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-lg">
                            <Hash size={14} className="text-green-600" />
                            <span className="font-semibold text-green-800">#{player.jerseyNumber}</span>
                          </div>
                        )}
                        {player.position && (
                          <div className="flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-lg">
                            <MapPin size={14} className="text-blue-600" />
                            <span className="font-semibold text-blue-800">{player.position}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleEdit(player)}
                      className="p-3 text-blue-600 hover:bg-blue-100 rounded-xl transition-all duration-200 hover:scale-110"
                      title="Edit player"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(player.id)}
                      className="p-3 text-red-600 hover:bg-red-100 rounded-xl transition-all duration-200 hover:scale-110"
                      title="Remove player"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h4 className="text-2xl font-bold text-gray-800 mb-3">No players yet</h4>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              Add players to build your roster and start tracking game time
            </p>
            <button
              onClick={() => setIsAddingPlayer(true)}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 font-semibold text-lg"
            >
              Add First Player
            </button>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {team.players.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-gray-200">
          <h4 className="text-2xl font-bold text-gray-800 mb-6">Roster Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-2xl mb-3">
                <Users className="text-green-600 mx-auto" size={32} />
              </div>
              <div className="font-bold text-2xl text-gray-800">{team.players.length}</div>
              <span className="text-gray-600 text-sm font-medium">Total Players</span>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-2xl mb-3">
                <Hash className="text-blue-600 mx-auto" size={32} />
              </div>
              <div className="font-bold text-2xl text-gray-800">
                {team.players.filter(p => p.jerseyNumber).length}
              </div>
              <span className="text-gray-600 text-sm font-medium">Jersey Numbers</span>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-2xl mb-3">
                <MapPin className="text-purple-600 mx-auto" size={32} />
              </div>
              <div className="font-bold text-2xl text-gray-800">
                {team.players.filter(p => p.position).length}
              </div>
              <span className="text-gray-600 text-sm font-medium">Positions Set</span>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 p-4 rounded-2xl mb-3">
                <Play className="text-emerald-600 mx-auto" size={32} />
              </div>
              <div className={`font-bold text-2xl ${team.players.length > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                {team.players.length > 0 ? 'Ready' : 'Not Ready'}
              </div>
              <span className="text-gray-600 text-sm font-medium">Game Status</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RosterManager;

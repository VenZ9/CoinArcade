"use client";

import React, { useState } from "react";
import { useGameStore } from "../../lib/state/game-store";
import { XPBar } from "../../components/ui/XPBar";
import { CoinBalance } from "../../components/ui/CoinBalance";
import { GameButton } from "../../components/ui/GameButton";
import { Modal } from "../../components/ui/Modal";
import { getXPProgress } from "../../lib/economy/rewards";
import { useToast } from "../../components/ui/Toast";

const AVATAR_OPTIONS = ["joystick", "star", "crown", "trophy", "gem", "dice", "clover", "feather"];

const AVATAR_EMOJIS: Record<string, string> = {
  joystick: "🕹️",
  star: "⭐",
  crown: "👑",
  trophy: "🏆",
  gem: "💎",
  dice: "🎲",
  clover: "🍀",
  feather: "🪶",
};

export default function ProfilePage() {
  const { profile, updateAvatar, updateUsername, updateSettings, resetProgress } = useGameStore();
  const { showToast } = useToast();

  const [usernameInput, setUsernameInput] = useState(profile.username);
  const [showReset, setShowReset] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const progress = getXPProgress(profile.xp);

  const handleSaveUsername = () => {
    if (usernameInput.trim().length === 0) {
      showToast("Username cannot be empty", "error");
      return;
    }
    updateUsername(usernameInput);
    showToast("Username updated", "success");
  };

  const handleReset = () => {
    resetProgress();
    setShowReset(false);
    setUsernameInput("ArcadeChampion");
    showToast("Progress reset to defaults", "info");
  };

  const unlockedAchievements = profile.achievements.filter((a) => a.unlocked);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-br from-arcade-900 to-arcade-850 border border-arcade-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-5">
        {/* Avatar */}
        <button
          type="button"
          onClick={() => setShowAvatarPicker(true)}
          className="w-20 h-20 rounded-2xl bg-arcade-950 border-2 border-brand-500/40 flex items-center justify-center text-4xl shadow-lg hover:scale-105 transition-transform select-none"
          aria-label="Change avatar"
        >
          {AVATAR_EMOJIS[profile.avatar] || "🕹️"}
        </button>

        <div className="flex-1 flex flex-col items-center sm:items-start gap-2 w-full">
          <div className="flex items-center gap-2 w-full justify-center sm:justify-start">
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              onBlur={handleSaveUsername}
              maxLength={25}
              aria-label="Username"
              className="bg-arcade-950 border border-arcade-800 focus:border-brand-500 rounded-lg px-3 py-1.5 text-lg font-black text-white focus:outline-none max-w-[220px]"
            />
          </div>

          <div className="w-full max-w-md mt-1">
            <XPBar xp={profile.xp} />
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
            <CoinBalance balance={profile.coins} size="sm" showLabel />
            <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-arcade-950 border border-arcade-800 text-arcade-300">
              Level {progress.currentLevel}
            </span>
            <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-arcade-950 border border-arcade-800 text-arcade-300">
              {profile.streak} Day Streak
            </span>
          </div>
        </div>
      </div>

      {/* Play Statistics */}
      <div>
        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-3">
          Career Statistics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-arcade-900 border border-arcade-800 rounded-xl p-4 text-center">
            <span className="text-2xl font-black font-mono text-white block">
              {profile.stats.gamesPlayed}
            </span>
            <span className="text-[11px] text-arcade-400 uppercase tracking-wider">Games Played</span>
          </div>
          <div className="bg-arcade-900 border border-arcade-800 rounded-xl p-4 text-center">
            <span className="text-2xl font-black font-mono text-win-light block">
              {profile.stats.gamesWon}
            </span>
            <span className="text-[11px] text-arcade-400 uppercase tracking-wider">Rounds Won</span>
          </div>
          <div className="bg-arcade-900 border border-arcade-800 rounded-xl p-4 text-center">
            <span className="text-2xl font-black font-mono text-brand-300 block">
              {profile.stats.longestWinStreak}
            </span>
            <span className="text-[11px] text-arcade-400 uppercase tracking-wider">Best Win Streak</span>
          </div>
          <div className="bg-arcade-900 border border-arcade-800 rounded-xl p-4 text-center">
            <span className="text-2xl font-black font-mono text-brand-300 block">
              {profile.stats.highestWin.toLocaleString()}
            </span>
            <span className="text-[11px] text-arcade-400 uppercase tracking-wider">Highest Win</span>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Achievements
          </h2>
          <span className="text-xs font-mono text-arcade-400">
            {unlockedAchievements.length} / {profile.achievements.length} Unlocked
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {profile.achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-3.5 rounded-xl border transition-all ${
                ach.unlocked
                  ? "bg-brand-500/10 border-brand-500/30"
                  : "bg-arcade-900 border-arcade-800 opacity-70"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className={`text-xs font-bold ${ach.unlocked ? "text-brand-300" : "text-arcade-300"}`}>
                  {ach.title}
                </h3>
                {ach.unlocked && <span className="text-sm">🏅</span>}
              </div>
              <p className="text-[11px] text-arcade-400 leading-relaxed mb-2">{ach.description}</p>
              <div className="w-full h-1.5 bg-arcade-950 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    ach.unlocked ? "bg-brand-400" : "bg-arcade-600"
                  }`}
                  style={{ width: `${Math.min(100, (ach.progress / ach.maxProgress) * 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-1.5 text-[10px] font-mono text-arcade-500">
                <span>
                  {Math.min(ach.progress, ach.maxProgress)} / {ach.maxProgress}
                </span>
                <span>+{ach.coinsReward} 🪙 • +{ach.xpReward} XP</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Match History */}
      <div>
        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-3">
          Recent Rounds
        </h2>
        {profile.history.length > 0 ? (
          <div className="w-full overflow-x-auto rounded-xl border border-arcade-800 bg-arcade-900">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-arcade-950 border-b border-arcade-800 text-arcade-400 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Game</th>
                  <th className="py-2.5 px-4">Outcome</th>
                  <th className="py-2.5 px-4">Wager</th>
                  <th className="py-2.5 px-4">Return</th>
                  <th className="py-2.5 px-4">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-arcade-800/60 text-arcade-200">
                {profile.history.slice(0, 20).map((h) => (
                  <tr key={h.id} className="hover:bg-arcade-850/60">
                    <td className="py-2.5 px-4 font-sans font-semibold text-white">{h.gameName}</td>
                    <td className="py-2.5 px-4 text-arcade-400 max-w-[220px] truncate">{h.outcome}</td>
                    <td className="py-2.5 px-4">{h.wager}</td>
                    <td className="py-2.5 px-4">{h.reward}</td>
                    <td
                      className={`py-2.5 px-4 font-bold ${
                        h.netChange > 0 ? "text-win-light" : h.netChange < 0 ? "text-loss-light" : "text-arcade-300"
                      }`}
                    >
                      {h.netChange > 0 ? `+${h.netChange}` : h.netChange}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 flex flex-col items-center justify-center text-center bg-arcade-900/60 border border-dashed border-arcade-800 rounded-2xl">
            <span className="text-3xl mb-2">🕹️</span>
            <p className="text-xs text-arcade-400">No rounds played yet. Start your first game!</p>
          </div>
        )}
      </div>

      {/* Settings */}
      <div>
        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-3">Settings</h2>
        <div className="bg-arcade-900 border border-arcade-800 rounded-xl divide-y divide-arcade-800">
          <div className="flex items-center justify-between p-4">
            <div>
              <span className="text-sm font-semibold text-white block">Sound Effects</span>
              <span className="text-xs text-arcade-400">Play audio feedback during rounds.</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={profile.settings.soundEnabled}
              onClick={() => updateSettings({ soundEnabled: !profile.settings.soundEnabled })}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                profile.settings.soundEnabled ? "bg-brand-500" : "bg-arcade-700"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  profile.settings.soundEnabled ? "translate-x-5.5 left-0.5" : "left-0.5"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4">
            <div>
              <span className="text-sm font-semibold text-white block">Reduced Motion</span>
              <span className="text-xs text-arcade-400">Minimize animations for accessibility.</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={profile.settings.reducedMotion}
              onClick={() => updateSettings({ reducedMotion: !profile.settings.reducedMotion })}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                profile.settings.reducedMotion ? "bg-brand-500" : "bg-arcade-700"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  profile.settings.reducedMotion ? "translate-x-5.5 left-0.5" : "left-0.5"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4">
            <div>
              <span className="text-sm font-semibold text-white block">Reset Progress</span>
              <span className="text-xs text-arcade-400">Restore the default profile. Cannot be undone.</span>
            </div>
            <GameButton variant="danger" size="sm" onClick={() => setShowReset(true)}>
              Reset
            </GameButton>
          </div>
        </div>
      </div>

      {/* Avatar Picker Modal */}
      <Modal isOpen={showAvatarPicker} onClose={() => setShowAvatarPicker(false)} title="Choose Avatar" maxWidth="sm">
        <div className="grid grid-cols-4 gap-2.5">
          {AVATAR_OPTIONS.map((av) => (
            <button
              key={av}
              type="button"
              onClick={() => {
                updateAvatar(av);
                setShowAvatarPicker(false);
                showToast("Avatar updated", "success");
              }}
              className={`aspect-square rounded-xl border flex items-center justify-center text-3xl transition-all ${
                profile.avatar === av
                  ? "bg-brand-500/20 border-brand-500/50 scale-105"
                  : "bg-arcade-950 border-arcade-800 hover:border-arcade-600"
              }`}
            >
              {AVATAR_EMOJIS[av]}
            </button>
          ))}
        </div>
      </Modal>

      {/* Reset Confirmation Modal */}
      <Modal isOpen={showReset} onClose={() => setShowReset(false)} title="Confirm Reset" maxWidth="sm">
        <p className="text-xs text-arcade-300 mb-4">
          This will erase all coins, XP, items, achievements and history, restoring the default profile. This action cannot be undone.
        </p>
        <div className="flex gap-2">
          <GameButton variant="secondary" className="flex-1" onClick={() => setShowReset(false)}>
            Cancel
          </GameButton>
          <GameButton variant="danger" className="flex-1" onClick={handleReset}>
            Reset Everything
          </GameButton>
        </div>
      </Modal>
    </div>
  );
}

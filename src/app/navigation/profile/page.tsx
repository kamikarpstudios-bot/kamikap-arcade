"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/app/lib/AuthContext";
import SigninCard from "./SignInCard";

export default function ProfilePage() {
  const { user, updateUser, signOut, loading } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [message, setMessage] = useState("");

  // DEV MODE STATE
  const [devEditMode, setDevEditMode] = useState(false);
  const [devUnlocked, setDevUnlocked] = useState(false);

  // CONFIGURABLE CODES (LOCAL FOR NOW)
  const [promoConfig, setPromoConfig] = useState({
    code: "1111",
    enabled: true,
  });

  const [devConfig, setDevConfig] = useState({
    code: "Kami",
    enabled: true,
  });

  // ✅ Populate profile from persisted user on mount
  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email || "");
      setPassword(user.password || ""); // important!
      setProfilePic(user.profilePic || "");
      setDevUnlocked(user.role === "dev");
    }
  }, [user]);

  if (loading) return <p className="text-white text-center mt-10">Loading...</p>;
  if (!user) return <SigninCard />;

  // Save profile info
  const handleSaveProfile = () => {
    updateUser({ username, email, password, profilePic });
    setMessage("Profile saved!");
  };

  // Apply promo / dev code
  const handleApplyCode = () => {
    if (devConfig.enabled && promoCodeInput === devConfig.code) {
      updateUser({ role: "dev", subscription: "dev" });
      setDevUnlocked(true);
      setMessage("✅ Dev mode unlocked");
    } else if (promoConfig.enabled && promoCodeInput === promoConfig.code) {
      updateUser({ subscription: "pro" });
      setMessage("✅ Promo accepted (no rewards yet)");
    } else {
      setMessage("❌ Invalid or disabled code");
    }
    setPromoCodeInput("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-800 p-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* PROFILE CARD */}
        <div className="bg-gray-900/90 border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
          <h2 className="text-xl font-bold text-white text-center">Profile</h2>

          {/* Profile Pic */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/20 flex items-center justify-center text-3xl">
              {profilePic || "❓"}
            </div>

            <p className="text-white text-sm mt-1">Choose your avatar</p>

            {/* Emoji picker */}
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {["😀", "😎", "🤖", "👾", "🐙", "👽", "💃🏼", "🪬"].map((emoji) => (
                <button
                  key={emoji}
                  className={`text-2xl w-10 h-10 flex items-center justify-center rounded-full border ${
                    profilePic === emoji
                      ? "border-blue-500 bg-blue-500/20"
                      : "border-white/20"
                  } hover:bg-white/10`}
                  onClick={() => setProfilePic(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Username */}
          <input
            className="w-full p-2 rounded bg-white/5 border border-white/20 text-white"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
          />

          {/* Email */}
          <input
            className="w-full p-2 rounded bg-white/5 border border-white/20 text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />

          {/* Password with eye toggle */}
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full p-2 rounded bg-white/5 border border-white/20 text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
            <button
              type="button"
              className="absolute right-2 top-2 text-white/60 hover:text-white"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-white text-black py-2 rounded font-bold"
            onClick={handleSaveProfile}
          >
            Save Profile
          </motion.button>
        </div>

        {/* ACCESS CARD */}
        <div className="bg-gray-900/90 border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
          <h2 className="text-xl font-bold text-white text-center">Access</h2>

          <p className="text-white">
            Subscription:{" "}
            <span className="text-green-400 font-semibold">
              {user.subscription.toUpperCase()}
            </span>
          </p>

          {devUnlocked && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-500/20 border border-green-500 text-green-300 text-sm text-center py-2 rounded"
            >
              DEV MODE ACTIVE
            </motion.div>
          )}

          {devUnlocked && (
            <button
              onClick={() => setDevEditMode(!devEditMode)}
              className="text-blue-400 underline text-sm"
            >
              {devEditMode ? "Switch to View Mode" : "Edit Promo / Dev Codes"}
            </button>
          )}

          {devEditMode ? (
            <>
              <p className="text-white font-semibold">Promo Code</p>
              <input
                className="w-full p-2 rounded bg-white/5 border border-white/20 text-white"
                value={promoConfig.code}
                onChange={(e) =>
                  setPromoConfig({ ...promoConfig, code: e.target.value })
                }
              />
              <label className="text-white text-sm">
                <input
                  type="checkbox"
                  checked={promoConfig.enabled}
                  onChange={() =>
                    setPromoConfig({
                      ...promoConfig,
                      enabled: !promoConfig.enabled,
                    })
                  }
                />{" "}
                Promo Enabled
              </label>

              <p className="text-white font-semibold mt-3">Dev Code</p>
              <input
                className="w-full p-2 rounded bg-white/5 border border-white/20 text-white"
                value={devConfig.code}
                onChange={(e) =>
                  setDevConfig({ ...devConfig, code: e.target.value })
                }
              />
              <label className="text-white text-sm">
                <input
                  type="checkbox"
                  checked={devConfig.enabled}
                  onChange={() =>
                    setDevConfig({
                      ...devConfig,
                      enabled: !devConfig.enabled,
                    })
                  }
                />{" "}
                Dev Enabled
              </label>
            </>
          ) : (
            <>
              <input
                className="w-full p-2 rounded bg-white/5 border border-white/20 text-white"
                placeholder="Enter promo / dev code"
                value={promoCodeInput}
                onChange={(e) => setPromoCodeInput(e.target.value)}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-blue-600 text-black py-2 rounded font-bold"
                onClick={handleApplyCode}
              >
                Apply Code
              </motion.button>
            </>
          )}
        </div>

        {/* STATS */}
        <div className="md:col-span-2 bg-gray-900/90 border border-white/10 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-3">Your Stats</h2>
          <p className="text-white/70">Last Played: —</p>
          <p className="text-white/70">Most Played Game: —</p>
          <p className="text-white/70">Total Hours Played: —</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="md:col-span-2 bg-red-600 text-white py-2 rounded font-bold"
          onClick={signOut}
        >
          Sign Out
        </motion.button>

        {message && (
          <p className="md:col-span-2 text-center text-green-400">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

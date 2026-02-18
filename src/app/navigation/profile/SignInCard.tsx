"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth, User } from "@/app/lib/AuthContext";

// Placeholder emojis for avatars
const PLACEHOLDER_AVATARS = ["😀","😎","🐟","👾","🎮","🛸","💡"];

export default function SignInCard() {
  const { signIn } = useAuth();

  const [isSignIn, setIsSignIn] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState(PLACEHOLDER_AVATARS[0]);
  const [error, setError] = useState("");

  const handleCreate = () => {
    if (!username.trim()) return setError("Username required");
    if (!password.trim()) return setError("Password required");

    const savedUsers: User[] = JSON.parse(localStorage.getItem("users") || "[]");

    if (savedUsers.find(u => u.username === username))
      return setError("Username already in use");

    const newUser: User = {
      username: username.trim(),
      password,
      role: "user",
      subscription: "free",
      profilePic,
      email: ""
    };

    savedUsers.push(newUser);
    localStorage.setItem("users", JSON.stringify(savedUsers));

    signIn(newUser);
  };

  const handleSignIn = () => {
    const savedUsers: User[] = JSON.parse(localStorage.getItem("users") || "[]");
    const matched = savedUsers.find(u => u.username === username && u.password === password);

    if (!matched) return setError("Invalid username or password");

    signIn(matched);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900/90 border border-white/10 rounded-2xl p-6 space-y-5 shadow-2xl">
        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-4">
          <button
            className={`px-4 py-2 font-bold rounded ${
              isSignIn ? "bg-white text-black" : "bg-white/10 text-white"
            }`}
            onClick={() => {
              setIsSignIn(true);
              setError("");
            }}
          >
            Sign In
          </button>
          <button
            className={`px-4 py-2 font-bold rounded ${
              !isSignIn ? "bg-white text-black" : "bg-white/10 text-white"
            }`}
            onClick={() => {
              setIsSignIn(false);
              setError("");
            }}
          >
            Create Account
          </button>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {!isSignIn && (
          <div className="flex gap-2 mb-2">
            {PLACEHOLDER_AVATARS.map((avatar) => (
              <button
                key={avatar}
                onClick={() => setProfilePic(avatar)}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                  profilePic === avatar ? "ring-4 ring-blue-500" : "ring-2 ring-white/20"
                }`}
              >
                {avatar}
              </button>
            ))}
          </div>
        )}

        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 rounded bg-white/5 border border-white/20 text-white mb-2 placeholder:text-white/50"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 rounded bg-white/5 border border-white/20 text-white mb-4 placeholder:text-white/50"
        />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-white text-black py-2 rounded font-bold shadow-md"
          onClick={isSignIn ? handleSignIn : handleCreate}
        >
          {isSignIn ? "Sign In" : "Create Account"}
        </motion.button>
      </div>
    </div>
  );
}

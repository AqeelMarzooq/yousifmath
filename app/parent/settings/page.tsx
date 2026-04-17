"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Key, RotateCcw, AlertTriangle, Check } from "lucide-react";

export default function SettingsPage() {
  const [yousifPw, setYousifPw] = useState("");
  const [parentPw, setParentPw] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  function showMsg(type: "ok" | "err", text: string) {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3000);
  }

  async function changePassword(target: string, password: string) {
    if (password.length < 6) { showMsg("err", "Password must be at least 6 characters"); return; }
    const res = await fetch("/api/parent/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target, newPassword: password }),
    });
    if (res.ok) {
      showMsg("ok", `${target === "yousif" ? "Yousif's" : "Your"} password updated!`);
      target === "yousif" ? setYousifPw("") : setParentPw("");
    } else {
      showMsg("err", "Failed to update password");
    }
  }

  async function resetProgress() {
    const res = await fetch("/api/parent/reset", { method: "POST" });
    if (res.ok) {
      showMsg("ok", "Yousif's progress has been reset");
      setConfirmReset(false);
    } else {
      showMsg("err", "Failed to reset progress");
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="bebas text-4xl tracking-wider text-[#FFD700]">Settings</h1>
        <p className="text-white/50 mt-1">Account management</p>
      </div>

      {msg && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm ${
          msg.type === "ok"
            ? "bg-green-900/20 border-green-700/30 text-green-400"
            : "bg-red-900/20 border-red-700/30 text-red-400"
        }`}>
          <Check className="w-4 h-4 flex-shrink-0" />
          {msg.text}
        </div>
      )}

      {/* Change Yousif password */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-[#CC0000]" />
          <h2 className="bebas text-xl tracking-wider">Yousif's Password</h2>
        </div>
        <div className="flex gap-3">
          <input
            type="password"
            value={yousifPw}
            onChange={(e) => setYousifPw(e.target.value)}
            placeholder="New password..."
            className="flex-1 bg-white/5 border border-white/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#CC0000]/60 text-sm"
          />
          <button
            onClick={() => changePassword("yousif", yousifPw)}
            className="px-5 py-2.5 bg-gradient-to-r from-[#CC0000] to-[#990000] rounded-lg bebas tracking-wider text-sm hover:from-red-600 hover:to-red-800 transition-all cursor-pointer"
          >
            Update
          </button>
        </div>
      </Card>

      {/* Change parent password */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-[#FFD700]" />
          <h2 className="bebas text-xl tracking-wider">Your Password</h2>
        </div>
        <div className="flex gap-3">
          <input
            type="password"
            value={parentPw}
            onChange={(e) => setParentPw(e.target.value)}
            placeholder="New password..."
            className="flex-1 bg-white/5 border border-white/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#FFD700]/60 text-sm"
          />
          <button
            onClick={() => changePassword("parent", parentPw)}
            className="px-5 py-2.5 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black rounded-lg bebas tracking-wider text-sm hover:from-yellow-300 hover:to-orange-400 transition-all cursor-pointer"
          >
            Update
          </button>
        </div>
      </Card>

      {/* Reset progress */}
      <Card className="border-red-700/20">
        <div className="flex items-center gap-2 mb-4">
          <RotateCcw className="w-5 h-5 text-[#CC0000]" />
          <h2 className="bebas text-xl tracking-wider text-[#CC0000]">Reset Progress</h2>
        </div>
        <p className="text-white/50 text-sm mb-4">
          This will delete all of Yousif's answers, sessions, and XP. This cannot be undone.
        </p>
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-red-700/40 text-red-400 rounded-lg hover:bg-red-900/20 transition-all text-sm cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4" />
            Reset All Progress
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-red-400 text-sm font-bold">Are you sure? This will erase everything!</p>
            <div className="flex gap-3">
              <button
                onClick={resetProgress}
                className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-600 transition-all text-sm cursor-pointer"
              >
                Yes, Reset
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-4 py-2 border border-white/20 text-white/50 rounded-lg hover:bg-white/10 transition-all text-sm cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Login credentials reminder */}
      <Card className="border-white/5">
        <h2 className="bebas text-lg tracking-wider text-white/40 mb-3">Login Details</h2>
        <div className="space-y-2 text-sm text-white/50">
          <div className="flex justify-between">
            <span>Yousif's username:</span>
            <span className="font-mono text-white/70">yousif</span>
          </div>
          <div className="flex justify-between">
            <span>Parent username:</span>
            <span className="font-mono text-white/70">parent</span>
          </div>
          <div className="flex justify-between">
            <span>Login URL:</span>
            <span className="font-mono text-white/70">/login</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

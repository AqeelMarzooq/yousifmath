"use client";
import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Zap, Shield, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"student" | "parent" | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!mode) return;
    setLoading(true);
    setError("");

    const username = mode === "student" ? "yousif" : "parent";
    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (res?.ok) {
      const session = await getSession();
      if (session?.user.role === "PARENT") {
        router.push("/parent/dashboard");
      } else {
        router.push("/student/dashboard");
      }
    } else {
      setError("Wrong password! Try again, champ!");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen stadium-bg flex items-center justify-center p-4">
      {/* CR7 silhouette background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 right-0 w-64 h-96 opacity-5 text-[12rem] select-none flex items-end justify-end pr-4">
          7
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#CC0000]/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#CC0000]/20 border border-[#CC0000]/30 mb-4">
            <Zap className="w-8 h-8 text-[#FFD700]" />
          </div>
          <h1 className="bebas text-5xl tracking-widest">
            Yousif<span className="text-[#CC0000]">Math</span>
          </h1>
          <p className="text-white/50 text-sm mt-1">CR7 Mode — Year 5 Mathematics</p>
        </div>

        {!mode ? (
          /* Role selection */
          <div className="space-y-4">
            <h2 className="text-center text-white/70 text-sm uppercase tracking-widest mb-6">
              Choose your role
            </h2>
            <button
              onClick={() => setMode("student")}
              className="w-full cr7-card-red p-6 rounded-xl border border-[#CC0000]/30 hover:border-[#CC0000]/60 transition-all text-left group hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-900/30 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#CC0000]/30 flex items-center justify-center text-2xl">
                  ⚽
                </div>
                <div>
                  <div className="bebas text-2xl tracking-wider group-hover:text-[#CC0000] transition-colors">
                    Yousif's Login
                  </div>
                  <div className="text-white/50 text-sm">Enter the pitch, score some goals!</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setMode("parent")}
              className="w-full cr7-card-gold p-6 rounded-xl border border-[#FFD700]/30 hover:border-[#FFD700]/60 transition-all text-left group hover:-translate-y-0.5 hover:shadow-lg hover:shadow-yellow-700/20 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#FFD700]/20 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-[#FFD700]" />
                </div>
                <div>
                  <div className="bebas text-2xl tracking-wider group-hover:text-[#FFD700] transition-colors">
                    Parent Login
                  </div>
                  <div className="text-white/50 text-sm">Manager's Office — track progress</div>
                </div>
              </div>
            </button>
          </div>
        ) : (
          /* Password form */
          <div className="cr7-card rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => { setMode(null); setPassword(""); setError(""); }}
                className="text-white/40 hover:text-white transition-colors text-sm"
              >
                ← Back
              </button>
              <div className="flex-1 text-center">
                <span className={`bebas text-xl tracking-wider ${mode === "student" ? "text-[#CC0000]" : "text-[#FFD700]"}`}>
                  {mode === "student" ? "⚽ Yousif's Login" : "🏆 Manager's Office"}
                </span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-white/60 text-sm mb-2">
                  {mode === "student" ? "Enter your password, champ!" : "Parent password"}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#CC0000]/60 focus:bg-white/10 transition-all text-lg"
                  autoFocus
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 rounded-lg px-3 py-2 border border-red-700/30">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !password}
                className={`w-full py-3.5 rounded-lg bebas text-lg tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                  mode === "student"
                    ? "bg-gradient-to-r from-[#CC0000] to-[#990000] text-white hover:from-red-600 hover:to-red-800"
                    : "bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black hover:from-yellow-300 hover:to-orange-400"
                }`}
              >
                {loading ? "Warming up..." : mode === "student" ? "Kick Off! ⚽" : "Enter Office 🏆"}
              </button>
            </form>

            <p className="text-center text-white/20 text-xs mt-4">
              {mode === "student" ? "Username: yousif" : "Username: parent"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

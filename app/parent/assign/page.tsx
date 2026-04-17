"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ClipboardList, CheckCircle } from "lucide-react";

export default function AssignPage() {
  const [stats, setStats] = useState<any>(null);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/parent/stats").then((r) => r.json()).then(setStats);
  }, []);

  async function toggleAssign(topicId: string, currentlyAssigned: boolean) {
    setSaving(topicId);
    await fetch("/api/parent/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicId, assigned: !currentlyAssigned }),
    });
    // Refresh
    const fresh = await fetch("/api/parent/stats").then((r) => r.json());
    setStats(fresh);
    setSaving(null);
  }

  if (!stats) return <div className="animate-pulse h-64 bg-white/5 rounded-xl" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="bebas text-4xl tracking-wider text-[#FFD700]">Assign Homework</h1>
        <p className="text-white/50 mt-1">Mark topics as "Today's Mission" for Yousif</p>
      </div>

      <Card className="border-[#FFD700]/20">
        <div className="flex items-start gap-3">
          <ClipboardList className="w-5 h-5 text-[#FFD700] flex-shrink-0 mt-0.5" />
          <div className="text-sm text-white/60">
            Assigned topics appear on Yousif's dashboard as "Today's Mission". He can still access all topics, but assigned ones are highlighted.
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {stats.topicStats.map((t: any, i: number) => (
          <div key={t.id} className={`cr7-card rounded-xl p-4 border transition-all ${
            t.isAssigned ? "border-[#FFD700]/40 bg-[#FFD700]/5" : "border-white/10"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-white/30 text-sm">#{i + 1}</span>
                  <span className="font-semibold">{t.title}</span>
                  {t.completionPct === 100 && (
                    <span className="text-xs bg-green-900/30 text-green-400 border border-green-700/30 px-1.5 py-0.5 rounded">
                      Complete
                    </span>
                  )}
                </div>
                <p className="text-white/40 text-sm mt-0.5">{t.lo}</p>
                <div className="text-xs text-white/30 mt-1">
                  {t.completionPct}% complete · {t.avgScore > 0 ? `${t.avgScore}% avg score` : "Not started"}
                </div>
              </div>

              <button
                onClick={() => toggleAssign(t.id, t.isAssigned)}
                disabled={saving === t.id}
                className={`ml-4 flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-sm font-medium cursor-pointer ${
                  t.isAssigned
                    ? "bg-[#FFD700]/20 border-[#FFD700]/40 text-[#FFD700] hover:bg-[#FFD700]/10"
                    : "border-white/20 text-white/50 hover:border-[#FFD700]/40 hover:text-[#FFD700] hover:bg-[#FFD700]/5"
                } disabled:opacity-50`}
              >
                {saving === t.id ? (
                  "..."
                ) : t.isAssigned ? (
                  <><CheckCircle className="w-4 h-4" /> Assigned</>
                ) : (
                  "Assign"
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

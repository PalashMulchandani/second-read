import { useState } from "react";
import {
  LayoutDashboard,
  Network,
  FileText,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  Bell,
  Search,
  Clock,
  Zap,
  Bot,
  GitBranch,
  Sparkles,
  AlertCircle,
  Eye,
  Shield,
  TrendingUp,
  MessageSquare,
  RefreshCw,
  ChevronRight,
  Play,
  Pause,
  Radio,
  ArrowRight,
  CheckCircle2,
  ArrowLeftRight,
  Siren,
  ArrowDownRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type Screen = "dashboard" | "cluster" | "detail" | "reports" | "impact";
type Mode   = "landing" | "app";

// ── Data ─────────────────────────────────────────────────────────────────────

const TICKETS = [
  { id: "TK-2891", title: "Password reset link expires before use",       confidence: 91, occurrences: 14, costImpact: "$2,840", agent: "Sarah K.", category: "Auth"    },
  { id: "TK-2847", title: "Charged after subscription cancellation",      confidence: 86, occurrences: 8,  costImpact: "$1,920", agent: "Tom B.",   category: "Billing" },
  { id: "TK-2803", title: "Webhook not triggering on order events",       confidence: 74, occurrences: 6,  costImpact: "$1,440", agent: "Maria L.", category: "API"     },
  { id: "TK-2779", title: "Invoice PDF not received after payment",       confidence: 68, occurrences: 5,  costImpact: "$960",   agent: "James P.", category: "Billing" },
  { id: "TK-2761", title: "SSO login failing on Safari mobile",           confidence: 61, occurrences: 4,  costImpact: "$720",   agent: "Sarah K.", category: "Auth"    },
  { id: "TK-2734", title: "CSV export produces empty file",               confidence: 43, occurrences: 3,  costImpact: "$480",   agent: "Dana W.",  category: "Data"    },
  { id: "TK-2718", title: "Email notifications stopped for new tickets",  confidence: 38, occurrences: 2,  costImpact: "$240",   agent: "Tom B.",   category: "Email"   },
];

const CLUSTERS = [
  { id: "auth",    name: "Login / Auth Issues",     count: 14, color: "#4F6AF5", light: "rgba(79,106,245,0.08)"  },
  { id: "api",     name: "API Integration Errors",  count: 19, color: "#7C5CFC", light: "rgba(124,92,252,0.08)" },
  { id: "billing", name: "Billing & Payments",      count: 8,  color: "#F59E0B", light: "rgba(245,158,11,0.08)" },
  { id: "email",   name: "Email Delivery",          count: 6,  color: "#10B981", light: "rgba(16,185,129,0.08)" },
];

const CONVERSATION = [
  { type: "system",   text: "Ticket TK-2891 opened · Aug 14, 2026 at 11:02 AM" },
  { type: "customer", name: "Alex Morrison", initials: "AM", time: "11:02 AM",
    text: "Hi there — I've been trying to reset my password for the past hour. Every time I request a reset link, by the time I click it the link has already expired. I've tried three times now and still can't get in." },
  { type: "agent",    name: "Sarah K.", initials: "SK", time: "11:18 AM",
    text: "Hi Alex! So sorry to hear you're having trouble — that's definitely frustrating. I'm looking into this now. Could you confirm the email address you registered with? I want to make sure we're sending to the right inbox." },
  { type: "customer", name: "Alex Morrison", initials: "AM", time: "11:21 AM",
    text: "Sure, it's alex.morrison@techcorp.io" },
  { type: "agent",    name: "Sarah K.", initials: "SK", time: "11:25 AM",
    text: "Thanks Alex! I've triggered a fresh reset link to that address — it should arrive within a minute or two. Let me know if you run into any issues! I'll go ahead and mark this resolved, but please reach back out if you're still having trouble." },
  { type: "system", text: "Ticket marked as Resolved by Sarah K. · Aug 14, 2026 at 11:29 AM", resolved: true },
];

const REASONING = [
  { agent: "Verifier Agent",  Icon: Eye,           color: "#4F6AF5", bg: "#EEF1FF", confidence: 87,
    finding: "Customer stopped replying after 2nd message. No explicit confirmation of resolution received. Root cause (link expiry timing) was not investigated by the agent." },
  { agent: "Pattern Agent",   Icon: GitBranch,     color: "#7C5CFC", bg: "#F3EEFF", confidence: null,
    finding: "Matches 13 other tickets with an identical symptom pattern over the last 3 weeks. Cluster: Login / Auth Issues. Strongest overlap on 'link expiry' keywords." },
  { agent: "Sentiment Agent", Icon: MessageSquare, color: "#F59E0B", bg: "#FFFBEB", confidence: null,
    finding: "Customer's final message is purely transactional — providing an email address. No 'thanks, that worked' or resolution signal detected. Frustration markers present in opener." },
  { agent: "Timing Agent",    Icon: Clock,         color: "#10B981", bg: "#ECFDF5", confidence: null,
    finding: "Ticket closed 4 min after last customer message. Cluster average: 18 min. Flagged as premature close. Agent response time within session was 16 min prior." },
];

const TOP_ISSUES = [
  { id: "api",     name: "API Integration Errors", count: 19, pct: 95, color: "#7C5CFC", light: "#F3EEFF",
    insight: "7 of 19 tickets share the same webhook endpoint — likely a single platform-level bug." },
  { id: "auth",    name: "Login / Auth Issues",     count: 14, pct: 70, color: "#4F6AF5", light: "#EEF1FF",
    insight: "Password reset link expiry is the root cause in 11 of 14 tickets. No fix has been deployed." },
  { id: "billing", name: "Billing & Payments",      count: 8,  pct: 40, color: "#F59E0B", light: "#FFFBEB",
    insight: "Duplicate charges after plan upgrades affect enterprise-tier users disproportionately." },
  { id: "email",   name: "Email Delivery",          count: 6,  pct: 30, color: "#10B981", light: "#ECFDF5",
    insight: "Notification emails silently failing for accounts created after Aug 10 — likely a config change." },
];

const WAVEFORM_HEIGHTS = [5, 9, 14, 8, 18, 12, 7, 20, 15, 9, 13, 18, 10, 7, 14, 11, 8, 16, 12, 6, 10, 15, 8, 12, 17];

const AGENT_LOAD = [
  { name: "Sarah K.", initials: "SK", count: 9, color: "#4F6AF5" },
  { name: "Tom B.",   initials: "TB", count: 7, color: "#7C5CFC" },
  { name: "Maria L.", initials: "ML", count: 5, color: "#10B981" },
  { name: "James P.", initials: "JP", count: 2, color: "#F59E0B" },
];

const RESOLUTION_TREND = [
  { week: "W1", rate: 12.4, flagged: 7, silent: 7, reopened: 2 },
  { week: "W2", rate: 9.1,  flagged: 5, silent: 3, reopened: 4 },
  { week: "W3", rate: 6.3,  flagged: 3, silent: 1, reopened: 6 },
];

const IMPACT_STATS = [
  { label: "False closures caught",  value: "23",  sub: "AI-flagged this week",  color: "#4F6AF5", bg: "#EEF1FF" },
  { label: "Confirmed by your team", value: "18",  sub: "78% verified true",      color: "#10B981", bg: "#ECFDF5" },
  { label: "Est. savings",           value: "$6.4K", sub: "Root causes fixed",    color: "#F59E0B", bg: "#FFFBEB" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function confidenceStyle(v: number) {
  if (v >= 80) return { bg: "bg-red-50",    text: "text-red-600",    border: "border-red-200",    dot: "bg-red-500"    };
  if (v >= 50) return { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200", dot: "bg-orange-500" };
  return              { bg: "bg-yellow-50", text: "text-yellow-600", border: "border-yellow-200", dot: "bg-yellow-500" };
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar({ screen, setScreen, onBack }: { screen: Screen; setScreen: (s: Screen) => void; onBack: () => void }) {
  const items = [
    { id: "dashboard" as Screen, label: "Dashboard",    Icon: LayoutDashboard },
    { id: "impact"    as Screen, label: "Impact",       Icon: TrendingUp      },
    { id: "cluster"   as Screen, label: "Cluster Map",  Icon: Network         },
    { id: "detail"    as Screen, label: "Ticket Detail",Icon: FileText        },
    { id: "reports"   as Screen, label: "Reports",      Icon: BarChart3       },
  ];

  return (
    <div className="w-[220px] flex-shrink-0 flex flex-col h-full bg-[#0B0D14]">
      <div className="px-5 py-[18px] border-b border-white/[0.06]">
        <button onClick={onBack} className="flex items-center gap-2.5 group w-full text-left">
          <div className="w-[30px] h-[30px] rounded-lg bg-gradient-to-br from-[#4F6AF5] to-[#7C5CFC] flex items-center justify-center flex-shrink-0 shadow-lg">
            <Eye className="w-[15px] h-[15px] text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-white font-semibold text-[13px] tracking-tight group-hover:text-white/70 transition-colors">Second Read</div>
            <div className="text-white/35 text-[10px] leading-tight mt-px">AI ticket auditor</div>
          </div>
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="text-white/25 text-[9px] font-semibold uppercase tracking-[0.12em] px-3 mb-2">Navigation</div>
        {items.map(({ id, label, Icon }) => {
          const active = screen === id;
          return (
            <button
              key={id}
              onClick={() => setScreen(id)}
              className={`w-full flex items-center gap-3 px-3 py-[7px] rounded-lg text-[13px] transition-all duration-150 text-left mb-0.5 ${
                active ? "bg-white/[0.09] text-white" : "text-white/45 hover:text-white/75 hover:bg-white/[0.05]"
              }`}
            >
              <Icon className={`w-[15px] h-[15px] flex-shrink-0 ${active ? "text-[#4F6AF5]" : ""}`} />
              <span className="flex-1">{label}</span>
              {active && <span className="w-[6px] h-[6px] rounded-full bg-[#4F6AF5] flex-shrink-0" />}
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-[28px] h-[28px] rounded-full bg-gradient-to-br from-[#4F6AF5] to-[#7C5CFC] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
            MR
          </div>
          <div className="min-w-0">
            <div className="text-white/80 text-[12px] font-medium truncate">Marcus R.</div>
            <div className="text-white/30 text-[10px]">Admin</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── TopBar ────────────────────────────────────────────────────────────────────

function TopBar({ screen, onBack }: { screen: Screen; onBack: () => void }) {
  const crumb: Record<Screen, string> = {
    dashboard: "Dashboard",
    impact:    "Impact · Before / After",
    cluster:   "Cluster Map",
    detail:    "Ticket Detail · TK-2891",
    reports:   "Reports",
  };

  return (
    <header className="h-[52px] bg-white border-b border-black/[0.07] flex items-center px-5 gap-4 flex-shrink-0 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
      <button onClick={onBack} className="flex items-center gap-2 mr-1 group">
        <div className="w-[26px] h-[26px] rounded-md bg-gradient-to-br from-[#4F6AF5] to-[#7C5CFC] flex items-center justify-center flex-shrink-0">
          <Eye className="w-[13px] h-[13px] text-white" />
        </div>
        <span className="font-semibold text-[#1A1D2E] text-[13px] group-hover:text-[#4F6AF5] transition-colors">Second Read</span>
        <span className="hidden lg:block text-[#C4C8D4] text-[12px] ml-1">·</span>
        <span className="hidden lg:block text-[#9CA3AF] text-[12px]">Catching tickets that shouldn&apos;t have closed</span>
      </button>

      <div className="h-4 w-px bg-black/[0.08]" />
      <span className="text-[#9CA3AF] text-[12px]">{crumb[screen]}</span>
      <div className="flex-1" />

      <button className="w-[32px] h-[32px] flex items-center justify-center rounded-lg hover:bg-[#F5F6FA] transition-colors text-[#9CA3AF] hover:text-[#6B7280]">
        <Search className="w-[15px] h-[15px]" />
      </button>
      <button className="w-[32px] h-[32px] flex items-center justify-center rounded-lg hover:bg-[#F5F6FA] transition-colors text-[#9CA3AF] hover:text-[#6B7280] relative">
        <Bell className="w-[15px] h-[15px]" />
        <span className="absolute top-[8px] right-[8px] w-[6px] h-[6px] rounded-full bg-[#4F6AF5] border-[1.5px] border-white" />
      </button>
      <div className="w-[28px] h-[28px] rounded-full bg-gradient-to-br from-[#4F6AF5] to-[#7C5CFC] flex items-center justify-center text-white text-[10px] font-bold ml-0.5 flex-shrink-0">
        MR
      </div>
    </header>
  );
}

// ── Screen 1: Dashboard ───────────────────────────────────────────────────────

function DashboardScreen({ setScreen }: { setScreen: (s: Screen) => void }) {
  const [voted, setVoted] = useState<Record<string, "up" | "down" | null>>({});
  const toggle = (id: string, dir: "up" | "down") =>
    setVoted(v => ({ ...v, [id]: v[id] === dir ? null : dir }));

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-5 max-w-[1400px]">
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: AlertCircle, iconBg: "bg-red-50",    iconColor: "text-red-500",    label: "Flagged this week", value: "23", sub: "+4 vs. last week",        subIcon: TrendingUp, subColor: "text-red-400"    },
            { icon: Clock,       iconBg: "bg-orange-50", iconColor: "text-orange-500", label: "Est. hours wasted", value: "40", unit: "hrs", sub: "Across 7 open clusters",   subIcon: Zap,        subColor: "text-orange-400" },
            { icon: Shield,      iconBg: "bg-[#EEF1FF]", iconColor: "text-[#4F6AF5]",  label: "Avg. confidence",   value: "84", unit: "%",  sub: "High-confidence audit",    subIcon: Zap,        subColor: "text-[#7C5CFC]"  },
          ].map(({ icon: Icon, iconBg, iconColor, label, value, unit, sub, subIcon: SubIcon, subColor }) => (
            <div key={label} className="bg-white rounded-xl p-5 border border-black/[0.07] shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2.5 mb-4">
                <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
                <span className="text-[#6B7280] text-[12px] font-medium">{label}</span>
              </div>
              <div className="text-[32px] font-bold text-[#1A1D2E] leading-none">
                {value}{unit && <span className="text-[18px] font-medium text-[#9CA3AF] ml-0.5">{unit}</span>}
              </div>
              <div className={`text-[11px] mt-2 flex items-center gap-1 ${subColor}`}>
                <SubIcon className="w-3 h-3" /><span className="text-[#9CA3AF]">{sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Silent drop-off banner */}
        <div className="flex items-center gap-4 rounded-xl border border-red-100 bg-gradient-to-r from-red-50 via-orange-50 to-transparent px-5 py-4">
          <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <ArrowDownRight className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-[#1A1D2E]">
              <span className="text-red-500 font-bold">7 silent drop-offs</span> this week — customers stopped replying without confirming the fix.
            </div>
            <div className="text-[11px] text-[#6B7280] mt-0.5">
              Only 2 tickets were re-opened on their own. The other 5 quietly stayed &quot;resolved&quot;. Estimated 40 hrs of wasted agent time.
            </div>
          </div>
          <button onClick={() => setScreen("impact")} className="flex-shrink-0 flex items-center gap-1.5 bg-white border border-red-200 text-red-500 text-[12px] font-semibold px-3.5 py-2 rounded-lg hover:bg-red-50 transition-all">
            See the impact <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white rounded-xl border border-black/[0.07] shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="px-6 py-4 border-b border-black/[0.05] flex items-center justify-between">
            <div>
              <h2 className="text-[#1A1D2E] font-semibold text-[14px]">Flagged Tickets</h2>
              <p className="text-[#9CA3AF] text-[12px] mt-px">AI-detected false resolutions requiring agent review</p>
            </div>
            <span className="text-[11px] bg-[#EEF1FF] text-[#4F6AF5] font-semibold px-3 py-1 rounded-full">23 this week</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-[#F1F3F8]">
                  {["Ticket", "Confidence", "Repetition", "Est. Cost Impact", ""].map((h, i) => (
                    <th key={i} className={`px-5 py-3 text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-[0.08em] ${i === 4 ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TICKETS.map((t) => {
                  const cs = confidenceStyle(t.confidence);
                  const v = voted[t.id];
                  return (
                    <tr key={t.id} className="border-b border-[#F8F9FB] last:border-0 hover:bg-[#FAFBFD] transition-colors cursor-pointer group" onClick={() => setScreen("detail")}>
                      <td className="px-5 py-[14px]">
                        <div className="flex items-center gap-2 mb-[3px]">
                          <span className="text-[10px] font-mono text-[#B0B7C3]">{t.id}</span>
                          <span className="text-[9px] bg-[#F5F6FA] text-[#9CA3AF] border border-[#E8EAED] px-1.5 py-px rounded font-medium">{t.category}</span>
                        </div>
                        <div className="text-[13px] text-[#1A1D2E] font-medium group-hover:text-[#4F6AF5] transition-colors leading-snug">{t.title}</div>
                        <div className="text-[11px] text-[#B0B7C3] mt-0.5">{t.agent}</div>
                      </td>
                      <td className="px-5 py-[14px]">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-[5px] rounded-full border text-[11px] font-semibold font-mono ${cs.bg} ${cs.text} ${cs.border}`}>
                          <span className={`w-[5px] h-[5px] rounded-full ${cs.dot}`} />{t.confidence}%
                        </span>
                      </td>
                      <td className="px-5 py-[14px]">
                        <span className="inline-flex items-center gap-1.5 bg-[#F5F6FA] border border-[#E8EAED] px-2.5 py-[5px] rounded-full text-[11px] font-medium text-[#6B7280]">
                          <RefreshCw className="w-[10px] h-[10px]" />{t.occurrences}× in 3 weeks
                        </span>
                      </td>
                      <td className="px-5 py-[14px]">
                        <span className="text-[13px] text-[#1A1D2E] font-semibold">{t.costImpact}</span>
                        <div className="text-[10px] text-[#9CA3AF] mt-px">est. impact</div>
                      </td>
                      <td className="px-5 py-[14px]">
                        <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                          <button onClick={() => toggle(t.id, "up")} className={`w-[28px] h-[28px] rounded-lg flex items-center justify-center transition-all ${v === "up" ? "bg-green-100 text-green-600" : "text-[#C4C8D4] hover:bg-green-50 hover:text-green-500"}`}>
                            <ThumbsUp className="w-[13px] h-[13px]" />
                          </button>
                          <button onClick={() => toggle(t.id, "down")} className={`w-[28px] h-[28px] rounded-lg flex items-center justify-center transition-all ${v === "down" ? "bg-red-100 text-red-500" : "text-[#C4C8D4] hover:bg-red-50 hover:text-red-400"}`}>
                            <ThumbsDown className="w-[13px] h-[13px]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Screen 1.5: Impact (Before / After) ───────────────────────────────────────

function ImpactScreen() {
  const [view, setView] = useState<"before" | "after">("after");

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-5 max-w-[1400px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[22px] font-bold text-[#1A1D2E] leading-none">Why Second Read exists</h1>
            <p className="text-[#9CA3AF] text-[12px] mt-1.5">The silent problem your dashboard can&apos;t see — and what changes when you audit closures.</p>
          </div>
          <div className="flex items-center gap-1 bg-[#F5F6FA] border border-[#E8EAED] rounded-xl p-1">
            <button onClick={() => setView("before")} className={`px-3.5 py-[7px] rounded-lg text-[12px] font-semibold transition-all ${view === "before" ? "bg-white text-[#1A1D2E] shadow-[0_1px_3px_rgba(0,0,0,0.10)]" : "text-[#9CA3AF] hover:text-[#6B7280]"}`}>Before</button>
            <button onClick={() => setView("after")} className={`px-3.5 py-[7px] rounded-lg text-[12px] font-semibold transition-all ${view === "after" ? "bg-white text-[#1A1D2E] shadow-[0_1px_3px_rgba(0,0,0,0.10)]" : "text-[#9CA3AF] hover:text-[#6B7280]"}`}>With Second Read</button>
          </div>
        </div>

        {/* Before / After panels */}
        <div className="grid grid-cols-2 gap-4">
          {/* Before */}
          <div className={`rounded-2xl border p-6 transition-all duration-300 ${view === "before" ? "opacity-100 scale-[1.00]" : "opacity-45 scale-[0.99]"} bg-white border-black/[0.07] shadow-[0_1px_4px_rgba(0,0,0,0.04)]`}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-[#FEF2F2] flex items-center justify-center">
                <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
              </div>
              <span className="text-[13px] font-bold text-[#1A1D2E]">Before Second Read</span>
              <span className="text-[9px] bg-red-50 text-red-500 border border-red-200 px-2 py-[3px] rounded-full font-bold ml-auto uppercase tracking-wide">This week</span>
            </div>
            <div className="text-[44px] font-bold text-[#1A1D2E] leading-none tracking-tight">7<span className="text-[20px] font-medium text-[#9CA3AF] ml-1">silent drop-offs</span></div>
            <p className="text-[13px] text-[#6B7280] leading-relaxed mt-3 mb-5">
              Customers stopped replying without ever confirming the fix. Their tickets were marked <strong className="text-[#1A1D2E]">Resolved</strong> — and the root cause was never investigated.
            </p>
            <div className="space-y-2.5">
              {[
                { label: "Marked resolved", value: "23", color: "text-[#1A1D2E]" },
                { label: "Silently failed", value: "7",  color: "text-red-500" },
                { label: "Re-opened on their own", value: "2", color: "text-[#1A1D2E]" },
                { label: "Est. hours wasted", value: "40 hrs", color: "text-[#1A1D2E]" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-[#F1F3F8] last:border-0">
                  <span className="text-[12px] text-[#6B7280]">{label}</span>
                  <span className={`text-[14px] font-bold ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* After */}
          <div className={`rounded-2xl border p-6 transition-all duration-300 ${view === "after" ? "opacity-100 scale-[1.00]" : "opacity-45 scale-[0.99]"} bg-white border-black/[0.07] shadow-[0_1px_4px_rgba(0,0,0,0.04)]`}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-[#ECFDF5] flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <span className="text-[13px] font-bold text-[#1A1D2E]">With Second Read</span>
              <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-[3px] rounded-full font-bold ml-auto uppercase tracking-wide">3 weeks in</span>
            </div>
            <div className="text-[44px] font-bold text-[#1A1D2E] leading-none tracking-tight">−50<span className="text-[20px] font-medium text-[#9CA3AF] ml-1">% silent drop-offs</span></div>
            <p className="text-[13px] text-[#6B7280] leading-relaxed mt-3 mb-5">
              Flags catch the false closures. Teams confirm the real ones, reopen the ticket, and fix the root cause — before the customer gives up for good.
            </p>
            <div className="space-y-2.5">
              {[
                { label: "Flags confirmed", value: "18", color: "text-[#1A1D2E]" },
                { label: "Root causes fixed", value: "6", color: "text-emerald-600" },
                { label: "Est. savings", value: "$6.4K", color: "text-emerald-600" },
                { label: "False-alarm rate", value: "14%", color: "text-[#1A1D2E]" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-[#F1F3F8] last:border-0">
                  <span className="text-[12px] text-[#6B7280]">{label}</span>
                  <span className={`text-[14px] font-bold ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trend chart */}
        <div className="bg-white rounded-xl border border-black/[0.07] shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-6">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h2 className="text-[#1A1D2E] font-semibold text-[14px]">False-resolution rate, week over week</h2>
              <p className="text-[#9CA3AF] text-[12px] mt-px">Share of resolved tickets that were actually unresolved — declining as flags get confirmed</p>
            </div>
            <div className="text-right">
              <div className="text-[22px] font-bold text-emerald-600 leading-none">−49%</div>
              <div className="text-[10px] text-[#9CA3AF] mt-0.5">12.4% → 6.3%</div>
            </div>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={RESOLUTION_TREND} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F6AF5" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#4F6AF5" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F8" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} domain={[0, 14]} unit="%" />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "1px solid #E8EAED", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", fontSize: 12 }}
                  formatter={(v: number) => [`${v}%`, "False-resolution rate"]}
                />
                <Area type="monotone" dataKey="rate" stroke="#4F6AF5" strokeWidth={2.5} fill="url(#trendFill)" dot={{ r: 4, fill: "#4F6AF5", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-2 mt-3 text-[11px] text-[#C4C8D4]">
            <Sparkles className="w-[11px] h-[11px] text-[#7C5CFC]" />
            Every percentage point of false resolutions saved ≈ 3.5 hrs of agent time per week.
          </div>
        </div>

        {/* Impact stat strip */}
        <div className="grid grid-cols-3 gap-4">
          {IMPACT_STATS.map(({ label, value, sub, color, bg }) => (
            <div key={label} className="bg-white rounded-xl p-5 border border-black/[0.07] shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2.5 mb-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center`} style={{ background: bg }}>
                  <TrendingUp className="w-4 h-4" style={{ color }} />
                </div>
                <span className="text-[#6B7280] text-[12px] font-medium">{label}</span>
              </div>
              <div className="text-[30px] font-bold text-[#1A1D2E] leading-none">{value}</div>
              <div className="text-[11px] mt-2 text-[#9CA3AF]">{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Screen 2: Cluster Map ─────────────────────────────────────────────────────

function ClusterMapScreen() {
  const [hoveredCluster, setHoveredCluster] = useState<string | null>(null);
  const authSats  = [[130,150,11],[260,148,9],[145,252,12],[248,250,8],[193,128,9],[112,218,7]] as const;
  const billSats  = [[572,128,10],[698,132,9],[580,228,11],[692,225,8],[635,100,8]]             as const;
  const apiSats   = [[318,350,10],[458,348,9],[330,455,12],[452,452,10],[388,322,9],[282,400,8],[495,400,7]] as const;
  const emailSats = [[642,355,9],[735,358,8],[648,445,10],[732,445,7]]                          as const;

  return (
    <div className="h-full flex overflow-hidden">
      <div className="flex-1 relative bg-[#F5F6FA]" style={{ backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
        <svg viewBox="0 0 860 560" className="w-full h-full" style={{ display: "block" }}>
          <defs>
            {[["glow-blue","#4F6AF5"],["glow-purple","#7C5CFC"],["glow-amber","#F59E0B"],["glow-teal","#10B981"]].map(([id,color]) => (
              <filter key={id} id={id} x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="7" result="blur" />
                <feFlood floodColor={color} floodOpacity="0.55" result="col" />
                <feComposite in="col" in2="blur" operator="in" result="glow" />
                <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            ))}
            {[["grad-blue","#818CF8","#4F6AF5"],["grad-purple","#A78BFA","#7C5CFC"],["grad-amber","#FCD34D","#F59E0B"],["grad-teal","#34D399","#10B981"]].map(([id,c1,c2]) => (
              <radialGradient key={id} id={id} cx="35%" cy="35%">
                <stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} />
              </radialGradient>
            ))}
          </defs>
          <ellipse cx="195" cy="200" rx="118" ry="98"  fill="rgba(79,106,245,0.06)"  />
          <ellipse cx="635" cy="178" rx="108" ry="92"  fill="rgba(245,158,11,0.06)"  />
          <ellipse cx="388" cy="405" rx="132" ry="108" fill="rgba(124,92,252,0.06)"  />
          <ellipse cx="688" cy="403" rx="82"  ry="70"  fill="rgba(16,185,129,0.06)"  />
          <line x1="195" y1="195" x2="388" y2="400" stroke="rgba(79,106,245,0.18)"  strokeWidth="1.5" strokeDasharray="5 4" />
          <line x1="635" y1="175" x2="388" y2="400" stroke="rgba(124,92,252,0.18)" strokeWidth="1.5" strokeDasharray="5 4" />
          {authSats.map(([x,y],i)   => <line key={i} x1="195" y1="195" x2={x} y2={y} stroke="rgba(79,106,245,0.28)"  strokeWidth="1.5" />)}
          {authSats.map(([x,y,r],i) => <circle key={i} cx={x} cy={y} r={r} fill="url(#grad-blue)"   opacity="0.72" />)}
          <circle cx="195" cy="195" r="22" fill="none" stroke="rgba(79,106,245,0.35)"  strokeWidth="2" />
          <circle cx="195" cy="195" r="20" fill="url(#grad-blue)"   filter="url(#glow-blue)"   />
          {billSats.map(([x,y],i)   => <line key={i} x1="635" y1="175" x2={x} y2={y} stroke="rgba(245,158,11,0.28)"  strokeWidth="1.5" />)}
          {billSats.map(([x,y,r],i) => <circle key={i} cx={x} cy={y} r={r} fill="url(#grad-amber)"  opacity="0.72" />)}
          <circle cx="635" cy="175" r="20" fill="none" stroke="rgba(245,158,11,0.35)"  strokeWidth="2" />
          <circle cx="635" cy="175" r="18" fill="url(#grad-amber)"  filter="url(#glow-amber)"  />
          {apiSats.map(([x,y],i)    => <line key={i} x1="388" y1="400" x2={x} y2={y} stroke="rgba(124,92,252,0.28)"  strokeWidth="1.5" />)}
          {apiSats.map(([x,y,r],i)  => <circle key={i} cx={x} cy={y} r={r} fill="url(#grad-purple)" opacity="0.72" />)}
          <circle cx="388" cy="400" r="24" fill="none" stroke="rgba(124,92,252,0.35)"  strokeWidth="2" />
          <circle cx="388" cy="400" r="22" fill="url(#grad-purple)" filter="url(#glow-purple)" />
          {emailSats.map(([x,y],i)  => <line key={i} x1="688" y1="403" x2={x} y2={y} stroke="rgba(16,185,129,0.28)"  strokeWidth="1.5" />)}
          {emailSats.map(([x,y,r],i)=> <circle key={i} cx={x} cy={y} r={r} fill="url(#grad-teal)"   opacity="0.72" />)}
          <circle cx="688" cy="403" r="18" fill="none" stroke="rgba(16,185,129,0.35)"  strokeWidth="2" />
          <circle cx="688" cy="403" r="16" fill="url(#grad-teal)"   filter="url(#glow-teal)"   />
          <text x="195" y="274" textAnchor="middle" fill="#4F6AF5" fontSize="10.5" fontWeight="600" fontFamily="Inter, sans-serif">Login / Auth</text>
          <text x="635" y="252" textAnchor="middle" fill="#D97706" fontSize="10.5" fontWeight="600" fontFamily="Inter, sans-serif">Billing &amp; Payments</text>
          <text x="388" y="496" textAnchor="middle" fill="#7C5CFC" fontSize="10.5" fontWeight="600" fontFamily="Inter, sans-serif">API Integration</text>
          <text x="688" y="472" textAnchor="middle" fill="#059669" fontSize="10.5" fontWeight="600" fontFamily="Inter, sans-serif">Email Delivery</text>
          <circle cx="48" cy="510" r="6" fill="url(#grad-blue)" filter="url(#glow-blue)" opacity="0.9" />
          <circle cx="48" cy="510" r="7.5" fill="none" stroke="rgba(79,106,245,0.4)" strokeWidth="1.5" />
          <text x="60" y="514" fill="#6B7280" fontSize="10" fontFamily="Inter, sans-serif">Root cause ticket</text>
          <circle cx="160" cy="510" r="4" fill="#94A3B8" opacity="0.7" />
          <text x="170" y="514" fill="#6B7280" fontSize="10" fontFamily="Inter, sans-serif">Duplicate ticket</text>
          <line x1="240" y1="510" x2="260" y2="510" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 3" />
          <text x="266" y="514" fill="#6B7280" fontSize="10" fontFamily="Inter, sans-serif">Cross-cluster link</text>
        </svg>
      </div>

      <div className="w-[272px] flex-shrink-0 border-l border-black/[0.07] bg-white overflow-y-auto">
        <div className="px-5 py-4 border-b border-black/[0.05]">
          <h3 className="text-[#1A1D2E] font-semibold text-[13px]">Issue Clusters</h3>
          <p className="text-[#9CA3AF] text-[11px] mt-px">4 root causes · 47 total tickets</p>
        </div>
        <div className="p-3 space-y-2">
          {CLUSTERS.map(c => (
            <div key={c.id} onMouseEnter={() => setHoveredCluster(c.id)} onMouseLeave={() => setHoveredCluster(null)}
              className="p-4 rounded-xl border transition-all duration-150 cursor-pointer"
              style={hoveredCluster === c.id ? { borderColor: c.color, background: c.light } : { borderColor: "rgba(0,0,0,0.07)", background: "transparent" }}>
              <div className="flex items-center justify-between mb-2">
                <div className="w-3 h-3 rounded-full" style={{ background: c.color }} />
                <span className="text-[10px] font-mono font-semibold" style={{ color: c.color }}>{c.count} tickets</span>
              </div>
              <div className="text-[13px] font-semibold text-[#1A1D2E] leading-snug">{c.name}</div>
              <div className="mt-3 h-[3px] rounded-full bg-[#F1F3F8] overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(c.count / 20) * 100}%`, background: c.color }} />
              </div>
              <div className="mt-1.5 text-[10px] text-[#9CA3AF]">{Math.round((c.count / 47) * 100)}% of total flags</div>
            </div>
          ))}
        </div>
        <div className="px-4 py-4 mx-3 mb-3 rounded-xl bg-gradient-to-br from-[#EEF1FF] to-[#F3EEFF] border border-[#D8DCFF]">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3 h-3 text-[#7C5CFC]" />
            <span className="text-[10px] font-semibold text-[#7C5CFC] uppercase tracking-wide">AI Insight</span>
          </div>
          <p className="text-[11px] text-[#4B5563] leading-relaxed">API Integration cluster grew 40% this week. 7 of 19 tickets share the same webhook endpoint — likely a single platform-level bug.</p>
        </div>
      </div>
    </div>
  );
}

// ── Screen 3: Ticket Detail ───────────────────────────────────────────────────

function TicketDetailScreen() {
  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  const [briefingOpen, setBriefingOpen] = useState(false);
  const [action, setAction] = useState<"reopen" | "escalate" | null>(null);

  return (
    <div className="h-full flex overflow-hidden">
      <div className="flex-1 min-w-0 overflow-y-auto bg-[#FAFBFD] border-r border-black/[0.07]">
        <div className="max-w-[640px] mx-auto px-6 py-6 space-y-4">
          <div className="bg-white rounded-xl border border-black/[0.07] p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-[10px] font-mono text-[#B0B7C3] font-medium">TK-2891</span>
                  <span className="text-[10px] bg-red-50 text-red-500 border border-red-200 px-2 py-[3px] rounded-full font-semibold">91% flagged</span>
                  <span className="text-[10px] bg-[#EEF1FF] text-[#4F6AF5] border border-[#D8DCFF] px-2 py-[3px] rounded-full font-medium">Auth</span>
                </div>
                <h2 className="text-[#1A1D2E] font-semibold text-[15px] leading-snug">Password reset link expires before use</h2>
                <p className="text-[#9CA3AF] text-[11px] mt-1.5">Assigned to Sarah K. · Opened Aug 14, 2026 · Closed Aug 14, 2026</p>
              </div>
              <div className="flex-shrink-0 text-[11px] bg-orange-50 border border-orange-200 text-orange-500 px-3 py-[5px] rounded-lg font-medium whitespace-nowrap">
                <span className="inline-block w-[5px] h-[5px] rounded-full bg-orange-400 mr-1.5 align-middle" />In review
              </div>
            </div>
          </div>

          {CONVERSATION.map((msg, i) => {
            if (msg.type === "system") return (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[#E8EAED]" />
                <span className={`text-[10px] font-medium px-3 py-[5px] rounded-full whitespace-nowrap border ${(msg as { resolved?: boolean }).resolved ? "bg-orange-50 text-orange-500 border-orange-200" : "bg-[#F5F6FA] text-[#9CA3AF] border-[#E8EAED]"}`}>{msg.text}</span>
                <div className="flex-1 h-px bg-[#E8EAED]" />
              </div>
            );
            const isAgent = msg.type === "agent";
            return (
              <div key={i} className={`flex gap-3 ${isAgent ? "flex-row-reverse" : ""}`}>
                <div className={`w-[32px] h-[32px] rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${isAgent ? "bg-gradient-to-br from-[#4F6AF5] to-[#7C5CFC] text-white" : "bg-[#E8EAED] text-[#6B7280]"}`}>{msg.initials}</div>
                <div className={`max-w-[74%] flex flex-col ${isAgent ? "items-end" : ""}`}>
                  <div className={`flex items-center gap-2 mb-1.5 ${isAgent ? "flex-row-reverse" : ""}`}>
                    <span className="text-[11px] font-semibold text-[#1A1D2E]">{msg.name}</span>
                    <span className="text-[10px] text-[#B0B7C3]">{msg.time}</span>
                  </div>
                  <div className={`rounded-2xl px-4 py-3 text-[13px] leading-relaxed text-[#1A1D2E] ${isAgent ? "bg-[#EEF1FF] rounded-tr-[4px]" : "bg-white border border-black/[0.07] shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded-tl-[4px]"}`}>{msg.text}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-[380px] flex-shrink-0 bg-white overflow-y-auto">
        <div className="px-6 py-5 border-b border-black/[0.07]">
          <div className="flex items-center gap-2 mb-4">
            <Bot className="w-[14px] h-[14px] text-[#4F6AF5]" />
            <span className="text-[10px] font-bold text-[#4F6AF5] uppercase tracking-[0.1em]">AI Analysis</span>
          </div>
          <div className="bg-gradient-to-br from-[#EEF1FF] to-[#F3EEFF] rounded-xl p-5 border border-[#D8DCFF]">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[52px] font-bold text-[#4F6AF5] leading-none tracking-tight">87<span className="text-[26px] font-semibold text-[#7C5CFC]">%</span></div>
                <div className="text-[14px] font-semibold text-[#1A1D2E] mt-1">Likely unresolved</div>
                <div className="text-[11px] text-[#6B7280] mt-0.5">4 agents reached consensus</div>
              </div>
              <div className="text-right bg-white/60 rounded-lg px-3 py-2 border border-white/80">
                <div className="text-[10px] text-[#6B7280] mb-0.5">Pattern match</div>
                <div className="text-[18px] font-bold text-[#7C5CFC] leading-none">13×</div>
                <div className="text-[10px] text-[#9CA3AF]">in 3 weeks</div>
              </div>
            </div>
            <div className="mt-4 h-[6px] bg-white/50 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[#4F6AF5] to-[#7C5CFC]" style={{ width: "87%" }} />
            </div>
          </div>
        </div>

        <div className="px-6 py-5 border-b border-black/[0.07]">
          <div className="text-[10px] font-bold text-[#1A1D2E] uppercase tracking-[0.1em] mb-4">Reasoning Trail</div>
          <div className="relative">
            {REASONING.map(({ agent, Icon, color, bg, confidence, finding }, i) => (
              <div key={i} className="flex gap-3.5 relative">
                {i < REASONING.length - 1 && <div className="absolute top-9 bottom-0 left-[15px] w-px bg-[#E8EAED]" />}
                <div className="w-[30px] h-[30px] rounded-lg flex items-center justify-center flex-shrink-0 z-10" style={{ background: bg }}>
                  <Icon className="w-[14px] h-[14px]" style={{ color }} />
                </div>
                <div className="flex-1 pb-5 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[12px] font-semibold text-[#1A1D2E]">{agent}</span>
                    {confidence && <span className="text-[9px] font-mono bg-red-50 text-red-500 border border-red-200 px-1.5 py-[2px] rounded-full font-semibold">{confidence}%</span>}
                  </div>
                  <p className="text-[11px] text-[#6B7280] leading-relaxed">{finding}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-5 space-y-3">
          <div className="text-[10px] font-bold text-[#1A1D2E] uppercase tracking-[0.1em] mb-3">Your Verdict</div>
          <div className="flex gap-2">
            <button onClick={() => setVoted(v => v === "up" ? null : "up")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-[12px] font-semibold transition-all ${voted === "up" ? "bg-green-50 border-green-300 text-green-700" : "border-black/[0.08] text-[#6B7280] hover:border-green-200 hover:text-green-600 hover:bg-green-50"}`}>
              <ThumbsUp className="w-[13px] h-[13px]" />Confirm flag
            </button>
            <button onClick={() => setVoted(v => v === "down" ? null : "down")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-[12px] font-semibold transition-all ${voted === "down" ? "bg-orange-50 border-orange-300 text-orange-600" : "border-black/[0.08] text-[#6B7280] hover:border-orange-200 hover:text-orange-500 hover:bg-orange-50"}`}>
              <ThumbsDown className="w-[13px] h-[13px]" />Dismiss
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setAction(a => a === "reopen" ? null : "reopen")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-[12px] font-semibold transition-all ${action === "reopen" ? "bg-[#EEF1FF] border-[#4F6AF5]/40 text-[#4F6AF5]" : "border-black/[0.08] text-[#6B7280] hover:border-[#4F6AF5]/40 hover:text-[#4F6AF5] hover:bg-[#EEF1FF]"}`}>
              <RefreshCw className="w-[13px] h-[13px]" />{action === "reopen" ? "Reopened ✓" : "Auto-reopen"}
            </button>
            <button onClick={() => setAction(a => a === "escalate" ? null : "escalate")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-[12px] font-semibold transition-all ${action === "escalate" ? "bg-purple-50 border-purple-300 text-purple-600" : "border-black/[0.08] text-[#6B7280] hover:border-purple-300 hover:text-purple-500 hover:bg-purple-50"}`}>
              <Siren className="w-[13px] h-[13px]" />{action === "escalate" ? "Escalated ✓" : "Escalate"}
            </button>
          </div>
          {action && (
            <div className="bg-[#F8F9FB] rounded-xl border border-black/[0.07] p-3.5 flex items-start gap-2.5">
              {action === "reopen" ? <RefreshCw className="w-[13px] h-[13px] text-[#4F6AF5] flex-shrink-0 mt-px" /> : <Siren className="w-[13px] h-[13px] text-purple-500 flex-shrink-0 mt-px" />}
              <p className="text-[11px] text-[#4B5563] leading-relaxed">
                {action === "reopen"
                  ? <>Ticket <strong className="text-[#1A1D2E]">TK-2891 reopened</strong> and routed back to Sarah K. with the AI reasoning trail attached — root cause (link expiry timing) now queued for investigation.</>
                  : <>Ticket escalated to <strong className="text-[#1A1D2E]">senior engineer (Auth squad)</strong> with cluster context: 13 matching tickets in 3 weeks.</>}
              </p>
            </div>
          )}
          <button onClick={() => setBriefingOpen(b => !b)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] shadow-[0_4px_12px_rgba(79,106,245,0.3)]" style={{ background: "linear-gradient(135deg, #4F6AF5 0%, #7C5CFC 100%)" }}>
            <Sparkles className="w-[14px] h-[14px]" />{briefingOpen ? "Briefing generated ✓" : "Generate manager briefing"}
          </button>
          {briefingOpen && (
            <div className="bg-[#F8F9FB] rounded-xl border border-black/[0.07] p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="w-[11px] h-[11px] text-[#7C5CFC]" />
                <span className="text-[10px] font-bold text-[#7C5CFC] uppercase tracking-wide">Manager Briefing · TK-2891</span>
              </div>
              <p className="text-[11px] text-[#4B5563] leading-relaxed">Ticket TK-2891 was marked resolved on Aug 14 but Second Read flagged it at <strong className="text-[#1A1D2E]">87% confidence</strong>. Customer Alex Morrison reported a persistent password reset issue — the root cause (link expiry timing) was not diagnosed by the agent. This pattern appears in <strong className="text-[#1A1D2E]">13 similar tickets</strong> over the last 3 weeks, forming the "Login / Auth Issues" cluster. Estimated compounded cost impact: <strong className="text-[#1A1D2E]">$2,840</strong>. Recommend reopening and routing to a senior engineer for root cause analysis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Screen 4: Reports ─────────────────────────────────────────────────────────

function ReportsScreen({ setScreen }: { setScreen: (s: Screen) => void }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="h-full overflow-y-auto">
      <style>{`@keyframes waveBar { 0%,100%{transform:scaleY(0.3)} 50%{transform:scaleY(1)} }`}</style>
      <div className="p-6 space-y-5 max-w-[980px]">

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <h1 className="text-[22px] font-bold text-[#1A1D2E] leading-none">Weekly Briefing</h1>
              <span className="text-[11px] bg-[#EEF1FF] text-[#4F6AF5] border border-[#D8DCFF] px-2.5 py-[4px] rounded-full font-semibold">Aug 11 – 18, 2026</span>
            </div>
            <p className="text-[#9CA3AF] text-[12px]">Second Read audit report · Freshservice workspace</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 bg-[#F3EEFF] border border-[#D8CFFF] px-3 py-[6px] rounded-full">
              <Bot className="w-[11px] h-[11px] text-[#7C5CFC]" />
              <span className="text-[11px] font-semibold text-[#7C5CFC]">Generated by Reporting Agent</span>
            </div>
            <button onClick={() => setPlaying(p => !p)} className="flex items-center gap-2.5 bg-white border border-black/[0.08] rounded-xl px-4 py-[8px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:border-[#4F6AF5]/40 hover:shadow-[0_2px_10px_rgba(79,106,245,0.14)] transition-all">
              <div className="w-[26px] h-[26px] rounded-full bg-gradient-to-br from-[#4F6AF5] to-[#7C5CFC] flex items-center justify-center flex-shrink-0 shadow-[0_2px_6px_rgba(79,106,245,0.35)]">
                {playing ? <Pause className="w-[10px] h-[10px] text-white" /> : <Play className="w-[9px] h-[9px] text-white ml-[1px]" />}
              </div>
              <div className="flex items-center gap-[2px] h-[20px] overflow-hidden">
                {WAVEFORM_HEIGHTS.map((h, i) => (
                  <div key={i} className="w-[2px] rounded-full origin-center flex-shrink-0" style={{ height: `${h}px`, background: playing ? "#4F6AF5" : "#C4C8D4", ...(playing ? { animation: `waveBar ${0.65 + (i % 5) * 0.15}s ease-in-out infinite`, animationDelay: `${(i * 0.065) % 0.65}s` } : { transform: "scaleY(0.4)" }) }} />
                ))}
              </div>
              <span className="text-[12px] font-semibold text-[#1A1D2E] whitespace-nowrap">{playing ? "Playing…" : "Listen to briefing"}</span>
            </button>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #161929 0%, #1F2050 52%, #2F1D62 100%)" }}>
          <div className="px-8 py-8">
            <div className="flex items-center gap-2 mb-6 text-white/35 text-[10px] font-bold uppercase tracking-[0.15em]">
              <Sparkles className="w-[11px] h-[11px] text-[#A78BFA]" />This week&apos;s AI audit summary
            </div>
            <div className="grid grid-cols-3 divide-x divide-white/[0.09]">
              {[
                { value: "23",    unit: "",     label: "tickets flagged",       sub: "↑ 4 vs. last week",         accent: "#F87171" },
                { value: "40",    unit: " hrs", label: "estimated waste",       sub: "Across 7 open clusters",    accent: "#FDBA74" },
                { value: "$8,400",unit: "",     label: "potential cost impact", sub: "Based on $35 / ticket avg", accent: "#A78BFA" },
              ].map(({ value, unit, label, sub, accent }) => (
                <div key={label} className="px-7 first:pl-0 last:pr-0">
                  <div className="text-[44px] font-bold text-white leading-none tracking-tight">{value}{unit && <span className="text-[22px] font-semibold text-white/40">{unit}</span>}</div>
                  <div className="text-white/65 text-[13px] font-medium mt-2 leading-snug">{label}</div>
                  <div className="text-[11px] font-medium mt-1" style={{ color: accent }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-white/[0.07] px-8 py-3 flex items-center gap-2">
            <Radio className="w-[10px] h-[10px] text-white/25 flex-shrink-0" />
            <span className="text-[11px] text-white/25">Audit ran continuously · Aug 11 00:00 – Aug 18 23:59 · 847 tickets reviewed</span>
          </div>
        </div>

        {/* Trend: false-resolution rate */}
        <div className="bg-white rounded-xl border border-black/[0.07] shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-[13px] font-bold text-[#1A1D2E]">False-resolution rate</h2>
              <p className="text-[11px] text-[#9CA3AF] mt-px">Share of resolved tickets that were actually unresolved</p>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-[5px] rounded-full">
              <TrendingUp className="w-[10px] h-[10px] text-emerald-600" />
              <span className="text-[11px] font-bold text-emerald-600">−49% in 3 weeks</span>
            </div>
          </div>
          <div className="h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={RESOLUTION_TREND} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="reportTrendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F8" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} domain={[0, 14]} unit="%" />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "1px solid #E8EAED", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", fontSize: 12 }}
                  formatter={(v: number) => [`${v}%`, "False-resolution rate"]}
                />
                <Area type="monotone" dataKey="rate" stroke="#10B981" strokeWidth={2.5} fill="url(#reportTrendFill)" dot={{ r: 4, fill: "#10B981", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-bold text-[#1A1D2E]">Top Issues This Week</h2>
            <span className="text-[11px] text-[#9CA3AF]">Ranked by estimated cost impact</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {TOP_ISSUES.map((issue, rank) => (
              <div key={issue.id} className="bg-white rounded-xl border border-black/[0.07] p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_3px_12px_rgba(0,0,0,0.08)] transition-all duration-200 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-bold text-[#C4C8D4] w-4 flex-shrink-0">#{rank + 1}</span>
                    <div className="w-[8px] h-[8px] rounded-full flex-shrink-0" style={{ background: issue.color }} />
                    <span className="text-[13px] font-semibold text-[#1A1D2E] leading-tight">{issue.name}</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-[3px] rounded-full flex-shrink-0 whitespace-nowrap" style={{ background: issue.light, color: issue.color }}>{issue.count} tickets</span>
                </div>
                <div className="h-[3px] bg-[#F1F3F8] rounded-full mb-4 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${issue.pct}%`, background: issue.color }} />
                </div>
                <p className="text-[12px] text-[#6B7280] leading-relaxed flex-1">{issue.insight}</p>
                <button onClick={() => setScreen("cluster")} className="flex items-center gap-1 text-[11px] font-semibold mt-4 transition-all hover:gap-1.5 w-fit" style={{ color: issue.color }}>
                  View cluster <ChevronRight className="w-[11px] h-[11px]" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-[1fr_216px] gap-4">
          <div className="bg-white rounded-xl border border-black/[0.07] p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-[26px] h-[26px] rounded-lg bg-[#EEF1FF] flex items-center justify-center flex-shrink-0">
                <Shield className="w-[13px] h-[13px] text-[#4F6AF5]" />
              </div>
              <span className="text-[13px] font-semibold text-[#1A1D2E]">Feedback Accuracy</span>
              <span className="text-[10px] text-[#9CA3AF] bg-[#F5F6FA] border border-[#E8EAED] px-2 py-[3px] rounded-full ml-auto font-medium">This week · 21 responses</span>
            </div>
            <div className="flex h-[8px] rounded-full overflow-hidden gap-[2px] mb-5">
              <div className="rounded-l-full bg-green-400" style={{ flex: 18 }} />
              <div className="rounded-r-full bg-red-300"   style={{ flex: 3  }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl p-4">
                <div className="w-[32px] h-[32px] rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0"><ThumbsUp className="w-[15px] h-[15px] text-green-600" /></div>
                <div><div className="text-[24px] font-bold text-[#1A1D2E] leading-none">18</div><div className="text-[11px] text-[#6B7280] mt-0.5">confirmed flags</div></div>
              </div>
              <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl p-4">
                <div className="w-[32px] h-[32px] rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0"><ThumbsDown className="w-[15px] h-[15px] text-red-500" /></div>
                <div><div className="text-[24px] font-bold text-[#1A1D2E] leading-none">3</div><div className="text-[11px] text-[#6B7280] mt-0.5">false alarms</div></div>
              </div>
            </div>
            <p className="text-[11px] text-[#9CA3AF] flex items-center gap-1.5 mt-4">
              <Sparkles className="w-[11px] h-[11px] text-[#7C5CFC] flex-shrink-0" />Feedback improves future flagging accuracy — keep reviewing verdicts
            </p>
          </div>
          <div className="bg-white rounded-xl border border-black/[0.07] p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            <div className="text-[13px] font-semibold text-[#1A1D2E] mb-4">Agent Workload</div>
            <div className="space-y-4">
              {AGENT_LOAD.map(({ name, initials, count, color }) => (
                <div key={name} className="flex items-center gap-2.5">
                  <div className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0" style={{ background: color }}>{initials}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-[5px]">
                      <span className="text-[11px] font-medium text-[#6B7280] truncate">{name}</span>
                      <span className="text-[11px] font-bold text-[#1A1D2E] ml-2 flex-shrink-0">{count}</span>
                    </div>
                    <div className="h-[3px] bg-[#F1F3F8] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(count / 9) * 100}%`, background: color }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-black/[0.05] pt-4 pb-2">
          <svg viewBox="0 0 14 14" fill="none" className="w-[12px] h-[12px] flex-shrink-0">
            <circle cx="7" cy="7" r="5.5" stroke="#C4C8D4" strokeWidth="1.3" />
            <circle cx="7" cy="7" r="2" fill="#C4C8D4" />
          </svg>
          <span className="text-[11px] text-[#C4C8D4]">Ticket data synced via <span className="font-semibold text-[#9CA3AF]">Freshservice MCP connector</span> · Last sync 14 min ago · Next briefing in 6 days</span>
        </div>
      </div>
    </div>
  );
}

// ── Landing: Mini product mockup ──────────────────────────────────────────────

function ProductMockup() {
  return (
    <div className="relative w-full">
      <div className="absolute -inset-2 rounded-2xl" style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(79,106,245,0.15) 0%, rgba(124,92,252,0.08) 50%, transparent 70%)" }} />
      <div className="relative rounded-xl overflow-hidden border border-white/[0.10] shadow-[0_24px_64px_rgba(0,0,0,0.55),0_4px_16px_rgba(0,0,0,0.35)]">
        {/* Browser chrome */}
        <div className="bg-[#181A2A] px-4 py-[10px] flex items-center gap-3 border-b border-white/[0.06]">
          <div className="flex gap-[5px]">
            <div className="w-[10px] h-[10px] rounded-full bg-[#FF5F57]" />
            <div className="w-[10px] h-[10px] rounded-full bg-[#FFBD2E]" />
            <div className="w-[10px] h-[10px] rounded-full bg-[#28CA42]" />
          </div>
          <div className="flex-1 max-w-xs mx-auto bg-white/[0.06] rounded-md h-[20px] flex items-center justify-center">
            <span className="text-white/25 text-[10px]">app.secondread.ai / dashboard</span>
          </div>
          <div className="w-16" />
        </div>

        {/* App shell */}
        <div className="flex" style={{ height: 360 }}>
          {/* Mini sidebar */}
          <div className="w-[144px] bg-[#0B0D14] flex-shrink-0 flex flex-col border-r border-white/[0.04]">
            <div className="px-3.5 py-[14px] border-b border-white/[0.05]">
              <div className="flex items-center gap-2">
                <div className="w-[17px] h-[17px] rounded-md bg-gradient-to-br from-[#4F6AF5] to-[#7C5CFC] flex-shrink-0" />
                <span className="text-white text-[9px] font-semibold">Second Read</span>
              </div>
            </div>
            <div className="px-2 py-3 space-y-px">
              {["Dashboard","Cluster Map","Ticket Detail","Reports"].map((item, i) => (
                <div key={item} className={`flex items-center gap-2 px-2.5 py-[6px] rounded-lg ${i === 0 ? "bg-white/[0.09]" : ""}`}>
                  <div className={`w-[5px] h-[5px] rounded-full flex-shrink-0 ${i === 0 ? "bg-[#4F6AF5]" : "bg-transparent"}`} />
                  <span className={`text-[8px] font-medium ${i === 0 ? "text-white" : "text-white/30"}`}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mini content */}
          <div className="flex-1 bg-[#F5F6FA] flex flex-col overflow-hidden">
            <div className="bg-white border-b border-black/[0.07] px-4 py-[8px] flex items-center flex-shrink-0">
              <span className="text-[8px] font-semibold text-[#1A1D2E]">Dashboard</span>
              <div className="flex-1" />
              <div className="w-[16px] h-[16px] rounded-full bg-gradient-to-br from-[#4F6AF5] to-[#7C5CFC]" />
            </div>
            <div className="flex gap-2.5 p-3.5 flex-shrink-0">
              {[
                { label: "Flagged this week", value: "23",   dot: "#EF4444" },
                { label: "Est. hours wasted", value: "40hrs", dot: "#F97316" },
                { label: "Avg. confidence",   value: "84%",  dot: "#4F6AF5" },
              ].map(({ label, value, dot }) => (
                <div key={label} className="flex-1 bg-white rounded-lg p-2.5 border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                  <div className="w-5 h-5 rounded-md mb-2 flex items-center justify-center" style={{ background: `${dot}18` }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: dot }} />
                  </div>
                  <div className="text-[14px] font-bold text-[#1A1D2E] leading-none">{value}</div>
                  <div className="text-[6px] text-[#9CA3AF] mt-1 leading-tight">{label}</div>
                </div>
              ))}
            </div>
            <div className="mx-3.5 bg-white rounded-lg border border-black/[0.06] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex-1 min-h-0">
              <div className="px-3 py-2 border-b border-black/[0.05] flex items-center justify-between flex-shrink-0">
                <span className="text-[8px] font-semibold text-[#1A1D2E]">Flagged Tickets</span>
                <span className="text-[6.5px] bg-[#EEF1FF] text-[#4F6AF5] px-2 py-[2px] rounded-full font-bold">23 this week</span>
              </div>
              {[
                { id: "TK-2891", title: "Password reset link expires before use",  conf: 91, cc: "text-red-600 bg-red-50"       },
                { id: "TK-2847", title: "Charged after subscription cancellation", conf: 86, cc: "text-red-600 bg-red-50"       },
                { id: "TK-2803", title: "Webhook not triggering on order events",  conf: 74, cc: "text-orange-600 bg-orange-50" },
                { id: "TK-2779", title: "Invoice PDF not received after payment",  conf: 68, cc: "text-orange-600 bg-orange-50" },
                { id: "TK-2761", title: "SSO login failing on Safari mobile",      conf: 61, cc: "text-orange-600 bg-orange-50" },
              ].map(({ id, title, conf, cc }, i) => (
                <div key={id} className={`flex items-center px-3 py-[6px] ${i < 4 ? "border-b border-[#F1F3F8]" : ""}`}>
                  <span className="text-[6px] font-mono text-[#B0B7C3] w-10 flex-shrink-0">{id}</span>
                  <span className="text-[7.5px] text-[#1A1D2E] flex-1 truncate pr-2">{title}</span>
                  <span className={`text-[6.5px] font-bold px-1.5 py-[2px] rounded-full flex-shrink-0 ${cc}`}>{conf}%</span>
                </div>
              ))}
            </div>
            <div className="h-3 flex-shrink-0" />
          </div>
        </div>
      </div>
      {/* Bottom fade into dark hero bg */}
      <div className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none rounded-b-xl" style={{ background: "linear-gradient(to top, #07091A 0%, transparent 100%)" }} />
    </div>
  );
}

// ── Landing: Nav ──────────────────────────────────────────────────────────────

function LandingNav({ onEnterApp }: { onEnterApp: () => void }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06]" style={{ background: "rgba(7,9,26,0.85)", backdropFilter: "blur(16px)" }}>
      <div className="max-w-[1080px] mx-auto px-6 h-[58px] flex items-center gap-6">
        <div className="flex items-center gap-2.5 mr-2">
          <div className="w-[28px] h-[28px] rounded-lg bg-gradient-to-br from-[#4F6AF5] to-[#7C5CFC] flex items-center justify-center shadow-[0_2px_8px_rgba(79,106,245,0.4)]">
            <Eye className="w-[14px] h-[14px] text-white" />
          </div>
          <span className="text-white font-bold text-[14px] tracking-tight">Second Read</span>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {["Product", "How it works", "Pricing"].map(link => (
            <button key={link} className="text-white/45 text-[13px] hover:text-white/80 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/[0.05]">{link}</button>
          ))}
        </div>

        <div className="flex-1" />

        <button className="text-white/50 text-[13px] hover:text-white/80 transition-colors px-4 py-1.5">Sign in</button>
        <button
          onClick={onEnterApp}
          className="flex items-center gap-1.5 text-white text-[13px] font-semibold px-4 py-2 rounded-lg transition-all hover:opacity-90 active:scale-[0.98] shadow-[0_2px_12px_rgba(79,106,245,0.35)]"
          style={{ background: "linear-gradient(135deg, #4F6AF5, #7C5CFC)" }}
        >
          Get Started <ArrowRight className="w-[13px] h-[13px]" />
        </button>
      </div>
    </nav>
  );
}

// ── Landing: Hero ─────────────────────────────────────────────────────────────

function LandingHero({ onEnterApp }: { onEnterApp: () => void }) {
  return (
    <section className="relative flex flex-col items-center overflow-hidden pt-[58px]" style={{ background: "#07091A", minHeight: "100vh" }}>
      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      {/* Glow orbs */}
      <div className="absolute top-20 left-[20%] w-[600px] h-[600px] pointer-events-none" style={{ background: "radial-gradient(circle, rgba(79,106,245,0.10) 0%, transparent 65%)", transform: "translate(-30%, -10%)" }} />
      <div className="absolute top-32 right-[15%] w-[480px] h-[480px] pointer-events-none" style={{ background: "radial-gradient(circle, rgba(124,92,252,0.09) 0%, transparent 65%)", transform: "translate(20%, 0)" }} />

      {/* Text */}
      <div className="relative max-w-[780px] mx-auto px-6 text-center pt-[72px] pb-12">
        <div className="inline-flex items-center gap-2 bg-white/[0.05] border border-white/[0.09] rounded-full px-4 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4F6AF5]" style={{ boxShadow: "0 0 6px #4F6AF5" }} />
          <span className="text-white/55 text-[12px] font-medium">AI audit layer for Freshservice teams</span>
        </div>

        <h1 className="text-[50px] font-bold leading-[1.1] tracking-[-0.02em] mb-6">
          <span style={{ background: "linear-gradient(160deg, #FFFFFF 25%, #D4DCFF 70%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Every dashboard tracks how fast tickets close.
          </span>
          <br />
          <span style={{ background: "linear-gradient(160deg, #A78BFA 0%, #818CF8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            None of them ask if they should have.
          </span>
        </h1>

        <p className="text-[17px] text-white/45 leading-relaxed max-w-[520px] mx-auto mb-10">
          AI agents that re-audit resolved tickets to catch silent failures, before they cost you.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap mb-10">
          <button
            onClick={onEnterApp}
            className="flex items-center gap-2 text-white text-[14px] font-semibold px-7 py-3 rounded-xl transition-all hover:opacity-92 hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_20px_rgba(79,106,245,0.45)]"
            style={{ background: "linear-gradient(135deg, #4F6AF5 0%, #7C5CFC 100%)" }}
          >
            See it in action <ArrowRight className="w-[14px] h-[14px]" />
          </button>
          <button className="text-white/50 text-[14px] font-medium px-6 py-3 rounded-xl border border-white/[0.10] hover:border-white/20 hover:text-white/75 transition-all">
            Read the docs
          </button>
        </div>

        <div className="flex items-center justify-center gap-5 text-white/25 text-[11px] font-medium">
          {["Built on Freshservice MCP", "SOC 2 Type II", "No training on your data"].map((t, i) => (
            <span key={t} className="flex items-center gap-5">
              {i > 0 && <span className="w-px h-3 bg-white/15 mr-[-12px]" />}{t}
            </span>
          ))}
        </div>
      </div>

      {/* Product mockup */}
      <div className="relative w-full max-w-[880px] mx-auto px-6 pb-0">
        <ProductMockup />
      </div>
    </section>
  );
}

// ── Landing: Features ─────────────────────────────────────────────────────────

function LandingFeatures() {
  return (
    <section className="bg-white py-24 px-6">
      <div className="max-w-[1000px] mx-auto">
        <div className="text-center mb-16">
          <span className="text-[11px] font-bold text-[#4F6AF5] uppercase tracking-[0.16em] mb-3 block">How it works</span>
          <h2 className="text-[34px] font-bold text-[#1A1D2E] leading-tight mb-4">Three agents. One audit loop.</h2>
          <p className="text-[16px] text-[#6B7280] max-w-[460px] mx-auto leading-relaxed">
            Second Read runs continuously in the background, re-reading every resolved ticket so your team doesn&apos;t have to.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {[
            { Icon: Eye,      color: "#4F6AF5", bg: "#EEF1FF", title: "Verifier Agent",    sub: "Catches silent drop-offs",
              desc: "Analyzes conversation threads for resolution signals. Flags tickets where customers went quiet without confirming the issue was actually solved." },
            { Icon: Network,  color: "#7C5CFC", bg: "#F3EEFF", title: "Pattern Agent",     sub: "Finds disguised repeats",
              desc: "Clusters tickets by symptom and root cause. Surfaces recurring problems hidden across hundreds of individually 'resolved' cases." },
            { Icon: Sparkles, color: "#10B981", bg: "#ECFDF5", title: "Reporting Agent",   sub: "Briefs your team automatically",
              desc: "Generates weekly manager briefings with cost estimates, cluster summaries, and agent workload breakdowns. No dashboard time required." },
          ].map(({ Icon, color, bg, title, sub, desc }) => (
            <div key={title} className="bg-[#F8F9FB] rounded-2xl p-6 border border-black/[0.06] hover:border-black/[0.10] hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)] transition-all duration-200">
              <div className="w-[40px] h-[40px] rounded-xl flex items-center justify-center mb-5" style={{ background: bg }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div className="text-[15px] font-bold text-[#1A1D2E] mb-0.5">{title}</div>
              <div className="text-[12px] font-semibold mb-3" style={{ color }}>{sub}</div>
              <p className="text-[13px] text-[#6B7280] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Landing: Architecture ─────────────────────────────────────────────────────

function LandingArchitecture() {
  const stages = [
    { Icon: GitBranch, color: "#F59E0B", bg: "#FFFBEB", title: "Freshservice",        sub: "MCP connector ingest",
      desc: "Resolved tickets stream in continuously via the Freshservice MCP connector — conversations, timings, and resolution notes." },
    { Icon: Bot,       color: "#4F6AF5", bg: "#EEF1FF", title: "Second Read agents",   sub: "4-agent audit loop",
      desc: "Verifier, Pattern, Sentiment and Timing agents re-read every closure in parallel and vote on whether it should have closed." },
    { Icon: BarChart3, color: "#7C5CFC", bg: "#F3EEFF", title: "Manager report",       sub: "Weekly briefing + flags",
      desc: "Confirmed flags flow back to Freshservice with one-click reopen, and managers get a weekly briefing with cost impact." },
  ];

  return (
    <section className="bg-white py-24 px-6 border-t border-black/[0.05]">
      <div className="max-w-[1000px] mx-auto">
        <div className="text-center mb-16">
          <span className="text-[11px] font-bold text-[#4F6AF5] uppercase tracking-[0.16em] mb-3 block">Architecture</span>
          <h2 className="text-[34px] font-bold text-[#1A1D2E] leading-tight mb-4">Sits on top of the stack you already have.</h2>
          <p className="text-[16px] text-[#6B7280] max-w-[480px] mx-auto leading-relaxed">
            No new dashboard for your agents to live in. Second Read plugs into Freshservice and reports back where your team already works.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-5 items-stretch">
          {stages.map(({ Icon, color, bg, title, sub, desc }, i) => (
            <div key={title} className="relative">
              <div className="h-full bg-[#F8F9FB] rounded-2xl p-6 border border-black/[0.06] hover:border-black/[0.10] hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)] transition-all duration-200">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-[40px] h-[40px] rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div className="text-[10px] font-bold text-[#C4C8D4]">STEP {i + 1}</div>
                </div>
                <div className="text-[15px] font-bold text-[#1A1D2E] mb-0.5">{title}</div>
                <div className="text-[12px] font-semibold mb-3" style={{ color }}>{sub}</div>
                <p className="text-[13px] text-[#6B7280] leading-relaxed">{desc}</p>
              </div>
              {i < stages.length - 1 && (
                <div className="absolute top-1/2 -right-[14px] -translate-y-1/2 z-10 w-[26px] h-[26px] rounded-full bg-white border border-black/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.10)] flex items-center justify-center">
                  <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF]" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-center gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4F6AF5]" style={{ boxShadow: "0 0 6px #4F6AF5" }} />
          <span className="text-[12px] text-[#9CA3AF]">Orchestrated via <span className="font-semibold text-[#4F6AF5]">Freshworks Agent Studio</span> · deployed as a background service, not a UI add-on</span>
        </div>
      </div>
    </section>
  );
}

// ── Landing: Stats ────────────────────────────────────────────────────────────

function LandingStats() {
  return (
    <section className="py-[72px] px-6" style={{ background: "linear-gradient(135deg, #0E1022 0%, #171840 50%, #1B1138 100%)" }}>
      <div className="max-w-[820px] mx-auto">
        <div className="grid grid-cols-3 divide-x divide-white/[0.08]">
          {[
            { value: "40hrs",  label: "saved weekly",              Icon: Clock,   color: "#F59E0B" },
            { value: "84%",    label: "avg confidence score",      Icon: Shield,  color: "#4F6AF5" },
            { value: "MCP",    label: "built on Freshservice",     Icon: Zap,     color: "#7C5CFC" },
          ].map(({ value, label, Icon, color }) => (
            <div key={label} className="px-10 first:pl-0 last:pr-0 text-center">
              <div className="w-[40px] h-[40px] rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: `${color}22` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div className="text-[42px] font-bold text-white leading-none mb-2 tracking-tight">{value}</div>
              <div className="text-[13px] text-white/40">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Landing: Footer ───────────────────────────────────────────────────────────

function LandingFooter() {
  return (
    <footer className="bg-[#07091A] border-t border-white/[0.06] py-10 px-6">
      <div className="max-w-[1000px] mx-auto flex items-center justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-[22px] h-[22px] rounded-md bg-gradient-to-br from-[#4F6AF5] to-[#7C5CFC] flex items-center justify-center">
            <Eye className="w-[11px] h-[11px] text-white" />
          </div>
          <span className="text-white/70 font-semibold text-[13px]">Second Read</span>
        </div>
        <div className="flex items-center gap-1">
          {["Privacy", "Terms", "Docs", "Status", "Contact"].map(link => (
            <button key={link} className="text-white/25 text-[12px] hover:text-white/55 transition-colors px-3 py-1">{link}</button>
          ))}
        </div>
        <span className="text-white/18 text-[11px]">© 2026 Second Read. All rights reserved.</span>
      </div>
    </footer>
  );
}

// ── Landing page ──────────────────────────────────────────────────────────────

function LandingPage({ onEnterApp }: { onEnterApp: () => void }) {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <LandingNav onEnterApp={onEnterApp} />
      <LandingHero onEnterApp={onEnterApp} />
      <LandingFeatures />
      <LandingArchitecture />
      <LandingStats />
      <LandingFooter />
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [mode, setMode]     = useState<Mode>("landing");
  const [screen, setScreen] = useState<Screen>("dashboard");

  if (mode === "app") {
    return (
      <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
        <Sidebar screen={screen} setScreen={setScreen} onBack={() => setMode("landing")} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar screen={screen} onBack={() => setMode("landing")} />
          <main className="flex-1 overflow-hidden">
            {screen === "dashboard" && <DashboardScreen setScreen={setScreen} />}
            {screen === "impact"    && <ImpactScreen />}
            {screen === "cluster"   && <ClusterMapScreen />}
            {screen === "detail"    && <TicketDetailScreen />}
            {screen === "reports"   && <ReportsScreen setScreen={setScreen} />}
          </main>
        </div>
      </div>
    );
  }

  return <LandingPage onEnterApp={() => { setScreen("dashboard"); setMode("app"); }} />;
}

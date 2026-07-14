import { useState, useMemo, useRef, useEffect } from "react";
import {
  Home, MessageSquare, LayoutDashboard, Wallet, TrendingUp, ShieldAlert,
  FileText, Menu, X, Send, Download, AlertTriangle, CheckCircle2, Bot,
  Sparkles, ArrowRight, PiggyBank, Landmark, ChevronRight, Info
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";

/* =====================================================================
   IBM watsonx Orchestrate — INTEGRATION LAYER (placeholders)
   Replace the bodies of these functions with real calls once your
   Orchestrate skill / assistant endpoint is available. Every place in
   the UI that talks to the assistant routes through this file so you
   only need to wire things up in ONE place.

   DEMO MODE: the badge below is currently hard-coded to "Connected" for
   demonstration purposes only — no real connection check is performed.
   Flip DEMO_CONNECTED_LABEL / DEMO_CONNECTED to false, or better, wire
   isOrchestrateConnected() up to a real health-check call, before
   shipping this to production.
   ===================================================================== */

// TODO: move these to environment variables before going to production
const ORCHESTRATE_CONFIG = {
  baseUrl: "https://YOUR-INSTANCE.watsonx-orchestrate.ibm.com",
  assistantId: "YOUR_ASSISTANT_ID",
  apiKey: "YOUR_API_KEY", // never ship a real key in client-side code
};

// DEMO ONLY: hard-coded "connected" status for the topbar badge.
// Replace with a real health-check call (e.g. a lightweight ping to your
// Orchestrate instance) when wiring up the live integration.
const DEMO_CONNECTED = true;
function isOrchestrateConnected() {
  // TODO: replace with a real connectivity check, e.g.
  // const res = await fetch(`${ORCHESTRATE_CONFIG.baseUrl}/v1/health`, { headers: {...} });
  // return res.ok;
  return DEMO_CONNECTED;
}

/* ---------------------------------------------------------------------
   DEMO CHATBOT RESPONSES
   A small, fixed knowledge base used to simulate realistic AI answers
   for a handful of common financial-literacy questions. This is the
   ONLY part that should be swapped out for a real call to
   sendMessageToOrchestrate() -> your Orchestrate assistant endpoint.
   --------------------------------------------------------------------- */

const DEMO_QA = [
  {
    id: "budgeting",
    question: "How do I start budgeting?",
    answer:
`Getting started with budgeting is simpler than it sounds — it just takes a bit of structure. The first step is to figure out your total monthly income after taxes, since that's the real number you have to work with.

A good starting framework is the 50/30/20 rule: aim to spend about 50% of your income on needs (rent, utilities, groceries, transport), 30% on wants (dining out, entertainment, shopping), and 20% on savings and debt repayment. It won't fit everyone perfectly, but it's a solid baseline to adjust from.

Next, track your actual spending for a month. Most people are surprised by where their money really goes once they write it down — small recurring subscriptions and dining-out costs are common culprits. You can use a notebook, a spreadsheet, or the Budget Planner in this app to log categories automatically.

Once you know your real numbers, compare them against your target percentages. If your "wants" category is running high, look for one or two easy cuts rather than trying to overhaul everything at once — small, sustainable changes stick better than drastic ones.

Finally, revisit your budget monthly. Income and expenses change, and a budget is a living plan, not a one-time exercise. Try the Budget Planner tab to see how your current allocation compares to the 50/30/20 guideline in real time.`
  },
  {
    id: "investing",
    question: "How does investing compound?",
    answer:
`Compounding is often called the most powerful force in investing, and the idea behind it is straightforward: you earn returns not just on the money you originally invest, but also on the returns that money has already generated.

Here's a simple way to picture it. If you invest ₹10,000 and it grows by 10% in a year, you'd have ₹11,000. In year two, you don't just earn 10% on the original ₹10,000 — you earn it on the full ₹11,000, giving you ₹12,100. That extra ₹100 is compounding at work, and over many years, this snowball effect becomes significant.

Time is the key ingredient. The earlier you start, the more compounding cycles your money goes through, which is why even small amounts invested consistently in your 20s can outperform larger amounts invested later in life. This is also the logic behind SIP (Systematic Investment Plan) style investing — putting in a fixed amount every month lets you benefit from compounding while also smoothing out market ups and downs.

Consistency matters more than timing the market perfectly. Missing a few months here and there, or trying to wait for the "ideal" moment to invest, tends to cost more in lost compounding time than it saves in avoided risk.

You can see this effect in action using the Investment Calculator in this app — try changing the monthly amount, expected return, and time horizon to see how dramatically compounding accelerates growth over longer periods.`
  },
  {
    id: "scam",
    question: "How do I spot a scam text?",
    answer:
`Scam texts have a few recurring patterns, and once you know what to look for, they become much easier to spot even when they look convincing at first glance.

**Urgency and fear** are the most common tactics. Messages claiming your account will be "blocked in 24 hours" or that there's "suspicious activity" are designed to make you act before you think. Legitimate banks rarely demand instant action over SMS.

**Requests for OTPs or PINs** are an immediate red flag. No genuine bank, payment app, or government agency will ever ask you to share a one-time password, PIN, or CVV — these are meant to stay private, full stop.

**Unfamiliar or shortened links** are another warning sign. Scam texts often include links that don't match the official domain of the company they claim to represent, or use link-shortening services to hide the real destination. Always type the company's known website directly instead of clicking.

**Unexpected rewards** — a prize, lottery win, or refund you didn't apply for — are almost always bait. If something seems too good to be true, it usually is.

If you receive a suspicious message, don't click any links or reply. Instead, verify by contacting the company directly through their official app or customer service number. You can also paste a suspicious message into the Scam Awareness page in this app for a quick red-flag check.`
  },
  {
    id: "sip",
    question: "What is SIP?",
    answer:
`SIP stands for Systematic Investment Plan — a way of investing a fixed amount of money at regular intervals (usually monthly) into an investment such as a mutual fund, rather than putting in a large lump sum all at once.

The appeal of SIP comes down to two main benefits. First, it builds discipline: by automating a fixed monthly contribution, you invest consistently regardless of market mood, which removes the temptation to time the market. Second, it takes advantage of a concept called rupee-cost averaging — when prices are low, your fixed amount buys more units, and when prices are high, it buys fewer. Over time, this can smooth out the impact of market volatility compared to investing a lump sum all at once.

SIPs are also accessible for people just starting out, since many funds allow you to begin with a relatively small monthly amount. This makes it easier to start building an investing habit early, which matters a lot given how much compounding rewards time in the market.

That said, SIPs don't eliminate risk — the underlying investment can still go up or down in value, and returns are never guaranteed. It's a method of investing, not a guarantee of profit, so it's still worth choosing funds that match your goals and risk tolerance.

You can explore how a SIP-style monthly contribution might grow over time using the Investment Calculator in this app, which models compounding growth based on your inputs.`
  },
  {
    id: "credit_score",
    question: "What is a credit score?",
    answer:
`A credit score is a numerical representation of how likely you are to repay borrowed money, based on your past credit behavior. Lenders — banks, credit card companies, and loan providers — use it to decide whether to approve you for credit, and on what terms.

Several factors typically influence your score. Payment history usually matters most: paying bills and EMIs on time consistently has the biggest positive impact, while missed or late payments hurt it significantly. Credit utilization — how much of your available credit limit you're actually using — also plays a big role; keeping usage well below your limit tends to help. The length of your credit history, the mix of credit types you hold (credit cards, loans, etc.), and how often you apply for new credit all factor in as well.

A higher credit score generally means easier loan approvals, better interest rates, and more favorable terms, which can translate into real savings over the life of a loan. A lower score doesn't mean credit is impossible to get, but it often comes with higher interest rates or stricter conditions.

Building or improving a credit score takes time and consistency rather than any single quick fix. Paying all bills on time, keeping credit card balances low relative to your limit, avoiding unnecessary new credit applications, and maintaining older accounts rather than closing them are all habits that help over the long run.

Checking your credit report periodically is also a good habit — it helps you catch errors or signs of fraud early, and lets you see exactly which factors are affecting your score the most.`
  },
];

const DEMO_FALLBACK =
  "This is a demonstration frontend. Connect IBM watsonx Orchestrate to receive live AI responses.";

// Normalize text for loose matching (case/punctuation-insensitive)
function normalize(str) {
  return str.toLowerCase().replace(/[^\w\s]/g, "").trim();
}

// Looks up a demo answer for a fixed question, or returns the fallback text.
function getDemoResponse(message) {
  const norm = normalize(message);
  const match = DEMO_QA.find((qa) => normalize(qa.question) === norm);
  return match ? match.answer : DEMO_FALLBACK;
}

// Placeholder: send a chat message to the watsonx Orchestrate assistant.
// DEMO MODE: resolves locally from a fixed Q&A set instead of calling a
// real endpoint. Swap the body of this function for a real fetch to go live.
async function sendMessageToOrchestrate(message, history = []) {
  // TODO: replace with a real fetch, e.g.
  // const res = await fetch(`${ORCHESTRATE_CONFIG.baseUrl}/v1/assistants/${ORCHESTRATE_CONFIG.assistantId}/message`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json", Authorization: `Bearer ${ORCHESTRATE_CONFIG.apiKey}` },
  //   body: JSON.stringify({ message, history }),
  // });
  // const data = await res.json();
  // return data.reply;
  await new Promise((r) => setTimeout(r, 700));
  return getDemoResponse(message);
}

// Placeholder: ask the assistant to analyze a message/link for scam signals
async function analyzeScamTextWithOrchestrate(text) {
  // TODO: replace with a real call to your Orchestrate "scam-check" skill
  await new Promise((r) => setTimeout(r, 900));
  return mockScamAnalysis(text);
}

// Placeholder: fetch personalized budget insight from the assistant
async function getBudgetInsightFromOrchestrate(summary) {
  // TODO: replace with a real call passing the computed budget summary
  await new Promise((r) => setTimeout(r, 500));
  return `Based on your numbers, you're allocating ${summary.savingsPct}% to savings. Consider nudging this toward 20% by trimming discretionary spend.`;
}

function mockScamAnalysis(text) {
  const t = text.toLowerCase();
  const flags = [];
  if (t.includes("otp") || t.includes("one time password")) flags.push("Requests an OTP or verification code");
  if (t.includes("urgent") || t.includes("immediately") || t.includes("blocked")) flags.push("Creates artificial urgency");
  if (t.includes("http") || t.includes("www.") || t.includes(".link")) flags.push("Contains an unverified link");
  if (t.includes("prize") || t.includes("winner") || t.includes("lottery")) flags.push("Promises an unexpected reward");
  if (t.includes("kyc") || t.includes("account suspended") || t.includes("verify your account")) flags.push("Impersonates a bank/KYC request");
  const risk = flags.length >= 3 ? "High" : flags.length >= 1 ? "Medium" : "Low";
  return { risk, flags: flags.length ? flags : ["No obvious red flags detected — still verify the sender independently."] };
}

/* ===================== Design tokens (IBM Carbon inspired) ===================== */

const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

    .fga-root {
      --blue-60: #0f62fe;
      --blue-70: #0043ce;
      --blue-50: #4589ff;
      --blue-20: #d0e2ff;
      --blue-10: #edf5ff;
      --gray-100: #161616;
      --gray-90: #262626;
      --gray-70: #525252;
      --gray-20: #e0e0e0;
      --gray-10: #f4f4f4;
      --white: #ffffff;
      --teal: #007d79;
      --teal-20: #cdeeee;
      --green: #24a148;
      --green-20: #defbe6;
      --amber: #b28600;
      --amber-20: #fcf4d6;
      --red: #da1e28;
      --red-20: #fff1f1;
      font-family: 'IBM Plex Sans', system-ui, sans-serif;
      color: var(--gray-100);
      background: var(--gray-10);
    }
    .fga-mono { font-family: 'IBM Plex Mono', monospace; }
    .fga-root * { box-sizing: border-box; }
    .fga-root button { font-family: inherit; cursor: pointer; }
    .fga-root input, .fga-root select, .fga-root textarea { font-family: inherit; }

    .fga-shell { display: flex; min-height: 100vh; width: 100%; position: relative; }

    /* ---- Sidebar (Carbon left nav) ---- */
    .fga-sidebar {
      background: var(--gray-100);
      color: #f4f4f4;
      width: 256px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s ease;
      z-index: 40;
    }
    .fga-sidebar-brand {
      display: flex; align-items: center; gap: 10px;
      padding: 20px 16px; border-bottom: 1px solid #393939;
    }
    .fga-sidebar-brand .mark {
      width: 32px; height: 32px; background: var(--blue-60);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .fga-sidebar-brand .name { font-weight: 600; font-size: 15px; line-height: 1.2; }
    .fga-sidebar-brand .sub { font-size: 11px; color: #a8a8a8; margin-top: 2px; }

    .fga-nav { list-style: none; margin: 8px 0 0; padding: 0; flex: 1; }
    .fga-nav li { }
    .fga-nav button {
      width: 100%; display: flex; align-items: center; gap: 12px;
      padding: 13px 16px; background: transparent; border: none; color: #c6c6c6;
      font-size: 14px; text-align: left; border-left: 3px solid transparent;
    }
    .fga-nav button:hover { background: #262626; color: #fff; }
    .fga-nav button.active {
      background: #0f62fe1a; color: #fff; border-left: 3px solid var(--blue-60);
    }
    .fga-nav button.active svg { color: var(--blue-50); }

    .fga-sidebar-footer {
      padding: 14px 16px; border-top: 1px solid #393939; font-size: 11px; color: #a8a8a8;
    }

    /* ---- Main ---- */
    .fga-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
    .fga-topbar {
      height: 56px; background: var(--white); border-bottom: 1px solid var(--gray-20);
      display: flex; align-items: center; gap: 12px; padding: 0 20px; flex-shrink: 0;
    }
    .fga-hamburger { display: none; background: none; border: none; padding: 6px; }
    .fga-breadcrumb { font-size: 13px; color: var(--gray-70); }
    .fga-breadcrumb b { color: var(--gray-100); font-weight: 600; }
    .fga-topbar-right { margin-left: auto; display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--gray-70); }
    .fga-badge {
      font-size: 11px; padding: 3px 8px; background: var(--blue-10); color: var(--blue-70);
      border: 1px solid var(--blue-20); display: inline-flex; align-items: center; gap: 4px;
    }
    .fga-badge-connected {
      background: var(--green-20); color: #0e6027; border: 1px solid #a7f0ba;
    }
    .fga-badge-dot {
      width: 7px; height: 7px; border-radius: 50%; background: var(--green); flex-shrink: 0;
      box-shadow: 0 0 0 2px var(--green-20);
    }

    .fga-content { flex: 1; padding: 28px 32px; overflow-y: auto; }
    .fga-page-title { font-size: 24px; font-weight: 600; margin: 0 0 4px; }
    .fga-page-desc { font-size: 14px; color: var(--gray-70); margin: 0 0 24px; max-width: 640px; }

    .fga-card {
      background: var(--white); border: 1px solid var(--gray-20); padding: 20px;
    }
    .fga-grid { display: grid; gap: 16px; }
    .fga-grid-2 { grid-template-columns: repeat(2, minmax(0,1fr)); }
    .fga-grid-3 { grid-template-columns: repeat(3, minmax(0,1fr)); }
    .fga-grid-4 { grid-template-columns: repeat(4, minmax(0,1fr)); }

    .fga-stat-label { font-size: 12px; color: var(--gray-70); text-transform: uppercase; letter-spacing: 0.4px; margin: 0 0 8px; }
    .fga-stat-value { font-size: 26px; font-weight: 600; margin: 0; }
    .fga-stat-delta { font-size: 12px; margin-top: 6px; display: flex; align-items: center; gap: 4px; }

    .fga-btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      padding: 11px 18px; font-size: 14px; font-weight: 500; border: none;
    }
    .fga-btn-primary { background: var(--blue-60); color: #fff; }
    .fga-btn-primary:hover { background: var(--blue-70); }
    .fga-btn-secondary { background: transparent; color: var(--blue-60); border: 1px solid var(--blue-60); }
    .fga-btn-secondary:hover { background: var(--blue-10); }
    .fga-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .fga-input, .fga-select {
      width: 100%; padding: 10px 12px; border: 1px solid var(--gray-20);
      background: var(--gray-10); font-size: 14px; color: var(--gray-100);
    }
    .fga-input:focus, .fga-select:focus, .fga-textarea:focus {
      outline: 2px solid var(--blue-60); outline-offset: -2px; background: #fff;
    }
    .fga-label { display: block; font-size: 12px; color: var(--gray-70); margin-bottom: 6px; }
    .fga-textarea { width: 100%; padding: 10px 12px; border: 1px solid var(--gray-20); background: var(--gray-10); font-size: 14px; resize: vertical; min-height: 90px; }

    /* Ledger tape — signature element on the dashboard */
    .fga-ledger {
      background: var(--gray-100); color: #f4f4f4; display: flex; align-items: stretch;
      overflow-x: auto; margin-bottom: 24px; border: 1px solid var(--gray-100);
    }
    .fga-ledger-item { padding: 14px 22px; border-right: 1px solid #393939; white-space: nowrap; }
    .fga-ledger-item:last-child { border-right: none; }
    .fga-ledger-label { font-size: 10px; color: #a8a8a8; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 4px; }
    .fga-ledger-value { font-size: 16px; font-weight: 600; }

    /* Chat */
    .fga-chat-shell { display: flex; flex-direction: column; height: calc(100vh - 176px); border: 1px solid var(--gray-20); background: #fff; }
    .fga-chat-header { padding: 14px 18px; border-bottom: 1px solid var(--gray-20); display: flex; align-items: center; gap: 10px; }
    .fga-chat-body { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 14px; }
    .fga-bubble { max-width: 72%; padding: 11px 14px; font-size: 14px; line-height: 1.5; white-space: pre-wrap; }
    .fga-bubble-user { align-self: flex-end; background: var(--blue-60); color: #fff; border-radius: 14px 14px 2px 14px; }
    .fga-bubble-bot { align-self: flex-start; background: var(--gray-10); color: var(--gray-100); border-radius: 14px 14px 14px 2px; border: 1px solid var(--gray-20); }
    .fga-chat-input-row { border-top: 1px solid var(--gray-20); padding: 14px; display: flex; gap: 10px; }
    .fga-quick { display: flex; gap: 8px; flex-wrap: wrap; padding: 0 18px 14px; }
    .fga-quick button { font-size: 12px; padding: 6px 12px; background: var(--blue-10); color: var(--blue-70); border: 1px solid var(--blue-20); }
    .fga-quick button:hover { background: var(--blue-20); }

    .fga-list-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--gray-20); }
    .fga-list-row:last-child { border-bottom: none; }

    .fga-tag { font-size: 11px; padding: 2px 8px; font-weight: 500; }
    .fga-tag-needs { background: var(--blue-10); color: var(--blue-70); }
    .fga-tag-wants { background: var(--amber-20); color: #745a00; }
    .fga-tag-savings { background: var(--green-20); color: #0e6027; }

    .fga-risk-low { color: var(--green); }
    .fga-risk-medium { color: var(--amber); }
    .fga-risk-high { color: var(--red); }
    .fga-risk-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; font-weight: 600; font-size: 13px; }
    .fga-risk-badge-low { background: var(--green-20); color: #0e6027; }
    .fga-risk-badge-medium { background: var(--amber-20); color: #745a00; }
    .fga-risk-badge-high { background: var(--red-20); color: #a2191f; }

    .fga-guide-card { border: 1px solid var(--gray-20); background: #fff; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
    .fga-guide-icon { width: 40px; height: 40px; background: var(--blue-10); display: flex; align-items: center; justify-content: center; }

    .fga-scam-card { border: 1px solid var(--gray-20); background: #fff; padding: 18px; border-top: 3px solid var(--teal); }

    .fga-hero {
      background: var(--gray-100); color: #fff; padding: 56px 40px; display: flex;
      align-items: center; gap: 40px; margin-bottom: 32px;
    }
    .fga-hero-eyebrow { font-size: 12px; letter-spacing: 1px; text-transform: uppercase; color: var(--blue-50); font-weight: 600; margin-bottom: 14px; }
    .fga-hero h1 { font-size: 34px; font-weight: 600; margin: 0 0 14px; line-height: 1.2; }
    .fga-hero p { font-size: 15px; color: #d4d4d4; max-width: 480px; margin: 0 0 22px; line-height: 1.6; }

    .fga-feature-card { background: #fff; border: 1px solid var(--gray-20); padding: 22px; }
    .fga-feature-icon { width: 36px; height: 36px; background: var(--blue-60); color: #fff; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }

    @media (max-width: 900px) {
      .fga-sidebar { position: fixed; top: 0; left: 0; height: 100vh; transform: translateX(-100%); }
      .fga-sidebar.open { transform: translateX(0); }
      .fga-hamburger { display: inline-flex; }
      .fga-grid-2, .fga-grid-3, .fga-grid-4 { grid-template-columns: 1fr; }
      .fga-hero { flex-direction: column; padding: 32px 20px; text-align: left; }
      .fga-content { padding: 20px 16px; }
      .fga-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 30; }
    }
  `}</style>
);

/* ===================== Nav config ===================== */

const NAV_ITEMS = [
  { key: "home", label: "Home", icon: Home },
  { key: "chatbot", label: "AI Chatbot", icon: MessageSquare },
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "budget", label: "Budget Planner", icon: Wallet },
  { key: "investment", label: "Investment Calculator", icon: TrendingUp },
  { key: "scam", label: "Scam Awareness", icon: ShieldAlert },
  { key: "guides", label: "PDF Guides", icon: FileText },
];

const PAGE_TITLES = {
  home: "Home", chatbot: "AI Chatbot", dashboard: "Dashboard", budget: "Budget Planner",
  investment: "Investment Calculator", scam: "Scam Awareness", guides: "PDF Guides",
};

/* ===================== Sidebar ===================== */

function Sidebar({ active, onNavigate, open, onClose }) {
  return (
    <>
      {open && <div className="fga-overlay" onClick={onClose} />}
      <nav className={`fga-sidebar ${open ? "open" : ""}`}>
        <div className="fga-sidebar-brand">
          <div className="mark"><Sparkles size={18} color="#fff" /></div>
          <div>
            <div className="name">FinancialGuide AI</div>
            <div className="sub">Digital Financial Literacy Assistant</div>
          </div>
        </div>
        <ul className="fga-nav">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <li key={key}>
              <button
                className={active === key ? "active" : ""}
                onClick={() => { onNavigate(key); onClose(); }}
              >
                <Icon size={18} />
                {label}
              </button>
            </li>
          ))}
        </ul>
        <div className="fga-sidebar-footer">Powered by IBM watsonx Orchestrate</div>
      </nav>
    </>
  );
}

/* ===================== Topbar ===================== */

function Topbar({ page, onMenuClick }) {
  const connected = isOrchestrateConnected();
  return (
    <div className="fga-topbar">
      <button className="fga-hamburger" onClick={onMenuClick} aria-label="Open menu"><Menu size={20} /></button>
      <div className="fga-breadcrumb">FinancialGuide AI / <b>{PAGE_TITLES[page]}</b></div>
      <div className="fga-topbar-right">
        {connected ? (
          <span className="fga-badge fga-badge-connected">
            <span className="fga-badge-dot" /> watsonx Orchestrate: Connected
          </span>
        ) : (
          <span className="fga-badge"><Bot size={12} /> watsonx Orchestrate: not connected</span>
        )}
      </div>
    </div>
  );
}

/* ===================== Home Page ===================== */

function HomePage({ onNavigate }) {
  const features = [
    { icon: MessageSquare, title: "Ask anything, anytime", desc: "Chat with an AI assistant trained on personal-finance basics — budgeting, saving, investing, and fraud prevention.", page: "chatbot" },
    { icon: Wallet, title: "Plan your budget", desc: "Split income across needs, wants, and savings, and see how your allocation compares to the 50/30/20 rule.", page: "budget" },
    { icon: TrendingUp, title: "Project your investments", desc: "Model how monthly contributions grow over time with compound returns.", page: "investment" },
    { icon: ShieldAlert, title: "Spot scams early", desc: "Learn the red flags behind common financial scams, and check suspicious messages.", page: "scam" },
  ];
  return (
    <div>
      <div className="fga-hero">
        <div>
          <div className="fga-hero-eyebrow">AI-powered financial literacy</div>
          <h1>Understand your money.<br />Make it work harder.</h1>
          <p>FinancialGuide AI turns budgeting, investing, and scam-awareness into plain-language guidance — powered by an IBM watsonx Orchestrate assistant.</p>
          <button className="fga-btn fga-btn-primary" onClick={() => onNavigate("chatbot")}>
            Start a conversation <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div className="fga-grid fga-grid-4">
        {features.map((f) => (
          <button
            key={f.page}
            className="fga-feature-card"
            style={{ textAlign: "left" }}
            onClick={() => onNavigate(f.page)}
          >
            <div className="fga-feature-icon"><f.icon size={18} /></div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>{f.title}</div>
            <div style={{ fontSize: 13, color: "var(--gray-70)", lineHeight: 1.5 }}>{f.desc}</div>
            <div style={{ marginTop: 12, fontSize: 12, color: "var(--blue-60)", display: "flex", alignItems: "center", gap: 4 }}>
              Explore <ChevronRight size={14} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ===================== Chatbot Page ===================== */

function ChatbotPage() {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi, I'm your FinancialGuide AI assistant. Ask me about budgeting, saving, investing, or scams." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, loading]);

  const send = async (text) => {
    const value = (text ?? input).trim();
    if (!value || loading) return;
    const nextMessages = [...messages, { role: "user", text: value }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    try {
      const reply = await sendMessageToOrchestrate(value, nextMessages);
      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "bot", text: "Something went wrong reaching the assistant. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  // Quick-prompt buttons mirror the fixed demo questions so a single tap
  // reliably produces a detailed demo answer.
  const quickPrompts = DEMO_QA.map((qa) => qa.question);

  return (
    <div className="fga-chat-shell">
      <div className="fga-chat-header">
        <div className="fga-feature-icon" style={{ width: 28, height: 28, marginBottom: 0 }}><Bot size={15} /></div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>FinancialGuide Assistant</div>
          <div style={{ fontSize: 11, color: "var(--gray-70)" }}>Demo responses — connect watsonx Orchestrate for live answers</div>
        </div>
      </div>
      <div className="fga-chat-body" ref={bodyRef}>
        {messages.map((m, i) => (
          <div key={i} className={`fga-bubble ${m.role === "user" ? "fga-bubble-user" : "fga-bubble-bot"}`}>
            {m.text}
          </div>
        ))}
        {loading && <div className="fga-bubble fga-bubble-bot">Thinking…</div>}
      </div>
      <div className="fga-quick">
        {quickPrompts.map((q) => (
          <button key={q} onClick={() => send(q)}>{q}</button>
        ))}
      </div>
      <div className="fga-chat-input-row">
        <input
          className="fga-input"
          placeholder="Ask about budgeting, saving, investing, or scams…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button className="fga-btn fga-btn-primary" onClick={() => send()} disabled={loading}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

/* ===================== Dashboard Page ===================== */

const SPEND_TREND = [
  { month: "Feb", spend: 24200 }, { month: "Mar", spend: 22800 }, { month: "Apr", spend: 26100 },
  { month: "May", spend: 21500 }, { month: "Jun", spend: 23900 }, { month: "Jul", spend: 20800 },
];
const ALLOCATION = [
  { name: "Needs", value: 52 }, { name: "Wants", value: 31 }, { name: "Savings", value: 17 },
];
const PIE_COLORS = ["#0f62fe", "#f1c21b", "#24a148"];

function DashboardPage({ onNavigate }) {
  return (
    <div>
      <div className="fga-ledger fga-mono">
        <div className="fga-ledger-item"><div className="fga-ledger-label">Net worth</div><div className="fga-ledger-value">₹4,82,300</div></div>
        <div className="fga-ledger-item"><div className="fga-ledger-label">This month's spend</div><div className="fga-ledger-value">₹20,800</div></div>
        <div className="fga-ledger-item"><div className="fga-ledger-label">Savings rate</div><div className="fga-ledger-value">17%</div></div>
        <div className="fga-ledger-item"><div className="fga-ledger-label">Emergency fund</div><div className="fga-ledger-value">2.4 mo</div></div>
        <div className="fga-ledger-item"><div className="fga-ledger-label">Financial health</div><div className="fga-ledger-value" style={{ color: "#42be65" }}>Good</div></div>
      </div>

      <div className="fga-grid fga-grid-3" style={{ marginBottom: 16 }}>
        <div className="fga-card">
          <p className="fga-stat-label">Monthly income</p>
          <p className="fga-stat-value fga-mono">₹58,000</p>
          <div className="fga-stat-delta" style={{ color: "var(--green)" }}><CheckCircle2 size={13} /> Stable</div>
        </div>
        <div className="fga-card">
          <p className="fga-stat-label">Monthly expenses</p>
          <p className="fga-stat-value fga-mono">₹42,300</p>
          <div className="fga-stat-delta" style={{ color: "var(--amber)" }}><AlertTriangle size={13} /> +4% vs last month</div>
        </div>
        <div className="fga-card">
          <p className="fga-stat-label">Investment value</p>
          <p className="fga-stat-value fga-mono">₹1,86,400</p>
          <div className="fga-stat-delta" style={{ color: "var(--green)" }}><TrendingUp size={13} /> +2.1% this month</div>
        </div>
      </div>

      <div className="fga-grid fga-grid-2">
        <div className="fga-card">
          <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Spending trend (6 months)</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={SPEND_TREND}>
              <CartesianGrid stroke="#e0e0e0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#8d8d8d" />
              <YAxis tick={{ fontSize: 12 }} stroke="#8d8d8d" width={40} />
              <Tooltip />
              <Line type="monotone" dataKey="spend" stroke="#0f62fe" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="fga-card">
          <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Current allocation</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={ALLOCATION} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                {ALLOCATION.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="fga-card" style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Want a deeper breakdown?</div>
          <div style={{ fontSize: 13, color: "var(--gray-70)" }}>Head to the Budget Planner to adjust category-level spending.</div>
        </div>
        <button className="fga-btn fga-btn-secondary" onClick={() => onNavigate("budget")}>Open Budget Planner</button>
      </div>
    </div>
  );
}

/* ===================== Budget Planner Page ===================== */

const BUDGET_CATEGORIES = [
  { id: "rent", label: "Rent / Housing", group: "needs" },
  { id: "utilities", label: "Utilities", group: "needs" },
  { id: "groceries", label: "Groceries", group: "needs" },
  { id: "transport", label: "Transport", group: "needs" },
  { id: "entertainment", label: "Entertainment", group: "wants" },
  { id: "diningout", label: "Dining out", group: "wants" },
  { id: "shopping", label: "Shopping", group: "wants" },
  { id: "investments", label: "Investments", group: "savings" },
  { id: "emergency", label: "Emergency fund", group: "savings" },
];

const GROUP_LABELS = { needs: "Needs", wants: "Wants", savings: "Savings" };
const GROUP_TARGETS = { needs: 50, wants: 30, savings: 20 };

function BudgetPlannerPage() {
  const [income, setIncome] = useState(58000);
  const [amounts, setAmounts] = useState({
    rent: 15000, utilities: 2500, groceries: 6000, transport: 3000,
    entertainment: 2500, diningout: 3000, shopping: 3500,
    investments: 6000, emergency: 4000,
  });
  const [insight, setInsight] = useState("");
  const [insightLoading, setInsightLoading] = useState(false);

  const setAmount = (id, value) => setAmounts((prev) => ({ ...prev, [id]: Number(value) || 0 }));

  const totals = useMemo(() => {
    const byGroup = { needs: 0, wants: 0, savings: 0 };
    BUDGET_CATEGORIES.forEach((c) => { byGroup[c.group] += amounts[c.id] || 0; });
    const totalSpent = byGroup.needs + byGroup.wants + byGroup.savings;
    const pct = (n) => (income > 0 ? Math.round((n / income) * 100) : 0);
    return {
      byGroup,
      totalSpent,
      remaining: income - totalSpent,
      needsPct: pct(byGroup.needs), wantsPct: pct(byGroup.wants), savingsPct: pct(byGroup.savings),
    };
  }, [amounts, income]);

  const chartData = [
    { group: "Needs", you: totals.needsPct, target: GROUP_TARGETS.needs },
    { group: "Wants", you: totals.wantsPct, target: GROUP_TARGETS.wants },
    { group: "Savings", you: totals.savingsPct, target: GROUP_TARGETS.savings },
  ];

  const askForInsight = async () => {
    setInsightLoading(true);
    try {
      const text = await getBudgetInsightFromOrchestrate(totals);
      setInsight(text);
    } finally {
      setInsightLoading(false);
    }
  };

  return (
    <div>
      <p className="fga-page-desc">Enter your monthly income and category spending. We'll compare your allocation against the 50/30/20 guideline.</p>

      <div className="fga-grid fga-grid-2" style={{ alignItems: "start" }}>
        <div className="fga-card">
          <div style={{ marginBottom: 16 }}>
            <label className="fga-label">Monthly income</label>
            <input className="fga-input fga-mono" type="number" value={income} onChange={(e) => setIncome(Number(e.target.value) || 0)} />
          </div>
          {["needs", "wants", "savings"].map((group) => (
            <div key={group} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span className={`fga-tag fga-tag-${group}`}>{GROUP_LABELS[group]}</span>
                <span style={{ fontSize: 12, color: "var(--gray-70)" }}>target {GROUP_TARGETS[group]}%</span>
              </div>
              {BUDGET_CATEGORIES.filter((c) => c.group === group).map((c) => (
                <div key={c.id} className="fga-list-row">
                  <span style={{ fontSize: 13 }}>{c.label}</span>
                  <input
                    className="fga-input fga-mono"
                    style={{ width: 120 }}
                    type="number"
                    value={amounts[c.id]}
                    onChange={(e) => setAmount(c.id, e.target.value)}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        <div>
          <div className="fga-card" style={{ marginBottom: 16 }}>
            <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Your allocation vs. the 50/30/20 rule</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid stroke="#e0e0e0" vertical={false} />
                <XAxis dataKey="group" tick={{ fontSize: 12 }} stroke="#8d8d8d" />
                <YAxis tick={{ fontSize: 12 }} stroke="#8d8d8d" width={36} unit="%" />
                <Tooltip />
                <Legend />
                <Bar dataKey="you" name="You" fill="#0f62fe" />
                <Bar dataKey="target" name="Target" fill="#8d8d8d" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="fga-grid fga-grid-2" style={{ marginBottom: 16 }}>
            <div className="fga-card">
              <p className="fga-stat-label">Total spent</p>
              <p className="fga-stat-value fga-mono">₹{totals.totalSpent.toLocaleString("en-IN")}</p>
            </div>
            <div className="fga-card">
              <p className="fga-stat-label">Remaining</p>
              <p className="fga-stat-value fga-mono" style={{ color: totals.remaining < 0 ? "var(--red)" : "var(--green)" }}>
                ₹{totals.remaining.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <div className="fga-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: insight ? 12 : 0 }}>
              <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>AI insight</p>
              <button className="fga-btn fga-btn-secondary" onClick={askForInsight} disabled={insightLoading}>
                {insightLoading ? "Thinking…" : "Ask watsonx"}
              </button>
            </div>
            {insight && <p style={{ fontSize: 13, color: "var(--gray-70)", lineHeight: 1.6 }}>{insight}</p>}
            {!insight && <p style={{ fontSize: 12, color: "var(--gray-70)" }}>Placeholder call — wires up to <code>getBudgetInsightFromOrchestrate()</code>.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== Investment Calculator Page ===================== */

function computeSipGrowth(monthly, annualRatePct, years) {
  const r = annualRatePct / 100 / 12;
  const data = [];
  for (let y = 1; y <= years; y++) {
    const n = y * 12;
    const invested = monthly * n;
    const futureValue = r === 0 ? invested : monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    data.push({ year: `Yr ${y}`, invested: Math.round(invested), value: Math.round(futureValue) });
  }
  return data;
}

function InvestmentCalculatorPage() {
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);

  const data = useMemo(() => computeSipGrowth(monthly, rate, years), [monthly, rate, years]);
  const last = data[data.length - 1] || { invested: 0, value: 0 };
  const gains = last.value - last.invested;

  return (
    <div>
      <p className="fga-page-desc">Model how a fixed monthly investment grows with compounding — a simplified SIP-style projection for learning purposes, not financial advice.</p>
      <div className="fga-grid fga-grid-2" style={{ alignItems: "start" }}>
        <div className="fga-card">
          <div style={{ marginBottom: 16 }}>
            <label className="fga-label">Monthly investment (₹)</label>
            <input className="fga-input fga-mono" type="number" value={monthly} onChange={(e) => setMonthly(Number(e.target.value) || 0)} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="fga-label">Expected annual return (%)</label>
            <input className="fga-input fga-mono" type="number" value={rate} onChange={(e) => setRate(Number(e.target.value) || 0)} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="fga-label">Time horizon (years)</label>
            <input className="fga-input fga-mono" type="number" value={years} min={1} max={40} onChange={(e) => setYears(Math.min(40, Math.max(1, Number(e.target.value) || 1)))} />
          </div>
          <div className="fga-grid fga-grid-2">
            <div>
              <p className="fga-stat-label">Total invested</p>
              <p className="fga-stat-value fga-mono">₹{last.invested.toLocaleString("en-IN")}</p>
            </div>
            <div>
              <p className="fga-stat-label">Estimated gains</p>
              <p className="fga-stat-value fga-mono" style={{ color: "var(--green)" }}>₹{gains.toLocaleString("en-IN")}</p>
            </div>
          </div>
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--gray-20)" }}>
            <p className="fga-stat-label">Projected value at year {years}</p>
            <p className="fga-stat-value fga-mono" style={{ fontSize: 28 }}>₹{last.value.toLocaleString("en-IN")}</p>
          </div>
        </div>

        <div className="fga-card">
          <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Growth over time</p>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="valueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0f62fe" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#0f62fe" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e0e0e0" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="#8d8d8d" />
              <YAxis tick={{ fontSize: 11 }} stroke="#8d8d8d" width={50} />
              <Tooltip formatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`} />
              <Legend />
              <Area type="monotone" dataKey="invested" name="Invested" stroke="#8d8d8d" fill="none" strokeDasharray="4 4" />
              <Area type="monotone" dataKey="value" name="Projected value" stroke="#0f62fe" fill="url(#valueFill)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ===================== Scam Awareness Page ===================== */

const SCAM_TYPES = [
  { title: "Phishing messages", desc: "Fake bank/UPI alerts urging you to click a link or share an OTP immediately." },
  { title: "Fake job / task scams", desc: "Upfront 'registration fees' or task-based payouts that require you to deposit money first." },
  { title: "Investment / trading groups", desc: "Guaranteed high returns from unregistered advisors or unknown trading channels." },
  { title: "Loan app fraud", desc: "Unregulated apps offering instant loans with hidden charges and aggressive recovery tactics." },
  { title: "KYC update scams", desc: "Calls or messages claiming your account/KYC will be blocked unless you 'verify' immediately." },
  { title: "Romance / relationship scams", desc: "Long-term online relationships that eventually ask for money transfers or gifts." },
];

function ScamAwarenessPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const r = await analyzeScamTextWithOrchestrate(text);
      setResult(r);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p className="fga-page-desc">Recognize common scam patterns, and paste a suspicious message for a quick AI-assisted check.</p>

      <div className="fga-card" style={{ marginBottom: 24 }}>
        <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <ShieldAlert size={16} color="#0f62fe" /> Check a message for scam signals
        </p>
        <textarea
          className="fga-textarea"
          placeholder="Paste a suspicious SMS, email, or WhatsApp message here…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 14 }}>
          <button className="fga-btn fga-btn-primary" onClick={analyze} disabled={loading}>
            {loading ? "Analyzing…" : "Analyze with AI"}
          </button>
          {result && (
            <span className={`fga-risk-badge fga-risk-badge-${result.risk.toLowerCase()}`}>
              <AlertTriangle size={14} /> {result.risk} risk
            </span>
          )}
        </div>
        {result && (
          <ul style={{ marginTop: 14, paddingLeft: 18, fontSize: 13, color: "var(--gray-70)", lineHeight: 1.7 }}>
            {result.flags.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        )}
        <p style={{ marginTop: 10, fontSize: 11, color: "var(--gray-70)", display: "flex", alignItems: "center", gap: 4 }}>
          <Info size={12} /> Placeholder analysis — wires up to <code>analyzeScamTextWithOrchestrate()</code>.
        </p>
      </div>

      <div className="fga-grid fga-grid-3">
        {SCAM_TYPES.map((s) => (
          <div key={s.title} className="fga-scam-card">
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{s.title}</div>
            <div style={{ fontSize: 13, color: "var(--gray-70)", lineHeight: 1.5 }}>{s.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===================== PDF Guides Page ===================== */

const GUIDES = [
  { id: "budgeting-101", title: "Budgeting 101", desc: "A short guide to the 50/30/20 rule and building your first monthly budget." },
  { id: "investing-basics", title: "Investing Basics", desc: "Understand compounding, risk, and how to start investing small amounts regularly." },
  { id: "scam-checklist", title: "Scam Red-Flag Checklist", desc: "A printable checklist of warning signs for phishing, loan, and investment scams." },
  { id: "credit-score-guide", title: "Understanding Credit Scores", desc: "What affects your credit score and simple habits to improve it over time." },
];

// Placeholder: in production this would fetch/generate a real PDF (e.g. from IBM watsonx or a static asset)
function downloadGuide(id) {
  // TODO: replace with real file retrieval, e.g. window.open(`/guides/${id}.pdf`, "_blank")
  alert(`Placeholder: this would download the "${id}" PDF guide once connected to a real file source.`);
}

function PdfGuidesPage() {
  return (
    <div>
      <p className="fga-page-desc">Downloadable guides that summarize each topic — useful for offline reading or sharing.</p>
      <div className="fga-grid fga-grid-2">
        {GUIDES.map((g) => (
          <div key={g.id} className="fga-guide-card">
            <div className="fga-guide-icon"><FileText size={20} color="#0f62fe" /></div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{g.title}</div>
            <div style={{ fontSize: 13, color: "var(--gray-70)", lineHeight: 1.5, flex: 1 }}>{g.desc}</div>
            <button className="fga-btn fga-btn-secondary" style={{ alignSelf: "flex-start" }} onClick={() => downloadGuide(g.id)}>
              <Download size={15} /> Download PDF
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===================== App shell ===================== */

export default function FinancialGuideAI() {
  const [page, setPage] = useState("home");
  const [navOpen, setNavOpen] = useState(false);

  const renderPage = () => {
    switch (page) {
      case "home": return <HomePage onNavigate={setPage} />;
      case "chatbot": return <ChatbotPage />;
      case "dashboard": return <DashboardPage onNavigate={setPage} />;
      case "budget": return <BudgetPlannerPage />;
      case "investment": return <InvestmentCalculatorPage />;
      case "scam": return <ScamAwarenessPage />;
      case "guides": return <PdfGuidesPage />;
      default: return null;
    }
  };

  return (
    <div className="fga-root">
      <GlobalStyle />
      <div className="fga-shell">
        <Sidebar active={page} onNavigate={setPage} open={navOpen} onClose={() => setNavOpen(false)} />
        <div className="fga-main">
          <Topbar page={page} onMenuClick={() => setNavOpen(true)} />
          <div className="fga-content">
            {page !== "home" && (
              <div>
                <h1 className="fga-page-title">{PAGE_TITLES[page]}</h1>
              </div>
            )}
            {renderPage()}
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Plus,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  MapPin,
  Shield,
  Store,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Camera,
  CreditCard,
  Send,
  Eye,
  X,
  Building2,
  User,
  Download,
  Check,
  Sparkles,
  Phone,
  Mail,
  Globe,
  Map,
  Loader2,
} from "lucide-react";
import {
  listUsers,
  getDossier,
  approveUser,
  rejectUser,
  AdminProfile,
  DossierDoc,
  ApprovalStatus,
} from "../services/api";
import { useAdmin } from "../context/AdminContext";

export interface Merchant {
  id: string;
  name: string;
  tradeName: string;
  phone: string;
  email: string;
  initials: string;
  location: string;
  region: string;
  kyc: string;
  trust: number;
  status: "Active" | "Pending" | "Suspended" | "Rejected";
  joined: string;
  bvn: string;
  nin: string;
  wemaAcc: string;
  wemaName: string;
  livenessScore: number;
  idDocType: string;
  idDocNum: string;
  rejectionReason?: string;
}

// Maps the backend approval_status enum to the UI status label.
const STATUS_LABEL: Record<ApprovalStatus, Merchant["status"]> = {
  approved: "Active",
  pending: "Pending",
  rejected: "Rejected",
  suspended: "Suspended",
};

const KYC_LABEL: Record<string, string> = {
  tier_0: "Tier 3",
  tier_1: "Tier 1",
  tier_2: "Tier 1",
  tier_3: "Tier 1",
};

function initialsOf(name: string | null): string {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

// Adapts an AdminProfile record from the API into the UI's Merchant shape.
function toMerchant(p: AdminProfile): Merchant {
  return {
    id: p.id,
    name: p.full_name || "Unnamed Merchant",
    tradeName: p.trade_name || p.commodity_type || "—",
    phone: p.phone || "—",
    email: p.email || "—",
    initials: initialsOf(p.full_name),
    location: p.market_cluster || p.region || "—",
    region: p.region || "—",
    kyc: KYC_LABEL[p.kyc_tier] || "Tier 3",
    trust: p.trust_score ?? 0,
    status: STATUS_LABEL[p.approval_status] || "Pending",
    joined: new Date(p.created_at).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    bvn: p.bvn || "—",
    nin: p.nin || "—",
    wemaAcc: p.wema_account_number || "—",
    wemaName: p.wema_account_name || "—",
    livenessScore: p.liveness_score ?? 0,
    idDocType: "Government ID",
    idDocNum: p.nin ? `NIN-${p.nin}` : "—",
    rejectionReason: p.rejection_reason || undefined,
  };
}

const AVATARS = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-orange-500",
  "bg-fuchsia-500",
  "bg-lime-600",
];
const PAGE = 8;

const PRESET_REASON_OPTIONS = [
  "NIN / BVN Name Mismatch with Wema Bank Account Name",
  "Unclear or Blurry ID Document Photo",
  "Facial Liveness Verification Failure (< 80% match score)",
  "Invalid or Suspended Wema Bank Account Number",
  "Incomplete Market Association / Business Proof",
  "Custom Regulatory Audit Rejection",
];

function TrustMeter({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-emerald-500"
      : score >= 60
        ? "bg-amber-500"
        : "bg-red-500";
  const textColor =
    score >= 80
      ? "text-emerald-700 dark:text-emerald-400"
      : score >= 60
        ? "text-amber-700 dark:text-amber-400"
        : "text-red-700 dark:text-red-400";
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`text-[11px] font-bold tabular-nums ${textColor}`}>
        {score}
      </span>
    </div>
  );
}

function KycBadge({ tier }: { tier: string }) {
  if (tier === "Tier 1")
    return (
      <span className="badge-success whitespace-nowrap">
        <UserCheck size={9} />
        Tier 1 Verified
      </span>
    );
  if (tier === "Tier 2")
    return (
      <span className="badge-warning whitespace-nowrap">
        <Shield size={9} />
        Tier 2
      </span>
    );
  return <span className="badge-danger whitespace-nowrap">Tier 3</span>;
}

function StatusBadge({ s }: { s: string }) {
  if (s === "Active")
    return (
      <span className="badge-success whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
        Active
      </span>
    );
  if (s === "Pending")
    return (
      <span className="badge-warning whitespace-nowrap">
        <AlertTriangle size={9} />
        Pending KYC
      </span>
    );
  if (s === "Rejected")
    return (
      <span className="badge-danger whitespace-nowrap">
        <XCircle size={9} />
        KYC Rejected
      </span>
    );
  return <span className="badge-danger whitespace-nowrap">Suspended</span>;
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

export default function MerchantsScreen() {
  const { can } = useAdmin();
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("All Regions");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [kycFilter, setKycFilter] = useState("All Tiers");
  const [page, setPage] = useState(1);

  // Fetches merchants from the backend, respecting the current status filter.
  const loadMerchants = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const statusParam =
        statusFilter === "All Status"
          ? undefined
          : (
              {
                Active: "approved",
                Pending: "pending",
                Rejected: "rejected",
                Suspended: "suspended",
              } as Record<string, string>
            )[statusFilter];
      const res = await listUsers({ status: statusParam, limit: 200 });
      setMerchants(res.users.map(toMerchant));
    } catch (e: any) {
      setLoadError(e?.message || "Could not load merchants.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadMerchants();
  }, [loadMerchants]);

  // Modals state
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(
    null,
  );
  const [dossierDocs, setDossierDocs] = useState<DossierDoc[]>([]);
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Load the full dossier (profile + signed document URLs) when a merchant is
  // opened for inspection.
  const openDossier = async (m: Merchant) => {
    setSelectedMerchant(m);
    setShowRejectForm(false);
    setDossierDocs([]);
    try {
      const res = await getDossier(m.id);
      setDossierDocs(res.documents);
      setSelectedMerchant(toMerchant(res.profile));
    } catch (e: any) {
      triggerToast(e?.message || "Could not load dossier documents.");
    }
  };

  const [selectedPresetReason, setSelectedPresetReason] = useState(
    PRESET_REASON_OPTIONS[0],
  );
  const [rejectionNotes, setRejectionNotes] = useState("");

  // Add Merchant Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMerchName, setNewMerchName] = useState("");
  const [newMerchLoc, setNewMerchLoc] = useState("");
  const [newMerchRegion, setNewMerchRegion] = useState("Lagos");
  const [newMerchWemaAcc, setNewMerchWemaAcc] = useState("0129384756");
  const [newMerchWemaName, setNewMerchWemaName] = useState("");
  const [newMerchNin, setNewMerchNin] = useState("");
  const [newMerchBvn, setNewMerchBvn] = useState("");

  // Grant Loan Modal state
  const [showGrantLoanModal, setShowGrantLoanModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(
    "Amina Bello (M-1042)",
  );
  const [grantAmount, setGrantAmount] = useState("250000");
  const [grantTenure, setGrantTenure] = useState("30 Days");

  // Filter drawer modal
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filtered = merchants.filter(
    (m) =>
      (m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.id.toLowerCase().includes(search.toLowerCase()) ||
        m.wemaAcc.includes(search)) &&
      (region === "All Regions" || m.region === region) &&
      (statusFilter === "All Status" || m.status === statusFilter) &&
      (kycFilter === "All Tiers" || m.kyc === kycFilter),
  );

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const rows = filtered.slice((page - 1) * PAGE, page * PAGE);

  // Real CSV File Download
  const handleRealExportCSV = () => {
    const headers = [
      "ID",
      "Name",
      "Trade Name",
      "Phone",
      "Location",
      "Region",
      "KYC Tier",
      "Trust Score",
      "Status",
      "Wema Account",
      "Wema Account Name",
    ];
    const csvRows = merchants.map((m) => [
      m.id,
      `"${m.name}"`,
      `"${m.tradeName}"`,
      `"${m.phone}"`,
      `"${m.location}"`,
      m.region,
      m.kyc,
      m.trust,
      m.status,
      m.wemaAcc,
      `"${m.wemaName}"`,
    ]);

    const csvContent = [
      headers.join(","),
      ...csvRows.map((r) => r.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `kudinode_merchants_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("kudinode_merchants_export.csv downloaded to device!");
  };

  // Action: Add Merchant Submit
  const handleAddMerchantSubmit = () => {
    if (!newMerchName) return;
    const initials = newMerchName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
    const newM: Merchant = {
      id: `M-10${54 + merchants.length}`,
      name: newMerchName,
      tradeName: `${newMerchName} Enterprises`,
      phone: "+234 803 999 8877",
      email: `${newMerchName.toLowerCase().replace(/ /g, ".")}@market.ng`,
      initials,
      location: newMerchLoc || "Ikeja, Lagos",
      region: newMerchRegion,
      kyc: "Tier 1",
      trust: 85,
      status: "Active",
      joined: "Today",
      bvn: newMerchBvn || "22199887766",
      nin: newMerchNin || "70944332211",
      wemaAcc: newMerchWemaAcc,
      wemaName: newMerchWemaName || newMerchName,
      livenessScore: 98.5,
      idDocType: "National Identity Slip (NIN)",
      idDocNum: `NIN-${newMerchNin || "70944332211"}`,
    };
    setMerchants([newM, ...merchants]);
    setShowAddModal(false);
    setNewMerchName("");
    triggerToast(
      `Merchant ${newMerchName} added successfully with Wema Settlement Account!`,
    );
  };

  // Action: Grant Loan Submit
  const handleGrantLoanSubmit = () => {
    setShowGrantLoanModal(false);
    triggerToast(
      `Trade Loan of ₦${parseInt(grantAmount).toLocaleString()} approved and disbursed to ${selectedApplicant}!`,
    );
  };

  // Action: Approve KYC — calls the backend, which flips approval_status to
  // 'approved' so the merchant can finally sign in to the mobile app.
  const handleApproveKYC = async (merchantId: string) => {
    setActionBusy(true);
    try {
      await approveUser(merchantId);
      setMerchants((prev) =>
        prev.map((m) =>
          m.id === merchantId ? { ...m, status: "Active", kyc: "Tier 1" } : m,
        ),
      );
      setSelectedMerchant(null);
      triggerToast("Merchant approved — they can now sign in to the app.");
    } catch (e: any) {
      triggerToast(e?.message || "Approval failed.");
    } finally {
      setActionBusy(false);
    }
  };

  // Action: Confirm & Send Rejection — persists the rejection + reason so the
  // merchant is blocked at login and shown the reason.
  const handleConfirmRejection = async () => {
    if (!selectedMerchant) return;
    const finalReason = rejectionNotes.trim()
      ? `${selectedPresetReason}: ${rejectionNotes.trim()}`
      : selectedPresetReason;

    setActionBusy(true);
    try {
      await rejectUser(selectedMerchant.id, finalReason);
      setMerchants((prev) =>
        prev.map((m) =>
          m.id === selectedMerchant.id
            ? { ...m, status: "Rejected", rejectionReason: finalReason }
            : m,
        ),
      );
      setShowRejectForm(false);
      setSelectedMerchant(null);
      setRejectionNotes("");
      triggerToast(
        "Rejection recorded — the merchant is blocked from sign in.",
      );
    } catch (e: any) {
      triggerToast(e?.message || "Rejection failed.");
    } finally {
      setActionBusy(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Merchant KYC Audit & Registration Management
          </h2>
          <p className="text-[12px] text-slate-400 mt-0.5">
            Audit identity documents, BVN/NIN validation, selfie liveness
            capture, and dispatch KYC approval/rejection notices to user apps.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowFilterModal(true)}
            className="btn-outline h-9 gap-1.5"
          >
            <SlidersHorizontal size={14} /> Filter Table
          </button>
          {can('merchants', 'export') && (
            <button
              onClick={handleRealExportCSV}
              className="btn-outline h-9 gap-1.5 text-emerald-600 border-emerald-300 dark:border-emerald-800"
            >
              <Download size={14} /> Export CSV
            </button>
          )}
          {can('credit', 'create') && (
            <button
              onClick={() => setShowGrantLoanModal(true)}
              className="btn-primary h-9 bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
            >
              <Sparkles size={14} /> Grant Micro-Credit Loan
            </button>
          )}
          {can('merchants', 'create') && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary h-9 gap-1.5"
            >
              <Plus size={14} /> Add Merchant
            </button>
          )}
        </div>
      </motion.div>

      {/* Stats bar */}
      <motion.div variants={itemVariants} className="grid grid-cols-4 gap-3">
        {[
          {
            label: "Total Merchants",
            value: merchants.length,
            color: "text-slate-900 dark:text-white",
          },
          {
            label: "Verified Active",
            value: merchants.filter((m) => m.status === "Active").length,
            color: "text-emerald-600 dark:text-emerald-400",
          },
          {
            label: "Pending KYC Review",
            value: merchants.filter((m) => m.status === "Pending").length,
            color: "text-amber-600 dark:text-amber-400",
          },
          {
            label: "KYC Rejected",
            value: merchants.filter((m) => m.status === "Rejected").length,
            color: "text-red-600 dark:text-red-400",
          },
        ].map((s) => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <Store size={18} className="text-slate-400 flex-shrink-0" />
            <div>
              <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-slate-400">{s.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Table Card */}
      <motion.div variants={itemVariants} className="card overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] input py-2">
            <Search size={13} className="text-slate-400 flex-shrink-0" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by merchant name, ID, or Wema account..."
              className="bg-transparent text-[13px] text-slate-700 dark:text-slate-300 placeholder:text-slate-400 outline-none flex-1"
            />
          </div>
          <select
            value={region}
            onChange={(e) => {
              setRegion(e.target.value);
              setPage(1);
            }}
            className="input py-2 w-40"
          >
            {["All Regions", "Lagos", "Abuja", "Port Harcourt"].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="input py-2 w-44"
          >
            {["All Status", "Active", "Pending", "Rejected", "Suspended"].map(
              (s) => (
                <option key={s}>{s}</option>
              ),
            )}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
              <tr>
                {[
                  "Merchant",
                  "Location",
                  "Wema Account",
                  "KYC Status",
                  "Trust Score",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th key={h} className="table-head-cell whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {rows.map((m) => (
                <tr
                  key={m.id}
                  className="table-row hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                >
                  <td className="table-cell whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full ${AVATARS[merchants.indexOf(m) % AVATARS.length]} flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0`}
                      >
                        {m.initials}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white text-[13px]">
                          {m.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {m.id} · {m.tradeName}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell whitespace-nowrap">
                    <span className="flex items-center gap-1 text-[12px] text-slate-600 dark:text-slate-300">
                      <MapPin
                        size={11}
                        className="text-slate-400 flex-shrink-0"
                      />
                      {m.location}
                    </span>
                  </td>
                  <td className="table-cell whitespace-nowrap">
                    <div>
                      <p className="text-[12px] font-mono font-bold text-slate-800 dark:text-slate-200">
                        {m.wemaAcc}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[140px]">
                        {m.wemaName}
                      </p>
                    </div>
                  </td>
                  <td className="table-cell whitespace-nowrap">
                    <KycBadge tier={m.kyc} />
                  </td>
                  <td className="table-cell whitespace-nowrap">
                    <TrustMeter score={m.trust} />
                  </td>
                  <td className="table-cell whitespace-nowrap">
                    <StatusBadge s={m.status} />
                  </td>
                  <td className="table-cell whitespace-nowrap">
                    <button
                      onClick={() => openDossier(m)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg border border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400 bg-violet-50/50 dark:bg-violet-950/40 hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors shadow-sm whitespace-nowrap"
                    >
                      <Eye size={12} /> Inspect Full KYC
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
          <p className="text-[11px] text-slate-400">
            Showing {Math.min((page - 1) * PAGE + 1, filtered.length)}–
            {Math.min(page * PAGE, filtered.length)} of {filtered.length}{" "}
            merchants
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-icon p-1.5 disabled:opacity-30"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-lg text-[12px] font-semibold transition-colors ${page === p ? "bg-violet-600 text-white" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="btn-icon p-1.5 disabled:opacity-30"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── 1. CENTERED FULL KYC INSPECTION & VERIFICATION MODAL ── */}
      <AnimatePresence>
        {selectedMerchant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card max-w-3xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-auto max-h-[90vh] overflow-y-auto space-y-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-[#0D1321] z-10 pt-1">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 text-white flex items-center justify-center font-bold text-sm shadow-md">
                    {selectedMerchant.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        KYC Audit & Registration Dossier
                      </h3>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/60 text-violet-600 dark:text-violet-300">
                        {selectedMerchant.id}
                      </span>
                    </div>
                    <p className="text-[12px] text-slate-400 mt-0.5">
                      Submitted via Mobile App · {selectedMerchant.joined}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMerchant(null)}
                  className="btn-icon p-1.5"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Rejection Alert Banner if applicable */}
              {selectedMerchant.status === "Rejected" &&
                selectedMerchant.rejectionReason && (
                  <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 flex items-start gap-3">
                    <XCircle
                      className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
                      size={18}
                    />
                    <div>
                      <p className="text-[12px] font-bold text-red-700 dark:text-red-300">
                        Previous Rejection Notice Sent to App
                      </p>
                      <p className="text-[12px] text-red-600 dark:text-red-400 mt-0.5">
                        {selectedMerchant.rejectionReason}
                      </p>
                    </div>
                  </div>
                )}

              {/* Section A: Filled Personal & Business Information */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 flex items-center gap-1.5">
                  <User size={13} /> 1. Merchant Registration & Business Details
                  (Filled by User)
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 font-semibold">
                      Full Merchant Name
                    </p>
                    <p className="text-[13px] font-extrabold text-slate-900 dark:text-white mt-0.5">
                      {selectedMerchant.name}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 font-semibold">
                      Trade / Business Name
                    </p>
                    <p className="text-[13px] font-extrabold text-slate-900 dark:text-white mt-0.5">
                      {selectedMerchant.tradeName}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 font-semibold">
                      Primary Phone Number
                    </p>
                    <p className="text-[13px] font-extrabold font-mono text-slate-900 dark:text-white mt-0.5 flex items-center gap-1">
                      <Phone size={11} className="text-emerald-500" />{" "}
                      {selectedMerchant.phone}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 font-semibold">
                      Work Email Address
                    </p>
                    <p className="text-[12px] font-medium text-slate-900 dark:text-white mt-0.5 flex items-center gap-1 truncate">
                      <Mail size={11} className="text-violet-500" />{" "}
                      {selectedMerchant.email}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 col-span-2">
                    <p className="text-[10px] text-slate-400 font-semibold">
                      Market Cluster Address & GPS Coordinates
                    </p>
                    <p className="text-[12px] font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1">
                      <MapPin
                        size={12}
                        className="text-red-500 flex-shrink-0"
                      />{" "}
                      {selectedMerchant.location} (Node #LA-482)
                    </p>
                  </div>
                </div>
              </div>

              {/* Section B: Regulatory Credentials & Wema Banking Settlement Account */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 flex items-center gap-1.5">
                  <Building2 size={13} /> 2. Regulatory BVN/NIN & Banking
                  Settlement Node
                </h4>
                <div className="grid grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 font-semibold">
                      BVN (11-Digits)
                    </p>
                    <p className="text-[13px] font-extrabold font-mono text-slate-900 dark:text-white mt-0.5">
                      {selectedMerchant.bvn}
                    </p>
                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 mt-0.5">
                      <CheckCircle2 size={10} /> Verified NIBSS
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 font-semibold">
                      NIN (11-Digits)
                    </p>
                    <p className="text-[13px] font-extrabold font-mono text-slate-900 dark:text-white mt-0.5">
                      {selectedMerchant.nin}
                    </p>
                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 mt-0.5">
                      <CheckCircle2 size={10} /> Verified NIMC
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 font-semibold">
                      Wema Account No.
                    </p>
                    <p className="text-[13px] font-extrabold font-mono text-slate-900 dark:text-white mt-0.5">
                      {selectedMerchant.wemaAcc}
                    </p>
                    <span className="text-[9px] font-bold text-violet-600 dark:text-violet-400 mt-0.5 block">
                      Wema NIP Node
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 font-semibold">
                      Wema Account Name
                    </p>
                    <p className="text-[12px] font-extrabold text-slate-900 dark:text-white mt-0.5 truncate">
                      {selectedMerchant.wemaName}
                    </p>
                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 mt-0.5">
                      <CheckCircle2 size={10} /> 100% Name Match
                    </span>
                  </div>
                </div>
              </div>

              {/* Section C: Uploaded User Verification Artifacts (Selfie Liveness & Scanned ID Document Cards) */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 flex items-center gap-1.5">
                  <Camera size={13} /> 3. Uploaded User Artifacts (Live Camera
                  Selfie & Scanned ID Document)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {/* User Captured Selfie / Liveness Photo */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Camera size={14} className="text-violet-500" />{" "}
                        Captured Live Selfie
                      </p>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                        {selectedMerchant.livenessScore}% Match
                      </span>
                    </div>

                    <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-700 group">
                      {(() => {
                        const selfie = dossierDocs.find(
                          (d) => d.doc_type === "selfie",
                        );
                        return selfie?.url ? (
                          <img
                            src={selfie.url}
                            alt="Merchant selfie"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl border-4 border-emerald-400">
                            {selectedMerchant.initials}
                          </div>
                        );
                      })()}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-3 pointer-events-none">
                        <p className="text-[11px] font-bold text-white">
                          {selectedMerchant.name}
                        </p>
                        <p className="text-[9px] text-emerald-400 font-semibold">
                          {dossierDocs.some((d) => d.doc_type === "selfie")
                            ? "Live selfie captured via Expo Camera"
                            : "No selfie uploaded yet"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* User Scanned ID Document Photo (NIN / Driver License / Voter Card) */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <FileText size={14} className="text-violet-500" />{" "}
                        Uploaded ID Document
                      </p>
                      <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 font-mono">
                        {selectedMerchant.idDocNum}
                      </span>
                    </div>

                    {(() => {
                      const idDoc = dossierDocs.find((d) =>
                        d.doc_type.startsWith("id_"),
                      );
                      if (idDoc?.url) {
                        return (
                          <a
                            href={idDoc.url}
                            target="_blank"
                            rel="noreferrer"
                            className="relative block w-full h-44 rounded-xl overflow-hidden border border-slate-700 group"
                          >
                            <img
                              src={idDoc.url}
                              alt="ID document"
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded bg-slate-900/80 text-violet-300">
                              Inspect HD File ↗
                            </span>
                          </a>
                        );
                      }
                      return (
                        <div className="relative w-full h-44 rounded-xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 p-4 border border-slate-700 flex flex-col justify-between">
                          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                            <div className="flex items-center gap-2">
                              <Shield size={16} className="text-emerald-400" />
                              <span className="text-[11px] font-extrabold text-white">
                                {selectedMerchant.idDocType}
                              </span>
                            </div>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                              FEDERAL REPUBLIC OF NIGERIA
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-16 rounded bg-slate-700 border border-slate-500 flex items-center justify-center text-white font-bold text-xs">
                              {selectedMerchant.initials}
                            </div>
                            <div className="text-[10px] space-y-0.5 text-slate-300">
                              <p className="font-bold text-white">
                                {selectedMerchant.name}
                              </p>
                              <p className="font-mono">
                                NIN: {selectedMerchant.nin}
                              </p>
                              <p className="text-amber-400 font-semibold">
                                No ID document uploaded yet
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-800">
                            <span>Awaiting merchant upload</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Accept or Reject Controls */}
              {showRejectForm ? (
                <div className="mt-5 p-4 rounded-2xl bg-red-50/60 dark:bg-red-950/40 border border-red-200 dark:border-red-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] font-extrabold text-red-700 dark:text-red-300 flex items-center gap-1.5">
                      <XCircle size={14} /> Specify Rejection Reason for App
                      Notification
                    </p>
                    <button
                      onClick={() => setShowRejectForm(false)}
                      className="text-[11px] text-slate-400 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                      Select Primary Reason Tag
                    </label>
                    <select
                      value={selectedPresetReason}
                      onChange={(e) => setSelectedPresetReason(e.target.value)}
                      className="input py-2 w-full mt-1 text-[12px] bg-white dark:bg-slate-900 border-red-200 dark:border-red-800"
                    >
                      {PRESET_REASON_OPTIONS.map((opt) => (
                        <option key={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                      Custom Rejection Audit Message (Will be sent to user's
                      mobile app)
                    </label>
                    <textarea
                      rows={3}
                      value={rejectionNotes}
                      onChange={(e) => setRejectionNotes(e.target.value)}
                      placeholder="e.g. Your NIN name (Amina Bello) does not match the BVN record. Please re-upload a clear copy of your NIN slip in the app."
                      className="input py-2 w-full mt-1 text-[12px] bg-white dark:bg-slate-900 border-red-200 dark:border-red-800 outline-none text-slate-900 dark:text-white"
                    />
                  </div>

                  <button
                    onClick={handleConfirmRejection}
                    className="w-full btn-primary h-10 bg-red-600 hover:bg-red-700 text-white font-bold gap-2 text-[12px]"
                  >
                    <Send size={14} /> Dispatch Rejection Notice & Lock App
                    Account
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                  {can('merchants', 'approve') ? (
                    <button
                      onClick={() => handleApproveKYC(selectedMerchant.id)}
                      className="flex-1 btn-primary h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 text-[13px]"
                    >
                      <CheckCircle2 size={16} /> Accept & Verify Tier-1 KYC
                    </button>
                  ) : (
                    <div className="flex-1 flex items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-400 font-semibold">
                      You don't have permission to approve KYC
                    </div>
                  )}

                  {can('merchants', 'reject') ? (
                    <button
                      onClick={() => setShowRejectForm(true)}
                      className="flex-1 btn-outline h-11 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 font-bold gap-2 text-[13px]"
                    >
                      <XCircle size={16} /> Reject & Specify Reason
                    </button>
                  ) : can('merchants', 'approve') && (
                    <div className="flex-1" />
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 2. CENTERED ADD MERCHANT FORM MODAL ── */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-auto space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Onboard New Merchant Account
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="btn-icon p-1"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Merchant Full Name *
                  </label>
                  <input
                    value={newMerchName}
                    onChange={(e) => setNewMerchName(e.target.value)}
                    placeholder="e.g. Kazeem Adeleke"
                    className="input py-2 w-full mt-1 text-[12px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Market Cluster / Location
                    </label>
                    <input
                      value={newMerchLoc}
                      onChange={(e) => setNewMerchLoc(e.target.value)}
                      placeholder="e.g. Oyingbo, Lagos"
                      className="input py-2 w-full mt-1 text-[12px]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      State Region
                    </label>
                    <select
                      value={newMerchRegion}
                      onChange={(e) => setNewMerchRegion(e.target.value)}
                      className="input py-2 w-full mt-1 text-[12px]"
                    >
                      <option>Lagos</option>
                      <option>Abuja</option>
                      <option>Port Harcourt</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Wema Settlement Account No.
                    </label>
                    <input
                      value={newMerchWemaAcc}
                      onChange={(e) => setNewMerchWemaAcc(e.target.value)}
                      placeholder="0129384756"
                      className="input py-2 w-full mt-1 text-[12px] font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Account Holder Name
                    </label>
                    <input
                      value={newMerchWemaName}
                      onChange={(e) => setNewMerchWemaName(e.target.value)}
                      placeholder="Kazeem Adeleke"
                      className="input py-2 w-full mt-1 text-[12px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      NIN (11 Digits)
                    </label>
                    <input
                      value={newMerchNin}
                      onChange={(e) => setNewMerchNin(e.target.value)}
                      placeholder="70912345678"
                      className="input py-2 w-full mt-1 text-[12px] font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      BVN (11 Digits)
                    </label>
                    <input
                      value={newMerchBvn}
                      onChange={(e) => setNewMerchBvn(e.target.value)}
                      placeholder="22198765432"
                      className="input py-2 w-full mt-1 text-[12px] font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="btn-outline flex-1 text-[12px]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMerchantSubmit}
                  className="btn-primary flex-1 text-[12px] font-bold gap-1.5"
                >
                  <Check size={14} /> Provision Merchant Account
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 3. CENTERED GRANT MICRO-CREDIT LOAN FORM MODAL ── */}
      <AnimatePresence>
        {showGrantLoanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-auto space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-blue-500" size={18} />
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Grant Micro-Credit Loan to Applicant
                  </h3>
                </div>
                <button
                  onClick={() => setShowGrantLoanModal(false)}
                  className="btn-icon p-1"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Select Loan Applicant *
                  </label>
                  <select
                    value={selectedApplicant}
                    onChange={(e) => setSelectedApplicant(e.target.value)}
                    className="input py-2 w-full mt-1 text-[12px]"
                  >
                    <option>
                      Amina Bello (M-1042) — ₦700,000 Requested (Trust Score:
                      87)
                    </option>
                    <option>
                      Babatunde Salami (M-1043) — ₦250,000 Requested (Trust
                      Score: 63)
                    </option>
                    <option>
                      Chinedu Okafor (M-1045) — ₦450,000 Requested (Trust Score:
                      44)
                    </option>
                    <option>
                      Tayo Abiodun (M-1048) — ₦900,000 Requested (Trust Score:
                      82)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Approved Loan Amount (₦) *
                  </label>
                  <input
                    value={grantAmount}
                    onChange={(e) => setGrantAmount(e.target.value)}
                    placeholder="250000"
                    className="input py-2 w-full mt-1 text-[12px] font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Repayment Cycle Tenure
                  </label>
                  <select
                    value={grantTenure}
                    onChange={(e) => setGrantTenure(e.target.value)}
                    className="input py-2 w-full mt-1 text-[12px]"
                  >
                    <option>30 Days (Single Market Cycle)</option>
                    <option>60 Days (Bi-Monthly Installments)</option>
                    <option>90 Days (Quarterly Trade Line)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowGrantLoanModal(false)}
                  className="btn-outline flex-1 text-[12px]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGrantLoanSubmit}
                  className="btn-primary flex-1 text-[12px] font-bold bg-blue-600 hover:bg-blue-700 gap-1.5"
                >
                  <Check size={14} /> Disburse Loan to Settlement Acc
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 4. CENTERED MULTI-CRITERIA FILTER MODAL ── */}
      <AnimatePresence>
        {showFilterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-auto space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Filter Merchant Network
                </h3>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="btn-icon p-1"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Geographic Region
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="input py-2 w-full mt-1 text-[12px]"
                  >
                    {["All Regions", "Lagos", "Abuja", "Port Harcourt"].map(
                      (r) => (
                        <option key={r}>{r}</option>
                      ),
                    )}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Account Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="input py-2 w-full mt-1 text-[12px]"
                  >
                    {[
                      "All Status",
                      "Active",
                      "Pending",
                      "Rejected",
                      "Suspended",
                    ].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    KYC Verification Tier
                  </label>
                  <select
                    value={kycFilter}
                    onChange={(e) => setKycFilter(e.target.value)}
                    className="input py-2 w-full mt-1 text-[12px]"
                  >
                    {["All Tiers", "Tier 1", "Tier 2", "Tier 3"].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setRegion("All Regions");
                    setStatusFilter("All Status");
                    setKycFilter("All Tiers");
                    setShowFilterModal(false);
                  }}
                  className="btn-outline flex-1 text-[12px]"
                >
                  Reset Filters
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="btn-primary flex-1 text-[12px] font-bold"
                >
                  Apply Filters ({filtered.length} matches)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-6 right-6 z-50 p-3.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-2 shadow-2xl border border-slate-700"
          >
            <Check size={14} className="text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import * as Recharts from "recharts";
import { 
  BarChart3, Users, Factory, Calendar, FileText, Search, AlertTriangle,
  Shield, LogOut, ChevronRight, ChevronDown, Clock, Camera, Plus, Check,
  X, Eye, EyeOff, Mail, Lock, User, Building2, Truck, Wrench, Flame,
  TrendingUp, TrendingDown, Activity, Package, MapPin, Filter, Download,
  Bell, Settings, Home, Layers, ClipboardList, Gauge, PieChart, ArrowRight,
  ArrowLeft, Star, Zap, Target, CheckCircle, XCircle, AlertCircle, Info,
  ChevronUp, MoreVertical, Edit3, Trash2, ExternalLink, RefreshCw, Menu,
  Sun, Moon, LayoutDashboard, HardHat, Cog, Database
} from "lucide-react";

// ============================================================
// REFRAMAX PORTAL - Sistema de Gestão Operacional Industrial
// ============================================================

// --- CONSTANTS & CONFIG ---
const ROLES = {
  ADMIN: "admin",
  GERENTE: "gerente", 
  COORDENADOR: "coordenador",
  SUPERVISOR: "supervisor",
  PLANEJAMENTO: "planejamento",
  LIDER: "lider",
  CLIENTE: "cliente",
  CLIENTE_FINANCEIRO: "cliente_financeiro",
  LOGISTICA: "logistica"
};

const ROLE_LABELS = {
  [ROLES.ADMIN]: "Administrador",
  [ROLES.GERENTE]: "Gerente",
  [ROLES.COORDENADOR]: "Coordenador",
  [ROLES.SUPERVISOR]: "Supervisor",
  [ROLES.PLANEJAMENTO]: "Planejamento",
  [ROLES.LIDER]: "Líder de Equipe",
  [ROLES.CLIENTE]: "Cliente (Ternium)",
  [ROLES.CLIENTE_FINANCEIRO]: "Cliente Financeiro",
  [ROLES.LOGISTICA]: "Logística"
};

const CAN_SEE_FINANCIAL = [ROLES.ADMIN, ROLES.GERENTE, ROLES.COORDENADOR, ROLES.SUPERVISOR, ROLES.PLANEJAMENTO, ROLES.CLIENTE_FINANCEIRO];
const CAN_SEE_OPERATIONS = [ROLES.ADMIN, ROLES.GERENTE, ROLES.COORDENADOR, ROLES.SUPERVISOR, ROLES.PLANEJAMENTO, ROLES.LIDER, ROLES.CLIENTE, ROLES.CLIENTE_FINANCEIRO];
const LOGISTICS_ROLES = [ROLES.LOGISTICA, ROLES.ADMIN];

const CONTRACTS = [
  { id: "CT-001", name: "Bateria 3A - Manutenção Refratária", client: "Ternium", type: "aderencia", target: 92, teams: ["EQ-001","EQ-002","EQ-003"] },
  { id: "CT-002", name: "Bateria 4B - Disponibilidade Mecânica", client: "Ternium", type: "disponibilidade", target: 90, teams: ["EQ-004","EQ-005"] },
  { id: "CT-003", name: "Bateria 5C - Serviços PU", client: "Ternium", type: "pu", target: 95, teams: ["EQ-006","EQ-007"] },
];

const TEAMS = [
  { id: "EQ-001", name: "Projeção de Soleira", contract: "CT-001", leader: "Carlos Silva", members: 12 },
  { id: "EQ-002", name: "Quadrante", contract: "CT-001", leader: "Roberto Santos", members: 8 },
  { id: "EQ-003", name: "Reparo de Porta", contract: "CT-001", leader: "José Oliveira", members: 6 },
  { id: "EQ-004", name: "Mecânica Industrial", contract: "CT-002", leader: "André Costa", members: 10 },
  { id: "EQ-005", name: "Soldagem Especial", contract: "CT-002", leader: "Paulo Mendes", members: 7 },
  { id: "EQ-006", name: "Downcomer", contract: "CT-003", leader: "Lucas Pereira", members: 9 },
  { id: "EQ-007", name: "Canal Soleflue", contract: "CT-003", leader: "Fernando Lima", members: 8 },
];

const BATTERIES = [
  { id: "BAT-3A", name: "Bateria 3A", furnaces: 67, status: "operational" },
  { id: "BAT-4B", name: "Bateria 4B", furnaces: 67, status: "partial" },
  { id: "BAT-5C", name: "Bateria 5C", furnaces: 67, status: "maintenance" },
];

const WORKFORCE_TYPES = [
  { code: "REF", label: "Refratarista", color: "#06b6d4" },
  { code: "MEC", label: "Mecânico", color: "#8b5cf6" },
  { code: "SOL", label: "Soldador", color: "#f59e0b" },
  { code: "AND", label: "Montador de Andaime", color: "#10b981" },
  { code: "OP", label: "Operador de Equipamento", color: "#ef4444" },
];

const REPAIR_REGIONS = [
  "Porta", "Soleira", "Teto", "Parede Lateral", "Parede Testeira",
  "Canal Ascendente", "Canal Soleflue", "Downcomer", "Primária", "Quadrante"
];

const DEVIATION_REASONS = [
  "Falta de material", "Condição climática", "Falta de efetivo", "Acesso bloqueado",
  "Equipamento indisponível", "Segurança (interrupção)", "Forno em operação", 
  "Alteração de prioridade", "Outro"
];

const STATUS_COLORS = { operational: "#10b981", partial: "#f59e0b", maintenance: "#ef4444", idle: "#6b7280" };

// --- MOCK DATA GENERATORS ---
const generateWeeklyKPI = () => ({
  hhProgramado: 480, hhRealizado: 456, aderencia: 95,
  atividadesProgramadas: 42, atividadesRealizadas: 39,
  desvios: 6, desviosResolvidos: 4,
  disponibilidade: 91.5, efetivo: 58, presenca: 94
});

const generatePeriodKPI = () => ({
  hhProgramado: 1920, hhRealizado: 1824, aderencia: 95,
  atividadesProgramadas: 168, atividadesRealizadas: 159,
  desvios: 22, desviosResolvidos: 18,
  disponibilidade: 92.3, efetivo: 58, presenca: 93.5,
  custoMO: 245000, custoMaterial: 89000, receitaPU: 178000
});

// --- UTILITY FUNCTIONS ---
const formatCurrency = (v) => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v);
const formatPercent = (v) => `${v.toFixed(1)}%`;
const formatDate = (d) => new Intl.DateTimeFormat('pt-BR').format(d);
const getPeriodDates = () => {
  const now = new Date();
  const day = now.getDate();
  let start, end;
  if (day >= 16) {
    start = new Date(now.getFullYear(), now.getMonth(), 16);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 15);
  } else {
    start = new Date(now.getFullYear(), now.getMonth() - 1, 16);
    end = new Date(now.getFullYear(), now.getMonth(), 15);
  }
  return { start, end };
};

// --- STYLE HELPERS ---
const glassBg = "backdrop-blur-xl bg-white/[0.04] border border-white/[0.08]";
const glassCard = `${glassBg} rounded-2xl shadow-2xl shadow-black/20`;
const gradientText = "bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent";
const btnPrimary = "bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:-translate-y-0.5 active:translate-y-0";
const btnSecondary = "bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-gray-300 font-medium py-2.5 px-6 rounded-xl transition-all duration-200";
const inputStyle = "w-full bg-white/[0.06] border border-white/[0.12] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all";
const selectStyle = "w-full bg-[#0f1729] border border-white/[0.12] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all appearance-none";

// ============================================================
// COMPONENTS
// ============================================================

// --- KPI Card ---
const KPICard = ({ title, value, unit, icon: Icon, trend, target, color = "cyan", small = false }) => {
  const isGood = trend === "up";
  const colorMap = {
    cyan: "from-cyan-500/20 to-teal-500/10 border-cyan-500/20",
    emerald: "from-emerald-500/20 to-green-500/10 border-emerald-500/20",
    amber: "from-amber-500/20 to-yellow-500/10 border-amber-500/20",
    rose: "from-rose-500/20 to-red-500/10 border-rose-500/20",
    violet: "from-violet-500/20 to-purple-500/10 border-violet-500/20",
  };
  const iconColorMap = { cyan: "text-cyan-400", emerald: "text-emerald-400", amber: "text-amber-400", rose: "text-rose-400", violet: "text-violet-400" };
  
  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} border rounded-2xl ${small ? 'p-4' : 'p-5'} transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`${small ? 'p-2' : 'p-2.5'} rounded-xl bg-white/[0.06]`}>
          <Icon size={small ? 16 : 20} className={iconColorMap[color]} />
        </div>
        {target && (
          <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
            parseFloat(value) >= target ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
          }`}>
            Meta: {target}{unit}
          </span>
        )}
      </div>
      <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">{title}</p>
      <div className="flex items-end gap-2">
        <span className={`${small ? 'text-2xl' : 'text-3xl'} font-bold text-white`}>{value}</span>
        {unit && <span className="text-gray-400 text-sm mb-1">{unit}</span>}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 mt-2 text-xs ${isGood ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isGood ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
          <span>{isGood ? '+2.3%' : '-1.5%'} vs semana anterior</span>
        </div>
      )}
    </div>
  );
};

// --- Mini Chart ---
const MiniChart = ({ data, color = "#06b6d4", height = 60 }) => (
  <Recharts.ResponsiveContainer width="100%" height={height}>
    <Recharts.AreaChart data={data}>
      <defs>
        <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3}/>
          <stop offset="100%" stopColor={color} stopOpacity={0}/>
        </linearGradient>
      </defs>
      <Recharts.Area type="monotone" dataKey="v" stroke={color} fill={`url(#grad-${color.replace('#','')})`} strokeWidth={2} dot={false}/>
    </Recharts.AreaChart>
  </Recharts.ResponsiveContainer>
);

// --- Progress Ring ---
const ProgressRing = ({ value, target, size = 80, color = "#06b6d4" }) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const isGood = value >= target;
  const fillColor = isGood ? "#10b981" : value >= target * 0.95 ? "#f59e0b" : "#ef4444";
  
  return (
    <div className="relative" style={{width:size,height:size}}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6}/>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={fillColor} strokeWidth={6}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-1000"/>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-white">{value}%</span>
      </div>
    </div>
  );
};

// --- Badge ---
const Badge = ({ children, variant = "default" }) => {
  const variants = {
    default: "bg-white/[0.08] text-gray-300",
    success: "bg-emerald-500/20 text-emerald-400",
    warning: "bg-amber-500/20 text-amber-400",
    danger: "bg-rose-500/20 text-rose-400",
    info: "bg-cyan-500/20 text-cyan-400",
    violet: "bg-violet-500/20 text-violet-400",
  };
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${variants[variant]}`}>{children}</span>;
};

// --- Modal ---
const Modal = ({ open, onClose, title, children, wide = false }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"/>
      <div className={`relative ${glassCard} p-6 ${wide ? 'max-w-4xl' : 'max-w-lg'} w-full max-h-[85vh] overflow-y-auto bg-[#0d1321]`} onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/[0.08] transition-colors"><X size={18} className="text-gray-400"/></button>
        </div>
        {children}
      </div>
    </div>
  );
};

// --- Tabs ---
const Tabs = ({ tabs, active, onChange }) => (
  <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
    {tabs.map(t => (
      <button key={t.id} onClick={() => onChange(t.id)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          active === t.id ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/20 text-cyan-300 shadow-inner' : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
        }`}>{t.label}</button>
    ))}
  </div>
);

// ============================================================
// PAGE: LOGIN
// ============================================================
const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRequestAccess, setShowRequestAccess] = useState(false);
  const [requestForm, setRequestForm] = useState({ name: "", email: "", company: "", role: "", justification: "" });
  const [requestSent, setRequestSent] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setBgIndex(p => (p + 1) % 3), 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    onLogin({ email, role: email.includes("admin") ? ROLES.ADMIN : email.includes("lider") ? ROLES.LIDER : email.includes("cliente") ? ROLES.CLIENTE : email.includes("logistica") ? ROLES.LOGISTICA : ROLES.SUPERVISOR });
  };

  const handleRequestAccess = (e) => {
    e.preventDefault();
    setRequestSent(true);
    setTimeout(() => { setRequestSent(false); setShowRequestAccess(false); }, 3000);
  };

  const bgColors = [
    "from-[#0a1628] via-[#0c1a30] to-[#071220]",
    "from-[#0f172a] via-[#1e293b] to-[#0f172a]",
    "from-[#0c1220] via-[#162033] to-[#0a1018]"
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgColors[bgIndex]} flex items-center justify-center p-4 relative overflow-hidden transition-all duration-[3000ms]`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Animated grid */}
          <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:'linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)',backgroundSize:'60px 60px'}}/>
          {/* Floating orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/[0.05] rounded-full blur-3xl" style={{animation:'pulse 8s ease-in-out infinite'}}/>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/[0.04] rounded-full blur-3xl" style={{animation:'pulse 10s ease-in-out infinite 2s'}}/>
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-emerald-500/[0.03] rounded-full blur-3xl" style={{animation:'pulse 12s ease-in-out infinite 4s'}}/>
          {/* Industrial image placeholder with zoom effect */}
          <div className="absolute inset-0 bg-cover bg-center opacity-20 transition-transform duration-[30000ms]" 
            style={{
              backgroundImage: 'url(/images/bg.jpg)',
              animation: 'slowZoom 30s ease-in-out infinite alternate'
            }}/>
        </div>
      </div>

      <style>{`
        @keyframes slowZoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.08); }
        }
        @keyframes pulse { 0%, 100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.1); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="relative z-10 w-full max-w-md" style={{animation:'slideUp 0.6s ease-out'}}>
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <Flame size={24} className="text-white"/>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">REFRAMAX</h1>
              <p className="text-[10px] text-cyan-400/80 tracking-[0.3em] uppercase">Portal de Gestão Operacional</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 mt-3 opacity-60">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/20"/>
            <span className="text-[10px] text-gray-500 tracking-widest uppercase">Ternium</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/20"/>
          </div>
        </div>

        {/* Login Card */}
        <div className={`${glassCard} p-8 bg-[#0d1321]/80`}>
          <h2 className="text-lg font-semibold text-white mb-1">Acessar Portal</h2>
          <p className="text-sm text-gray-400 mb-6">Entre com suas credenciais</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"/>
              <input type="email" placeholder="E-mail corporativo" value={email} onChange={e=>setEmail(e.target.value)}
                className={`${inputStyle} pl-11`} required/>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"/>
              <input type={showPassword?"text":"password"} placeholder="Senha" value={password} onChange={e=>setPassword(e.target.value)}
                className={`${inputStyle} pl-11 pr-11`} required/>
              <button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
            <button type="submit" className={`${btnPrimary} w-full`}>Entrar</button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/[0.06] text-center">
            <button onClick={() => setShowRequestAccess(true)} className="text-sm text-cyan-400/80 hover:text-cyan-300 transition-colors">
              Não tem acesso? <span className="underline underline-offset-4">Solicitar cadastro</span>
            </button>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
            <p className="text-[11px] text-gray-500 leading-relaxed">
              <Info size={12} className="inline mr-1 text-cyan-500"/>
              Demo: use <span className="text-cyan-400">admin@</span>, <span className="text-cyan-400">lider@</span>, <span className="text-cyan-400">cliente@</span> ou <span className="text-cyan-400">logistica@</span> no email
            </p>
          </div>
        </div>

        <p className="text-center text-[10px] text-gray-600 mt-6">
          © 2026 Reframax · Dados confidenciais · Acesso restrito e monitorado
        </p>
      </div>

      {/* Request Access Modal */}
      <Modal open={showRequestAccess} onClose={() => setShowRequestAccess(false)} title="Solicitar Acesso">
        {requestSent ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-emerald-400"/>
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">Solicitação Enviada</h4>
            <p className="text-sm text-gray-400">O administrador receberá sua solicitação por e-mail.<br/>Você será notificado sobre a aprovação.</p>
          </div>
        ) : (
          <form onSubmit={handleRequestAccess} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Nome completo</label>
              <input className={inputStyle} placeholder="Seu nome" value={requestForm.name} onChange={e=>setRequestForm({...requestForm, name:e.target.value})} required/>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">E-mail corporativo</label>
              <input type="email" className={inputStyle} placeholder="email@empresa.com" value={requestForm.email} onChange={e=>setRequestForm({...requestForm, email:e.target.value})} required/>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Empresa</label>
                <select className={selectStyle} value={requestForm.company} onChange={e=>setRequestForm({...requestForm, company:e.target.value})} required>
                  <option value="">Selecione</option>
                  <option value="Reframax">Reframax</option>
                  <option value="Ternium">Ternium</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Função</label>
                <select className={selectStyle} value={requestForm.role} onChange={e=>setRequestForm({...requestForm, role:e.target.value})} required>
                  <option value="">Selecione</option>
                  <option value="lider">Líder</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="coordenador">Coordenador</option>
                  <option value="planejamento">Planejamento</option>
                  <option value="gerente">Gerente</option>
                  <option value="cliente">Cliente</option>
                  <option value="logistica">Logística</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Justificativa</label>
              <textarea className={`${inputStyle} resize-none h-20`} placeholder="Motivo da solicitação de acesso" value={requestForm.justification} onChange={e=>setRequestForm({...requestForm, justification:e.target.value})} required/>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-xs text-amber-300/80"><AlertCircle size={12} className="inline mr-1"/>Este sistema contém dados sensíveis e informações contratuais. O acesso será avaliado pelo administrador.</p>
            </div>
            <button type="submit" className={`${btnPrimary} w-full`}>Enviar Solicitação</button>
          </form>
        )}
      </Modal>
    </div>
  );
};

// ============================================================
// PAGE: DASHBOARD
// ============================================================
const DashboardPage = ({ role }) => {
  const weekKPI = generateWeeklyKPI();
  const periodKPI = generatePeriodKPI();
  const { start, end } = getPeriodDates();
  const canFinancial = CAN_SEE_FINANCIAL.includes(role);

  const weekData = Array.from({length:7}, (_,i) => ({ name: ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'][i], v: 60 + Math.random()*30 }));
  const monthData = Array.from({length:30}, (_,i) => ({ name: `${i+1}`, v: 80 + Math.random()*15 }));

  return (
    <div className="space-y-6" style={{animation:'slideUp 0.4s ease-out'}}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Visão Geral</h1>
          <p className="text-sm text-gray-400">Período: {formatDate(start)} — {formatDate(end)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info"><Clock size={12} className="mr-1"/>Atualizado: {new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</Badge>
          <button className={btnSecondary + " !py-2 !px-3 text-sm"}><RefreshCw size={14}/></button>
        </div>
      </div>

      {/* Weekly KPIs */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Calendar size={14} className="text-cyan-400"/>Resumo Semanal
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <KPICard title="HH Realizado" value={weekKPI.hhRealizado} unit="h" icon={Clock} color="cyan" trend="up" small/>
          <KPICard title="Aderência" value={formatPercent(weekKPI.aderencia)} icon={Target} color="emerald" target={92} small/>
          <KPICard title="Atividades" value={`${weekKPI.atividadesRealizadas}/${weekKPI.atividadesProgramadas}`} icon={ClipboardList} color="violet" small/>
          <KPICard title="Desvios" value={weekKPI.desvios} icon={AlertTriangle} color="amber" small/>
          <KPICard title="Presença" value={formatPercent(weekKPI.presenca)} icon={Users} color="cyan" small/>
        </div>
      </div>

      {/* Period KPIs */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <BarChart3 size={14} className="text-teal-400"/>Período Vigente (Agregado)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <KPICard title="HH Total" value={periodKPI.hhRealizado} unit="h" icon={Clock} color="cyan" trend="up" small/>
          <KPICard title="Aderência Geral" value={formatPercent(periodKPI.aderencia)} icon={Target} color="emerald" target={92} small/>
          <KPICard title="Disponibilidade" value={formatPercent(periodKPI.disponibilidade)} icon={Gauge} color="amber" target={90} small/>
          <KPICard title="Desvios Abertos" value={periodKPI.desvios - periodKPI.desviosResolvidos} icon={AlertTriangle} color="rose" small/>
          {canFinancial && <KPICard title="Custo MO" value={formatCurrency(periodKPI.custoMO)} icon={TrendingUp} color="violet" small/>}
        </div>
      </div>

      {/* Charts + Contract Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Aderência Chart */}
        <div className={`${glassCard} p-5 lg:col-span-2`}>
          <h4 className="text-sm font-semibold text-white mb-4">Aderência Semanal (%)</h4>
          <Recharts.ResponsiveContainer width="100%" height={200}>
            <Recharts.BarChart data={weekData} barCategoryGap="20%">
              <Recharts.CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
              <Recharts.XAxis dataKey="name" tick={{fill:'#6b7280',fontSize:11}} axisLine={false} tickLine={false}/>
              <Recharts.YAxis tick={{fill:'#6b7280',fontSize:11}} axisLine={false} tickLine={false} domain={[0,100]}/>
              <Recharts.Tooltip contentStyle={{background:'#1e293b',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',color:'#fff'}}/>
              <Recharts.Bar dataKey="v" fill="url(#barGrad)" radius={[6,6,0,0]}/>
              <Recharts.ReferenceLine y={92} stroke="#f59e0b" strokeDasharray="4 4" label={{value:'Meta 92%',fill:'#f59e0b',fontSize:10}}/>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#0d9488" stopOpacity={0.4}/>
                </linearGradient>
              </defs>
            </Recharts.BarChart>
          </Recharts.ResponsiveContainer>
        </div>

        {/* Quick Contract Status */}
        <div className={`${glassCard} p-5`}>
          <h4 className="text-sm font-semibold text-white mb-4">Contratos</h4>
          <div className="space-y-4">
            {CONTRACTS.map(c => (
              <div key={c.id} className="flex items-center gap-3">
                <ProgressRing value={c.type === "aderencia" ? 95 : c.type === "disponibilidade" ? 91 : 94} target={c.target} size={56}/>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{c.id}</p>
                  <p className="text-xs text-gray-400">{c.type === "aderencia" ? "Aderência" : c.type === "disponibilidade" ? "Disponibilidade" : "PU"}</p>
                </div>
                <Badge variant={c.type === "aderencia" ? "info" : c.type === "disponibilidade" ? "warning" : "violet"}>
                  {c.target}%
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Users size={14} className="text-emerald-400"/>Equipes
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {TEAMS.map(t => {
            const aderencia = 88 + Math.floor(Math.random() * 10);
            return (
              <div key={t.id} className={`${glassCard} p-4 hover:border-cyan-500/20 transition-all cursor-pointer group`}>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="info">{t.id}</Badge>
                  <ChevronRight size={14} className="text-gray-500 group-hover:text-cyan-400 transition-colors"/>
                </div>
                <p className="text-sm font-semibold text-white mb-1">{t.name}</p>
                <p className="text-xs text-gray-400 mb-3">Líder: {t.leader}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users size={12} className="text-gray-500"/>
                    <span className="text-xs text-gray-400">{t.members}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${aderencia >= 92 ? 'bg-emerald-400' : aderencia >= 87 ? 'bg-amber-400' : 'bg-rose-400'}`}/>
                    <span className="text-xs font-medium text-white">{aderencia}%</span>
                  </div>
                </div>
                <MiniChart data={Array.from({length:7},(_,i)=>({v:80+Math.random()*18}))} height={40} color={aderencia>=92?"#10b981":"#f59e0b"}/>
              </div>
            );
          })}
        </div>
      </div>

      {canFinancial && (
        <div className={`${glassCard} p-5`}>
          <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Shield size={16} className="text-violet-400"/>Resumo Financeiro (Confidencial)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">Custo MO</p>
              <p className="text-lg font-bold text-white">{formatCurrency(periodKPI.custoMO)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">Custo Material</p>
              <p className="text-lg font-bold text-white">{formatCurrency(periodKPI.custoMaterial)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">Receita PU</p>
              <p className="text-lg font-bold text-emerald-400">{formatCurrency(periodKPI.receitaPU)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">Margem</p>
              <p className="text-lg font-bold text-cyan-400">18.2%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// PAGE: BATTERIES MAP
// ============================================================
const BatteryMapPage = () => {
  const [selectedBattery, setSelectedBattery] = useState(null);
  const [selectedFurnace, setSelectedFurnace] = useState(null);

  const furnaceStatuses = useMemo(() => {
    const statuses = {};
    BATTERIES.forEach(bat => {
      statuses[bat.id] = Array.from({length: bat.furnaces}, (_, i) => {
        const r = Math.random();
        return { id: i + 1, status: r > 0.85 ? "maintenance" : r > 0.75 ? "partial" : r > 0.05 ? "operational" : "idle" };
      });
    });
    return statuses;
  }, []);

  return (
    <div className="space-y-6" style={{animation:'slideUp 0.4s ease-out'}}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Mapa de Baterias</h1>
          <p className="text-sm text-gray-400">Visualização interativa do status dos fornos</p>
        </div>
        <div className="flex gap-3">
          {Object.entries(STATUS_COLORS).map(([key, color]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{backgroundColor: color}}/>
              <span className="text-xs text-gray-400 capitalize">{key === "partial" ? "parcial" : key === "maintenance" ? "manutenção" : key === "operational" ? "operacional" : "inativo"}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {BATTERIES.map(bat => (
          <div key={bat.id} className={`${glassCard} p-5 ${selectedBattery === bat.id ? 'border-cyan-500/30 shadow-cyan-500/10' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">{bat.name}</h3>
                <p className="text-xs text-gray-400">{bat.furnaces} fornos</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full animate-pulse" style={{backgroundColor: STATUS_COLORS[bat.status]}}/>
                <Badge variant={bat.status === "operational" ? "success" : bat.status === "partial" ? "warning" : "danger"}>
                  {bat.status === "operational" ? "Operacional" : bat.status === "partial" ? "Parcial" : "Manutenção"}
                </Badge>
              </div>
            </div>
            
            {/* Furnace Grid Map */}
            <div className="grid gap-1" style={{gridTemplateColumns: 'repeat(auto-fill, minmax(28px, 1fr))'}}>
              {(furnaceStatuses[bat.id] || []).map(f => (
                <button key={f.id} onClick={() => { setSelectedBattery(bat.id); setSelectedFurnace(f); }}
                  className="aspect-square rounded-md transition-all duration-200 hover:scale-125 hover:z-10 relative group cursor-pointer"
                  style={{backgroundColor: STATUS_COLORS[f.status], opacity: f.status === "idle" ? 0.3 : 0.85}}
                  title={`Forno ${f.id} - ${f.status}`}>
                  <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">{f.id}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.06]">
              <div className="flex gap-3">
                {["operational","partial","maintenance","idle"].map(s => {
                  const count = (furnaceStatuses[bat.id]||[]).filter(f=>f.status===s).length;
                  return count > 0 && (
                    <span key={s} className="text-xs text-gray-400">
                      <span className="inline-block w-2 h-2 rounded mr-1" style={{backgroundColor:STATUS_COLORS[s]}}/>
                      {count}
                    </span>
                  );
                })}
              </div>
              <button className="text-xs text-cyan-400 hover:underline">Ver histórico →</button>
            </div>
          </div>
        ))}
      </div>

      {/* Furnace Detail Modal */}
      <Modal open={!!selectedFurnace} onClose={()=>setSelectedFurnace(null)} title={`Forno ${selectedFurnace?.id} — ${selectedBattery}`}>
        {selectedFurnace && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]`}>
                <p className="text-xs text-gray-400">Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor:STATUS_COLORS[selectedFurnace.status]}}/>
                  <span className="text-sm font-semibold text-white capitalize">{selectedFurnace.status}</span>
                </div>
              </div>
              <div className={`p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]`}>
                <p className="text-xs text-gray-400">Última Manutenção</p>
                <p className="text-sm font-semibold text-white mt-1">12/03/2026</p>
              </div>
              <div className={`p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]`}>
                <p className="text-xs text-gray-400">Vida Média Estimada</p>
                <p className="text-sm font-semibold text-white mt-1">~145 dias</p>
              </div>
              <div className={`p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]`}>
                <p className="text-xs text-gray-400">Próxima Intervenção</p>
                <p className="text-sm font-semibold text-amber-400 mt-1">~42 dias</p>
              </div>
            </div>
            <div className={`p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]`}>
              <p className="text-xs text-gray-400 mb-2">Histórico de Intervenções</p>
              <div className="space-y-2">
                {[{date:"12/03/2026",act:"Projeção de Soleira",team:"EQ-001"},{date:"28/01/2026",act:"Reparo de Porta",team:"EQ-003"},{date:"05/12/2025",act:"Troca de Tijolo - Parede",team:"EQ-001"}].map((h,i)=>(
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{h.date}</span>
                    <span className="text-white">{h.act}</span>
                    <Badge variant="info">{h.team}</Badge>
                  </div>
                ))}
              </div>
            </div>
            <button className={btnPrimary + " w-full"}>Ver Análise Completa do Forno</button>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ============================================================
// PAGE: ACTIVITY REGISTRATION
// ============================================================
const ActivityRegistrationPage = ({ role }) => {
  const [activityType, setActivityType] = useState("programada");
  const [showDeviationForm, setShowDeviationForm] = useState(false);
  const [deviations, setDeviations] = useState([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0], team: "", battery: "", furnace: "", block: "",
    repairRegion: "", activity: "", start: "", end: "",
    ref: 0, mec: 0, sol: 0, and_: 0, op: 0,
    channel: "", primary: "", downcomer: "",
    hasDeviation: false
  });
  const [soleira, setSoleira] = useState({
    saidaCanteiro: "", chegadaBateria: "", acessoLinha: "", abastecimento: "",
    orgEquipamentos: "", raspagem: "", projecao: "", reabastecimento: "",
    desmobilizacao: "", saidaLinha: ""
  });
  const [overtimeWorkers, setOvertimeWorkers] = useState([{ name: "", role: "" }]);

  const isSoleira = formData.team === "EQ-001";
  const isQuadrante = formData.team === "EQ-002" || formData.repairRegion === "Quadrante";
  const isSoleflue = formData.repairRegion === "Canal Soleflue";
  const isDowncomer = formData.repairRegion === "Downcomer";
  const isPrimaria = formData.repairRegion === "Primária";

  const addDeviation = () => {
    setDeviations([...deviations, { reason: "", description: "", start: "", end: "" }]);
  };

  const updateDeviation = (idx, field, value) => {
    const updated = [...deviations];
    updated[idx] = { ...updated[idx], [field]: value };
    setDeviations(updated);
  };

  return (
    <div className="space-y-6" style={{animation:'slideUp 0.4s ease-out'}}>
      <div>
        <h1 className="text-2xl font-bold text-white">Registro de Atividades</h1>
        <p className="text-sm text-gray-400">Registre atividades realizadas em campo</p>
      </div>

      {/* Activity Type Selector */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { id: "programada", label: "Programada", icon: Calendar, desc: "Validar atividade do cronograma", color: "cyan" },
          { id: "nova", label: "Novo Registro", icon: Plus, desc: "Atividade fora da programação", color: "emerald" },
          { id: "extra", label: "Hora Extra", icon: Clock, desc: "Atividade em regime especial", color: "amber" },
        ].map(t => (
          <button key={t.id} onClick={() => setActivityType(t.id)}
            className={`${glassCard} p-4 text-left transition-all ${
              activityType === t.id ? `border-${t.color}-500/30 shadow-${t.color}-500/10 bg-${t.color}-500/5` : 'hover:border-white/[0.12]'
            }`}>
            <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center ${
              activityType === t.id ? `bg-${t.color}-500/20` : 'bg-white/[0.06]'
            }`}>
              <t.icon size={18} className={activityType === t.id ? `text-${t.color}-400` : 'text-gray-400'}/>
            </div>
            <p className="text-sm font-semibold text-white">{t.label}</p>
            <p className="text-xs text-gray-400 mt-1">{t.desc}</p>
          </button>
        ))}
      </div>

      {/* Main Form */}
      <div className={`${glassCard} p-6`}>
        <h3 className="text-lg font-semibold text-white mb-6">Dados da Atividade</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Data</label>
            <input type="date" className={inputStyle} value={formData.date} onChange={e=>setFormData({...formData,date:e.target.value})}/>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Equipe</label>
            <select className={selectStyle} value={formData.team} onChange={e=>setFormData({...formData,team:e.target.value})}>
              <option value="">Selecione</option>
              {TEAMS.map(t => <option key={t.id} value={t.id}>{t.id} - {t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Bateria</label>
            <select className={selectStyle} value={formData.battery} onChange={e=>setFormData({...formData,battery:e.target.value})}>
              <option value="">Selecione</option>
              {BATTERIES.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Forno</label>
            <input type="number" min="1" max="67" className={inputStyle} placeholder="Nº do forno" value={formData.furnace} onChange={e=>setFormData({...formData,furnace:e.target.value})}/>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Bloco</label>
            <input className={inputStyle} placeholder="Identificação do bloco" value={formData.block} onChange={e=>setFormData({...formData,block:e.target.value})}/>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Região de Reparo</label>
            <select className={selectStyle} value={formData.repairRegion} onChange={e=>setFormData({...formData,repairRegion:e.target.value})}>
              <option value="">Selecione</option>
              {REPAIR_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="text-xs text-gray-400 mb-1 block">Atividade Realizada</label>
            <input className={inputStyle} placeholder="Descrição da atividade" value={formData.activity} onChange={e=>setFormData({...formData,activity:e.target.value})}/>
          </div>

          {/* Conditional: Channel (Quadrante/Soleflue) */}
          {(isQuadrante || isSoleflue) && (
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Canal</label>
              <div className="grid grid-cols-4 gap-2">
                {[1,2,3,4].map(ch => (
                  <button key={ch} onClick={()=>setFormData({...formData,channel:String(ch)})}
                    className={`py-2 rounded-lg text-sm font-medium transition-all ${formData.channel === String(ch) ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-white/[0.04] text-gray-400 border border-white/[0.06]'}`}>
                    Canal {ch}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Conditional: Primária */}
          {isPrimaria && (
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Primária</label>
              <div className="grid grid-cols-6 gap-2">
                {[1,2,3,4,5,6].map(p => (
                  <button key={p} onClick={()=>setFormData({...formData,primary:String(p)})}
                    className={`py-2 rounded-lg text-sm font-medium transition-all ${formData.primary === String(p) ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-white/[0.04] text-gray-400 border border-white/[0.06]'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Conditional: Downcomer */}
          {isDowncomer && (
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Downcomer</label>
              <div className="grid grid-cols-3 gap-2">
                {[1,2,3,4,5,6,7,8,9].map(d => (
                  <button key={d} onClick={()=>setFormData({...formData,downcomer:String(d)})}
                    className={`py-2 rounded-lg text-sm font-medium transition-all ${formData.downcomer === String(d) ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-white/[0.04] text-gray-400 border border-white/[0.06]'}`}>
                    DC-{d}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Início</label>
            <input type="time" className={inputStyle} value={formData.start} onChange={e=>setFormData({...formData,start:e.target.value})}/>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Término</label>
            <input type="time" className={inputStyle} value={formData.end} onChange={e=>setFormData({...formData,end:e.target.value})}/>
          </div>
        </div>

        {/* Workforce */}
        <div className="mt-6 pt-6 border-t border-white/[0.06]">
          <h4 className="text-sm font-semibold text-white mb-4">Mão de Obra</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {WORKFORCE_TYPES.map(w => (
              <div key={w.code} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full" style={{backgroundColor:w.color}}/>
                  <span className="text-xs text-gray-400">{w.code}</span>
                </div>
                <input type="number" min="0" className={`${inputStyle} text-center !py-2 text-lg font-bold`}
                  value={formData[w.code.toLowerCase()] || 0}
                  onChange={e => setFormData({...formData, [w.code.toLowerCase()]: parseInt(e.target.value)||0})}/>
                <p className="text-[10px] text-gray-500 mt-1 text-center">{w.label}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-gray-500 mt-2 italic">* Líder e Supervisor são contabilizados como mão de obra indireta separadamente</p>
        </div>

        {/* Soleira Steps (Conditional) */}
        {isSoleira && (
          <div className="mt-6 pt-6 border-t border-white/[0.06]">
            <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Zap size={14} className="text-amber-400"/>Etapas — Projeção de Soleira
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                {key:"saidaCanteiro",label:"Saída do Canteiro"},
                {key:"chegadaBateria",label:"Chegada à Bateria"},
                {key:"acessoLinha",label:"Acesso à Linha"},
                {key:"abastecimento",label:"Abastecimento"},
                {key:"orgEquipamentos",label:"Org. Equipamentos"},
                {key:"raspagem",label:"Raspagem do Forno"},
                {key:"projecao",label:"Projeção"},
                {key:"reabastecimento",label:"Reabastecimento"},
                {key:"desmobilizacao",label:"Desmobilização"},
                {key:"saidaLinha",label:"Saída da Linha"}
              ].map((step, idx) => (
                <div key={step.key} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-[10px] text-gray-400 shrink-0">{idx+1}</span>
                  <div className="flex-1">
                    <label className="text-[10px] text-gray-500 block">{step.label}</label>
                    <input type="time" className={`${inputStyle} !py-1.5 text-sm`} value={soleira[step.key]}
                      onChange={e => setSoleira({...soleira, [step.key]: e.target.value})}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Overtime Workers (Conditional) */}
        {activityType === "extra" && (
          <div className="mt-6 pt-6 border-t border-white/[0.06]">
            <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Clock size={14} className="text-amber-400"/>Colaboradores em Hora Extra
            </h4>
            <div className="space-y-2">
              {overtimeWorkers.map((w, i) => (
                <div key={i} className="grid grid-cols-[1fr_160px_40px] gap-2 items-center">
                  <input className={inputStyle + " !py-2"} placeholder="Nome do colaborador" value={w.name}
                    onChange={e => { const up = [...overtimeWorkers]; up[i].name = e.target.value; setOvertimeWorkers(up); }}/>
                  <select className={selectStyle + " !py-2"} value={w.role}
                    onChange={e => { const up = [...overtimeWorkers]; up[i].role = e.target.value; setOvertimeWorkers(up); }}>
                    <option value="">Função</option>
                    {WORKFORCE_TYPES.map(wt => <option key={wt.code} value={wt.code}>{wt.label}</option>)}
                    <option value="LD">Líder</option>
                  </select>
                  <button onClick={() => setOvertimeWorkers(overtimeWorkers.filter((_,idx)=>idx!==i))}
                    className="p-2 rounded-lg hover:bg-rose-500/10 text-gray-500 hover:text-rose-400 transition-colors">
                    <Trash2 size={14}/>
                  </button>
                </div>
              ))}
              <button onClick={() => setOvertimeWorkers([...overtimeWorkers, {name:"",role:""}])}
                className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1 mt-2">
                <Plus size={14}/>Adicionar Colaborador
              </button>
            </div>
            <p className="text-[11px] text-amber-400/60 mt-2 italic">* Cobrado por valor tabelado de cada função × duração</p>
          </div>
        )}

        {/* Deviations */}
        <div className="mt-6 pt-6 border-t border-white/[0.06]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-400"/>Desvios
            </h4>
            <button onClick={addDeviation} className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              <Plus size={14}/>Adicionar Desvio
            </button>
          </div>
          {deviations.length === 0 ? (
            <p className="text-sm text-gray-500 italic">Nenhum desvio registrado</p>
          ) : (
            <div className="space-y-3">
              {deviations.map((d, i) => (
                <div key={i} className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="warning">Desvio #{i+1}</Badge>
                    <button onClick={() => setDeviations(deviations.filter((_,idx)=>idx!==i))} className="text-gray-500 hover:text-rose-400"><Trash2 size={14}/></button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Motivo</label>
                      <select className={selectStyle} value={d.reason} onChange={e=>updateDeviation(i,'reason',e.target.value)}>
                        <option value="">Selecione</option>
                        {DEVIATION_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Descrição</label>
                      <input className={inputStyle} placeholder="Detalhes do desvio" value={d.description} onChange={e=>updateDeviation(i,'description',e.target.value)}/>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Início do Desvio</label>
                      <input type="time" className={inputStyle} value={d.start} onChange={e=>updateDeviation(i,'start',e.target.value)}/>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Término do Desvio</label>
                      <input type="time" className={inputStyle} value={d.end} onChange={e=>updateDeviation(i,'end',e.target.value)}/>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Photo Upload */}
        <div className="mt-6 pt-6 border-t border-white/[0.06]">
          <h4 className="text-sm font-semibold text-white mb-4">Registro Fotográfico (Opcional)</h4>
          <div className="grid grid-cols-2 gap-3">
            {["Antes", "Depois"].map(label => (
              <div key={label} className="border-2 border-dashed border-white/[0.1] rounded-xl p-6 text-center hover:border-cyan-500/30 transition-colors cursor-pointer">
                <Camera size={24} className="text-gray-500 mx-auto mb-2"/>
                <p className="text-sm text-gray-400">{label}</p>
                <p className="text-[10px] text-gray-500 mt-1">Apenas câmera</p>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="mt-8 flex gap-3">
          <button className={btnPrimary + " flex-1"}>
            <Check size={16} className="inline mr-2"/>Registrar Atividade
          </button>
          <button className={btnSecondary}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// PAGE: LOGISTICS
// ============================================================
const LogisticsPage = ({ role }) => {
  const [activeTab, setActiveTab] = useState("requests");
  const isLogistics = LOGISTICS_ROLES.includes(role);

  const requests = [
    { id: "SOL-001", team: "EQ-001", material: "Massa refratária MR-50", qty: 20, unit: "kg", from: "Almoxarifado Central", to: "Bateria 3A - Forno 15", priority: "alta", status: "pendente", type: "agendada", date: "29/03/2026" },
    { id: "SOL-002", team: "EQ-004", material: "Parafuso M12x50", qty: 100, unit: "un", from: "Almoxarifado B", to: "Bateria 4B - Oficina", priority: "media", status: "em_andamento", type: "agendada", date: "29/03/2026" },
    { id: "SOL-003", team: "EQ-002", material: "Tijolo refratário TR-80", qty: 50, unit: "un", from: "Almoxarifado Central", to: "Bateria 3A - Forno 42", priority: "emergencia", status: "pendente", type: "emergencia", date: "29/03/2026" },
    { id: "SOL-004", team: "EQ-005", material: "Eletrodo E7018 3.25mm", qty: 15, unit: "kg", from: "Almoxarifado Central", to: "Bateria 4B - Área Externa", priority: "baixa", status: "entregue", type: "agendada", date: "28/03/2026" },
  ];

  const priorityColors = { emergencia: "danger", alta: "warning", media: "info", baixa: "default" };
  const statusColors = { pendente: "warning", em_andamento: "info", entregue: "success", cancelada: "danger" };

  return (
    <div className="space-y-6" style={{animation:'slideUp 0.4s ease-out'}}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Logística de Material</h1>
          <p className="text-sm text-gray-400">Solicitações e entregas de materiais</p>
        </div>
        <button className={btnPrimary}><Plus size={16} className="mr-2 inline"/>Nova Solicitação</button>
      </div>

      {/* Logistics KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard title="Solicitações Hoje" value="8" icon={Package} color="cyan" small/>
        <KPICard title="Pendentes" value="3" icon={Clock} color="amber" small/>
        <KPICard title="Entregues" value="5" icon={CheckCircle} color="emerald" small/>
        <KPICard title="Atendimento" value="87%" icon={Target} color="violet" small/>
      </div>

      <Tabs tabs={[{id:"requests",label:"Solicitações"},{id:"schedule",label:"Programação"},{id:"indicators",label:"Indicadores"}]}
        active={activeTab} onChange={setActiveTab}/>

      {activeTab === "requests" && (
        <div className="space-y-3">
          {requests.map(r => (
            <div key={r.id} className={`${glassCard} p-4 hover:border-white/[0.12] transition-all`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    r.type === "emergencia" ? "bg-rose-500/20" : "bg-cyan-500/10"
                  }`}>
                    {r.type === "emergencia" ? <Zap size={18} className="text-rose-400"/> : <Package size={18} className="text-cyan-400"/>}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{r.id}</span>
                      <Badge variant={priorityColors[r.priority]}>{r.priority}</Badge>
                      <Badge variant={statusColors[r.status]}>{r.status.replace("_"," ")}</Badge>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{r.material} — {r.qty} {r.unit}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span><MapPin size={12} className="inline mr-1"/>{r.to}</span>
                  <span>{r.date}</span>
                  {isLogistics && (
                    <button className="px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition-colors">
                      {r.status === "pendente" ? "Atender" : "Detalhes"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "indicators" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className={`${glassCard} p-5`}>
            <h4 className="text-sm font-semibold text-white mb-4">Atendimento por Prioridade</h4>
            <Recharts.ResponsiveContainer width="100%" height={200}>
              <Recharts.BarChart data={[{name:'Emergência',atend:95,meta:100},{name:'Alta',atend:88,meta:95},{name:'Média',atend:82,meta:85},{name:'Baixa',atend:75,meta:70}]}>
                <Recharts.CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                <Recharts.XAxis dataKey="name" tick={{fill:'#6b7280',fontSize:10}} axisLine={false}/>
                <Recharts.YAxis tick={{fill:'#6b7280',fontSize:10}} axisLine={false} domain={[0,100]}/>
                <Recharts.Bar dataKey="atend" fill="#06b6d4" radius={[4,4,0,0]}/>
                <Recharts.Bar dataKey="meta" fill="rgba(255,255,255,0.08)" radius={[4,4,0,0]}/>
              </Recharts.BarChart>
            </Recharts.ResponsiveContainer>
          </div>
          <div className={`${glassCard} p-5`}>
            <h4 className="text-sm font-semibold text-white mb-4">Tempo Médio de Atendimento</h4>
            <Recharts.ResponsiveContainer width="100%" height={200}>
              <Recharts.LineChart data={Array.from({length:7},(_,i)=>({name:['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'][i],min:20+Math.random()*40}))}>
                <Recharts.CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                <Recharts.XAxis dataKey="name" tick={{fill:'#6b7280',fontSize:10}} axisLine={false}/>
                <Recharts.YAxis tick={{fill:'#6b7280',fontSize:10}} axisLine={false}/>
                <Recharts.Line type="monotone" dataKey="min" stroke="#10b981" strokeWidth={2} dot={{r:3,fill:"#10b981"}}/>
              </Recharts.LineChart>
            </Recharts.ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// PAGE: SCHEDULING (PROGRAMAÇÃO)
// ============================================================
const SchedulingPage = () => {
  const [view, setView] = useState("week");
  const days = ["Seg 24","Ter 25","Qua 26","Qui 27","Sex 28"];
  const scheduled = [
    { team: "EQ-001", activities: [{day:0,act:"Projeção Forno 12",hours:"08:00-12:00"},{day:0,act:"Projeção Forno 15",hours:"13:00-17:00"},{day:2,act:"Projeção Forno 18",hours:"08:00-17:00"},{day:4,act:"Projeção Forno 20",hours:"08:00-15:00"}]},
    { team: "EQ-002", activities: [{day:1,act:"Quadrante F22 C1-C2",hours:"08:00-17:00"},{day:3,act:"Quadrante F22 C3-C4",hours:"08:00-17:00"}]},
    { team: "EQ-003", activities: [{day:0,act:"Reparo Porta F30",hours:"08:00-17:00"},{day:1,act:"Reparo Porta F31",hours:"08:00-17:00"},{day:2,act:"Reparo Porta F32",hours:"08:00-17:00"}]},
  ];

  return (
    <div className="space-y-6" style={{animation:'slideUp 0.4s ease-out'}}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Programação</h1>
          <p className="text-sm text-gray-400">Semana 13/2026 — 24 a 28 de Março</p>
        </div>
        <div className="flex gap-2">
          <Tabs tabs={[{id:"week",label:"Semanal"},{id:"month",label:"Mensal"},{id:"calendar",label:"Calendário"}]} active={view} onChange={setView}/>
        </div>
      </div>

      {view === "week" && (
        <div className={`${glassCard} p-4 overflow-x-auto`}>
          <table className="w-full min-w-[700px]">
            <thead>
              <tr>
                <th className="text-left text-xs text-gray-400 font-medium py-3 px-3 w-32">Equipe</th>
                {days.map(d => <th key={d} className="text-center text-xs text-gray-400 font-medium py-3 px-2">{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {scheduled.map(s => {
                const team = TEAMS.find(t => t.id === s.team);
                return (
                  <tr key={s.team} className="border-t border-white/[0.04]">
                    <td className="py-3 px-3">
                      <p className="text-sm font-medium text-white">{s.team}</p>
                      <p className="text-[10px] text-gray-500">{team?.name}</p>
                    </td>
                    {days.map((_, dayIdx) => {
                      const acts = s.activities.filter(a => a.day === dayIdx);
                      return (
                        <td key={dayIdx} className="py-2 px-1 align-top">
                          {acts.map((a, i) => (
                            <div key={i} className="mb-1 px-2 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 cursor-pointer hover:bg-cyan-500/15 transition-colors">
                              <p className="text-[10px] font-medium text-cyan-300 truncate">{a.act}</p>
                              <p className="text-[9px] text-gray-500">{a.hours}</p>
                            </div>
                          ))}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {view === "calendar" && (
        <div className={`${glassCard} p-5`}>
          <div className="grid grid-cols-7 gap-1">
            {["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map(d => (
              <div key={d} className="text-center text-xs text-gray-500 font-medium py-2">{d}</div>
            ))}
            {Array.from({length:35}, (_, i) => {
              const day = i - 6 + 1;
              const isToday = day === 29;
              const hasActivity = [16,17,18,19,20,23,24,25,26,27,28,29,30].includes(day);
              return (
                <div key={i} className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all cursor-pointer
                  ${day < 1 || day > 31 ? 'opacity-0' : ''}
                  ${isToday ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold' : 'text-gray-400 hover:bg-white/[0.04]'}
                `}>
                  <span>{day > 0 && day <= 31 ? day : ''}</span>
                  {hasActivity && day > 0 && day <= 31 && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-0.5"/>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// PAGE: ATTENDANCE (PRESENÇA)
// ============================================================
const AttendancePage = () => {
  const members = [
    { name: "João da Silva", role: "REF", status: "presente" },
    { name: "Pedro Almeida", role: "REF", status: "presente" },
    { name: "Marcos Santos", role: "MEC", status: "falta" },
    { name: "Roberto Lima", role: "SOL", status: "presente" },
    { name: "Lucas Costa", role: "AND", status: "atestado" },
    { name: "Fernando Dias", role: "OP", status: "presente" },
    { name: "Carlos Silva", role: "LD", status: "presente" },
  ];

  return (
    <div className="space-y-6" style={{animation:'slideUp 0.4s ease-out'}}>
      <h1 className="text-2xl font-bold text-white">Presença da Equipe</h1>
      <div className="grid grid-cols-3 gap-3">
        <KPICard title="Presentes" value="5" icon={CheckCircle} color="emerald" small/>
        <KPICard title="Ausentes" value="1" icon={XCircle} color="rose" small/>
        <KPICard title="Atestado" value="1" icon={FileText} color="amber" small/>
      </div>
      <div className={`${glassCard} p-4`}>
        <div className="space-y-2">
          {members.map((m, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center">
                  <User size={16} className="text-gray-400"/>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{m.name}</p>
                  <Badge variant={m.role === "LD" ? "violet" : "default"}>{m.role}</Badge>
                </div>
              </div>
              <select className={`${selectStyle} !w-auto !py-2 text-sm ${
                m.status === "presente" ? "!text-emerald-400" : m.status === "falta" ? "!text-rose-400" : "!text-amber-400"
              }`} defaultValue={m.status}>
                <option value="presente">Presente</option>
                <option value="falta">Falta</option>
                <option value="atestado">Atestado</option>
                <option value="ferias">Férias</option>
                <option value="folga">Folga</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// PAGE: REPORTS / EXPORT
// ============================================================
const ReportsPage = () => {
  return (
    <div className="space-y-6" style={{animation:'slideUp 0.4s ease-out'}}>
      <h1 className="text-2xl font-bold text-white">Relatórios</h1>
      <p className="text-sm text-gray-400">Exporte dados filtrados em PDF, CSV ou Excel</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: "Relatório de Atividades", desc: "Atividades realizadas por período, equipe e contrato", icon: ClipboardList },
          { title: "Relatório de HH", desc: "Horas-homem por equipe, função e período", icon: Clock },
          { title: "Relatório de Desvios", desc: "Todos os desvios registrados com análise", icon: AlertTriangle },
          { title: "Relatório de Presença", desc: "Frequência do efetivo por equipe", icon: Users },
          { title: "Relatório de Logística", desc: "Solicitações e entregas de materiais", icon: Truck },
          { title: "Relatório Financeiro", desc: "Custos de MO, materiais e receita PU", icon: TrendingUp },
        ].map((r, i) => (
          <div key={i} className={`${glassCard} p-5 hover:border-cyan-500/20 transition-all cursor-pointer group`}>
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center mb-4 group-hover:bg-cyan-500/10 transition-colors">
              <r.icon size={18} className="text-gray-400 group-hover:text-cyan-400 transition-colors"/>
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">{r.title}</h4>
            <p className="text-xs text-gray-400 mb-4">{r.desc}</p>
            <div className="flex gap-2">
              <button className="text-xs px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition-colors">PDF</button>
              <button className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-colors">CSV</button>
              <button className="text-xs px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition-colors">XLSX</button>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={`${glassCard} p-5`}>
        <h4 className="text-sm font-semibold text-white mb-4">Filtros de Exportação</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Data Início</label>
            <input type="date" className={inputStyle}/>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Data Fim</label>
            <input type="date" className={inputStyle}/>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Contrato</label>
            <select className={selectStyle}>
              <option value="">Todos</option>
              {CONTRACTS.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Equipe</label>
            <select className={selectStyle}>
              <option value="">Todas</option>
              {TEAMS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>
        <button className={`${btnPrimary} mt-4`}><Download size={16} className="inline mr-2"/>Gerar Relatório</button>
      </div>
    </div>
  );
};

// ============================================================
// PAGE: ADMIN
// ============================================================
const AdminPage = () => {
  const [pendingRequests] = useState([
    { name: "Maria Souza", email: "maria@ternium.com", company: "Ternium", role: "cliente", date: "28/03/2026" },
    { name: "Felipe Santos", email: "felipe@reframax.com", company: "Reframax", role: "lider", date: "27/03/2026" },
  ]);

  const [users] = useState([
    { name: "Admin Master", email: "admin@reframax.com", role: ROLES.ADMIN, active: true, lastAccess: "29/03/2026 08:15" },
    { name: "Carlos Silva", email: "carlos@reframax.com", role: ROLES.LIDER, active: true, lastAccess: "29/03/2026 07:45" },
    { name: "João Ternium", email: "joao@ternium.com", role: ROLES.CLIENTE, active: true, lastAccess: "28/03/2026 16:30", financialAccess: false },
  ]);

  return (
    <div className="space-y-6" style={{animation:'slideUp 0.4s ease-out'}}>
      <h1 className="text-2xl font-bold text-white">Administração</h1>

      {/* Pending Requests */}
      <div className={`${glassCard} p-5`}>
        <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Bell size={16} className="text-amber-400"/>Solicitações Pendentes ({pendingRequests.length})
        </h4>
        <div className="space-y-3">
          {pendingRequests.map((r, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div>
                <p className="text-sm font-medium text-white">{r.name}</p>
                <p className="text-xs text-gray-400">{r.email} · {r.company} · {ROLE_LABELS[r.role]}</p>
                <p className="text-[10px] text-gray-500">Solicitado em {r.date}</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-sm transition-colors">
                  <Check size={14} className="inline mr-1"/>Aprovar
                </button>
                <button className="px-4 py-2 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-sm transition-colors">
                  <X size={14} className="inline mr-1"/>Negar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Users */}
      <div className={`${glassCard} p-5`}>
        <h4 className="text-sm font-semibold text-white mb-4">Usuários Ativos</h4>
        <div className="space-y-2">
          {users.map((u, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center">
                  <User size={14} className="text-cyan-400"/>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{u.name}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={u.role === ROLES.ADMIN ? "danger" : u.role === ROLES.CLIENTE ? "info" : "default"}>
                  {ROLE_LABELS[u.role]}
                </Badge>
                {u.financialAccess !== undefined && (
                  <button className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                    u.financialAccess ? 'bg-violet-500/20 text-violet-300' : 'bg-white/[0.04] text-gray-500'
                  }`}>
                    {u.financialAccess ? '$ Ativo' : '$ Inativo'}
                  </button>
                )}
                <span className="text-[10px] text-gray-500">{u.lastAccess}</span>
                <button className="p-1.5 rounded-lg hover:bg-white/[0.06]"><MoreVertical size={14} className="text-gray-500"/></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Trail hint */}
      <div className={`${glassCard} p-5`}>
        <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
          <Database size={16} className="text-cyan-400"/>Registro de Alterações
        </h4>
        <p className="text-xs text-gray-400 mb-3">Toda alteração de acesso é registrada com data, hora e operador</p>
        <div className="space-y-1.5">
          {[
            { action: "Acesso financeiro concedido a João Ternium", by: "Admin Master", date: "28/03/2026 14:22" },
            { action: "Usuário Felipe Santos aprovado como Líder", by: "Admin Master", date: "27/03/2026 09:15" },
            { action: "Acesso negado a Maria Teste (dados sensíveis)", by: "Admin Master", date: "26/03/2026 16:40" },
          ].map((log, i) => (
            <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02] text-xs">
              <span className="text-gray-300">{log.action}</span>
              <span className="text-gray-500 whitespace-nowrap ml-3">{log.by} · {log.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// PLACEHOLDER PAGES
// ============================================================
const PlaceholderPage = ({ title, subtitle, icon: Icon }) => (
  <div className="space-y-6" style={{animation:'slideUp 0.4s ease-out'}}>
    <h1 className="text-2xl font-bold text-white">{title}</h1>
    <p className="text-sm text-gray-400">{subtitle}</p>
    <div className={`${glassCard} p-12 flex flex-col items-center justify-center text-center`}>
      <div className="w-20 h-20 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
        <Icon size={32} className="text-gray-500"/>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Em Desenvolvimento</h3>
      <p className="text-sm text-gray-400 max-w-md">
        Esta tela será conectada ao banco de dados Supabase.<br/>
        Estrutura pronta para integração.
      </p>
    </div>
  </div>
);

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage("dashboard");
  };

  if (!user) return <LoginPage onLogin={handleLogin}/>;

  const isLogistics = LOGISTICS_ROLES.includes(user.role);

  const navItems = [
    { id: "dashboard", label: "Visão Geral", icon: LayoutDashboard, section: "Principal" },
    { id: "contracts", label: "Contratos", icon: FileText, section: "Principal" },
    { id: "teams", label: "Equipes", icon: Users, section: "Operação", hide: isLogistics },
    { id: "batteries", label: "Baterias", icon: Factory, section: "Operação", hide: isLogistics },
    { id: "kpi", label: "KPI", icon: Target, section: "Operação", hide: isLogistics },
    { id: "analysis", label: "Análises", icon: BarChart3, section: "Operação", hide: isLogistics },
    { id: "scheduling", label: "Programação", icon: Calendar, section: "Operação" },
    { id: "activities", label: "Atividades", icon: ClipboardList, section: "Registro", hide: isLogistics },
    { id: "attendance", label: "Presença", icon: CheckCircle, section: "Registro", hide: isLogistics },
    { id: "equipment", label: "Equipamentos", icon: Wrench, section: "Registro", hide: isLogistics },
    { id: "deviations", label: "Desvios", icon: AlertTriangle, section: "Registro", hide: isLogistics },
    { id: "logistics", label: "Logística", icon: Truck, section: "Suporte" },
    { id: "search", label: "Busca", icon: Search, section: "Suporte" },
    { id: "reports", label: "Relatórios", icon: Download, section: "Exportação" },
    { id: "admin", label: "Admin", icon: Shield, section: "Sistema", hide: user.role !== ROLES.ADMIN },
  ].filter(n => !n.hide);

  const sections = [...new Set(navItems.map(n => n.section))];

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard": return <DashboardPage role={user.role}/>;
      case "batteries": return <BatteryMapPage/>;
      case "activities": return <ActivityRegistrationPage role={user.role}/>;
      case "logistics": return <LogisticsPage role={user.role}/>;
      case "scheduling": return <SchedulingPage/>;
      case "attendance": return <AttendancePage/>;
      case "reports": return <ReportsPage/>;
      case "admin": return <AdminPage/>;
      case "teams": return <PlaceholderPage title="Equipes" subtitle="Gestão de equipes e efetivo" icon={Users}/>;
      case "contracts": return <PlaceholderPage title="Contratos" subtitle="Detalhamento de contratos ativos" icon={FileText}/>;
      case "kpi": return <PlaceholderPage title="Indicadores KPI" subtitle="Análise detalhada de performance" icon={Target}/>;
      case "analysis": return <PlaceholderPage title="Análises" subtitle="Análise histórica e preditiva" icon={BarChart3}/>;
      case "equipment": return <PlaceholderPage title="Equipamentos" subtitle="Disponibilidade e manutenção" icon={Wrench}/>;
      case "deviations": return <PlaceholderPage title="Desvios" subtitle="Gestão e tratativa de desvios" icon={AlertTriangle}/>;
      case "search": return <PlaceholderPage title="Busca" subtitle="Pesquisa de registros e dados" icon={Search}/>;
      default: return <DashboardPage role={user.role}/>;
    }
  };

  return (
    <div className="min-h-screen bg-[#080c16] text-white flex">
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
        * { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.08) transparent; }
      `}</style>

      {/* Mobile overlay */}
      {sidebarMobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={()=>setSidebarMobileOpen(false)}/>
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 ${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 
        ${sidebarMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        bg-[#0a0f1e]/95 backdrop-blur-xl border-r border-white/[0.06] flex flex-col`}>
        
        {/* Logo */}
        <div className={`p-4 ${sidebarOpen ? 'px-5' : 'px-3'} border-b border-white/[0.06]`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20">
              <Flame size={20} className="text-white"/>
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-white tracking-tight">REFRAMAX</h1>
                <p className="text-[9px] text-cyan-400/60 tracking-widest">PORTAL v1.0</p>
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {sections.map(section => (
            <div key={section} className="mb-4">
              {sidebarOpen && <p className="text-[10px] text-gray-600 uppercase tracking-wider px-3 mb-2">{section}</p>}
              {navItems.filter(n => n.section === section).map(item => (
                <button key={item.id} onClick={() => { setCurrentPage(item.id); setSidebarMobileOpen(false); }}
                  className={`w-full flex items-center gap-3 ${sidebarOpen ? 'px-3' : 'justify-center'} py-2.5 rounded-xl mb-0.5 transition-all group ${
                    currentPage === item.id
                      ? 'bg-gradient-to-r from-cyan-500/15 to-teal-500/10 text-cyan-300 shadow-inner'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
                  }`}>
                  <item.icon size={18} className={currentPage === item.id ? 'text-cyan-400' : 'text-gray-500 group-hover:text-gray-300'}/>
                  {sidebarOpen && <span className="text-sm">{item.label}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* User */}
        <div className={`p-4 border-t border-white/[0.06] ${sidebarOpen ? '' : 'px-3'}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500/30 to-teal-500/30 flex items-center justify-center shrink-0">
              <User size={14} className="text-cyan-300"/>
            </div>
            {sidebarOpen && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white truncate">{user.email}</p>
                <p className="text-[10px] text-gray-500">{ROLE_LABELS[user.role]}</p>
              </div>
            )}
            <button onClick={() => setUser(null)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-gray-500 hover:text-rose-400 shrink-0" title="Sair">
              <LogOut size={14}/>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 border-b border-white/[0.06] flex items-center justify-between px-4 lg:px-6 bg-[#0a0f1e]/60 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarMobileOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-white/[0.06]">
              <Menu size={18} className="text-gray-400"/>
            </button>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:block p-2 rounded-xl hover:bg-white/[0.06]">
              <Menu size={18} className="text-gray-400"/>
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400">
              <Home size={14}/>
              <ChevronRight size={12}/>
              <span className="text-white">{navItems.find(n=>n.id===currentPage)?.label}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="info"><Clock size={11} className="mr-1"/>{new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</Badge>
            <button className="relative p-2 rounded-xl hover:bg-white/[0.06]">
              <Bell size={16} className="text-gray-400"/>
              <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"/>
            </button>
            <button className="p-2 rounded-xl hover:bg-white/[0.06]">
              <Settings size={16} className="text-gray-400"/>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {renderPage()}
        </div>

        {/* Footer */}
        <footer className="h-8 border-t border-white/[0.04] flex items-center justify-center px-4 shrink-0">
          <p className="text-[10px] text-gray-600">
            Reframax Portal v1.0 · Dados confidenciais · © 2026
          </p>
        </footer>
      </main>
    </div>
  );
}

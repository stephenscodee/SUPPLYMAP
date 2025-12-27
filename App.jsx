import React, { useState, useEffect } from "react";
import {
  Shield,
  LayoutDashboard,
  Truck,
  Activity,
  AlertTriangle,
  Search,
  Plus,
  ChevronRight,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const API_BASE = "http://localhost:8000";

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [suppliers, setSuppliers] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulationResult, setSimulationResult] = useState(null);
  const [simulatingSupplier, setSimulatingSupplier] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const runSimulation = async (supplierId) => {
    try {
      setLoading(true);
      const supplier = suppliers.find(s => s.id === supplierId);
      setSimulatingSupplier(supplier);
      const res = await axios.get(`${API_BASE}/analysis/impact/${supplierId}`);
      setSimulationResult(res.data);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch initial data
    const fetchData = async () => {
      try {
        const [sRes, pRes] = await Promise.all([
          axios.get(`${API_BASE}/suppliers`),
          axios.get(`${API_BASE}/processes`),
        ]);
        setSuppliers(sRes.data);
        setProcesses(pRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1e293b] border-r border-slate-800 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-sky-500 p-2 rounded-lg">
            <Shield size={24} className="text-slate-900" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">SinglePoint</h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            active={activeTab === "dashboard"}
            onClick={() => setActiveTab("dashboard")}
          />
          <NavItem
            icon={<Truck size={20} />}
            label="Suppliers"
            active={activeTab === "suppliers"}
            onClick={() => setActiveTab("suppliers")}
          />
          <NavItem
            icon={<Activity size={20} />}
            label="Processes"
            active={activeTab === "processes"}
            onClick={() => setActiveTab("processes")}
          />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="glass-card p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs">
              JD
            </div>
            <div>
              <p className="text-sm font-semibold">John Doe</p>
              <p className="text-xs text-slate-400">Operations Manager</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <header className="sticky top-0 z-10 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800 px-8 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white capitalize">
            {activeTab}
          </h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                size={18}
              />
              <input
                type="text"
                placeholder="Search..."
                className="bg-slate-900 border border-slate-700 rounded-full pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:border-sky-500 transition-colors w-64"
              />
            </div>
            <button className="btn btn-primary">
              <Plus size={18} />
              New Entity
            </button>
          </div>
        </header>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <DashboardView suppliers={suppliers} processes={processes} />
              </motion.div>
            )}
            {activeTab === "suppliers" && (
              <motion.div
                key="suppliers"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <InventoryView type="suppliers" data={suppliers} onSimulate={runSimulation} />
              </motion.div>
            )}
            {activeTab === "processes" && (
              <motion.div
                key="processes"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <InventoryView type="processes" data={processes} onSimulate={runSimulation} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Simulation Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-[#1e293b] border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-rose-500/10">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="text-rose-500" size={24} />
                    <div>
                      <h3 className="text-xl font-bold text-white">Failure Simulation</h3>
                      <p className="text-sm text-slate-400">Modeling impact for: <span className="text-rose-400 font-bold">{simulatingSupplier?.name}</span></p>
                    </div>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-2">✕</button>
                </div>
                
                <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Affected Internal Processes ({simulationResult?.affected_processes.length})</h4>
                    <div className="grid gap-4">
                      {simulationResult?.affected_processes.length === 0 ? (
                        <p className="text-slate-500 italic">No direct process impact detected.</p>
                      ) : (
                        simulationResult?.affected_processes.map(p => (
                          <div key={p.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                            <div>
                              <p className="font-bold">{p.name}</p>
                              <p className="text-xs text-slate-400">Owner: {p.owner}</p>
                            </div>
                            <span className={`status-badge status-${p.impact}`}>{p.impact}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {simulationResult?.affected_suppliers.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Affected Downstream Suppliers ({simulationResult?.affected_suppliers.length})</h4>
                      <div className="grid gap-3">
                        {simulationResult?.affected_suppliers.map(s => (
                          <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800 border-l-2 border-l-sky-500">
                            <p className="font-medium">{s.name}</p>
                            <span className="text-xs text-sky-400">Cascading Risk</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-rose-500/5 rounded-xl p-6 border border-rose-500/20">
                    <h4 className="text-rose-400 font-bold mb-2 flex items-center gap-2">
                       <Shield size={18} />
                       Critical Recovery Actions
                    </h4>
                    <ul className="text-sm text-slate-300 space-y-2 list-disc list-inside">
                      <li>Immediately activate Plan B for {simulationResult?.affected_processes[0]?.name || 'impacted systems'}.</li>
                      <li>Notify {simulationResult?.affected_processes[0]?.owner || 'process owners'} of potential downtime.</li>
                      <li>Switch traffic to alternative region if available.</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-end gap-3">
                  <button onClick={() => setIsModalOpen(false)} className="btn bg-slate-800 text-white hover:bg-slate-700">Close</button>
                  <button className="btn btn-primary">Export Impact Report</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
        active
          ? "bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-lg shadow-sky-500/5"
          : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
      }`}
    >
      {icon}
      <span>{label}</span>
      {active && (
        <motion.div
          layoutId="activeNav"
          className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400"
        />
      )}
    </button>
  );
}

function DashboardView({ suppliers, processes }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-4 gap-6">
        <StatCard
          title="Total Suppliers"
          value={suppliers.length}
          icon={<Truck size={24} />}
          color="sky"
        />
        <StatCard
          title="Active Processes"
          value={processes.length}
          icon={<Activity size={24} />}
          color="indigo"
        />
        <StatCard
          title="Critical Risks"
          value="3"
          icon={<AlertTriangle size={24} />}
          color="rose"
          trend="High Alert"
        />
        <StatCard
          title="Plan B Coverage"
          value="65%"
          icon={<Shield size={24} />}
          color="emerald"
          trend="+5% MoM"
        />
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="glass-card">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="text-rose-500" size={18} />
            Highest Risk Suppliers
          </h3>
          <div className="space-y-4">
            {suppliers.slice(0, 3).map((s) => (
              <RiskItem
                key={s.id}
                name={s.name}
                impact={s.criticality > 4 ? "Critical" : "High"}
                score={s.criticality * 20 - Math.floor(Math.random() * 5)}
                onClick={() => runSimulation(s.id)}
              />
            ))}
          </div>
        </div>
        <div className="glass-card">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Info className="text-sky-400" size={18} />
            Operational Continuity Gaps
          </h3>
          <p className="text-slate-400 text-sm mb-4">
            The following processes lack a verified Plan B for their primary
            dependencies.
          </p>
          <div className="space-y-3">
            {["Order Fulfillment", "Cloud Hosting", "Payment Gateway"].map(
              (p) => (
                <div
                  key={p}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800"
                >
                  <span className="font-medium">{p}</span>
                  <span className="text-xs font-bold text-rose-400 uppercase">
                    No Plan B
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, trend }) {
  const colors = {
    sky: "from-sky-500/20 to-sky-500/5 text-sky-400",
    indigo: "from-indigo-500/20 to-indigo-500/5 text-indigo-400",
    rose: "from-rose-500/20 to-rose-500/5 text-rose-400",
    emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-400",
  };

  return (
    <div
      className={`glass-card p-6 border-l-4 ${
        color === "rose" ? "border-l-rose-500" : "border-l-slate-800"
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${colors[color]}`}>
          {icon}
        </div>
        {trend && (
          <span
            className={`text-xs font-bold px-2 py-1 rounded-full bg-slate-800 ${
              color === "rose" ? "text-rose-400" : "text-emerald-400"
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
      </div>
    </div>
  );
}

function RiskItem({ name, impact, score, onClick }) {
  return (
    <div className="flex items-center justify-between group cursor-pointer" onClick={onClick}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-slate-500">
          {name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold group-hover:text-sky-400 transition-colors">
            {name}
          </p>
          <p className="text-xs text-slate-500">
            Impact: <span className="text-rose-400">{impact}</span>
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-xl">{score}%</p>
        <div className="w-20 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
          <div className="h-full bg-rose-500" style={{ width: `${score}%` }} />
        </div>
      </div>
    </div>
  );
}

function InventoryView({ type, data, onSimulate }) {
  return (
    <div className="space-y-6">
      <div className="glass-card overflow-hidden !p-0">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/50 border-b border-slate-800">
              <th className="px-6 py-4 font-semibold text-slate-400 text-sm">
                Name
              </th>
              <th className="px-6 py-4 font-semibold text-slate-400 text-sm">
                {type === "suppliers" ? "Criticality" : "Impact Score"}
              </th>
              <th className="px-6 py-4 font-semibold text-slate-400 text-sm">
                {type === "suppliers" ? "Location" : "Owner"}
              </th>
              <th className="px-6 py-4 font-semibold text-slate-400 text-sm">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-12 text-center text-slate-500"
                >
                  <div className="flex flex-col items-center gap-4">
                    <Truck size={48} className="opacity-20" />
                    <p>No {type} found. Start by adding your first one.</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-slate-500 truncate max-w-[200px]">
                      {item.notes || "No description provided"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <div
                          key={star}
                          className={`w-3 h-3 rounded-full ${
                            star <= (item.criticality || item.impact_score)
                              ? "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.4)]"
                              : "bg-slate-700"
                          }`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {item.location || item.owner || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       {type === 'suppliers' && (
                         <button 
                           onClick={() => onSimulate(item.id)}
                           className="p-2 hover:bg-rose-500/20 rounded-lg transition-colors text-slate-400 hover:text-rose-400"
                           title="Simulate Failure"
                         >
                           <AlertTriangle size={18} />
                         </button>
                       )}
                       <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white">
                         <ChevronRight size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;

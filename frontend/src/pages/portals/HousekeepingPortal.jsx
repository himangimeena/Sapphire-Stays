import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Sparkles, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export default function HousekeepingPortal() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All Tasks');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = () => {
    axios.get('http://localhost:5000/api/operations/housekeeping')
      .then(res => {
        setTasks(res.data.tasks || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleToggleStatus = async (task) => {
    const nextStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await axios.patch(`http://localhost:5000/api/operations/housekeeping/${task.id}`, {
        status: nextStatus,
        roomId: task.room_id
      });
      fetchTasks();
    } catch (err) {
      alert('Failed to update task status');
    }
  };

  if (loading) return <div className="py-24 text-center font-serif text-xl">Loading Housekeeping Board...</div>;

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in space-y-10">
      {/* Top Bar matching Screenshot 1 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
        <h1 className="font-serif text-4xl font-bold">Maintenance & Housekeeping</h1>
        <div className="flex items-center gap-4">
          <button className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
          </button>
          <div className="text-right">
            <span className="font-bold text-sm text-[#0F3D6E] dark:text-amber-300 block">Shift: Morning</span>
            <span className="text-xs text-gray-400">08:00 AM - 04:00 PM</span>
          </div>
        </div>
      </div>

      {/* KPI Status Boxes matching Screenshot 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-1">
          <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">PENDING</span>
          <span className="font-serif text-4xl font-bold block">12</span>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-1">
          <span className="text-xs uppercase font-bold text-amber-500 tracking-wider">IN PROGRESS</span>
          <span className="font-serif text-4xl font-bold block text-amber-600 dark:text-amber-400">04</span>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-1">
          <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">COMPLETED</span>
          <span className="font-serif text-4xl font-bold block text-gray-400">28</span>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-red-200 dark:border-red-900/50 space-y-1 bg-red-50/20">
          <span className="text-xs uppercase font-bold text-red-600 tracking-wider">URGENT</span>
          <span className="font-serif text-4xl font-bold block text-red-600">02</span>
        </div>
      </div>

      {/* Category Pills matching Screenshot 1 */}
      <div className="flex flex-wrap gap-2">
        {['All Tasks', 'Housekeeping', 'Technical Repairs', 'VIP Turn-down', 'Laundry Pickups'].map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold transition ${
              filter === c ? 'bg-[#08203E] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Task Cards Grid matching Screenshot 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tasks.map(t => (
          <div
            key={t.id}
            className={`glass-card rounded-2xl overflow-hidden border transition flex flex-col justify-between ${
              t.priority === 'VIP' ? 'bg-[#08203E] text-white border-[#D4AF37]/50 shadow-2xl' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#132135]'
            }`}
          >
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  t.priority === 'VIP' ? 'bg-[#D4AF37] text-[#08203E]' :
                  t.priority === 'URGENT' ? 'bg-red-500/20 text-red-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-600'
                }`}>
                  {t.priority === 'VIP' ? 'VIP ARRIVAL' : t.task_type}
                </span>
                <span className="font-serif font-bold text-sm">Room {t.room_number}</span>
              </div>

              {t.priority === 'VIP' ? (
                <div className="space-y-3">
                  <h4 className="font-serif text-xl font-bold text-amber-300">Welcome Setup</h4>
                  <p className="text-xs text-gray-300 leading-relaxed">{t.notes}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="h-32 rounded-xl overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80" alt="Suite" className="w-full h-full object-cover" />
                  </div>
                  <h4 className="font-serif text-lg font-bold">{t.task_type}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{t.notes}</p>
                </div>
              )}
            </div>

            <div className={`p-4 border-t flex items-center justify-between ${t.priority === 'VIP' ? 'border-white/10 bg-white/5' : 'border-gray-100 dark:border-gray-800'}`}>
              <span className={`text-xs font-semibold ${t.status === 'COMPLETED' ? 'text-emerald-500' : 'text-gray-400'}`}>
                {t.status === 'COMPLETED' ? 'Mark Completed' : 'Mark Cleaned'}
              </span>
              <button
                onClick={() => handleToggleStatus(t)}
                className={`w-12 h-6 rounded-full transition flex items-center p-1 ${
                  t.status === 'COMPLETED' ? 'bg-[#0F3D6E] justify-end' : 'bg-gray-300 dark:bg-gray-700 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

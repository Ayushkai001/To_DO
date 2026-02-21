import React, { useState, useMemo } from 'react';
import {
  Bell,
  BellOff,
  CheckCircle2,
  Circle,
  Plus,
  BookOpen,
  Clock,
  Zap,
  Trash2,
  Calendar,
  Sun,
  Moon,
  Layers,
  Search,
  Star,
  MessageSquare,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const INTERVALS = [1, 3, 7, 14, 21, 30, 60]; // Days

const DEFAULT_SUBJECTS = [];

const DEFAULT_TOPICS = [];

const App = () => {
  // Load from LocalStorage or use defaults
  const [subjects, setSubjects] = useState(() => {
    const saved = localStorage.getItem('antigravity_subjects');
    return saved ? JSON.parse(saved) : DEFAULT_SUBJECTS;
  });

  const [topics, setTopics] = useState(() => {
    const saved = localStorage.getItem('antigravity_topics');
    return saved ? JSON.parse(saved) : DEFAULT_TOPICS;
  });

  const [theme, setTheme] = useState(() => localStorage.getItem('antigravity_theme') || 'light');
  const [activeSubject, setActiveSubject] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'today'
  const [searchQuery, setSearchQuery] = useState('');
  const [isDND, setIsDND] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState([]);

  // Theme Effect (DND overrides theme)
  React.useEffect(() => {
    const root = window.document.documentElement;
    console.log('Theme state:', { theme, isDND, willBeDark: isDND || theme === 'dark' });
    if (isDND || theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('antigravity_theme', theme);
  }, [theme, isDND]);

  // Persistence Effect
  React.useEffect(() => {
    localStorage.setItem('antigravity_subjects', JSON.stringify(subjects));
    localStorage.setItem('antigravity_topics', JSON.stringify(topics));
  }, [subjects, topics]);

  // Auto-Reset Due Topics Effect
  React.useEffect(() => {
    const now = new Date();
    setTopics(currentTopics =>
      currentTopics.map(t => {
        // If it's due (or past due) and marked completed, uncheck it so it's "todo" again
        if (new Date(t.nextReview) <= now && t.completed) {
          return { ...t, completed: false };
        }
        return t;
      })
    );
  }, []); // Run once on mount

  // --- Logic Functions ---

  const addSubject = () => {
    if (!newSubjectName.trim()) return;
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500'];
    const newSub = {
      id: Date.now().toString(),
      name: newSubjectName,
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    setSubjects([...subjects, newSub]);
    setNewSubjectName('');
    setShowAddSubject(false);
  };

  const addTopic = (subjectId) => {
    if (!newTopicTitle.trim()) return;
    const newTopic = {
      id: Date.now().toString(),
      subjectId,
      title: newTopicTitle,
      completed: false,
      isPriority: false,
      notes: "",
      lastReviewed: new Date().toISOString(),
      intervalStep: 0,
      nextReview: new Date(Date.now() + 86400000).toISOString() // Default 1 day
    };
    setTopics([newTopic, ...topics]);
    setNewTopicTitle('');
  };

  const updateTopicNotes = (id, notes) => {
    setTopics(topics.map(t => t.id === id ? { ...t, notes } : t));
  };

  const toggleExpand = (id) => {
    setExpandedTopics(prev =>
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  const toggleTopic = (id) => {
    setTopics(topics.map(t => {
      if (t.id === id) {
        const isNowCompleted = !t.completed;
        const isActuallyDue = new Date(t.nextReview) <= new Date();

        // Celebration! 🎉
        if (isNowCompleted && isActuallyDue && window.confetti) {
          window.confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#6366f1', '#a855f7', '#ec4899']
          });
        }

        const nextStep = t.completed ? Math.max(0, t.intervalStep - 1) : t.intervalStep + 1;
        const daysToAdd = nextStep === 0 ? 0 : INTERVALS[Math.min(nextStep - 1, INTERVALS.length - 1)];

        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + daysToAdd);

        return {
          ...t,
          completed: isNowCompleted,
          intervalStep: nextStep,
          nextReview: nextDate.toISOString()
        };
      }
      return t;
    }));
  };

  const deleteTopic = (id) => {
    setTopics(topics.filter(t => t.id !== id));
  };

  const togglePriority = (id) => {
    setTopics(topics.map(t =>
      t.id === id ? { ...t, isPriority: !t.isPriority } : t
    ));
  };

  const deleteSubject = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this subject and all its topics?')) {
      setSubjects(subjects.filter(s => s.id !== id));
      setTopics(topics.filter(t => t.subjectId !== id)); // Cascade delete topics
      if (activeSubject?.id === id) setActiveSubject(null);
    }
  };

  // --- Derived State ---
  const dueTodayCount = useMemo(() => {
    return topics.filter(t => new Date(t.nextReview) <= new Date() && !t.completed).length;
  }, [topics]);

  const filteredTopics = useMemo(() => {
    let result = topics;

    if (filter === 'today') {
      result = topics.filter(t => new Date(t.nextReview) <= new Date() && !t.completed);
    } else if (activeSubject) {
      result = topics.filter(t => t.subjectId === activeSubject.id);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.notes?.toLowerCase().includes(q)
      );
    }

    // Sort priority to the top
    return [...result].sort((a, b) => (b.isPriority ? 1 : 0) - (a.isPriority ? 1 : 0));
  }, [topics, activeSubject, filter, searchQuery]);

  // --- Styles helper ---
  const isDark = theme === 'dark' || isDND;

  const glassCard = isDark
    ? 'bg-slate-900/40 border-white/10 hover:bg-slate-900/60 backdrop-blur-md transition-all duration-300'
    : 'bg-white/70 border-white/80 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:bg-white/80 hover:border-white transition-all duration-300';

  const textPrimary = isDark ? 'text-white' : 'text-[#1d1d1f]';
  const textSecondary = isDark ? 'text-slate-400' : 'text-[#86868b]';

  return (
    <div className={`min-h-screen transition-all duration-700 relative overflow-hidden ${isDark ? 'bg-[#020617] text-white' : 'bg-slate-50 text-[#1d1d1f]'}`}>
      {/* Background Aura Blobs - These make the glassmorphism visible */}
      {!isDND && (
        <>
          <div className={`fixed -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full blur-[120px] transition-opacity duration-1000 ${isDark ? 'bg-indigo-500/10 opacity-50' : 'bg-indigo-500/10 opacity-100'}`} />
          <div className={`fixed -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full blur-[120px] transition-opacity duration-1000 ${isDark ? 'bg-purple-500/10 opacity-50' : 'bg-purple-500/10 opacity-100'}`} />
          {!isDark && (
            <div className="fixed top-[20%] right-[10%] w-[30%] h-[30%] bg-amber-500/5 rounded-full blur-[100px] opacity-100" />
          )}
        </>
      )}

      {/* Navigation Header - Glassmorphism */}
      <header className={`sticky top-0 z-30 border-b backdrop-blur-md transition-all duration-500 ${isDark ? 'bg-slate-950/40 border-white/5' : 'bg-white/40 border-white/40'}`}>
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-0 w-10 h-10 rounded-xl overflow-hidden ${isDND ? 'opacity-30' : ''}`}>
              <img src="/logo.svg" alt="To Do Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className={`font-semibold tracking-tight text-lg leading-none font-['Outfit'] ${textPrimary}`}>
                To...DO!!🧘🏻‍♀️
              </h1>
              <p className={`text-[10px] font-medium leading-none mt-1 ${textSecondary}`}>
                Made with love by Ayush K
              </p>
            </div>
          </div>
          <div className="flex-1 max-w-sm mx-4 hidden sm:block">
            <div className="relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <Search size={16} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics or notes..."
                className={`w-full pl-10 pr-4 py-2 rounded-2xl text-sm transition-all outline-none border ${isDark
                  ? 'bg-white/5 border-white/5 focus:bg-white/10 focus:border-indigo-500/50 text-white placeholder-slate-500'
                  : 'bg-slate-100 border-slate-200 focus:bg-white focus:border-indigo-500 focus:shadow-lg focus:shadow-indigo-500/10 text-slate-900 placeholder-slate-400'}`}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!isDND && dueTodayCount > 0 && (
              <button
                onClick={() => { setFilter('today'); setActiveSubject(null); }}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-full text-xs font-semibold backdrop-blur-md hover:bg-amber-500/20 transition-colors cursor-pointer"
              >
                <Clock size={12} />
                {dueTodayCount} reviews due
              </button>
            )}

            <button
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              className={`p-2 rounded-full transition-all ${isDND ? 'opacity-0 pointer-events-none' : 'hover:bg-white/10 text-slate-400 hover:text-white'}`}
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              onClick={() => setIsDND(!isDND)}
              className={`p-2.5 rounded-full transition-all duration-500 ${isDND ? 'bg-indigo-500/20 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.3)]' : 'bg-white/50 text-slate-500 hover:bg-white/80 shadow-sm dark:bg-white/5 dark:text-slate-400'}`}
              title={isDND ? "Disable DND" : "Enable DND"}
            >
              {isDND ? <BellOff size={18} /> : <Bell size={18} />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-8 grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Sidebar: Subjects */}
        <aside className={`md:col-span-1 space-y-6 transition-opacity duration-500 ${isDND ? 'opacity-30 hover:opacity-100' : 'opacity-100'}`}>
          <div>
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className={`text-[10px] font-bold uppercase tracking-widest ${textSecondary}`}>Subjects</h2>
              {!isDND && (
                <button
                  onClick={() => setShowAddSubject(true)}
                  className="text-indigo-500 hover:text-indigo-600 transition-colors p-1 hover:bg-indigo-500/10 rounded"
                >
                  <Plus size={16} />
                </button>
              )}
            </div>

            <div className="space-y-1">
              <button
                onClick={() => { setFilter('today'); setActiveSubject(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left border backdrop-blur-md text-sm ${filter === 'today'
                  ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400 font-semibold'
                  : 'border-transparent text-slate-500 hover:bg-white/60 dark:hover:bg-white/5'}`}
              >
                <Clock size={16} />
                <span className="flex-1">Today's Review</span>
                {dueTodayCount > 0 && (
                  <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {dueTodayCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => { setFilter('all'); setActiveSubject(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left border backdrop-blur-md text-sm ${filter === 'all' && !activeSubject
                  ? 'bg-white border-slate-200 shadow-sm text-indigo-600 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400 font-semibold'
                  : 'border-transparent text-slate-500 hover:bg-white/60 dark:hover:bg-white/5'}`}
              >
                <Layers size={16} />
                <span className="">All Topics</span>
              </button>

              {subjects.map(sub => (
                <div key={sub.id} className="relative group/subject">
                  <button
                    onClick={() => { setFilter('all'); setActiveSubject(sub); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left border backdrop-blur-md text-sm ${activeSubject?.id === sub.id
                      ? 'bg-white border-slate-200 shadow-sm text-slate-900 dark:bg-white/10 dark:border-white/10 dark:text-white'
                      : 'border-transparent text-slate-500 hover:bg-white/60 dark:hover:bg-white/5'}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${sub.color} shadow-[0_0_10px_currentColor]`} />
                    <span className="font-semibold flex-1 truncate font-['Outfit']">
                      {sub.name}
                    </span>
                  </button>
                  {!isDND && (
                    <button
                      onClick={(e) => deleteSubject(sub.id, e)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg opacity-0 group-hover/subject:opacity-100 transition-all z-10"
                      title="Delete Subject"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {showAddSubject && (
              <div className="mt-4 p-1 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                <input
                  autoFocus
                  className="w-full text-sm p-3 bg-transparent border-b border-slate-100 dark:border-white/10 focus:outline-none placeholder-slate-400 text-slate-900 dark:text-slate-200"
                  placeholder="Subject name..."
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSubject()}
                />
                <div className="flex justify-end gap-1 p-2">
                  <button onClick={() => setShowAddSubject(false)} className="text-xs px-3 py-1.5 rounded-lg hover:bg-white/10 text-slate-500">Cancel</button>
                  <button onClick={addSubject} className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg shadow-lg shadow-indigo-500/20">Add</button>
                </div>
              </div>
            )}
          </div>

          {/* Spaced Repetition Stats - Refined Glass Dashboard */}
          {!isDND && (
            <div className={`p-6 rounded-3xl backdrop-blur-md transition-all duration-500 overflow-hidden relative group/stats border-2 ${isDark
              ? 'bg-slate-900/40 border-white/10 shadow-2xl'
              : 'bg-white/70 border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.06)]'}`}>

              {/* Subtle Background Glow for Light Mode */}
              {!isDark && (
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/5 blur-3xl rounded-full" />
              )}

              <h3 className={`text-xs font-bold mb-6 flex items-center justify-between uppercase tracking-[0.15em] font-['Outfit'] ${textSecondary}`}>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-indigo-500" />
                  Mastery Progress
                </div>
                <span className="text-[10px] bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full font-semibold">
                  {topics.length} Total
                </span>
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {/* Step 0: Today */}
                <div className="group cursor-default">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[11px] font-bold font-['Outfit'] ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>TODAY</span>
                    <span className={`text-[11px] font-bold font-['Outfit'] ${isDark ? 'text-slate-500' : 'text-slate-700'}`}>
                      {topics.filter(t => t.intervalStep === 0).length}
                    </span>
                  </div>
                  <div className={`h-2 w-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'} rounded-full overflow-hidden p-[2px]`}>
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                      style={{ width: `${(topics.filter(t => t.intervalStep === 0).length / (topics.length || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Steps 1+: Intervals */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-4 pt-2 border-t border-slate-100 dark:border-white/5">
                  {INTERVALS.map((days, idx) => {
                    const count = topics.filter(t => t.intervalStep === idx + 1).length;
                    const percentage = (count / (topics.length || 1)) * 100;
                    return (
                      <div key={idx} className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold font-['Outfit'] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{days}D</span>
                          <span className={`text-[10px] font-bold font-['Outfit'] ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>{count}</span>
                        </div>
                        <div className={`h-1.5 w-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'} rounded-full overflow-hidden`}>
                          <div
                            className="h-full bg-indigo-500 transition-all duration-1000 ease-out"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content: Topics */}
        <section className="md:col-span-3 space-y-8">
          <div className="flex items-end justify-between pb-4 border-b border-white/10 dark:border-white/10">
            <div>
              <h2 className={`text-4xl font-semibold tracking-tight font-['Outfit'] ${textPrimary}`}>
                {filter === 'today' ? "Today's Focus" : activeSubject ? activeSubject.name : 'Your Universe'}
              </h2>
              <p className={`mt-2 font-medium ${textSecondary}`}>
                {filter === 'today'
                  ? 'Tasks scheduled for spaced repetition review today'
                  : activeSubject
                    ? `Focusing on ${activeSubject.name} modules`
                    : 'Everything you are currently mastering'}
              </p>
            </div>
          </div>

          {/* Quick Add Topic - Floating Glass */}
          {!isDND && activeSubject && (
            <div className="relative group">
              <input
                type="text"
                className="w-full pl-14 pr-4 py-5 bg-white border-slate-200 shadow-sm focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 dark:bg-slate-800/40 backdrop-blur-xl border border-white/30 dark:border-white/5 rounded-2xl focus:outline-none transition-all placeholder:text-slate-400 text-slate-900 dark:text-slate-100 placeholder:font-light"
                placeholder={`Add a new concept to ${activeSubject.name}...`}
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTopic(activeSubject.id)}
              />
              <Plus className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
          )}

          {/* Topic List */}
          <div className="space-y-4">
            {filteredTopics.length === 0 ? (
              <div className="text-center py-20 rounded-3xl border border-dashed border-slate-300/30 dark:border-slate-700/30">
                <div className={`text-center ${textSecondary}`}>
                  <div className="w-16 h-16 mx-auto mb-4 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-500">
                    <BookOpen size={24} />
                  </div>
                  <p className="font-medium">No topics here yet.</p>
                  <p className="text-sm mt-1 opacity-70">Add a subject and your first topic to start the cycle.</p>
                </div>
              </div>
            ) : (
              filteredTopics.map(topic => {
                const isDue = new Date(topic.nextReview) <= new Date();
                const sub = subjects.find(s => s.id === topic.subjectId);

                return (
                  <div
                    key={topic.id}
                    className={`group relative flex flex-col p-0 rounded-2xl border backdrop-blur-md transition-all duration-300 overflow-hidden ${glassCard} ${topic.isPriority ? 'ring-2 ring-amber-500/30' : ''}`}
                  >
                    {/* Status Indicator Bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 transition-colors ${topic.completed ? 'bg-emerald-500/50' : isDue ? 'bg-amber-500/80 shadow-[0_0_10px_orange]' : 'bg-slate-300/30'}`} />

                    <div className="flex items-start gap-5 p-5">
                      <button
                        onClick={() => toggleTopic(topic.id)}
                        className={`mt-1 transition-all duration-300 transform active:scale-95 ${topic.completed ? 'text-emerald-500' : 'text-slate-300 hover:text-indigo-400 dark:text-white/20 hover:dark:text-indigo-400'}`}
                      >
                        {topic.completed ? <CheckCircle2 size={26} className="fill-emerald-500/10" /> : <Circle size={26} strokeWidth={1.5} />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                          {!activeSubject && (
                            <span className={`text-[9px] uppercase font-bold tracking-[0.1em] px-2 py-0.5 rounded-md border ${isDark ? 'bg-white/5 border-white/10 text-slate-400 font-["Outfit"]' : 'bg-slate-100 border-slate-200 text-slate-600 font-["Outfit"]'}`}>
                              {sub?.name || 'Uncategorized'}
                            </span>
                          )}
                          <span className={`text-[9px] uppercase font-bold tracking-[0.1em] px-2 py-0.5 rounded-md border flex items-center gap-1 font-["Outfit"] ${topic.intervalStep === 0
                            ? (isDark ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-600')
                            : (isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600')
                            }`}>
                            Level {topic.intervalStep}
                          </span>
                          {isDue && !topic.completed && !isDND && (
                            <span className="text-[9px] uppercase font-black text-amber-600 dark:text-amber-400 flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 animate-pulse font-['Outfit']">
                              <Zap size={10} fill="currentColor" /> Ready for Review
                            </span>
                          )}
                        </div>
                        <h3 className={`font-semibold text-lg leading-snug transition-all font-['Outfit'] ${topic.completed ? 'line-through text-slate-400/50 decoration-slate-400/30' : textPrimary}`}>
                          {topic.title}
                        </h3>
                        {!isDND && (
                          <div className={`flex items-center gap-4 mt-2.5 text-[11px] font-bold font-['Outfit'] ${textSecondary}`}>
                            <span className={`flex items-center gap-1.5 transition-colors ${isDue && !topic.completed ? 'text-amber-600 dark:text-amber-400' : ''}`}>
                              <Clock size={12} strokeWidth={3} />
                              {isDue && !topic.completed ? 'Review Now' : `Next: ${new Date(topic.nextReview).toLocaleDateString()}`}
                            </span>
                            <span className="flex items-center gap-1.5 opacity-60">
                              <Zap size={12} strokeWidth={3} />
                              Cycle: {INTERVALS[Math.min(topic.intervalStep, INTERVALS.length - 1)]}d
                            </span>
                          </div>
                        )}
                      </div>

                      {!isDND && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => togglePriority(topic.id)}
                            className={`p-2 rounded-xl transition-all ${topic.isPriority ? 'text-amber-500 bg-amber-500/10' : 'text-slate-300 hover:text-amber-500 hover:bg-amber-500/5'}`}
                            title="Mark as Priority"
                          >
                            <Star size={18} fill={topic.isPriority ? "currentColor" : "none"} strokeWidth={2} />
                          </button>
                          <button
                            onClick={() => toggleExpand(topic.id)}
                            className={`p-2 rounded-xl transition-all ${expandedTopics.includes(topic.id) ? 'text-indigo-500 bg-indigo-500/10' : 'text-slate-300 hover:text-indigo-500 hover:bg-indigo-500/5'}`}
                            title="Add Notes"
                          >
                            <MessageSquare size={18} strokeWidth={2} />
                          </button>
                          <button
                            onClick={() => deleteTopic(topic.id)}
                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-500/5 rounded-xl transition-all"
                            title="Delete"
                          >
                            <Trash2 size={18} strokeWidth={2} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Expandable Notes Area */}
                    {expandedTopics.includes(topic.id) && (
                      <div className="px-5 pb-5 animate-in slide-in-from-top-2 duration-300">
                        <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                          <label className={`text-[10px] font-bold uppercase tracking-widest font-['Outfit'] mb-2 block ${textSecondary}`}>
                            Concept Notes
                          </label>
                          <textarea
                            autoFocus
                            className={`w-full p-4 rounded-xl text-sm transition-all outline-none border resize-none h-32 ${isDark
                              ? 'bg-slate-900/50 border-white/5 text-slate-100 placeholder-slate-600 focus:border-indigo-500/50'
                              : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500/50'}`}
                            placeholder="Add key definitions, examples, or reminders..."
                            value={topic.notes || ''}
                            onChange={(e) => updateTopicNotes(topic.id, e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>

      {/* DND Overlay Indicator - Floating Glass */}
      {
        isDND && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 bg-slate-600/80 backdrop-blur-2xl border border-white/10 text-indigo-300 rounded-full text-sm font-semibold shadow-2xl flex items-center gap-3 animate-bounce z-50">
            <BellOff size={16} className="fill-indigo-500/20" />
            <span className="tracking-wide">Zero-Gravity Mode Active</span>
          </div>
        )
      }
    </div >
  );
};

export default App;

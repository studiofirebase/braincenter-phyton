import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Square,
  Copy,
  Check,
  Terminal,
  Settings,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Calendar,
  Layers,
  FileCode,
  Download,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { MIGRATION_PHASES, SPRINT_STEPS } from '../data/initialData';
import { MONOREPO_FILES } from '../data/monorepoFiles';

export const MigrationWizardView: React.FC<{
  onOpenFileInExplorer: (filePath: string) => void;
}> = ({ onOpenFileInExplorer }) => {
  const [activeSubTab, setActiveSubTab] = useState<'sprint' | 'playbook'>('sprint');

  // Customization variables
  const [domainName, setDomainName] = useState('cerebrocentral.com');
  const [databaseName, setDatabaseName] = useState('cerebrocentral');
  const [bucketName, setBucketName] = useState('cerebrocentral');
  const [accountId, setAccountId] = useState('your-cloudflare-account-id');

  // Checkbox completion persisted in localStorage
  const [completedSprintSteps, setCompletedSprintSteps] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('cerebrocentral_sprint_steps');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('cerebrocentral_migration_tasks');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [expandedSprintPhases, setExpandedSprintPhases] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: false,
    6: false,
    7: false
  });

  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
    8: false
  });

  const [copiedCommandId, setCopiedCommandId] = useState<string | null>(null);
  const [copiedAllBundle, setCopiedAllBundle] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('cerebrocentral_sprint_steps', JSON.stringify(completedSprintSteps));
    } catch (e) {
      // ignore
    }
  }, [completedSprintSteps]);

  useEffect(() => {
    try {
      localStorage.setItem('cerebrocentral_migration_tasks', JSON.stringify(completedTasks));
    } catch (e) {
      // ignore
    }
  }, [completedTasks]);

  const toggleSprintStep = (stepId: string) => {
    setCompletedSprintSteps((prev) => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const toggleSprintPhase = (phaseId: number) => {
    setExpandedSprintPhases((prev) => ({
      ...prev,
      [phaseId]: !prev[phaseId]
    }));
  };

  const togglePhase = (phaseId: number) => {
    setExpandedPhases((prev) => ({
      ...prev,
      [phaseId]: !prev[phaseId]
    }));
  };

  // Metrics
  const finishedSprintSteps = Object.values(completedSprintSteps).filter(Boolean).length;
  const sprintProgress = Math.round((finishedSprintSteps / SPRINT_STEPS.length) * 100);

  const totalTasks = MIGRATION_PHASES.reduce((acc, p) => acc + p.tasks.length, 0);
  const finishedTasks = Object.values(completedTasks).filter(Boolean).length;
  const progressPercent = Math.round((finishedTasks / totalTasks) * 100);

  const getCustomizedCommand = (cmd?: string) => {
    if (!cmd) return '';
    return cmd
      .replace(/cerebrocentral\.com/g, domainName)
      .replace(/cerebrocentral/g, databaseName)
      .replace(/your-d1-id/g, `d1_${databaseName}`)
      .replace(/your-cloudflare-account-id/g, accountId);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommandId(id);
    setTimeout(() => setCopiedCommandId(null), 2000);
  };

  const handleCopyAllFilesBundle = () => {
    const bundleText = MONOREPO_FILES.filter((f) => f.fileNumber)
      .map(
        (f) => `### Arquivo ${f.fileNumber}: \`${f.path}\`\n\n\`\`\`${f.language}\n${f.content}\n\`\`\`\n`
      )
      .join('\n---\n\n');

    navigator.clipboard.writeText(bundleText);
    setCopiedAllBundle(true);
    setTimeout(() => setCopiedAllBundle(false), 2500);
  };

  // Group sprint steps by phase
  const sprintPhases = [
    { id: 1, name: 'FASE 1: SETUP BASE', duration: '1 dia (Passos 1 a 4)' },
    { id: 2, name: 'FASE 2: AUTENTICAÇÃO', duration: '2 dias (Passos 5 a 8)' },
    { id: 3, name: 'FASE 3: CORE FEATURES', duration: '5 dias (Passos 9 a 13)' },
    { id: 4, name: 'FASE 4: BANCO DE DADOS D1', duration: '3 dias (Passos 14 a 17)' },
    { id: 5, name: 'FASE 5: DEPLOY CLOUDFLARE', duration: '2 dias (Passos 18 a 21)' },
    { id: 6, name: 'FASE 6: FEATURES EXTRAS', duration: '5 dias (Passos 22 a 26)' },
    { id: 7, name: 'FASE 7: POLISHING & SEGURANÇA', duration: '3 dias (Passos 27 a 30)' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white">Cerebrocentral Migration & Sprint Engine</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
              15 Arquivos Base · 30 Passos
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Planejamento completo com timeline de 2 a 3 semanas para 1 desenvolvedor ou 1 a 2 semanas com 2-3 devs.
          </p>
        </div>

        {/* Global Action: Export All 15 Files */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopyAllFilesBundle}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors"
          >
            {copiedAllBundle ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">15 Arquivos Copiados!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar 15 Arquivos Base</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Subtabs Switcher */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('sprint')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
              activeSubTab === 'sprint'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Roadmap de 30 Passos (Timeline 2-3 Semanas)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('playbook')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
              activeSubTab === 'playbook'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Guia Técnico em 8 Fases</span>
          </button>
        </div>

        {/* Progress Display */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-mono">
            {activeSubTab === 'sprint'
              ? `${finishedSprintSteps} / ${SPRINT_STEPS.length} Concluídos (${sprintProgress}%)`
              : `${finishedTasks} / ${totalTasks} Tarefas (${progressPercent}%)`}
          </span>
          <div className="w-20 h-2 bg-slate-950 border border-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-300"
              style={{
                width: `${activeSubTab === 'sprint' ? sprintProgress : progressPercent}%`
              }}
            />
          </div>
        </div>
      </div>

      {/* Dynamic Command Parameter Customizer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
          <Settings className="w-4 h-4 text-orange-400" />
          <span>Parâmetros de Interpolação para Comandos CLI</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Domínio da Zona</label>
            <input
              type="text"
              value={domainName}
              onChange={(e) => setDomainName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Nome do Banco D1</label>
            <input
              type="text"
              value={databaseName}
              onChange={(e) => setDatabaseName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Bucket R2</label>
            <input
              type="text"
              value={bucketName}
              onChange={(e) => setBucketName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Account ID</label>
            <input
              type="text"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono"
            />
          </div>
        </div>
      </div>

      {/* TAB 1: 30-STEP SPRINT ROADMAP */}
      {activeSubTab === 'sprint' && (
        <div className="space-y-4">
          {sprintPhases.map((phase) => {
            const stepsInPhase = SPRINT_STEPS.filter((s) => s.phaseId === phase.id);
            const isExpanded = expandedSprintPhases[phase.id];
            const stepsCompletedInPhase = stepsInPhase.filter(
              (s) => completedSprintSteps[s.id]
            ).length;
            const isPhaseDone = stepsCompletedInPhase === stepsInPhase.length;

            return (
              <div
                key={phase.id}
                className={`bg-slate-900 border rounded-xl overflow-hidden transition-colors ${
                  isPhaseDone
                    ? 'border-emerald-800/60'
                    : isExpanded
                    ? 'border-orange-500/60'
                    : 'border-slate-800'
                }`}
              >
                {/* Phase Header */}
                <button
                  onClick={() => toggleSprintPhase(phase.id)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 bg-slate-950/40 hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-mono font-bold ${
                        isPhaseDone
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      0{phase.id}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-white">{phase.name}</h3>
                        <span className="text-[11px] font-mono text-orange-400 bg-orange-950/40 border border-orange-800/40 px-2 py-0.5 rounded">
                          {phase.duration}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {stepsInPhase.length} entregas mapeadas
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono text-slate-400 tabular-nums">
                      {stepsCompletedInPhase} / {stepsInPhase.length}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Steps List */}
                {isExpanded && (
                  <div className="p-4 border-t border-slate-800/80 space-y-3 bg-slate-900/60">
                    {stepsInPhase.map((step) => {
                      const isDone = !!completedSprintSteps[step.id];
                      const customizedCmd = getCustomizedCommand(step.command);

                      return (
                        <div
                          key={step.id}
                          className={`p-3.5 rounded-lg border transition-colors ${
                            isDone
                              ? 'bg-slate-950/40 border-emerald-900/40 text-slate-300'
                              : 'bg-slate-950 border-slate-800 text-slate-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <button
                              onClick={() => toggleSprintStep(step.id)}
                              className="flex items-start gap-2.5 text-left group"
                            >
                              <span className="mt-0.5 text-slate-500 group-hover:text-orange-400 transition-colors">
                                {isDone ? (
                                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <Square className="w-4 h-4" />
                                )}
                              </span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400">
                                    Passo {step.stepNumber}
                                  </span>
                                  <span
                                    className={`text-xs font-semibold ${
                                      isDone ? 'line-through text-slate-400' : 'text-slate-100'
                                    }`}
                                  >
                                    {step.title}
                                  </span>
                                </div>

                                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                                  {step.description}
                                </p>

                                <div className="mt-2 flex items-center gap-2 text-[11px] text-emerald-400/90 font-mono">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Entregável: {step.deliverable}</span>
                                </div>
                              </div>
                            </button>

                            {step.filePath && (
                              <button
                                onClick={() => onOpenFileInExplorer(step.filePath!)}
                                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-orange-400 text-[11px] font-mono border border-slate-700 shrink-0 transition-colors"
                              >
                                Ver Arquivo
                              </button>
                            )}
                          </div>

                          {/* Shell Command Block */}
                          {step.command && (
                            <div className="mt-3 relative group">
                              <pre className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-xs text-orange-300 overflow-x-auto whitespace-pre">
                                {customizedCmd}
                              </pre>
                              <button
                                onClick={() => handleCopy(customizedCmd, step.id)}
                                className="absolute top-2 right-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
                                title="Copiar comando"
                              >
                                {copiedCommandId === step.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: 8-PHASE MIGRATION PLAYBOOK */}
      {activeSubTab === 'playbook' && (
        <div className="space-y-4">
          {MIGRATION_PHASES.map((phase) => {
            const isExpanded = expandedPhases[phase.id];
            const phaseTasksCompleted = phase.tasks.filter((t) => completedTasks[t.id]).length;
            const isPhaseFullyDone = phaseTasksCompleted === phase.tasks.length;

            return (
              <div
                key={phase.id}
                className={`bg-slate-900 border rounded-xl overflow-hidden transition-colors ${
                  isPhaseFullyDone
                    ? 'border-emerald-800/60'
                    : isExpanded
                    ? 'border-orange-500/60'
                    : 'border-slate-800'
                }`}
              >
                {/* Phase Header */}
                <button
                  onClick={() => togglePhase(phase.id)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 bg-slate-950/40 hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono font-bold ${
                        isPhaseFullyDone
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      0{phase.id}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{phase.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-1">{phase.summary}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono text-slate-400 tabular-nums">
                      {phaseTasksCompleted} / {phase.tasks.length}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Phase Body */}
                {isExpanded && (
                  <div className="p-4 border-t border-slate-800/80 space-y-3 bg-slate-900/60">
                    {phase.tasks.map((task) => {
                      const isDone = !!completedTasks[task.id];
                      const customizedCmd = getCustomizedCommand(task.command);

                      return (
                        <div
                          key={task.id}
                          className={`p-3.5 rounded-lg border transition-colors ${
                            isDone
                              ? 'bg-slate-950/40 border-emerald-900/40 text-slate-300'
                              : 'bg-slate-950 border-slate-800 text-slate-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <button
                              onClick={() => toggleTask(task.id)}
                              className="flex items-start gap-2.5 text-left group"
                            >
                              <span className="mt-0.5 text-slate-500 group-hover:text-orange-400 transition-colors">
                                {isDone ? (
                                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <Square className="w-4 h-4" />
                                )}
                              </span>
                              <div>
                                <div
                                  className={`text-xs font-semibold ${
                                    isDone ? 'line-through text-slate-400' : 'text-slate-100'
                                  }`}
                                >
                                  {task.title}
                                </div>
                                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                                  {task.description}
                                </p>
                              </div>
                            </button>

                            {task.filePath && (
                              <button
                                onClick={() => onOpenFileInExplorer(task.filePath!)}
                                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-orange-400 text-[11px] font-mono border border-slate-700 shrink-0 transition-colors"
                              >
                                Ver Arquivo
                              </button>
                            )}
                          </div>

                          {/* Shell Command Block */}
                          {task.command && (
                            <div className="mt-3 relative group">
                              <pre className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-xs text-orange-300 overflow-x-auto whitespace-pre">
                                {customizedCmd}
                              </pre>
                              <button
                                onClick={() => handleCopy(customizedCmd, task.id)}
                                className="absolute top-2 right-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
                                title="Copiar comando"
                              >
                                {copiedCommandId === task.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

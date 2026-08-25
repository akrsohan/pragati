import React, { useState } from 'react';
import { Skill, RoadmapStep, SkillResource, Field } from '../types';
import { 
  Plus, 
  Trash2, 
  FileText, 
  Youtube, 
  FolderOpen, 
  Github, 
  Globe, 
  ExternalLink, 
  Database, 
  BookOpen, 
  Layers, 
  RotateCcw,
  Sparkles,
  ChevronDown,
  Upload,
  Link2,
  PlayCircle,
  Video,
  GraduationCap
} from 'lucide-react';

export function resolveResourceFormat(r: { format?: string; url?: string; title?: string; type?: string }): 'pdf' | 'drive' | 'youtube' | 'github' | 'article' | 'link' {
  if (r.format === 'pdf' || r.format === 'drive' || r.format === 'youtube' || r.format === 'github' || r.format === 'article') {
    return r.format;
  }
  const u = (r.url || '').toLowerCase();
  const t = (r.title || '').toLowerCase();
  
  if (u.includes('.pdf') || u.includes('/storage/v1/object/public/')) {
    return 'pdf';
  }
  if (u.includes('drive.google.com') || u.includes('docs.google.com')) {
    return 'drive';
  }
  if (
    u.includes('youtube.com') || 
    u.includes('youtu.be') || 
    u.includes('vimeo.com') || 
    u.includes('loom.com') ||
    t.includes('class') ||
    t.includes('tutorial') ||
    t.includes('lecture') ||
    t.includes('video') ||
    t.includes('playlist')
  ) {
    return 'youtube';
  }
  if (u.includes('github.com') || u.includes('gitlab.com')) {
    return 'github';
  }
  if (u.includes('medium.com') || u.includes('dev.to') || u.includes('hashnode.dev') || u.includes('blog.')) {
    return 'article';
  }
  return 'link';
}

interface AdminRoadmapSectionProps {
  skills: Skill[];
  fields: Field[];
  selectedSkillId: string;
  onSelectSkillId: (skillId: string) => void;
  roadmapSteps: Record<string, RoadmapStep[]>;
  skillResources: Record<string, SkillResource[]>;
  onOpenAddStep: () => void;
  onOpenAddResource: () => void;
  onDeleteStep: (skillId: string, stepId: string) => void;
  onDeleteResource: (resourceId: string, skillId: string) => void;
}

export const AdminRoadmapSection: React.FC<AdminRoadmapSectionProps> = ({
  skills,
  fields,
  selectedSkillId,
  onSelectSkillId,
  roadmapSteps,
  skillResources,
  onOpenAddStep,
  onOpenAddResource,
  onDeleteStep,
  onDeleteResource
}) => {
  const [resourceFilter, setResourceFilter] = useState<'all' | 'documents' | 'references'>('all');

  const currentSkill = skills.find(s => s.id === selectedSkillId) || skills[0] || {
    id: '',
    name: 'No Skill Available',
    description: 'Please add skills from the admin panel.',
    icon: '⚡',
    bg_color: '#6c5ce7',
    difficulty: 'Beginner',
    field_id: ''
  };
  const currentSteps = roadmapSteps[currentSkill?.id || ''] || [];
  const currentResources = skillResources[currentSkill?.id || ''] || [];

  const docs = currentResources.filter(r => {
    const fmt = resolveResourceFormat(r);
    return fmt === 'pdf' || fmt === 'drive' || r.type === 'document';
  });
  const refs = currentResources.filter(r => {
    const fmt = resolveResourceFormat(r);
    return fmt !== 'pdf' && fmt !== 'drive' && r.type !== 'document';
  });

  const displayedResources = 
    resourceFilter === 'documents' ? docs :
    resourceFilter === 'references' ? refs :
    currentResources;

  const getFormatBadge = (r: SkillResource) => {
    const fmt = resolveResourceFormat(r);
    switch (fmt) {
      case 'pdf':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold px-2.5 py-1 rounded-md bg-rose-50 text-rose-600 border border-rose-200">
            <FileText className="w-3.5 h-3.5 text-rose-500" />
            PDF Material
          </span>
        );
      case 'drive':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
            <FolderOpen className="w-3.5 h-3.5 text-amber-600" />
            Google Drive Notes
          </span>
        );
      case 'youtube':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold px-2.5 py-1 rounded-md bg-red-50 text-red-600 border border-red-200 shadow-2xs animate-pulse">
            <Youtube className="w-3.5 h-3.5 fill-current text-red-600 shrink-0" />
            <span>Video Class / Lecture</span>
          </span>
        );
      case 'github':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-300">
            <Github className="w-3.5 h-3.5" />
            GitHub Repo
          </span>
        );
      case 'article':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
            <BookOpen className="w-3.5 h-3.5" />
            Article / Blog
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold px-2.5 py-1 rounded-md bg-purple-50 text-[#6c5ce7] border border-purple-200">
            <Globe className="w-3.5 h-3.5" />
            Official Documentation
          </span>
        );
    }
  };

  const getActionLabel = (r: SkillResource) => {
    const fmt = resolveResourceFormat(r);
    switch (fmt) {
      case 'pdf':
        return 'Open PDF File';
      case 'drive':
        return 'Open Drive Folder';
      case 'youtube':
        return 'Watch Video Class';
      case 'github':
        return 'View Repository';
      case 'article':
        return 'Read Article';
      default:
        return 'Open Reference';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Skill Selector & Action Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Skill Selector with styled dropdown and info pill */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">
              Skill Track:
            </span>
            
            <div className="relative min-w-[220px] sm:min-w-[260px]">
              <select 
                className="w-full appearance-none bg-slate-50 hover:bg-slate-100/80 border border-slate-300 hover:border-slate-400 focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/20 rounded-xl py-2.5 pl-3.5 pr-10 text-xs sm:text-sm font-bold text-slate-800 transition-all cursor-pointer outline-none"
                value={selectedSkillId}
                onChange={(e) => onSelectSkillId(e.target.value)}
              >
                {skills.map(s => {
                  const parent = fields.find(f => f.id === s.field_id);
                  return (
                    <option key={s.id} value={s.id}>
                      {s.name} ({parent?.name || 'General'})
                    </option>
                  );
                })}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            {currentSkill && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50/70 border border-purple-100 rounded-xl">
                <span 
                  className="w-6 h-6 rounded-lg text-white font-bold flex items-center justify-center text-xs shadow-2xs"
                  style={{ background: currentSkill.bg_color || '#6c5ce7' }}
                >
                  {currentSkill.icon}
                </span>
                <span className="text-xs font-black text-slate-800">{currentSkill.name}</span>
                <span className="text-[11px] font-bold text-[#6c5ce7] border-l border-purple-200 pl-2">
                  {currentSteps.length} Steps · {currentResources.length} Materials
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenAddStep}
              className="px-3.5 py-2.5 bg-[#6c5ce7] hover:bg-[#5b4bc4] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-2xs hover:shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Step</span>
            </button>

            <button
              onClick={onOpenAddResource}
              className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-2xs hover:shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Document / PDF</span>
            </button>
          </div>

        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. Roadmap Curriculum Steps (Left Panel) */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#6c5ce7] flex items-center justify-center font-bold text-xs shadow-2xs">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-slate-800 tracking-tight">
                    Roadmap Curriculum Steps
                  </h4>
                  <p className="text-xs text-slate-400">
                    Milestones learners complete during timed challenge
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-50 text-[#6c5ce7] border border-purple-100">
                {currentSteps.length} {currentSteps.length === 1 ? 'Step' : 'Steps'}
              </span>
            </div>

            {/* List */}
            {currentSteps.length === 0 ? (
              <div className="py-12 px-4 text-center border-2 border-dashed border-slate-200 rounded-2xl my-3 bg-slate-50/50">
                <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <div className="text-xs font-bold text-slate-700">No curriculum steps for this track</div>
                <p className="text-[11px] text-slate-400 mt-1">Add step-by-step milestones for learners to complete.</p>
                <button
                  onClick={onOpenAddStep}
                  className="mt-3 px-3.5 py-2 bg-[#6c5ce7] text-white text-xs font-bold rounded-xl shadow-2xs hover:bg-[#5848c2] cursor-pointer"
                >
                  + Add First Step
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {currentSteps.map((st, idx) => (
                  <div 
                    key={st.id} 
                    className="p-4 rounded-xl border border-slate-200/90 hover:border-[#6c5ce7]/50 bg-slate-50/40 hover:bg-white transition-all shadow-2xs hover:shadow-xs group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="w-7 h-7 rounded-lg bg-[#6c5ce7] text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#6c5ce7] transition-colors leading-snug">
                            {st.title}
                          </h5>
                          {st.description && (
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              {st.description}
                            </p>
                          )}
                          {st.resource_link && (
                            <div className="mt-2.5">
                              <a 
                                href={st.resource_link} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6c5ce7] hover:text-[#5848c2] bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-md transition-colors"
                              >
                                <Link2 className="w-3 h-3" />
                                <span>Guide Reference</span>
                                <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      <button 
                        onClick={() => onDeleteStep(currentSkill.id, st.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                        title="Delete Step"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Action */}
          <div className="pt-4 mt-4 border-t border-slate-100">
            <button
              onClick={onOpenAddStep}
              className="w-full py-2.5 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 text-[#6c5ce7] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Next Step (#{currentSteps.length + 1})</span>
            </button>
          </div>
        </div>

        {/* 2. Official Documentation & References (Right Panel) */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shadow-2xs">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-slate-800 tracking-tight">
                    Official Documentation &amp; References
                  </h4>
                  <p className="text-xs text-slate-400">
                    PDFs, Google Drive, web docs &amp; YouTube tutorials
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                {currentResources.length} {currentResources.length === 1 ? 'Material' : 'Materials'}
              </span>
            </div>

            {/* Filter Tabs */}
            {currentResources.length > 0 && (
              <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
                <button
                  onClick={() => setResourceFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    resourceFilter === 'all' 
                      ? 'bg-[#6c5ce7] text-white shadow-2xs' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({currentResources.length})
                </button>
                <button
                  onClick={() => setResourceFilter('documents')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    resourceFilter === 'documents' 
                      ? 'bg-[#6c5ce7] text-white shadow-2xs' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Docs &amp; PDFs ({docs.length})</span>
                </button>
                <button
                  onClick={() => setResourceFilter('references')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    resourceFilter === 'references' 
                      ? 'bg-[#6c5ce7] text-white shadow-2xs' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Youtube className="w-3.5 h-3.5 text-red-500" />
                  <span>References ({refs.length})</span>
                </button>
              </div>
            )}

            {/* Resources List */}
            {displayedResources.length === 0 ? (
              <div className="py-12 px-4 text-center border-2 border-dashed border-slate-200 rounded-2xl my-3 bg-slate-50/50">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <div className="text-xs font-bold text-slate-700">No documents or references uploaded</div>
                <p className="text-[11px] text-slate-400 mt-1">Upload lecture slide PDFs, Drive links, or tutorial videos.</p>
                <button
                  onClick={onOpenAddResource}
                  className="mt-3 px-3.5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-2xs hover:bg-emerald-700 cursor-pointer"
                >
                  + Add First Resource
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {displayedResources.map((res) => (
                  <div 
                    key={res.id} 
                    className="p-4 rounded-xl border border-slate-200/90 hover:border-emerald-300 bg-slate-50/40 hover:bg-white transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Row: Badge on left, Trash action on right */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        {getFormatBadge(res)}
                        <button 
                          onClick={() => onDeleteResource(res.id, currentSkill.id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Resource"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Title */}
                      <h5 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                        {res.title}
                      </h5>
                      
                      {/* Description */}
                      {res.description && (
                        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                          {res.description}
                        </p>
                      )}
                    </div>

                    {/* Footer Row: Domain source & Direct action link */}
                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-slate-400 truncate max-w-[130px] sm:max-w-[180px]">
                        {res.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                      </span>

                      <a 
                        href={res.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <span>{getActionLabel(res)}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Action */}
          <div className="pt-4 mt-4 border-t border-slate-100">
            <button
              onClick={onOpenAddResource}
              className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Upload PDF or Add Reference Link</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

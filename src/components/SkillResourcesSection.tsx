import React, { useState } from 'react';
import { Skill, SkillResource } from '../types';
import { 
  FileText, 
  Youtube, 
  Github, 
  Globe, 
  BookOpen, 
  Trash2, 
  Plus, 
  FolderOpen,
  PlayCircle,
  ArrowUpRight,
  Sparkles,
  Layers,
  FileCode2,
  Bookmark
} from 'lucide-react';

function resolveResourceFormat(r: { format?: string; url?: string; title?: string; type?: string }): 'pdf' | 'drive' | 'youtube' | 'github' | 'article' | 'link' {
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

interface SkillResourcesSectionProps {
  skill: Skill;
  resources: SkillResource[];
  isAdmin?: boolean;
  onAddResource?: () => void;
  onDeleteResource?: (resourceId: string) => void;
  className?: string;
}

export const SkillResourcesSection: React.FC<SkillResourcesSectionProps> = ({
  skill,
  resources = [],
  isAdmin = false,
  onAddResource,
  onDeleteResource,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'documents' | 'references'>('all');

  const documents = resources.filter(r => {
    const fmt = resolveResourceFormat(r);
    return fmt === 'pdf' || fmt === 'drive' || r.type === 'document';
  });
  const references = resources.filter(r => {
    const fmt = resolveResourceFormat(r);
    return fmt !== 'pdf' && fmt !== 'drive' && r.type !== 'document';
  });

  const displayedResources = 
    activeTab === 'documents' ? documents :
    activeTab === 'references' ? references :
    resources;

  const getFormatDetails = (r: SkillResource) => {
    const fmt = resolveResourceFormat(r);
    switch (fmt) {
      case 'pdf':
        return {
          badgeLabel: 'PDF Notes & Doc',
          badgeClass: 'bg-[#F3F1EC] dark:bg-rose-950/60 text-[#22252E] dark:text-rose-300 border-[#E8E4DC] dark:border-rose-800/50',
          iconBg: 'bg-[#F3F1EC] dark:bg-rose-950/60 text-[#6C5CE7] dark:text-rose-400 border-[#E8E4DC] dark:border-rose-800/40',
          icon: <FileText className="w-4 h-4 text-[#6C5CE7] dark:text-rose-400" />,
          btnText: 'View PDF Document',
          btnClass: 'bg-[#6C5CE7] hover:bg-[#5848c2] text-white shadow-xs hover:shadow-sm'
        };
      case 'drive':
        return {
          badgeLabel: 'Google Drive Asset',
          badgeClass: 'bg-[#F3F1EC] dark:bg-amber-950/60 text-[#22252E] dark:text-amber-300 border-[#E8E4DC] dark:border-amber-800/50',
          iconBg: 'bg-[#F3F1EC] dark:bg-amber-950/60 text-[#6C5CE7] dark:text-amber-400 border-[#E8E4DC] dark:border-amber-800/40',
          icon: <FolderOpen className="w-4 h-4 text-[#6C5CE7] dark:text-amber-400" />,
          btnText: 'Open Drive Files',
          btnClass: 'bg-[#6C5CE7] hover:bg-[#5848c2] text-white shadow-xs hover:shadow-sm'
        };
      case 'youtube':
        return {
          badgeLabel: 'Video Lecture Class',
          badgeClass: 'bg-[#F3F1EC] dark:bg-red-950/60 text-[#22252E] dark:text-red-300 border-[#E8E4DC] dark:border-red-800/50',
          iconBg: 'bg-[#F3F1EC] dark:bg-red-950/60 text-[#6C5CE7] dark:text-red-400 border-[#E8E4DC] dark:border-red-800/40',
          icon: <PlayCircle className="w-4 h-4 text-[#6C5CE7] dark:text-red-400" />,
          btnText: 'Watch Video Class',
          btnClass: 'bg-[#6C5CE7] hover:bg-[#5848c2] text-white shadow-xs hover:shadow-sm'
        };
      case 'github':
        return {
          badgeLabel: 'Code Repository',
          badgeClass: 'bg-[#F3F1EC] dark:bg-slate-800 text-[#22252E] dark:text-slate-200 border-[#E8E4DC] dark:border-slate-700',
          iconBg: 'bg-[#F3F1EC] dark:bg-slate-800 text-[#6C5CE7] dark:text-slate-300 border-[#E8E4DC] dark:border-slate-700',
          icon: <Github className="w-4 h-4 text-[#6C5CE7] dark:text-slate-300" />,
          btnText: 'Explore Codebase',
          btnClass: 'bg-[#6C5CE7] hover:bg-[#5848c2] text-white shadow-xs hover:shadow-sm'
        };
      case 'article':
        return {
          badgeLabel: 'Technical Article',
          badgeClass: 'bg-[#F3F1EC] dark:bg-emerald-950/60 text-[#22252E] dark:text-emerald-300 border-[#E8E4DC] dark:border-emerald-800/50',
          iconBg: 'bg-[#F3F1EC] dark:bg-emerald-950/60 text-[#6C5CE7] dark:text-emerald-400 border-[#E8E4DC] dark:border-emerald-800/40',
          icon: <BookOpen className="w-4 h-4 text-[#6C5CE7] dark:text-emerald-400" />,
          btnText: 'Read Article Guide',
          btnClass: 'bg-[#6C5CE7] hover:bg-[#5848c2] text-white shadow-xs hover:shadow-sm'
        };
      default:
        return {
          badgeLabel: 'Official Documentation',
          badgeClass: 'bg-[#F3F1EC] dark:bg-purple-950/60 text-[#22252E] dark:text-purple-300 border-[#E8E4DC] dark:border-purple-800/50',
          iconBg: 'bg-[#F3F1EC] dark:bg-purple-950/60 text-[#6C5CE7] dark:text-purple-400 border-[#E8E4DC] dark:border-purple-800/40',
          icon: <Globe className="w-4 h-4 text-[#6C5CE7] dark:text-purple-400" />,
          btnText: 'Open Official Docs',
          btnClass: 'bg-[#6C5CE7] hover:bg-[#5848c2] text-white shadow-xs hover:shadow-sm'
        };
    }
  };

  const getCleanDomain = (url: string) => {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.replace(/^www\./, '');
      if (host.includes('supabase.co')) return 'Pragatii Cloud Storage';
      if (host.includes('youtube.com') || host.includes('youtu.be')) return 'YouTube';
      if (host.includes('drive.google.com')) return 'Google Drive';
      if (host.includes('github.com')) return 'GitHub';
      return host;
    } catch {
      return url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] || 'Web Link';
    }
  };

  return (
    <div 
      className={`bg-white dark:bg-[#141726] rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-[#E8E4DC] dark:border-[#23273e] shadow-xs flex flex-col gap-6 transition-all ${className}`} 
      id="official-documentation-resources"
    >
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E8E4DC] dark:border-[#23273e]">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-[#F3F1EC] dark:bg-emerald-950/50 text-[#6C5CE7] dark:text-emerald-400 border border-[#E8E4DC] dark:border-emerald-800/50 flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <BookOpen className="w-5 h-5" />
          </div>
          
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h4 className="text-base sm:text-lg font-black text-[#22252E] dark:text-white tracking-tight">
                Official Documentation &amp; References
              </h4>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F3F1EC] dark:bg-emerald-950/60 text-[#6C5CE7] dark:text-emerald-300 border border-[#E8E4DC] dark:border-emerald-800/50 shadow-2xs">
                {resources.length} {resources.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#8B8A86] dark:text-slate-400 mt-1">
              Curated official docs, PDF notes, Drive files &amp; video tutorials for {skill.name}
            </p>
          </div>
        </div>

        {/* Admin Action Button */}
        {isAdmin && onAddResource && (
          <button
            onClick={onAddResource}
            className="self-start sm:self-auto px-4 py-2.5 bg-[#6C5CE7] hover:bg-[#5848c2] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-2xs hover:shadow-xs cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Resource / PDF</span>
          </button>
        )}
      </div>

      {/* 2. Filter Navigation Pills */}
      {resources.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border ${
              activeTab === 'all' 
                ? 'bg-[#6C5CE7] text-white border-[#6C5CE7] shadow-xs' 
                : 'bg-white dark:bg-[#101320] text-[#22252E] dark:text-slate-300 border-[#E8E4DC] dark:border-[#23273e] hover:bg-[#F3F1EC] dark:hover:bg-[#181c30] hover:text-[#6C5CE7] dark:hover:text-white hover:border-[#6C5CE7]/40 dark:hover:border-purple-800'
            }`}
          >
            <span>All Materials</span>
            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${activeTab === 'all' ? 'bg-white/25 text-white' : 'bg-[#F3F1EC] dark:bg-[#1e2238] text-[#8B8A86] dark:text-slate-400'}`}>
              {resources.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border ${
              activeTab === 'documents' 
                ? 'bg-[#6C5CE7] text-white border-[#6C5CE7] shadow-xs' 
                : 'bg-white dark:bg-[#101320] text-[#22252E] dark:text-slate-300 border-[#E8E4DC] dark:border-[#23273e] hover:bg-[#F3F1EC] dark:hover:bg-rose-950/30 hover:text-[#6C5CE7] dark:hover:text-rose-300 hover:border-[#6C5CE7]/40 dark:hover:border-rose-800/40'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Docs &amp; PDFs</span>
            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${activeTab === 'documents' ? 'bg-white/25 text-white' : 'bg-[#F3F1EC] dark:bg-[#1e2238] text-[#8B8A86] dark:text-slate-400'}`}>
              {documents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('references')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border ${
              activeTab === 'references' 
                ? 'bg-[#6C5CE7] text-white border-[#6C5CE7] shadow-xs' 
                : 'bg-white dark:bg-[#101320] text-[#22252E] dark:text-slate-300 border-[#E8E4DC] dark:border-[#23273e] hover:bg-[#F3F1EC] dark:hover:bg-red-950/30 hover:text-[#6C5CE7] dark:hover:text-red-300 hover:border-[#6C5CE7]/40 dark:hover:border-red-800/40'
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Video Classes</span>
            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${activeTab === 'references' ? 'bg-white/25 text-white' : 'bg-[#F3F1EC] dark:bg-[#1e2238] text-[#8B8A86] dark:text-slate-400'}`}>
              {references.length}
            </span>
          </button>
        </div>
      )}

      {/* 3. Smooth Minimalist Resource Cards */}
      {displayedResources.length === 0 ? (
        <div className="py-12 px-4 text-center border-2 border-dashed border-[#E8E4DC] dark:border-[#23273e] rounded-2xl bg-[#F3F1EC]/70 dark:bg-[#101320]/60">
          <BookOpen className="w-10 h-10 text-[#8B8A86] dark:text-slate-600 mx-auto mb-3" />
          <div className="text-sm font-bold text-[#22252E] dark:text-slate-200">No learning materials found</div>
          <p className="text-xs text-[#8B8A86] dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
            {isAdmin 
              ? 'Click "+ Add Resource / PDF" above to upload lecture slides or share documentation links.'
              : 'Our mentors will add materials for this section soon.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5 max-h-[620px] overflow-y-auto pr-1">
          {displayedResources.map((res) => {
            const fmt = getFormatDetails(res);
            const domainName = getCleanDomain(res.url);

            return (
              <div 
                key={res.id} 
                className="group relative bg-white dark:bg-[#141726] hover:bg-[#FAF8F5] dark:hover:bg-[#181c30] border border-[#E8E4DC] dark:border-[#23273e] hover:border-[#6C5CE7] dark:hover:border-[#6c5ce7] rounded-2xl p-5 transition-all duration-300 shadow-2xs hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  {/* Top Meta Line: Badge + Domain Tag + Delete */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-transform duration-200 group-hover:scale-105 ${fmt.badgeClass}`}>
                      {fmt.icon}
                      <span>{fmt.badgeLabel}</span>
                    </span>

                    <div className="flex items-center gap-2 ml-auto">
                      <span className="text-[11px] font-semibold text-[#8B8A86] dark:text-slate-300 bg-[#F3F1EC] dark:bg-[#181c30] border border-[#E8E4DC] dark:border-[#2a2f4c] px-2.5 py-0.5 rounded-md shadow-2xs group-hover:border-[#6C5CE7]/30 transition-colors">
                        {domainName}
                      </span>

                      {isAdmin && onDeleteResource && (
                        <button
                          onClick={() => onDeleteResource(res.id)}
                          className="text-[#8B8A86] hover:text-[#D64545] dark:hover:text-rose-400 p-1 rounded-md hover:bg-[#FDEAEA] dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Delete Resource"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Clean Title */}
                  <h5 className="font-extrabold text-sm sm:text-base text-[#22252E] dark:text-white group-hover:text-[#6C5CE7] dark:group-hover:text-purple-300 transition-colors leading-snug">
                    {res.title}
                  </h5>

                  {/* Optional Description */}
                  {res.description && (
                    <p className="text-xs sm:text-sm text-[#8B8A86] dark:text-slate-400 mt-2 leading-relaxed line-clamp-2">
                      {res.description}
                    </p>
                  )}
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-3.5 mt-3.5 border-t border-[#E8E4DC] dark:border-[#23273e] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-[#8B8A86] dark:text-slate-500 text-xs">
                    <Bookmark className="w-3.5 h-3.5 text-[#6C5CE7] dark:text-purple-400" />
                    <span>Reference Material</span>
                  </div>

                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs hover:scale-105 active:scale-95 ${fmt.btnClass}`}
                  >
                    <span>{fmt.btnText}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-90 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

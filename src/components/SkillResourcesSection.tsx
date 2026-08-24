import React, { useState } from 'react';
import { Skill, SkillResource } from '../types';
import { 
  FileText, 
  Youtube, 
  Github, 
  Globe, 
  ExternalLink, 
  BookOpen, 
  Trash2, 
  Plus, 
  FolderOpen,
  Sparkles,
  Bookmark,
  Layers,
  Search
} from 'lucide-react';

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

  const documents = resources.filter(r => r.type === 'document' || r.format === 'pdf' || r.format === 'drive');
  const references = resources.filter(r => r.type === 'reference' && r.format !== 'pdf' && r.format !== 'drive');

  const displayedResources = 
    activeTab === 'documents' ? documents :
    activeTab === 'references' ? references :
    resources;

  const getFormatBadge = (r: SkillResource) => {
    switch (r.format) {
      case 'pdf':
        return (
          <span className="resource-badge-3d inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200/80 shadow-2xs">
            <FileText className="w-3.5 h-3.5 text-rose-500 transition-transform group-hover:scale-110" />
            PDF Material
          </span>
        );
      case 'drive':
        return (
          <span className="resource-badge-3d inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/80 shadow-2xs">
            <FolderOpen className="w-3.5 h-3.5 text-amber-600 transition-transform group-hover:scale-110" />
            Google Drive
          </span>
        );
      case 'youtube':
        return (
          <span className="resource-badge-3d inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200/80 shadow-2xs">
            <Youtube className="w-3.5 h-3.5 fill-current transition-transform group-hover:scale-110" />
            Video Tutorial
          </span>
        );
      case 'github':
        return (
          <span className="resource-badge-3d inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs">
            <Github className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
            GitHub Repo
          </span>
        );
      case 'article':
        return (
          <span className="resource-badge-3d inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs">
            <BookOpen className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
            Reading Guide
          </span>
        );
      default:
        return (
          <span className="resource-badge-3d inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs">
            <Globe className="w-3.5 h-3.5 text-indigo-600 transition-transform group-hover:scale-110" />
            Official Documentation
          </span>
        );
    }
  };

  const getActionButton = (r: SkillResource) => {
    switch (r.format) {
      case 'pdf':
        return (
          <a
            href={r.url}
            target="_blank"
            rel="noreferrer"
            className="resource-action-btn inline-flex items-center gap-1.5 text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-rose-600" />
            <span>Open PDF Note</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
          </a>
        );
      case 'drive':
        return (
          <a
            href={r.url}
            target="_blank"
            rel="noreferrer"
            className="resource-action-btn inline-flex items-center gap-1.5 text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-600" />
            <span>Open Drive Folder</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
          </a>
        );
      case 'youtube':
        return (
          <a
            href={r.url}
            target="_blank"
            rel="noreferrer"
            className="resource-action-btn inline-flex items-center gap-1.5 text-xs font-bold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200/80 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
          >
            <Youtube className="w-3.5 h-3.5 fill-current" />
            <span>Watch Tutorial</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
          </a>
        );
      case 'github':
        return (
          <a
            href={r.url}
            target="_blank"
            rel="noreferrer"
            className="resource-action-btn inline-flex items-center gap-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
          >
            <Github className="w-3.5 h-3.5" />
            <span>View Code</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
          </a>
        );
      default:
        return (
          <a
            href={r.url}
            target="_blank"
            rel="noreferrer"
            className="resource-action-btn inline-flex items-center gap-1.5 text-xs font-bold bg-purple-50 hover:bg-purple-100 text-[#6c5ce7] border border-purple-200/80 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-[#6c5ce7]" />
            <span>Open Docs</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
          </a>
        );
    }
  };

  const getCleanDomain = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace(/^www\./, '');
    } catch {
      return url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] || 'link';
    }
  };

  return (
    <div 
      className={`resource-section-3d bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs transition-all ${className}`} 
      id="official-documentation-resources"
    >
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        
        {/* Title and Icon */}
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#6c5ce7]/10 text-[#6c5ce7] border border-[#6c5ce7]/20 flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <BookOpen className="w-5 h-5" />
          </div>
          
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h4 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Official Documentation &amp; References
              </h4>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-[#6c5ce7] border border-purple-100 shadow-2xs">
                {resources.length} {resources.length === 1 ? 'material' : 'materials'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 line-clamp-1">
              Curated official documentation, direct PDF notes, Drive links, and recommended video references for {skill.name}.
            </p>
          </div>
        </div>

        {/* Admin Action Button */}
        {isAdmin && onAddResource && (
          <button
            onClick={onAddResource}
            className="admin-add-btn-3d self-start sm:self-auto px-4 py-2.5 bg-[#6c5ce7] hover:bg-[#5848c2] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-2xs hover:shadow-xs cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Resource / PDF</span>
          </button>
        )}
      </div>

      {/* 2. Filter Navigation Segmented Tabs */}
      {resources.length > 0 && (
        <div className="pt-4 pb-2">
          <div className="inline-flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'all' 
                  ? 'bg-white text-slate-900 shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>All Resources</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${activeTab === 'all' ? 'bg-[#6c5ce7] text-white' : 'bg-slate-200 text-slate-600'}`}>
                {resources.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('documents')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'documents' 
                  ? 'bg-white text-slate-900 shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-rose-500" />
              <span>Docs &amp; PDFs</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${activeTab === 'documents' ? 'bg-[#6c5ce7] text-white' : 'bg-slate-200 text-slate-600'}`}>
                {documents.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('references')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'references' 
                  ? 'bg-white text-slate-900 shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Youtube className="w-3.5 h-3.5 text-red-500" />
              <span>References &amp; Tutorials</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${activeTab === 'references' ? 'bg-[#6c5ce7] text-white' : 'bg-slate-200 text-slate-600'}`}>
                {references.length}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Resource Cards Grid */}
      {displayedResources.length === 0 ? (
        <div className="py-12 px-4 text-center border-2 border-dashed border-slate-200 rounded-2xl my-4 bg-slate-50/50">
          <BookOpen className="w-9 h-9 text-slate-300 mx-auto mb-2" />
          <div className="text-sm font-bold text-slate-700">No learning materials found in this category</div>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
            {isAdmin 
              ? 'Click "+ Add Resource / PDF" above to upload lecture slides, share Google Drive folders, or add tutorial links.'
              : 'Our mentors are regularly updating official docs, lecture slides, and video links for this track.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 my-3 max-h-[640px] overflow-y-auto pr-1">
          {displayedResources.map((res) => (
            <div 
              key={res.id} 
              className="resource-card-3d bg-white hover:bg-slate-50/50 border border-slate-200 rounded-2xl p-4.5 sm:p-5 transition-all flex flex-col justify-between group shadow-2xs hover:shadow-xs"
            >
              <div>
                {/* Format Tag on Left & Admin Delete on Right */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  {getFormatBadge(res)}
                  
                  {isAdmin && onDeleteResource && (
                    <button
                      onClick={() => onDeleteResource(res.id)}
                      className="delete-resource-btn-3d text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                      title="Delete Resource"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Material Title */}
                <h5 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-[#6c5ce7] transition-colors leading-snug">
                  {res.title}
                </h5>

                {/* Material Description */}
                {res.description && (
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {res.description}
                  </p>
                )}
              </div>

              {/* Card Footer: Domain source & Direct Action CTA Button */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="text-[11px] font-mono text-slate-400 truncate max-w-[130px] sm:max-w-[170px]" title={res.url}>
                  {getCleanDomain(res.url)}
                </span>
                
                {getActionButton(res)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

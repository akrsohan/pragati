import React, { useState, useEffect, useRef } from 'react';
import { Field, Skill, RoadmapStep, SkillResource } from '../types';
import { X, Plus, Trash2, Edit2, Check, Save, FileText, Link, Youtube, Github, Globe, UploadCloud, Copy, Database, ExternalLink, BookOpen, FileCheck, Video, GraduationCap, PlayCircle } from 'lucide-react';
import { uploadResourcePdf } from '../lib/supabaseService';

interface SkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (skillData: Partial<Skill>) => void;
  fields: Field[];
  initialData?: Skill | null;
}

export const SkillModal: React.FC<SkillModalProps> = ({
  isOpen,
  onClose,
  onSave,
  fields,
  initialData
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [selectedFieldIds, setSelectedFieldIds] = useState<string[]>(() => {
    if (initialData?.field_ids && initialData.field_ids.length > 0) {
      return initialData.field_ids;
    }
    return initialData?.field_id ? [initialData.field_id] : (fields[0]?.id ? [fields[0].id] : []);
  });
  const [icon, setIcon] = useState(initialData?.icon || 'S');
  const [bgColor, setBgColor] = useState(initialData?.bg_color || '#6c5ce7');
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || 'Beginner');
  const [avgDays, setAvgDays] = useState(initialData?.avg_days || '3 days');

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
      setDescription(initialData?.description || '');
      const initialFields = (initialData?.field_ids && initialData.field_ids.length > 0)
        ? initialData.field_ids
        : (initialData?.field_id ? [initialData.field_id] : (fields[0]?.id ? [fields[0].id] : []));
      setSelectedFieldIds(initialFields);
      setIcon(initialData?.icon || 'S');
      setBgColor(initialData?.bg_color || '#6c5ce7');
      setDifficulty(initialData?.difficulty || 'Beginner');
      setAvgDays(initialData?.avg_days || '3 days');
    }
  }, [isOpen, initialData, fields]);

  if (!isOpen) return null;

  const toggleField = (fieldIdToToggle: string) => {
    setSelectedFieldIds(prev => {
      if (prev.includes(fieldIdToToggle)) {
        if (prev.length === 1) return prev; // Keep at least one field selected
        return prev.filter(id => id !== fieldIdToToggle);
      } else {
        return [...prev, fieldIdToToggle];
      }
    });
  };

  const selectAllFields = () => {
    setSelectedFieldIds(fields.map(f => f.id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (selectedFieldIds.length === 0) return;

    onSave({
      id: initialData?.id || `skill-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: name.trim(),
      description: description.trim(),
      field_id: selectedFieldIds[0] || (fields[0]?.id || ''),
      field_ids: selectedFieldIds,
      icon: icon.trim() || name.slice(0, 2).toUpperCase(),
      bg_color: bgColor,
      difficulty,
      avg_days: avgDays,
      order_index: initialData?.order_index || 1,
      learner_count: initialData?.learner_count || 1,
      step_count: initialData?.step_count || 3
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-[#141726] rounded-2xl p-5 sm:p-7 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-200 dark:border-[#23273e]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 text-[#8a8ca3] hover:text-[#1a1c2e] dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#1e2238] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg sm:text-xl font-extrabold text-[#1a1c2e] dark:text-white mb-4 sm:mb-6 pr-8">
          {initialData ? 'Edit Skill Track' : 'Add New Skill Track'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label">Skill Name</label>
            <input 
              type="text" 
              className="field-input" 
              placeholder="e.g. TypeScript, Docker, Flutter"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="field-label">Short Description</label>
            <textarea 
              className="field-input min-h-[70px]" 
              placeholder="Brief description of this roadmap..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Associated Fields (Multi-field Selection) */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2.5">
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <span>Assigned Fields / Categories</span>
                  <span className="text-rose-500 font-bold">*</span>
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Select one or more fields where this skill will appear
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 pr-1">
                <button
                  type="button"
                  onClick={selectedFieldIds.length === fields.length ? () => setSelectedFieldIds([fields[0]?.id || 'field-1']) : selectAllFields}
                  className="text-[11px] font-bold text-[#6c5ce7] dark:text-[#a29bfe] hover:underline cursor-pointer px-2 py-0.5 rounded-md hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors"
                >
                  {selectedFieldIds.length === fields.length ? 'Reset' : 'Select All'}
                </button>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1 rounded-lg bg-purple-100/80 dark:bg-purple-950/60 text-[#6c5ce7] dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6c5ce7] dark:bg-purple-400"></span>
                  {selectedFieldIds.length} {selectedFieldIds.length === 1 ? 'Field' : 'Fields'} Selected
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50/80 dark:bg-[#0f1222] rounded-2xl border border-slate-200 dark:border-[#23273e]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                {fields.map(f => {
                  const isSelected = selectedFieldIds.includes(f.id);
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => toggleField(f.id)}
                      className={`group relative flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-purple-50/90 dark:bg-[#1a1c32] border-[#6c5ce7] text-[#1a1c2e] dark:text-white shadow-xs ring-1 ring-[#6c5ce7]/40'
                          : 'bg-white dark:bg-[#15182a] border-slate-200 dark:border-[#23273e] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50/80 dark:hover:bg-[#191d34]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-[#6c5ce7]/15 dark:bg-[#6c5ce7]/25 text-[#6c5ce7] dark:text-purple-300 border border-[#6c5ce7]/30'
                            : 'bg-slate-100 dark:bg-[#1c2038] text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800'
                        }`}>
                          {f.icon}
                        </div>
                        <div className="min-w-0">
                          <div className={`text-xs font-bold truncate transition-colors ${
                            isSelected
                              ? 'text-[#6c5ce7] dark:text-purple-300'
                              : 'text-slate-800 dark:text-slate-200 group-hover:text-[#6c5ce7] dark:group-hover:text-purple-300'
                          }`}>
                            {f.name}
                          </div>
                          <div className="text-[10px] text-slate-600 dark:text-slate-300 truncate">
                            {isSelected ? '✓ Associated' : 'Click to add'}
                          </div>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                        isSelected 
                          ? 'bg-[#6c5ce7] border-[#6c5ce7] text-white shadow-xs' 
                          : 'border-slate-300 dark:border-slate-600 bg-white/40 dark:bg-transparent group-hover:border-slate-400 dark:group-hover:border-slate-500'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active tags overview */}
              {selectedFieldIds.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-200/80 dark:border-[#1e233d] flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mr-1">
                    Active in:
                  </span>
                  {selectedFieldIds.map(fid => {
                    const fieldObj = fields.find(f => f.id === fid);
                    if (!fieldObj) return null;
                    return (
                      <span
                        key={fid}
                        className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/50 text-[#6c5ce7] dark:text-purple-300 border border-purple-200 dark:border-purple-800/40"
                      >
                        <span className="text-xs">{fieldObj.icon}</span>
                        <span>{fieldObj.name}</span>
                        {selectedFieldIds.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleField(fid);
                            }}
                            className="ml-0.5 hover:text-red-500 transition-colors cursor-pointer"
                            title={`Remove from ${fieldObj.name}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedFieldIds.length === 0 && (
              <p className="text-[11px] text-red-500 mt-1.5 font-medium">
                Please select at least one field for this skill.
              </p>
            )}
          </div>

          <div className="row2">
            <div>
              <label className="field-label">Difficulty</label>
              <select 
                className="field-input"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="field-label">Avg Duration</label>
              <input 
                type="text" 
                className="field-input" 
                placeholder="e.g. 3 days, 1 week"
                value={avgDays}
                onChange={(e) => setAvgDays(e.target.value)}
              />
            </div>
          </div>

          <div className="row2">
            <div>
              <label className="field-label">Icon Badge (1-2 chars)</label>
              <input 
                type="text" 
                className="field-input" 
                maxLength={3}
                placeholder="e.g. TS, PY"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">Badge Color</label>
              <input 
                type="color" 
                className="field-input h-[46px] p-1 cursor-pointer" 
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
              />
            </div>
          </div>

          <div className="btn-row pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-ghost"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary flex1 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {initialData ? 'Update Skill' : 'Create Skill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface FieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (fieldData: Partial<Field>) => void;
  initialData?: Field | null;
}

export const FieldModal: React.FC<FieldModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [icon, setIcon] = useState(initialData?.icon || '💻');

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
      setDescription(initialData?.description || '');
      setIcon(initialData?.icon || '💻');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      id: initialData?.id || `field-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: name.trim(),
      description: description.trim(),
      icon: icon.trim() || '💻'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-[#141726] rounded-2xl p-5 sm:p-7 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-200 dark:border-[#23273e]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 text-[#8a8ca3] hover:text-[#1a1c2e] dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#1e2238] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg sm:text-xl font-extrabold text-[#1a1c2e] dark:text-white mb-4 pr-8">
          {initialData ? 'Edit Field / Category' : 'Add New Field / Category'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label">Field Name</label>
            <input 
              type="text" 
              className="field-input" 
              placeholder="e.g. Artificial Intelligence, Mobile Apps"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="field-label">Description</label>
            <textarea 
              className="field-input min-h-[70px]" 
              placeholder="Brief overview of this field..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="field-label">Icon / Emoji</label>
            <input 
              type="text" 
              className="field-input" 
              maxLength={4}
              placeholder="e.g. 🤖, 📱"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
            />
          </div>

          <div className="btn-row pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-ghost"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary flex1 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {initialData ? 'Update Field' : 'Create Field'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface StepModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (stepData: Partial<RoadmapStep>) => void;
  skillId: string;
  skillName: string;
  nextOrder: number;
  initialData?: RoadmapStep | null;
}

export const StepModal: React.FC<StepModalProps> = ({
  isOpen,
  onClose,
  onSave,
  skillId,
  skillName,
  nextOrder,
  initialData
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [resourceLink, setResourceLink] = useState(initialData?.resource_link || '');

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || '');
      setDescription(initialData?.description || '');
      setResourceLink(initialData?.resource_link || '');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      id: initialData?.id || `step-${skillId}-${Date.now()}`,
      skill_id: initialData?.skill_id || skillId,
      title: title.trim(),
      description: description.trim(),
      step_order: initialData?.step_order || nextOrder,
      resource_link: resourceLink.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-[#141726] rounded-2xl p-5 sm:p-7 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-200 dark:border-[#23273e]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 text-[#8a8ca3] hover:text-[#1a1c2e] dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#1e2238] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg sm:text-xl font-extrabold text-[#1a1c2e] dark:text-white mb-1 pr-8">
          {initialData ? 'Edit Roadmap Step' : 'Add Roadmap Step'}
        </h3>
        <p className="text-xs text-[#8a8ca3] dark:text-slate-400 mb-6">
          For {skillName} (Step #{initialData?.step_order || nextOrder})
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label">Step Title</label>
            <input 
              type="text" 
              className="field-input" 
              placeholder="e.g. Learn Semantic HTML"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="field-label">Topics / Concepts</label>
            <textarea 
              className="field-input min-h-[80px]" 
              placeholder="e.g. header, nav, main, footer, article tags..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="field-label">Documentation / Guide URL (Optional)</label>
            <input 
              type="url" 
              className="field-input" 
              placeholder="https://..."
              value={resourceLink}
              onChange={(e) => setResourceLink(e.target.value)}
            />
          </div>

          <div className="btn-row pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-ghost"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary flex1 flex items-center justify-center gap-2"
            >
              {initialData ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {initialData ? 'Update Step' : 'Add Step'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (resourceData: Partial<SkillResource>) => void;
  skillId: string;
  skillName: string;
  initialData?: SkillResource | null;
}

export const ResourceModal: React.FC<ResourceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  skillId,
  skillName,
  initialData
}) => {
  const [type, setType] = useState<'document' | 'reference'>(initialData?.type || 'document');
  const [format, setFormat] = useState<'pdf' | 'drive' | 'link' | 'youtube' | 'github' | 'article'>(initialData?.format || 'link');
  const [title, setTitle] = useState(initialData?.title || '');
  const [url, setUrl] = useState(initialData?.url || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setType(initialData?.type || 'document');
      setFormat(initialData?.format || 'link');
      setTitle(initialData?.title || '');
      setUrl(initialData?.url || '');
      setDescription(initialData?.description || '');
      setUploadedFileName(null);
      setUploadingPdf(false);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      alert('Please upload a valid PDF document.');
      return;
    }

    setUploadingPdf(true);
    try {
      const res = await uploadResourcePdf(file, skillId);
      setUrl(res.url);
      setUploadedFileName(res.fileName);
      setFormat('pdf');
      if (!title) {
        // Auto-suggest nice title from filename
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTitle(`${cleanName} (PDF)`);
      }
    } catch (err: any) {
      alert('Failed to process PDF: ' + (err?.message || 'Unknown error'));
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    onSave({
      ...(initialData?.id ? { id: initialData.id } : {}),
      skill_id: initialData?.skill_id || skillId,
      title: title.trim(),
      type,
      format,
      url: url.trim(),
      description: description.trim() || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#141726] rounded-2xl p-5 sm:p-7 max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl relative border border-slate-200 dark:border-[#23273e]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 text-[#8a8ca3] hover:text-[#1a1c2e] dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#1e2238] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-[#6c5ce7]/10 dark:bg-[#6c5ce7]/20 text-[#6c5ce7] dark:text-purple-300 flex items-center justify-center font-bold">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#1a1c2e] dark:text-white">
              {initialData ? 'Edit Resource & Material' : 'Add Resource & Material'}
            </h3>
            <p className="text-xs text-[#8a8ca3] dark:text-slate-400">For {skillName} roadmap</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          {/* Category Tabs: Document vs Reference */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Resource Category</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-[#101321] rounded-xl border border-slate-200 dark:border-[#23273e]">
              <button
                type="button"
                onClick={() => {
                  setType('document');
                  if (format === 'youtube' || format === 'github' || format === 'article') {
                    setFormat('link');
                  }
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  type === 'document' 
                    ? 'bg-white dark:bg-[#1e2238] text-[#6c5ce7] dark:text-purple-300 shadow-xs border border-slate-200 dark:border-[#2b304c]' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Document / PDF / Drive</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('reference');
                  if (format === 'pdf' || format === 'drive') {
                    setFormat('youtube');
                  }
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  type === 'reference' 
                    ? 'bg-white dark:bg-[#1e2238] text-red-600 dark:text-red-400 shadow-xs border border-slate-200 dark:border-[#2b304c]' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Youtube className="w-3.5 h-3.5 text-red-500 fill-current" />
                <span>Video Class &amp; References</span>
              </button>
            </div>
          </div>

          {/* Format Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Format Type</label>
            <div className="flex flex-wrap gap-1.5">
              {type === 'document' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setFormat('link')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-all flex items-center gap-1.5 ${
                      format === 'link' ? 'bg-[#6c5ce7] text-white border-[#6c5ce7]' : 'bg-white dark:bg-[#101321] border-slate-200 dark:border-[#23273e] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1e2238]'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" /> Web Docs / Page
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('pdf')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-all flex items-center gap-1.5 ${
                      format === 'pdf' ? 'bg-[#6c5ce7] text-white border-[#6c5ce7]' : 'bg-white dark:bg-[#101321] border-slate-200 dark:border-[#23273e] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1e2238]'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-red-400" /> Direct PDF Note
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('drive')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-all flex items-center gap-1.5 ${
                      format === 'drive' ? 'bg-[#6c5ce7] text-white border-[#6c5ce7]' : 'bg-white dark:bg-[#101321] border-slate-200 dark:border-[#23273e] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1e2238]'
                    }`}
                  >
                    <Link className="w-3.5 h-3.5 text-amber-500" /> Google Drive Notes
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setFormat('youtube')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-all flex items-center gap-1.5 ${
                      format === 'youtube' ? 'bg-red-600 text-white border-red-600 shadow-2xs' : 'bg-white dark:bg-[#101321] border-slate-200 dark:border-[#23273e] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1e2238]'
                    }`}
                  >
                    <Youtube className="w-3.5 h-3.5 fill-current" />
                    <span>Video Class / Lecture</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('article')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-all flex items-center gap-1.5 ${
                      format === 'article' ? 'bg-[#6c5ce7] text-white border-[#6c5ce7]' : 'bg-white dark:bg-[#101321] border-slate-200 dark:border-[#23273e] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1e2238]'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-emerald-500" /> Article / Blog
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('github')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-all flex items-center gap-1.5 ${
                      format === 'github' ? 'bg-[#6c5ce7] text-white border-[#6c5ce7]' : 'bg-white dark:bg-[#101321] border-slate-200 dark:border-[#23273e] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1e2238]'
                    }`}
                  >
                    <Github className="w-3.5 h-3.5 text-slate-800 dark:text-slate-200" /> GitHub Repository
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('link')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-all flex items-center gap-1.5 ${
                      format === 'link' ? 'bg-[#6c5ce7] text-white border-[#6c5ce7]' : 'bg-white dark:bg-[#101321] border-slate-200 dark:border-[#23273e] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1e2238]'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5 text-sky-500" /> External Tool / Site
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Optional Direct PDF Upload Box when format === 'pdf' */}
          {format === 'pdf' && (
            <div className="p-3.5 bg-slate-50 dark:bg-[#101321] border border-dashed border-slate-300 dark:border-[#23273e] rounded-xl">
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="application/pdf,.pdf" 
                onChange={handleFileUpload} 
                className="hidden" 
              />
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center font-bold shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {uploadedFileName || 'Upload PDF Document directly'}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {uploadingPdf ? 'Uploading file...' : uploadedFileName ? 'PDF linked successfully' : 'Supports books, lecture slides & cheat sheets'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPdf}
                  className="px-3 py-1.5 bg-white dark:bg-[#1e2238] border border-slate-300 dark:border-[#2e3452] hover:border-[#6c5ce7] text-[#6c5ce7] dark:text-purple-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  {uploadingPdf ? 'Processing...' : uploadedFileName ? 'Change PDF' : 'Select PDF File'}
                </button>
              </div>
            </div>
          )}

          {/* Resource Title */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Resource Title <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              className="field-input" 
              placeholder={
                format === 'youtube' ? 'e.g. Traversy Media — Complete Crash Course' :
                format === 'drive' ? 'e.g. Official Lecture Notes & Cheatsheets (Drive)' :
                format === 'pdf' ? 'e.g. Master Guide to Clean Code (PDF)' :
                'e.g. MDN Web Docs — Official Reference'
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Resource URL */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              URL / Link <span className="text-red-500">*</span>
            </label>
            <input 
              type="url" 
              className="field-input" 
              placeholder={
                format === 'youtube' ? 'https://www.youtube.com/watch?v=...' :
                format === 'drive' ? 'https://drive.google.com/drive/folders/...' :
                'https://...'
              }
              value={url}
              onChange={(e) => {
                const val = e.target.value;
                setUrl(val);
                const lower = val.toLowerCase();
                if (lower.includes('youtube.com') || lower.includes('youtu.be') || lower.includes('vimeo.com') || lower.includes('loom.com')) {
                  setType('reference');
                  setFormat('youtube');
                } else if (lower.includes('drive.google.com') || lower.includes('docs.google.com')) {
                  setType('document');
                  setFormat('drive');
                } else if (lower.endsWith('.pdf')) {
                  setType('document');
                  setFormat('pdf');
                } else if (lower.includes('github.com')) {
                  setType('reference');
                  setFormat('github');
                }
              }}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Short Note or Description (Optional)
            </label>
            <textarea 
              className="field-input min-h-[60px]" 
              placeholder="What will learners gain from this material?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="btn-row pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-ghost"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={uploadingPdf}
              className="btn-primary flex1 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {initialData ? 'Update Material' : 'Save Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface SqlCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SqlCodeModal: React.FC<SqlCodeModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sqlCode = `-- =========================================================================
-- Pragatii — Complete Supabase Database Schema
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- =========================================================================

-- 1. Table for Profiles (Student & Admin Accounts)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    department TEXT DEFAULT '',
    roll_number TEXT DEFAULT '',
    batch_number TEXT DEFAULT '',
    fb_link TEXT,
    telegram_link TEXT,
    whatsapp_link TEXT,
    profile_completed BOOLEAN DEFAULT false,
    points INT DEFAULT 0,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_activity_date TEXT,
    is_admin BOOLEAN DEFAULT false,
    is_banned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- In case profiles table already exists, add missing columns:
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS roll_number TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS batch_number TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fb_link TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telegram_link TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp_link TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS points INT DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_streak INT DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS longest_streak INT DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_activity_date TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users Update Own Profile" ON public.profiles;
DROP POLICY IF EXISTS "Users and Admins Update Profile" ON public.profiles;
DROP POLICY IF EXISTS "Users Insert Own Profile" ON public.profiles;

CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users Update Own Profile" ON public.profiles FOR UPDATE USING (
    auth.uid() = id OR 
    (auth.jwt() ->> 'email') ILIKE 'mdsohanali636@gmail.com'
);
CREATE POLICY "Users Insert Own Profile" ON public.profiles FOR INSERT WITH CHECK (
    auth.uid() = id OR 
    (auth.jwt() ->> 'email') ILIKE 'mdsohanali636@gmail.com'
);

-- 1b. Table for Banned Users (Guarantees ban persistence across all devices & sessions)
CREATE TABLE IF NOT EXISTS public.banned_users (
    user_id TEXT PRIMARY KEY,
    email TEXT,
    banned_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.banned_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Banned Users" ON public.banned_users;
DROP POLICY IF EXISTS "Anyone Manage Banned Users" ON public.banned_users;
CREATE POLICY "Public Read Banned Users" ON public.banned_users FOR SELECT USING (true);
CREATE POLICY "Anyone Manage Banned Users" ON public.banned_users FOR ALL USING (true);

-- 1c. RPC Security Definer Function to Ban/Unban instantly
CREATE OR REPLACE FUNCTION public.toggle_user_ban(target_user_id UUID, ban_status BOOLEAN)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET is_banned = ban_status, updated_at = now()
  WHERE id = target_user_id;

  IF ban_status THEN
    INSERT INTO public.banned_users (user_id, banned_at)
    VALUES (target_user_id::text, now())
    ON CONFLICT (user_id) DO NOTHING;
  ELSE
    DELETE FROM public.banned_users WHERE user_id = target_user_id::text;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Table for Field / Categories
CREATE TABLE IF NOT EXISTS public.fields (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '💻',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for Fields
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Fields"
ON public.fields FOR SELECT
USING (true);

CREATE POLICY "Admin Insert Fields"
ON public.fields FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admin Update Fields"
ON public.fields FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admin Delete Fields"
ON public.fields FOR DELETE
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));


-- 2. Table for Centralized Skills
CREATE TABLE IF NOT EXISTS public.skills (
    id TEXT PRIMARY KEY,
    field_id TEXT REFERENCES public.fields(id) ON DELETE RESTRICT,
    field_ids TEXT[] DEFAULT '{}',
    name TEXT NOT NULL,
    description TEXT,
    order_index INT DEFAULT 1,
    icon TEXT DEFAULT '★',
    bg_color TEXT DEFAULT '#6c5ce7',
    difficulty TEXT DEFAULT 'Beginner',
    avg_days TEXT DEFAULT '3 days',
    learner_count INT DEFAULT 0,
    step_count INT DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure multi-field column exists if table was previously created
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS field_ids TEXT[] DEFAULT '{}';

-- Index for skill category lookup
CREATE INDEX IF NOT EXISTS idx_skills_field_id ON public.skills (field_id);

-- Enable RLS for Skills
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Skills"
ON public.skills FOR SELECT
USING (true);

CREATE POLICY "Admin Insert Skills"
ON public.skills FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admin Update Skills"
ON public.skills FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admin Delete Skills"
ON public.skills FOR DELETE
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));


-- 3. Table for Roadmap Curriculum Steps
CREATE TABLE IF NOT EXISTS public.roadmap_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id TEXT NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    step_order INT DEFAULT 1,
    resource_link TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_roadmap_steps_skill_id ON public.roadmap_steps (skill_id);

ALTER TABLE public.roadmap_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Roadmap Steps"
ON public.roadmap_steps FOR SELECT
USING (true);

CREATE POLICY "Admin All Roadmap Steps"
ON public.roadmap_steps FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');


-- 4. Table for Official Documentation & Learning References
CREATE TABLE IF NOT EXISTS public.skill_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id TEXT NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('document', 'reference')),
    format TEXT NOT NULL DEFAULT 'link' CHECK (format IN ('pdf', 'drive', 'link', 'youtube', 'github', 'article')),
    url TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_skill_resources_skill_id ON public.skill_resources (skill_id);

ALTER TABLE public.skill_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Skill Resources"
ON public.skill_resources FOR SELECT
USING (true);

CREATE POLICY "Admin All Skill Resources"
ON public.skill_resources FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');


-- 5. Storage Bucket Setup for PDF Direct Uploads:
-- Go to Supabase Dashboard -> Storage -> Create new bucket:
-- Bucket Name: "skill-materials"
-- Public Bucket: ON (Checked)
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#141726] rounded-2xl p-5 sm:p-7 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-200 dark:border-[#23273e]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 text-[#8a8ca3] hover:text-[#1a1c2e] dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#1e2238] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-black">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#1a1c2e] dark:text-white">
              Supabase SQL Schema Script
            </h3>
            <p className="text-xs text-[#8a8ca3] dark:text-slate-400">
              Copy &amp; run this SQL in your Supabase SQL Editor to support persistent Roadmaps &amp; Resources.
            </p>
          </div>
        </div>

        <div className="my-4 relative">
          <div className="absolute top-3 right-3 z-10">
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer ${
                copied ? 'bg-emerald-600 text-white' : 'bg-[#6c5ce7] hover:bg-[#5848c2] text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy SQL Code</span>
                </>
              )}
            </button>
          </div>
          <pre className="bg-[#101321] text-slate-100 font-mono text-xs p-4 rounded-xl border border-slate-200 dark:border-[#23273e] overflow-x-auto max-h-[380px] leading-relaxed select-all">
            {sqlCode}
          </pre>
        </div>

        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
          <span className="font-bold text-amber-700 dark:text-amber-300 mt-0.5">ℹ️ Storage Note:</span>
          <div>
            For direct PDF uploads to work smoothly with Supabase Storage, make sure to create a Public bucket named <b>"skill-materials"</b> in your Supabase project under <b>Storage &gt; New Bucket</b>.
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 dark:bg-[#1e2238] hover:bg-slate-200 dark:hover:bg-[#282e4b] text-[#1a1c2e] dark:text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemTitle?: string;
  confirmLabel?: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemTitle,
  confirmLabel = 'Delete'
}) => {
  if (!isOpen) return null;
  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white dark:bg-[#141726] rounded-2xl p-5 sm:p-7 max-w-md w-full shadow-2xl relative border border-slate-200 dark:border-[#23273e] animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8a8ca3] hover:text-[#1a1c2e] dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#1e2238] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#1a1c2e] dark:text-white">{title}</h3>
            {itemTitle && <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold truncate max-w-xs">{itemTitle}</p>}
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#5a5c73] dark:text-slate-300 mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-slate-100 dark:bg-[#1e2238] hover:bg-slate-200 dark:hover:bg-[#282e4b] text-[#1a1c2e] dark:text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Trash2 className="w-4 h-4" />
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

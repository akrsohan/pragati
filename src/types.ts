export type PageType = 
  | 'login' 
  | 'signup' 
  | 'profile-setup' 
  | 'discover' 
  | 'roadmap' 
  | 'dashboard' 
  | 'leaderboard' 
  | 'profile' 
  | 'admin';

export interface Profile {
  id: string;
  email?: string;
  full_name: string;
  avatar_url?: string;
  department: string;
  roll_number: string;
  batch_number: string;
  fb_link?: string;
  telegram_link?: string;
  whatsapp_link?: string;
  profile_completed: boolean;
  points: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date?: string;
  is_admin: boolean;
  is_banned: boolean;
  created_at?: string;
}

export interface Field {
  id: string;
  name: string;
  description: string;
  icon: string;
  color?: string;
}

export interface Skill {
  id: string;
  field_id?: string | null;
  field_ids?: string[]; // Multiple categories / fields support
  name: string;
  description: string;
  order_index: number;
  icon?: string;
  bg_color?: string;
  difficulty?: string;
  avg_days?: string;
  learner_count?: number;
  step_count?: number;
}

/**
 * Returns true if a skill is associated with a given field ID.
 * Supports skills assigned to multiple fields (field_ids) as well as legacy field_id.
 */
export function skillBelongsToField(skill: Skill | undefined | null, fieldId: string): boolean {
  if (!skill) return false;
  if (!fieldId) return true;
  if (skill.field_ids && Array.isArray(skill.field_ids) && skill.field_ids.length > 0) {
    return skill.field_ids.includes(fieldId);
  }
  return skill.field_id === fieldId;
}

/**
 * Returns all field IDs associated with a skill.
 */
export function getSkillFieldIds(skill: Skill | undefined | null): string[] {
  if (!skill) return [];
  if (skill.field_ids && Array.isArray(skill.field_ids) && skill.field_ids.length > 0) {
    return skill.field_ids;
  }
  return skill.field_id ? [skill.field_id] : [];
}

export interface RoadmapStep {
  id: string;
  skill_id: string;
  title: string;
  description: string;
  step_order: number;
  resource_link?: string;
  created_at?: string;
}

export interface SkillResource {
  id: string;
  skill_id: string;
  title: string;
  type: 'document' | 'reference'; // 'document' (PDF, Google Drive, Doc, Page) vs 'reference' (YouTube, Article, GitHub, Website)
  format: 'pdf' | 'drive' | 'link' | 'youtube' | 'github' | 'article';
  url: string;
  description?: string;
  created_at?: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  skill_id: string;
  started_at: string;
  deadline_at: string;
  status: 'in_progress' | 'completed';
  completed_at?: string | null;
  points_awarded: number;
  skill?: Skill;
  steps_completed?: number[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  icon_symbol?: string;
  bg_color?: string;
  criteria_type: string;
  unlocked?: boolean;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
}

export interface FeedbackItem {
  id: string;
  user_id: string;
  user_email: string;
  message: string;
  status: 'unread' | 'read';
  created_at: string;
  updated_at?: string;
}


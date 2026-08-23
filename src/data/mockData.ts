import { Field, Skill, RoadmapStep, Badge, Profile, UserProgress, SkillResource } from '../types';

export const initialFields: Field[] = [
  {
    id: 'field-general',
    name: 'General',
    description: 'Foundational computer science, developer tools, Git, Linux, problem solving and core basics',
    icon: '🎯',
    color: '#6366f1'
  },
  {
    id: 'field-1',
    name: 'Web Development',
    description: 'Frontend, Backend, and Full-Stack modern web technologies',
    icon: '🌐',
    color: '#00b894'
  },
  {
    id: 'field-2',
    name: 'Cyber Security',
    description: 'Ethical hacking, network defense, penetration testing and cryptography',
    icon: '🛡️',
    color: '#e17055'
  },
  {
    id: 'field-3',
    name: 'Software Engineering',
    description: 'Clean architecture, OOP design patterns, CI/CD, and system design',
    icon: '⚙️',
    color: '#6c5ce7'
  },
  {
    id: 'field-4',
    name: 'AI & Data Science',
    description: 'Machine Learning, Deep Learning, Computer Vision and Data Analytics',
    icon: '🤖',
    color: '#0984e3'
  },
  {
    id: 'field-5',
    name: 'Competitive Programming',
    description: 'Data Structures, Algorithms, Problem Solving, and ACM-ICPC tracks',
    icon: '⚡',
    color: '#fdcb6e'
  },
  {
    id: 'field-6',
    name: 'Mobile Development',
    description: 'Android, Flutter, iOS and React Native cross-platform apps',
    icon: '📱',
    color: '#e84393'
  }
];

export const initialSkills: Skill[] = [
  {
    id: 'skill-html',
    field_id: 'field-1',
    name: 'HTML',
    description: 'Building the fundamental semantic structure of web applications',
    order_index: 1,
    icon: 'H',
    bg_color: '#e84393',
    difficulty: 'Beginner',
    avg_days: '2 days',
    learner_count: 42,
    step_count: 3
  },
  {
    id: 'skill-css',
    field_id: 'field-1',
    name: 'CSS',
    description: 'Master modern layouts with Flexbox, CSS Grid, animations and responsive design',
    order_index: 2,
    icon: 'C',
    bg_color: '#0984e3',
    difficulty: 'Beginner',
    avg_days: '3 days',
    learner_count: 38,
    step_count: 3
  },
  {
    id: 'skill-js',
    field_id: 'field-1',
    name: 'JavaScript',
    description: 'Core ES6+, asynchronous programming, closures, DOM manipulation and event loop',
    order_index: 3,
    icon: 'JS',
    bg_color: '#fdcb6e',
    difficulty: 'Intermediate',
    avg_days: '5 days',
    learner_count: 56,
    step_count: 4
  },
  {
    id: 'skill-react',
    field_id: 'field-1',
    name: 'React.js',
    description: 'Component architecture, Hooks, Context, performance optimization and state management',
    order_index: 4,
    icon: '⚛️',
    bg_color: '#00cec9',
    difficulty: 'Intermediate',
    avg_days: '6 days',
    learner_count: 49,
    step_count: 4
  },
  {
    id: 'skill-c',
    field_id: 'field-general',
    name: 'C Programming',
    description: 'Pointers, manual memory allocation, structs, linked lists and low-level fundamentals',
    order_index: 5,
    icon: 'C',
    bg_color: '#6c5ce7',
    difficulty: 'Intermediate',
    avg_days: '4 days',
    learner_count: 31,
    step_count: 3
  },
  {
    id: 'skill-python',
    field_id: 'field-4',
    name: 'Python',
    description: 'Data structures, OOP, file handling, automation, scripting and ML fundamentals',
    order_index: 6,
    icon: '🐍',
    bg_color: '#00b894',
    difficulty: 'Beginner',
    avg_days: '4 days',
    learner_count: 64,
    step_count: 3
  },
  {
    id: 'skill-git',
    field_id: 'field-general',
    name: 'Git & GitHub',
    description: 'Version control, branching strategies, merge conflicts, pull requests and collaboration',
    order_index: 7,
    icon: '🐙',
    bg_color: '#e17055',
    difficulty: 'Beginner',
    avg_days: '2 days',
    learner_count: 45,
    step_count: 3
  },
  {
    id: 'skill-sql',
    field_id: 'field-3',
    name: 'SQL & Relational DBs',
    description: 'Schema normalization, complex queries, joins, indexes, ACID transactions and PostgreSQL',
    order_index: 8,
    icon: '🗄️',
    bg_color: '#2d3436',
    difficulty: 'Intermediate',
    avg_days: '4 days',
    learner_count: 33,
    step_count: 3
  }
];

export const initialRoadmapSteps: Record<string, RoadmapStep[]> = {
  'skill-html': [
    {
      id: 'step-html-1',
      skill_id: 'skill-html',
      title: 'Semantic HTML5 Architecture',
      description: 'Master semantic tags (<header>, <nav>, <main>, <article>, <section>, <footer>) for clean document outlines and accessibility.',
      step_order: 1,
      resource_link: 'https://developer.mozilla.org/en-US/docs/Glossary/Semantics'
    },
    {
      id: 'step-html-2',
      skill_id: 'skill-html',
      title: 'Accessible Forms & Validation',
      description: 'Building robust accessible forms with proper labels, fieldsets, ARIA attributes, and HTML5 native constraint validation.',
      step_order: 2,
      resource_link: 'https://developer.mozilla.org/en-US/docs/Learn/Forms'
    },
    {
      id: 'step-html-3',
      skill_id: 'skill-html',
      title: 'SEO Meta Tags & Open Graph',
      description: 'Optimizing page discoverability with title tags, meta descriptions, viewport settings, and social sharing Open Graph tags.',
      step_order: 3,
      resource_link: 'https://ogp.me/'
    }
  ],
  'skill-c': [
    {
      id: 'step-c-1',
      skill_id: 'skill-c',
      title: 'Pointers & Memory Allocation',
      description: 'Deep dive into memory addresses, pointer arithmetic, stack vs heap allocation, malloc, calloc, and free.',
      step_order: 1,
      resource_link: 'https://www.tutorialspoint.com/cprogramming/c_pointers.htm'
    },
    {
      id: 'step-c-2',
      skill_id: 'skill-c',
      title: 'Structures & Linked Lists',
      description: 'Designing custom data types with structs and implementing dynamic singly and doubly linked lists in C.',
      step_order: 2,
      resource_link: 'https://www.geeksforgeeks.org/data-structures/linked-list/'
    },
    {
      id: 'step-c-3',
      skill_id: 'skill-c',
      title: 'File I/O & Preprocessor Directives',
      description: 'Reading and writing binary/text files securely using fopen, fread, fwrite, and utilizing macros.',
      step_order: 3,
      resource_link: 'https://en.cppreference.com/w/c/io'
    }
  ],
  'skill-js': [
    {
      id: 'step-js-1',
      skill_id: 'skill-js',
      title: 'Asynchronous JavaScript & Event Loop',
      description: 'Mastering callbacks, Promises, async/await, call stack, task queue, and microtask queue execution.',
      step_order: 1,
      resource_link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop'
    },
    {
      id: 'step-js-2',
      skill_id: 'skill-js',
      title: 'Closures & Scope Chain',
      description: 'Understanding lexical scoping, closures, IIFE, execution context, and memory management in JS.',
      step_order: 2,
      resource_link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures'
    },
    {
      id: 'step-js-3',
      skill_id: 'skill-js',
      title: 'DOM Manipulation & Event Bubbling',
      description: 'Dynamic element creation, querying, event delegation, bubbling, and capture phases.',
      step_order: 3,
      resource_link: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events'
    },
    {
      id: 'step-js-4',
      skill_id: 'skill-js',
      title: 'ES6+ Features & Modules',
      description: 'Arrow functions, destructuring, spread/rest operators, ES modules (import/export), and optional chaining.',
      step_order: 4,
      resource_link: 'https://javascript.info/es-modern'
    }
  ],
  'skill-css': [
    {
      id: 'step-css-1',
      skill_id: 'skill-css',
      title: 'Flexbox Layout Mastery',
      description: 'Aligning items, flex-direction, wrapping, justification, and building fluid responsive navigation bars.',
      step_order: 1,
      resource_link: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/'
    },
    {
      id: 'step-css-2',
      skill_id: 'skill-css',
      title: 'CSS Grid System',
      description: 'Two-dimensional grid layouts, template areas, auto-fit, auto-fill, and complex dashboard framing.',
      step_order: 2,
      resource_link: 'https://css-tricks.com/snippets/css/complete-guide-grid/'
    },
    {
      id: 'step-css-3',
      skill_id: 'skill-css',
      title: 'Animations & Custom Properties',
      description: 'CSS variables, keyframe animations, transition timing functions, and smooth micro-interactions.',
      step_order: 3,
      resource_link: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations'
    }
  ],
  'skill-python': [
    {
      id: 'step-py-1',
      skill_id: 'skill-python',
      title: 'Pythonic Data Structures & Comprehensions',
      description: 'Mastering lists, dictionaries, sets, tuples, list/dict comprehensions, and generator expressions.',
      step_order: 1,
      resource_link: 'https://docs.python.org/3/tutorial/datastructures.html'
    },
    {
      id: 'step-py-2',
      skill_id: 'skill-python',
      title: 'Object-Oriented Programming in Python',
      description: 'Classes, dunder methods, inheritance, polymorphism, properties, and encapsulation.',
      step_order: 2,
      resource_link: 'https://docs.python.org/3/tutorial/classes.html'
    },
    {
      id: 'step-py-3',
      skill_id: 'skill-python',
      title: 'File Handling & Error Management',
      description: 'Context managers (with statement), try/except/finally blocks, and custom exception handling.',
      step_order: 3,
      resource_link: 'https://docs.python.org/3/tutorial/errors.html'
    }
  ],
  'skill-react': [
    {
      id: 'step-react-1',
      skill_id: 'skill-react',
      title: 'React Hooks Deep Dive',
      description: 'useState, useEffect, useContext, useMemo, useCallback, and custom hook creation.',
      step_order: 1,
      resource_link: 'https://react.dev/reference/react'
    },
    {
      id: 'step-react-2',
      skill_id: 'skill-react',
      title: 'State Architecture & lifting',
      description: 'Managing complex application state, immutability, prop drilling solutions, and Context API.',
      step_order: 2,
      resource_link: 'https://react.dev/learn/managing-state'
    },
    {
      id: 'step-react-3',
      skill_id: 'skill-react',
      title: 'Component Lifecycle & Performance',
      description: 'Avoiding unnecessary re-renders with React.memo, virtualization, and lazy loading.',
      step_order: 3,
      resource_link: 'https://react.dev/reference/react/memo'
    },
    {
      id: 'step-react-4',
      skill_id: 'skill-react',
      title: 'Side Effects & API Integration',
      description: 'Fetching data with async/await inside useEffect, handling loading/error states, and cleanup functions.',
      step_order: 4,
      resource_link: 'https://react.dev/learn/synchronizing-with-effects'
    }
  ],
  'skill-git': [
    {
      id: 'step-git-1',
      skill_id: 'skill-git',
      title: 'Core Git Commands & Staging',
      description: 'git init, add, commit, status, log, diff, gitignore configuration, and git stash.',
      step_order: 1,
      resource_link: 'https://git-scm.com/doc'
    },
    {
      id: 'step-git-2',
      skill_id: 'skill-git',
      title: 'Branching & Merge Conflicts',
      description: 'Creating branches, switching, merging, rebasing, and resolving merge conflicts cleanly.',
      step_order: 2,
      resource_link: 'https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell'
    },
    {
      id: 'step-git-3',
      skill_id: 'skill-git',
      title: 'GitHub Collaboration & PRs',
      description: 'Forking, pulling requests, code reviews, issues, tags, and release management.',
      step_order: 3,
      resource_link: 'https://docs.github.com/en/get-started'
    }
  ],
  'skill-linux': [
    {
      id: 'step-lx-1',
      skill_id: 'skill-linux',
      title: 'Terminal Navigation & File System',
      description: 'Directory hierarchy, navigation (cd, ls, pwd), file creation and editing (mkdir, touch, nano, vim, cat, grep).',
      step_order: 1,
      resource_link: 'https://ubuntu.com/tutorials/command-line-for-beginners'
    },
    {
      id: 'step-lx-2',
      skill_id: 'skill-linux',
      title: 'Permissions & User Management',
      description: 'chmod, chown, file permissions (rwx/octal), sudo privileges, user groups, and SSH remote key login.',
      step_order: 2,
      resource_link: 'https://www.linux.com/training-tutorials/understanding-linux-file-permissions/'
    },
    {
      id: 'step-lx-3',
      skill_id: 'skill-linux',
      title: 'Bash Scripting & Process Control',
      description: 'Pipes, redirection, environment variables, cron jobs, background processes (ps, top, kill, systemctl), and shell scripts.',
      step_order: 3,
      resource_link: 'https://www.gnu.org/software/bash/manual/'
    }
  ],
  'skill-sql': [
    {
      id: 'step-sql-1',
      skill_id: 'skill-sql',
      title: 'Relational Schema Design & DDL',
      description: 'Primary keys, foreign keys, constraints (UNIQUE, NOT NULL), CREATE/ALTER tables, and normalization.',
      step_order: 1,
      resource_link: 'https://www.postgresql.org/docs/current/ddl.html'
    },
    {
      id: 'step-sql-2',
      skill_id: 'skill-sql',
      title: 'Advanced Joins & Aggregations',
      description: 'INNER JOIN, LEFT/RIGHT/FULL OUTER JOIN, GROUP BY, HAVING, and aggregate functions.',
      step_order: 2,
      resource_link: 'https://www.postgresql.org/docs/current/queries-table-expressions.html'
    },
    {
      id: 'step-sql-3',
      skill_id: 'skill-sql',
      title: 'Indexing & Query Performance',
      description: 'B-Tree indexes, EXPLAIN ANALYZE, query optimization, and transaction management (ACID).',
      step_order: 3,
      resource_link: 'https://www.postgresql.org/docs/current/indexes.html'
    }
  ]
};

export const initialBadges: Badge[] = [
  {
    id: 'badge-novice',
    name: 'First Step',
    description: 'Complete your first skill roadmap challenge',
    icon_symbol: '🌱',
    bg_color: '#00b894',
    criteria_type: 'first_challenge',
    unlocked: true
  },
  {
    id: 'badge-streak-5',
    name: 'Consistency Star',
    description: 'Maintain a 5-day active learning streak',
    icon_symbol: '🔥',
    bg_color: '#e17055',
    criteria_type: 'streak_5',
    unlocked: false
  },
  {
    id: 'badge-master-3',
    name: 'Track Master',
    description: 'Successfully complete 3 skill roadmaps',
    icon_symbol: '🏆',
    bg_color: '#fdcb6e',
    criteria_type: 'completions_3',
    unlocked: false
  },
  {
    id: 'badge-elite',
    name: 'DIU Elite Coder',
    description: 'Earn 300+ total challenge points',
    icon_symbol: '⚡',
    bg_color: '#37f0ff',
    criteria_type: 'points_300',
    unlocked: false
  }
];

export const ADMIN_EMAIL = 'mdsohanali636@gmail.com';

export const initialProfiles: Profile[] = [];

export const initialCompletedSkills: Record<string, { skillName: string; icon: string; bg: string; duration: string; completedAt: string }[]> = {};

export const initialActiveProgress: UserProgress | null = null;

export const initialSkillResources: Record<string, SkillResource[]> = {
  'skill-html': [
    {
      id: 'res-html-1',
      skill_id: 'skill-html',
      title: 'MDN Web Docs — HTML: HyperText Markup Language',
      type: 'document',
      format: 'link',
      url: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
      description: 'Official Mozilla Developer Network specification, elements index, and semantic guide.'
    },
    {
      id: 'res-html-2',
      skill_id: 'skill-html',
      title: 'HTML5 Semantic Elements & Forms CheatSheet (PDF / Drive)',
      type: 'document',
      format: 'drive',
      url: 'https://drive.google.com/drive/folders/html5-cheat-sheets',
      description: 'Comprehensive quick reference PDF sheet covering all modern tags, ARIA attributes, and inputs.'
    },
    {
      id: 'res-html-3',
      skill_id: 'skill-html',
      title: 'Traversy Media — HTML Crash Course For Beginners',
      type: 'reference',
      format: 'youtube',
      url: 'https://www.youtube.com/watch?v=UB1O30fR-EE',
      description: 'Complete hands-on beginner crash course building semantic web pages from scratch.'
    },
    {
      id: 'res-html-4',
      skill_id: 'skill-html',
      title: 'W3C HTML5 Official Living Standard',
      type: 'reference',
      format: 'article',
      url: 'https://html.spec.whatwg.org/multipage/',
      description: 'The definitive living standard and best practice documentation for web developers.'
    }
  ],
  'skill-css': [
    {
      id: 'res-css-1',
      skill_id: 'skill-css',
      title: 'MDN CSS Reference & Styling Guide',
      type: 'document',
      format: 'link',
      url: 'https://developer.mozilla.org/en-US/docs/Web/CSS',
      description: 'Complete documentation for CSS selectors, box model, Flexbox, Grid, and animations.'
    },
    {
      id: 'res-css-2',
      skill_id: 'skill-css',
      title: 'CSS Flexbox & Grid Master Visual Guide (PDF)',
      type: 'document',
      format: 'pdf',
      url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/',
      description: 'Visual diagram breakdown of Flexbox and Grid container and child properties.'
    },
    {
      id: 'res-css-3',
      skill_id: 'skill-css',
      title: 'FreeCodeCamp — CSS Tutorial - Zero to Hero',
      type: 'reference',
      format: 'youtube',
      url: 'https://www.youtube.com/watch?v=1Rs2ND1ryYc',
      description: 'Full modern CSS course including responsive design, variables, and animations.'
    }
  ],
  'skill-js': [
    {
      id: 'res-js-1',
      skill_id: 'skill-js',
      title: 'JavaScript.info — The Modern JavaScript Tutorial',
      type: 'document',
      format: 'link',
      url: 'https://javascript.info/',
      description: 'From the basics to advanced topics with simple, but detailed explanations.'
    },
    {
      id: 'res-js-2',
      skill_id: 'skill-js',
      title: 'JavaScript ES6+ Cheat Sheet & Handbook (PDF)',
      type: 'document',
      format: 'drive',
      url: 'https://drive.google.com/drive/folders/js-modern-handbook',
      description: 'Quick reference guide for closures, Promises, async/await, and array methods.'
    },
    {
      id: 'res-js-3',
      skill_id: 'skill-js',
      title: 'Fireship — JavaScript in 100 Seconds',
      type: 'reference',
      format: 'youtube',
      url: 'https://www.youtube.com/watch?v=DHjqpvDnNGE',
      description: 'Fast-paced overview of the language, runtime environment, and ecosystem.'
    }
  ],
  'skill-react': [
    {
      id: 'res-react-1',
      skill_id: 'skill-react',
      title: 'React Official Documentation (react.dev)',
      type: 'document',
      format: 'link',
      url: 'https://react.dev',
      description: 'The new official React documentation with interactive code sandboxes.'
    },
    {
      id: 'res-react-2',
      skill_id: 'skill-react',
      title: 'Web Dev Simplified — Learn React in 30 Minutes',
      type: 'reference',
      format: 'youtube',
      url: 'https://www.youtube.com/watch?v=hQAHSlTtcmY',
      description: 'Quick starter guide covering state, props, JSX, and functional components.'
    }
  ]
};

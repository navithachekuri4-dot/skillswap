require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const SkillOffer = require('./models/SkillOffer');
const SkillRequest = require('./models/SkillRequest');
const Proposal = require('./models/Proposal');
const Session = require('./models/Session');
const Review = require('./models/Review');

const DEMO_STUDENTS = [
  {
    name: 'Priya Sharma',
    email: 'priya@demo.com',
    password: 'password123',
    college: 'IIT Bombay',
    year: '3rd Year',
    bio: 'CS student passionate about modern web tech, React, and Python scripting. Love collaborating and peer learning!',
    skillsOffered: [
      { name: 'React.js', category: 'Programming', level: 'Advanced', description: 'Modern React with hooks, component design, state management, and real-world project building.' },
      { name: 'Python', category: 'Programming', level: 'Expert', description: 'Scripting, automation, data wrangling, and introductory backend development.' }
    ],
    skillsNeeded: [
      { name: 'Graphic Design', category: 'Design', level: 'Beginner' },
      { name: 'Acoustic Guitar', category: 'Music', level: 'Beginner' }
    ],
    availability: { weekdays: true, weekends: false, mornings: false, afternoons: true, evenings: true },
    isDemo: true,
    offers: [
      {
        title: 'Modern React.js & Web Development',
        category: 'Programming',
        level: 'Advanced',
        description: 'Comprehensive React coaching covering functional components, custom hooks, state management, and project setup. Perfect for students building semester projects.',
        tags: ['react', 'javascript', 'frontend', 'web dev'],
        sessionDuration: 60,
        preferredMode: 'Online'
      },
      {
        title: 'Python for Beginners & Automation',
        category: 'Programming',
        level: 'Expert',
        description: 'Hands-on Python tutoring: syntax, control flow, functions, file I/O, and writing handy automation scripts.',
        tags: ['python', 'automation', 'programming', 'basics'],
        sessionDuration: 60,
        preferredMode: 'Both'
      }
    ],
    requests: [
      {
        title: 'Looking for Graphic Design & Figma fundamentals',
        category: 'Design',
        currentLevel: 'Beginner',
        description: 'Need help understanding color palettes, typography, and wireframing in Figma for my web projects. Happy to exchange React/Python lessons!',
        urgency: 'Medium'
      }
    ]
  },
  {
    name: 'Arjun Mehta',
    email: 'arjun@demo.com',
    password: 'password123',
    college: 'BITS Pilani',
    year: '2nd Year',
    bio: 'UI/UX enthusiast and digital product designer. Focused on user research, responsive layouts, and design systems.',
    skillsOffered: [
      { name: 'Figma Design', category: 'Design', level: 'Advanced', description: 'End-to-end Figma workflows: autolayout, components, design tokens, and interactive prototyping.' },
      { name: 'UI/UX Research', category: 'Design', level: 'Intermediate', description: 'User personas, journey mapping, wireframing, and usability testing.' }
    ],
    skillsNeeded: [
      { name: 'Python', category: 'Programming', level: 'Beginner' },
      { name: 'Data Science', category: 'Science', level: 'Beginner' }
    ],
    availability: { weekdays: false, weekends: true, mornings: true, afternoons: true, evenings: false },
    isDemo: true,
    offers: [
      {
        title: 'Interactive UI/UX Prototyping with Figma',
        category: 'Design',
        level: 'Advanced',
        description: 'Learn modern Figma techniques: responsive auto-layout, nested components, interactive prototyping, and handoff for developers.',
        tags: ['figma', 'ui', 'ux', 'prototyping', 'design'],
        sessionDuration: 60,
        preferredMode: 'Online'
      }
    ],
    requests: [
      {
        title: 'Want to learn Python for data analysis',
        category: 'Programming',
        currentLevel: 'Beginner',
        description: 'Eager to learn Python basics and pandas to analyze survey datasets and research findings.',
        urgency: 'High'
      }
    ]
  },
  {
    name: 'Sneha Reddy',
    email: 'sneha@demo.com',
    password: 'password123',
    college: 'NIT Hyderabad',
    year: '4th Year',
    bio: 'Competitive programmer and DSA mentor. Solved 600+ problems across LeetCode and Codeforces. Helping peers crack technical interviews.',
    skillsOffered: [
      { name: 'Data Structures & Algorithms', category: 'Programming', level: 'Expert', description: 'Mastering trees, graphs, dynamic programming, two pointers, and complexity analysis.' },
      { name: 'Competitive Programming', category: 'Programming', level: 'Expert', description: 'Problem-solving speed, edge case handling, and contest strategies.' }
    ],
    skillsNeeded: [
      { name: 'Spanish', category: 'Language', level: 'Beginner' },
      { name: 'Digital Photography', category: 'Photography', level: 'Beginner' }
    ],
    availability: { weekdays: true, weekends: true, mornings: false, afternoons: false, evenings: true },
    isDemo: true,
    offers: [
      {
        title: 'DSA & Coding Interview Preparation (C++/Java/Python)',
        category: 'Programming',
        level: 'Expert',
        description: 'Structured walk-through of high-frequency interview patterns: binary search, graph traversals (BFS/DFS), and dynamic programming.',
        tags: ['dsa', 'algorithms', 'leetcode', 'interviews', 'coding'],
        sessionDuration: 90,
        preferredMode: 'Online'
      }
    ],
    requests: [
      {
        title: 'Looking for Spanish conversational practice',
        category: 'Language',
        currentLevel: 'Beginner',
        description: 'Planning for exchange studies in Spain. Want to practice conversational Spanish from scratch.',
        urgency: 'Medium'
      }
    ]
  },
  {
    name: 'Rahul Gupta',
    email: 'rahul@demo.com',
    password: 'password123',
    college: 'Delhi University',
    year: '1st Year',
    bio: 'Acoustic guitar player of 5 years and multilingual enthusiast. Excited to teach music chords and learn coding tools.',
    skillsOffered: [
      { name: 'Acoustic Guitar', category: 'Music', level: 'Advanced', description: 'Acoustic guitar fundamentals, essential chords, strumming rhythms, fingerpicking, and song practice.' },
      { name: 'French Language', category: 'Language', level: 'Intermediate', description: 'Pronunciation, daily conversational vocabulary, and basic French grammar.' }
    ],
    skillsNeeded: [
      { name: 'React.js', category: 'Programming', level: 'Beginner' },
      { name: 'Financial Accounting', category: 'Business', level: 'Beginner' }
    ],
    availability: { weekdays: false, weekends: true, mornings: false, afternoons: true, evenings: true },
    isDemo: true,
    offers: [
      {
        title: 'Acoustic Guitar for Beginners: From Zero to Your First Song',
        category: 'Music',
        level: 'Advanced',
        description: 'Learn open chords (C, G, D, Em, Am), smooth finger transitions, rhythmic strumming patterns, and your favorite pop songs in friendly 1-on-1 sessions.',
        tags: ['guitar', 'music', 'acoustic', 'chords', 'beginner'],
        sessionDuration: 45,
        preferredMode: 'Both'
      }
    ],
    requests: [
      {
        title: 'Need a patient tutor for React.js basics',
        category: 'Programming',
        currentLevel: 'Beginner',
        description: 'Want to build my personal music portfolio site with React. Need help understanding props, state, and component structure.',
        urgency: 'High'
      }
    ]
  },
  {
    name: 'Kavya Nair',
    email: 'kavya@demo.com',
    password: 'password123',
    college: 'VIT Vellore',
    year: 'Postgraduate',
    bio: 'MBA candidate specializing in marketing analytics and brand growth. Practical experience in SEO, copywriting, and growth marketing.',
    skillsOffered: [
      { name: 'Digital Marketing', category: 'Business', level: 'Expert', description: 'Organic SEO, content distribution, paid ad funnels, and marketing metrics.' },
      { name: 'Content Writing', category: 'Writing', level: 'Advanced', description: 'Engaging storytelling, article writing, and professional communication.' }
    ],
    skillsNeeded: [
      { name: 'Data Visualization', category: 'Programming', level: 'Intermediate' },
      { name: 'Machine Learning', category: 'Science', level: 'Beginner' }
    ],
    availability: { weekdays: true, weekends: false, mornings: true, afternoons: true, evenings: false },
    isDemo: true,
    offers: [
      {
        title: 'Digital Marketing & Content Strategy Masterclass',
        category: 'Business',
        level: 'Expert',
        description: 'Practical marketing for student clubs, personal projects, or startup ventures. Covers search optimization, audience targeting, and content calendars.',
        tags: ['marketing', 'seo', 'social media', 'growth', 'business'],
        sessionDuration: 60,
        preferredMode: 'Online'
      }
    ],
    requests: [
      {
        title: 'Looking for Data Visualization (Power BI / Tableau / Python)',
        category: 'Programming',
        currentLevel: 'Beginner',
        description: 'Need guidance creating interactive dashboards for business case studies.',
        urgency: 'Medium'
      }
    ]
  },
  {
    name: 'Rohan Verma',
    email: 'rohan@demo.com',
    password: 'password123',
    college: 'IIT Delhi',
    year: '3rd Year',
    bio: 'Machine learning researcher and open-source contributor. Working with PyTorch on natural language and vision architectures.',
    skillsOffered: [
      { name: 'Machine Learning', category: 'Science', level: 'Advanced', description: 'Supervised/unsupervised models, regression, classification, PyTorch fundamentals, and model evaluation.' },
      { name: 'Python', category: 'Programming', level: 'Advanced', description: 'NumPy, Pandas, Scikit-learn, and reproducible Jupyter notebook pipelines.' }
    ],
    skillsNeeded: [
      { name: 'Public Speaking', category: 'Other', level: 'Beginner' },
      { name: 'Figma Design', category: 'Design', level: 'Beginner' }
    ],
    availability: { weekdays: true, weekends: true, mornings: false, afternoons: false, evenings: true },
    isDemo: true,
    offers: [
      {
        title: 'Applied Machine Learning with Python & Scikit-learn',
        category: 'Science',
        level: 'Advanced',
        description: 'Learn real machine learning: data preprocessing, feature engineering, model selection, metrics (Precision, Recall, ROC-AUC), and hands-on projects.',
        tags: ['machine learning', 'python', 'ai', 'data science', 'scikit-learn'],
        sessionDuration: 75,
        preferredMode: 'Online'
      }
    ],
    requests: [
      {
        title: 'Need coaching for Public Speaking & Presentation skills',
        category: 'Other',
        currentLevel: 'Beginner',
        description: 'Presenting a research paper at a student symposium soon and want to improve vocal delivery and slide pitching.',
        urgency: 'High'
      }
    ]
  },
  {
    name: 'Ananya Iyer',
    email: 'ananya@demo.com',
    password: 'password123',
    college: "St. Xavier's College",
    year: '2nd Year',
    bio: 'English literature major, college magazine editor, and published essayist. Love helping peers polish their academic essays and SOPs.',
    skillsOffered: [
      { name: 'Creative Writing', category: 'Writing', level: 'Expert', description: 'Essay drafting, character development, narrative pacing, and proofreading.' },
      { name: 'Academic Proofreading', category: 'Writing', level: 'Advanced', description: 'Refining grammar, style, tone, clarity, and structural coherence in academic papers.' }
    ],
    skillsNeeded: [
      { name: 'React.js', category: 'Programming', level: 'Beginner' },
      { name: 'French Language', category: 'Language', level: 'Beginner' }
    ],
    availability: { weekdays: true, weekends: false, mornings: true, afternoons: true, evenings: false },
    isDemo: true,
    offers: [
      {
        title: 'Effective Writing, SOP Review & Essay Editing',
        category: 'Writing',
        level: 'Expert',
        description: 'Get constructive line-by-line feedback on your scholarship statements of purpose, college essays, technical reports, or creative pieces.',
        tags: ['writing', 'sop', 'editing', 'english', 'grammar'],
        sessionDuration: 60,
        preferredMode: 'Both'
      }
    ],
    requests: [
      {
        title: 'Looking for intro to Web Development (HTML/CSS/JS)',
        category: 'Programming',
        currentLevel: 'Beginner',
        description: 'Want to code a custom minimalist reading blog to showcase student publications.',
        urgency: 'Medium'
      }
    ]
  },
  {
    name: 'Vikram Singh',
    email: 'vikram@demo.com',
    password: 'password123',
    college: 'DTU Delhi',
    year: '4th Year',
    bio: 'Android engineer with multiple applications published on Google Play. Specializes in Kotlin, Jetpack Compose, and clean architecture.',
    skillsOffered: [
      { name: 'Android Development', category: 'Programming', level: 'Advanced', description: 'Native Android apps using Kotlin, Jetpack Compose, MVVM, Room DB, and Retrofit.' },
      { name: 'Kotlin', category: 'Programming', level: 'Advanced', description: 'Modern Kotlin syntax, coroutines, Flow, and functional programming concepts.' }
    ],
    skillsNeeded: [
      { name: 'Calculus & Linear Algebra', category: 'Mathematics', level: 'Intermediate' },
      { name: 'UI/UX Research', category: 'Design', level: 'Beginner' }
    ],
    availability: { weekdays: false, weekends: true, mornings: true, afternoons: false, evenings: true },
    isDemo: true,
    offers: [
      {
        title: 'Android App Development with Kotlin & Jetpack Compose',
        category: 'Programming',
        level: 'Advanced',
        description: 'Build modern Android apps from scratch! Learn state-driven UI with Compose, networking with Retrofit, and preparing your APK for release.',
        tags: ['android', 'kotlin', 'mobile', 'jetpack compose', 'app dev'],
        sessionDuration: 90,
        preferredMode: 'Online'
      }
    ],
    requests: [
      {
        title: 'Need help with Linear Algebra for graphics programming',
        category: 'Mathematics',
        currentLevel: 'Intermediate',
        description: 'Want to understand matrix transformations and vector spaces for 3D graphics rendering.',
        urgency: 'Medium'
      }
    ]
  },
  {
    name: 'Meera Patel',
    email: 'meera@demo.com',
    password: 'password123',
    college: 'NID Ahmedabad',
    year: '3rd Year',
    bio: 'Communication designer passionate about vector illustration, identity design, and typography systems.',
    skillsOffered: [
      { name: 'Graphic Design', category: 'Design', level: 'Expert', description: 'Logo creation, brand guidelines, visual hierarchy, layout composition, and Adobe Illustrator mastery.' },
      { name: 'Adobe Illustrator', category: 'Design', level: 'Expert', description: 'Vector tool, pathfinding, color theory, iconography, and print prep.' }
    ],
    skillsNeeded: [
      { name: 'React.js', category: 'Programming', level: 'Beginner' },
      { name: 'Digital Marketing', category: 'Business', level: 'Beginner' }
    ],
    availability: { weekdays: true, weekends: true, mornings: false, afternoons: true, evenings: true },
    isDemo: true,
    offers: [
      {
        title: 'Brand Identity & Vector Illustration in Illustrator',
        category: 'Design',
        level: 'Expert',
        description: 'Hands-on design sessions: learn pen tool precision, color harmony, typography pairing, and how to create stunning icons and logos for projects.',
        tags: ['graphic design', 'illustrator', 'branding', 'logo', 'design'],
        sessionDuration: 60,
        preferredMode: 'Both'
      }
    ],
    requests: [
      {
        title: 'Want to learn React.js to make interactive portfolio animations',
        category: 'Programming',
        currentLevel: 'Beginner',
        description: 'Looking for a peer to teach me how to connect design components into interactive React web apps.',
        urgency: 'High'
      }
    ]
  },
  {
    name: 'Aditya Joshi',
    email: 'aditya@demo.com',
    password: 'password123',
    college: 'Manipal Institute of Technology',
    year: '2nd Year',
    bio: 'Cybersecurity enthusiast, Linux sysadmin, and CTF player. Passionate about network security, web app auditing, and ethical hacking.',
    skillsOffered: [
      { name: 'Cyber Security', category: 'Science', level: 'Intermediate', description: 'Network scanning, Wireshark packet inspection, OWASP Top 10 vulnerabilities, and basic penetration testing.' },
      { name: 'Linux System Administration', category: 'Programming', level: 'Advanced', description: 'Bash scripting, systemd, SSH hardening, permissions, and command-line mastery.' }
    ],
    skillsNeeded: [
      { name: 'Python', category: 'Programming', level: 'Intermediate' },
      { name: 'Competitive Programming', category: 'Programming', level: 'Beginner' }
    ],
    availability: { weekdays: false, weekends: true, mornings: false, afternoons: true, evenings: true },
    isDemo: true,
    offers: [
      {
        title: 'Linux Command Line Mastery & Practical Cyber Security',
        category: 'Science',
        level: 'Intermediate',
        description: 'Ditch the GUI! Learn essential terminal commands, bash scripts, permissions, network tools, and discovering basic web vulnerabilities in test environments.',
        tags: ['linux', 'cybersecurity', 'security', 'terminal', 'bash'],
        sessionDuration: 60,
        preferredMode: 'Online'
      }
    ],
    requests: [
      {
        title: 'Looking for advanced Python scripting for exploit automation',
        category: 'Programming',
        currentLevel: 'Intermediate',
        description: 'Want to write custom network socket scripts and automated parsers in Python.',
        urgency: 'Medium'
      }
    ]
  },
  {
    name: 'Pooja Deshmukh',
    email: 'pooja@demo.com',
    password: 'password123',
    college: 'Pune University',
    year: 'Postgraduate',
    bio: 'Finance graduate preparing for CFA Level 1. Specialist in financial statements, Excel modeling, and personal budgeting.',
    skillsOffered: [
      { name: 'Financial Accounting', category: 'Business', level: 'Advanced', description: 'Balance sheet, income statement, cash flows, and key financial ratio analysis.' },
      { name: 'Excel & Financial Modeling', category: 'Business', level: 'Expert', description: 'VLOOKUP/XLOOKUP, INDEX-MATCH, Pivot tables, financial formulas, and DCF templates.' }
    ],
    skillsNeeded: [
      { name: 'Python', category: 'Programming', level: 'Beginner' },
      { name: 'Digital Marketing', category: 'Business', level: 'Beginner' }
    ],
    availability: { weekdays: true, weekends: false, mornings: true, afternoons: false, evenings: true },
    isDemo: true,
    offers: [
      {
        title: 'Advanced Microsoft Excel & Financial Modeling',
        category: 'Business',
        level: 'Expert',
        description: 'Master practical Excel shortcuts, complex data analysis with Pivot tables, conditional logic, and building clean financial models for coursework.',
        tags: ['excel', 'finance', 'accounting', 'business', 'modeling'],
        sessionDuration: 60,
        preferredMode: 'Online'
      }
    ],
    requests: [
      {
        title: 'Need guidance learning Python for financial analysis',
        category: 'Programming',
        currentLevel: 'Beginner',
        description: 'Want to automate Excel data imports and run Monte Carlo simulations using Python scripts.',
        urgency: 'Medium'
      }
    ]
  },
  {
    name: 'Tanmay Sen',
    email: 'tanmay@demo.com',
    password: 'password123',
    college: 'Jadavpur University',
    year: '3rd Year',
    bio: 'Language enthusiast and certified B2 Spanish speaker. Love cultural exchange and conversational speaking practice.',
    skillsOffered: [
      { name: 'Spanish', category: 'Language', level: 'Advanced', description: 'Grammar, essential verb tenses (present, past, subjunctive), idioms, and accent training.' },
      { name: 'Conversational French', category: 'Language', level: 'Intermediate', description: 'Casual dialogue, listening comprehension, and travel phrases.' }
    ],
    skillsNeeded: [
      { name: 'Data Structures & Algorithms', category: 'Programming', level: 'Beginner' },
      { name: 'Acoustic Guitar', category: 'Music', level: 'Beginner' }
    ],
    availability: { weekdays: true, weekends: true, mornings: true, afternoons: false, evenings: true },
    isDemo: true,
    offers: [
      {
        title: 'Conversational Spanish: Fluency, Grammar & Accent',
        category: 'Language',
        level: 'Advanced',
        description: 'Fun, immersive Spanish practice tailored to college learners. Build speaking confidence, master irregular conjugations, and enjoy Spanish dialogues.',
        tags: ['spanish', 'language', 'espanol', 'conversation', 'speaking'],
        sessionDuration: 45,
        preferredMode: 'Both'
      }
    ],
    requests: [
      {
        title: 'Looking for a DSA mentor to prepare for software placements',
        category: 'Programming',
        currentLevel: 'Beginner',
        description: 'Non-CS student trying to crack campus software company tests. Need guidance with arrays, strings, and recursion.',
        urgency: 'High'
      }
    ]
  },
  {
    name: 'Ritu Banerjee',
    email: 'ritu@demo.com',
    password: 'password123',
    college: 'Presidency University',
    year: '1st Year',
    bio: 'Campus photojournalist and portrait photographer. Passionate about natural light photography and Lightroom post-processing.',
    skillsOffered: [
      { name: 'Digital Photography', category: 'Photography', level: 'Advanced', description: 'Camera manual mode (aperture, shutter speed, ISO), composition, leading lines, and portraiture.' },
      { name: 'Photo Editing & Lightroom', category: 'Photography', level: 'Advanced', description: 'Color grading, exposure balance, skin retouching, and batch workflow in Adobe Lightroom.' }
    ],
    skillsNeeded: [
      { name: 'Creative Writing', category: 'Writing', level: 'Beginner' },
      { name: 'Graphic Design', category: 'Design', level: 'Beginner' }
    ],
    availability: { weekdays: false, weekends: true, mornings: true, afternoons: true, evenings: false },
    isDemo: true,
    offers: [
      {
        title: 'Manual Photography & Lightroom Color Grading',
        category: 'Photography',
        level: 'Advanced',
        description: 'Unlock the full power of your DSLR or mirrorless camera! Learn exposure triangle balance, composition rules, and professional color grading in Adobe Lightroom.',
        tags: ['photography', 'camera', 'lightroom', 'editing', 'portraits'],
        sessionDuration: 60,
        preferredMode: 'Both'
      }
    ],
    requests: [
      {
        title: 'Seeking Creative Writing mentor for photo captions and storytelling',
        category: 'Writing',
        currentLevel: 'Beginner',
        description: 'Want to pair my photojournalism projects with evocative short essays and student narratives.',
        urgency: 'Low'
      }
    ]
  },
  {
    name: 'Devansh Kulkarni',
    email: 'devansh@demo.com',
    password: 'password123',
    college: 'COEP Pune',
    year: '4th Year',
    bio: 'Engineering physics student who enjoys breaking down tough mathematical ideas into intuitive visual concepts.',
    skillsOffered: [
      { name: 'Calculus & Linear Algebra', category: 'Mathematics', level: 'Advanced', description: 'Multivariable calculus, differential equations, matrices, eigenvalues, and vector calculus.' },
      { name: 'Physics & Mechanics', category: 'Science', level: 'Advanced', description: 'Classical mechanics, thermodynamics, oscillations, and engineering physics problems.' }
    ],
    skillsNeeded: [
      { name: 'Public Speaking', category: 'Other', level: 'Beginner' },
      { name: 'Android Development', category: 'Programming', level: 'Beginner' }
    ],
    availability: { weekdays: true, weekends: true, mornings: false, afternoons: true, evenings: true },
    isDemo: true,
    offers: [
      {
        title: 'College Calculus & Linear Algebra Made Intuitive',
        category: 'Mathematics',
        level: 'Advanced',
        description: 'Struggling with engineering mathematics? We will break down derivatives, double integrals, matrices, and differential equations step-by-step.',
        tags: ['calculus', 'mathematics', 'linear algebra', 'engineering', 'math'],
        sessionDuration: 60,
        preferredMode: 'Online'
      }
    ],
    requests: [
      {
        title: 'Need help with Public Speaking & Stage confidence',
        category: 'Other',
        currentLevel: 'Beginner',
        description: 'Want to get better at speaking up during technical discussions and seminar Q&A.',
        urgency: 'Medium'
      }
    ]
  },
  {
    name: 'Shreya Das',
    email: 'shreya@demo.com',
    password: 'password123',
    college: 'Ashoka University',
    year: '2nd Year',
    bio: 'National collegiate parliamentary debater, MUN head delegate, and communication coach. Passionate about persuasion and rhetoric.',
    skillsOffered: [
      { name: 'Public Speaking', category: 'Other', level: 'Expert', description: 'Structuring arguments, vocal projection, impromptu speaking, debate formats, and conquering stage fright.' },
      { name: 'Critical Thinking', category: 'Other', level: 'Advanced', description: 'Logical fallacies, analytical reasoning, and structured rebuttals.' }
    ],
    skillsNeeded: [
      { name: 'Machine Learning', category: 'Science', level: 'Beginner' },
      { name: 'Data Visualization', category: 'Programming', level: 'Beginner' }
    ],
    availability: { weekdays: true, weekends: true, mornings: true, afternoons: false, evenings: true },
    isDemo: true,
    offers: [
      {
        title: 'Public Speaking, Debating & Confident Pitching',
        category: 'Other',
        level: 'Expert',
        description: 'Overcome anxiety and speak with clarity and impact. Learn persuasive argument structures (PEEL method), body language, and impromptu speaking drills.',
        tags: ['public speaking', 'debate', 'communication', 'presentation', 'confidence'],
        sessionDuration: 60,
        preferredMode: 'Both'
      }
    ],
    requests: [
      {
        title: 'Looking for a patient peer to teach introductory Machine Learning',
        category: 'Science',
        currentLevel: 'Beginner',
        description: 'Eager to understand how modern AI/ML algorithms work without getting lost in mathematical jargon.',
        urgency: 'High'
      }
    ]
  }
];

const seed = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/skillswap';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB:', mongoUri);

    console.log(`🌱 Seeding ${DEMO_STUDENTS.length} demo students...`);

    const userMap = {};

    for (const studentData of DEMO_STUDENTS) {
      const { offers, requests, ...userData } = studentData;

      let user = await User.findOne({ email: userData.email });

      if (user) {
        user.name = userData.name;
        user.college = userData.college;
        user.year = userData.year;
        user.bio = userData.bio;
        user.skillsOffered = userData.skillsOffered;
        user.skillsNeeded = userData.skillsNeeded;
        user.availability = userData.availability;
        user.isDemo = true;
        user.profileComplete = user.calculateProfileComplete();
        await user.save();
      } else {
        const newUser = new User({
          ...userData,
          isDemo: true,
          reputationScore: 0,
          totalReviews: 0,
          completedSessions: 0
        });
        newUser.profileComplete = newUser.calculateProfileComplete();
        user = await newUser.save();
      }

      userMap[user.email] = user;

      // Clean and re-seed offers & requests for this user
      await SkillOffer.deleteMany({ user: user._id });
      await SkillRequest.deleteMany({ user: user._id });

      if (offers && offers.length > 0) {
        const offersToInsert = offers.map(o => ({ ...o, user: user._id, isActive: true }));
        await SkillOffer.insertMany(offersToInsert);
      }

      if (requests && requests.length > 0) {
        const requestsToInsert = requests.map(r => ({ ...r, user: user._id, isActive: true }));
        await SkillRequest.insertMany(requestsToInsert);
      }
    }

    console.log(`👤 Updated/verified ${Object.keys(userMap).length} demo student accounts`);

    // --- IDEMPOTENT TRANSACTION CLEANUP ---
    // Remove previous demo proposals, sessions, and reviews safely without touching any real user records
    await Proposal.deleteMany({ isDemo: true });
    await Session.deleteMany({ isDemo: true });
    await Review.deleteMany({ isDemo: true });
    console.log('🧹 Cleaned existing synthetic demo proposals, sessions, and reviews');

    const priya = userMap['priya@demo.com'];
    const rahul = userMap['rahul@demo.com'];
    const arjun = userMap['arjun@demo.com'];
    const sneha = userMap['sneha@demo.com'];
    const meera = userMap['meera@demo.com'];
    const kavya = userMap['kavya@demo.com'];
    const rohan = userMap['rohan@demo.com'];
    const shreya = userMap['shreya@demo.com'];
    const tanmay = userMap['tanmay@demo.com'];

    // --- 1. SEED PENDING PROPOSALS ---
    const pendingProposals = [
      {
        sender: rahul._id,
        receiver: priya._id,
        offeredSkill: 'Acoustic Guitar',
        requestedSkill: 'React.js',
        message: 'Hi Priya! I saw your React.js offer. I can teach you acoustic guitar from chords to songs in exchange for learning React frontend basics.',
        preferredTimes: [{ date: new Date(Date.now() + 3 * 86400000), timeSlot: '16:00' }],
        status: 'pending',
        isDemo: true
      },
      {
        sender: sneha._id,
        receiver: priya._id,
        offeredSkill: 'Competitive Programming',
        requestedSkill: 'Python Automation',
        message: 'Hey Priya, would love to do a swap: competitive programming algorithms for your Python automation scripting tips!',
        preferredTimes: [{ date: new Date(Date.now() + 5 * 86400000), timeSlot: '18:00' }],
        status: 'pending',
        isDemo: true
      },
      {
        sender: priya._id,
        receiver: meera._id,
        offeredSkill: 'Python',
        requestedSkill: 'Adobe Illustrator',
        message: 'Hi Meera! I want to design vector illustrations for my web projects. Happy to exchange Python scripting sessions.',
        preferredTimes: [{ date: new Date(Date.now() + 4 * 86400000), timeSlot: '15:00' }],
        status: 'pending',
        isDemo: true
      },
      {
        sender: rohan._id,
        receiver: shreya._id,
        offeredSkill: 'Machine Learning',
        requestedSkill: 'Public Speaking',
        message: 'Hey Shreya! I need help with debate pitching and stage presence for a symposium. Can teach PyTorch & ML fundamentals.',
        preferredTimes: [{ date: new Date(Date.now() + 2 * 86400000), timeSlot: '14:00' }],
        status: 'pending',
        isDemo: true
      },
      {
        sender: arjun._id,
        receiver: kavya._id,
        offeredSkill: 'Figma Design',
        requestedSkill: 'Digital Marketing',
        message: 'Hi Kavya! Want to exchange UI prototyping sessions for digital marketing and SEO strategy.',
        preferredTimes: [{ date: new Date(Date.now() + 6 * 86400000), timeSlot: '17:00' }],
        status: 'pending',
        isDemo: true
      }
    ];

    await Proposal.insertMany(pendingProposals);
    console.log(`📬 Seeded ${pendingProposals.length} pending demo proposals`);

    // --- 2. SEED ACCEPTED PROPOSALS & UPCOMING SESSIONS (FUTURE DATES) ---
    // Priya & Rahul: Upcoming session
    const propUpcoming1 = await Proposal.create({
      sender: rahul._id,
      receiver: priya._id,
      offeredSkill: 'Acoustic Guitar',
      requestedSkill: 'React.js',
      message: 'Excited to learn React hooks and teach acoustic guitar chords!',
      status: 'accepted',
      isDemo: true
    });

    const sessUpcoming1 = await Session.create({
      proposal: propUpcoming1._id,
      participants: [priya._id, rahul._id],
      skill: 'React.js / Acoustic Guitar',
      scheduledAt: new Date(Date.now() + 2 * 86400000 + 4 * 3600000), // 2 days in future
      duration: 60,
      mode: 'Online',
      meetLink: 'https://meet.google.com/swap-react-guitar',
      status: 'upcoming',
      notes: 'Focus on functional components and open chords.',
      isDemo: true
    });

    // Priya & Arjun: Upcoming session
    const propUpcoming2 = await Proposal.create({
      sender: arjun._id,
      receiver: priya._id,
      offeredSkill: 'Figma Prototyping',
      requestedSkill: 'Python Basics',
      message: 'Looking forward to our design-for-code session!',
      status: 'accepted',
      isDemo: true
    });

    const sessUpcoming2 = await Session.create({
      proposal: propUpcoming2._id,
      participants: [priya._id, arjun._id],
      skill: 'Python / Figma Design',
      scheduledAt: new Date(Date.now() + 4 * 86400000 + 2 * 3600000), // 4 days in future
      duration: 60,
      mode: 'Online',
      meetLink: 'https://meet.google.com/swap-python-figma',
      status: 'upcoming',
      notes: 'Interactive components and basic script automation.',
      isDemo: true
    });

    // Sneha & Tanmay: Upcoming session
    const propUpcoming3 = await Proposal.create({
      sender: tanmay._id,
      receiver: sneha._id,
      offeredSkill: 'Spanish Conversation',
      requestedSkill: 'DSA & LeetCode Prep',
      message: 'Spanish dialogue practice in exchange for algorithm tips.',
      status: 'accepted',
      isDemo: true
    });

    await Session.create({
      proposal: propUpcoming3._id,
      participants: [sneha._id, tanmay._id],
      skill: 'DSA / Spanish Conversation',
      scheduledAt: new Date(Date.now() + 3 * 86400000 + 5 * 3600000),
      duration: 90,
      mode: 'Online',
      meetLink: 'https://meet.google.com/swap-dsa-spanish',
      status: 'upcoming',
      isDemo: true
    });

    console.log('📅 Seeded 3 upcoming sessions with future dates');

    // --- 3. SEED COMPLETED SESSIONS (PAST DATES) & SYNTHETIC REVIEWS ---
    // Completed Session A: Priya & Meera (5 days ago)
    const propCompleted1 = await Proposal.create({
      sender: meera._id,
      receiver: priya._id,
      offeredSkill: 'Graphic Design',
      requestedSkill: 'React.js',
      message: 'Completed skill exchange proposal.',
      status: 'completed',
      isDemo: true
    });

    const sessCompleted1 = await Session.create({
      proposal: propCompleted1._id,
      participants: [priya._id, meera._id],
      skill: 'React.js / Graphic Design',
      scheduledAt: new Date(Date.now() - 5 * 86400000),
      duration: 60,
      mode: 'Online',
      status: 'completed',
      completedBy: [priya._id, meera._id],
      isDemo: true
    });

    // Completed Session B: Priya & Sneha (11 days ago)
    const propCompleted2 = await Proposal.create({
      sender: priya._id,
      receiver: sneha._id,
      offeredSkill: 'Python Automation',
      requestedSkill: 'DSA Interview Prep',
      message: 'Completed session exchange proposal.',
      status: 'completed',
      isDemo: true
    });

    const sessCompleted2 = await Session.create({
      proposal: propCompleted2._id,
      participants: [priya._id, sneha._id],
      skill: 'Python / DSA Interview Prep',
      scheduledAt: new Date(Date.now() - 11 * 86400000),
      duration: 90,
      mode: 'Online',
      status: 'completed',
      completedBy: [priya._id, sneha._id],
      isDemo: true
    });

    // Completed Session C: Rahul & Sneha (14 days ago)
    const propCompleted3 = await Proposal.create({
      sender: rahul._id,
      receiver: sneha._id,
      offeredSkill: 'French Language',
      requestedSkill: 'Algorithms',
      message: 'Completed French exchange.',
      status: 'completed',
      isDemo: true
    });

    const sessCompleted3 = await Session.create({
      proposal: propCompleted3._id,
      participants: [rahul._id, sneha._id],
      skill: 'French / Algorithms',
      scheduledAt: new Date(Date.now() - 14 * 86400000),
      duration: 60,
      mode: 'Online',
      status: 'completed',
      completedBy: [rahul._id, sneha._id],
      isDemo: true
    });

    console.log('✅ Seeded 3 completed past sessions');

    // --- 4. SEED SYNTHETIC REVIEWS (CLEARLY MARKED WITH isDemo: true) ---
    const reviews = [
      {
        session: sessCompleted1._id,
        reviewer: meera._id,
        reviewee: priya._id,
        rating: 5,
        feedback: 'Priya was an exceptional tutor! She explained React hooks and state management clearly with practical examples. Highly recommended.',
        skillReviewed: 'React.js',
        tags: ['Patient', 'Clear Explanation', 'Helpful'],
        isDemo: true
      },
      {
        session: sessCompleted2._id,
        reviewer: sneha._id,
        reviewee: priya._id,
        rating: 5,
        feedback: 'Super insightful session on Python data automation. Very well prepared and answered all questions thoroughly.',
        skillReviewed: 'Python',
        tags: ['Knowledgeable', 'Well Prepared', 'Friendly'],
        isDemo: true
      },
      {
        session: sessCompleted1._id,
        reviewer: priya._id,
        reviewee: meera._id,
        rating: 5,
        feedback: 'Meera is fantastic with design tools. She helped me create crisp vector icons and understand visual balance.',
        skillReviewed: 'Graphic Design',
        tags: ['Knowledgeable', 'Helpful'],
        isDemo: true
      },
      {
        session: sessCompleted2._id,
        reviewer: priya._id,
        reviewee: sneha._id,
        rating: 5,
        feedback: 'Sneha made graph algorithms and binary search so intuitive! Amazing mentor.',
        skillReviewed: 'DSA Interview Prep',
        tags: ['Clear Explanation', 'Patient'],
        isDemo: true
      },
      {
        session: sessCompleted3._id,
        reviewer: sneha._id,
        reviewee: rahul._id,
        rating: 5,
        feedback: 'Great conversational French practice! Very encouraging and patient with pronunciation.',
        skillReviewed: 'French Language',
        tags: ['Patient', 'Friendly'],
        isDemo: true
      }
    ];

    await Review.insertMany(reviews);
    console.log(`⭐ Seeded ${reviews.length} synthetic demo reviews (isDemo: true)`);

    // --- 5. RECALCULATE DEMO STUDENT STATS IN MONGODB ---
    // Dynamically derive each demo user's reputation score, review count, and completed sessions from DB
    for (const email of Object.keys(userMap)) {
      const u = userMap[email];
      const completedCount = await Session.countDocuments({
        participants: u._id,
        status: 'completed'
      });
      const userReviews = await Review.find({ reviewee: u._id });

      let score = 0;
      if (userReviews.length > 0) {
        const sum = userReviews.reduce((acc, r) => acc + r.rating, 0);
        score = Math.round((sum / userReviews.length) * 10) / 10;
      }

      u.completedSessions = completedCount;
      u.totalReviews = userReviews.length;
      u.reputationScore = score;

      // Seed informative demo notifications for Priya
      if (email === 'priya@demo.com') {
        u.notifications = [
          {
            message: `${rahul.name} sent you a skill exchange proposal for "React.js"`,
            type: 'proposal',
            link: '/proposals',
            read: false,
            createdAt: new Date(Date.now() - 3600000)
          },
          {
            message: `Upcoming session with ${rahul.name} is scheduled for ${new Date(Date.now() + 2 * 86400000).toLocaleDateString()}`,
            type: 'session',
            link: `/sessions/${sessUpcoming1._id}`,
            read: false,
            createdAt: new Date(Date.now() - 7200000)
          },
          {
            message: `${meera.name} left you a 5-star review for "React.js"!`,
            type: 'review',
            link: `/profile/${priya._id}`,
            read: true,
            createdAt: new Date(Date.now() - 5 * 86400000)
          }
        ];
      }

      await u.save();
    }

    console.log('\n🎉 Complete synthetic demo lifecycle seeded successfully!');
    console.log('📊 Verified Priya Sharma demo dashboard stats:');
    const priyaCheck = await User.findOne({ email: 'priya@demo.com' });
    const priyaUpcoming = await Session.countDocuments({ participants: priyaCheck._id, status: { $in: ['upcoming', 'rescheduled'] } });
    const priyaProposals = await Proposal.countDocuments({ receiver: priyaCheck._id, status: 'pending' });
    console.log(`   - Upcoming Sessions: ${priyaUpcoming}`);
    console.log(`   - Pending Proposals Received: ${priyaProposals}`);
    console.log(`   - Completed Sessions: ${priyaCheck.completedSessions}`);
    console.log(`   - Reputation Score: ${priyaCheck.reputationScore}★ (From ${priyaCheck.totalReviews} reviews)`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed with error:', err);
    process.exit(1);
  }
};

seed();

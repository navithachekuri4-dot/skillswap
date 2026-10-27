const User = require('../models/User');
const SkillOffer = require('../models/SkillOffer');
const SkillRequest = require('../models/SkillRequest');
const Proposal = require('../models/Proposal');
const Session = require('../models/Session');
const Review = require('../models/Review');
const bcrypt = require('bcryptjs');

const DEMO_EMAIL = process.env.DEMO_USER_EMAIL || 'demo.navitha@skillswap.edu';

// Minimal peer profiles needed for Navitha's demo data.
// These are created/updated on every demo login so the seeder
// is fully self-contained and works even when seed.js was never run.
const PEER_PROFILES = [
  {
    email: 'priya@demo.com',
    name: 'Priya Sharma',
    college: 'IIT Bombay',
    year: '3rd Year',
    bio: 'CS student passionate about modern web tech, React, and Python.',
    skillsOffered: [
      { name: 'React.js', category: 'Programming', level: 'Advanced', description: 'Modern React with hooks and state management.' },
      { name: 'Python', category: 'Programming', level: 'Expert', description: 'Scripting, automation, and backend development.' }
    ],
    skillsNeeded: [
      { name: 'Graphic Design', category: 'Design', level: 'Beginner' }
    ],
    availability: { weekdays: true, weekends: false, mornings: false, afternoons: true, evenings: true }
  },
  {
    email: 'arjun@demo.com',
    name: 'Arjun Mehta',
    college: 'BITS Pilani',
    year: '2nd Year',
    bio: 'UI/UX enthusiast and digital product designer.',
    skillsOffered: [
      { name: 'Figma Design', category: 'Design', level: 'Advanced', description: 'End-to-end Figma workflows and interactive prototyping.' }
    ],
    skillsNeeded: [
      { name: 'JavaScript', category: 'Programming', level: 'Beginner' }
    ],
    availability: { weekdays: false, weekends: true, mornings: true, afternoons: true, evenings: false }
  },
  {
    email: 'sneha@demo.com',
    name: 'Sneha Reddy',
    college: 'NIT Hyderabad',
    year: '4th Year',
    bio: 'Competitive programmer and DSA mentor.',
    skillsOffered: [
      { name: 'Competitive Programming', category: 'Programming', level: 'Expert', description: 'Problem-solving speed and contest strategies.' },
      { name: 'Data Structures & Algorithms', category: 'Programming', level: 'Expert', description: 'Trees, graphs, dynamic programming.' }
    ],
    skillsNeeded: [
      { name: 'Spanish', category: 'Language', level: 'Beginner' }
    ],
    availability: { weekdays: true, weekends: true, mornings: false, afternoons: false, evenings: true }
  },
  {
    email: 'rahul@demo.com',
    name: 'Rahul Gupta',
    college: 'Delhi University',
    year: '1st Year',
    bio: 'Acoustic guitar player of 5 years.',
    skillsOffered: [
      { name: 'Acoustic Guitar', category: 'Music', level: 'Advanced', description: 'Chords, strumming, fingerpicking.' }
    ],
    skillsNeeded: [
      { name: 'HTML & CSS', category: 'Programming', level: 'Beginner' }
    ],
    availability: { weekdays: false, weekends: true, mornings: false, afternoons: true, evenings: true }
  },
  {
    email: 'kavya@demo.com',
    name: 'Kavya Nair',
    college: 'VIT Vellore',
    year: 'Postgraduate',
    bio: 'MBA candidate specializing in digital marketing.',
    skillsOffered: [
      { name: 'Digital Marketing', category: 'Business', level: 'Expert', description: 'SEO, content strategy, paid ads.' }
    ],
    skillsNeeded: [
      { name: 'HTML & CSS', category: 'Programming', level: 'Beginner' }
    ],
    availability: { weekdays: true, weekends: false, mornings: true, afternoons: true, evenings: false }
  }
];

/**
 * Ensure all 5 peer demo users exist in the database.
 * Creates them with a hashed password if missing.
 * Returns a map of { email -> user document }.
 */
async function ensureDemoPeers() {
  const peerMap = {};

  for (const profile of PEER_PROFILES) {
    let peer = await User.findOne({ email: profile.email });
    if (!peer) {
      peer = await User.create({
        ...profile,
        password: 'password123', // pre-save hook hashes this
        isDemo: true,
        isActive: true,
        reputationScore: 0,
        totalReviews: 0,
        completedSessions: 0,
        profileComplete: 85
      });
    }
    peerMap[profile.email] = peer;
  }

  return peerMap;
}

/**
 * Find or create peer demo students to interact with Navitha.
 * Always calls ensureDemoPeers() first so peers are guaranteed to exist.
 */
async function getDemoPeers() {
  const peerMap = await ensureDemoPeers();
  return {
    priya: peerMap['priya@demo.com'],
    arjun: peerMap['arjun@demo.com'],
    sneha: peerMap['sneha@demo.com'],
    rahul: peerMap['rahul@demo.com'],
    kavya: peerMap['kavya@demo.com']
  };
}

/**
 * Ensures the dedicated Navitha Chekuri demo user exists and has all required demo data.
 * Fully idempotent: reuses existing user ID and re-seeds cleanly.
 */
async function seedDemoUser() {
  const peers = await getDemoPeers();

  // 1. Locate or create the dedicated demo user
  let demoUser = await User.findOne({ email: DEMO_EMAIL });

  const demoProfileData = {
    name: 'Navitha Chekuri',
    email: DEMO_EMAIL,
    college: 'Scaler School of Technology',
    year: 'Second Year',
    bio: 'Second-year Computer Science student at Scaler School of Technology. Passionate about web development, DSA problem solving, and exchanging tech skills with fellow students.',
    isDemo: true,
    isActive: true,
    skillsOffered: [
      {
        name: 'HTML & CSS',
        category: 'Programming',
        level: 'Intermediate',
        description: 'Semantic HTML5, CSS Grid, Flexbox, responsive web design, and clean UI styling.'
      },
      {
        name: 'JavaScript',
        category: 'Programming',
        level: 'Intermediate',
        description: 'ES6+ fundamentals, DOM manipulation, asynchronous JavaScript, and REST APIs.'
      },
      {
        name: 'Data Structures & Algorithms',
        category: 'Programming',
        level: 'Intermediate',
        description: 'Arrays, linked lists, binary search, trees, recursion, and coding interview patterns in Java.'
      },
      {
        name: 'React Basics',
        category: 'Programming',
        level: 'Beginner',
        description: 'Component architecture, state, props, hooks (useState, useEffect), and interactive single page apps.'
      }
    ],
    skillsNeeded: [
      { name: 'UI/UX Design', category: 'Design', level: 'Beginner' },
      { name: 'Node.js & Backend', category: 'Programming', level: 'Intermediate' },
      { name: 'Acoustic Guitar', category: 'Music', level: 'Beginner' },
      { name: 'Machine Learning', category: 'Science', level: 'Beginner' }
    ],
    availability: {
      weekdays: true,
      weekends: true,
      mornings: false,
      afternoons: true,
      evenings: true
    }
  };

  if (!demoUser) {
    demoUser = new User({
      ...demoProfileData,
      password: 'DemoAccountPassword2024!' // Will be hashed by pre-save hook
    });
    demoUser.profileComplete = demoUser.calculateProfileComplete();
    await demoUser.save();
  } else {
    // Update existing demo user without changing password or triggering re-hash
    await User.updateOne(
      { _id: demoUser._id },
      {
        $set: {
          ...demoProfileData,
          profileComplete: 100
        }
      }
    );
    demoUser = await User.findById(demoUser._id);
  }

  const uid = demoUser._id;

  // 2. Safe isolated cleanup of demo activity belonging to this demo user
  await Proposal.deleteMany({ isDemo: true, $or: [{ sender: uid }, { receiver: uid }] });
  await Session.deleteMany({ isDemo: true, participants: uid });
  await Review.deleteMany({ isDemo: true, $or: [{ reviewer: uid }, { reviewee: uid }] });
  await SkillOffer.deleteMany({ user: uid });
  await SkillRequest.deleteMany({ user: uid });

  // 3. Seed Skill Offers
  await SkillOffer.create([
    {
      user: uid,
      title: 'Modern Web Development (HTML/CSS & JavaScript)',
      category: 'Programming',
      level: 'Intermediate',
      description: 'Learn to build clean, responsive websites using HTML5, modern CSS layouts (Flexbox & Grid), and interactive JavaScript.',
      tags: ['webdev', 'html', 'css', 'javascript', 'frontend'],
      sessionDuration: 60,
      preferredMode: 'Online',
      isActive: true
    },
    {
      user: uid,
      title: 'DSA & Coding Interview Foundations (Java)',
      category: 'Programming',
      level: 'Intermediate',
      description: 'Step-by-step guidance on core data structures: arrays, linked lists, stacks, queues, recursion, and binary search.',
      tags: ['dsa', 'java', 'algorithms', 'problem-solving'],
      sessionDuration: 60,
      preferredMode: 'Both',
      isActive: true
    }
  ]);

  // 4. Seed Skill Requests
  await SkillRequest.create([
    {
      user: uid,
      title: 'Looking for UI/UX Design & Prototyping in Figma',
      category: 'Design',
      currentLevel: 'Beginner',
      description: 'Want to learn design systems, user flows, auto-layout, and interactive prototyping in Figma for web applications.',
      urgency: 'Medium',
      isActive: true
    },
    {
      user: uid,
      title: 'Want to learn Backend Development with Node.js & Express',
      category: 'Programming',
      currentLevel: 'Beginner',
      description: 'Interested in building RESTful APIs, middleware architecture, and database integrations with MongoDB.',
      urgency: 'High',
      isActive: true
    }
  ]);

  // 5. Seed Proposals
  const days = (n) => new Date(Date.now() + n * 86_400_000);

  // Pending received from Priya
  if (peers.priya) {
    await Proposal.create({
      sender: peers.priya._id,
      receiver: uid,
      offeredSkill: 'React.js',
      requestedSkill: 'Data Structures & Algorithms',
      message: `Hi Navitha! I saw your DSA offer. I can teach you advanced React hooks and component patterns in exchange for tree and graph interview prep!`,
      preferredTimes: [{ date: days(3), timeSlot: '17:00' }],
      status: 'pending',
      isDemo: true,
      navithaActivity: true
    });
  }

  // Pending received from Rahul
  if (peers.rahul) {
    await Proposal.create({
      sender: peers.rahul._id,
      receiver: uid,
      offeredSkill: 'Acoustic Guitar',
      requestedSkill: 'HTML & CSS',
      message: `Hey Navitha! I would love to learn web development basics from you. I can teach you acoustic guitar fundamentals and chord progressions!`,
      preferredTimes: [{ date: days(5), timeSlot: '18:30' }],
      status: 'pending',
      isDemo: true,
      navithaActivity: true
    });
  }

  // Pending sent to Arjun
  if (peers.arjun) {
    await Proposal.create({
      sender: uid,
      receiver: peers.arjun._id,
      offeredSkill: 'JavaScript',
      requestedSkill: 'Figma Design',
      message: `Hi Arjun! I love your UI designs. I can help with JavaScript fundamentals if you can guide me through Figma auto-layout and prototyping.`,
      preferredTimes: [{ date: days(4), timeSlot: '16:00' }],
      status: 'pending',
      isDemo: true,
      navithaActivity: true
    });
  }

  // Accepted proposal backing upcoming session with Arjun
  let acceptedProp = null;
  if (peers.arjun) {
    acceptedProp = await Proposal.create({
      sender: peers.arjun._id,
      receiver: uid,
      offeredSkill: 'Figma Design',
      requestedSkill: 'JavaScript',
      message: `Hi Navitha! Let's swap skills – I will teach Figma interactive prototyping and component systems.`,
      status: 'accepted',
      isDemo: true,
      navithaActivity: true
    });
  }

  // Completed proposals backing completed sessions
  let completedProp1 = null;
  if (peers.sneha) {
    completedProp1 = await Proposal.create({
      sender: peers.sneha._id,
      receiver: uid,
      offeredSkill: 'Competitive Programming',
      requestedSkill: 'Data Structures & Algorithms',
      message: 'Completed exchange session on problem-solving patterns.',
      status: 'completed',
      isDemo: true,
      navithaActivity: true
    });
  }

  let completedProp2 = null;
  if (peers.kavya) {
    completedProp2 = await Proposal.create({
      sender: peers.kavya._id,
      receiver: uid,
      offeredSkill: 'Digital Marketing',
      requestedSkill: 'HTML & CSS',
      message: 'Completed exchange session on web fundamentals.',
      status: 'completed',
      isDemo: true,
      navithaActivity: true
    });
  }

  // 6. Seed Sessions
  // Upcoming session
  if (acceptedProp && peers.arjun) {
    await Session.create({
      proposal: acceptedProp._id,
      participants: [uid, peers.arjun._id],
      skill: 'Figma UI Design / JavaScript Basics',
      scheduledAt: days(2), // 2 days in the future
      duration: 60,
      mode: 'Online',
      meetLink: '',
      status: 'upcoming',
      notes: 'Arjun will cover Figma auto-layout and component variants. Navitha will walk through DOM event handling.',
      isDemo: true,
      navithaActivity: true
    });
  }

  // Completed session 1 (7 days ago)
  let session1 = null;
  if (completedProp1 && peers.sneha) {
    session1 = await Session.create({
      proposal: completedProp1._id,
      participants: [uid, peers.sneha._id],
      skill: 'DSA Problem Solving / Java OOP',
      scheduledAt: days(-7),
      duration: 90,
      mode: 'Online',
      status: 'completed',
      completedBy: [uid, peers.sneha._id],
      isDemo: true,
      navithaActivity: true
    });
  }

  // Completed session 2 (14 days ago)
  let session2 = null;
  if (completedProp2 && peers.kavya) {
    session2 = await Session.create({
      proposal: completedProp2._id,
      participants: [uid, peers.kavya._id],
      skill: 'Web Basics (HTML/CSS) / Presentation',
      scheduledAt: days(-14),
      duration: 60,
      mode: 'Online',
      status: 'completed',
      completedBy: [uid, peers.kavya._id],
      isDemo: true,
      navithaActivity: true
    });
  }

  // 7. Seed Reviews
  if (session1 && peers.sneha) {
    // Sneha reviews Navitha
    await Review.create({
      session: session1._id,
      reviewer: peers.sneha._id,
      reviewee: uid,
      rating: 5,
      feedback: 'Navitha was an outstanding peer mentor! She explained recursion and binary trees with clean step-by-step visualizations. Patient, clear, and very knowledgeable.',
      skillReviewed: 'Data Structures & Algorithms',
      tags: ['Clear Explanation', 'Patient', 'Helpful'],
      isDemo: true,
      navithaActivity: true
    });

    // Navitha reviews Sneha
    await Review.create({
      session: session1._id,
      reviewer: uid,
      reviewee: peers.sneha._id,
      rating: 5,
      feedback: 'Sneha gave exceptional insights on competitive programming and algorithmic problem solving. Very patient and structured mentor!',
      skillReviewed: 'Competitive Programming',
      tags: ['Knowledgeable', 'Patient'],
      isDemo: true,
      navithaActivity: true
    });
  }

  if (session2 && peers.kavya) {
    // Kavya reviews Navitha
    await Review.create({
      session: session2._id,
      reviewer: peers.kavya._id,
      reviewee: uid,
      rating: 5,
      feedback: 'Great exchange! Navitha helped me understand CSS Flexbox and responsive design thoroughly. She had practical examples ready and explained every concept with clarity.',
      skillReviewed: 'HTML & CSS',
      tags: ['Knowledgeable', 'Well Prepared', 'Friendly'],
      isDemo: true,
      navithaActivity: true
    });
  }

  // 8. Notifications
  const demoNotifications = [
    {
      message: 'Priya Sharma sent you a skill exchange proposal for "Data Structures & Algorithms"',
      type: 'proposal',
      read: false,
      link: '/proposals',
      createdAt: new Date(Date.now() - 3600000)
    },
    {
      message: 'Rahul Gupta sent you a skill exchange proposal for "HTML & CSS"',
      type: 'proposal',
      read: false,
      link: '/proposals',
      createdAt: new Date(Date.now() - 7200000)
    },
    {
      message: 'Upcoming session for "Figma UI Design / JavaScript Basics" with Arjun Mehta is in 2 days',
      type: 'session',
      read: false,
      link: '/sessions',
      createdAt: new Date(Date.now() - 86400000)
    },
    {
      message: 'Sneha Reddy left you a 5-star review! "Navitha was an outstanding peer mentor..."',
      type: 'review',
      read: true,
      link: '/profile',
      createdAt: new Date(Date.now() - 7 * 86400000)
    }
  ];

  // 9. Recalculate stats from persisted DB records
  const completedCount = await Session.countDocuments({
    participants: uid,
    status: 'completed'
  });
  const navithaReviews = await Review.find({ reviewee: uid });
  const avgRating = navithaReviews.length > 0
    ? Math.round((navithaReviews.reduce((sum, r) => sum + r.rating, 0) / navithaReviews.length) * 10) / 10
    : 0;

  await User.updateOne(
    { _id: uid },
    {
      $set: {
        completedSessions: completedCount,
        totalReviews: navithaReviews.length,
        reputationScore: avgRating,
        notifications: demoNotifications,
        profileComplete: 100
      }
    }
  );

  return await User.findById(uid);
}

/**
 * Retrieves the demo user, seeding if it does not yet exist or has no activity.
 * Peers are guaranteed to exist before checking activity (ensureDemoPeers is
 * called inside getDemoPeers which is called inside seedDemoUser).
 */
async function getOrCreateDemoUser() {
  const demoUser = await User.findOne({ email: DEMO_EMAIL });
  if (!demoUser) {
    return await seedDemoUser();
  }

  // Re-seed if the demo user has no sessions OR no peers exist yet
  const hasSessions = await Session.exists({ participants: demoUser._id });
  const peerCount = await User.countDocuments({ isDemo: true, email: { $ne: DEMO_EMAIL } });

  if (!hasSessions || peerCount < 5) {
    return await seedDemoUser();
  }

  return demoUser;
}

module.exports = {
  DEMO_EMAIL,
  seedDemoUser,
  getOrCreateDemoUser
};

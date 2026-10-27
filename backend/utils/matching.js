/**
 * SkillSwap Matching Algorithm
 * Calculates complementary match scores (0-100) and human-readable explanations
 * based on skills offered and skills needed between students.
 */

function normalize(str) {
  return (str || '').toLowerCase().trim();
}

function calculateMatch(currentUser, peer) {
  if (!currentUser || !peer) {
    return {
      score: 0,
      reason: 'No match data available',
      matchType: 'none',
      matchedSkills: { teach: [], learn: [] }
    };
  }

  const myNeeds = (currentUser.skillsNeeded || []).map(s => ({
    name: normalize(s.name),
    category: s.category || 'General',
    level: s.level || 'Beginner'
  }));

  const myOffers = (currentUser.skillsOffered || []).map(s => ({
    name: normalize(s.name),
    category: s.category || 'General',
    level: s.level || 'Intermediate'
  }));

  const peerNeeds = (peer.skillsNeeded || []).map(s => ({
    name: normalize(s.name),
    category: s.category || 'General',
    level: s.level || 'Beginner',
    rawName: s.name
  }));

  const peerOffers = (peer.skillsOffered || []).map(s => ({
    name: normalize(s.name),
    category: s.category || 'General',
    level: s.level || 'Intermediate',
    rawName: s.name
  }));

  // Match 1: Peer offers what Current User needs (Current User learns from Peer)
  const peerCanTeachMe = [];
  for (const po of peerOffers) {
    for (const mn of myNeeds) {
      if (po.name && mn.name && (po.name.includes(mn.name) || mn.name.includes(po.name))) {
        peerCanTeachMe.push({ peerSkill: po.rawName, userNeed: mn.name });
        break;
      }
    }
  }

  // Match 2: Current User offers what Peer needs (Current User teaches Peer)
  const iCanTeachPeer = [];
  for (const pn of peerNeeds) {
    for (const mo of myOffers) {
      if (pn.name && mo.name && (pn.name.includes(mo.name) || mo.name.includes(pn.name))) {
        iCanTeachPeer.push({ userSkill: mo.name, peerNeed: pn.rawName });
        break;
      }
    }
  }

  let score = 0;
  let reason = '';
  let matchType = 'general';

  if (peerCanTeachMe.length > 0 && iCanTeachPeer.length > 0) {
    // 🌟 Perfect Two-Way (Mutual) Complementary Exchange
    score = Math.min(95 + (peerCanTeachMe.length + iCanTeachPeer.length - 2) * 2, 100);
    reason = `Perfect Mutual Match: You teach ${iCanTeachPeer[0].peerNeed} & learn ${peerCanTeachMe[0].peerSkill}!`;
    matchType = 'mutual';
  } else if (peerCanTeachMe.length > 0) {
    // 🎯 Peer offers what user is eager to learn
    score = Math.min(80 + (peerCanTeachMe.length - 1) * 5, 90);
    reason = `Offers ${peerCanTeachMe[0].peerSkill}, which is on your wishlist`;
    matchType = 'learn';
  } else if (iCanTeachPeer.length > 0) {
    // 💡 Peer is seeking a skill user can provide
    score = Math.min(70 + (iCanTeachPeer.length - 1) * 5, 80);
    reason = `Looking for ${iCanTeachPeer[0].peerNeed}, which you can teach`;
    matchType = 'teach';
  } else {
    // Check shared categories between their skills
    const myCategories = new Set([
      ...myOffers.map(o => o.category),
      ...myNeeds.map(n => n.category)
    ]);

    const peerCategories = [
      ...peerOffers.map(o => o.category),
      ...peerNeeds.map(n => n.category)
    ];

    const sharedCategory = peerCategories.find(c => myCategories.has(c) && c !== 'General' && c !== 'Other');
    if (sharedCategory) {
      score = 45;
      reason = `Both active in ${sharedCategory}`;
      matchType = 'category';
    } else {
      score = 30;
      reason = 'Fellow campus peer';
      matchType = 'general';
    }
  }

  return {
    score,
    reason,
    matchType,
    matchedSkills: {
      teach: iCanTeachPeer.map(m => m.peerNeed),
      learn: peerCanTeachMe.map(m => m.peerSkill)
    }
  };
}

module.exports = { calculateMatch };

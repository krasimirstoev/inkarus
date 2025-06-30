// lib/relationshipTypes.js - Library defining character relationship types
// This file defines various relationship types and their inverses for use in a character relationship management system

module.exports = [
  { relation: 'sibling', inverse: 'sibling' },
  { relation: 'friend', inverse: 'friend' },
  { relation: 'mentor', inverse: 'apprentice' },
  { relation: 'parent', inverse: 'child' },
  { relation: 'lover', inverse: 'lover' },
  { relation: 'enemy', inverse: 'enemy' },
  { relation: 'rival', inverse: 'rival' },
  { relation: 'admirer', inverse: 'idol' },
  { relation: 'follower', inverse: 'leader' },
  { relation: 'colleague', inverse: 'colleague' }
];

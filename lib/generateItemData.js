// lib/generateItemData.js – Generates realistic fake item data

const sampleNames = [
  'Bloodstained Dagger', 'Crystal Sphere', 'Ancient Manuscript',
  'Jeweled Crown', 'Silver Locket', 'Rusted Key', 'Amulet of Light',
  'Mysterious Map', 'Torn Banner', 'Vial of Poison', 'Encrypted Letter'
];

const sampleDescriptions = [
  'An old item with unknown origin.',
  'Covered in dust, this item hasn’t been touched in decades.',
  'Seems to hold sentimental value.',
  'Engraved with a language no longer spoken.',
  'Still radiates a faint magical aura.',
  'Clearly broken, but someone tried to fix it.',
  'Its surface is marked with blood and scratches.'
];

const statuses = ['active', 'lost', 'destroyed', 'custom'];
const customStatusLabels = ['cursed', 'hidden', 'borrowed', 'enchanted', 'inaccessible'];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = function generateItemData(projectId) {
  const name = getRandom(sampleNames);
  const description = getRandom(sampleDescriptions);
  const status = getRandom(statuses);

  let customStatus = '';
  if (status === 'custom') {
    customStatus = getRandom(customStatusLabels);
  }

  return [projectId, name, description, status, customStatus];
};

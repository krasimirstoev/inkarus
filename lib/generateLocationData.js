// lib/generateLocationData.js – Generates realistic location data for Inkarus

const { faker } = require('@faker-js/faker');

function generateLocationData(projectId) {
  const types = [
    'city', 'village', 'country', 'continent',
    'mountain', 'river', 'sea', 'lake',
    'forest', 'desert', 'region', 'island',
    'planet', 'custom'
  ];

  const type = faker.helpers.arrayElement(types);

  let name;
  switch (type) {
    case 'city':
    case 'village':
      name = faker.location.city();
      break;
    case 'country':
    case 'continent':
      name = faker.location.country();
      break;
    case 'mountain':
    case 'river':
    case 'lake':
      name = `${faker.word.adjective()} ${type}`;
      break;
    case 'forest':
    case 'desert':
    case 'region':
    case 'island':
      name = faker.word.words({ count: { min: 1, max: 2 } }) + ' ' + type;
      break;
    case 'sea':
      name = `Sea of ${faker.person.firstName()}`;
      break;
    case 'planet':
      name = faker.science.chemicalElement().name + 'ia';
      break;
    case 'custom':
      name = faker.word.words({ count: { min: 1, max: 3 } });
      break;
    default:
      name = faker.word.words(2);
  }

  const settingAdjectives = [
  'foggy', 'ancient', 'abandoned', 'enchanted', 'mystical',
  'sun-baked', 'windswept', 'remote', 'lush', 'forgotten',
  'sacred', 'haunted', 'bustling', 'serene', 'crumbling'
];

  const descriptionTemplates = [
  `The ${type === 'custom' ? customType : type} of ${name} is known for its ${faker.word.adjective()} past and ${faker.word.noun()} legends.`,
  `Nestled in the heart of ${faker.location.country()}, ${name} is a ${faker.helpers.arrayElement(settingAdjectives)} ${type}, shrouded in mystery.`,
  `Locals whisper tales about ${name}, a ${faker.helpers.arrayElement(settingAdjectives)} ${type} where ${faker.word.noun()}s once roamed.`,
  `${name} stands as a ${faker.helpers.arrayElement(settingAdjectives)} ${type}, echoing stories of lost travelers and ancient secrets.`,
  `Once thriving, now ${faker.word.adjective()}, the ${type} of ${name} bears the scars of forgotten wars and broken promises.`
];
// Randomly select a description template
const description = faker.helpers.arrayElement(descriptionTemplates);

  // Custom type label only for "custom" type
  const customType = type === 'custom'
    ? faker.helpers.arrayElement([
        'spiritual realm',
        'abandoned base',
        'hidden dimension',
        'dreamworld',
        'underground complex',
        'sacred territory',
        'zone of silence',
        'mystical plane'
      ])
    : '';

  return [projectId, name, description, type, customType];
}

module.exports = generateLocationData;

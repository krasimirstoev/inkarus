// lib/generateLocationData.js – Library to generate realistic location data for Inkarus

/**
 * Generates a random location data array for a given project.
 *
 * @param {string|number} projectId - The ID of the project to associate with the location.
 * @returns {[projectId: string|number, name: string, description: string, type: string, customType: string]}
 *   An array containing:
 *     - projectId: The provided project ID.
 *     - name: The generated location name.
 *     - description: A generated description for the location.
 *     - type: The type of location (e.g., city, river, custom, etc.).
 *     - customType: A custom type label (only for 'custom' type, otherwise empty string).
 *
 * Usage:
 *   const generateLocationData = require('./generateLocationData');
 *   const [projectId, name, description, type, customType] = generateLocationData('proj123');
 */

const { faker } = require('@faker-js/faker');

function generateLocationData(projectId) {
  // Supported location types
  const types = [
    'city', 'village', 'country', 'continent',
    'mountain', 'river', 'sea', 'lake',
    'forest', 'desert', 'region', 'island',
    'planet', 'custom'
  ];

  // Randomly select a location type
  const type = faker.helpers.arrayElement(types);

  let name;
  // Generate a name based on the location type
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

  // Adjectives for setting the mood of the location
  const settingAdjectives = [
    'foggy', 'ancient', 'abandoned', 'enchanted', 'mystical',
    'sun-baked', 'windswept', 'remote', 'lush', 'forgotten',
    'sacred', 'haunted', 'bustling', 'serene', 'crumbling'
  ];

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

  // Description templates for generating varied location descriptions
  const descriptionTemplates = [
    `The ${type === 'custom' ? customType : type} of ${name} is known for its ${faker.word.adjective()} past and ${faker.word.noun()} legends.`,
    `Nestled in the heart of ${faker.location.country()}, ${name} is a ${faker.helpers.arrayElement(settingAdjectives)} ${type}, shrouded in mystery.`,
    `Locals whisper tales about ${name}, a ${faker.helpers.arrayElement(settingAdjectives)} ${type} where ${faker.word.noun()}s once roamed.`,
    `${name} stands as a ${faker.helpers.arrayElement(settingAdjectives)} ${type}, echoing stories of lost travelers and ancient secrets.`,
    `Once thriving, now ${faker.word.adjective()}, the ${type} of ${name} bears the scars of forgotten wars and broken promises.`
  ];

  // Randomly select a description template
  const description = faker.helpers.arrayElement(descriptionTemplates);

  return [projectId, name, description, type, customType];
}

module.exports = generateLocationData;

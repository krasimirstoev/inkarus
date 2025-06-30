// lib/generateEventData.js - Library to generate fake event data for Inkarus

/**
 * Generates a single event data array for use in the Inkarus project.
 *
 * @param {number|string} projectId - The ID of the project this event belongs to.
 * @param {boolean} isAbstract - If true, generates an abstract (non-date) event; otherwise, generates a concrete date.
 * @param {number|null} [displayOrder=null] - Optional display order for the event; defaults to 0 if not provided.
 * @returns {Array} An array containing:
 *   [projectId, title, description, event_date, is_abstract, displayOrder]
 *
 * Example usage:
 *   const generateEventData = require('./lib/generateEventData');
 *   const event = generateEventData(1, false, 2);
 *   // event: [1, 'The Awakening', 'A dramatic sentence.', '0345-07-12', 0, 2]
 */

const { faker } = require('@faker-js/faker');

function generateEventData(projectId, isAbstract, displayOrder = null) {
  // Choose a realistic, dramatic short title for the event
  const title = faker.helpers.arrayElement([
    'The Fall', 'The Awakening', 'Crossroads', 'Twilight Pact', 'The Secret Meeting',
    'Shadows Rising', 'The Trial', 'The Disappearance', 'Echoes of War', 'A New Dawn'
  ]);

  // Generate a description: 1–2 coherent, dramatic sentences
  const description = faker.lorem.sentences({ min: 1, max: 2 });

  let event_date, is_abstract;

  if (isAbstract) {
    // Use a narrative, non-date phrase for abstract events
    event_date = faker.helpers.arrayElement([
      'in ancient times',
      'before the great silence',
      'during the forgotten war',
      'in the age of iron and steam',
      'when the stars aligned',
      'in a time no one remembers',
      'on the eve of destruction',
      'during the long winter',
      'in the shadow of the old kings',
      'before the fall of the citadel'
    ]);
    is_abstract = 1;
  } else {
    // Generate a concrete date in YYYY-MM-DD format
    const year = faker.number.int({ min: 0, max: 5000 });
    const month = faker.number.int({ min: 1, max: 12 });
    const day = faker.number.int({ min: 1, max: 28 }); // Safe for all months
    event_date = `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    is_abstract = 0;
  }

  return [
    projectId,
    title,
    description,
    event_date,
    is_abstract,
    displayOrder ?? 0 // Use 0 if displayOrder is not specified
  ];
}

module.exports = generateEventData;

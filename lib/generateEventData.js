// lib/generateEventData.js - Generate realistic event data for the Inkarus

const { faker } = require('@faker-js/faker');

function generateEventData(projectId, isAbstract, displayOrder = null) {
  // Realistic short title
  const title = faker.helpers.arrayElement([
    'The Fall', 'The Awakening', 'Crossroads', 'Twilight Pact', 'The Secret Meeting',
    'Shadows Rising', 'The Trial', 'The Disappearance', 'Echoes of War', 'A New Dawn'
  ]);

  // Description with 1–2 coherent, dramatic sentences
  const description = faker.lorem.sentences({ min: 1, max: 2 });

  let event_date, is_abstract;

  if (isAbstract) {
    // Abstract event date
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
    // Realistic date event
    const year = faker.number.int({ min: 0, max: 5000 });
    const month = faker.number.int({ min: 1, max: 12 });
    const day = faker.number.int({ min: 1, max: 28 }); // safe for all months
    event_date = `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    is_abstract = 0;
  }

  return [
    projectId,
    title,
    description,
    event_date,
    is_abstract,
    displayOrder ?? 0 // fallback to 0 if not specified
  ];
}

module.exports = generateEventData;

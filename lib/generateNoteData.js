// lib/generateNoteData.js – Realistic note data generator for Inkarus

const { faker } = require('@faker-js/faker');

function generateNoteData(projectId) {
  const topic = faker.helpers.arrayElement([
    'Plot problem',
    'Scene idea',
    'Character motivation',
    'Tone adjustment',
    'Pacing issue',
    'Dialogue rewrite',
    'Foreshadowing plan',
    'Ending variation',
    'Backstory exploration',
    'Chapter transition'
  ]);

  const leadIn = faker.helpers.arrayElement([
    "Note to self:",
    "Remember to revisit this:",
    "Possibly rewrite this part:",
    "Struggling with this:",
    "Important for later:"
  ]);

  const content = `${leadIn} ${faker.lorem.sentences({ min: 2, max: 4 })} ${faker.helpers.arrayElement([
    "Does this make sense?",
    "Too fast-paced?",
    "Need more emotional depth.",
    "Can this be more subtle?",
    "Keep or cut this scene?"
  ])}`;

  const title = `${topic} – ${faker.word.words({ count: { min: 1, max: 3 } })}`;

  return [projectId, title, content];
}

module.exports = generateNoteData;

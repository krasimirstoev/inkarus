// lib/generateNoteData.js – Library to generate realistic note data for Inkarus

/**
 * Generates realistic note data for a given project.
 *
 * Usage:
 *   const generateNoteData = require('./generateNoteData');
 *   const [projectId, title, content] = generateNoteData(projectId);
 *
 * @param {string|number} projectId - The ID of the project to associate the note with.
 * @returns {[string|number, string, string]} An array containing the projectId, note title, and note content.
 */

const { faker } = require('@faker-js/faker');

function generateNoteData(projectId) {
  // Randomly select a topic for the note title
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

  // Randomly select a lead-in phrase for the note content
  const leadIn = faker.helpers.arrayElement([
    "Note to self:",
    "Remember to revisit this:",
    "Possibly rewrite this part:",
    "Struggling with this:",
    "Important for later:"
  ]);

  // Generate the main content of the note with a lead-in, random sentences, and a closing question or comment
  const content = `${leadIn} ${faker.lorem.sentences({ min: 2, max: 4 })} ${faker.helpers.arrayElement([
    "Does this make sense?",
    "Too fast-paced?",
    "Need more emotional depth.",
    "Can this be more subtle?",
    "Keep or cut this scene?"
  ])}`;

  // Combine topic and random words to form the note title
  const title = `${topic} – ${faker.word.words({ count: { min: 1, max: 3 } })}`;

  return [projectId, title, content];
}

module.exports = generateNoteData;

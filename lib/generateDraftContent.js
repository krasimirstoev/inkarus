// lib/generateDraftContent.js
// Generate realistic draft content with references to characters and locations

const { faker } = require('@faker-js/faker');

function generateDraftContent(characters, locations, maxCharacters, maxLocations, paragraphCount) {
  let usedCharacters = 0;
  let usedLocations = 0;

  const paragraphs = [];

  for (let i = 0; i < paragraphCount; i++) {
    const baseText = faker.lorem.paragraph();

    // Random number of mentions in this paragraph
    const charMentions = Math.min(
      faker.number.int({ min: 0, max: 2 }),
      maxCharacters - usedCharacters
    );
    const locMentions = Math.min(
      faker.number.int({ min: 0, max: 2 }),
      maxLocations - usedLocations
    );

    let finalText = baseText;

    // Insert character mentions
    for (let j = 0; j < charMentions; j++) {
      const character = faker.helpers.arrayElement(characters);
      const sentence = getCharacterSentence(character);
      finalText += ' ' + sentence;
      usedCharacters++;
    }

    // Insert location mentions
    for (let j = 0; j < locMentions; j++) {
      const location = faker.helpers.arrayElement(locations);
      const sentence = getLocationSentence(location);
      finalText += ' ' + sentence;
      usedLocations++;
    }

    paragraphs.push(`<p>${finalText.trim()}</p>`);
  }

  return paragraphs.join('\n');
}

// Helper: generate a sentence mentioning a character
function getCharacterSentence(name) {
  const templates = [
    `${name} stood quietly in the corner, watching.`,
    `No one had seen ${name} since the last storm.`,
    `“I knew ${name} would return,” she whispered.`,
    `The crowd parted as ${name} entered the hall.`,
    `There were rumors about ${name}, but no one knew the truth.`,
    `${name} had once promised they'd never come back.`,
    `Everything changed the moment ${name} opened the door.`,
  ];
  return faker.helpers.arrayElement(templates);
}

// Helper: generate a sentence mentioning a location
function getLocationSentence(place) {
  const templates = [
    `They reached ${place} just before dawn.`,
    `The fires of ${place} still burned in their memories.`,
    `${place} was never the same after the incident.`,
    `Legends spoke of treasure hidden deep in ${place}.`,
    `Their journey began in ${place}, under a blood-red sky.`,
    `No maps ever showed the real path to ${place}.`,
  ];
  return faker.helpers.arrayElement(templates);
}

module.exports = generateDraftContent;

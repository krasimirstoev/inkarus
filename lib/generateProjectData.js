// lib/generateProjectData.js - Library to generate project data for Inkarus app

/**
 * Generates fake project data for a given user.
 * 
 * Usage:
 *   const generateProjectData = require('./generateProjectData');
 *   const [userId, title, description] = generateProjectData('user123');
 * 
 * @param {string} userId - The ID of the user for whom to generate project data.
 * @returns {[string, string, string]} An array containing userId, project title, and project description.
 */

const { faker } = require('@faker-js/faker');

function generateProjectData(userId) {
  // Different title formats for variety
  const formats = [
    () => `"${faker.word.adjective()} ${faker.word.noun()}"`, // e.g. "Silent Echo"
    () => `"The ${faker.word.adjective()} ${faker.word.noun()}"`, // e.g. "The Broken Symphony"
    () => `${faker.person.firstName()}'s ${faker.word.noun()}`, // e.g. "Elena's Labyrinth"
    () => `${faker.word.noun()} of ${faker.location.city()}`, // e.g. "Dreams of Ravenmoor"
    () => `A Tale of ${faker.word.noun()} and ${faker.word.noun()}` // e.g. "A Tale of Fire and Silence"
  ];

  // Randomly select a title format and capitalize each word
  const title = faker.helpers.arrayElement(formats)().replace(/\b\w/g, c => c.toUpperCase());

  // Randomly select a project description template
  const description = faker.helpers.arrayElement([
    `A story about ${faker.person.firstName()} who must confront ${faker.word.noun()} in ${faker.location.city()}.`,
    `A journey through ${faker.location.country()} where everything changes.`,
    `A reflection on loss, memory, and ${faker.word.noun()}.`,
    `Exploring the dark corners of ${faker.word.adjective()} love and broken promises.`,
    `A whimsical exploration of ${faker.word.noun()} in a world unlike our own.`,
    `A writer's deep dive into a world of ${faker.word.verb()} and redemption.`,
    `A series of fragmented memories told through the lens of ${faker.word.noun()} and longing.`,
  ]);

  return [userId, title, description];
}

module.exports = generateProjectData;

// lib/generatePartData.js – Library to generate parts data for Inkarus

/**
 * Generates mock data for a "Part" entity associated with a project.
 * Useful for seeding databases or testing.
 *
 * @param {string|number} projectId - The ID of the project this part belongs to.
 * @param {number} [order=0] - The order/index of the part within the project.
 * @returns {[string|number, string, number]} An array: [projectId, partTitle, order]
 *
 * Example usage:
 *   const generatePartData = require('./lib/generatePartData');
 *   const [projectId, title, order] = generatePartData('proj123', 1);
 *   // projectId: 'proj123', title: 'Act IV', order: 1
 */

const { faker } = require('@faker-js/faker');

function generatePartData(projectId, order = 0) {
  // Possible formats for part titles
  const formats = [
    'Volume',
    'Part',
    'Act',
    'Section',
    'Book',
    'Fragment',
    'Episode',
    'Cycle',
    'Phase',
    'Scroll',
  ];

  // Randomly select a format
  const format = faker.helpers.arrayElement(formats);

  // Randomly select a number (1-10) and convert to Roman numeral
  const number = faker.number.int({ min: 1, max: 10 });
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][number - 1];

  // Construct the part title
  const title = `${format} ${roman}`;

  // Return as [projectId, title, order]
  return [projectId, title, order];
}

module.exports = generatePartData;

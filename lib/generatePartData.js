// lib/generatePartData.js – Generate Part data for Inkarus projects

const { faker } = require('@faker-js/faker');

function generatePartData(projectId, order = 0) {
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

  const format = faker.helpers.arrayElement(formats);
  const number = faker.number.int({ min: 1, max: 10 });
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][number - 1];
  const title = `${format} ${roman}`;

  return [projectId, title, order];
}

module.exports = generatePartData;

// lib/generateCharacterData.js - Library to generate fake character data for Inkarus app

const { faker } = require('@faker-js/faker');

/**
 * Generates a realistic fake character for a given project ID.
 */
function generateCharacterData(projectId) {
  const name = faker.person.fullName();
  const pseudonym = faker.word.adjective() + ' ' + faker.animal.type();
  const occupation = faker.person.jobTitle();
  const origin = faker.location.city();
  const location = faker.location.country();

  const description = `${name} is a ${occupation.toLowerCase()} from ${origin}, currently based in ${location}. Known for ${faker.word.adjective()} decisions and ${faker.word.verb()} others.`;
  const birthdate = faker.date.birthdate({ min: 18, max: 70, mode: 'age' }).toISOString().split('T')[0];

  const gender = faker.helpers.arrayElement([
    'male',
    'female',
    'non-binary',
    'transgender',
    'agender',
    'genderfluid',
    'bigender',
    'two-spirit',
    'questioning',
    'other'
  ]);

  const health_status = faker.helpers.arrayElement(['healthy', 'injured', 'sick']);
  const comment = faker.person.bio();
  const goal = faker.helpers.arrayElement([
  'to reunite with a lost sibling',
  'to write the novel that will shake the world',
  'to bring justice to the forgotten',
  'to find peace after a violent past',
  'to save a town that no longer remembers them',
  'to restore an ancient artifact to its rightful place',
  'to survive in a world that wants them gone',
  'to end a bloodline curse before it spreads further',
  'to understand a mysterious dream that haunts them',
  'to find someone who truly sees them'
]);
  const character_type = faker.helpers.arrayElement([
    'main',
    'supporting',
    'antagonist',
    'mentor',
    'comic relief',
    'anti-hero',
    'sidekick',
    'narrator',
    'love interest',
    'shadow',
    'shapeshifter'
  ]);
  const motivation = faker.helpers.arrayElement([
  'a promise they made long ago',
  'guilt they can’t wash away',
  'a vision of a better world',
  'the need to prove their worth',
  'revenge for something unforgivable',
  'a search for meaning in the chaos',
  'fear of becoming like someone they once hated',
  'the desire to feel loved and accepted',
  'an oath they swore in childhood',
  'the need to be remembered for something good'
]);
  const fears = faker.helpers.arrayElement([
    'failure',
    'isolation',
    'betrayal',
    'the truth',
    'exposure',
    'being forgotten'
  ]);
  const weaknesses = faker.helpers.arrayElement([
    'overconfidence',
    'emotional attachment',
    'lack of patience',
    'fear of change',
    'impulsiveness'
  ]);
  const arc = faker.helpers.arrayElement([
    'redemption',
    'fall from grace',
    'hero’s journey',
    'tragedy',
    'transformation',
    'awakening'
  ]);
  const secrets = `${faker.word.adjective()} ${faker.word.noun()}`;
  const allies = faker.person.firstName() + ', ' + faker.person.firstName();
  const enemies = faker.person.firstName();

  return [
    projectId,
    name,
    pseudonym,
    description,
    birthdate,
    gender,
    origin,
    location,
    occupation,
    health_status,
    comment,
    goal,
    character_type,
    motivation,
    fears,
    weaknesses,
    arc,
    secrets,
    allies,
    enemies
  ];
}

module.exports = generateCharacterData;

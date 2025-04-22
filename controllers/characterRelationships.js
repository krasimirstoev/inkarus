const relationshipModel = require('../models/characterRelationships');

// Show all relationships for a character
exports.list = (req, res) => {
  const { characterId, projectId } = req.params;

  relationshipModel.getRelationships(characterId, (err, relationships) => {
    if (err) {
      console.error('❌ Failed to fetch relationships:', err);
      return res.sendStatus(500);
    }

    res.render('characters/relationships', {
      title: 'Character Relationships',
      relationships,
      characterId,
      projectId
    });
  });
};

// Handle form to add a new relationship
exports.add = (req, res) => {
  const { characterId, projectId } = req.params;
  const { relatedCharacterId, relation, inverseRelation, description } = req.body;

  if (!relatedCharacterId || !relation) {
    return res.status(400).send('Missing fields');
  }

  relationshipModel.addRelationship(
    characterId,
    relatedCharacterId,
    relation,
    inverseRelation,
    description,
    (err) => {
      if (err) {
        console.error('❌ Failed to add relationship:', err);
        return res.sendStatus(500);
      }

      res.redirect(`/characters/${projectId}/${characterId}/relationships`);
    }
  );
};

// Delete a relationship (and its mirror)
exports.delete = (req, res) => {
  const { id, characterId, projectId } = req.params;

  relationshipModel.deleteRelationship(id, (err) => {
    if (err) {
      console.error('❌ Failed to delete relationship:', err);
      return res.sendStatus(500);
    }

    res.redirect(`/characters/${projectId}/${characterId}/relationships`);
  });
};

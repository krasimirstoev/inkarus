const db = require('../models/db');

// Show relationships for a project
exports.view = (req, res) => {
  const { projectId } = req.params;
  const { error } = req.query;

  db.all(`SELECT * FROM characters WHERE project_id = ? ORDER BY name`, [projectId], (err, characters) => {
    if (err) {
      console.error('❌ DB error loading characters:', err);
      return res.sendStatus(500);
    }

    db.all(`
      SELECT cr.id, cr.character_id, cr.related_character_id, cr.relation,
             c1.name AS character_name, c2.name AS related_name
      FROM character_relationships cr
      LEFT JOIN characters c1 ON cr.character_id = c1.id
      LEFT JOIN characters c2 ON cr.related_character_id = c2.id
      WHERE c1.project_id = ? AND c2.project_id = ?
      ORDER BY c1.name, c2.name
    `, [projectId, projectId], (err2, relationships) => {
      if (err2) {
        console.error('❌ DB error loading relationships:', err2);
        return res.sendStatus(500);
      }

      res.render('characters/relationships', {
        title: 'Character Relationships',
        characters,
        relationships,
        projectId,
        error
      });
    });
  });
};

// Add a new relationship
exports.add = (req, res) => {
  const { projectId } = req.params;
  const { character_id, related_character_id, relation, mirror_relation } = req.body;

  if (character_id === related_character_id) {
    return res.redirect(`/characters/${projectId}/relationships?error=same`);
  }

  db.run(`
    INSERT INTO character_relationships (character_id, related_character_id, relation)
    VALUES (?, ?, ?)
  `, [character_id, related_character_id, relation], function (err) {
    if (err) {
      console.error('❌ DB error inserting relationship:', err);
      return res.sendStatus(500);
    }

    if (mirror_relation && mirror_relation.trim()) {
      db.run(`
        INSERT INTO character_relationships (character_id, related_character_id, relation)
        VALUES (?, ?, ?)
      `, [related_character_id, character_id, mirror_relation], err2 => {
        if (err2) {
          console.error('⚠ Mirror insert failed:', err2);
        }

        res.redirect(`/characters/${projectId}/relationships`);
      });
    } else {
      res.redirect(`/characters/${projectId}/relationships`);
    }
  });
};

// Edit a relationship
exports.update = (req, res) => {
  const { projectId, id } = req.params;
  const { relation } = req.body;

  db.run(`UPDATE character_relationships SET relation = ? WHERE id = ?`, [relation, id], function (err) {
    if (err) {
      console.error('❌ Update relationship error:', err);
      return res.status(500).json({ success: false });
    }

    return res.json({ success: true });
  });
};

// Remove a relationship
exports.remove = (req, res) => {
  const { projectId, id } = req.params;

  db.get(`SELECT * FROM character_relationships WHERE id = ?`, [id], (err, rel) => {
    if (err || !rel) {
      console.error('❌ Relationship not found for delete:', err);
      return res.sendStatus(404);
    }

    db.run(`DELETE FROM character_relationships WHERE id = ?`, [id], err2 => {
      if (err2) {
        console.error('❌ Delete error:', err2);
        return res.sendStatus(500);
      }

      db.run(
        `DELETE FROM character_relationships WHERE character_id = ? AND related_character_id = ?`,
        [rel.related_character_id, rel.character_id],
        err3 => {
          if (err3) {
            console.warn('⚠ Failed to delete mirror:', err3);
          }

          res.redirect(`/characters/${projectId}/relationships`);
        }
      );
    });
  });
};

// Graph JSON API
exports.graphJson = (req, res) => {
  const { projectId } = req.params;
  const nodes = [];
  const edges = [];

  db.all(`SELECT id, name FROM characters WHERE project_id = ?`, [projectId], (err, characters) => {
    if (err) {
      console.error('❌ Graph: Failed to load characters', err);
      return res.status(500).json({ success: false });
    }

    characters.forEach(char => {
      nodes.push({ id: char.id, label: char.name });
    });

    db.all(`
      SELECT character_id, related_character_id, relation
      FROM character_relationships
      WHERE character_id IN (SELECT id FROM characters WHERE project_id = ?)
    `, [projectId], (err2, rels) => {
      if (err2) {
        console.error('❌ Graph: Failed to load relationships', err2);
        return res.status(500).json({ success: false });
      }

      rels.forEach(rel => {
        edges.push({
          from: rel.character_id,
          to: rel.related_character_id,
          label: rel.relation,
          arrows: 'to'
        });
      });

      res.json({ nodes, edges });
    });
  });
};

// HTML view for relationship graph
exports.graphView = (req, res) => {
  const { projectId } = req.params;

  db.get(`SELECT title FROM projects WHERE id = ?`, [projectId], (err, project) => {
    if (err || !project) {
      console.error('❌ Project not found for graph view:', err);
      return res.sendStatus(404);
    }

    res.render('characters/relationships-graph', {
      title: res.__('Characters.GraphView.title_with_project', { title: project.title }),
      projectId
    });
  });
};

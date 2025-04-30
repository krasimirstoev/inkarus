// public/js/quill-init.js

import { initEditor } from './quill/init/editor.js';
import { initAutosave } from './quill/init/autosave.js';
import { initModes } from './quill/init/modes.js';
import { initNotes } from './quill/init/notes.js';
import { initCharacterHighlighter } from './pages/character-highlighter.js';

document.addEventListener('DOMContentLoaded', async () => {
  // 1 Initialize Quill and other modules
  const { quill, projectId, draftId } = initEditor();
  initAutosave(quill, draftId);
  initModes();
  initNotes(projectId);

  try {
    // 2 Fetch our JSON list of { id, name, pseudonym } for this project
    const res = await fetch(`/characters/${projectId}/json-list`);
    const data = await res.json();
    if (!data.success) throw new Error('Server returned failure');

    console.log('[INIT] Characters for highlighter:', data.characters);

    // 3 Perform initial highlighting
    initCharacterHighlighter(quill, data.characters, projectId);

    // 4 Set up a timer to re-run highlighting every 60 seconds
    setInterval(() => {
      console.log('[INIT] Re-running character highlighter');
      initCharacterHighlighter(quill, data.characters, projectId);
    }, 60 * 1000);

  } catch (err) {
    console.error('❌ Error loading characters for highlighter:', err);
  }
});

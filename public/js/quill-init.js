// public/js/quill-init.js

import { initEditor } from './quill/init/editor.js';
import { initAutosave } from './quill/init/autosave.js';
import { initModes } from './quill/init/modes.js';
import { initNotes } from './quill/init/notes.js';
import { initCharacterHighlighter } from './pages/character-highlighter.js';
import { initPlaceHighlighter }     from './pages/place-highlighter.js';

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Initialize Quill and other modules
  const { quill, projectId, draftId } = initEditor();
  initAutosave(quill, draftId);
  initModes();
  initNotes(projectId);

  try {
    // 2. Fetch our JSON list of { id, name, pseudonym } for this project
    const charRes = await fetch(`/characters/${projectId}/json-list`);
    const charData = await charRes.json();
    if (!charData.success) throw new Error('Server returned failure for characters');

    console.log('[INIT] Characters for highlighter:', charData.characters);

    // 3. Perform initial highlighting
    initCharacterHighlighter(quill, charData.characters, projectId);

    // 4. Re-run highlighting every 60 seconds
    setInterval(() => {
      console.log('[INIT] Re-running character highlighter');
      initCharacterHighlighter(quill, charData.characters, projectId);
    }, 60 * 1000);

    // 5. Fetch places for highlighter
    const placeRes  = await fetch(`/places/json/${projectId}`);
    const placeData = await placeRes.json();
    if (!placeData.success) throw new Error('Server returned failure for places');

    console.log('[INIT] Places for highlighter:', placeData.places);

    // 6. Perform initial place highlighting
    initPlaceHighlighter(quill, placeData.places, projectId);

    // 7. Re-run place highlighting every 60 seconds
    setInterval(() => {
      console.log('[INIT] Re-running place highlighter');
      initPlaceHighlighter(quill, placeData.places, projectId);
    }, 60 * 1000);

  } catch (err) {
    console.error('❌ Error loading data for highlighters:', err);
  }
});

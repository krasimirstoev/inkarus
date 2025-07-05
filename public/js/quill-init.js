// public/js/quill-init.js - Main entry point for Quill editor initialization

import { initEditor }               from './quill/init/editor.js';
import { initAutosave }             from './quill/init/autosave.js';
import { initModes }                from './quill/init/modes.js';
import { initNotes }                from './quill/init/notes.js';
import { initCharacterHighlighter } from './pages/character-highlighter.js';
import { initPlaceHighlighter }     from './pages/place-highlighter.js';
import { initItemHighlighter }      from './pages/item-highlighter.js';

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Initialize Quill and get IDs
  const { quill, projectId, draftId } = initEditor();

  // 2. Fetch user's autosave interval from server (in minutes)
  let intervalMins = 2; // default fallback
  try {
    const resp = await fetch('/settings/api');
    if (resp.ok) {
      const data = await resp.json();
      intervalMins = Number(data.autosave_interval) || intervalMins;
    }
  } catch (err) {
    console.warn('Could not load autosave interval, using default:', err);
  }

  // 3. Initialize autosave with the fetched interval
  initAutosave(quill, draftId, intervalMins);

  // 4. Other init modules
  initModes();
  initNotes(projectId);

  try {
    // --- Characters ---
    const charRes  = await fetch(`/characters/${projectId}/json-list`);
    const charData = await charRes.json();
    if (!charData.success) throw new Error('Server returned failure for characters');
    console.log('[INIT] Characters for highlighter:', charData.characters);
    initCharacterHighlighter(quill, charData.characters, projectId);
    setInterval(() => {
      console.log('[INIT] Re-running character highlighter');
      initCharacterHighlighter(quill, charData.characters, projectId);
    }, 60 * 1000);

    // --- Places ---
    const placeRes  = await fetch(`/places/json/${projectId}`);
    const placeData = await placeRes.json();
    if (!placeData.success) throw new Error('Server returned failure for places');
    console.log('[INIT] Places for highlighter:', placeData.places);
    initPlaceHighlighter(quill, placeData.places, projectId);
    setInterval(() => {
      console.log('[INIT] Re-running place highlighter');
      initPlaceHighlighter(quill, placeData.places, projectId);
    }, 60 * 1000);

    // --- Items ---
    const itemRes  = await fetch(`/items/json/${projectId}`);
    const itemData = await itemRes.json();
    if (!itemData.success) throw new Error('Server returned failure for items');
    console.log('[INIT] Items for highlighter:', itemData.items);
    initItemHighlighter(quill, itemData.items, projectId);
    setInterval(() => {
      console.log('[INIT] Re-running item highlighter');
      initItemHighlighter(quill, itemData.items, projectId);
    }, 60 * 1000);

  } catch (err) {
    console.error('❌ Error loading data for highlighters:', err);
  }
});

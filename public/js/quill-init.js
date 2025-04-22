import { initEditor } from './quill/init/editor.js';
import { initAutosave } from './quill/init/autosave.js';
import { initModes } from './quill/init/modes.js';
import { initNotes } from './quill/init/notes.js';

document.addEventListener('DOMContentLoaded', () => {
  const { quill, projectId, draftId } = initEditor();

  initAutosave(quill, draftId);
  initModes();
  initNotes(projectId);
});

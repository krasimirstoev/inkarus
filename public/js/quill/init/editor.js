// public/js/quill/init/editor.js

// Import Quill from a CDN-backed ESM bundle
import Quill from 'https://cdn.skypack.dev/quill@1.3.7';

// Import and register our custom CharacterBlot, PlaceBlot, and ItemBlot formats
import './formats/character.js';
import './formats/place.js';
import './formats/item.js'; 

/**
 * Initialize the Quill editor, register event handlers, and expose
 * necessary objects globally.
 *
 * @returns {Object} Contains the Quill instance, projectId, and draftId
 */
export function initEditor() {
  // Grab DOM elements for configuration and status display
  const editorForm = document.getElementById('editor-form');
  const wordCountDisplay = document.getElementById('word-count');

  // Read project and draft identifiers from data attributes
  const projectId = editorForm.dataset.projectId;
  const draftId   = editorForm.dataset.draftId;

  // Instantiate Quill on the #quill-editor container, enable our custom formats
  const quill = new Quill('#quill-editor', {
    theme: 'snow',
    formats: [
      'bold', 'italic', 'underline', 'strike', 'blockquote', 'link',
      'list', 'bullet', 'indent',
      'character', // Our custom CharacterBlot
      'place',     // Our custom PlaceBlot
      'item'       // Our custom ItemBlot
    ]
  });

  // Update the word count display on each text change
  quill.on('text-change', () => {
    const text = quill.getText().trim();
    const count = text.length ? text.split(/\s+/).length : 0;
    wordCountDisplay.textContent = count;
  });

  // Expose Quill and its instance globally for other modules (e.g. highlighter)
  window.Quill  = Quill;
  window.quill  = quill;

  // Return references for immediate use
  return { quill, projectId, draftId };
}

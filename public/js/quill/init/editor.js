// public/js/quill/init/editor.js

// Import Quill from a CDN-backed ESM bundle
import Quill from 'https://cdn.skypack.dev/quill@2.0.3';

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

  // Define the toolbar options for the Quill editor
  // This includes our custom formats like CharacterBlot, PlaceBlot, and ItemBlot
  // as well as standard formatting options like bold, italic, and lists
  const toolbarOptions = [
  [{ 'header': [1, 2, false] }],        // custom button values
  ['bold', 'italic', 'underline',],        // toggled buttons
  [{ list: 'bullet' }],
  ['blockquote'],
  [{ 'direction': 'rtl' }],
  ['clean'], // remove formatting button
  //['blockquote', 'code-block'],
  //['link', 'image', 'video', 'formula'],

  //[{ 'header': 1 }, { 'header': 2 }],               // custom button values
  //[{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
  //[{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
  //[{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
  //[{ 'direction': 'rtl' }],                         // text direction

  //[{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
  //[{ 'header': [1, 2, 3, 4, 5, 6, false] }],

  //[{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
  //[{ 'font': [] }],
  //[{ 'align': [] }],

  //['clean']                                         // remove formatting button
];

  // Instantiate Quill on the #quill-editor container, enable our custom formats
  const quill = new Quill('#quill-editor', {
    theme: 'snow',
    modules: {
      // toolbar: toolbarOptions, // Uncomment to enable the classic toolbar
      toolbar: '#toolbar', // Inkarus custom toolbar defined in editor.ejs
      clipboard: {
        matchVisual: false // Disable visual matching for pasted content
      }
    },
    formats: [
      'header',    // Standard header formats
      'bold',      // Standard bold format
      'italic',    // Standard italic format
      'underline', // Standard underline format
      'strike',    // Standard strikethrough format
      'list',      // Standard list formats
      'blockquote',   // Standard blockquote format
      //'clean',     // Standard clean format (removes formatting)
      'direction', // Standard text direction format
      //'align',     // Standard alignment formats
      //'link',      // Standard link format
      //'image',     // Standard image format
      //'video',     // Standard video format
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

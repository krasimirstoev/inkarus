// Import Quill from a CDN-backed ESM bundle
import Quill from 'https://cdn.skypack.dev/quill@1.3.7';

// Get the Inline blot base class
const Inline = Quill.import('blots/inline');

/**
 * Custom CharacterBlot to wrap character mentions as clickable links.
 */
class CharacterBlot extends Inline {
  /**
   * Create a new blot with character-specific attributes.
   *
   * @param {string|number} id - The ID of the character.
   * @returns {HTMLElement} The DOM node representing the blot.
   */
  static create(id) {
    const node = super.create();
    node.setAttribute('data-character-id', id);
    node.setAttribute('href', '#');
    node.classList.add('character-link');
    return node;
  }

  /**
   * Return the character ID stored on this blot.
   *
   * @param {HTMLElement} node - The DOM node of the blot.
   * @returns {string|null} The character ID, or null if absent.
   */
  static formats(node) {
    return node.getAttribute('data-character-id');
  }

  /**
   * Apply formatting to this blot node.
   *
   * @param {string} name - The format name.
   * @param {any} value - The format value.
   */
  format(name, value) {
    if (name === 'character' && value) {
      this.domNode.setAttribute('data-character-id', value);
    } else {
      super.format(name, value);
    }
  }
}

// Specify blot metadata
CharacterBlot.blotName  = 'character';
CharacterBlot.tagName   = 'a';
CharacterBlot.className = 'character-link';

// Register the blot with Quill
Quill.register(CharacterBlot);
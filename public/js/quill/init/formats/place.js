// public/js/quill/formats/place.js
import Quill from 'https://cdn.skypack.dev/quill@1.3.7';
const Inline = Quill.import('blots/inline');

class PlaceBlot extends Inline {
  static create(id) {
    const node = super.create();
    node.setAttribute('data-place-id', id);
    node.setAttribute('href', '#'); 
    node.classList.add('place-link');
    return node;
  }
  static formats(node) {
    return node.getAttribute('data-place-id');
  }
  format(name, value) {
    if (name === 'place' && value) {
      this.domNode.setAttribute('data-place-id', value);
    } else {
      super.format(name, value);
    }
  }
}
PlaceBlot.blotName  = 'place';
PlaceBlot.tagName   = 'a';
PlaceBlot.className = 'place-link';

Quill.register(PlaceBlot);

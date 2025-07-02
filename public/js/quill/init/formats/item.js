// public/js/quill/init/formats/item.js
import Quill from 'https://cdn.skypack.dev/quill@1.3.7';
const Inline = Quill.import('blots/inline');

class ItemBlot extends Inline {
  static create(id) {
    const node = super.create();
    node.setAttribute('data-item-id', id);
    node.setAttribute('href', '#');
    node.classList.add('item-link');
    return node;
  }
  static formats(node) {
    return node.getAttribute('data-item-id');
  }
  format(name, value) {
    if (name === 'item' && value) {
      this.domNode.setAttribute('data-item-id', value);
    } else {
      super.format(name, value);
    }
  }
}
ItemBlot.blotName  = 'item';
ItemBlot.tagName   = 'a';
ItemBlot.className = 'item-link';

Quill.register(ItemBlot);

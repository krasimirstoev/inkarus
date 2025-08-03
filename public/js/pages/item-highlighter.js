/**
 * Highlights all occurrences of each item name in the Quill editor
 * using the custom 'item' blot, and wires up click-to-modal.
 */
export function initItemHighlighter(quillEditor, items, projectId) {
  if (!quillEditor || !Array.isArray(items) || items.length === 0 || !projectId) {
    console.warn('[ItemHighlighter] Missing required data; aborting.');
    return;
  }

  // Sort terms by length to avoid partial overlaps
  const terms = items
    .map(i => ({ id: i.id, text: i.name }))
    .sort((a, b) => b.text.length - a.text.length);

  const fullText = quillEditor.getText();
  terms.forEach(({ id, text }) => {
    const esc = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(esc, 'gi'); // Match exact text, case-insensitive
    let m;
    while ((m = regex.exec(fullText)) !== null) {
      quillEditor.formatText(m.index, m[0].length, 'item', id, 'silent');
    }
  });

  // Click handler to open modal
  quillEditor.root.addEventListener('click', e => {
    const link = e.target.closest('a.item-link');
    if (!link) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    openItemModal(link.dataset.itemId);
  });

  function openItemModal(id) {
    const modal = new bootstrap.Modal(document.getElementById('itemModal'));
    document.getElementById('itemModalLabel').textContent = window.__('Items.Modal.loadingTitle');
    document.getElementById('itemModalBody').innerHTML = `<p>${window.__('Items.Modal.loadingBody')}</p>`;
    modal.show();

    fetch(`/items/json/${projectId}/${id}`)
      .then(r => r.json())
      .then(data => {
        if (!data.success) {
          document.getElementById('itemModalBody').innerHTML = `<p>${window.__('Items.Modal.failed')}</p>`;
          return;
        }
        const i = data.item;
        document.getElementById('itemModalLabel').textContent = i.name;
        document.getElementById('itemModalBody').innerHTML = `
          <p>${window.__('Items.Modal.description')}: ${i.description || '–'}</p>
          <p>${window.__('Items.Modal.status')}: ${i.display_status}</p>
        `;
      })
      .catch(() => {
        document.getElementById('itemModalBody').innerHTML = `<p>${window.__('Items.Modal.error')}</p>`;
      });
  }
}

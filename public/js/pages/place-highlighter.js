/**
 * Highlights all occurrences of each place name in the Quill editor
 * using the custom 'place' blot, and wires up click-to-modal.
 */
export function initPlaceHighlighter(quillEditor, places, projectId) {
  if (!quillEditor || !Array.isArray(places) || places.length === 0 || !projectId) {
    console.warn('[PlaceHighlighter] Missing required data; aborting.');
    return;
  }

  // Sort terms by length to avoid partial overlaps
  const terms = places
    .map(p => ({ id: p.id, text: p.name }))
    .sort((a, b) => b.text.length - a.text.length);

  const fullText = quillEditor.getText();
  terms.forEach(({ id, text }) => {
    const esc = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    //const regex = new RegExp(`\\b${esc}\\b`, 'gi');
    const regex = new RegExp(esc, 'gi'); // Match exact text, case-insensitive
    let m;
    while ((m = regex.exec(fullText)) !== null) {
      quillEditor.formatText(m.index, m[0].length, 'place', id, 'silent');
    }
  });

  // Click handler to open modal
  quillEditor.root.addEventListener('click', e => {
    const link = e.target.closest('a.place-link');
    if (!link) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    openPlaceModal(link.dataset.placeId);
  });

  function openPlaceModal(id) {
    const modal = new bootstrap.Modal(document.getElementById('placeModal'));
    document.getElementById('placeModalLabel').textContent = 'Loading…';
    document.getElementById('placeModalBody').innerHTML = `<p>Loading place…</p>`;
    modal.show();

    fetch(`/places/json/${projectId}/${id}`)
      .then(r => r.json())
      .then(data => {
        if (!data.success) {
          document.getElementById('placeModalBody').innerHTML = `<p>Failed to load place.</p>`;
          return;
        }
        const p = data.place;
        document.getElementById('placeModalLabel').textContent = p.name;
        document.getElementById('placeModalBody').innerHTML = `
          <p>Description: ${p.description || '–'}</p>
          <p>Type: ${p.type}${p.custom_type ? ` (${p.custom_type})` : ''}</p>
        `;
      })
      .catch(() => {
        document.getElementById('placeModalBody').innerHTML = `<p>Error loading place.</p>`;
      });
  }

  function formatDate(iso) {
    if (!iso) return '–';
    const d = new Date(iso);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
         + ` ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
}

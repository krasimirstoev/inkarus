/**
 * Highlights all occurrences of each character name in the Quill editor
 * using our custom 'character' blot, and wires up click-to-modal.
 *
 * @param {Quill} quillEditor
 * @param {Array<{id: string, name: string}>} characters
 * @param {string} projectId
 */
export function initCharacterHighlighter(quillEditor, characters, projectId) {
    console.log('[Highlighter] initCharacterHighlighter called');
    console.log('[Highlighter] quillEditor:', quillEditor);
    console.log('[Highlighter] projectId:', projectId);
    console.log('[Highlighter] raw characters:', characters);
  
    // Ensure we have at least a Quill instance
    if (!quillEditor) {
      console.warn('[Highlighter] No Quill instance found; aborting.');
      return;
    }
  
    // Sort by descending name length to prevent partial overlaps
    const list = Array.isArray(characters) 
      ? [...characters].sort((a, b) => (b.name||'').length - (a.name||'').length)
      : [];
  
    if (!list.length) {
      console.warn('[Highlighter] Character list empty; nothing to highlight.');
      return;
    }
  
    const fullText = quillEditor.getText();
    console.log('[Highlighter] Editor text length:', fullText.length);
  
    list.forEach(({ id, name }) => {
      if (!name) return;
      // Escape regex specials
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex   = new RegExp(escaped, 'gi');
  
      console.log(`[Highlighter] Searching for "${name}"…`);
      let match;
      while ((match = regex.exec(fullText)) !== null) {
        const idx    = match.index;
        const length = match[0].length;
        console.log(`→ Found "${match[0]}" at ${idx}, length ${length}`);
  
        // Apply our custom blot format silently
        quillEditor.formatText(idx, length, 'character', id, 'silent');
      }
    });
  
    // Now wire up clicks on the rendered <a.character-link>
    quillEditor.root.addEventListener('click', (e) => {
      const link = e.target.closest('a.character-link');
      if (!link) return;
      e.preventDefault();
      const charId = link.getAttribute('data-character-id');
      console.log('[Highlighter] Click on character link ID:', charId);
      openCharacterModal(charId);
    });
  
    function openCharacterModal(characterId) {
      const modalEl    = document.getElementById('characterModal');
      const modalBody  = document.getElementById('characterModalBody');
      const modalTitle = document.getElementById('characterModalLabel');
      const modal      = modalEl ? new bootstrap.Modal(modalEl) : null;
      if (!modal) return;
  
      modalTitle.textContent = 'Loading…';
      modalBody.innerHTML    = `<div class="text-center text-muted">Loading character…</div>`;
      modal.show();
  
      fetch(`/characters/${projectId}/json/${characterId}`)
        .then(r => r.json())
        .then(data => {
          if (!data.success || !data.character) {
            modalBody.innerHTML = `<div class="text-danger">Failed to load character.</div>`;
            return;
          }
          const c = data.character;
          modalTitle.textContent = `${c.name}${c.pseudonym ? ' ('+c.pseudonym+')' : ''}`;
          modalBody.innerHTML = `
            <p><strong>📖 Description:</strong> ${c.description || '<em>None</em>'}</p>
            <p><strong>🎯 Goal:</strong> ${c.goal || '-'}</p>
            <p><strong>📚 Type:</strong> ${c.character_type || '-'}</p>
            <!-- more fields… -->
            <div class="modal-footer d-flex flex-column align-items-start mt-3 border-top pt-2">
              <time>🗓 Created: ${formatDate(c.created_at)}</time>
              <time>✏️ Updated: ${formatDate(c.updated_at)}</time>
            </div>
          `;
        })
        .catch(err => {
          console.error('❌ Error loading character JSON:', err);
          modalBody.innerHTML = `<div class="text-danger">Error loading character.</div>`;
        });
    }
  
    function formatDate(iso) {
      if (!iso) return '-';
      const d   = new Date(iso);
      const pad = n => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
           + ` ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
  }
  
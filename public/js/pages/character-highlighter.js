// public/js/pages/character-highlighter.js

/**
 * Highlights all occurrences of each character name or pseudonym in the Quill editor
 * using our custom 'character' blot, and wires up click-to-modal.
 *
 * @param {Quill} quillEditor
 * @param {Array<{id: string, name: string, pseudonym?: string}>} characters
 * @param {string} projectId
 */
export function initCharacterHighlighter(quillEditor, characters, projectId) {
    if (!quillEditor || !Array.isArray(characters) || characters.length === 0 || !projectId) {
      console.warn('[Highlighter] Missing required data; aborting.');
      return;
    }
  
    // Prepare search terms (name + pseudonym), sorted by length desc to avoid overlaps
    const terms = characters.flatMap(c => {
      const out = [];
      if (c.name)      out.push({ id: c.id, text: c.name,      isAlias: false });
      if (c.pseudonym) out.push({ id: c.id, text: c.pseudonym, isAlias: true  });
      return out;
    }).sort((a, b) => b.text.length - a.text.length);
  
    const fullText = quillEditor.getText();
  
    // Highlight each term
    terms.forEach(({ id, text, isAlias }) => {
      const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex   = new RegExp(escaped, 'gi');
      let match;
  
      while ((match = regex.exec(fullText)) !== null) {
        const idx    = match.index;
        const length = match[0].length;
        // apply our custom blot format
        quillEditor.formatText(idx, length, 'character', id, 'silent');
      }
  
      // If this was a pseudonym, find those anchors and tag them
      if (isAlias) {
        // query all links for this character id
        const links = quillEditor.root.querySelectorAll(
          `a.character-link[data-character-id="${id}"]`
        );
        links.forEach(link => {
          // only mark those whose exact innerText matches the alias (case-insensitive)
          if (link.innerText.trim().toLowerCase() === text.toLowerCase()) {
            link.classList.add('pseudonym');
          }
        });
      }
    });
  
    // Delegate clicks on the rendered <a.character-link>
    quillEditor.root.addEventListener('click', e => {
      const link = e.target.closest('a.character-link');
      if (!link) return;
      e.preventDefault();
      openCharacterModal(link.dataset.characterId);
    });
  
    function openCharacterModal(characterId) {
      const modalEl    = document.getElementById('characterModal');
      const modalBody  = document.getElementById('characterModalBody');
      const modalTitle = document.getElementById('characterModalLabel');
      const modal      = modalEl ? new bootstrap.Modal(modalEl) : null;
      if (!modal) return;
  
      modalTitle.textContent = window.__('Characters.Modal.loading_character');
      modalBody.innerHTML    = `<div class="text-center text-muted">${window.__('Characters.Modal.loading_character')}</div>`;
      modal.show();
  
      fetch(`/characters/${projectId}/json/${characterId}`)
        .then(r => r.json())
        .then(data => {
          if (!data.success || !data.character) {
            modalBody.innerHTML = `<div class="text-danger">${window.__('Characters.Modal.failed_to_load')}</div>`;
            return;
          }
          const c = data.character;
          modalTitle.textContent = `${c.name}${c.pseudonym ? ' ('+c.pseudonym+')' : ''}`;
          modalBody.innerHTML = `
            <p><strong>${window.__('Characters.Modal.desc')}:</strong> ${c.description || '<em>None</em>'}</p>
            <p><strong>${window.__('Characters.Modal.goal')}:</strong> ${c.goal || '-'}</p>
            <p><strong>${window.__('Characters.Modal.type')}:</strong> ${c.character_type || '-'}</p>
            <!-- more fields… -->
            <div class="modal-footer d-flex flex-column align-items-start mt-3 border-top pt-2">
              <time>${window.__('Characters.Modal.created')}: ${formatDate(c.created_at)}</time>
              <time>${window.__('Characters.Modal.updated')}: ${formatDate(c.updated_at)}</time>
            </div>
          `;
        })
        .catch(err => {
          console.error('❌ Error loading character JSON:', err);
          modalBody.innerHTML = `<div class="text-danger">${window.__('Characters.Modal.error_loading')}</div>`;
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
  
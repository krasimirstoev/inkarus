document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('toggle-characters');
    const panel = document.getElementById('characters-panel');
    const closeBtn = document.getElementById('close-characters');
    const searchInput = document.getElementById('character-search');
    const characterList = document.getElementById('character-list');
    const modalElement = document.getElementById('characterModal');
    const modal = modalElement ? new bootstrap.Modal(modalElement) : null;
    const modalBody = document.getElementById('characterModalBody');
    const modalTitle = document.getElementById('characterModalLabel');
  
    const formatDate = iso => {
      if (!iso) return '-';
      const d = new Date(iso);
      const pad = n => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
  
    let characters = [];
    const projectId = document.getElementById('editor-form')?.dataset.projectId;
  
    const loadCharacters = () => {
      fetch(`/characters/${projectId}/json-list`)
        .then(res => res.json())
        .then(data => {
          if (!data.success || !Array.isArray(data.characters)) {
            throw new Error('Invalid character list');
          }
  
          characters = data.characters.map(c => {
            const btn = document.createElement('button');
            btn.className = 'list-group-item list-group-item-action';
            btn.innerHTML = `<strong>${c.name}</strong>${c.pseudonym ? ' <small class="text-muted">(' + c.pseudonym + ')</small>' : ''}`;
            btn.addEventListener('click', () => loadCharacterProfile(c.id));
            characterList.appendChild(btn);
  
            return {
              id: c.id,
              name: c.name,
              element: btn
            };
          });
  
          if (characters.length === 0) {
            characterList.innerHTML = `<p class="text-muted small">No characters found.</p>`;
          }
        })
        .catch(err => {
          console.error('Failed to load characters:', err);
          characterList.innerHTML = `<p class="text-danger">Failed to load characters.</p>`;
        });
    };
  
    const loadCharacterProfile = (characterId) => {
      if (!modal) return;
      modalBody.innerHTML = `<div class="text-center text-muted">Loading...</div>`;
      modalTitle.textContent = 'Character Info';
  
      fetch(`/characters/${projectId}/json/${characterId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.character) {
            const c = data.character;
            modalTitle.textContent = `${c.name}${c.pseudonym ? ' (' + c.pseudonym + ')' : ''}`;
  
            modalBody.innerHTML = `
              <div>
                <p><strong>📖 Description:</strong> ${c.description || '<em>No description</em>'}</p>
                <p><strong>🎯 Goal:</strong> ${c.goal || '-'}</p>
                <p><strong>📚 Type:</strong> ${c.character_type || '-'}</p>
                <p><strong>🔥 Motivation:</strong> ${c.motivation || '-'}</p>
                <p><strong>😨 Fears:</strong> ${c.fears || '-'}</p>
                <p><strong>💔 Weaknesses:</strong> ${c.weaknesses || '-'}</p>
                <p><strong>🌀 Arc:</strong> ${c.arc || '-'}</p>
                <p><strong>🤫 Secrets:</strong> ${c.secrets || '-'}</p>
                <p><strong>🛡️ Allies:</strong> ${c.allies || '-'}</p>
                <p><strong>⚔️ Enemies:</strong> ${c.enemies || '-'}</p>
                <hr/>
                <p><strong>🎂 Birth Date:</strong> ${c.birthdate || '-'}</p>
                <p><strong>⚧ Gender:</strong> ${c.gender || '-'}</p>
                <p><strong>🌍 Origin:</strong> ${c.origin || '-'}</p>
                <p><strong>📍 Location:</strong> ${c.location || '-'}</p>
                <p><strong>💼 Occupation:</strong> ${c.occupation || '-'}</p>
                <p><strong>📝 Notes:</strong> ${c.comment || '-'}</p>
              </div>
              <div class="modal-footer d-flex flex-column align-items-start mt-3 border-top pt-2">
                <time>🗓 Created: ${formatDate(c.created_at)}</time>
                <time>✏️ Updated: ${formatDate(c.updated_at)}</time>
              </div>
            `;
            modal.show();
          } else {
            modalBody.innerHTML = `<div class="text-danger">❌ Failed to load character data.</div>`;
          }
        })
        .catch(() => {
          modalBody.innerHTML = `<div class="text-danger">❌ Error loading character.</div>`;
        });
    };
  
    toggleButton.addEventListener('click', () => {
      panel.classList.remove('d-none');
      if (!characters.length) loadCharacters();
    });
  
    closeBtn.addEventListener('click', () => {
      panel.classList.add('d-none');
    });
  
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase();
      characters.forEach(c => {
        const match = c.name.toLowerCase().includes(query);
        c.element.classList.toggle('d-none', !match);
      });
    });
  });
  
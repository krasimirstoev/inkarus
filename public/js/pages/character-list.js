document.addEventListener('DOMContentLoaded', () => {
  const modal = new bootstrap.Modal(document.getElementById('characterModal'));
  const modalBody = document.getElementById('characterModalBody');
  const modalTitle = document.getElementById('characterModalLabel');

  const formatDate = iso => {
    if (!iso) return '-';
    const d = new Date(iso);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  document.querySelectorAll('.view-character-btn').forEach(button => {
    button.addEventListener('click', () => {
      const characterId = button.dataset.id;
      const projectId = button.dataset.project;

      modalBody.innerHTML = `<div class="text-center text-muted">${window.__('Characters.Modal.loading_character')}</div>`;
      modalTitle.textContent = window.__('Characters.Modal.modal_title');

      fetch(`/characters/${projectId}/json/${characterId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.character) {
            const c = data.character;
            modalTitle.textContent = `${c.name}${c.pseudonym ? ' (' + c.pseudonym + ')' : ''}`;

            modalBody.innerHTML = `
              <div>
                <p><strong>📖 ${window.__('Characters.Modal.desc')}:</strong> ${c.description || `<em>${window.__('Characters.Modal.no_description')}</em>`}</p>
                <p><strong>🎯 ${window.__('Characters.Modal.goal')}:</strong> ${c.goal || '-'}</p>
                <p><strong>📚 ${window.__('Characters.Modal.type')}:</strong> ${c.character_type || '-'}</p>
                <p><strong>🔥 ${window.__('Characters.Form.motivation')}:</strong> ${c.motivation || '-'}</p>
                <p><strong>😨 ${window.__('Characters.Form.fears')}:</strong> ${c.fears || '-'}</p>
                <p><strong>💔 ${window.__('Characters.Form.weaknesses')}:</strong> ${c.weaknesses || '-'}</p>
                <p><strong>🌀 ${window.__('Characters.Form.arc')}:</strong> ${c.arc || '-'}</p>
                <p><strong>🤫 ${window.__('Characters.Form.secrets')}:</strong> ${c.secrets || '-'}</p>
                <p><strong>🛡️ ${window.__('Characters.Form.allies')}:</strong> ${c.allies || '-'}</p>
                <p><strong>⚔️ ${window.__('Characters.Form.enemies')}:</strong> ${c.enemies || '-'}</p>
                <hr/>
                <p><strong>🎂 ${window.__('Characters.Form.birthdate')}:</strong> ${c.birthdate || '-'}</p>
                <p><strong>⚧ ${window.__('Characters.Form.gender')}:</strong> ${c.gender || '-'}</p>
                <p><strong>🌍 ${window.__('Characters.Form.origin')}:</strong> ${c.origin || '-'}</p>
                <p><strong>📍 ${window.__('Characters.Form.location')}:</strong> ${c.location || '-'}</p>
                <p><strong>💼 ${window.__('Characters.Form.occupation')}:</strong> ${c.occupation || '-'}</p>
                <p><strong>🩺 ${window.__('Characters.Form.health_status')}:</strong> ${c.health_status || '-'}</p>
                <p><strong>📝 ${window.__('Characters.Form.comment')}:</strong> ${c.comment || '-'}</p>
              </div>
              <div class="modal-footer d-flex flex-column align-items-start mt-3 border-top pt-2">
                <time>🗓 ${window.__('Characters.Modal.created')}: ${formatDate(c.created_at)}</time>
                <time>✏️ ${window.__('Characters.Modal.updated')}: ${formatDate(c.updated_at)}</time>
              </div>
            `;
          } else {
            modalBody.innerHTML = `<div class="text-danger">❌ ${window.__('Characters.Modal.failed_to_load')}</div>`;
          }
        })
        .catch(() => {
          modalBody.innerHTML = `<div class="text-danger">❌ ${window.__('Characters.Modal.error_loading')}</div>`;
        });

      modal.show();
    });
  });
});

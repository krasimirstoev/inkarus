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
                <p><strong>📚 Character Type:</strong> ${c.character_type || '-'}</p>
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
                <p><strong>🩺 Health:</strong> ${c.health_status || '-'}</p>
                <p><strong>📝 Author Notes:</strong> ${c.comment || '-'}</p>
              </div>
              <div class="modal-footer d-flex flex-column align-items-start mt-3 border-top pt-2">
                <time>🗓 Created: ${formatDate(c.created_at)}</time>
                <time>✏️ Updated: ${formatDate(c.updated_at)}</time>
              </div>
            `;
          } else {
            modalBody.innerHTML = `<div class="text-danger">❌ Failed to load character data.</div>`;
          }
        })
        .catch(() => {
          modalBody.innerHTML = `<div class="text-danger">❌ Error loading character.</div>`;
        });

      modal.show();
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const modal = new bootstrap.Modal(document.getElementById('editRelationModal'));
  const form = document.getElementById('editRelationForm');
  const input = document.getElementById('editRelationInput');

  let activeId = null;
  let activeProject = null;
  let activeDisplay = null;

  document.querySelectorAll('.btn-edit-relation').forEach(button => {
    button.addEventListener('click', () => {
      activeId = button.dataset.id;
      activeProject = button.dataset.project;
      input.value = button.dataset.relation;
      activeDisplay = button.closest('.list-group-item').querySelector('em');

      modal.show();
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    fetch(`/characters/${activeProject}/relationships/update/${activeId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ relation: input.value })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        if (activeDisplay) activeDisplay.textContent = input.value;
        modal.hide();
      } else {
        alert('Failed to update relation.');
      }
    })
    .catch(() => alert('Error updating relation.'));
  });
});

document.addEventListener('DOMContentLoaded', async () => {
  const timelineContainer = document.getElementById('timeline');
  const projectId = timelineContainer.dataset.projectId;

  // Fetch events for the project
  const { events } = await fetch(`/events/json/${projectId}`).then(r => r.json());
  if (!events || !events.length) return;

  // Clear timeline content
  timelineContainer.innerHTML = '';

  // Create axis line
  const axis = document.createElement('div');
  axis.className = 'timeline-axis';
  timelineContainer.appendChild(axis);

  // Loop through events
  events.forEach(ev => {
    const wrapper = document.createElement('div');
    wrapper.className = 'timeline-event';
    wrapper.dataset.id = ev.id;

    // Title on top
    const titleEl = document.createElement('div');
    titleEl.className = 'timeline-title';
    titleEl.textContent = ev.title;
    wrapper.appendChild(titleEl);

    // Line to dot
    const line = document.createElement('div');
    line.className = 'timeline-line';
    wrapper.appendChild(line);

    // Dot on axis
    const dot = document.createElement('div');
    dot.className = 'timeline-dot';
    wrapper.appendChild(dot);

    // Date below
    const dateEl = document.createElement('div');
    dateEl.className = 'timeline-date';
    dateEl.textContent = ev.event_date || '';
    wrapper.appendChild(dateEl);

    // Append to container
    timelineContainer.appendChild(wrapper);

    // Open modal on click
    wrapper.addEventListener('click', () => openEventForm(ev.id));
  });

  // "Add Event" button handler
  document.getElementById('btn-new-event').addEventListener('click', () => openEventForm());

  // Edit buttons
  document.querySelectorAll('#events-list .btn-edit').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      openEventForm(btn.dataset.id);
    });
  });

  // Delete buttons
  document.querySelectorAll('#events-list .btn-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Delete this event?')) return;
      const id = btn.dataset.id;
      const resp = await fetch(`/events/${projectId}/delete/${id}`, { method: 'DELETE' });
      const json = await resp.json();
      if (json.success) window.location.reload();
      else console.error('Delete failed', json);
    });
  });

  // Load modal and attach submit handler
  async function openEventForm(id) {
    const url = id ? `/events/${projectId}/edit/${id}` : `/events/${projectId}/new`;
    const html = await fetch(url).then(r => r.text());
    document.getElementById('eventModalBody').innerHTML = html;

    const modal = new bootstrap.Modal(document.getElementById('eventModal'));
    modal.show();

    attachFormHandler();
  }

  function attachFormHandler() {
    const form = document.getElementById('event-form');
    if (!form) return;

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const payload = new URLSearchParams(new FormData(form));
      const response = await fetch(form.action, {
        method: form.method,
        body: payload
      });
      const result = await response.json();
      if (result.success) window.location.reload();
      else console.error('Failed to save event', result);
    });
  }
});

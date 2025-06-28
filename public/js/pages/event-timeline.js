// event-timeline.js - JavaScript for handling the event timeline and modal form
document.addEventListener('DOMContentLoaded', async () => {
  const timelineContainer = document.getElementById('timeline');
  const projectId = timelineContainer.dataset.projectId;

  const { events } = await fetch(`/events/json/${projectId}`).then(r => r.json());
  if (!events || !events.length) return;

  timelineContainer.innerHTML = '';

  const axis = document.createElement('div');
  axis.className = 'timeline-axis';
  timelineContainer.appendChild(axis);

  events.forEach(ev => {
    const wrapper = document.createElement('div');
    wrapper.className = 'timeline-event';
    wrapper.dataset.id = ev.id;

    const titleEl = document.createElement('div');
    titleEl.className = 'timeline-title';
    titleEl.textContent = ev.title;
    wrapper.appendChild(titleEl);

    const line = document.createElement('div');
    line.className = 'timeline-line';
    wrapper.appendChild(line);

    const dot = document.createElement('div');
    dot.className = 'timeline-dot';
    wrapper.appendChild(dot);

    const dateEl = document.createElement('div');
    dateEl.className = 'timeline-date';
    dateEl.textContent = ev.event_date || '';
    wrapper.appendChild(dateEl);

    timelineContainer.appendChild(wrapper);

    wrapper.addEventListener('click', () => openEventForm(ev.id));
  });

  document.getElementById('btn-new-event').addEventListener('click', () => openEventForm());

  document.querySelectorAll('#events-list .btn-edit').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      openEventForm(btn.dataset.id);
    });
  });

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

  async function openEventForm(id) {
    const url = id ? `/events/${projectId}/edit/${id}` : `/events/${projectId}/new`;
    const html = await fetch(url).then(r => r.text());

    const modalBody = document.getElementById('eventModalBody');
    modalBody.innerHTML = html;

    const modalEl = document.getElementById('eventModal');
    const modal = new bootstrap.Modal(modalEl);
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

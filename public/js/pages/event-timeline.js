// public/js/pages/event-timeline.js

document.addEventListener('DOMContentLoaded', async () => {
  // 1) Grab timeline container and projectId
  const timelineContainer = document.getElementById('timeline');
  const projectId = timelineContainer.dataset.projectId;

  // 2) Fetch events JSON
  const { events } = await fetch(`/events/json/${projectId}`)
    .then(r => r.json());
  if (!events || !events.length) return;

  // 3) Render the simple sequence timeline
  timelineContainer.innerHTML = '';
  events.forEach(ev => {
    const slot = document.createElement('div');
    slot.className = 'timeline-event' + (ev.is_abstract ? ' abstract' : '');
    slot.dataset.id = ev.id;

    // 3a) Title box
    const titleBox = document.createElement('div');
    titleBox.className = 'title-box';
    titleBox.textContent = ev.title;
    slot.appendChild(titleBox);

    // 3b) Dot marker
    const dot = document.createElement('div');
    dot.className = 'dot';
    slot.appendChild(dot);

    // 3c) Date label
    const date = document.createElement('div');
    date.className = 'date';
    date.textContent = ev.event_date || '';
    slot.appendChild(date);

    timelineContainer.appendChild(slot);

    // click the slot to edit
    slot.addEventListener('click', () => openEventForm(ev.id));
  });

  // 4) “Add Event” button
  const btnNew = document.getElementById('btn-new-event');
  btnNew.addEventListener('click', () => openEventForm());

  // 5) Hook up Edit buttons in the list-group
  document.querySelectorAll('#events-list .btn-edit').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      openEventForm(btn.dataset.id);
    });
  });

    // 5b) Hook up Delete buttons via AJAX
  document.querySelectorAll('#events-list .btn-delete')
    .forEach(btn =>
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this event?')) return;
        const id = btn.dataset.id;
        const resp = await fetch(
          `/events/${projectId}/delete/${id}`,
          { method: 'DELETE' }
        );
        const json = await resp.json();
        if (json.success) window.location.reload();
        else console.error('Delete failed', json);
      })
    );

  // 6) Function to load & show the create/edit form
  async function openEventForm(id) {
    const url = id
      ? `/events/${projectId}/edit/${id}`    // ← fixed here
      : `/events/${projectId}/new`;

    const html = await fetch(url).then(r => r.text());
    document.getElementById('eventModalBody').innerHTML = html;

    const modal = new bootstrap.Modal(
      document.getElementById('eventModal')
    );
    modal.show();

    attachFormHandler();
  }

  // 7) AJAX form submission
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
      if (result.success) {
        window.location.reload();
      } else {
        console.error('Failed to save event', result);
      }
    });
  }
});

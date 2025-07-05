// public/js/quill/init/autosave.js

/**
 * Initialize autosave for a Quill editor.
 * @param {Quill} quill
 * @param {string|number} draftId
 * @param {number} autosaveIntervalMinutes – interval in minutes
 */
export function initAutosave(quill, draftId, autosaveIntervalMinutes = 1) {
  const lastSavedDisplay = document.getElementById('last-saved');
  const manualSaveBtn    = document.getElementById('manual-save');

  // calculate milliseconds from minutes
  const intervalMs = autosaveIntervalMinutes * 60 * 1000;
  console.log(`[Autosave] interval set to ${intervalMs} ms`);

  const saveContent = async (manual = false) => {
    const content = quill.root.innerHTML;
    try {
      const res = await fetch(`/drafts/update/${draftId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, manualSave: manual })
      });

      if (res.ok && lastSavedDisplay) {
        lastSavedDisplay.textContent = new Date().toLocaleTimeString();
      }
    } catch (err) {
      console.error('Autosave failed:', err);
    }
  };

  // use the dynamic interval instead of hard-coded 30000
  setInterval(saveContent, intervalMs);

  if (manualSaveBtn) {
    manualSaveBtn.addEventListener('click', () => saveContent(true));
  }

  const backBtn = document.getElementById('back-to-dashboard');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      saveContent().finally(() => {
        window.location.href = '/projects';
      });
    });
  }
}

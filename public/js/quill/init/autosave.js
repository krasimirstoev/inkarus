export function initAutosave(quill, draftId) {
  const lastSavedDisplay = document.getElementById('last-saved');
  const manualSaveBtn = document.getElementById('manual-save');

  const saveContent = async (manual = false) => {
    const content = quill.root.innerHTML;
    try {
      const res = await fetch(`/drafts/update/${draftId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, manualSave: manual })
      });

      if (res.ok) {
        const now = new Date();
        lastSavedDisplay.textContent = now.toLocaleTimeString();
      }
    } catch (err) {
      console.error('Autosave failed:', err);
    }
  };

  setInterval(saveContent, 30000);

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

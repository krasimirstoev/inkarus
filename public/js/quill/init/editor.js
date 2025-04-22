export function initEditor() {
  const editorForm = document.getElementById('editor-form');
  const wordCountDisplay = document.getElementById('word-count');

  const projectId = editorForm.dataset.projectId;
  const draftId = editorForm.dataset.draftId;

  const quill = new Quill('#quill-editor', {
    theme: 'snow'
  });

  quill.on('text-change', () => {
    const text = quill.getText().trim();
    const wordCount = text.length > 0 ? text.split(/\s+/).length : 0;
    wordCountDisplay.textContent = wordCount;
  });

  return { quill, projectId, draftId };
}

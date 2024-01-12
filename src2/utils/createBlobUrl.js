const createBlobUrl = (content) => {
  const MIME_TYPE = 'text/csv;charset=UTF-8';
  const UTF8_BOM = '\uFEFF';
  const blob = new Blob([UTF8_BOM + content], { type: MIME_TYPE });
  return window.URL.createObjectURL(blob);
};

export default createBlobUrl;

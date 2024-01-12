export const updateConfig = (rest) => {
  let existingConfig;
  try {
    existingConfig = JSON.parse(window.localStorage.getItem('config'));
  } catch (err) {
    // don't handle
  }

  const updatedConfig = {
    ...existingConfig,
    ...rest,
  };

  window.localStorage.setItem('config', JSON.stringify(updatedConfig));
};

export const getConfig = () => {
  try {
    return JSON.parse(window.localStorage.getItem('config'));
  } catch (err) {
    // don't handle
  }
  return null;
};

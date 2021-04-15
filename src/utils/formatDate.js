const formatDate = (date, options) =>
  new Intl.DateTimeFormat([navigator.language, 'en-US'], options).format(date);

export default formatDate;

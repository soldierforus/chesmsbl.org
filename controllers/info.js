/**
 * GET /rules
 * League Rules page.
 */
exports.rules = (req, res) => {
  res.render('rules', {
    title: 'League Rules'
  });
};

/**
 * GET /fields
 * Field Information page.
 */
exports.fields = (req, res) => {
  res.render('fields', {
    title: 'Field Information'
  });
};

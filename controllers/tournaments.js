/**
 * GET /tournaments
 * Tournaments page.
 */
exports.index = (req, res) => {
  res.render('tournaments', {
    title: 'Tournaments'
  });
};

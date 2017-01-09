/**
 * GET /standings
 * Standings page.
 */
exports.index = (req, res) => {
  res.render('standings', {
    path: req.path,
    title: 'Standings'
  });
};

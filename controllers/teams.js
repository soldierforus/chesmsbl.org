/**
 * GET /teams
 * Teams page.
 */
exports.index = (req, res) => {
  res.render('teams', {
    path: req.path,
    title: 'Teams'
  });
};

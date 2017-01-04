/**
 * GET /teams
 * Teams page.
 */
exports.index = (req, res) => {
  res.render('teams', {
    title: 'Teams'
  });
};

/**
 * GET /standings
 * Standings page.
 */
exports.index = (req, res) => {
  res.render('standings', {
    title: 'Standings'
  });
};

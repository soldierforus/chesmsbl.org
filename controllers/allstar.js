/**
 * GET /allstar
 * All-Stars page.
 */
exports.index = (req, res) => {
  res.render('allstar', {
    title: 'All-Stars'
  });
};

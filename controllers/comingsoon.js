/**
 * GET /rules
 * League Rules page.
 */
exports.index = (req, res) => {
  res.render('coming-soon', {
    title: 'Coming Soon'
  });
};

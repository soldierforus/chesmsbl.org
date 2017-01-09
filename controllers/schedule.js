/**
 * GET /schedule
 * Schedule page.
 */
exports.index = (req, res) => {
  res.render('schedule', {
    path: req.path,
    title: 'Schedule'
  });
};

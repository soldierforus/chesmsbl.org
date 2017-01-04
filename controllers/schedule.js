/**
 * GET /schedule
 * Schedule page.
 */
exports.index = (req, res) => {
  res.render('schedule', {
    title: 'Schedule'
  });
};

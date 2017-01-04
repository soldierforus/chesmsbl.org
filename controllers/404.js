/**
 * GET /*
 * Page Not Found page.
 */
exports.index = (req, res) => {
  res.render('404', {
    title: 'Page Not Found'
  });
};

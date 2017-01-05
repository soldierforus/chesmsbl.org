/**
 * GET /*
 * Page Not Found page.
 */
exports.index = (req, res) => {
  res.status(404).render('404', {
    title: 'Page Not Found'
  });
};

/**
 * GET /faq
 * FAQ page.
 */
exports.index = (req, res) => {
  res.render('faq', {
    title: 'FAQ'
  });
};

module.exports = (req, res) => {
  res.status(200).json({
    hasQuery: !!req.query,
    hasCookies: !!req.cookies,
    hasBody: !!req.body,
    typeofStatus: typeof res.status,
    typeofJson: typeof res.json
  });
};

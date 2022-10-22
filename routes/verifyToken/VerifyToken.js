// Verify Token

module.exports = function verifyToken(req, res, next) {
  // GEt auth header value
  const bearerHeder = req.headers['authorization'];

  console.log(bearerHeder);

  // check bearer
  if (typeof bearerHeder !== 'undefined') {
    next();
  } else {
    // Forbedden
    return res.status(403).json({
      status: 'failure',
      message: 'unauthorized',
    });
  }
};


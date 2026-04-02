const jwt = require('jsonwebtoken');

function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ erro: '❌ Token de acesso requerido' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload;
    next();
  } catch (err) {
    return res.status(403).json({ erro: '❌ Token inválido ou expirado' });
  }
}

function autenticarAdmin(req, res, next) {
  autenticarToken(req, res, () => {
    if (!['admin', 'gestor'].includes(req.usuario.role)) {
      return res.status(403).json({ erro: '❌ Acesso restrito a administradores' });
    }
    next();
  });
}

module.exports = { autenticarToken, autenticarAdmin };

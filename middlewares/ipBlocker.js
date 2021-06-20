exports.ipBlocker = (req, res, next) => {
  const remoteAddresParams = req.ip.split(':');
  const clientIP = remoteAddresParams[remoteAddresParams.length - 1];
  const isClientBlocked = req.blockedIPs.find(ip => ip.toString() === clientIP.toString());

  if (isClientBlocked) {
    res.status(403);
    res.json({ success: 0, message: 'you are blocked for some reason' });
  } else {
    next()
  }
};

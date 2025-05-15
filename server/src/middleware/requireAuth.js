import { model } from "../index.js";

const requireAuth = (req, res, next) => {
  const { id } = req.session;
  model.clearSessions();
  if (model.findSessionById(id) === undefined) {
    res.status(401).end();
    return;
  }
  next();
};

export default requireAuth;

import model from "../model.js";

export const requireAuth = (req, res, next) => {
    const { id } = req.session;
    if (model.findSessionById(id) === undefined) {
        console.log("Session not found");
        res.status(401).end();
        return;
    }
    next();
    
};
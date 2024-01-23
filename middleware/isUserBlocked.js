const registercollection = require('../models/registerSchema');

const isuserBlocked = async (req,res,next) => {
    const checkUser = await registercollection.findOne({email:req.session.user})
    if(checkUser.isBlock == false) {
        next();
    } else {
        res.redirect('/logout');
    }
}

module.exports = isuserBlocked ;
const isAdminLogged = (req,res,next) => {
    if(req.session.admin){
        next();
    }else{
        res.redirect("/admin/signin");
    }
}

module.exports = isAdminLogged;
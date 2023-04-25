const isUserLoggedIn = (req, res, next)=>{
    if(!req.session.isAuthenticated){
        return res.render('message', {pageTitle: 'Error', message: 'User is not logged in!', isAuthenticated : false});
    };
    next();
};

module.exports = {
    isUserLoggedIn
}
get404 = (requset,response,next)=>{
    response.status(404).render('404', {pageTitle: 'Page Not Found', isAuthenticated: requset.isAuthenticated});
};

module.exports = {
    get404:get404
}
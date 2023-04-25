const bcrypt = require('bcryptjs');
const Users = require('../model/users.js');
const mailer = require('nodemailer');
const mailerTransport = require('nodemailer-sendgrid-transport');
const sgMail = require('@sendgrid/mail');
const cryto = require('crypto');
const {validationResult} = require('express-validator');

sgMail.setApiKey('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');

const mailMsg = {
    to: '',
    from: 'aishwaryavhatkar13@gmail.com',
    subject: `Welcome to Aishwarya's`,
    text: 'Hope you find what you are looking for',
    html: '<strong>You are registered successfully!</strong>'
}

// const transporter = mailer.createTransport(mailerTransport({
//     auth:{
//         api_key: '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'
//     }
// }))
//Display login page
handleLogin = (req, res, next)=>{
    //const cookie = req.get('Cookie');
    //const isLoggedIn = cookie ? req.get('Cookie').split(';')[0].trim().split('=')[1] : false;
    //console.log(req.session.isLoggedIn);
    res.render('auth/login',{
        pageTitle: 'Login',
        message: req.flash('message')
        //isAuthenticated: false
    });
};

/**
 * If creds are incorrect redirect to login page
 * If creds are correct redirect to index page
 * If user is not present in DB redirect to login page again
 */
postLogin = (req, res, next)=>{
    //res.setHeader('Set-Cookie', 'loggedIn=true; httponly');
    let emaill = req.body.email, passwordd = req.body.password;
    Users.getUserByEmail(emaill).then((user)=>{
        if(!user){//If user is not present in the database
            //return req.flash('message', 'User not present in DB!');
            //res.redirect('/login');
            console.log('User not present in DB!');
            return res.render('message', {pageTitle: 'Error', message: 'User not present in DB!', isAuthenticated : false});
        };
        if(user && user.password){
            bcrypt.compare(passwordd, user.password).then((doMatch)=>{
                if(doMatch){
                    console.log('doMatch')
                    req.session.isAuthenticated = true;
                    req.session.user = user;
                    res.render('shop/index',{
                        pageTitle: `Aishwarya's`, 
                        isAuthenticated: req.session.isAuthenticated
                    })
                }else{
                    console.log('does not Match');
                    req.flash('message', 'Incorrect password!');
                    res.redirect('/login');
                    //return res.render('message', {pageTitle: 'Error', message: 'Incorrect password!', isAuthenticated : false})
                }
            }).catch((err)=>{
                console.log('postLogin', err);
            })
        }
        
    });
    // Users.getUserById('5feb56c7db63d33204551df5').then((userInfo)=>{
    //     //console.log('userInfo',userInfo);
    //     req.session.user = new Users(userInfo.name, userInfo.email, userInfo.cart, userInfo._id);//userInfo;
    //     req.session.isAuthenticated = true;
    //     res.redirect('/');
    // }).catch((error)=>{
    //     console.log('error',error);
    // });
};

//Logout
logout = (request, response, next)=>{
    request.session.destroy((err)=>{
        response.redirect('/');
    })
};

//Display signup page
signUp = (request, response, next)=>{
    response.render('auth/signup',{
        pageTitle: 'Register',
        //isAuthenticated: false
    });
};

register = (request, response, next)=>{
    const {email, password, confirmPassword} = request.body;
    mailMsg.email = email;
    //const errors = validationResult(request);
    if(!errors.isEmpty()){
        console.log('validation error',errors.array());
        return response.status(422).render('message', {pageTitle: 'Error', message: errors.array()[0].msg});
    }
    Users.getUserByEmail(email).then((userInfo)=>{
        if(userInfo){
            response.render('message', {pageTitle: 'Error', message: 'User already exists!', //isAuthenticated : false
        });
            //return response.redirect('/signup');
        }else{
            return bcrypt.hash(password, 12).then((hashedPassword)=>{
                console.log('hashedPww', hashedPassword)
                let newUser = new Users(email,hashedPassword, {});
                console.log('newUser', newUser);
                return newUser.save();
            }).then(()=>{
                response.render('message', {pageTitle: 'Success', message: 'User registered successfully!!'})
                sgMail
                .send(mailMsg)
                .then(() => {
                    console.log('Mail sent');
                }, error => {
                    //console.log('Mail error', error);
                });
            });
        };
    }).catch((error)=>{
        console.log('error',error);
        response.render('message', {pageTitle: 'Success', message: error})
    });
};

getResetPage = (req, res, next)=>{
    res.render('auth/resetPassword',{
        pageTitle: 'Reset Password',
        message: req.flash('message')
    });
};

//Post reset password
postReset = (req, res, next)=>{
    let {email} = req.body;
    cryto.randomBytes(32, (err, buffer)=>{
        if(err){
            console.log('err', err);
            //return res.redirect('/resetPassword');
        }
        const token = buffer.toString('hex');
        Users.getUserByEmail(email).then(user =>{
            console.log('postReset',user);
            if(!user){
                //req.flash('message', 'No account found with that email!');
                return res.render('auth/resetPassword',{
                    pageTitle: 'Reset Password',
                    message: 'No account found with that email!'
                });
                //return res.redirect('/resetPassword');
            };
            let newUser = new Users(user.email, user.password, user.cart, user._id, token, Date.now() + 3600000);//new Users(user.email, user.cart, user._id,user.password, token, Date.now() + 3600000);
            return newUser.update();
        }).then(result =>{
            res.redirect('/');
            mailMsg.email = email;
            mailMsg.subject = 'Password Reset!';
            mailMsg.html = `<p>You requested a password reset!</p>
                            <p>Click this <a href='http://localhost:${process.env.PORT}/resetPassword/${token}'></a></p>`;
            sgMail
            .send(mailMsg)
            .then(() => {
                console.log('Mail sent');
            }, error => {
                console.log('Mail error', error);
            });
        }).catch(err=>{
            console.log('postReset err', postReset);
        });
    });
};

getNewPassword = (req, res, next)=>{
    const token = req.params.token;
    res.render('auth/newPassword', {
        pageTitle: 'New Password',
        message: '',
        token: token
    });
    // Users.getUserByToken(token).then((user)=>{
    //     console.log('getNewPassword', user);
    //     if(user){
    //          res.render('auth/newPassword', {
    //             pageTitle: 'New Password',
    //             message: '',
    //             //userId: user._id.toString()
    //         });
    //     }
    // }).catch((err)=>{
    //     console.log('err', err);
    // })
};

updatePassword = (req, res, next)=>{
    let {newpassword, token} = req.body, resetUser;
    console.log('token',token);
    Users.getUserByToken(token).then(user =>{
        console.log('updatePassword', user);
        resetUser = user;
        return bcrypt.hash(newpassword, 12);
    }).then(hashedPassword =>{
        let user = new Users(resetUser.email, hashedPassword, resetUser.cart, resetUser._id, undefined, undefined)
        return user.update();
    }).then(result =>{
        res.redirect('/');
    }).catch(err => {
        console.log('updatePassword error');
    });
};

module.exports = {
    handleLogin: handleLogin,
    postLogin: postLogin,
    logout: logout,
    signUp: signUp,
    register: register,
    getResetPage,
    postReset,
    getNewPassword
};
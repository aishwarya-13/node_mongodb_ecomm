const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

const {handleLogin, postLogin, logout, signUp, register, postReset} = require('../controller/auth');

router.get('/login', handleLogin);

router.post('/login', postLogin);

router.post('/logout', logout);

router.get('/signUp', signUp);//Display signup page

router.post('/register', check('email').isEmail().withMessage('Please enter a valid email').custom((value, {req})=>{
    if(value.includes('test')){
        throw new Error('This email is forbidden!');
    }
    return true;
}) ,register);

router.get('/resetPage', getResetPage);

router.post('/resetPassword', postReset);

router.get('/resetPassword/:token', getNewPassword);

router.post('/newPassword', updatePassword);

//http://localhost:8080/resetPassword/93d4016adf7182687df3d3f3ba82a1b9877bb163d2703ead6d7421696cec4e4b

module.exports = router;
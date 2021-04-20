// Require `checkUsernameFree`, `checkUsernameExists` and `checkPasswordLength`
// middleware functions from `auth-middleware.js`. You will need them here!


/**
  1 [POST] /api/auth/register { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "user_id": 2,
    "username": "sue"
  }

  response on username taken:
  status 422
  {
    "message": "Username taken"
  }

  response on password three chars or less:
  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
 */


/**
  2 [POST] /api/auth/login { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "message": "Welcome sue!"
  }

  response on invalid credentials:
  status 401
  {
    "message": "Invalid credentials"
  }
 */


/**
  3 [GET] /api/auth/logout

  response for logged-in users:
  status 200
  {
    "message": "logged out"
  }

  response for not-logged-in users:
  status 200
  {
    "message": "no session"
  }
 */

 
// Don't forget to add the router to the `exports` object so it can be required in other modules
const router = require('express').Router()
const Users = require('../users/users-model')
const bcrypt = require('bcryptjs')
const {checkUsernameFree,checkUsernameExists,checkPasswordLength} = require('./auth-middleware')

router.post('/register',checkUsernameFree, checkPasswordLength, (req,res,next) => {
  const {username, password} = req.body;
  const hash = bcrypt.hashSync(password,8)
  Users.add({username,password:hash})
    .then(user => {
      res.status(201).json(user)
    })
    .catch(next)
})

router.post('/login',checkUsernameExists, async (req,res) => {
  const {username, password} = req.body;
  const user = await Users.findBy({username});
  if(user && bcrypt.compareSync(password,user.password)){
    req.session.user = user;
    res.json({message:`Welcome ${username}`})
  } else{
    res.status(401).json({message:"invalid credentials"})
  }
})

router.get('/logout', (req,res,next) => {
  if ( req.session.user){
    req.session.destroy(err => {
      if (err){
        next({message:"sorry you can't leave"})
      }
      else{
        res.json({message:"logged out"})
      }
    })
  } else{
    res.status(404).json({message:'no session'})
  }
})

module.exports = router
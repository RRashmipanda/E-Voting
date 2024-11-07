const express = require("express");
const router=express.Router();
const User=require('./../models/user');
const {jwtAuthMiddleware,generateToken} = require('./../jwt');


//POST route to add a user
router.post('/signup',async(req,res) =>{
    try {
        const data = req.body  //Assuming the request body contains the user data

        // Check if there is already an admin user
        const adminUser = await User.findOne({ role: 'admin' });
        if (data.role === 'admin' && adminUser) {
            return res.status(400).json({ error: 'Admin user already exists' });
        }


         // Validate Aadhar Card Number must have exactly 12 digit
         if (!/^\d{12}$/.test(data.adharCardNumber)) {
          return res.status(400).json({ error: 'Aadhar Card Number must be exactly 12 digits' });
      }

      // Check if a user with the same Aadhar Card Number already exists
      const existingUser = await User.findOne({ adharCardNumber: data.adharCardNumber });
      if (existingUser) {
          return res.status(400).json({ error: 'User with the same Aadhar Card Number already exists' });
      }

        //Create a new User document using Mongoose Model
         const newuser=new User(data);
     
      //Save the new user to the database
      const response = await newuser.save();
      console.log('data saved');   

      const payload = {
        id : response.id
      }
      console.log(JSON.stringify(payload));
      const token=generateToken(payload);
      console.log("Token is" ,token)

      res.status(200).json({response:response, token:token})
    

    } catch (error) {
         console.log(error);
         res.status(500).json({error: 'Internal Server Error'})
     }
    
})

//Login Route
router.post('/login', async(req,res) =>{

  try{
    //Extract adharCardNumber and password from request body
    const {adharCardNumber,password} =req.body;

 // Check if aadharCardNumber or password is missing
 if (!adharCardNumber || !password) {
  return res.status(400).json({ error: 'Aadhar Card Number and password are required' });
}


     //find the user by Adharnumber
    const user = await User.findOne({adharCardNumber: adharCardNumber}) ;

    //If user doesnot exist or password doesnot match return error
    if(!user|| !(await user.comparePassword(password))) {
        return res.status(401).json({error: "Invalid username or password"})
    }

     //generate token
     const payload = {
        id: user.id,
     }
     const token=generateToken(payload);

     //return token as response
     res.json({token})
  }catch(err){
    console.log(err);
    res.status(500).json({error: 'Internal Server Error'})
  }
})


//profile Route
router.get('/profile', jwtAuthMiddleware, async(req,res) =>{
  try{ 
    const userData = req.user;
    const userId = userData.id;
    const user = await User.findById(userId);
    res.status(200).json({user});

  }catch(err){
       console.error(err);
       res.status(500).json({error: 'Internal Server Error'});
  }
})


//Change Password
router.put('/profile/password', async(req,res) =>{
  try{
    const userId = req.user.id; //Extract the id from the token
    const {currentPassword, newPassword} = req.body // Extract current and new passwords from request body

    //Check if currentPassword and newPassword are present in the request body
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Both currentPassword and newPassword are required' });
    }


      //find the user by userID
      const user = await User.findById(userId);

    //If password doesnot match return error
    if(!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({error: "Invalid username or password"})
  }

    // update the user's password
    user.password = newPassword;
    await user.save();


    console.log('passwordupdated');
    res.status(200).json({message: 'Password updated'});
  }catch(err){
     console.log(err);
     res.status(500).json({error: 'Internal Server Error'})
  }
})

module.exports = router;

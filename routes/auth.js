const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

// REGISTER
router.post("/register", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.SECRET_KEY
    ).toString(), //encrypting the password
  });
  try {
    const user = await newUser.save();
    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json(error);
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json(`User don't exist with given emailID`);
    }

    // decrypting password for comparing
    const decrypted = CryptoJS.AES.decrypt(
      user.password,
      process.env.SECRET_KEY
    );
    const originalPassword = decrypted.toString(CryptoJS.enc.Utf8);

    if (originalPassword !== req.body.password) {
      return res.status(401).json("Invalid credentials");
    }

    const accessToken = jwt.sign(//to get more security on our account. pehle aggr mai user delete krna chahta toh mai id bhejta aur vo meri id compare krke delete kr deta pr aggr meri id kisi aur ko pta hoti toh vo bhi ye kr pata par ab mai kuch nhi bhejunga ab vo mera access token check krke ye kaam krega aur access token kisi ke liye pta krna near to impossible hai 
      { id: user._id, isAdmin: user.isAdmin },
      process.env.SECRET_KEY
      // ,{expiresIn:'5d'}
    );

    const { password, ...info } = user._doc; //This is because we don't want to send password. so now we will send info instead of user in res.json
    return res.status(200).json({...info,accessToken});
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;

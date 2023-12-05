const router=require('express').Router();
const User=require('../models/User');
const CryptoJS = require("crypto-js");
const verify = require('../verifyToken');

// UPDATE ---> isme dikkat ye hai ki aggr mai kisi user se login hun toh ye kisi doosre user ko update krdeta hai.Pattern ye hai ki agrr update mei jo id di hai aur ussi id wale bnde ka token header mei daala hai toh update ho jayega firr chahe kisi se bhi login ho. Later mere dimag mei iska ek explanation aaya ki hum jb login krte hain toh humse accestoken milta hai wo token ab update ke time header mei set ho jayega(ye functionality bd mei aayegi) login krne ke bd ab jiska accessToken currently set hai ussi ki id deni hogi update krne ke liye lekin aggr vo id hi di hai aur maine login kisi aur se kra diya toh uska accessToken set ho jayega aur jiski id hai usse match nhi krega soinvalid ho ajyega. pr mere case mei jb mai kisi aur se login krta hun toh doosra token apne aap set nhi hota is;iye kisi aur ke login hone pr bhi update ho jaata hai kyuki hrader mei token abhi bhi previously logged bnde ka hai aur id bhi uski likhi hai url mei.
router.put('/:id',verify,async(req,res)=>{
    if(req.user.id===req.params.id || req.user.isAdmin){//ya toh vo admin hona chahiye ya jo update krna chahta hai usne jo id di hai(req.params.id) vo usi user ki id honi chahiye(req.user.is)
        if(req.body.password){//Aggr user password bhi update krna chata hai(yaani usne body mei password bhi diya hai) toh usko encrypt krna pdega na update krne se pehle
            req.body.password=CryptoJS.AES.encrypt(
                req.body.password,
                process.env.SECRET_KEY
              ).toString()
        }

        try {
            const updatedUser=await User.findByIdAndUpdate(req.params.id,{
                $set: req.body
            },{new:true})
            return res.status(200).json(updatedUser);
        } catch (error) {//Isme tb aa skta hai jb jo user access krna chata hai vo db mai hi nhi hai(usne jo req.params.id di aur uski jo id hai vo toh match kr rhi hai pr vo user exist nhi krta hmare db mei)
            return res.status(500).json(error);
        }
    }else{
        return res.status(403).json('You can update only your account');
    }
})

// DELETE --> delete mei bhi vo same issue hai. Condition ye hai ki jiski url mei id hai aggr usi ka token header mei hai toh delte ho jayega ya fir jiska token header mei hai vo admin hai toh url mei kisi ki bhi id ho vo delete(ya update) ho jayega
router.delete('/:id',verify,async(req,res)=>{
    if(req.user.id===req.params.id || req.user.isAdmin){
        try {
            await User.findByIdAndDelete(req.params.id)
            return res.status(200).json('User has been deleted...');
        } catch (error) {
            return res.status(500).json(error);
        }
    }else{
        return res.status(403).json('You can delete only your account');
    }
})

// GET
router.get('/find/:id',async(req,res)=>{
        try {
            const user=await User.findById(req.params.id)
            const {password,...info}=user._doc;
            return res.status(200).json(info);
        } catch (error) {
            return res.status(500).json(error);
        }
})

// GET ALL
router.get('/',async(req,res)=>{
    const query=req.query.new;//agrr mai url mei query ke sth new='true' dunga toh mai chahta hun ki last 10(ya any number n) user fetch ho uske liye hai ye
        try {
            const users=query ? await User.find().sort({_id:-1}).limit(5) : await User.find();
            return res.status(200).json(users);
        } catch (error) {
            return res.status(500).json('You are not allowed to see all users!');
        }
})

//GET USER STATS
router.get("/stats", async (req, res) => {
    const today = new Date();
    const lastYear = today.setFullYear(today.setFullYear() - 1);
  
    try {
      const data = await User.aggregate([
        {
          $project: {
            month: { $month: "$createdAt" },
          },
        },
        {
          $group: {
            _id: "$month",
            total: { $sum: 1 },
          },
        },
      ]);
      res.status(200).json(data)
    } catch (err) {
      res.status(500).json(err);
    }
  });

module.exports=router;
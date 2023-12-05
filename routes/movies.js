const router=require('express').Router();
const Movie=require('../models/Movie');
const verify = require('../verifyToken');

// CREATE
router.post('/',verify,async(req,res)=>{
    if(req.user.isAdmin){
        const newMovie=new Movie(req.body);

        try {
            const savedMovie=await newMovie.save();
            return res.status(201).json(savedMovie);
        } catch (error) {
            return res.status(500).json(error);
        }
    }else{
        return res.status(403).json('You are not allowed');
    }
})

// UPDATE
router.put('/:id',verify,async(req,res)=>{
    if(req.user.isAdmin){
        try {
            const updatedMovie=await Movie.findByIdAndUpdate(req.params.id,{$set:req.body},{new:true})
            return res.status(200).json(updatedMovie);
        } catch (error) {
            return res.status(500).json(error);
        }
    }else{
        return res.status(403).json('You are not allowed');
    }
})

// DELETE
router.delete('/:id',verify,async(req,res)=>{
    if(req.user.isAdmin){
        try {
            await Movie.findByIdAndDelete(req.params.id);
            return res.status(200).json('The movie has been deleted...');
        } catch (error) {
            return res.status(500).json(error);
        }
    }else{
        return res.status(403).json('You are not allowed');
    }
})

// GET
router.get('/find/:id',verify,async(req,res)=>{
        try {
            const movie=await Movie.findById(req.params.id);
            return res.status(200).json(movie);
        } catch (error) {
            if (!res.headersSent) {
                return res.status(500).json(error);
              }
        }
})

// GET RANDOM --> This is to be on homepage after every refresh we should see a new movie home page
router.get('/random',verify,async(req,res)=>{
        const type=req.query.type;// random?type=series or random?type=movie
        let movie;
        try {
            if(type==='series'){
                movie=await Movie.aggregate([
                    {$match:{isSeries:true}},
                    {$sample:{size:1}},
                ])
            }else{
                movie=await Movie.aggregate([
                    {$match:{isSeries:false}},
                    {$sample:{size:1}},
                ])
            }
            return res.status(200).json(movie);
        } catch (error) {
            if (!res.headersSent) {
                return res.status(500).json(error);
              }
              
        }
})

// GET ALL
router.get('/',verify,async(req,res)=>{
    const query=req.query.new;
    if(req.user.isAdmin){
        try {
            const movies=query ? await Movie.find().sort({_id:-1}).limit(5):await Movie.find();
            return res.status(200).json(movies.reverse());
        } catch (error) {
            return res.status(500).json(error);
        }
    }else{
        return res.status(403).json('You are not allowed');
    }
})


module.exports = router;
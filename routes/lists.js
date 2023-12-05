const router=require('express').Router();
const List=require('../models/List');
const verify = require('../verifyToken');

// CREATE
router.post('/',verify,async(req,res)=>{
    if(req.user.isAdmin){
        const newList=new List(req.body);

        try {
            const savedList=await newList.save();
            return res.status(201).json(savedList);
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
            await List.findByIdAndDelete(req.params.id);
            return res.status(201).json('The list has been deleted...');
        } catch (error) {
            return res.status(500).json(error);
        }
    }else{
        return res.status(403).json('You are not allowed');
    }
})

// GET
router.get('/',verify,async(req,res)=>{
    const typeQuery=req.query.type;
    const genreQuery=req.query.genre;
    let list=[];
    
    try {
        if(typeQuery){
            if(genreQuery){
                list=await List.aggregate([
                    {$sample:{size:10}},
                    {$match:{type:typeQuery, genre:genreQuery}}
                ])
            }
            else{//aggr typeQuery hai pr genreQuery nhi hai toh jo type diya hai uski movies(ya series) utha lega unka genre dekhe bina. aggr movies hai toh movies utha lega(10) kisi bhi genre ki aur same for series
                list=await List.aggregate([
                    {$sample:{size:10}},
                    {$match:{type:typeQuery}}
                ])
            }
        }else{// if no typeQuery (movie or series) is provided then we can randomly fetch movies or series from the list
            list = await List.aggregate([{$sample:{size:10}}]);
        }

        return res.status(200).json(list);
    } catch (error) {
        if (!res.headersSent) {
            return res.status(500).json(error);
          }
          
        }
})


module.exports = router;
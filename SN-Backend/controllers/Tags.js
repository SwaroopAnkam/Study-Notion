const Tag = require("../models/Tags");

exports.createTag = async(req, res) => {
    try{
        const{name, description} = req.body;

        if(!name || !description){
            return res.status(400).json({
                success : false,
                message : "All Fields Are Required, Please Fill All The Details",
            })
        }

        const tagDetails = await Tag.create({
            name : name,
            description : description,
        })
        console.log(tagDetails);

        return res.status(200).json({
            success : true,
            message : "Tag Created Successfully",
        })
    }
    catch(error){
        return res.status(500).json({
            success : false,
            message : error.message,
        })
    }
}

exports.showAllTags = async(req, res) => {
    try{
        const allTags = await Tag.find({}, {
            name : true,
            description : true,
        })
        res.status(200).json({
            success : true,
            message : "All Tags Returned Successfully",
            allTags,
        })
    }
    catch(error){
        return res.status(500).json({
            success : false,
            message : "Cannot FetchD Tags Data",
            error : error.message,
        })
    }
}
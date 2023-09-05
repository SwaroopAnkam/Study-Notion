const Category= require("../models/Category");

exports.createCategory = async(req, res) => {
    try{
        const{name, description} = req.body;

        if(!name || !description){
            return res.status(400).json({
                success : false,
                message : "All Fields Are Required, Please Fill All The Details",
            })
        }

        const categoryDetails = await Category.create({
            name : name,
            description : description,
        })
        console.log(categoryDetails);

        return res.status(200).json({
            success : true,
            message : "Category Created Successfully",
        })
    }
    catch(error){
        return res.status(500).json({
            success : false,
            message : error.message,
        })
    }
}

exports.showAllCategories = async(req, res) => {
    try{
        const allCategory = await Category.find({}, {
            name : true,
            description : true,
        })
        res.status(200).json({
            success : true,
            message : "All Categories Returned Successfully",
            allCategory,
        })
    }
    catch(error){
        return res.status(500).json({
            success : false,
            message : "Cannot Fetch Categories Data",
            error : error.message,
        })
    }
}
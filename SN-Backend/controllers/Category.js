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

exports.categoryPageDetails = async(req, res) => {
    try{
        const categotyId = req.body;
        
        const selectedCategory = await Category.findById(categoryId)
        .populate("Course")
        .exec();

        console.log(selectedCategory);

        if(!selectedCategory){
            console.log("Category Not Found.");
			return res
				.status(404)
				.json({ success : false,
                        message : "Category Not Found"
                    });
        }

        if(selectedCategory.courses.length == 0){
            console.log("No Courses Found for the Selected Category.");
			return res.status(404).json({
				success : false,
				message : "No Courses Found for the Selected Category.",
			});
        }

        const selectedCourses = selectedCategory.courses;

        const categoriesExceptSelected = await Category.findById({
            _id: { $ne: categoryId },
        })
        .populate("Course")
        .exec();

        let differentCourses;
        for(const category of categoriesExceptSelected){
            differentCourses.push(...category.courses);
        };

        const allCategories = await Category.find().populate("courses");
		const allCourses = allCategories.flatMap((category) => category.courses);
		const mostSellingCourses = allCourses
			.sort((a, b) => b.sold - a.sold)
			.slice(0, 10);

            res.status(200).json({
                selectedCourses : selectedCourses,
                differentCourses : differentCourses,
                mostSellingCourses : mostSellingCourses,
            });

    }
    catch(error){
        return res.status(500).json({
			success : false,
			message : "Internal Server Error",
			error : error.message,
		});
	}   
}

// create top rated course



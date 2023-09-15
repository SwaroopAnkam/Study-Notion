const Category = require("../models/Category");

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "Both 'name' and 'description' fields are required.",
      });
    }

    const categoryDetails = await Category.create({
      name: name,
      description: description,
    });

    console.log(categoryDetails);

    return res.status(200).json({
      success: true,
      message: "Category Created Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to Create a Category.",
      error: error.message,
    });
  }
};

exports.categoryPageDetails = async (req, res) => {
  try {
    const categoryId = req.body;

    const selectedCategory = await Category.findById(categoryId)
      .populate("courses")
      .exec();

    if (!selectedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category Not Found",
      });
    }

    if (selectedCategory.courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Courses Found for the Selected Category",
      });
    }

    const selectedCourses = selectedCategory.courses;

    const categoriesExceptSelected = await Category.find({
      _id: { $ne: categoryId },
    }).populate("courses");

    const differentCourses = categoriesExceptSelected.flatMap(
      (category) => category.courses
    );

    const allCategories = await Category.find().populate("courses");
    const allCourses = allCategories.flatMap((category) => category.courses);
    const mostSellingCourses = allCourses
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10);

    const topRatedCourses = allCourses
      .filter((course) => course.ratingAndReviews.rating)
      .sort((a, b) => b.ratingAndReviews.rating - a.ratingAndReviews.rating)
      .slice(0, 10);

    res.status(200).json({
      selectedCourses: selectedCourses,
      differentCourses: differentCourses,
      mostSellingCourses: mostSellingCourses,
      topRatedCourse: topRatedCourse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.showAllCategories = async (req, res) => {
  try {
    const allCategories = await Category.find(
      {},
      {
        name: true,
        description: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "All Categories Returned Successfully",
      allCategory: allCategories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories data",
      error: error.message,
    });
  }
};

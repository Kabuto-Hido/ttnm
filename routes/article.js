const express = require("express");
const router = express.Router();
const { verifyAdminRole, verifyToken } = require("../middlewares/jwt_service");
const Article = require("../models/article");
require("dotenv").config();

//get all articles
router.get("/getAll", async (req, res) => {
  try {
    const articles = await Article.find().sort({ createAt: -1 });
    if (articles.length === 0) {
      return res.json({ success: false, message: "No articles found" });
    }
    return res.json({ success: true, articles: articles });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

//create a new article
router.post("/create", verifyToken, async (req, res) => {
  const { title, image, description } = req.body;
  try {
    if (!title || !image || !description) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all fields" });
    }
    const article = new Article({ ...req.body });
    article.empId = req.account.accountId;
    await article.save();
    return res.json({ success: true, article: article });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

// edit article
router.put("/edit/:id", verifyAdminRole, async (req, res) => {
  const { title, image, description, articleCateId } = req.body;
  try {
    if (!title || !image || !description || !articleCateId) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all fields" });
    }
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res
        .status(404)
        .json({ success: false, message: "Article not found" });
    }
    article.title = title;
    article.image = image;
    article.description = description;
    article.articleCateId = articleCateId;
    article.empId = req.account.accountId;
    await article
      .save()
      .then(() => res.status(200).json({ success: true, article: article }))
      .catch(() =>
        res
          .status(404)
          .json({ success: false, message: "Article does not save" })
      );
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

//get by id
router.get("/:id", async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res
        .status(404)
        .json({ success: false, message: "Article not found" });
    }
    return res.json({ success: true, article: article });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

module.exports = router;

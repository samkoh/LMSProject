//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");

const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//(1) Mongoose connection settings
const mongoose = require("mongoose");
//LOCALHOST
//mongoose.connect('mongodb://localhost:27017/moduleListDB', { useNewUrlParser: true });

//PROD
mongoose.connect('mongodb+srv://dbenvtest:test123@cluster0.evqqz.mongodb.net/lmsModuleDB', { useNewUrlParser: true });

//(2) Create database schema
const itemSchema = new mongoose.Schema({
    title: {
        type: String,
        require: [true, "This is required field"]
    },
    objectives: {
        type: String
    },
    description: {
        type: String
    }
});

//(3) Create database model
const Item = mongoose.model("Item", itemSchema);

//(4) Insert Data Collection
const defaultItem = new Item({
    title: "Selling Smarter ",
    objectives: "In this course, you will learn why consultative and customer-focused selling are so important. You’ll also learn about the sales cycle, setting goals, ways to increase your average sale, and where to find new clients.",
    description: "The sales industry keeps evolving, and that means you need to keep growing too! Today’s successful salespeople focus on personal efficiency, delivering more to existing customers, and customer-focused selling. You can learn these skills with this course."
});

let moduleList = [];

app.get("/", function (req, res) {
    Item.find({}, function (err, moduleList) {
        res.render("home", { moduleContent: moduleList });
    });

});

app.get("/compose", function (req, res) {
    res.render("compose");
});

app.post("/compose", function (req, res) {
    const title = req.body.titleInput;
    const objectives = req.body.ObjectivesInput;
    const description = req.body.DescriptionInput;

    const postContent = new Item({
        title: title,
        objectives: objectives,
        description: description
    });

    postContent.save();
    res.redirect("/");
});

app.get("/posts/:postId", function (req, res) {
    const requestedPostId = req.params.postId;

    Item.findOne({ _id: requestedPostId }, function (err, itemsList) {
        res.render("post", { postId: itemsList._id, postTitle: itemsList.title, postObjectives: itemsList.objectives, postDescription: itemsList.description });
    });
});

app.get("/update/:postId", function (req, res) {
    const requestedPostId = req.params.postId;
    Item.findOne({ _id: requestedPostId }, function (err, itemsList) {
        res.render("update", { postId: itemsList._id, postTitle: itemsList.title, postObjectives: itemsList.objectives, postDescription: itemsList.description });
    });
});

app.post("/submit/:postId", function (req, res) {
    const id = req.body.idInput;
    const title = req.body.titleInput;
    const objectives = req.body.objectivesInput;
    const description = req.body.descriptionInput

    const _id = { _id: id };
    const newValues = { $set: { title: title, objectives: objectives, description: description } };
    Item.updateOne(_id, newValues, function (err, res) {
        if (!err) {
            console.log("Data Updated");
        }
    });
    res.redirect("/");
});

// app.listen(3000, function () {
//     console.log("Server started on port 3000");
// });

app.listen(process.env.PORT || 3000, function () {
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
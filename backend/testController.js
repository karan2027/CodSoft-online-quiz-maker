const mongoose = require("mongoose");
require("dotenv").config();
const { getAllQuizzes } = require("./controllers/quizController");

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected.");

    const req = {
      query: {
        category: "Artificial Intelligence",
        subcategory: "NLP"
      }
    };

    const res = {
      status(code) {
        console.log("Response Status:", code);
        return this;
      },
      json(data) {
        console.log("Response JSON Data:", JSON.stringify(data, null, 2));
        return this;
      }
    };

    await getAllQuizzes(req, res);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();

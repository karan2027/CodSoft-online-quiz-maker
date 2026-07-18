const mongoose = require('mongoose');
const Quiz = require('../models/Quiz'); // Ensure this points to your Quiz model
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// The Taxonomy matching your requirements
const taxonomy = {
  "Programming": ["HTML", "CSS", "JavaScript", "React", "Node.js", "Express.js", "MongoDB", "SQL", "Git & GitHub", "Python", "Java", "C", "C++", "Data Structures", "Algorithms", "OOP", "Operating System", "Computer Networks", "DBMS"],
  "Web Development": ["Frontend", "Backend", "Full Stack", "REST API", "Authentication", "Responsive Design", "Performance", "Deployment"],
  "Computer Science": ["OOP", "DBMS", "Operating System", "Computer Networks", "Software Engineering", "Compiler Design"],
  "Aptitude": ["Quantitative Aptitude", "Logical Reasoning", "Verbal Ability"],
  "Interview Preparation": ["HTML Interview", "CSS Interview", "JavaScript Interview", "React Interview", "Node.js Interview", "MongoDB Interview", "HR Interview"]
};

const seedData = [];

// Generate 4 quizzes for every subcategory
for (const [category, subcategories] of Object.entries(taxonomy)) {
  for (const subcategory of subcategories) {
    for (let i = 1; i <= 4; i++) {
      seedData.push({
        title: `${subcategory} Quiz ${i}`,
        description: `Test your knowledge in ${subcategory} - Quiz ${i}.`,
        category: category,
        subcategory: subcategory,
        difficulty: i % 2 === 0 ? 'medium' : 'easy',
        timeLimit: 15,
        passingPercentage: 60,
        totalMarks: 20,
        questionCount: 20,
        isPublic: true,
        status: 'published',
        questions: [], // You can populate this with your own MCQ questions
        tags: [category.toLowerCase(), subcategory.toLowerCase()]
      });
    }
  }
}

async function runSeed() {
  try {
    // Replace 'process.env.MONGO_URI' with your actual connection string if needed
    
    
    
    await mongoose.connect(process.env.MONGO_URI); 
    console.log("Connected to MongoDB Atlas.");

    await Quiz.deleteMany({}); // Clears existing quizzes
    await Quiz.insertMany(seedData);
    
    console.log(`Successfully seeded ${seedData.length} quizzes!`);
    console.log("Categories and subcategories are now ready for your frontend.");
    process.exit();
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

runSeed();
const jwt = require("jsonwebtoken");
const http = require("http");
require("dotenv").config();

const run = async () => {
  try {
    const userId = "6a5b341d0afff30115dd0263"; // Karan's user ID
    const secret = process.env.JWT_SECRET || "myOnlineQuizMakerSuperSecretKey2026";
    
    // Generate JWT token matching authMiddleware expectations
    const token = jwt.sign({ userId }, secret, { expiresIn: "7d" });
    console.log("Token Generated successfully.");

    const port = 5001; // target port 5001

    // Step 1: Fetch details of a seeded quiz (e.g. HTM101) to get its questions and _id
    const getOptions = {
      hostname: "localhost",
      port: port,
      path: "/api/quizzes/HTM101",
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    console.log("Fetching quiz HTM101...");
    const reqGet = http.request(getOptions, (resGet) => {
      let getData = "";
      resGet.on("data", (chunk) => {
        getData += chunk;
      });

      resGet.on("end", async () => {
        try {
          const quizResult = JSON.parse(getData);
          if (!quizResult.success || !quizResult.data) {
            console.error("Failed to fetch quiz details:", quizResult);
            process.exit(1);
          }

          const quiz = quizResult.data;
          console.log(`Successfully fetched quiz. Title: "${quiz.title}", ID: ${quiz._id}`);

          // Prepare mock answers for submission
          const mockAnswers = quiz.questions.map((q) => ({
            questionId: q._id,
            selectedOption: 0 // Select option index 0
          }));

          const submitBody = JSON.stringify({
            quizId: quiz._id,
            answers: mockAnswers,
            timeTaken: 120 // 2 minutes (numeric value)
          });

          // Step 2: Post attempt to /api/results/submit
          const postOptions = {
            hostname: "localhost",
            port: port,
            path: "/api/results/submit",
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(submitBody)
            }
          };

          console.log("Submitting quiz attempt to /api/results/submit...");
          const reqPost = http.request(postOptions, (resPost) => {
            console.log("Response Status:", resPost.statusCode);
            
            let postData = "";
            resPost.on("data", (chunk) => {
              postData += chunk;
            });

            resPost.on("end", () => {
              try {
                const submitResult = JSON.parse(postData);
                console.log("Submission Response:", JSON.stringify(submitResult, null, 2));
              } catch {
                console.log("Raw Response:", postData);
              }
              process.exit(0);
            });
          });

          reqPost.on("error", (err) => {
            console.error("Submission Request Failed:", err.message);
            process.exit(1);
          });

          reqPost.write(submitBody);
          reqPost.end();

        } catch (e) {
          console.error("Parsing quiz details failed:", e.message);
          process.exit(1);
        }
      });
    });

    reqGet.on("error", (err) => {
      console.error("Fetch Request Failed:", err.message);
      process.exit(1);
    });

    reqGet.end();
  } catch (err) {
    console.error("Script failed:", err.message);
    process.exit(1);
  }
};

run();

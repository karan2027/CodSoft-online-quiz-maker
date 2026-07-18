const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const crypto = require("crypto");
const User = require("../models/User");
const Category = require("../models/Category");
const Subcategory = require("../models/Subcategory");
const Quiz = require("../models/Quiz");

const categoryStructure = {
  Programming: [
    "HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", 
    "Node.js", "Express.js", "MongoDB", "SQL", "Git", "GitHub", 
    "Python", "Java", "C", "C++", "PHP", "Data Structures", 
    "Algorithms", "OOP", "DBMS", "Operating System", "Computer Networks", "Software Engineering"
  ],
  "Web Development": [
    "Frontend", "Backend", "Full Stack", "REST API", 
    "Authentication", "Responsive Design", "Deployment", "Performance"
  ],
  "Computer Science": [
    "Operating System", "DBMS", "Compiler Design", "Computer Networks", "Software Engineering"
  ],
  "Database": ["SQL", "NoSQL", "MongoDB", "PostgreSQL", "MySQL", "Redis"],
  "Mobile Development": ["React Native", "Flutter", "iOS", "Android", "Swift", "Kotlin"],
  "Artificial Intelligence": ["Machine Learning", "Deep Learning", "NLP", "Computer Vision", "Neural Networks"],
  "Machine Learning": ["Supervised Learning", "Unsupervised Learning", "Reinforcement Learning", "Scikit-Learn", "TensorFlow"],
  "Cloud Computing": ["AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Serverless"],
  "Cyber Security": ["Network Security", "Cryptography", "Ethical Hacking", "Web Security", "Penetration Testing"],
  "Data Science": ["Data Analysis", "Data Visualization", "Pandas", "NumPy", "Matplotlib", "Statistics"],
  "DevOps": ["CI/CD", "Jenkins", "Docker", "Kubernetes", "Terraform", "Ansible"],
  "Aptitude": ["Quantitative Aptitude", "Logical Reasoning", "Verbal Ability", "Data Interpretation"],
  "Interview Preparation": [
    "HTML Interview", "CSS Interview", "JavaScript Interview", "React Interview", 
    "Node.js Interview", "MongoDB Interview", "HR Interview"
  ]
};

const questionPool = {
  "HTML": [
    {
      questionText: "What does HTML stand for?",
      options: ["Hyper Text Markup Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language", "Hyper Tool Markup Language"],
      correctAnswer: 0,
      explanation: "HTML stands for Hyper Text Markup Language. It is the standard markup language for documents designed to be displayed in a web browser."
    },
    {
      questionText: "Which HTML element is used for the largest heading?",
      options: ["<heading>", "<h6>", "<h1>", "<head>"],
      correctAnswer: 2,
      explanation: "<h1> defines the most important and largest heading in HTML, whereas <h6> defines the least important."
    },
    {
      questionText: "What is the correct HTML element for inserting a line break?",
      options: ["<lb>", "<br>", "<break>", "<newline>"],
      correctAnswer: 1,
      explanation: "The <br> tag is an empty element used to insert a line break without starting a new paragraph."
    },
    {
      questionText: "Which attribute is used to specify a unique identifier for an HTML element?",
      options: ["class", "id", "name", "style"],
      correctAnswer: 1,
      explanation: "The 'id' attribute specifies a unique id for an HTML element, which must be unique within the HTML document."
    },
    {
      questionText: "What is the correct HTML for creating a hyperlink?",
      options: ["<a href=\"url\">Link Text</a>", "<a>url</a>", "<a url=\"url\">Link Text</a>", "<link href=\"url\">Link Text</link>"],
      correctAnswer: 0,
      explanation: "The <a> element (anchor tag) with the 'href' attribute is used to define hyperlinks in HTML."
    }
  ],
  "CSS": [
    {
      questionText: "What does CSS stand for?",
      options: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style Sheets", "Colorful Style Sheets"],
      correctAnswer: 1,
      explanation: "CSS stands for Cascading Style Sheets. It describes how HTML elements are to be displayed on screen, paper, or in other media."
    },
    {
      questionText: "Which CSS property controls the text size?",
      options: ["font-style", "text-size", "font-size", "text-style"],
      correctAnswer: 2,
      explanation: "The 'font-size' property sets the size of the font used for text elements in CSS."
    },
    {
      questionText: "How do you select an element with id 'demo' in CSS?",
      options: [".demo", "#demo", "*demo", "demo"],
      correctAnswer: 1,
      explanation: "The id selector uses the pound/hash symbol (#) followed by the id name of the element to select and style it."
    },
    {
      questionText: "What is the default value of the position property in CSS?",
      options: ["relative", "absolute", "static", "fixed"],
      correctAnswer: 2,
      explanation: "HTML elements are positioned static by default. Static positioned elements are not affected by the top, bottom, left, and right properties."
    },
    {
      questionText: "Which property is used to change the background color in CSS?",
      options: ["color", "bg-color", "background-color", "bgcolor"],
      correctAnswer: 2,
      explanation: "The 'background-color' property sets the background color of an element in CSS."
    }
  ],
  "JavaScript": [
    {
      questionText: "Which of the following is correct about JavaScript?",
      options: ["It is a compiled language", "It is client-side only", "It is high-level, interpreted, and multi-paradigm", "It is a strict subset of Java"],
      correctAnswer: 2,
      explanation: "JavaScript is a high-level, interpreted (or JIT-compiled), lightweight, and multi-paradigm programming language."
    },
    {
      questionText: "How do you write 'Hello World' in an alert box in JavaScript?",
      options: ["msgBox('Hello World');", "alertBox('Hello World');", "msg('Hello World');", "alert('Hello World');"],
      correctAnswer: 3,
      explanation: "The alert() method displays an alert box with a specified message and an OK button."
    },
    {
      questionText: "How do you create a function in JavaScript?",
      options: ["function:myFunction()", "function myFunction()", "function = myFunction()", "def myFunction()"],
      correctAnswer: 1,
      explanation: "A JavaScript function is defined with the 'function' keyword, followed by a name, followed by parentheses ()."
    },
    {
      questionText: "What is the correct way to write a JavaScript array?",
      options: ["const colors = (1:'red', 2:'green')", "const colors = ['red', 'green', 'blue']", "const colors = 'red', 'green', 'blue'", "const colors = 1=('red'), 2=('green')"],
      correctAnswer: 1,
      explanation: "JavaScript arrays are written with square brackets [] and items are separated by commas."
    },
    {
      questionText: "Which operator is used to assign a value to a variable in JavaScript?",
      options: ["*", "=", "x", "-"],
      correctAnswer: 1,
      explanation: "The '=' operator is the assignment operator in JavaScript. It assigns a value to a variable."
    }
  ],
  "React": [
    {
      questionText: "What is React?",
      options: ["A back-end framework", "A JavaScript library for building user interfaces", "A server-side database", "A CSS styling preprocessor"],
      correctAnswer: 1,
      explanation: "React is a free and open-source front-end JavaScript library for building user interfaces based on components."
    },
    {
      questionText: "Which hook is used to perform side effects in functional components?",
      options: ["useState", "useContext", "useEffect", "useMemo"],
      correctAnswer: 2,
      explanation: "The useEffect Hook lets you perform side effects (such as data fetching, subscriptions, or manual DOM updates) in function components."
    },
    {
      questionText: "What is JSX?",
      options: ["A database language", "A syntax extension for JavaScript that looks like HTML", "A brand new type of CSS", "A security standard"],
      correctAnswer: 1,
      explanation: "JSX stands for JavaScript XML. It is a syntax extension for JavaScript that allows you to write HTML-like structures inside JavaScript code."
    }
  ],
  "Operating System": [
    {
      questionText: "What is virtual memory in an OS?",
      options: ["RAM that is stored on a remote server", "A secondary memory addressing scheme", "A software emulation of CD-ROM", "Memory used only by graphics cards"],
      correctAnswer: 1,
      explanation: "Virtual memory allows secondary storage to act as primary memory during memory-intensive processing."
    },
    {
      questionText: "Which scheduling algorithm assigns each process a fixed time quantum in cyclic order?",
      options: ["First-Come First-Served", "Shortest Job First", "Round Robin", "Priority Scheduling"],
      correctAnswer: 2,
      explanation: "Round Robin scheduling assigns a fixed time quantum cyclically to each active process."
    }
  ],
  "DBMS": [
    {
      questionText: "What is a Primary Key in database design?",
      options: ["A key that encrypts database tables", "A column or set of columns that uniquely identifies each row in a table", "A password used to access the database", "The first field of any query output"],
      correctAnswer: 1,
      explanation: "A primary key uniquely identifies records, containing unique and non-null values."
    },
    {
      questionText: "Which SQL command is used to retrieve data from a database?",
      options: ["GET", "SELECT", "OPEN", "EXTRACT"],
      correctAnswer: 1,
      explanation: "The SELECT statement is used to retrieve and query data from one or more database tables."
    }
  ],
  "Quantitative Aptitude": [
    {
      questionText: "A train running at 60 km/hr crosses a pole in 9 seconds. What is the length of the train?",
      options: ["120 metres", "180 metres", "324 metres", "150 metres"],
      correctAnswer: 3,
      explanation: "Speed = 60 * (5/18) m/sec = 50/3 m/sec. Length = Speed * Time = (50/3) * 9 = 150 metres."
    },
    {
      questionText: "What is the average of the first five prime numbers?",
      options: ["5.6", "3.6", "5.4", "4.8"],
      correctAnswer: 0,
      explanation: "Prime numbers: 2, 3, 5, 7, 11. Sum = 28. Average = 28 / 5 = 5.6."
    }
  ]
};

const techPool = [
  {
    questionText: "Which of the following best describes the main purpose of {topic}?",
    options: ["To solve domain-specific problems and improve system workflow", "To style front-end container elements", "To compress localized configuration files", "To replace database caching layer"],
    correctAnswer: 0,
    explanation: "The primary purpose of {topic} is to enable developers to solve domain-specific problems and implement software workflows efficiently."
  },
  {
    questionText: "In {topic}, what does a compilation or runtime syntax error indicate?",
    options: ["The code violates language rules and cannot execute", "The server runs out of physical memory", "The user inputs are invalid", "The database fails to load"],
    correctAnswer: 0,
    explanation: "A syntax or compilation error in {topic} occurs when written code violates language constraints, preventing compiling or execution."
  },
  {
    questionText: "What is the average time complexity of a basic lookup operation in {topic} under optimal conditions?",
    options: ["O(1) or O(log n)", "O(n^2)", "O(2^n)", "O(n log n)"],
    correctAnswer: 0,
    explanation: "{topic} lookups are highly optimized, running in constant or logarithmic time depending on configuration."
  },
  {
    questionText: "Which of the following is a recommended best practice when writing {topic} code?",
    options: ["Write clean, self-documenting code with meaningful names", "Write all logic in a single file", "Avoid writing comments or documentation", "Use global variables for all state storage"],
    correctAnswer: 0,
    explanation: "Writing clean, self-documenting, and modular code is essential for maintainable and scalable {topic} applications."
  },
  {
    questionText: "What is the primary role of a package manager in {topic} development?",
    options: ["To manage external libraries and dependencies", "To compile code into machine language", "To deploy applications to cloud servers", "To generate mock database records"],
    correctAnswer: 0,
    explanation: "Package managers resolve, download, and install external dependencies required by {topic} projects."
  },
  {
    questionText: "How does {topic} handle asynchronous operations or concurrency?",
    options: ["Through event loops, threads, or promises", "By stopping all execution until finished", "By deleting conflicting database rows", "Through inline styling attributes"],
    correctAnswer: 0,
    explanation: "To execute non-blocking operations, {topic} relies on asynchronous models such as promises, tasks, or event loops."
  },
  {
    questionText: "What is a major security vulnerability commonly associated with {topic} if inputs are unvalidated?",
    options: ["Injection attacks or unauthorized data access", "Memory leaks in style sheets", "Slow server response times", "CPU overheating"],
    correctAnswer: 0,
    explanation: "Unvalidated input handling in {topic} represents a high security risk, leaving systems vulnerable to injection attacks."
  },
  {
    questionText: "Which command or function is standard for debugging variables in {topic}?",
    options: ["Log or print statements", "Rebuilding the application", "Deleting node_modules folder", "Restarting the local router"],
    correctAnswer: 0,
    explanation: "Developers use console logs or print functions to inspect runtime variable states during {topic} debugging."
  },
  {
    questionText: "What is the main benefit of modularizing code in {topic}?",
    options: ["Enhances code reusability and maintainability", "Makes code run twice as fast", "Prevents hackers from viewing source files", "Reduces CSS bundle sizes"],
    correctAnswer: 0,
    explanation: "Splitting {topic} code into modules increases overall readability, testing ease, and code reuse."
  },
  {
    questionText: "In {topic}, what is the difference between a local variable and a global variable?",
    options: ["Local is scoped inside a function; global is accessible anywhere", "Local is stored in DB; global in cache", "Local is read-only; global is mutable", "Local is faster than global"],
    correctAnswer: 0,
    explanation: "Scope defines variable visibility, where local is restricted to its block and global is universal across the application."
  },
  {
    questionText: "Which testing methodology is used to verify individual components of {topic}?",
    options: ["Unit Testing", "Stress Testing", "System Integration Testing", "Visual Regression Testing"],
    correctAnswer: 0,
    explanation: "Unit tests are dedicated to validating the correctness of the smallest isolated pieces of logic in {topic}."
  },
  {
    questionText: "What is the purpose of environment variables in {topic} configuration?",
    options: ["To store sensitive credentials and settings outside code", "To change the theme of the application", "To speed up JavaScript execution", "To validate form inputs"],
    correctAnswer: 0,
    explanation: "Environment variables keep API keys, credentials, and staging database links secure outside the repository."
  },
  {
    questionText: "Which version control system is most widely used in {topic} teams?",
    options: ["Git", "SVN", "Mercurial", "Perforce"],
    correctAnswer: 0,
    explanation: "Git is the industry-standard version control system used to track changes in {topic} source files."
  },
  {
    questionText: "What does the term 'Refactoring' mean in the context of {topic}?",
    options: ["Restructuring existing code without changing its external behavior", "Rewriting the code in another language", "Deleting unused libraries", "Deploying the code to staging"],
    correctAnswer: 0,
    explanation: "Refactoring improves code structure, readability, and performance without altering its functional behavior."
  },
  {
    questionText: "Which component is responsible for translating or compiling {topic} code?",
    options: ["Compiler or Interpreter", "Database Engine", "Cloud Router", "Text Editor"],
    correctAnswer: 0,
    explanation: "Compilers and interpreters translate high-level code into executable machine-readable formats."
  },
  {
    questionText: "What is the main function of API documentation in {topic}?",
    options: ["To explain how to integrate and use the code features", "To style the user interface", "To store user passwords", "To run unit tests"],
    correctAnswer: 0,
    explanation: "API documentation provides developers with specifications for integrating and using {topic} libraries."
  },
  {
    questionText: "Which pattern is standard for handling errors in {topic}?",
    options: ["Try-Catch blocks", "Ignoring errors to prevent crashes", "Redirecting to homepage", "Writing error codes to style sheets"],
    correctAnswer: 0,
    explanation: "Try-catch constructs are the standard error handling pattern for managing runtime exceptions gracefully."
  },
  {
    questionText: "What does 'API' stand for in {topic} integration?",
    options: ["Application Programming Interface", "Advanced Program Integration", "Automated Protocol Interface", "Active Page Index"],
    correctAnswer: 0,
    explanation: "Application Programming Interface (API) is a software intermediary that allows two applications to interact."
  },
  {
    questionText: "Which architectural style is common for web services integrating {topic}?",
    options: ["REST or GraphQL", "Symmetric Encryption", "Monolithic compilation", "LIFO execution"],
    correctAnswer: 0,
    explanation: "REST and GraphQL are popular formats for building APIs and fetching data for {topic}."
  },
  {
    questionText: "What is a main benefit of using strict data types in {topic}?",
    options: ["Catches type mismatch bugs during development", "Reduces styling complexity", "Enforces database backups", "Speeds up network downloads"],
    correctAnswer: 0,
    explanation: "Strict typing reduces runtime errors by catching data type mismatches during development cycles."
  }
];

const aiPool = [
  {
    questionText: "What is the primary goal of {topic} in modern systems?",
    options: ["To learn patterns from data and make predictions", "To style front-end components", "To encrypt password hashes", "To clean local browser cache"],
    correctAnswer: 0,
    explanation: "The core goal of {topic} is pattern recognition and predictive analysis using empirical datasets."
  },
  {
    questionText: "In {topic}, what does 'training data' refer to?",
    options: ["The dataset used to teach the model patterns", "The code written to compile algorithms", "The server used to run experiments", "The user interface mockups"],
    correctAnswer: 0,
    explanation: "Training data is the initial dataset used to train the machine learning algorithm to recognize patterns in {topic}."
  },
  {
    questionText: "What problem does 'Overfitting' describe in {topic}?",
    options: ["Model learns noise in training data and performs poorly on new data", "Model is too simple to capture trends", "Model uses too much RAM during execution", "Model is training too slowly"],
    correctAnswer: 0,
    explanation: "Overfitting occurs when a model fits the training data too closely, learning its noise and failing to generalize."
  },
  {
    questionText: "Which metric is standard for evaluating classification performance in {topic}?",
    options: ["Accuracy, Precision, or Recall", "Page load time", "Database query execution speed", "CSS file size"],
    correctAnswer: 0,
    explanation: "Accuracy, Precision, Recall, and F1 Score are standard metrics used to measure model classification success."
  },
  {
    questionText: "What is the purpose of validation datasets in {topic}?",
    options: ["To tune model hyperparameters and prevent overfitting", "To store final database archives", "To display output to the user", "To test server request limits"],
    correctAnswer: 0,
    explanation: "Validation sets provide an unbiased evaluation of a model fit while tuning model hyperparameters in {topic}."
  },
  {
    questionText: "Which mathematical foundation is most critical for understanding {topic}?",
    options: ["Linear Algebra and Probability", "Compiler parsing rules", "HTML document structures", "Network socket protocols"],
    correctAnswer: 0,
    explanation: "Linear algebra, calculus, and probability theory form the mathematical backbone of {topic} algorithms."
  },
  {
    questionText: "What is the main difference between supervised and unsupervised learning in {topic}?",
    options: ["Supervised uses labeled data; unsupervised uses unlabeled data", "Supervised is faster than unsupervised", "Supervised requires GPU; unsupervised requires CPU", "Supervised is for mobile; unsupervised for web"],
    correctAnswer: 0,
    explanation: "Supervised learning relies on training data with labeled outputs, while unsupervised learning uncovers structures in unlabeled data."
  },
  {
    questionText: "Which Python library is standard for data manipulation in {topic} pipelines?",
    options: ["Pandas or NumPy", "Django", "Flask", "Webpack"],
    correctAnswer: 0,
    explanation: "Pandas provides high-performance data structures and analysis tools required for data preprocessing in {topic}."
  },
  {
    questionText: "What is the role of an activation function in {topic} neural networks?",
    options: ["To introduce non-linearity into the network", "To store model weights in MongoDB", "To secure API keys", "To compile code faster"],
    correctAnswer: 0,
    explanation: "Activation functions introduce non-linear properties to neural networks, allowing them to learn complex patterns in {topic}."
  },
  {
    questionText: "In {topic}, what does 'feature engineering' involve?",
    options: ["Selecting and transforming raw data variables for the model", "Upgrading server hardware specs", "Designing UI layouts", "Writing unit test scripts"],
    correctAnswer: 0,
    explanation: "Feature engineering is the process of using domain knowledge to select and transform raw data features for model input."
  },
  {
    questionText: "Which algorithm is a popular choice for classification in {topic}?",
    options: ["Random Forest or SVM", "Dijkstra's Algorithm", "K-Means Clustering", "Bubble Sort"],
    correctAnswer: 0,
    explanation: "Random Forest, Support Vector Machines (SVM), and Logistic Regression are standard classification algorithms."
  },
  {
    questionText: "What is the purpose of regularization in {topic}?",
    options: ["To penalize complex models to prevent overfitting", "To format output strings", "To database indexing", "To speed up network requests"],
    correctAnswer: 0,
    explanation: "Regularization techniques (like L1/L2) add a penalty term to the loss function to discourage overfitting."
  },
  {
    questionText: "What does the term 'bias' represent in {topic} models?",
    options: ["Assumptions made by the model to simplify learning", "Unintentional discrimination in datasets", "The speed of training cycles", "The storage capacity of weights"],
    correctAnswer: 0,
    explanation: "Bias represents the simplifying assumptions made by a model to make target functions easier to learn in {topic}."
  },
  {
    questionText: "In {topic}, what is a neural network 'epoch'?",
    options: ["One full pass of the training dataset through the network", "The time taken to deploy the model", "The database row update interval", "A security standard"],
    correctAnswer: 0,
    explanation: "An epoch is completed when the entire training dataset has passed forward and backward through the neural network once."
  },
  {
    questionText: "Which loss function is common for regression tasks in {topic}?",
    options: ["Mean Squared Error (MSE)", "Binary Cross-Entropy", "Categorical Cross-Entropy", "F1 Score"],
    correctAnswer: 0,
    explanation: "Mean Squared Error measures the average squared difference between estimated values and actual values."
  },
  {
    questionText: "What does the 'learning rate' control in {topic} optimization?",
    options: ["The step size taken towards minimizing the loss function", "The rate of data retrieval from databases", "The speed of compiling code", "The user attempt limits"],
    correctAnswer: 0,
    explanation: "Learning rate determines the step size taken during gradient descent optimization to reach the loss minimum."
  },
  {
    questionText: "Which technique is used to handle class imbalance in {topic} datasets?",
    options: ["Oversampling or Undersampling", "Database indexing", "CSS grid reflow", "Asymmetric encryption"],
    correctAnswer: 0,
    explanation: "Oversampling minority classes or undersampling majority classes are standard ways to balance data in {topic}."
  },
  {
    questionText: "What is the purpose of Dimensionality Reduction in {topic}?",
    options: ["To reduce the number of input variables in dataset", "To shrink image files", "To compress code bundles", "To limit request traffic"],
    correctAnswer: 0,
    explanation: "Dimensionality reduction (like PCA) simplifies models by reducing variables, preserving key dataset variances."
  },
  {
    questionText: "Which algorithm is commonly used for clustering in {topic}?",
    options: ["K-Means", "Logistic Regression", "Decision Trees", "A* Search"],
    correctAnswer: 0,
    explanation: "K-Means is a popular unsupervised clustering algorithm used to group similar data points in {topic}."
  },
  {
    questionText: "What is the primary advantage of Deep Learning in {topic} tasks?",
    options: ["Automatic feature extraction from raw data", "Requires less training data", "Runs faster on old CPUs", "Guarantees 100% classification accuracy"],
    correctAnswer: 0,
    explanation: "Deep learning models automatically learn features from raw data, eliminating the need for manual feature extraction."
  }
];

const cloudPool = [
  {
    questionText: "What is a core benefit of using {topic} in modern infrastructure?",
    options: ["Scalability, automation, and high availability", "Writing front-end animations", "Designing vector database schemas", "Creating responsive web templates"],
    correctAnswer: 0,
    explanation: "The core benefits of {topic} include scalable services, resource automation, and highly resilient applications."
  },
  {
    questionText: "In {topic}, what does the term 'CI/CD' stand for?",
    options: ["Continuous Integration and Continuous Deployment", "Cloud Integration and Cyber Defense", "Code Inspection and Compiler Design", "Computer Interface and Database Control"],
    correctAnswer: 0,
    explanation: "CI/CD automates code integration and deployment processes to increase feature delivery speed and security."
  },
  {
    questionText: "What is the primary purpose of containerization in {topic}?",
    options: ["To package apps with dependencies to run consistently anywhere", "To encrypt user password data", "To style HTML pages", "To run local database backups"],
    correctAnswer: 0,
    explanation: "Containers package application code with dependencies, guaranteeing consistency across development and staging systems."
  },
  {
    questionText: "Which security practice is fundamental to {topic} systems?",
    options: ["Principle of Least Privilege", "Using global admin permissions", "Storing API keys in code", "Disabling firewall rules"],
    correctAnswer: 0,
    explanation: "The Principle of Least Privilege restricts user and service access rights to only those absolutely necessary."
  },
  {
    questionText: "What is the main role of a firewall in {topic} network security?",
    options: ["To monitor and control incoming/outgoing traffic based on rules", "To speed up network downloads", "To compile software code", "To design user interfaces"],
    correctAnswer: 0,
    explanation: "Firewalls filter and monitor traffic, blocking unauthorized connections to keep {topic} resources safe."
  },
  {
    questionText: "In {topic}, what does 'Infrastructure as Code' (IaC) enable?",
    options: ["Managing server resources using configuration files", "Writing CSS inside HTML tags", "Creating relational database tables", "Running client-side JavaScript"],
    correctAnswer: 0,
    explanation: "IaC manages networks, virtual machines, and clusters programmatically using definition configuration files."
  },
  {
    questionText: "Which authentication protocol is widely used for secure {topic} login?",
    options: ["OAuth 2.0 or SAML", "FTP", "HTTP", "SMTP"],
    correctAnswer: 0,
    explanation: "OAuth 2.0 is an industry-standard authorization framework used for token-based logins in {topic} systems."
  },
  {
    questionText: "What is a main objective of penetration testing in {topic}?",
    options: ["To identify and exploit vulnerabilities to improve defense", "To build responsive layout code", "To seed database tables", "To optimize page load times"],
    correctAnswer: 0,
    explanation: "Penetration testing simulates attacks to identify security weaknesses before malicious actors exploit them."
  },
  {
    questionText: "Which command-line utility is standard for container management in {topic}?",
    options: ["Docker or Kubernetes CLI", "Git CLI", "Webpack CLI", "NPM CLI"],
    correctAnswer: 0,
    explanation: "CLI tools let administrators coordinate container deployments, networks, and storage directly."
  },
  {
    questionText: "What does 'Symmetric Encryption' mean in {topic} cryptography?",
    options: ["Same key is used for both encryption and decryption", "Different keys are used for encryption and decryption", "No keys are required to decrypt", "Encryption is completed in parallel"],
    correctAnswer: 0,
    explanation: "Symmetric encryption uses a single shared secret key to encrypt and decrypt information."
  },
  {
    questionText: "What is the primary function of a Load Balancer in {topic}?",
    options: ["Distributes incoming network traffic across multiple servers", "Compresses image assets", "Runs automated unit tests", "Backs up database tables"],
    correctAnswer: 0,
    explanation: "Load balancers distribute user traffic, avoiding single-point server failures and maximizing throughput."
  },
  {
    questionText: "Which threat does a Distributed Denial of Service (DDoS) attack present to {topic}?",
    options: ["Overwhelming a service with traffic to make it unavailable", "Stealing user password databases", "Injecting malicious SQL scripts", "Corrupting style sheets"],
    correctAnswer: 0,
    explanation: "DDoS attacks crash servers by flooding network ports with massive request traffic."
  },
  {
    questionText: "What is the purpose of SSL/TLS certificates in {topic} web traffic?",
    options: ["To encrypt data in transit between browser and server", "To speed up server response time", "To validate email OTP inputs", "To style navigation bars"],
    correctAnswer: 0,
    explanation: "SSL/TLS certificates encrypt HTTP traffic (enabling HTTPS) to protect sensitive data transfers."
  },
  {
    questionText: "Which DevOps tool is popular for CI/CD pipeline automation in {topic}?",
    options: ["Jenkins or GitHub Actions", "MongoDB", "React", "TailwindCSS"],
    correctAnswer: 0,
    explanation: "Jenkins and GitHub Actions automate integration pipelines, executing build and test commands on commits."
  },
  {
    questionText: "In {topic}, what is a 'Virtual Private Cloud' (VPC)?",
    options: ["An isolated private network resource in the public cloud", "A local machine running virtual box", "A secure database storage bucket", "A styling environment"],
    correctAnswer: 0,
    explanation: "VPC provides isolated private network segments for deploying and securing cloud servers."
  },
  {
    questionText: "What is the purpose of public/private key pairs in {topic} SSH logins?",
    options: ["To authenticate users securely without sending passwords", "To encrypt database collections", "To speed up code compilation", "To format output strings"],
    correctAnswer: 0,
    explanation: "Asymmetric cryptography allows secure server access without transmitting raw passwords over the network."
  },
  {
    questionText: "Which server status represents an unauthorized access error in {topic}?",
    options: ["401 Unauthorized or 403 Forbidden", "500 Internal Error", "404 Not Found", "200 Success"],
    correctAnswer: 0,
    explanation: "Status code 401 represents unauthenticated requests, while 403 indicates forbidden resource access."
  },
  {
    questionText: "What does the term 'High Availability' (HA) ensure in {topic}?",
    options: ["Systems remain operational and accessible with minimal downtime", "Code compiles with maximum speed", "Images render in high definition", "Forms validate inputs immediately"],
    correctAnswer: 0,
    explanation: "HA architectures utilize redundancy and load balancing to eliminate single points of failure."
  },
  {
    questionText: "Which security concept is referred to as 'Zero Trust' in {topic}?",
    options: ["Never trust, always verify every request and connection", "Disabling login authentication for users", "Hosting databases on public servers", "Using a single password for all servers"],
    correctAnswer: 0,
    explanation: "Zero Trust requires strict authentication and verification for every single system access request."
  },
  {
    questionText: "What is the main role of server logs in {topic} auditing?",
    options: ["To record events, errors, and access for debugging and compliance", "To store application stylesheets", "To serve pages to the client", "To calculate database aggregates"],
    correctAnswer: 0,
    explanation: "Server logging is critical for recording runtime errors, events, and security access details."
  }
];

const aptitudePool = [
  {
    questionText: "What is a primary skill evaluated in {topic} assessments?",
    options: ["Problem solving, logical analysis, and key concepts", "Designing visual layouts", "Database query indexing", "Styling responsive footers"],
    correctAnswer: 0,
    explanation: "{topic} tests evaluate critical thinking, logical progression, and problem-solving speed."
  },
  {
    questionText: "If a process in {topic} is executed at a rate of X units per hour, how long will it take to complete Y units?",
    options: ["Y / X hours", "X * Y hours", "X + Y hours", "X - Y hours"],
    correctAnswer: 0,
    explanation: "Time required to complete work is calculated by dividing total work quantity by the execution speed: Time = Y / X."
  },
  {
    questionText: "Which approach is recommended for answering behavioral questions in a {topic} interview?",
    options: ["STAR method (Situation, Task, Action, Result)", "Giving long, unstructured explanations", "Avoiding sharing project failures", "Fabricating previous experience"],
    correctAnswer: 0,
    explanation: "The STAR technique provides a structured framework for delivering concise behavioral interview answers."
  },
  {
    questionText: "What is the probability of selecting a target event in {topic} if there are M favorable outcomes out of N total possible?",
    options: ["M / N", "N / M", "M * N", "M - N"],
    correctAnswer: 0,
    explanation: "Probability is calculated as the ratio of favorable outcomes to the total sample space: P = M / N."
  },
  {
    questionText: "Which step is crucial before attending a technical {topic} interview?",
    options: ["Reviewing foundational concepts, core problems, and project details", "Creating new social media accounts", "Formatting hard drives", "Deleting local git repositories"],
    correctAnswer: 0,
    explanation: "Preparing core concepts, project architectures, and coding problem patterns is essential for technical interviews."
  },
  {
    questionText: "In {topic} quantitative analysis, what does the 'average' or 'mean' represent?",
    options: ["The sum of all values divided by the number of values", "The middle value in a sorted list", "The most frequent value in a dataset", "The difference between highest and lowest values"],
    correctAnswer: 0,
    explanation: "The arithmetic mean is calculated by summing all values and dividing by the total count."
  },
  {
    questionText: "How should one handle a difficult question during a {topic} discussion?",
    options: ["Clarify requirements, think out loud, and explain your reasoning", "Stay silent until you know the exact answer", "Guess randomly without explaining logic", "Ask to change the topic immediately"],
    correctAnswer: 0,
    explanation: "Thinking out loud demonstrates reasoning skills, letting interviewers assess your logic pathway."
  },
  {
    questionText: "What is 20% of 150 in {topic} calculations?",
    options: ["30", "15", "20", "40"],
    correctAnswer: 0,
    explanation: "20% of 150 = (20 / 100) * 150 = 30."
  },
  {
    questionText: "Which of the following describes a 'prime number' in basic {topic} math?",
    options: ["A number greater than 1 divisible only by 1 and itself", "An even number divisible by 2", "A number ending in 5 or 0", "A negative integer"],
    correctAnswer: 0,
    explanation: "Prime numbers are positive integers greater than 1 that have no positive divisors other than 1 and themselves."
  },
  {
    questionText: "What is the best way to explain your portfolio in a {topic} interview?",
    options: ["Focus on the problem solved, your role, tech stack, and results", "List all coding lines written", "Show only the visual design files", "Provide a brief one-sentence summary"],
    correctAnswer: 0,
    explanation: "Explaining previous work using clear structure (problems, roles, tools, and impacts) yields the best results."
  },
  {
    questionText: "If a train running at 72 km/hr crosses a pole in 10 seconds, what is its length in {topic} speed questions?",
    options: ["200 meters", "150 meters", "100 meters", "250 meters"],
    correctAnswer: 0,
    explanation: "Speed in m/s = 72 * (5/18) = 20 m/s. Length = Speed * Time = 20 * 10 = 200 meters."
  },
  {
    questionText: "What is the next number in the series: 2, 4, 8, 16, ...?",
    options: ["32", "20", "24", "30"],
    correctAnswer: 0,
    explanation: "The sequence is geometric where each term is multiplied by 2: 16 * 2 = 32."
  },
  {
    questionText: "Which technique is recommended to manage time effectively during a {topic} test?",
    options: ["Solve easy questions first and budget time for hard ones", "Spend all time on the first question", "Guess answers without reading", "Write detailed notes for each calculation"],
    correctAnswer: 0,
    explanation: "Budgeting time and tackling easier questions first secures points and maximizes test performance."
  },
  {
    questionText: "What does the term 'Logical Fallacy' mean in {topic} reasoning?",
    options: ["An error in reasoning that renders an argument invalid", "A correct database query syntax", "An encryption algorithm error", "A style layout misalignment"],
    correctAnswer: 0,
    explanation: "Logical fallacies are logical errors that weaken arguments, leading to incorrect conclusions."
  },
  {
    questionText: "In a {topic} context, what is the best strategy for salary negotiation?",
    options: ["Research market rates, highlight your value, and be polite", "Demand a number immediately on the first call", "Accept the first offer without review", "Refuse to share your expectations"],
    correctAnswer: 0,
    explanation: "Negotiation is most effective when backed by market research, professional value indicators, and clear alignment."
  },
  {
    questionText: "A shopkeeper sells an item for $120 making a 20% profit. What was the cost price of the item?",
    options: ["$100", "$90", "$80", "$110"],
    correctAnswer: 0,
    explanation: "Selling Price = Cost Price * 1.20 => Cost Price = 120 / 1.20 = $100."
  },
  {
    questionText: "Which communication style is most effective for {topic} team settings?",
    options: ["Clear, concise, respectful, and collaborative", "Aggressive and demanding", "Passive and non-communicative", "Using overly technical jargon unnecessarily"],
    correctAnswer: 0,
    explanation: "Collaborative, respectful, and clear communication yields the best output in team work structures."
  },
  {
    questionText: "If M men can complete a job in D days, how many days will it take 2M men to finish the same job?",
    options: ["D / 2 days", "2D days", "D days", "D + 2 days"],
    correctAnswer: 0,
    explanation: "Doubling workforce halves the completion duration: Days = D / 2."
  },
  {
    questionText: "What is the main purpose of a mock interview in {topic} preparation?",
    options: ["To practice under real interview conditions and get feedback", "To skip the actual interview process", "To memorize exact questions and answers", "To design custom web banners"],
    correctAnswer: 0,
    explanation: "Mock interviews help candidates identify areas of improvement and adjust performance under pressure."
  },
  {
    questionText: "Which parameter is most crucial when presenting complex {topic} data?",
    options: ["Accuracy, structure, and readability of presentation", "The font color of the slide text", "The length of the slides", "The number of diagrams used"],
    correctAnswer: 0,
    explanation: "Clear structuring and accurate information make complex data easier to comprehend during reviews."
  }
];

const generateQuestions = (topic, catName) => {
  const questions = [];
  const hardcodedPool = questionPool[topic] || [];

  // Determine which fallback pool to use based on Category
  let fallbackPool = techPool;
  if (["Artificial Intelligence", "Machine Learning", "Data Science"].includes(catName)) {
    fallbackPool = aiPool;
  } else if (["Cloud Computing", "DevOps", "Cyber Security"].includes(catName)) {
    fallbackPool = cloudPool;
  } else if (["Aptitude", "Interview Preparation"].includes(catName)) {
    fallbackPool = aptitudePool;
  }

  for (let i = 1; i <= 20; i++) {
    let diff = "easy";
    let marks = 1;
    if (i > 8 && i <= 16) { diff = "medium"; marks = 2; }
    if (i > 16) { diff = "hard"; marks = 3; }

    if (hardcodedPool[i - 1]) {
      questions.push({
        ...hardcodedPool[i - 1],
        marks,
        negativeMarks: diff === "hard" ? 1 : 0
      });
    } else {
      // Pull template from selected fallback pool
      const template = fallbackPool[(i - 1) % fallbackPool.length];
      
      // Helper function to replace all {topic} placeholders
      const formatStr = (str) => str.replace(/\{topic\}/g, topic);

      questions.push({
        questionText: formatStr(template.questionText),
        options: template.options.map(opt => formatStr(opt)),
        correctAnswer: template.correctAnswer,
        marks,
        negativeMarks: diff === "hard" ? 1 : 0,
        explanation: formatStr(template.explanation)
      });
    }
  }
  return questions;
};

const generatedCodes = new Set();

const getReadableQuizCode = (subcatName, partIndex) => {
  let cleaned = subcatName.replace(/[^a-zA-Z0-9\s]/g, "").trim();
  
  let prefix = "";
  if (cleaned.includes(" ")) {
    prefix = cleaned.split(/\s+/).map(word => word[0]).join("").toUpperCase();
  } else {
    const upperCaseLetters = cleaned.replace(/[^A-Z]/g, "");
    if (upperCaseLetters.length >= 2 && upperCaseLetters.length <= 3) {
      prefix = upperCaseLetters;
    } else {
      prefix = cleaned.toUpperCase();
    }
  }

  if (prefix.length > 3) {
    prefix = prefix.substring(0, 3);
  } else if (prefix.length < 3) {
    prefix = prefix.padEnd(3, "X");
  }

  let attempt = 0;
  let code = `${prefix}${100 + partIndex}`;

  while (generatedCodes.has(code)) {
    attempt++;
    code = `${prefix}${100 + partIndex + attempt}`;
  }

  generatedCodes.add(code);
  return code;
};

const generateQuizCode = async () => {
  let isUnique = false;
  let quizCode;
  while (!isUnique) {
    quizCode = crypto.randomBytes(3).toString("hex").toUpperCase();
    const existingQuiz = await Quiz.findOne({ quizCode });
    if (!existingQuiz) isUnique = true;
  }
  return quizCode;
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log("MongoDB Connected.");

    // Create a dummy admin user to own the seeded quizzes
    await User.deleteMany({ email: "admin_seed@example.com" });
    const adminUser = await User.create({
      fullName: "System Admin",
      username: "system_admin",
      email: "admin_seed@example.com",
      password: "password123", // Hashed by User model pre-save hook
      role: "admin",
      isEmailVerified: true,
    });

    // Clear existing categories and subcategories (Optional: or just find/update)
    await Category.deleteMany({});
    await Subcategory.deleteMany({});
    // Be careful with deleting all quizzes, let's only delete seeded ones
    await Quiz.deleteMany({ createdBy: adminUser._id });

    console.log("Cleared old seeded data.");

    for (const [catName, subcats] of Object.entries(categoryStructure)) {
      const category = await Category.create({
        name: catName,
        description: `Explore the best quizzes on ${catName}`
      });

      for (const subcatName of subcats) {
        const subcategory = await Subcategory.create({
          name: subcatName,
          category: category._id,
          description: `Test your knowledge in ${subcatName}`
        });

        // Create 4 quizzes per subcategory
        for (let i = 1; i <= 4; i++) {
          const quizTitle = `${subcatName} Mastery - Part ${i}`;
          const quizCode = getReadableQuizCode(subcatName, i);
          
          await Quiz.create({
            title: quizTitle,
            description: `A comprehensive quiz on ${subcatName}. This is part ${i} of the series.`,
            category: catName,
            subcategory: subcatName,
            difficulty: i === 4 ? "hard" : (i === 3 ? "medium" : "easy"),
            createdBy: adminUser._id,
            quizCode: quizCode,
            isPublic: true,
            status: "published",
            timeLimit: 20,
            questions: generateQuestions(subcatName, catName),
          });
        }
      }
      console.log(`Seeded category: ${catName}`);
    }

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding Error:", error);
    process.exit(1);
  }
};

seedDatabase();

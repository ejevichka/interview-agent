export const zeroShotPrompts = {
  taskClassification: `Classify the following task into one of these categories: Analysis, Creation, Modification, Question, or Debug.
Input: {task}
Classification:`,

  sentiment: `Analyze the sentiment of the following text. Respond with only one word: Positive, Negative, or Neutral.
Text: {text}
Sentiment:`,

  codeReview: `Review the following code for potential issues, best practices, and improvements.
Code:
{code}

Provide your review focusing on:
1. Code quality
2. Performance
3. Security
4. Best practices`,
};

export const fewShotPrompts = {
  bugFix: `Here are some examples of identifying and fixing bugs:

Example 1:
Code: console.log(user.name)
Error: Cannot read property 'name' of undefined
Fix: Check if user exists before accessing properties
Fixed code: user ? console.log(user.name) : console.log('User not found')

Example 2:
Code: const sum = a + b
Error: a is not defined
Fix: Define parameters properly
Fixed code: const sum = (a, b) => a + b

Now fix this code:
{code}`,

  sqlQuery: `Here are examples of converting requirements to SQL queries:

Example 1:
Requirement: Find all users who signed up in 2023
Query: SELECT * FROM users WHERE YEAR(signup_date) = 2023;

Example 2:
Requirement: Get the total orders per customer
Query: SELECT customer_id, COUNT(*) as total_orders FROM orders GROUP BY customer_id;

Convert this requirement to SQL:
{requirement}`,
};

export const chainOfThoughtPrompts = {
  problemSolving: `Let's solve this problem step by step:

1. First, let's understand what we're trying to achieve:
   {goal}

2. Let's break down the key components:
   - What inputs do we have?
   - What output do we need?
   - What constraints must we consider?

3. Let's plan our approach:
   - Consider different strategies
   - Evaluate trade-offs
   - Choose the best approach

4. Implementation steps:
   - Step 1: [First step]
   - Step 2: [Second step]
   - Step 3: [Third step]

5. Let's verify our solution:
   - Does it meet all requirements?
   - Have we considered edge cases?
   - Is it efficient?

Your task: {task}`,

  codeDesign: `Let's design this feature using a systematic approach:

1. Requirements Analysis:
   - Core functionality needed
   - User interaction flow
   - Technical constraints

2. Architecture Planning:
   - Component structure
   - Data flow
   - State management

3. Interface Design:
   - API contracts
   - User interfaces
   - Data models

4. Implementation Strategy:
   - Technology choices
   - Development phases
   - Testing approach

5. Considerations:
   - Scalability
   - Maintainability
   - Security

Feature request: {feature}`,
};

export const customPromptTemplate = (template: string, variables: Record<string, string>) => {
  return Object.entries(variables).reduce(
    (prompt, [key, value]) => prompt.replace(`{${key}}`, value),
    template
  );
};

// Example usage:
/*
const result = customPromptTemplate(
  chainOfThoughtPrompts.problemSolving,
  {
    goal: "Create a user authentication system",
    task: "Implement JWT-based authentication"
  }
);
*/ 
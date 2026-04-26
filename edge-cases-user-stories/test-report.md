# 🧪 CareerHelper Testing Report

## 🎯 Goal
Ensure CareerHelper provides **relevant, actionable, and reliable career guidance** across a wide range of student profiles and edge cases.

---

# 👤 Core User Scenarios

## 1. Undecided Freshman
**Input:**
- Year: Freshman
- Major: Undecided
- Skills: None
- Interests: "I don’t know"

**Expected Behavior:**
- Suggest broad, exploratory career paths
- Recommend beginner-friendly projects
- Encourage skill discovery (low barrier)

---

## 2. CS Student with Some Experience
**Input:**
- Major: Computer Science
- Skills: Python, JavaScript
- Experience: Small projects

**Expected Behavior:**
- Suggest SWE, AI, Web Dev paths
- Provide intermediate-level projects
- Recommend hackathons and portfolio building

---

## 3. Career Switcher
**Input:**
- Major: Biology
- Interests: Tech, AI

**Expected Behavior:**
- Suggest interdisciplinary paths (bioinformatics, health tech)
- Provide transition steps
- Highlight transferable skills

---

## 4. Overachiever / Advanced Student
**Input:**
- Skills: Full-stack, internships
- Goals: FAANG / top companies

**Expected Behavior:**
- Suggest advanced roles
- Focus on system design, scaling projects
- Recommend competitive opportunities

---

## 5. Non-Technical Student
**Input:**
- Major: Business / Arts
- Skills: Communication, writing

**Expected Behavior:**
- Suggest non-technical careers (PM, marketing, UX)
- Provide accessible entry points
- Avoid overly technical recommendations

---

# ⚠️ Edge Cases

## 6. Empty Input
**Input:** No fields filled

**Expected Behavior:**
- Prompt user to provide more info
- Provide fallback general guidance

---

## 7. Extremely Vague Input
**Input:**
- “I want to make money”

**Expected Behavior:**
- Ask clarifying direction
- Suggest multiple broad paths

---

## 8. Unrealistic Goals
**Input:**
- “I want to be CEO in 1 year”

**Expected Behavior:**
- Ground response realistically
- Provide stepping-stone roles

---

## 9. Conflicting Inputs
**Input:**
- Skills: None
- Goal: Senior AI Engineer

**Expected Behavior:**
- Identify gap
- Suggest learning roadmap

---

## 10. Niche / Rare Major
**Input:**
- Major: Philosophy + Quantum Physics

**Expected Behavior:**
- Provide creative interdisciplinary paths
- Avoid generic responses

---

## 11. Long / Messy Input
**Input:**
- Large paragraph, unstructured

**Expected Behavior:**
- Extract key signals
- Still produce structured output

---

## 12. Short Input
**Input:**
- “CS”

**Expected Behavior:**
- Expand with reasonable assumptions
- Suggest general CS paths

---

# 🧪 Functional Test Cases

## 13. Output Structure Consistency
- Always returns:
  - Career paths
  - Skills
  - Entry roles
  - Action plan

---

## 14. Actionability Test
- Each output must include:
  - At least 2–3 concrete actions
  - Not just descriptions

---

## 15. Relevance Test
- Suggestions must align with:
  - Skills
  - Interests
  - Experience level

---

## 16. No Hallucination Rule
- Do NOT generate fake:
  - Hackathon dates
  - Professors
  - Opportunities

---

## 17. Beginner Accessibility
- Ensure suggestions are achievable without:
  - Prior internships
  - Advanced experience

---

# 🚀 Stress / Robustness Tests

## 18. Rapid Multiple Inputs
- System handles repeated queries without breaking

---

## 19. API Failure Handling
- Graceful fallback if AI fails

---

## 20. Large Input Variation
- Works across:
  - Technical
  - Non-technical
  - Hybrid users

---

# 🧠 Key QA Insights

- Structured prompts significantly improved output quality  
- Action-based responses increased usefulness  
- Edge case handling prevents generic or broken outputs  

---

# ✅ Conclusion

CareerHelper successfully:
- Handles diverse student profiles  
- Maintains structured, actionable outputs  
- Provides realistic and useful career guidance  

Further improvements can focus on:
- Personalization depth
- Saved user sessions
- Real-time opportunity integration
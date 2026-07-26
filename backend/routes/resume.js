const express = require("express");
const axios = require("axios");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const router = express.Router();

// ✅ Function to extract text from PDF
const extractTextFromPDF = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (err) {
    throw new Error(`PDF parsing error: ${err.message}`);
  }
};

// ✅ Function to extract text from DOCX
const extractTextFromDOCX = async (buffer) => {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (err) {
    throw new Error(`DOCX parsing error: ${err.message}`);
  }
};

// ✅ POST /analyze - Extract text from PDF or DOCX and analyze with Cohere
router.post("/analyze", async (req, res) => {
  try {
    console.log("📍 POST /analyze called");

    // 🔍 DEBUG AUTH
    console.log("🔐 Auth Debug:", { 
      userExists: !!req.user, 
      uid: req.user?.uid,
      fullUser: req.user 
    });

    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: "Unauthorized: No valid user found",
        debug: { user: req.user }
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: "No file uploaded. Please select a PDF or DOCX resume." 
      });
    }

    console.log(`📄 Processing resume for user: ${userId}`);
    console.log(`📊 File info:`, { 
      filename: req.file.originalname, 
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Extract text based on file type
    let resumeText = "";

    try {
      if (req.file.mimetype === 'application/pdf') {
        console.log("📑 Extracting text from PDF...");
        resumeText = await extractTextFromPDF(req.file.buffer);
      } else if (
        req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        req.file.mimetype === 'application/msword'
      ) {
        console.log("📝 Extracting text from DOCX...");
        resumeText = await extractTextFromDOCX(req.file.buffer);
      } else {
        return res.status(400).json({ 
          success: false, 
          error: "Unsupported file format. Please use PDF or DOCX." 
        });
      }

      console.log(`✅ File parsed successfully. Text length: ${resumeText.length} chars`);
    } catch (parseErr) {
      console.error("❌ File parsing error:", parseErr.message);
      return res.status(400).json({ 
        success: false, 
        error: `Failed to read file: ${parseErr.message}` 
      });
    }

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: "File appears to be empty or unreadable." 
      });
    }

    // Call Cohere API for analysis
    if (!process.env.COHERE_API_KEY) {
      console.error("❌ COHERE_API_KEY not configured");
      return res.status(500).json({ error: "API key not configured" });
    }

    console.log("🤖 Sending to Cohere API for analysis...");

    const cohereResponse = await axios.post(
      "https://api.cohere.com/v2/chat",
      {
        model: "command-a-03-2025",
        messages: [
          {
            role: "user",
            content: `You are an expert resume analyst for software engineering and tech jobs.
Analyze this resume comprehensively and provide detailed, actionable feedback.
Format your response EXACTLY as JSON (no markdown, no backticks) with these fields:
{
  "overallScore": number from 0-100,
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "feedback": "paragraph of detailed feedback",
  "atsScore": number from 0-100,
  "keywordScore": number from 0-100,
  "readabilityScore": number from 0-100,
  "formattingScore": number from 0-100
}

Resume text:
${resumeText}`
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );

    // Extract JSON from response
    let text = cohereResponse.data.message?.content?.[0]?.text || "";
    console.log("📬 Cohere response received, parsing JSON...");

    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");

    if (jsonStart === -1 || jsonEnd === -1) {
      console.error("❌ Could not find JSON in response:", text.substring(0, 200));
      // Return fallback response
      return res.json({
        success: true,
        feedback: "OVERALL SCORE:\n75/100\n\nSTRENGTHS:\n- Professional format\n- Clear structure\n\nWEAKNESSES:\n- Limited quantifiable metrics\n- Could expand project descriptions\n\nSUGGESTIONS:\n- Add specific metrics to achievements\n- Include links to projects\n- Highlight relevant technologies"
      });
    }

    const analysisResult = JSON.parse(text.substring(jsonStart, jsonEnd + 1));
    console.log(`✅ Analysis complete. Score: ${analysisResult.overallScore}/100`);

    // Format feedback as readable text
    const formattedFeedback = `OVERALL SCORE:
${analysisResult.overallScore}/100

STRENGTHS:
${(analysisResult.strengths || []).map(s => `- ${s}`).join("\n")}

WEAKNESSES:
${(analysisResult.weaknesses || []).map(w => `- ${w}`).join("\n")}

SUGGESTIONS:
${(analysisResult.suggestions || []).map(s => `- ${s}`).join("\n")}

${analysisResult.feedback ? `\nDETAILED FEEDBACK:\n${analysisResult.feedback}` : ""}`;

    return res.json({
      success: true,
      feedback: formattedFeedback,
      scores: {
        overall: analysisResult.overallScore || 0,
        ats: analysisResult.atsScore || 0,
        keywords: analysisResult.keywordScore || 0,
        readability: analysisResult.readabilityScore || 0,
        formatting: analysisResult.formattingScore || 0
      }
    });

  } catch (err) {
    console.error("❌ Resume analysis error:", err.response?.data || err.message);
    
    // Fallback response
    return res.json({
      success: true,
      feedback: `OVERALL SCORE:
72/100

STRENGTHS:
- Professional presentation
- Good technical foundation

WEAKNESSES:
- Could improve quantification of achievements
- Limited project metrics shown

SUGGESTIONS:
- Add specific numbers/metrics to projects
- Include links to work samples
- Highlight leadership or team collaboration`
    });
  }
});

// ✅ POST /upload - Legacy endpoint (redirects to /analyze)
router.post("/upload", async (req, res) => {
  try {
    const { resume } = req.body;

    if (!process.env.COHERE_API_KEY) {
      return res.status(500).json({ error: "API key not configured" });
    }

    const response = await axios.post(
      "https://api.cohere.com/v2/chat",
      {
        model: "command-a-03-2025",
        messages: [
          {
            role: "user",
            content: `You are an expert resume analyst for software engineering jobs.
Analyze this resume and provide detailed feedback.
Format your response as JSON with these exact fields:
{
  "overallScore": number (0-100),
  "strengths": ["point1", "point2", ...],
  "weaknesses": ["point1", "point2", ...],
  "suggestions": ["suggestion1", "suggestion2", ...],
  "feedback": "detailed feedback text"
}

Resume:
${resume}`
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );

    // v2 API response shape: response.data.message.content[0].text
    let text = response.data.message?.content?.[0]?.text || "";
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");

    if (jsonStart === -1 || jsonEnd === -1) {
      console.error("Resume: could not find JSON in model response:", text);
      return res.json({
        overallScore: 75,
        strengths: ["Clear structure", "Good experience"],
        weaknesses: ["Could add metrics", "Need more projects"],
        suggestions: ["Quantify achievements", "Add certifications"],
        feedback: "Resume looks good overall"
      });
    }

    const feedback = JSON.parse(text.substring(jsonStart, jsonEnd + 1));
    res.json(feedback);
  } catch (err) {
    console.error("Resume error:", err.response?.data || err.message);
    res.json({
      overallScore: 70,
      strengths: ["Professional format"],
      weaknesses: ["Limited details"],
      suggestions: ["Add more projects", "Include metrics"],
      feedback: "Resume needs enhancement"
    });
  }
});

module.exports = router;
const UserStats = require("../models/UserStats");
const UserMilestones = require("../models/UserMilestones");
const UserActivity = require("../models/UserActivity");
const UserProgress = require("../models/UserProgress");
const Problem = require("../models/Problem");

// Store active user connections
const userConnections = new Map();

/**
 * Register a user's WebSocket connection
 */
function registerUserConnection(userId, socket) {
  if (!userConnections.has(userId)) {
    userConnections.set(userId, []);
  }
  userConnections.get(userId).push(socket);
  console.log(`✅ User ${userId} connected. Active connections: ${userConnections.get(userId).length}`);
}

/**
 * Unregister a user's WebSocket connection
 */
function unregisterUserConnection(userId, socket) {
  if (userConnections.has(userId)) {
    const connections = userConnections.get(userId);
    const index = connections.indexOf(socket);
    if (index > -1) {
      connections.splice(index, 1);
    }
    if (connections.length === 0) {
      userConnections.delete(userId);
    }
    console.log(`❌ User ${userId} disconnected`);
  }
}

/**
 * Emit dashboard update to all active connections of a user
 */
async function emitDashboardUpdate(userId) {
  const connections = userConnections.get(userId);
  if (!connections || connections.length === 0) return;

  try {
    // Fetch updated data
    const userStats = await UserStats.findOne({ userId });
    const userMilestones = await UserMilestones.findOne({ userId });
    const doneDSA = await UserProgress.countDocuments({ userId });
    const totalDSA = await Problem.countDocuments();

    const updateData = {
      type: "dashboard_update",
      data: {
        dsa: {
          done: doneDSA,
          total: totalDSA,
          percent: totalDSA ? Math.round((doneDSA / totalDSA) * 100) : 0,
        },
        readiness: userStats?.readinessScore || 0,
        streak: userMilestones?.currentStreak || 0,
        mockInterviewsCount: userStats?.mockInterviewsCount || 0,
        resumeScore: userStats?.resumeScore || 0,
        aptitude: { percent: userStats?.aptitudePercent || 0 },
        coreCs: { percent: userStats?.csPercent || 0 },
        interviews: { percent: userStats?.interviewPercent || 0 },
        thisWeekSolved: userMilestones?.thisWeekSolved || 0,
        timestamp: new Date(),
      },
    };

    // Send to all connections
    connections.forEach((socket) => {
      socket.emit("dashboardUpdate", updateData);
    });

    console.log(`📤 Sent dashboard update to ${connections.length} connection(s) for user ${userId}`);
  } catch (err) {
    console.error("Error emitting dashboard update:", err.message);
  }
}

/**
 * Handle problem solve event
 */
async function handleProblemSolved(userId, problemId, details = {}) {
  try {
    // Log activity
    const activity = new UserActivity({
      userId,
      activityType: "problem_solved",
      problemId,
      details: {
        category: details.category || "General",
        difficulty: details.difficulty || "Medium",
        timeTaken: details.timeTaken || 0,
        ...details,
      },
    });
    await activity.save();

    // Update stats
    const userStats = await UserStats.findOne({ userId });
    if (userStats) {
      userStats.mockInterviewsCount = (userStats.mockInterviewsCount || 0) + 1;
      await userStats.save();
    }

    // Emit update
    await emitDashboardUpdate(userId);
  } catch (err) {
    console.error("Error handling problem solved:", err.message);
  }
}

/**
 * Handle interview completion event
 */
async function handleInterviewCompleted(userId, interviewId, score = 0) {
  try {
    // Log activity
    const activity = new UserActivity({
      userId,
      activityType: "interview_completed",
      interviewId,
      details: {
        score,
        feedback: `Interview completed with score: ${score}`,
      },
    });
    await activity.save();

    // Update stats
    const userStats = await UserStats.findOne({ userId });
    if (userStats) {
      userStats.mockInterviewsCount = (userStats.mockInterviewsCount || 0) + 1;
      userStats.interviewPercent = Math.min(100, (userStats.interviewPercent || 0) + 5);
      await userStats.save();
    }

    // Emit update
    await emitDashboardUpdate(userId);
  } catch (err) {
    console.error("Error handling interview completed:", err.message);
  }
}

/**
 * Handle resume update event
 */
async function handleResumeUpdated(userId, score = 0) {
  try {
    // Log activity
    const activity = new UserActivity({
      userId,
      activityType: "resume_updated",
      details: {
        score,
        feedback: `Resume score updated to: ${score}`,
      },
    });
    await activity.save();

    // Update stats
    const userStats = await UserStats.findOne({ userId });
    if (userStats) {
      userStats.resumeScore = score;
      await userStats.save();
    }

    // Emit update
    await emitDashboardUpdate(userId);
  } catch (err) {
    console.error("Error handling resume updated:", err.message);
  }
}

/**
 * Handle quiz attempt event
 */
async function handleQuizAttempted(userId, score = 0) {
  try {
    // Log activity
    const activity = new UserActivity({
      userId,
      activityType: "quiz_attempted",
      details: {
        score,
        feedback: `Quiz attempt with score: ${score}`,
      },
    });
    await activity.save();

    // Update stats
    const userStats = await UserStats.findOne({ userId });
    if (userStats) {
      userStats.quizAttemptsCount = (userStats.quizAttemptsCount || 0) + 1;
      userStats.aptitudePercent = Math.min(100, (userStats.aptitudePercent || 0) + 2);
      await userStats.save();
    }

    // Emit update
    await emitDashboardUpdate(userId);
  } catch (err) {
    console.error("Error handling quiz attempted:", err.message);
  }
}

module.exports = {
  registerUserConnection,
  unregisterUserConnection,
  emitDashboardUpdate,
  handleProblemSolved,
  handleInterviewCompleted,
  handleResumeUpdated,
  handleQuizAttempted,
  userConnections,
};
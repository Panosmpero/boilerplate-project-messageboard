const Board = require("../models/boardModel");
const Thread = require("../models/threadModel");
const Reply = require("../models/replyModel");

const reportThread = async (req, res) => {
  try {
    let { board } = req.params;
    let { report_id: thread_id } = req.body;
    
    let b = await Board.findOne({ name: board });
    
    let thread = await Thread.findOneAndUpdate(
      { _id: thread_id, board: b },
      { reported: true },
      { new: true }
    );  
  
    if (thread) {
      console.log("Thread reported.");
      res.status(200).send("Thread reported.");
  
    } else {
      console.log("Thread report failed.");
      res.status(400).send("Thread report failed.")
    };
    
  } catch (error) {
    console.log("Error reporting thread: " + error);
    res.status(400);
  };
};

const reportReply = async (req, res) => {
  try {
    let { board } = req.params;
    let { thread_id, reply_id } = req.body;

    let b = await Board.findOne({ name: board });

    if (!b) {
      console.log("Board not found")
      return res.status(400).send("Board not found")
    };

    let thread = await Thread.findOne({ _id: thread_id, board: b });

    if (!thread) {
      console.log("Thread not found")
      return res.status(400).send("Thread not found")
    };

    let reply = await Reply.findOneAndUpdate(
      { _id: reply_id, thread },
      { reported: true },
      { new: true }
    );

    if (!reply) {
      console.log("Replies not found")
      return res.status(400).send("Replies not found")
    };

    console.log("Reply reported.");
    return res.send("Reply reported.");
    
  } catch (error) {
    console.log("Error reporting thread: " + error);
    res.status(400);
  }
};

module.exports = { reportThread, reportReply };
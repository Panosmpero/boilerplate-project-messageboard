const Board = require("../models/boardModel");
const Thread = require("../models/threadModel");
const Reply = require("../models/replyModel");

const deleteThread = async (req, res) => {
  try {
    let { board } = req.params;
    let { thread_id, delete_password } = req.body;
  
    let b = await Board.findOne({ name: board });
    
    if (b) {
      let thread = await Thread.findOne({ _id: thread_id });
  
      if (thread) {
        
        if (thread.delete_password === delete_password) {
          await Reply.deleteMany({ thread });
          await thread.remove();
          console.log("Thread - Thread Replies Deleted.");
          res.send("Thread - Thread Replies Deleted.");
  
        } else {
          console.log("Incorrect Password");
          res.send("Incorrect Password");
        }
  
      } else {
        console.log("Thread not found")
        res.status(400).send("Thread not found")
      };
  
    } else {
      console.log("Board not found")
      res.status(400).send("Board not found")
    };
    
  } catch (error) {
    console.log("Error deleting: " + error);
    res.status(400);
  };
};

const deleteReply = async (req, res) => {
  try {
    let { board } = req.params;
    let { thread_id, reply_id, delete_password } = req.body;
  
    let b = await Board.findOne({ name: board });
    
    if (b) {
      let thread = await Thread.findOne({ _id: thread_id });
  
      if (thread) {
        let reply = await Reply.findOne({ thread, _id: reply_id });
  
        if (reply) {
          
          if (reply.delete_password === delete_password) {
            // await reply.remove();
            reply.text = "[deleted]"
            await reply.save();
            console.log("Reply Deleted.");
            res.send("Reply Deleted.");
    
          } else {
            console.log("Incorrect Password");
            res.send("Incorrect Password");
          };
  
        } else {
          console.log("Reply not found");
          res.status(400).send("Reply not found");
        };      
  
      } else {
        console.log("Thread not found");
        res.status(400).send("Thread not found");
      };
  
    } else {
      console.log("Board not found");
      res.status(400).send("Board not found");
    };
    
  } catch (error) {
    console.log("Error deleting: " + error);
    res.status(400);
  };
};



module.exports = { deleteThread, deleteReply };
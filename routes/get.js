const Board = require("../models/boardModel");
const Thread = require("../models/threadModel");
const Reply = require("../models/replyModel");

const getThreadsArray = async (req, res) => {
  try {
    let { board } = req.params;
    
    let b = await Board.findOne({ name: board });

    let threads = await Thread.find({ board: b }).sort("-bumped_on").limit(10);

    let t = await Promise.all(threads.map(async (thread) => {
      thread = thread.toObject();
      let replies = await Reply.find({ thread: thread._id }).sort("-created_on").limit(3);
      replies = replies.map(reply => reply.toObject());
      let replycount = replies.length;
      Object.assign(thread, {replycount, replies});
      return thread;
    })); 

    // console.log("threads: ", t);

      // .populate({
      //   path: "threads",
      //   select: "-reported -delete_password",
      //   options: { sort: "bumped_on", limit: 10 },
      //   populate: { 
      //     path: "replies",
      //     select: "-delete_password",
      //     options: { limit: 3 }
      //   }
      // });
    
    if (t) {
      console.log("Get 10 latest threads success");
      res.status(200).json(t);
    } else {
      console.log("Get 10 latest threads failure");
      res.status(400).send("Fail")
    };

  } catch (error) {
    console.log("Error getting: " + error);
    res.status(400);
  }
};

const getEntireThread = async (req, res) => {
  try {
    let { board } = req.params;
    let { thread_id } = req.query;
    
    let b = await Board.findOne({ name: board });
  
    if (b) {
      let thread = await Thread.findOne({ _id: thread_id });
      
      if (thread) {
        let replies = await Reply.find({ thread });
  
        if (replies) {
          thread = thread.toObject();
          replies = replies.map(reply => reply.toObject());
          Object.assign(thread, { replies });
  
          res.status(200).json(thread);
  
        } else {
          console.log("Replies not found")
          res.status(400).send("Replies not found")
        };
  
      } else {
        console.log("Thread not found")
        res.status(400).send("Thread not found")
      };
  
    } else {
      console.log("Board not found")
      res.status(400).send("Board not found")
    };
    
  } catch (error) {
    console.log("Error getting: " + error);
    res.status(400);
  }
};

module.exports = { getThreadsArray, getEntireThread };
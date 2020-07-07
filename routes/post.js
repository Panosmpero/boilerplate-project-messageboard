const Board = require("../models/boardModel");
const Thread = require("../models/threadModel");
const Reply = require("../models/replyModel");

const createThread = async (req, res) => {
  try {
    let { board } = req.params;
    let { text, delete_password } = req.body;

    let b = await Board.findOneAndUpdate(
      { name: board },
      {},
      { new: true, upsert: true }
    );

    console.log(b)

    let thread = new Thread({ board: b, text, delete_password });
    let newThread = await thread.save();    

    if (newThread) {
      console.log("New thread created.");
      res.redirect(301, `/b/${board}`)
    } else {
      console.log("New thread failed.");
      res.status(400).send("New thread failed.");      
    };
    
  } catch (error) {
    console.log("Error posting: " + error);
    res.status(400).send("Error posting.");
  }
};

//=======================================================================================

const createReply = async (req, res) => {
  try {
    let { board } = req.params;
    let { thread_id, text, delete_password } = req.body;

    let thread = await Thread.findByIdAndUpdate(
      { _id: thread_id },
      { bumped_on: new Date() },
      { new: true, upsert: true }
    );
    
    let reply = new Reply({ thread, text, delete_password });
    let newReply = await reply.save(); 

    if (newReply) {
      console.log("New reply created.");
      res.redirect(301, `/b/${board}/${thread_id}`);
    } else {
      console.log("New reply failed.");
      res.status(400).send("New reply failed.")
    };

    // let newBoard = await Board.findOneAndUpdate(
    //   { name: board, "threads._id": thread_id },
    //   { $push: { "threads.$.replies": { text, delete_password } }, $set: { "threads.$.bumped_on": new Date() } },
    //   { new: true, upsert: true }
    // );

  } catch (error) {
    console.log("Error posting:" + error);
    res.status(400).send("Error posting.");
  }; 
}

module.exports = {createThread, createReply}
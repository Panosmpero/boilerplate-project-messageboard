/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

const expect = require("chai").expect;
const { createThread, createReply } = require("./post");
const { getThreadsArray, getEntireThread } = require("./get");
const { deleteThread, deleteReply } = require("./delete");
const { reportThread, reportReply } = require("./put");

module.exports = function (app) {

  app.route("/api/threads/:board")

     // Create new Thread to a Board
    .post((req, res) => {
      createThread(req, res)
    })

     // Get most recent 10 threads of a board
    .get((req, res) => {
      getThreadsArray(req, res)
    })

    // Delete a thread with its replies
    .delete((req, res) => {
      deleteThread(req, res)
    })

    // Report a thread
    .put((req, res) => {
      reportThread(req, res)
    })

// ====================================================== 
  app.route("/api/replies/:board")

    // Create new Reply to a Thread
    .post((req, res) => {
      createReply(req, res)     
    })

    // Get entire thread with all replies
    .get((req, res) => {
      getEntireThread(req, res)
    })
    
    // Delete a reply 
    .delete((req, res) => {
      deleteReply(req, res)
    })
    
    // Report a reply
    .put((req, res) => {
      reportReply(req, res)
    })
};

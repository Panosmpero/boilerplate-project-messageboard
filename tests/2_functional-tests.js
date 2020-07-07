/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */

const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const { suite, test } = require("mocha");
const Board = require("../models/boardModel");
const Thread = require("../models/threadModel");
const Reply = require("../models/replyModel");

chai.use(chaiHttp);

// Helper test functions
const createManyThreads = async (done) => {
  let board = await Board.findOne({ name: test_board });
  let arr = [...Array(10)].map(x => x = { board, text: test_text, delete_password: test_password });
  await Thread.insertMany(arr);
  console.log("CREATE_MANY");
  done();
};

const deleteManyThreads = async (done) => {
  let board = await Board.findOne({ name: test_board });
  await Thread.deleteMany({ board });
  console.log("DELETE_MANY")
  done();
};

const createOneThread = async (done, cb) => {
  let board = await Board.findOne({ name: test_board });
  let thread = await Thread.create({ board, text: test_text, delete_password: test_password });
  console.log("CREATE ONE");
  console.log(thread);
  if (cb) cb(thread);
  done();
};

const deleteReplies = async (done) => {
  await Reply.deleteMany({ thread: test_thread });
  console.log("REPLIES DELETED");
  done();
};

// Test variables
let test_board = "test_board";
let test_text = "test_text";
let test_password = "test_password";
let test_wrong_password = "wrong_password"
let test_thread;
let test_thread_forDeletion;
let test_reply;


suite("Functional Tests", function () {

  before(done => {
    createOneThread(done, (newThread) => {
      test_thread = newThread;
      return;
    })
  });  
  
  before(done => {
    createManyThreads(done)
  });
  
  after(done => {
    deleteManyThreads(done)
  });

  after(done => {
    deleteReplies(done)
  });

  suite("API ROUTING FOR /api/threads/:board", function () {

    suite("POST", function () {

      test("Post a thread at /api/threads/{board}", (done) => {
        chai.request(server)
          .post(`/api/threads/${test_board}`)
          .send({ text: test_text, delete_password: test_password })
          .end((err, res) => {            
            assert.include(res.redirects[0], `/b/${test_board}`, "should redirect to correct board");
            assert.equal(res.status, 200);
            done();
          });
      });
    });

    suite("GET", function () {

      test("Get an array of the most recent 10 bumped threads on the board with only the most recent 3 replies from /api/threads/{board}", (done) => {
        chai.request(server)
          .get(`/api/threads/${test_board}`)
          .end((err, res) => {
            test_thread_forDeletion = res.body[0]
            assert.equal(res.status, 200);
            assert.isArray(res.body, "should be an array");
            assert.isAtMost(res.body.length, 10, "should return no more than 10 threads");
            assert.hasAllKeys(res.body[0], [ '_id', 'text', 'created_on', 'bumped_on', 'replycount', 'replies' ], "only those certain keys should appear");
            assert.isArray(res.body[0].replies, "should be an array");
            assert.isAtMost(res.body[0].replies.length, 3, "should return no more than 3 replies");
            assert.equal(res.body[0].text, test_text);
            assert.equal(res.body[0].replycount, res.body[0].replies.length);
            done();
          });
      });
    });

    suite("DELETE", function () {

      test("Delete a thread providing a wrong password", (done) => {
        chai.request(server)
          .delete(`/api/threads/${test_board}`)
          .send({ thread_id: test_thread_forDeletion._id, delete_password: test_wrong_password })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "Incorrect Password");
            done();
          });
      });

      test("Delete a thread providing the correct password", (done) => {
        chai.request(server)
          .delete(`/api/threads/${test_board}`)
          .send({ thread_id: test_thread_forDeletion._id, delete_password: test_password })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "Thread - Thread Replies Deleted.");
            done();
          });
      });
    });

    suite("PUT", function () {

      test("Report a thread", (done) => {
        console.log(test_thread._id)
        chai.request(server)
          .put(`/api/threads/${test_board}`)
          .send({ report_id: test_thread._id })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "Thread reported.");
            done();
          });
      });
    });
  });
// ========================================================================================
// ========================================================================================
// ========================================================================================
  suite("API ROUTING FOR /api/replies/:board", function () {

    suite("POST", function () {

      test("Post a reply to a thread to /api/replies/{board}", (done) => {
        chai.request(server)
          .post(`/api/replies/${test_board}`)
          .send({ thread_id: test_thread._id, text: test_text, delete_password: test_password })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.include(res.redirects[0], `/b/${test_board}/${test_thread._id}`);
            done();            
          })
      })
    });

    suite("GET", function () {

      test("Get a thread and all its replies", (done) => {
        chai.request(server)
          .get(`/api/replies/${test_board}`)
          .query({ thread_id: test_thread._id.toString() })
          .end((err, res) => {
            // console.log(Object.keys(res.body.replies[0])) 
            test_reply = res.body.replies[0]
            assert.equal(res.status, 200);
            assert.notEqual(res.body.created_on, res.body.bumped_on, "Bumped on date should be upated");
            assert.hasAllKeys(res.body.replies[0], [ '_id', 'text', 'created_on', 'updatedAt' ], "Should show only the correct keys");
            assert.isArray(res.body.replies, "Should return an array");
            assert.equal(res.body.replies[0].text, test_text);
            done();            
          });
      });
    });

    suite("PUT", function () {

      test("Report a reply on a thread", (done) => {
        chai.request(server)
          .put(`/api/replies/${test_board}`)
          .send({ 
            thread_id: test_thread._id.toString() ,
            reply_id: test_reply._id.toString() 
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "Reply reported.");
            done();
          });
      });
    });

    suite("DELETE", function () {

      test("Delete a reply providing a wrong password", (done) => {
        chai.request(server)
          .delete(`/api/replies/${test_board}`)
          .send({
            thread_id: test_thread._id.toString(),
            reply_id: test_reply._id.toString(),
            delete_password: test_wrong_password
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "Incorrect Password");
            done();
          });
      });

      test("Delete a reply providing the correct password", (done) => {
        chai.request(server)
          .delete(`/api/replies/${test_board}`)
          .send({
            thread_id: test_thread._id.toString(),
            reply_id: test_reply._id.toString(),
            delete_password: test_password
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "Reply Deleted.");
            done();
          });
      });
    });
  });
});

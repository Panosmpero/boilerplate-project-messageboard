const { Schema, model } = require("mongoose");

const replySchema = new Schema({
  thread: {
    type: Schema.Types.ObjectId, 
    ref: "Thread"
  },
  text: {
    type: String,
    required: true
  },
  delete_password: {
    type: String,
    required: true
  },
  reported: {
    type: Boolean,
    default: false
  }
}, { timestamps: { createdAt: "created_on" } });

replySchema.set("toObject", {
  transform: function(doc, ret, options) {
    delete ret.__v;
    delete ret.delete_password;
    delete ret.reported;
  }
});

const Reply = model("Reply", replySchema);

module.exports = Reply;
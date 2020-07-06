const { Schema, model } = require("mongoose");


const threadSchema = new Schema({
  board: {
    type: Schema.Types.ObjectId, 
    ref: "Board",
    required: true
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
}, { timestamps: { createdAt: "created_on", updatedAt: "bumped_on" } });

threadSchema.set("toObject", {
  transform: function(doc, ret, options) {
    delete ret.__v;
    delete ret.delete_password;
    delete ret.reported;
    delete ret.board;
  }
});

const Thread = model("Thread", threadSchema);

module.exports = Thread;
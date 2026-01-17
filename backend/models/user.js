const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        default: function() {
            // Generate username from email (part before @)
            return this.email.split('@')[0];
        }
    }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
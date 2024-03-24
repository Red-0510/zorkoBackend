import mongoose from "mongoose";

const postSchema = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    name:{
        type:String,
    },
    comment:{
        type:String
    },
    upvotes:{
        type:Number,
        default:0,
    },
    downvotes:{
        type:Number,
        default:0,
    },
    time:{
        type:Date,
        required:true,
    },
},{
    timestamps:true
});

const Post = mongoose.model("Post",postSchema);

export default Post;

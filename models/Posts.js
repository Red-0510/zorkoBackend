import mongoose from "mongoose";

const postSchema = mongoose.Schema({
    user:{
        // type:String,
        // required:true,
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

const post = mongoose.model("Post",postSchema);

export default Outlet;

import mongoose from "mongoose";

const transactionSchema = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    items:[
        {
            itemId:{
                type:mongoose.Schema.Types.ObjectId,
                required:true,
                ref:"User"
            },
            name:{
                type:String,
            },
            price:{
                type:Number,
            },
            quantity:{
                type:Number,
            },
            cost:{
                type:Number,
            },

        }
    ],
    // reward:{

    // },
    cost:{
        type:Number,
    },
    time:{
        type:Date,
        required:true,
        default:Date.now,
    },
},{
    timestamps:true
});

const Transaction = mongoose.model("Transaction",transactionSchema);

export default Transaction;

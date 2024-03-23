import mongoose from "mongoose";

const transactionSchema = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    items:[
        {

        }
    ],
    reward:{

    },
    cost:{
        type:Number,
    },
    time:{
        type:Date,
        required:true,
    },
},{
    timestamps:true
});

const Transaction = mongoose.model("Transaction",transactionSchema);

export default Transaction;

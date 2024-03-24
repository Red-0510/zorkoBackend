import mongoose from "mongoose";

const itemSchema = mongoose.Schema({
    name:{
        type:String,
        required:[true,"please add item name"],
    },
    price:{
        type:Number,
        required:[true,"please add item name"],
    },
    offer:{
        type:Number,
    },
    image:{
        type:String,
    },
    outletId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Outlet"
    },
});

const Item = mongoose.model("Item",itemSchema);

export default Item;

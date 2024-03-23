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
    image:{
        type:String,
    },
    // outletId:{
    //     type:mongoose.Schema.Types.Outl
    //     required:true,
    //     ref:""
    // },
});

const Item = mongoose.model("Item",itemSchema);

export default Item;

import mongoose from "mongoose";

const outletSchema = mongoose.Schema({
    location:{
        type:String,
        required:[true,"please add outlet"],
    },
    creator:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Admin",
    },
    managers:[
        {
            adminId:{
                type:mongoose.Schema.Types.ObjectId,
                required:true,
                ref:"Admin"
            },
            joined:{
                type:Date,
                default:Date.now,
                required:true,
            }
        }
    ],
    menu:[
        {
            itemId:{
                type:mongoose.Schema.Types.ObjectId,
                required:true,
                ref:"Item",
            }
        }
    ],
    // offers:[
    //     {

    //     }
    // ],
    estab:{
        type:Date,
        required:true,
        default:Date.now,
    },
});

const Outlet = mongoose.model("Outlet",outletSchema);

export default Outlet;

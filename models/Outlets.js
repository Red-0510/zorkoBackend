import mongoose from "mongoose";

const outletSchema = mongoose.Schema({
    location:{
        type:String,
        required:[true,"please add outlet"],
    },
    creater:{

    },
    managers:{

    },
    menu:[
        {

        }
    ],
    offers:[
        {

        }
    ],
    estab:{
        type:Date,
        required:true
    },
});

const Outlet = mongoose.model("Outlet",outletSchema);

export default Outlet;

import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const adminSchema = mongoose.Schema({
    name:{
        type:String,
        // required: [true, "Please add a name"]
    },
    email:{
        type:String,
        required:[true, "Please enter an email"],
        unique:[true,"email already registered"],
    },
    outlets:[
        {
            outletId:{
                type:mongoose.Schema.Types.ObjectId,
                required:true,
                ref:"Outlet"
            }
        }
    ],
    password:{
        type:String,
        required:[true,"Please enter a password"],
    },
    // email:{
    //     type:String,
    //     required:[true,"Please add an email"],
        // unique:[true,"email already registered"],
    //     trim:true,
    //     match:[
    //         /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    //         "Please enter a valid email"
    //     ]
    // },
    // role:{
    //     type:String,
    //     default:"user",
    //     immutable:true,
    // },
    
},{
    timestamps:true
})

// generate JWT Access Token 
adminSchema.methods.getJWTToken = function(){
    const accessToken = jwt.sign(
        {
            id:this._id,
            role:"admin",
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "3d",
        }
    )

    return accessToken
}

// password compare method
adminSchema.methods.comparePassword = async function(enteredPassword){
    return bcrypt.compare(enteredPassword,this.password)
}

// hashing the password whenever it is modified before saving to DB
adminSchema.pre('save',async function(next){
    if(!this.isModified("password")) return next()
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password,salt);
    this.password = hashedPassword;
    next()
});

const Admin = mongoose.model("Admin",adminSchema)

export default Admin
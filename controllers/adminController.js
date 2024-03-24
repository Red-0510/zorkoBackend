import Admin from "../models/Admin.js"
import Outlet from "../models/Outlets.js"
import Token from "../models/Token.js"
import { sendToken } from "../utils/auth.js"

export const loginAdmin = async (req,res,next)=>{
    try{
        const {email,password} = req.body

        if(!password || !email){
            res.status(400)
            throw new Error("email and password are required!")
        }

        
        const admin = await Admin.findOne({email})
        
        if(!admin){
            res.status(404)
            throw new Error("Email doesn't exists. Please Contact the administrator to recieve creds.")
        }

        const passwordMatch = await admin.comparePassword(password)
        
        if(!passwordMatch){
            res.status(401)
            throw new Error("Passowod entered is incorrect.")
        }
        else{
            
            const {_id,email} = admin;

            const token = sendToken(admin);

            res.status(200).json({
                success:"true",
                message:"Admin User Logged In Successfully",
                data:{
                    _id,email,token,
                },
            })
        }
    }
    catch(err){
        next(err)
    }
}

export const getAdmin = async (req,res,next)=>{
    try{
        const {id} = req.admin;
        const admin = await Admin.findById(id).select("-password")
        
        if(!admin){
            res.status(404)
            throw new Error("Admin User not found")
        }

        res.status(200).json({
            success:true,
            message:"admin details fetched",
            data:admin,
        })

    }catch(err){
        next(err)
    }
}

export const createOutlet = async(req,res,next)=>{
    try{
        const {adminId,location} = req.body;
        const admin = await Admin.findById(adminId);

        if(!admin){
            throw new Error("admin user not found");
        }

        const managers=[{adminId}];

        const outlet = await Outlet.create({
            location,creator:adminId,managers,
        });

        admin.outlets.push({
            outletId:outlet._id,
        });
        await admin.save();

        res.status(200).json({
            success:true,
            message:"outlet created successfully",
        })
    }
    catch(err){
        next(err)
    }
}


export const getOutlet = async(req,res,next)=>{
    try{
        const outletId = req.body.outletId;
        const outlet= await Outlet.findById(outletId);

        if(!outlet) throw new Error("Outlet not found");
        
        res.status(200).json({
            success:true,
            message:"outlet fetched successfully",
            outlet,
        })

    }
    catch(err){
        next(err)
    }
}




export const createAdmin = async(req,res,next)=>{
    try{
        const {email,password} = req.body;
        const admin = await Admin.create({
            email,password,
        });
        res.status(200).json({
            success:true,
            message:"admin created successfully",
        })
    }
    catch(err){
        next(err)
    }
}

// export const addManager = async(req,res)=>{
//     try{
//         const {email,password} = req.body;
//         const admin = await Admin.create({
//             email,password,
//         });
//         res.status(200).json({
//             success:true,
//             message:"admin created successfully",
//         })
//     }
//     catch(err){
//         next(err)
//     }
// }


// logout user
export const logoutAdmin = async(req,res,next)=>{
    try{
        res.clearCookie(`${req.user.id}`)
        req.cookies[`${req.user.id}`]=""
        res.status(200).json({
            success:true,
            message:"Successfully Logged out"
        })
    }
    catch(err){
        next(err)
    }
}

//remaining
export const changePassword = async (req,res,next)=>{
    try{
        const admin = await Admin.findById(req.user.id)
        const {oldPassword,newPassword} = req.body
        if(!oldPassword || !newPassword){
            res.status(400)
            throw new Error("Please add old password and new password")
        }
        
        const passwordMatch = await admin.comparePassword(oldPassword)

        if(!passwordMatch){
            res.status(401)
            throw new Error("Old password is incorrect")
        }

        user.password = newPassword
        await user.save()
        res.status(200).json({
            success:true,
            message:"Password changed successfully."
        })
    }
    catch(err){
        next(err)
    }
}

// controller to send the resetPassword link not a protected route
export const forgotPassword = async (req,res,next)=>{
    try{
        const {email} = req.body
        const user = await User.findOne({email})

        // user not found 
        if(!user){
            res.status(400)
            throw new Error("Email not found")
        }

        // look for previous existing tokens
        const token = await Token.findOne({userId:user._id})

        // previous token exists then delete it
        if(token){
            await token.deleteOne()
        }

        // create a random unique token and hash
        let resetToken = crypto.randomBytes(32).toString('hex') + user._id
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")

        // creating new token and storing the hashed token
        await new Token({
            userId:user._id,
            token: hashedToken,
            createdAt: Date.now(),
            expiresAt: Date.now() + 30 * (60 * 1000), // expiry time is 30 minutes
        }).save()
        
        // resetUrl to access reset the passowrd page
        const resetUrl = `${process.env.FRONTEND_URL}/reset/${resetToken}`;

        // message to displayed in email
        const message = `
            <h2> Hello ${user.name}</h2>
            <p> Please use the url below to reset your password </p>
            <p> This reset link is link valid for only 30 minutes. </p>

            <a href='${resetUrl}' clicktracking=off>${resetUrl}</a>

            <p> Thank You... </p>
            <p> Developer Team </p>
        `
        // options to send the email
        const subject = "Password Reset Request";
        const from = process.env.USER;
        const to = user.email;

        // send the email
        const result = await sendEmail(from,to,subject,message);

        if(!result.success){
            res.status(400);
            throw new Error(result.data);
        }
        else{
            res.status(200).json({
                ...result,
                message:"password reset email sent successfully.",
            });
        }
    }
    catch(err){
        next(err);
    }
}


export const resetPassword = async (req,res,next)=>{
    try{
        const {password} = req.body
        const {resetToken} = req.params
        
        // hash the userToken and then compare with the hashed version token in database
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")
        
        // get the token from the database
        const userToken = await Token.findOne({
            token:hashedToken,
            expiresAt:{$gt: Date.now()},
        })

        if(!userToken){
            res.status(400)
            throw new Error("Invalid Or Expired Token")
        }

        // get the user 
        const user = await User.findById(userToken.userId)
        
        // update the password
        user.password = password
        await user.save()
        
        // delete this token
        await userToken.deleteOne()
        
        res.status(200).json({
            success:true,
            message:"Password Reset Successfully."
        });
    }
    catch(err){
        next(err);
    }
}

import { sendToken } from "../utils/auth.js"
import User from "../models/User.js"
import Token from "../models/Token.js"
import crypto from "crypto"
import { sendEmail } from "../utils/sendEmail.js"
import twilio from "twilio"


const accountSid = process.env.OTP_ACCOUNT_SID;
const authToken = process.env.OTP_AUTH_TOKEN;
const verifySid = process.env.OTP_VERIFY_SID;
const client = twilio(accountSid, authToken,{lazyLoading:true});
const sendOtp = async(mobileNumber)=>{
    try{
        const otpResponse = await client.verify
          .services(verifySid)
          .verifications.create({ to: mobileNumber, channel: "sms" })
          .then(()=>console.log("sent"));
        console.log(JSON.stringify(otpResponse));
        return true;
    }
    catch(err){
        console.log("err",err);
        return false
    }
}

export const verifyOtp = async(req,res,next)=>{
    try{
        const {mobileNumber,otp} = req.body;
        const verifiedResponse = await client.verify
            .services(verifySid)
            .verificationChecks.create({
                to:mobileNumber,
                code:otp,
            });
        if(verifiedResponse.status =="approved"){
            let user = await User.findOne({phone:mobileNumber});
            if(!user){
                user = await User.create({
                    phone:mobileNumber,
                });
            }
            const token = sendToken(user);
            res.status(200).json({
                success:true,
                data:{
                    token,
                }
            });
        }
        else{
            throw new Error("not approved otp");
        }
    } catch(err){
        console.log(err);
    }
}

export const registerUser = async (req,res,next)=>{
    try{
        const {mobileNumber} = req.body

        
        // const userExists = await User.findOne({phoneNumber})
        
        // if(userExists){
        //     res.status(400)
        //     throw new Error("Number already exists. Please login")
        // }

        // if(phoneNumber.length < 10){
        //     res.status(400)
        //     throw new Error("enter a valid number")
        // }
        
        // const user = await User.create({
        //     phoneNumber
        // })
        
        // if(user){
            // const {phoneNumber} = 
            // console.log("user created")
            const resp=await sendOtp(mobileNumber);
            // console.log(resp);
            if(!resp){
                throw new Error("Something error occured");
            }
            console.log("otp sent")
            res.status(201).json({
                success:"true",
                message:"Otp Sent Successully",
            })
        // }
    }
    catch(err){
        next(err)
    }
}

export const getUser = async (req,res,next)=>{
    try{
        const {id} = req.user;
        const user = await User.findById(id).select("-password")
        
        if(!user){
            res.status(404)
            throw new Error("User not found")
        }

        res.status(200).json({
            success:true,
            message:"User details fetched",
            data:user,
        })

    }catch(err){
        next(err)
    }
}

export const loginUser = async (req,res,next)=>{
    try{
        const {email,password} = req.body

        if(!password || !email){
            res.status(400)
            throw new Error("email and password are required!")
        }

        
        const user = await User.findOne({email})
        
        if(!user){
            res.status(404)
            throw new Error("Email doesn't exists. Please Register.")
        }

        if(password.length < 6){
            res.status(400)
            throw new Error("Password must be atleast 6 characters")
        }

        const passwordMatch = await user.comparePassword(password)
        
        if(!passwordMatch){
            res.status(401)
            throw new Error("Passowod entered is incorrect.")
        }
        else{
            
            const {_id,email,name,role} = user

            sendToken(user,res);

            res.status(200).json({
                success:"true",
                message:"User Logged In Successfully",
                data:{
                    _id,email,name,role,
                },
            })
        }
    }
    catch(err){
        next(err)
    }
}

// logout user
export const logoutUser = async(req,res,next)=>{
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

export const changePassword = async (req,res,next)=>{
    try{
        const user = await User.findById(req.user.id)
        const {oldPassword,newPassword} = req.body
        if(!oldPassword || !newPassword){
            res.status(400)
            throw new Error("Please add old password and new password")
        }
        
        const passwordMatch = await user.comparePassword(oldPassword)

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


// create a admin user only can be create by another admin user
export const createAdmin = async (req,res,next)=>{
    try{
        const {name,email,password} = req.body

        if(!password || !email){
            res.status(400)
            throw new Error("email and password are required!")
        }

        
        const userExists = await User.findOne({email})
        
        if(userExists){
            res.status(400)
            throw new Error("Email already exists. Please login")
        }

        if(password.length < 6){
            res.status(400)
            throw new Error("Password must be atleast 6 characters")
        }
        
        const user = await User.create({
            name,email,password,role:"admin",
        })
        
        if(user){
            const {_id,email,name,role} = user

            res.status(201).json({
                success:"true",
                message:"Admin User Registered Successfully",
                data:{
                    _id,email,name,role,
                }
            })
        }
    }
    catch(err){
        next(err)
    }
}
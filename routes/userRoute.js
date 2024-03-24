import express from "express"
import { addPost, changePassword, createAdmin, forgotPassword, getUser, loginUser, logoutUser, registerUser, resetPassword, updatePost, verifyOtp } from "../controllers/userController.js"
import { adminAuth, userAuth } from "../utils/auth.js"
import { getOutlet } from "../controllers/adminController.js"
import { getItem, getItems } from "../controllers/itemController.js"


const router = express.Router()

router.post("/register",registerUser)
router.post("/verify-otp",verifyOtp)
router.post("/getuser",userAuth,getUser);
router.post("/getoutlet",userAuth,getOutlet);
router.post("/getitem",userAuth,getItem);
router.post("/getitems",userAuth,getItems);
router.route("/addpost",userAuth,addPost);
router.route("/updatepost",userAuth,updatePost);
// router.route("/login")
//     .post(loginUser)
//     .get(userAuth, getUser)

// router.get("/logout",userAuth,logoutUser)

// // password routes
// router.route("/password")
//     .patch(userAuth, changePassword)
//     .post(forgotPassword)

// router.put("/resetpassword/:resetToken",resetPassword)


//admin routes
router.route("/admin")
    .post(adminAuth,createAdmin)

export default router

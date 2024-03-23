import express from "express"

import { adminAuth, userAuth } from "../utils/auth.js"
import { getAdmin, loginAdmin } from "../controllers/adminController.js"
import { createAdmin } from "../controllers/adminController.js"


const router = express.Router()

router.post("/login",loginAdmin)
router.post("/getadmin",adminAuth,getAdmin);

router.post("/createadmin",createAdmin);

// router.post("/register",registerUser)
// router.post("/verify-otp",verifyOtp)
// router.route("/login")
//     .post(loginUser)
//     .get(userAuth, getUser)

// router.get("/logout",userAuth,logoutUser)

// // password routes
// router.route("/password")
//     .patch(userAuth, changePassword)
//     .post(forgotPassword)

// router.put("/resetpassword/:resetToken",resetPassword)


// //admin routes
// router.route("/admin")
//     .post(adminAuth,createAdmin)

export default router

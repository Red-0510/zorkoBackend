import express from "express"

import { adminAuth, userAuth } from "../utils/auth.js"
import { createOutlet, getAdmin, getOutlet, loginAdmin } from "../controllers/adminController.js"
import { createAdmin } from "../controllers/adminController.js"
import { addItem, getItem, updateItem } from "../controllers/itemController.js"


const router = express.Router()

router.post("/login",loginAdmin)
router.post("/getadmin",adminAuth,getAdmin);

router.post("/createadmin",createAdmin);
router.post("/createoutlet",adminAuth,createOutlet);
router.post("/additem",adminAuth,addItem);
router.post("/updateitem",adminAuth,updateItem);
router.post("/getoutlet",adminAuth,getOutlet);
router.post("/getitem",adminAuth,getItem);


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

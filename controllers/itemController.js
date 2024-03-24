import Admin from "../models/Admin.js";
import Item from "../models/Item.js";
import Outlet from "../models/Outlets.js";

export const addItem = async (req,res,next)=>{
    try{
        const {id} = req.admin;
        const {name,price,offer,image} = req.body;
        const admin = await Admin.findById(id).select("-password")
        
        if(!admin){
            res.status(404)
            throw new Error("Admin User not found")
        }

        
        if(!name || !price){
            res.status(400);
            throw new Error("Please add name and price of item");
        }
        
        if(admin.outlets.length==0){
            res.status(400);
            throw new Error("No outlet specified for the admin");
        }
        const outletId = admin.outlets[0].outletId;
        const item = await Item.create({
            name,price,offer,image,outletId,
        });

        const outlet = await Outlet.findById(outletId);
        outlet.menu.push({itemId:item._id});

        await outlet.save();

        res.status(200).json({
            success:true,
            message:"Items fetched Succesfully",
        });

    }catch(err){
        next(err)
    }
}

export const getItem = async(req,res,next)=>{
    try{
        const {itemId} = req.body;

        if(!itemId) throw new Error("Invalid itemid");

        const item = await Item.findById(itemId);

        if(!item || item.length==0){
            throw new Error("No item found");
        }
        
        res.status(200).json({
            success:true,
            item,
            message:"Item fetched Succesfully",
        });

    }catch(err){
        next(err)
    }
}


export const getItems = async(req,res,next)=>{
    try{
        const {userId,spendLimit} = req.user.id;
        if(spendLimit==null) spendLimit=100000

        const items = await Item.find({
            price:{$le:{spendLimit}}
        });

        if(!items || items.length==0){
            throw new Error("No item found");
        }
        
        res.status(200).json({
            success:true,
            items,
            message:"Item updated Succesfully",
        });

    }catch(err){
        next(err)
    }
}

export const updateItem = async (req,res,next)=>{
    try{
        const {id} = req.admin;
        const {itemId,name,price,offer,image,toRemove} = req.body;
        const admin = await Admin.findById(id).select("-password")
        
        if(!admin){
            res.status(404)
            throw new Error("Admin User not found")
        }
        
        if(admin.outlets.length==0){
            res.status(400);
            throw new Error("No outlet specified for the admin");
        }
        const outletId = admin.outlets[0].outletId;

        const data={name,price,offer,image};
        let item;
        if(toRemove){
            await Outlet.findOneAndUpdate(
                { _id: outletId },
                { $pull: { 'menu': { itemId: itemId } } },
                { new: true }
            );
            await Item.findOneAndDelete({ _id: itemId });
        }
        else{
            item = await Item.findOneAndUpdate(
                { _id: itemId },
                { $set: data },
                {
                  new: true,
                  runValidators: true,
                  useFindAndModify: false,
                }
              );
        }

        res.status(200).json({
            success:true,
            message:"Item updated Succesfully",
        });

    }catch(err){
        next(err)
    }
}
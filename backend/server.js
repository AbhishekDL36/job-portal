 import e from "express"
 import dotenv from "dotenv"
 import cors from "cors"
import ConnectDb from "./Config/DB.js"
dotenv.config()
 const app= e()
ConnectDb()
 app.listen(process.env.PORT, ()=>{
    console.log("server started !1");
    
 })
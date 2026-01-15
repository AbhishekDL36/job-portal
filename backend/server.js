 import e from "express"
 import dotenv from "dotenv"
 import cors from "cors"
import ConnectDb from "./Config/DB.js"
import router from "./Routers/auth.js"
import approuter from "./Routers/application.js"
import jobRouter from "./Routers/job.js"
import savedjobRouter from "./Routers/savedJob.js"
dotenv.config()
 const app= e()
 app.use(cors());
app.use(e.json());
ConnectDb()

app.use('/api/auth', router)
app.use('/api/applications',approuter)
app.use('/api/jobs',jobRouter)
app.use('/api/savedjobs',savedjobRouter)
 app.listen(process.env.PORT, ()=>{
    console.log("server started !1");
    
 })
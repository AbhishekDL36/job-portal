
import { connect } from "mongoose";


export default async function ConnectDb(){
 connect(process.env.mongodb_uri)
 .then(()=>{
    console.log("mongodb connected successfully !!");
    
 })
 .catch((e)=>{
    console.log("error in connection -: ", e);
    
 })
}

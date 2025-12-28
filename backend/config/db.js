import mongoose from "mongoose";
export const connectDB= async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI,{
            dbName:"NotesDB"
        })
        console.log(`mongodb connected`)
    }catch(error){
        console.log(error);
        process.exit(1);
    }
}
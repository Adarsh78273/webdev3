const express =require ('express');
const app = express();
const PORT = 3000;

app.get("/start/:age",(req,res,next)=>{
    let age=parseInt(req.params.age);
    try{
    if(age<18){
        throw new Error("You are not able to vote")
    }else{
        res.send("You are eligible to vote ")
    }
    }catch(error){
        // res.status(500).send(error.message);
    //     res.status(500).json({success:false,message:"Your age is less then 18, you are not eligible to vote"})
    next(error);
    }
})

app.use((err,req,res,next)=>{
    res.status(500).json({success:false,message:err.message})
})
app.use((req,res,next)=>{
    res.status(404).json({success:false,message:"page not found"})
})

app.listen (PORT,()=>console.log("server is running on port 3000"));
const express=require("express");
const app=express()
const router=require("./routes/employeeRoutes.js")

//middleware

app.use (express.json());
app.use("/employees", employeeRouter);
app.listen(3000,()=>console.log("server is running on port 3000"));
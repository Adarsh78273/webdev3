const express=require("express");
const employeeRouter=express.Router();
const {getEmployees,getEmployeeById,addEmployee,updateEmployee,deleteEMployee}=require("../controller/employeeController.js")   

employeeRouter.use(express.json()); //data parse coming as json



///Read Operation
employeeRouter.get("/",getEmployees)
///employee get by their id
employeeRouter.get("/:id", getEmployeeById)

//Create
employeeRouter.post("/", addEmployee)

//update
employeeRouter.put("/:id", updateEmployee  )

//delete
employeeRouter.delete("/:id",deleteEMployee)

module.exports = employeeRouter;
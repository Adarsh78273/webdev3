// console.log("Student Server is now starting ")
// console.log("we are start understanding backend")
// console.log(process.argv)

function first(){
    const command= process.argv[2]
    const task = process.argv[3]
    console.log("command:-",command)
    console.log("task:-",task)
}

first();

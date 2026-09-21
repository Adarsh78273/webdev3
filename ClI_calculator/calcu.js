function calculator(){
    let command= process.argv[2]
    const numf= Number(process.argv[3])
    const nums = Number(process.argv[4])
    if (command ==   add){
        console.log(numf+nums);
    }
    
}
calculator();
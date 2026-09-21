const os = require('os');
console.log(os.platform());
console.log(os.arch());
console.log(os.cpus());
console.log(os.homedir());
console.log(os.totalmem()/(1024*1024*1024)+"GB");
console.log(os.freemem()/(1024*1024*1024)+"GB");

const path = required("path");
const filePath =path.resolve(__dirname,"Core_module.js");
console.log(__dirname);
const file =  "LEcture5/Core_module.js";
console.log(path.basename(file));
console.log(path.extname(file));
console.log(path.dirname(file));
const data =fs.readfileSync(filePath,"utf-8");
console.log(data);

fs.readfile("Core_module.js","utf-8",(err,data)=>{
    if(err){
        console.log(err);
    } else {
        console.log(data);
    }
});

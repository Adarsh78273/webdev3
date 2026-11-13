const bcrypt = require('bcrypt');

const password ="Bob@123"
const password2 = "hhhjjj@123"

const salt = bcrypt.genSaltSync(10);
console.log(salt);
const hash = bcrypt.hash(password,salt).then ((hash)=>{
    console.log(hash);

})
const result = bcrypt.compareSync(password2 ,`$(hash)` );
console.log(result);

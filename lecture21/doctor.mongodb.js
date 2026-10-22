use('HospitalDB')


// db.doctor.insert({
//     name: "Dr. John Doe",
//     specialization: "Cardiology",
//     hospital: "City General Hospital",
//     salary: 150000

// })
// db.doctor.insert({
//     name: "Dr. Nani",
//     specialization: "Cardiology",
//     hospital: "City General Hospital",
//     salary: 150000
    
// })
// db.doctor.insert({
//     name: "Dr. Sakura Haruno",
//     specialization: "Cardiology",
//     hospital: "City General Hospital",
//     salary: 150000
    
// })
// db.doctor.insert({
//     name: "Dr. tsunade",
//     specialization: "Cardiology",
//     hospital: "City General Hospital",
//     salary: 150000
    
// })

db.doctor.findOne()

db.doctor.updateMany(
    {name:"Dr. Sakura Haruno"},
    {$set:
        { 
            salary: 500000,
            specialization : "Senior_Healer ",
            hospital :"Hidden Leaf village research center"
        }
    }
)
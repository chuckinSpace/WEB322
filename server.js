

/*********************************************************************************
*  WEB322 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Carlos Moyano Student ID: 123435174 Date: 11-10-18
*
*  Online (Heroku) Link: https://limitless-retreat-52906.herokuapp.com/
*
********************************************************************************/ 

const data_service = require("./data-service");
const express = require("express");
const multer = require("multer");
const app = express();
const exphbs = require("express-handlebars");

const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");

const HTTP_PORT = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({extended:true}));
app.engine('.hbs', exphbs({ 
    extname: '.hbs', 
    defaultLayout: "main",
    helpers: {
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
        

    }

    
}));

app.set('view engine', '.hbs');
app.use(express.static('public'));
  // multer requires a few options to be setup to store files with file extensions
  // by default it won't store extensions for security reasons
const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename:  (req, file, cb) =>{
        cb(null, Date.now() + path.extname(file.originalname));
    }
  });
  
  // tell multer to use the diskStorage function for naming files instead of the default.
const upload = multer({ storage: storage });

app.use(function(req,res,next){
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});



// listening to default url path
app.get("/", (req,res)=>{
    res.render("home");
   
 });
 
 // setup another route to listen on /about
app.get("/about", (req,res)=>{
    res.render("about");
 });

 app.get("/employees",(req,res)=>{
    if(req.query.status){
        data_service.getEmployeesByStatus(req.query.status)
        .then((data)=>{
            
            res.render("employees", {employees: data});
        })
        .catch((err)=>{
            res.render({message: "no results"});
        })
    }else if(req.query.department){
        data_service.getEmployeesByDepartment(req.query.department)
        .then((data)=>{
            res.render("employees", {employees: data});
        })
        .catch((err)=>{
            res.render({message: "no results"});
        })
    }else if(req.query.manager){
        data_service.getEmployeesByManager(req.query.manager)
        .then((data)=>{
            console.log(req.query.manager);
            res.render("employees", {employees: data});
        })
        .catch((err)=>{
            res.render({message: "no results"});
        })
    }else{
        data_service.getAllEmployees()
        .then((data)=>{
            
            res.render("employees", {employees: data});
            
        }).catch((err)=>{
            res.render({message: "no results"});
        });
    }
   
});


app.get("/employee/:num", (req,res)=>{
    data_service.getEmployeesByNum(req.params.num)
        .then((data)=>{
            
            res.render("employee",{employee: data});
        })
        .catch((err)=>{
            res.render("employee",{message: "no results"});
        });
 });

// route for addEmployee.htnl
 app.get("/employees/add", (req,res)=>{
    res.render("addEmployee");
 });

 app.post("/employees/add",(req,res)=>{
    data_service.addEmployee(req.body)
    .then((data)=>{
        res.redirect("/employees")
    })
    .catch((err)=>{
        res.send(err);
    })
 });

 app.post("/employee/update", (req, res) => {
    
    data_service.updateEmployee(req.body)
    .then(()=>{
        res.redirect("/employees");
    }).catch((err)=>{
        res.send(err);
    })
});

 // route for addImage.htnl
 app.get("/images/add", (req,res)=>{
    res.render("addImage");
 });
 
 app.post("/images/add", upload.single("imageFile") , (req,res)=>{
    res.redirect("/images");
 });

 app.get("/images", (req,res)=>{
    fs.readdir(path.join(__dirname,"/public/images/uploaded") ,(err,items)=>{
        res.render("images",{images: items});
    });
 });
 
 /*
 // setting route for managers
 app.get("/managers",(req,res)=>{
    data_service.getManagers()
        .then((data)=>{
        res.json(data);
    }).catch((err)=>{
        res.json({message:err});
    });
});
*/
  // setting route for departments
  app.get("/departments", (req,res)=>{
    data_service.getDepartments()
        .then((data)=>{
        res.render("departments", {departments: data});
    }).catch((err)=>{
        res.json({message:err});
    });
});

 

app.use((req,res)=>{
    res.status(404).send("Page not found");
 });
 
 data_service.initialize()
 .then(() => {
    app.listen(HTTP_PORT, ()=>{
        console.log("Is listening on the port " + HTTP_PORT); 
    });
 })
 .catch(() => {
    console.log("Port not loaded")
 });


require("dotenv").config()
const express = require("express")
const app= express();
const Task = require("./model/task.js")
const path = require("path")
const mongoose = require('mongoose');
const methodOverride = require('method-override')
const session = require('express-session')
const wrapAsync=require("./utils/wrapAsync.js")
const ExpressError=require("./utils/ExpressError")
const engine = require('ejs-mate')
const flash = require('connect-flash');
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./model/user.js")
const {isLoggegIn}=require("./middleware.js")
const GoogleStrategy = require('passport-google-oauth20').Strategy;


app.set("view engine" ,"ejs");
app.set("views",path.join(__dirname,"views"))
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,"/public")))
app.use(methodOverride('_method'))
app.engine('ejs', engine);
app.use(session(
    {secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie : {
        expires:Date.now() + 7 * 24 * 60 * 60 *1000,
        maxAge : 7 * 24 * 60 * 60 *1000,
        httpOnly : true,
    },
}))
app.use(flash());

app.use(passport.initialize())
app.use(passport.session())


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:8080/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    
      return done(null, profile);

  }
));
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser((user,done)=>done(null,user));
passport.deserializeUser((user,done)=>done(null,user) );

app.use((req,res,next)=>{
    res.locals.success=req.flash("success")
    res.locals.error=req.flash("error")
    res.locals.currUser=req.user;
    next();
})
const db_url=process.env.ATLAS_DB

const conct= async()=>{
    await mongoose.connect(db_url)
  .then(() => console.log('Connected for task management'));
}

conct();

const port=8080;

app.listen(port,()=>{
    console.log("server is listening on the port 8080")
})




// Index route................................................

 
app.get("/task",isLoggegIn,wrapAsync(async (req,res)=>{
    const datas= await Task.find();
    
    res.render("index.ejs",{datas})
}))

// Create route................................................

app.get("/task/new",isLoggegIn,(req,res)=>{
    res.render("new.ejs")
})



app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile','email'] }));
   
  app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/signup' }),
    function(req, res) {
      // Successful authentication, redirect home.
      res.redirect('/task');
    });
  
    

app.post("/task/add",isLoggegIn,wrapAsync(async (req,res,next)=>{  
    if(!req.body.task || !req.body.description){
        throw new ExpressError(404,"Send valid details")

    }  
    let task1=new Task(req.body)
    await task1.save()
    req.flash('success', 'task added')
    res.redirect("/task")
}))



// Show route....................................................
app.get("/task/:id",isLoggegIn,async(req,res)=>{
    let {id}=req.params;
    let data= await Task.findById(id )
    if(!data){
        req.flash('error', 'task you requested for does not exist')
        res.redirect("/task")
    }

    res.render("show.ejs",{data})
})


// Edit route.......................................................
app.get("/task/edit/:id",isLoggegIn,wrapAsync(async (req,res)=>{
    let {id}=req.params;
    
    
    let data=  await Task.findById(id);
    if(!data){
        req.flash('error', 'task you requested for does not exist')
        res.redirect("/task")
    }


    res.render("edit.ejs",{data})
    

}))

// Update route........................................................
app.put("/task/update/:id",isLoggegIn,wrapAsync(async (req,res)=>{
    if(!req.body.task || !req.body.description){
        throw new ExpressError(404,"Send valid details")

    }  
    let {id}=req.params;
    await Task.findByIdAndUpdate(id,{...req.body});
    req.flash("success", "task updated")
    res.redirect("/task")

    
}))

// Delete route.............................................................
app.get("/task/delete/:id",isLoggegIn,wrapAsync(async (req,res)=>{
    let {id}=req.params;
    let data= await Task.findByIdAndDelete(id);
    req.flash('success', 'task deleted')
    res.redirect("/task")
    

}))







// Signup Route
app.get("/signup",(req,res)=>{
    res.render("signup.ejs")
})
app.post("/signup",wrapAsync(async (req,res)=>{

    try{
         
    let{username,email,password}=req.body;
    const newUser= new User({email,username})
    const registerUser=await User.register(newUser,password)
    req.login(registeredUser,(err)=>{
        if(err){
            return next(err)
        }
        req.flash("success","welcome to task managment");
        res.redirect("/task")
        
    })
    
}
    
    catch(e){
        
    req.flash('error', e.message)
    res.redirect("/signup")
    
    }
}))

// Login route
app.get("/login",(req,res)=>{
    res.render("login.ejs")
})

app.post('/login', 
    passport.authenticate('local', { failureRedirect: '/login' ,failureFlash : true}),
    async (req, res)=> {
        req.flash('success', 'Welcome to task management')
        res.redirect("/task")

      
    });

// Logout route
app.get("/logout",(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err)
        }
        req.flash("success","You are logged out!");
        res.redirect("/signup")
    })
}    )


app.all("*",(req,res)=>{
    
    throw new ExpressError(404,"page not found ")

})


// Error handelling middleware

app.use((err,req,res,next)=>{
    let{statuscode=500,message="something went wrong"}=err;
    res.status(statuscode).render("error.ejs",{message})
    
})









































// const task2= new Task({

//     task:"i have to sleep ",
//     description:"I want to sleep"
// })

// const data=async ()=>{
//     await task2.save();
    
// }
// data()

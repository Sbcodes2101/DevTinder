
const adminauth = ((req,res,next) => {
        console.log("admin auth is gettig checked")
        const token = "xyzaSCsv"
        const isAdminAuthorized = token === "xyz"
        if(!isAdminAuthorized){
            res.status(401).send("Unauthorized request");
        }
        else{
            next();
        }
    });

    const userAuth = ((req,res,next) => {
        console.log("admin auth is gettig checked")
        const token = "xyzaSCsv"
        const isAdminAuthorized = token === "xyz"
        if(!isAdminAuthorized){
            res.status(401).send("Unauthorized request");
        }
        else{
            next();
        }
    });

module.exports ={adminauth,userAuth}

"use strict"

/* Get unique error field name */

const uniqueMessage = error => {
    let output;
    try {
        let fieldName = error.message.split(".$")[1]
        fieldName = fieldName.split("dub key")[0]
        fieldName = fieldName.substring(0, field.lastIndexOf("_"))
        req.flash("error", [{
            message: "An account with this " + fieldName + " already exists."
        }])
    } catch (err) {
        output = "Already exists."
    }
    return output
}

/* Get the error message from the error object */

exports.errorHandler = error => {
    let message = "";
    if (error.code) {
        switch (error.code) {
            case 11000:
            case 11001:
                message = uniqueMessage(error)
                break;
            default:
                message = "Something went wrong."
        }
    }else{
        for(let errorName in error.errors){
            if(error.errors[errorName].message){
                message = error.errors[errorName].message
            }
        }
    }
    return message;
}
import mongoose from "mongoose";
const leadSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    contactinfo:{
        type: String,
        required: true
    },
    leadsource:{
        type: String,
        required: true
    },
    status:{
        type: String,
        enum: ["New", "Contacted", "Qualified", "Lost"],
        required: true  
    },
    created_by: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    updated_by: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }  
},{ timestamps: true }
);
const Lead = mongoose.model('Lead', leadSchema);
export default Lead;
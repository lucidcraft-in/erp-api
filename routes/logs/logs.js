const Logs = require('../../models/logs');
const express = require('express');
const router = express.Router();

module.exports = async function  addLog(name,type,action,actionBy,staffName,companyId,companyName){
 
  
  
    const newLogs = new Logs({
        name : name,
        type: type,
        action : action,
        actionBy : actionBy,
        staffName :staffName,
        companyId :companyId,
        companyName : companyName,
        created: Date.now(),
      });
      const logs = await newLogs.save();
    
  }



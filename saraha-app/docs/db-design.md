# DB design

* user:
- userName: String,   
- email: [String, unique, required],   
- password: [String, required in case local provider]   
- provider: [String,enum:[ 'google', 'facebook', 'local' ]]   
- profilePicPath: String   
- isVerified: [Boolean, default:false]   
- isDeleted: [Boolean, default:false]   
- createdAt   
- updatedAt   
===================================   
* Message:   
- content: String   
- attachmentsPath: [String optional]   
- sender: [ObjectId, Optional, ref:"User"]   
- receiver: [ObjectId, required, ref:"User"]   
- isDeleted: [Boolean, default:false]   
- createAt  
- updatedAt  
=================================== 
* OTP
- code : [string . length:6]
- userId: ObjectId, ref:"User"
- expireAt : Date
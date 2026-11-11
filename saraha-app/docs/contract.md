## Design APIs:   
### Register:   
method: 
POST   url: api/auth/register 
  req-headers: application/json   
  res-headers: applicatoin/json   
  res-success-201: {message:"register successfully",success:true,data:user-data}   
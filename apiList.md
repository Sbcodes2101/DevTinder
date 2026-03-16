#DevTinder APIs

authRouter
-POST /Signup
-POST /login
-POST /logOut

ProfileRouter
GET /profile/view
PATCH /profile/edit
PATCH /profile/password

connectionRequestRouter
-POST /request/send/:status/:userId


-POST /request/review/accepted/:requestId
-POST /request/review/rejected/:requestId

useRouter
-GET /user/connections
-GET /requests/received
GET /feed - Gets you the profiles of other users on platform


Status: ignore,intrested,accepted,rejected



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


    <!-- /feed?page=1&limit=10 => 1-10 .skip(0) & .limit(10)
    <!-- /feed?page=2&limit=10 => 11-20=> .skip(10) & .limit(10)
    <!-- /feed?page=3&limit=10 => 21-30 =>
    .skip(20) & .limit(10)
     -->
     
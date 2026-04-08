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


try {
        const loggedInUser = req.user;
        const { status, requestId } = req.params;

        const ALLOWED_STATUS = ["accepted", "rejected"];

        if (!ALLOWED_STATUS.includes(status)) {
            return res.status(400).json({ message: "Status not allowed!!" });
        }

        const connectionRequest = await ConnectionRequest.findOne({
            _id: requestId,
            toUserId: loggedInUser._id,
            status: "interested"
        });

        if (!connectionRequest) {
            return res.status(404).json({ message: "Connection request not found" });
        }

        connectionRequest.status = status;
        const data = await connectionRequest.save();

        res.json({
            message: `Connection request ${status} successfully`,
            data
        });

    } catch (err) {
        res.status(400).json({ message: "ERROR: " + err.message });
    }


    <!-- /feed?page=1&limit=10 => 1-10 .skip(0) & .limit(10)
    <!-- /feed?page=2&limit=10 => 11-20=> .skip(10) & .limit(10)
    <!-- /feed?page=3&limit=10 => 21-30 =>
    .skip(20) & .limit(10)
     -->
     
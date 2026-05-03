# DevTinder — Backend

A Node.js + Express backend for a developer matchmaking platform. Users can sign up, browse a feed of developers, send/receive connection requests, and chat in real time via Socket.io.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB (Mongoose ODM) |
| Authentication | JWT + bcrypt |
| Real-time | Socket.io |
| Validation | validator.js |
| Cookie Handling | cookie-parser |
| CORS | cors |

---

## Folder Structure

```
src/
├── config/
│   └── database.js          # MongoDB connection
├── middlewares/
│   └── auth.js              # JWT authentication middleware
├── models/
│   ├── user.js              # User schema & model
│   └── connectionRequest.js # ConnectionRequest schema & model
├── routes/
│   ├── auth.js              # Signup, Login, Logout
│   ├── profile.js           # View, Edit, Change Password
│   ├── requests.js          # Send & Review connection requests
│   └── user.js              # Feed, Connections, Received Requests
├── utils/
│   ├── validation.js        # Input validation helpers
│   └── socket.js            # Socket.io initialization
└── app.js                   # Entry point
```

---

## How The App Starts — `app.js`

This is the entry point. Here is exactly what happens when the server boots:

```
1. Express app is created
2. CORS is configured → only allows http://localhost:5173 (frontend)
3. express.json() → parses incoming JSON request bodies
4. cookie-parser → allows reading cookies from requests
5. HTTP server is created wrapping the Express app
6. Socket.io is initialized on the HTTP server
7. All routers are mounted at root "/"
8. connectDB() is called → connects to MongoDB Atlas
9. Only after DB connects → server.listen(7777) starts
```

> ⚠️ The server only starts listening AFTER the database connects successfully. If DB fails, server never starts.

---

## Database Connection — `config/database.js`

```js
mongoose.connect(MONGO_URI)
```

- Connects to **MongoDB Atlas** cluster
- Called once at startup in `app.js`
- Uses async/await — if it throws, the `.catch()` in app.js handles it

> 🔧 TODO: Move the connection string to `.env` as `MONGO_URI`

---

## Models

### User Model — `models/user.js`

Stores all developer profile information.

**Key fields:**
- `firstName`, `lastName` — required, 4-50 chars
- `emailId` — unique, required
- `password` — bcrypt hashed before saving
- `age`, `gender`, `about`, `photoUrl` — optional profile fields

**Instance Methods on User:**
- `user.getJWT()` → creates and returns a signed JWT token using the user's `_id`
- `user.getPassword(inputPassword)` → uses `bcrypt.compare()` to validate password

---

### ConnectionRequest Model — `models/connectionRequest.js`

Stores every swipe/connection action between two users.

**Fields:**
```
fromUserId  → ObjectId (ref: User) — who sent the request
toUserId    → ObjectId (ref: User) — who received it
status      → enum: "interested" | "ignored" | "accepted" | "rejected"
timestamps  → createdAt, updatedAt auto-added
```

**Compound Index:**
```js
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 })
```
This makes lookups like "does a request already exist between these two users?" extremely fast — used in the feed and send-request logic.

---

## Middleware

### JWT Auth — `middlewares/auth.js`

Protects all private routes. Applied as `userAuth` middleware.

**Flow:**
```
1. Read "token" from req.cookies
2. If no token → return 401 "Please Login!"
3. jwt.verify(token, SECRET) → decode the payload
4. Extract _id from decoded payload
5. User.findById(_id) → fetch full user from DB
6. If user not found → throw error
7. Attach user to req.user
8. Call next() → proceed to route handler
```

Every protected route has access to `req.user` — the full logged-in user object from MongoDB.

> 🔧 TODO: Move JWT secret `"devTINDER@123"` to `.env` as `JWT_SECRET`

---

## Routes & API Endpoints

### Auth Routes — `routes/auth.js`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/signup` | ❌ | Register new user |
| POST | `/Login` | ❌ | Login and get JWT cookie |
| POST | `/logout` | ❌ | Clear JWT cookie |

**Signup flow:**
```
1. validateSignUpData(req) → checks name, email, strong password
2. bcrypt.hash(password, 10) → hash the password
3. new User({...}) → create user instance
4. user.save() → save to MongoDB
5. user.getJWT() → generate token
6. res.cookie("token", token) → set cookie
7. Return saved user
```

**Login flow:**
```
1. User.findOne({ emailId }) → find user by email
2. user.getPassword(password) → bcrypt.compare()
3. If valid → user.getJWT() → set cookie → send user
4. If invalid → throw "Invalid credentials"
```

**Logout flow:**
```
1. Set cookie "token" with expiry = now (immediately expires)
2. Cookie is cleared from browser
```

---

### Profile Routes — `routes/profile.js`

All routes protected by `userAuth`.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/profile/view` | ✅ | Get logged-in user's profile |
| PATCH | `/profile/edit` | ✅ | Edit allowed profile fields |
| PATCH | `/profile/password` | ✅ | Change password |

**Edit Profile flow:**
```
1. validateEditProfileData(req) → checks only allowed fields are being updated
   Allowed: firstName, lastName, emailId, photoUrl, gender, age, about
2. Loop over req.body keys → update loggedInUser[key] = value
3. loggedInUser.save() → persist to DB
```

**Allowed edit fields** (anything else is rejected):
```
firstName | lastName | emailId | photoUrl | gender | age | about
```

---

### Request Routes — `routes/requests.js`

All routes protected by `userAuth`.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/request/send/:status/:toUserId` | ✅ | Send interested/ignored request |
| POST | `/request/review/:status/:requestId` | ✅ | Accept/reject received request |

**Send Request flow:**
```
1. Extract fromUserId (req.user._id), toUserId, status from params
2. Validate status is "interested" or "ignored" only
3. Check fromUserId !== toUserId (can't request yourself)
4. Check toUser exists in DB
5. ConnectionRequest.findOne({ $or: [{fromUserId,toUserId}, {fromUserId:toUserId, toUserId:fromUserId}] })
   → if exists, throw "Connection Request already exists"
6. new ConnectionRequest({fromUserId, toUserId, status}).save()
```

> The `$or` check catches BOTH directions — so if A already sent to B, B can't send to A either.

**Review Request flow:**
```
1. Validate status is "accepted" or "rejected" only
2. Find ConnectionRequest where:
   - _id matches requestId
   - toUserId is the logged-in user (only receiver can review)
   - status is currently "interested"
3. Update status → save → return updated request
```

---

### User Routes — `routes/user.js`

All routes protected by `userAuth`.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/user/requests/received` | ✅ | Get all pending incoming requests |
| GET | `/user/connections` | ✅ | Get all accepted connections |
| GET | `/feed` | ✅ | Get paginated feed of new developers |

**Feed Logic — the most important route:**
```
1. Get all ConnectionRequests where loggedInUser is sender OR receiver
   → select only fromUserId and toUserId fields
2. Build a Set (hideUserFromFeed) of all user IDs involved in any request
3. Add loggedInUser._id to the Set (hide yourself)
4. User.find({ _id: { $nin: Array.from(hideUserFromFeed) } })
   → fetch users NOT in the Set
5. Apply pagination: .skip((page-1)*limit).limit(limit)
   → default: page=1, limit=10, max limit=50
6. Return only safe fields: firstName lastName photoUrl age gender about
```

> This is the core algorithm — `$nin` + `Set` deduplication ensures you never see someone you've already swiped on.

**Connections Logic:**
```
1. Find all accepted requests where loggedInUser is sender OR receiver
2. .populate("fromUserId").populate("toUserId") → get full user objects
3. Map over results:
   - If fromUserId is me → return toUserId (the other person)
   - If toUserId is me → return fromUserId (the other person)
4. Result: clean array of connected user objects
```

---

## Validation — `utils/validation.js`

| Function | What it validates |
|---|---|
| `validateSignUpData(req)` | firstName (4-50 chars), lastName, valid email, strong password |
| `validateEditProfileData(req)` | Only allowed fields are present in req.body |
| `validateNewPassword(req)` | New password meets strong password criteria |

**Strong password** (via validator.js) requires:
- Minimum 8 characters
- At least 1 uppercase, 1 lowercase, 1 number, 1 symbol

---

## Real-time — `utils/socket.js`

Socket.io is initialized on the same HTTP server as Express.

**Current setup:**
```
1. io = new Server(httpServer, { cors: { origin: frontend } })
2. io.on("connection") → fires when a client connects
3. socket.on("joinchat") → handler for joining a chat room (in progress)
4. socket.on("sendmessage") → handler for sending a message (in progress)
```

**Planned flow (once implemented):**
```
Client connects → emits "joinchat" with { senderId, receiverId }
→ Server creates a unique room: "room_<sortedIds>"
→ Both users join the room
→ Client emits "sendmessage" with { message, senderId, receiverId }
→ Server broadcasts message to the room
→ Optionally save message to a Messages collection in MongoDB
```

> 🔧 TODO: Implement room logic, message persistence, and disconnect handling

---

## Authentication Flow — End to End

```
SIGNUP:
Client → POST /signup → validate → hash password → save user → generate JWT → set cookie → return user

LOGIN:
Client → POST /Login → find user by email → compare password (bcrypt) → generate JWT → set cookie → return user

PROTECTED REQUEST:
Client → any protected route (with cookie) → userAuth middleware reads cookie
→ verifies JWT → finds user in DB → attaches to req.user → route handler runs

LOGOUT:
Client → POST /logout → cookie expires immediately → client loses auth
```

---

## Known Issues & TODOs

- [ ] Move secrets to `.env` file — `MONGO_URI`, `JWT_SECRET`
- [ ] Add `.env.example` for other developers
- [ ] `profile/password` route is missing `bcrypt` import
- [ ] `user/requests/received` has a missing `err` variable in catch block
- [ ] `requests.js` review route hardcodes `"accepted"` instead of using the `status` param
- [ ] Socket.io `joinchat` and `sendmessage` handlers are empty — need implementation
- [ ] Add a pre-save hook on ConnectionRequest to prevent self-requests (currently commented out)
- [ ] Add rate limiting to auth routes
- [ ] Add proper error handling middleware at app level

---

## Running Locally

```bash
# Install dependencies
npm install

# Start the server
node src/app.js

# Server runs on
http://localhost:7777
```

---

## Environment Variables (TODO)

Create a `.env` file in root:

```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=7777
```

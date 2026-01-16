from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

# ================== MONGODB CONNECTION ==================
client = MongoClient("mongodb://localhost:27017/")
db = client["soundflex_db"]  

users = db["users"]
profiles = db["profiles"]     

# ================== REGISTER USER ==================
def register_user(name, email, password):
    print(" Register request:", name, email)

    # Check if user already exists
    if users.find_one({"email": email}):
        print(" User already exists")
        return False, "User already exists"

    # Insert into users collection
    users.insert_one({
        "name": name,
        "email": email,
        "password": generate_password_hash(password),
        "created_at": datetime.utcnow()
    })

    # AUTO CREATE PROFILE
    profiles.insert_one({
        "email": email,
        "username": name,
        "bio": "",
        "location": "",
        "role": "Artist",
        "created_at": datetime.utcnow()
    })

    print(" User & Profile created successfully")
    return True, "Registration successful"

# ================== LOGIN USER ==================
def login_user(email, password):
    user = users.find_one({"email": email})

    if not user:
        return False, "User not found"

    if not check_password_hash(user["password"], password):
        return False, "Invalid password"

    return True, {
        "name": user["name"],
        "email": user["email"]
    }

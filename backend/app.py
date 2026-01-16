from flask import Flask, request, jsonify, render_template, session, redirect, url_for
from flask_cors import CORS
import os
import joblib
from datetime import datetime
from pymongo import MongoClient
import re

from audio_utils import preprocess_audio, extract_features, is_music
from auth import register_user, login_user

# ======================================================
# APP SETUP
# ======================================================
app = Flask(__name__, template_folder="templates", static_folder="static")
CORS(app, supports_credentials=True)

app.secret_key = "soundflex_secret_key"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads", "audio")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ======================================================
# LOAD AUDIO ML MODELS
# ======================================================
model = joblib.load(os.path.join(BASE_DIR, "models", "model.pkl"))
scaler = joblib.load(os.path.join(BASE_DIR, "models", "scaler.pkl"))
label_encoder = joblib.load(os.path.join(BASE_DIR, "models", "label_encoder.pkl"))

# ======================================================
# LOAD LYRICS EMOTION MODELS
# ======================================================
lyrics_model = joblib.load(os.path.join(BASE_DIR, "models", "lyrics_emotion_model.pkl"))
lyrics_vectorizer = joblib.load(os.path.join(BASE_DIR, "models", "lyrics_vectorizer.pkl"))
lyrics_label_encoder = joblib.load(os.path.join(BASE_DIR, "models", "lyrics_label_encoder.pkl"))

# ======================================================
# MONGODB
# ======================================================
client = MongoClient("mongodb://localhost:27017/")
db = client["soundflex_db"]

users = db["users"]
songs = db["songs"]
feedbacks = db["feedback"]
lyrics_history = db["lyrics_history"]  # ✅ NEW COLLECTION

# ======================================================
# BAD WORDS LIST
# ======================================================
BAD_WORDS = {"fuck", "shit", "bitch", "asshole", "bastard"}

def contains_bad_words(text):
    words = set(re.findall(r"\b\w+\b", text.lower()))
    return list(words.intersection(BAD_WORDS))

def clean_lyrics(text):
    text = text.lower()
    text = re.sub(r"[^a-z\s]", "", text)
    return text.strip()

# ======================================================
# FRONTEND ROUTES
# ======================================================
@app.route("/")
def index():
    return render_template("index.html", user=session.get("user"))

@app.route("/login")
def login_page():
    return render_template("login.html")

@app.route("/register")
def register_page():
    return render_template("register.html")

@app.route("/upload")
def upload_page():
    if "user" not in session:
        return redirect(url_for("login_page"))
    return render_template("upload.html", user=session["user"])


@app.route("/history-page")
def history_page():
    if "user" not in session:
        return redirect(url_for("login_page"))
    return render_template("history.html")

@app.route("/api/history", methods=["GET"])
def api_history():
    if "user" not in session:
        return jsonify([])

    history = list(
        songs.find(
            {"username": session["user"]},
            {"_id": 0}
        )
    )

    return jsonify(history)
@app.route("/profile")
def profile_page():
    if "user_email" not in session:
        return redirect(url_for("login_page"))

    user = users.find_one(
        {"email": session["user_email"]},
        {"_id": 0, "password": 0}
    )

    profile = {
        "username": user.get("name", ""),
        "email": user.get("email", ""),
        "bio": user.get("bio", ""),
        "location": user.get("location", "")
    }

    return render_template("profile.html", profile=profile)



@app.route("/api/profile", methods=["POST"])
def update_profile():
    if "user_email" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json(force=True)

    users.update_one(
        {"email": session["user_email"]},
        {"$set": {
            "bio": data.get("bio", ""),
            "location": data.get("location", "")
        }}
    )

    return jsonify({"success": True})



@app.route("/about")
def about_page():
    return render_template("about.html")

@app.route("/feedback")
def feedback_page():
    if "user" not in session:
        return redirect(url_for("login_page"))
    return render_template("feedback.html", user=session["user"])

@app.route("/mixing")
def mixing_page():
    if "user" not in session:
        return redirect(url_for("login_page"))
    return render_template("mixing.html")

@app.route("/distribution")
def distribution_page():
    if "user" not in session:
        return redirect(url_for("login_page"))
    return render_template("distribution.html")

@app.route("/lyrics")
def lyrics_page():
    if "user" not in session:
        return redirect(url_for("login_page"))
    return render_template("lyrics.html")

# ======================================================
# AUTH APIs
# ======================================================
@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json(force=True)
    success, message = register_user(
        data.get("name"),
        data.get("email"),
        data.get("password")
    )
    return jsonify({"success": success, "message": message})

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json(force=True)
    email = data.get("email")
    password = data.get("password")

    # ================= ADMIN LOGIN =================
    if email == "admin@soundflex.com" and password == "admin123":
        session.clear()
        session["admin"] = True
        session["user"] = "Admin"
        return jsonify({
            "success": True,
            "redirect": "/admin"
        })

    # ================= USER LOGIN =================
    success, result = login_user(email, password)

    if not success:
        return jsonify({"success": False, "message": result}), 401

    session.clear()
    session["user"] = result["name"]
    session["user_email"] = result["email"]

    return jsonify({
        "success": True,
        "redirect": "/upload"
    })
@app.route("/admin")
def admin_page():
    if not session.get("admin"):
        return redirect(url_for("login_page"))

    return render_template("admin.html")

@app.route("/api/admin/uploads")
def admin_uploads():
    if not session.get("admin"):
        return jsonify([])

    data = list(songs.find({}, {"_id": 0}))
    return jsonify(data)

@app.route("/api/admin/users")
def admin_users():
    if not session.get("admin"):
        return jsonify([])

    data = list(users.find({}, {"_id": 0, "password": 0}))
    return jsonify(data)

@app.route("/api/admin/lyrics")
def admin_lyrics():
    if not session.get("admin"):
        return jsonify([])

    data = list(lyrics_history.find({}, {"_id": 0}))
    return jsonify(data)

@app.route("/api/admin/feedbacks")
def admin_feedbacks():
    if not session.get("admin"):
        return jsonify([])

    data = list(feedbacks.find({}, {"_id": 0}))
    return jsonify(data)

@app.route("/api/admin/delete-user", methods=["POST"])
def delete_user():
    if not session.get("admin"):
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json(force=True)
    email = data.get("email")

    users.delete_one({"email": email})
    songs.delete_many({"username": email})
    lyrics_history.delete_many({"username": email})
    feedbacks.delete_many({"username": email})

    return jsonify({"success": True})

@app.route("/admin-logout")
def admin_logout():
    session.pop("admin", None)
    return redirect(url_for("index"))




@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("index"))

# ======================================================
# UPLOAD AUDIO API
# ======================================================
@app.route("/api/upload", methods=["POST"])
def upload():
    if "user" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    file = request.files.get("file")
    if not file or file.filename == "":
        return jsonify({"error": "No file uploaded"}), 400

    if not file.filename.lower().endswith((".wav", ".mp3")):
        return jsonify({"error": "Only WAV and MP3 allowed"}), 400

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    try:
        y, sr = preprocess_audio(file_path)
        valid, reason = is_music(y, sr)
        if not valid:
            return jsonify({"status": "rejected", "reason": reason})

        features, bpm = extract_features(y, sr)
        
        # Get probabilities for all classes
        probs = model.predict_proba(scaler.transform(features))[0]
        classes = label_encoder.classes_
        
        # Create list of (genre, confidence) tuples and sort desc
        genre_probs = []
        for i, prob in enumerate(probs):
            genre_probs.append({
                "genre": classes[i],
                "confidence": round(prob * 100, 2)
            })
        
        # Sort by confidence high -> low
        genre_probs.sort(key=lambda x: x["confidence"], reverse=True)
        
        # Top prediction
        top_genre = genre_probs[0]["genre"]

        songs.insert_one({
            "username": session["user"],
            "file_path": file_path,
            "uploaded_at": datetime.utcnow(),
            "predicted_genre": top_genre,
            "bpm": round(bpm, 1),
            "confidence_scores": genre_probs[:3] # Store top 3
        })

        return jsonify({
            "status": "accepted", 
            "predicted_genre": top_genre,
            "bpm": round(bpm, 1),
            "top_genres": genre_probs[:3]
        })

    except Exception as e:
        print("UPLOAD ERROR:", e)
        return jsonify({"error": "Model processing failed"}), 500

# ======================================================
# LYRICS EMOTION API (FIXED + SAFE)
# ======================================================
@app.route("/api/lyrics-emotion", methods=["POST"])
def lyrics_emotion():
    if "user" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json(force=True)
    raw_lyrics = data.get("lyrics", "").strip()

    if not raw_lyrics:
        return jsonify({"error": "Lyrics cannot be empty"}), 400

    cleaned = clean_lyrics(raw_lyrics)

    # Avoid empty / short text crash
    if len(cleaned.split()) < 4:
        cleaned += " music song feeling emotion"

    bad_words = contains_bad_words(cleaned)

    try:
        X = lyrics_vectorizer.transform([cleaned])
        if X.nnz == 0:
            return jsonify({"error": "Lyrics too generic"}), 400

        prediction = lyrics_model.predict(X)
        emotion = lyrics_label_encoder.inverse_transform(prediction)[0]

        lyrics_history.insert_one({
            "username": session["user"],
            "lyrics": raw_lyrics,
            "emotion": emotion,
            "bad_words": bad_words,
            "created_at": datetime.utcnow()
        })

        return jsonify({
            "emotion": emotion,
            "bad_words_detected": bad_words
        })

    except Exception as e:
        print("LYRICS ERROR:", e)
        return jsonify({"error": "Lyrics analysis failed"}), 500

# ======================================================
# FEEDBACK API
# ======================================================
@app.route("/api/feedback", methods=["POST"])
def submit_feedback():
    if "user" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json(force=True)
    feedbacks.insert_one({
        "username": session["user"],
        "message": data.get("message"),
        "rating": data.get("rating"),
        "submitted_at": datetime.utcnow()
    })
    return jsonify({"success": True})

# ======================================================
# BEAT PRODUCTION API (Free / G4F)
# ======================================================
from g4f.client import Client
import json

@app.route("/beat-production")
def beat_production_page():
    return render_template("beat_production.html")

@app.route("/api/generate-beat-recipe", methods=["POST"])
def generate_beat_recipe():
    data = request.get_json(force=True)
    genre = data.get("genre")
    vibe = data.get("vibe")

    if not genre or not vibe:
        return jsonify({"error": "Genre and Vibe are required"}), 400

    try:
        client = Client()
        
        # We ask for a JSON-like structure in the text prompt
        system_prompt = f"""
        Act as a professional music producer. Create a brief, punchy beat production recipe for:
        Genre: {genre}
        Vibe: {vibe}
        
        Output valid JSON with keys: "drums", "instruments", "mixing", "arrangement".
        Keep descriptions short and actionable.
        Do not generate markdown blocks.
        """
        
        # Optimized list for stability (GPT-3.5 is most widely supported)
        models_to_try = ['gpt-3.5-turbo', 'gpt-4o-mini', 'gemini-pro']
        
        raw_recipe = None
        
        for model in models_to_try:
            try:
                print(f"BeatRecipe: Trying {model}...")
                response = client.chat.completions.create(
                    model=model,
                    messages=[{"role": "user", "content": system_prompt}],
                )
                content = response.choices[0].message.content
                
                # Validation: Check if provider returned an error message as content
                if content and "does not exist" not in content and "error" not in content.lower():
                    raw_recipe = content
                    break
                else:
                    print(f"Model {model} returned provider error: {content}")
                    continue

            except Exception as e:
                print(f"Model {model} failed: {e}")
                continue
        
        if not raw_recipe:
             return jsonify({"error": "Failed to generate recipe."}), 500

        # Clean up response if it contains markdown code blocks
        clean_json = raw_recipe.replace("```json", "").replace("```", "").strip()
        
        try:
            recipe_dict = json.loads(clean_json)
        except:
             # If API returns malformed JSON, return text in 'drums' as fallback
             print("JSON Parsing failed, returning raw text")
             recipe_dict = {
                 "drums": raw_recipe,
                 "instruments": "See above.",
                 "mixing": "See above.",
                 "arrangement": "See above."
             }

        return jsonify({"recipe": recipe_dict})

    except Exception as e:
        print("BEAT ERROR:", e)
        return jsonify({"error": str(e)}), 500

# ======================================================
# RUN SERVER
# ======================================================
if __name__ == "__main__":
    app.run(debug=True)

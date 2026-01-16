import librosa
import numpy as np

SR = 22050
DURATION = 30
SAMPLES = SR * DURATION

def preprocess_audio(path):
    y, sr = librosa.load(path, sr=SR, mono=True)
    y = librosa.util.fix_length(y, size=SAMPLES)
    return y, sr

def extract_features(y, sr):
    features = []

    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=20)
    features.extend(np.mean(mfcc, axis=1))
    features.extend(np.var(mfcc, axis=1))

    features.append(float(np.mean(librosa.feature.chroma_stft(y=y, sr=sr))))
    features.append(float(np.mean(librosa.feature.spectral_centroid(y=y, sr=sr))))
    features.append(float(np.mean(librosa.feature.zero_crossing_rate(y))))
    features.append(float(np.mean(librosa.feature.rms(y=y))))

    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    tempo_val = float(tempo[0]) if hasattr(tempo, "__len__") else float(tempo)
    features.append(tempo_val)

    return np.array(features).reshape(1, -1), tempo_val

def is_music(y, sr):
    rms = float(np.mean(librosa.feature.rms(y=y)))
    zcr = float(np.mean(librosa.feature.zero_crossing_rate(y)))
    centroid = float(np.mean(librosa.feature.spectral_centroid(y=y, sr=sr)))

    y_h, y_p = librosa.effects.hpss(y)
    perc_energy = np.mean(np.abs(y_p))

    if rms < 0.01:
        return False, "Silence detected"
    if perc_energy < 0.003:
        return False, "Only vocals detected"
    if zcr > 0.25:
        return False, "Speech or noise detected"
    if centroid < 1000:
        return False, "Non-musical audio"

    return True, "Valid song"

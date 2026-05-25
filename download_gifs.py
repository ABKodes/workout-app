"""
Downloads exercise GIFs from GIPHY and saves them to public/demos/
Run once: python download_gifs.py
"""

import requests
import os
import re
import time

GIPHY_KEY = "qfwTIziegExvjgngT613ZKgK8RuYOby9"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "public", "demos")

# Exercise name -> GIPHY search term
EXERCISES = {
    "DB_Lateral_Raise":              "dumbbell lateral raise gym",
    "Low_Incline_DB_Press":          "incline dumbbell press gym",
    "DB_Flye":                       "dumbbell chest fly gym",
    "DB_Skull_Crusher":              "skull crusher tricep gym",
    "Close_Grip_Dip":                "tricep dips gym",
    "Plate_Weighted_Crunch":         "weighted crunch abs gym",
    "Overhand_Lat_Pulldown":         "lat pulldown overhand gym",
    "DB_RDL":                        "romanian deadlift gym",
    "Helms_Row":                     "dumbbell row incline gym",
    "DB_Lat_Pullover":               "dumbbell pullover gym",
    "Hammer_Curl":                   "hammer curl dumbbell gym",
    "Reverse_DB_Flye":               "reverse fly rear delt gym",
    "Goblet_Squat":                  "goblet squat gym",
    "Standing_Calf_Raise":           "calf raise standing gym",
    "Nordic_Ham_Curl":               "nordic hamstring curl gym",
    "Copenhagen_Hip_Adduction":      "hip adduction exercise",
    "Reverse_Nordic":                "reverse nordic curl exercise",
    "Depth_Jumps":                   "depth jump plyometric",
    "Split_Squat_Jumps":             "split squat jump exercise",
    "Box_Jumps":                     "box jump exercise",
    "Single_Leg_Lateral_Hops":       "lateral hop exercise",
    "Broad_Jumps":                   "broad jump exercise",
}

def search_giphy(query):
    url = "https://api.giphy.com/v1/gifs/search"
    params = {
        "api_key": GIPHY_KEY,
        "q": query,
        "limit": 1,
        "rating": "g",
        "lang": "en",
    }
    resp = requests.get(url, params=params, timeout=10)
    resp.raise_for_status()
    data = resp.json()
    if not data["data"]:
        return None
    # Use downsized_large for good quality but reasonable file size
    images = data["data"][0]["images"]
    return (
        images.get("downsized_large", {}).get("url")
        or images.get("original", {}).get("url")
    )

def download_gif(gif_url, filepath):
    resp = requests.get(gif_url, timeout=30, stream=True)
    resp.raise_for_status()
    with open(filepath, "wb") as f:
        for chunk in resp.iter_content(chunk_size=8192):
            f.write(chunk)
    size_kb = os.path.getsize(filepath) // 1024
    return size_kb

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Saving GIFs to: {OUTPUT_DIR}\n")

    success = 0
    failed = []

    for name, query in EXERCISES.items():
        filepath = os.path.join(OUTPUT_DIR, f"{name}.gif")

        # Skip if already downloaded
        if os.path.exists(filepath):
            print(f"  ✓ Already exists: {name}.gif")
            success += 1
            continue

        print(f"  Searching: {query}...")
        try:
            gif_url = search_giphy(query)
            if not gif_url:
                print(f"  ✗ No result for: {name}")
                failed.append(name)
                continue

            size_kb = download_gif(gif_url, filepath)
            print(f"  ✓ Saved: {name}.gif ({size_kb} KB)")
            success += 1

        except Exception as e:
            print(f"  ✗ Error for {name}: {e}")
            failed.append(name)

        # Be polite to the API — small delay between requests
        time.sleep(0.5)

    print(f"\nDone: {success}/{len(EXERCISES)} downloaded")
    if failed:
        print(f"Failed: {', '.join(failed)}")
    print(f"\nGIFs saved to: {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
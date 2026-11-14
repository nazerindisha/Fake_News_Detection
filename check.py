import os
import sys

def check_system():
    print("==================================================")
    print("🔍 VeriFact AI — Environment & Data Diagnostics")
    print("==================================================")
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.getenv("DATA_DIR", os.path.join(current_dir, "data"))
    
    print(f"Current Directory: {current_dir}")
    print(f"Dataset Directory: {data_dir} (Exists: {os.path.exists(data_dir)})\n")
    
    files_to_check = {
        "English Real Dataset": [os.path.join(data_dir, "True.csv"), os.path.join(current_dir, "True.csv")],
        "English Fake Dataset": [os.path.join(data_dir, "Fake.csv"), os.path.join(current_dir, "Fake.csv")],
        "Bangla Real Dataset": [os.path.join(data_dir, "Authentic-48K.csv"), os.path.join(current_dir, "Authentic-48K.csv")],
        "Bangla Fake Dataset": [os.path.join(data_dir, "Fake-1K.csv"), os.path.join(current_dir, "Fake-1K.csv")],
        "English Trained Model": [os.path.join(current_dir, "fake_news_model.joblib")],
        "Bangla Trained Model": [os.path.join(current_dir, "fake_news_model_bn.joblib")],
    }
    
    for name, paths in files_to_check.items():
        found = False
        for p in paths:
            if os.path.isfile(p):
                size_mb = os.path.getsize(p) / (1024 * 1024)
                print(f"✅ {name}: Found at '{os.path.relpath(p, current_dir)}' ({size_mb:.2f} MB)")
                found = True
                break
        if not found:
            print(f"⚠️ {name}: Not found (Expected in 'data/' or root directory)")
            
    print("\n--------------------------------------------------")
    print("Testing core modules:")
    try:
        from scraper import extract_text_from_url
        print("✅ scraper module: OK")
    except Exception as e:
        print(f"❌ scraper module: Failed ({e})")
        
    try:
        from retriever import ActualNewsRetriever
        print("✅ retriever module: OK")
    except Exception as e:
        print(f"❌ retriever module: Failed ({e})")
        
    print("==================================================")

if __name__ == "__main__":
    check_system()

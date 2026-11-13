import os

path = "D:/7th_Semester_Collections/Project/Fake_News_Detection/True.csv"

print("1. Does path exist?", os.path.exists(path))
print("2. Is it recognized as a file?", os.path.isfile(path))

try:
    with open(path, "r", encoding="utf-8") as f:
        print("3. Successfully opened! First line:", f.readline()[:100])
except Exception as e:
    print("3. Failed to open. Error:", e)
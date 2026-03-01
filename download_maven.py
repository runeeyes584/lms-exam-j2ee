import urllib.request
import zipfile
import os

url = "https://downloads.apache.org/maven/maven-3/3.9.9/binaries/apache-maven-3.9.9-bin.zip"
zip_path = r"c:\Users\DELL\.gemini\antigravity\scratch\lms-exam-j2ee\maven.zip"
extract_path = r"c:\Users\DELL\.gemini\antigravity\scratch\lms-exam-j2ee\maven"

print(f"Downloading Maven from {url}...")
try:
    urllib.request.urlretrieve(url, zip_path)
    print("Download complete. Extracting...")
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_path)
    print("Extraction complete.")
    os.remove(zip_path)
    with open("maven_done.txt", "w") as f:
        f.write("OK")
    print("All done!")
except Exception as e:
    print(f"Error: {e}")

# 🛡️ VeriFact AI — Bilingual Fake News Detection & Fact Verification Platform

An advanced, full-stack bilingual (English & Bangla) misinformation detection and fact-verification system. This platform combines machine learning classification pipelines with a large-scale hybrid retrieval database of over 70,000 verified real articles and live web scraping to deliver real-time news authenticity assessments.

---

## 🚀 Key Features

* **Bilingual Support:** Full capability to process, analyze, and cross-reference both English and Bangla news claims.
* **Hybrid Verification Architecture:** Pairs trained ML classification models with a high-speed retrieval engine indexing over 70,000 verified historical records (21,417 English and 48,678 Bangla real articles).
* **Live Web Scraping:** Integrated URL extraction powered by `trafilatura` to instantly pull and vet content from online news links.
* **Interactive Responsive Dashboard:** A sleek, modern frontend built with Tailwind CSS supporting text input, URL verification, real-time confidence scores, and dynamic visual verdicts.
* **RESTful FastAPI Backend:** High-performance asynchronous API with CORS support, automated schema documentation (`/docs`), and seamless local deployment.

---

## 🛠️ Tech Stack

* **Backend:** Python, FastAPI, Uvicorn, Pydantic
* **Machine Learning & Data:** Scikit-Learn, Joblib/Pickle, Pandas
* **Web Scraping & Retrieval:** Trafilatura, Custom Hybrid Retriever
* **Frontend:** HTML5, Tailwind CSS, JavaScript (Fetch API)
* **Environment & Tools:** Visual Studio Code, Git & GitHub

---

## 📁 Project Directory Structure

```text
Fake_News_Detection/
│
├── main.py               # FastAPI backend application and endpoints
├── scraper.py            # Trafilatura-based web scraping module
├── retriever.py          # Hybrid actual news retriever logic (70k+ records)
├── train.py              # English model training pipeline
├── train_bn.py           # Bangla model training pipeline
├── index.html            # Responsive frontend Tailwind CSS dashboard
├── requirements.txt      # Python dependencies
└── README.md             # Project documentation

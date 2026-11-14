# 📂 Datasets Directory

Place the following dataset CSV files inside this `data/` directory (or specify a custom path using the `DATA_DIR` environment variable):

### 1. English Dataset (ISOT Fake News Dataset)
* **`True.csv`**: Verified authentic news articles containing `title`, `text`, `subject`, `date`.
* **`Fake.csv`**: Unverified or fabricated news articles containing `title`, `text`, `subject`, `date`.

### 2. Bangla Dataset (BanFakeNews Dataset)
* **`Authentic-48K.csv`**: ~48,000 authentic Bangla news articles containing `headline` and `content`.
* **`Fake-1K.csv`**: ~1,300 fabricated Bangla news articles containing `headline` and `content`.

*(Note: `.csv` files and trained `.joblib` model weights are excluded from Git commits via `.gitignore` to keep the repository lightweight.)*

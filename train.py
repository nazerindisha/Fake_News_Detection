"""
English Model Training Entrypoint
Forwards execution to pipelines.train_en.
"""
from pipelines.train_en import train_english_pipeline

if __name__ == "__main__":
    train_english_pipeline()

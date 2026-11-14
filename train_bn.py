"""
Bangla Model Training Entrypoint
Forwards execution to pipelines.train_bn.
"""
from pipelines.train_bn import train_bangla_pipeline

if __name__ == "__main__":
    train_bangla_pipeline()

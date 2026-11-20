import math
import re
from collections import Counter
from typing import List, Dict

def tokenize_and_ngrams(text: str, n: int = 3) -> Counter:
    """Extracts character n-grams and word tokens for semantic term-frequency similarity."""
    text = text.lower().strip()
    words = re.findall(r"\b\w+\b", text)
    
    counts = Counter()
    for w in words:
        counts[f"w_{w}"] += 2.0 # Give extra weight to full words
        
    # Add character n-grams for typo resilience
    clean_str = re.sub(r"\s+", " ", text)
    if len(clean_str) >= n:
        for i in range(len(clean_str) - n + 1):
            ngram = clean_str[i:i+n]
            counts[f"ng_{ngram}"] += 1.0
            
    return counts

def cosine_similarity_vectors(vec1: Counter, vec2: Counter) -> float:
    """Computes cosine similarity between two sparse vector representations."""
    intersection = set(vec1.keys()) & set(vec2.keys())
    if not intersection:
        return 0.0
        
    dot_product = sum(vec1[x] * vec2[x] for x in intersection)
    mag1 = math.sqrt(sum(v ** 2 for v in vec1.values()))
    mag2 = math.sqrt(sum(v ** 2 for v in vec2.values()))
    
    if not mag1 or not mag2:
        return 0.0
    return dot_product / (mag1 * mag2)

def calculate_semantic_similarity(text1: str, text2: str) -> float:
    """Returns semantic similarity score between 0.0 and 100.0."""
    if not text1 or not text2:
        return 0.0
    v1 = tokenize_and_ngrams(text1)
    v2 = tokenize_and_ngrams(text2)
    sim = cosine_similarity_vectors(v1, v2)
    return round(min(100.0, max(0.0, sim * 100.0)), 2)

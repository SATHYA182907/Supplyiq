from rapidfuzz import fuzz

def calculate_fuzzy_scores(s1: str, s2: str) -> dict:
    """
    Calculates a composite fuzzy string score between two strings using RapidFuzz.
    Evaluates:
    - Token Sort Ratio (reorders words, handles 'The Ritz Carlton' vs 'Ritz Carlton The')
    - Token Set Ratio (handles subsets, e.g. 'Marina Bay Sands' vs 'Marina Bay Sands Hotel & Casino')
    - Simple Levenshtein Ratio
    - Partial Ratio
    """
    if not s1 or not s2:
        return {"composite": 0.0, "token_sort": 0.0, "token_set": 0.0, "ratio": 0.0}
        
    ts_ratio = fuzz.token_sort_ratio(s1, s2)
    tset_ratio = fuzz.token_set_ratio(s1, s2)
    ratio = fuzz.ratio(s1, s2)
    partial = fuzz.partial_ratio(s1, s2)
    
    # Composite weighting favoring token set & token sort for real travel naming
    composite = (tset_ratio * 0.40) + (ts_ratio * 0.35) + (ratio * 0.15) + (partial * 0.10)
    
    return {
        "composite": round(composite, 2),
        "token_sort": round(float(ts_ratio), 2),
        "token_set": round(float(tset_ratio), 2),
        "ratio": round(float(ratio), 2)
    }

import re

def normalize_text(text: str) -> str:
    """Cleans and standardizes hotel/attraction names for blocking and comparison."""
    if not text:
        return ""
    text = text.lower().strip()
    
    # Replace common abbreviations and symbols
    replacements = {
        "&": " and ",
        "@": " at ",
        "htl": "hotel",
        "res": "resort",
        "intl": "international",
        "apt": "apartments",
        "st.": "saint",
        "st ": "street ",
        "ave": "avenue",
        "blvd": "boulevard",
        "rd": "road",
        "str": "strand",
    }
    for k, v in replacements.items():
        text = re.sub(rf"\b{re.escape(k)}\b", v, text)
        
    # Remove special punctuation
    text = re.sub(r"[^\w\s]", " ", text)
    # Collapse multiple whitespaces
    text = re.sub(r"\s+", " ", text).strip()
    return text

def normalize_hotel_brand(name: str) -> str:
    """Strips noise words like 'The', 'Hotel', 'Resort', 'Spa' to find true brand stem."""
    normalized = normalize_text(name)
    stopwords = {"the", "hotel", "resort", "and", "spa", "suites", "luxury", "boutique", "inn", "lodge", "motel"}
    tokens = [w for w in normalized.split() if w not in stopwords]
    return " ".join(tokens) if tokens else normalized

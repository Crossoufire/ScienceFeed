import re
from typing import List
from datetime import datetime, timezone


def find_matching_keywords_regex(keywords, data_dict) -> List[str]:
    pattern = re.compile(r"\b(" + "|".join(re.escape(k.lower()) for k in keywords) + r")\b", re.IGNORECASE)

    def find_matches(text):
        if not isinstance(text, str):
            return []
        return {match.group(1) for match in pattern.finditer(text.lower())}

    return list({match for value in data_dict.values() for match in find_matches(value)})


def clean_html_with_regex(html):
    html = re.sub(r"<(script|style).*?>.*?</\1>", "", html, flags=re.DOTALL)
    clean_text = re.sub(r"<.*?>", "", html)
    clean_text = re.sub(r"\s+", " ", clean_text).strip()

    return clean_text


def aware_utcnow():
    return datetime.now(timezone.utc)


def naive_utcnow():
    return aware_utcnow().replace(tzinfo=None)

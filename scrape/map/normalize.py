"""Text normalisation + fuzzy matching helpers for the competitor→DB mapping."""
from __future__ import annotations

import re
import unicodedata

_AR_DIAC = re.compile(r"[\u0617-\u061A\u064B-\u0652\u0670\u0640\u06D6-\u06ED]")
_NONWORD = re.compile(r"[^0-9a-z\u0600-\u06FF]+")

# Common spelling variants that should collapse to one token.
_EN_CANON = {
    "universiti": "university",
    "univ": "university",
    "universty": "university",
    "&": "and",
    "sci": "science",
    "tech": "technology",
    "mgmt": "management",
    "intl": "international",
    "coll": "college",
}


def strip_diacritics(s: str) -> str:
    return _AR_DIAC.sub("", s)


def norm(s: str | None) -> str:
    """Lowercase, fold Arabic letter variants, drop punctuation, collapse spaces."""
    if not s:
        return ""
    s = unicodedata.normalize("NFKC", str(s))
    s = s.lower()
    s = s.replace("&", " and ")
    # Arabic folding
    s = strip_diacritics(s)
    s = re.sub(r"[إأآٱا]", "ا", s)
    s = s.replace("ى", "ي").replace("ئ", "ي").replace("ؤ", "و")
    s = s.replace("ة", "ه")
    # unify digits
    s = s.translate(str.maketrans("٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹", "01234567890123456789"))
    s = _NONWORD.sub(" ", s)
    toks = []
    for t in s.split():
        toks.append(_EN_CANON.get(t, t))
    return " ".join(toks).strip()


def tokens(s: str | None) -> set[str]:
    n = norm(s)
    return {t for t in n.split() if t}


_STOP = {
    "university", "universiti", "college", "of", "the", "and", "in", "for",
    "جامعه", "كليه", "ال", "في", "و", "ل", "ب", "من", "على", "ماليزيا",
}


def sig_tokens(s: str | None) -> set[str]:
    """Distinctive tokens (drops generic words like 'university', 'جامعة')."""
    return {t for t in tokens(s) if t not in _STOP and len(t) > 1}


def jaccard(a: set[str], b: set[str]) -> float:
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)


def containment(a: set[str], b: set[str]) -> float:
    """How much of the smaller set is covered by the larger."""
    if not a or not b:
        return 0.0
    small, big = (a, b) if len(a) <= len(b) else (b, a)
    return len(small & big) / len(small)


def best_name_score(candidates: list[str], targets: list[str]) -> float:
    """Best fuzzy score between any candidate string and any target string."""
    return best_name_match(candidates, targets)[0]


def best_name_match(candidates: list[str], targets: list[str]) -> tuple[float, float]:
    """Return (score, jaccard) for the best candidate/target pair.

    `score` blends containment (good when one name is a subset of the other)
    with Jaccard; the second value breaks ties toward the more specific match.
    """
    best_score = 0.0
    best_jac = 0.0
    cand_tok = [sig_tokens(c) for c in candidates if c]
    targ_tok = [sig_tokens(t) for t in targets if t]
    for ct in cand_tok:
        for tt in targ_tok:
            if not ct or not tt:
                continue
            jac = jaccard(ct, tt)
            con = containment(ct, tt)
            score = max(jac, con * 0.9)
            if (score, jac) > (best_score, best_jac):
                best_score, best_jac = score, jac
    return best_score, best_jac

import re
import difflib
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.models import DbComplaint, DbDepartment, DbOfficer, DbNotification

# ─────────────────────────────────────────────────────────────
# Bilingual Keyword Dictionaries (Tamil + English)
# ─────────────────────────────────────────────────────────────
CATEGORY_RULES: List[Dict[str, Any]] = [
    {
        "category": "Water Supply",
        "dept": "Water Supply Department",
        "priority_triggers": ["drinking", "2 days", "burst", "urgent", "no water", "குடிநீர்", "வெடிப்பு", "2 நாட்கள்"],
        "keywords": [
            "water", "leak", "pipe", "pipeline", "tap", "supply", "borewell", "tanker", "pressure", "drinking water", "contamination",
            "தண்ணீர்", "குடிநீர்", "குழாய்", "கசிவு", "நீர்", "விநியோகம்", "மோட்டார்", "தொட்டி", "சாக்கடை நீர்"
        ],
        "default_priority": "High"
    },
    {
        "category": "Electricity",
        "dept": "Electricity Board",
        "priority_triggers": ["live wire", "spark", "transformer", "fire", "shock", "உயிர்க்கம்பி", "தீ", "ஷாக்", "மின்கசிவு"],
        "keywords": [
            "electricity", "light", "street light", "power", "current", "voltage", "wire", "pole", "transformer", "spark", "blackout",
            "மின்சாரம்", "தெருவிளக்கு", "மின்கம்பி", "மின் கம்பம்", "மின்வெட்டு", "மின்மாற்றி", "ஒளி", "மின்சாரம் இல்லை"
        ],
        "default_priority": "High"
    },
    {
        "category": "Roads & Infrastructure",
        "dept": "Roads & PWD",
        "priority_triggers": ["accident", "cave-in", "crater", "main road", "விபத்து", "பள்ளம்", "பிரதான சாலை"],
        "keywords": [
            "road", "pothole", "tar", "asphalt", "footpath", "pavement", "crack", "bridge", "divider", "traffic signal", "manhole cover",
            "சாலை", "பள்ளம்", "ரோடு", "நடைபாதை", "விபத்து", "சேதம்", "மழைநீர் பள்ளம்", "மேடு"
        ],
        "default_priority": "Medium"
    },
    {
        "category": "Drainage",
        "dept": "Drainage & Sewerage",
        "priority_triggers": ["flood", "waterlogging", "overflow", "stink", "வெள்ளம்", "மழைநீர் தேக்கம்", "கழிவுநீர்"],
        "keywords": [
            "drain", "drainage", "sewage", "sewer", "gutter", "waterlog", "overflow", "clog", "choke", "stagnant",
            "சாக்கடை", "கழிவுநீர்", "வடிகால்", "அடைப்பு", "தேக்கம்", "நாற்றம்", "வெள்ளம்"
        ],
        "default_priority": "Medium"
    },
    {
        "category": "Sanitation",
        "dept": "Sanitation Department",
        "priority_triggers": ["dump", "maggots", "rotting", "rotted", "குப்பை மேடு", "துர்நாற்றம்"],
        "keywords": [
            "garbage", "waste", "trash", "rubbish", "dustbin", "bin", "cleaning", "sweep", "litter", "dump", "stench",
            "குப்பை", "தூய்மை", "கழிவு", "துப்புரவு", "துர்நாற்றம்", "குப்பைத்தொட்டி", "அள்ளவில்லை"
        ],
        "default_priority": "Medium"
    },
    {
        "category": "Public Health",
        "dept": "Public Health",
        "priority_triggers": ["dengue", "malaria", "epidemic", "poison", "hospital", "டெங்கு", "மலேரியா", "நோய்"],
        "keywords": [
            "health", "mosquito", "fogging", "spray", "disease", "fever", "stray dog", "animal", "dead animal", "clinic",
            "சுகாதாரம்", "கொசு", "மருந்து தெளிப்பு", "நோய்", "தெரு நாய்", "இறந்த நாய்", "மருத்துவமனை", "காய்ச்சல்"
        ],
        "default_priority": "High"
    },
    {
        "category": "Parks & Recreation",
        "dept": "Parks Department",
        "priority_triggers": ["child injured", "broken glass", "குழந்தை காயம்"],
        "keywords": [
            "park", "garden", "bench", "swing", "slide", "tree", "branches", "playground", "grass", "plants",
            "பூங்கா", "மரம்", "கிளை", "விளையாட்டு", "ஊஞ்சல்", "தோட்டம்", "புல்வெளி"
        ],
        "default_priority": "Low"
    },
    {
        "category": "Enforcement",
        "dept": "Municipal Enforcement",
        "priority_triggers": ["illegal construction", "assault", "threat", "ஆக்கிரமிப்பு"],
        "keywords": [
            "illegal", "encroach", "encroachment", "hawker", "vendor", "loudspeaker", "noise", "parking", "blocked walkway",
            "ஆக்கிரமிப்பு", "சட்டவிரோதம்", "ஒலிபெருக்கி", "சத்தம்", "சாலையோர கடை", "வாகன நிறுத்தம்"
        ],
        "default_priority": "Medium"
    },
    {
        "category": "Education",
        "dept": "Education Department",
        "priority_triggers": ["safety hazard in school", "பள்ளி ஆபத்து"],
        "keywords": [
            "school", "classroom", "student", "teacher", "midday meal", "desk", "blackboard", "college",
            "பள்ளி", "மாணவர்", "ஆசிரியர்", "வகுப்பறை", "மதிய உணவு", "கல்வி"
        ],
        "default_priority": "Low"
    },
    {
        "category": "Ward Committee & Governance",
        "dept": "Governance & Ward Committee",
        "priority_triggers": ["corruption", "bribe", "ஊழல்", "லஞ்சம்"],
        "keywords": [
            "ward committee", "meeting", "councillor", "mla", "grievance meeting", "corruption", "bribe", "fund", "scheme",
            "வார்டு குழு", "கூட்டம்", "கவுன்சிலர்", "மனு", "லஞ்சம்", "ஊழல்", "திட்டம்"
        ],
        "default_priority": "Medium"
    }
]

def classify_text_bilingual(text: str) -> Dict[str, Any]:
    """
    Rule + heuristic NLP classifier that works natively on both Tamil and English civic text.
    Returns category, department, priority, confidence, reasoning, and short administrative summary.
    """
    clean_text = text.lower().strip()
    best_cat = "Other"
    best_dept = "General Administration"
    best_score = 0
    matched_rule = None
    reasoning_parts = []

    for rule in CATEGORY_RULES:
        score = 0
        matched_words = []
        for kw in rule["keywords"]:
            if kw.lower() in clean_text:
                score += 1
                matched_words.append(kw)
        
        if score > best_score:
            best_score = score
            best_cat = rule["category"]
            best_dept = rule["dept"]
            matched_rule = rule
            reasoning_parts = matched_words

    # Urgency & Priority Detection
    priority = "Medium"
    if matched_rule:
        priority = matched_rule["default_priority"]
        for pt in matched_rule["priority_triggers"]:
            if pt.lower() in clean_text:
                priority = "High"
                reasoning_parts.append(f"urgent trigger '{pt}'")
                break

    # If general high priority keywords found
    if any(w in clean_text for w in ["emergency", "urgent", "danger", "hazard", "life", "அவசரம்", "ஆபத்து"]):
        priority = "High"

    confidence = min(0.98, max(0.65, 0.65 + (best_score * 0.08)))
    if best_score == 0:
        confidence = 0.50
        reasoning = "Unclassified or insufficient keywords — flagged for administrative review."
        needs_review = True
    else:
        reasoning = f"Matched {len(reasoning_parts)} civic indicators ({', '.join(reasoning_parts[:4])}). Categorized under {best_cat}."
        needs_review = False

    # Short administrative summary
    first_sentence = text.split("\n")[0].split(".")[0].strip()
    if len(first_sentence) > 90:
        first_sentence = first_sentence[:87] + "..."
    admin_summary = f"[{best_cat} - {priority} Priority] {first_sentence}"

    return {
        "category": best_cat,
        "department": best_dept,
        "priority": priority,
        "confidence": round(confidence, 2),
        "reasoning": reasoning,
        "needs_review": needs_review,
        "admin_summary": admin_summary
    }

def detect_duplicates(db: Session, issue: str, ward: str, current_id: Optional[str] = None) -> Optional[str]:
    """
    Checks for open or recent complaints in the same ward with similar text.
    """
    candidates = db.query(DbComplaint).filter(
        DbComplaint.ward == ward,
        DbComplaint.status.notin_(["Closed", "Resolved"])
    ).limit(50).all()

    for cand in candidates:
        if current_id and cand.id == current_id:
            continue
        ratio = difflib.SequenceMatcher(None, issue.lower(), cand.issue.lower()).ratio()
        if ratio > 0.72:
            return cand.id
    return None

def assign_eligible_officer(db: Session, dept_name: str, ward: str) -> Dict[str, Any]:
    """
    Finds the best eligible officer in the given department based on active status,
    ward coverage match, and lowest current workload.
    """
    # 1. Search for active officers in department
    officers = db.query(DbOfficer).filter(
        DbOfficer.dept == dept_name,
        DbOfficer.active == True
    ).all()

    if not officers:
        # Fallback: check any officer in department or return unassigned
        return {"assignedTo": f"Head of {dept_name}", "officerId": None, "autoAssigned": False}

    # 2. Ward preference scoring
    best_officer = None
    min_workload = 9999

    for off in officers:
        is_ward_match = (off.ward == "All Wards") or (ward.lower() in off.ward.lower())
        effective_workload = off.current_workload if is_ward_match else off.current_workload + 5
        if effective_workload < min_workload and off.current_workload < off.max_workload:
            min_workload = effective_workload
            best_officer = off

    if best_officer:
        best_officer.current_workload += 1
        db.commit()
        return {
            "assignedTo": f"{best_officer.name} ({best_officer.dept})",
            "officerId": best_officer.id,
            "autoAssigned": True
        }

    # If all over workload limit
    return {"assignedTo": f"{officers[0].name} ({officers[0].dept})", "officerId": officers[0].id, "autoAssigned": True}

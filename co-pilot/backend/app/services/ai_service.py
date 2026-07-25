import random

def summarize_document(text: str) -> list[str]:
    """Generates a list of simulated key points summarizing the provided document content."""
    default_points = [
        "Infrastructure development and local road repavement identified as top urgency items.",
        "Budget constraints evaluated for water sanitation projects within Ward 3.",
        "Public communication templates prepared for community briefing sessions."
    ]
    if not text.strip():
        return default_points

    # Simple heuristic summaries
    lower = text.lower()
    points = []
    if "water" in lower or "leak" in lower:
        points.append("Identify pipelines requiring immediate pressure testing and joint seal replacements.")
    if "road" in lower or "pothole" in lower:
        points.append("Calculate logistics costs for high-durability cold-mix asphalt overlay work.")
    if "electricity" in lower or "light" in lower:
        points.append("Evaluate electrical grid loading trends during evening hours.")
        
    points.append(f"Document analyze results indicate focus on {text[:40]}...")
    points.append("Simulated AI cluster validation checks out with 98.4% confidence.")
    
    return points[:3]

def generate_speech_script(topic: str, language: str) -> str:
    """Generates a mock translation script based on the topic and target language."""
    # Custom Tamil responses if requested, matching standard gov announcements
    scripts = {
        "tamil": {
            "Water Development": (
                "வணக்கம். நமது வார்டில் குடிநீர் விநியோகத்தை மேம்படுத்த புதிய குழாய்கள் மற்றும் "
                "நீர் சுத்திகரிப்பு வசதிகள் அமைக்கப்பட்டு வருகின்றன. இதனால் விரைவில் சீரான குடிநீர் "
                "வழங்கப்படும் என்பதை தெரிவித்துக் கொள்கிறோம்."
            ),
            "Road Repair": (
                "வணக்கம். நமது தொகுதி முழுவதும் சாலைகளை சீரமைக்கும் பணிகள் தீவிரமாகத் "
                "தொடங்கப்பட்டுள்ளன. இதனால் போக்குவரத்து நெரிசல் மற்றும் விபத்துகள் தவிர்க்கப்படும்."
            ),
            "General Announcement": (
                "வணக்கம். நமது மாவட்ட நிர்வாகத்தின் புதிய திட்டங்கள் குறித்த தகவல்களை குடிமக்கள் "
                "உடனுக்குடன் அறிந்து கொள்ள இந்த புதிய போர்டல் வழிவகுக்கிறது. நன்றி."
            )
        },
        "english": {
            "Water Development": (
                "Dear citizens, to improve water distribution, new pipelines and purification units "
                "are being installed in our ward. We assure you of constant water supply soon."
            ),
            "Road Repair": (
                "Dear citizens, comprehensive road restoration projects have been initiated across the "
                "constituency. This will minimize accidents and ease traffic flow. Thank you."
            ),
            "General Announcement": (
                "Dear citizens, this administrative portal enables you to track public issues, "
                "verify status in real-time, and download official announcements. Thank you."
            )
        }
    }
    
    lang_key = language.lower()
    topic_key = "General Announcement"
    for k in ["Water Development", "Road Repair"]:
        if k.lower() in topic.lower():
            topic_key = k

    lang_dict = scripts.get(lang_key, scripts["english"])
    return lang_dict.get(topic_key, lang_dict["General Announcement"])

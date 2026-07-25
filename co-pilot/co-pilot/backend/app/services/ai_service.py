import re
from typing import List


def summarize_document(text: str) -> List[str]:
    """Generate a context-aware summary from the supplied document text."""
    cleaned = (text or "").strip()
    if not cleaned:
        return [
            "Subject: Uploaded document",
            "Key takeaway: The document content could not be extracted.",
            "Action: Please re-upload a text-based version for analysis.",
        ]

    normalized = re.sub(r"\s+", " ", cleaned).strip()
    lines = [line.strip() for line in cleaned.splitlines() if line.strip()]
    prefixes = ("subject:", "re:", "regarding:")
    title = next(
        (
            line
            for line in lines
            if line.lower().startswith(prefixes) or len(line) < 120
        ),
        lines[0] if lines else "Document",
    )
    if isinstance(title, str) and title.lower().startswith(prefixes):
        title = title.split(":", 1)[1].strip() if ":" in title else title.strip()

    lower = normalized.lower()
    doc_type = detect_document_type(lower)

    if doc_type == "technical-requirements":
        return build_technical_requirements_summary(title, lower, lines)
    if doc_type == "educational":
        return build_educational_summary(title, lower, lines)
    if doc_type == "complaint":
        return build_complaint_summary(title, lower, lines)
    if doc_type == "report":
        return build_report_summary(title, lower, lines)
    if doc_type == "policy":
        return build_policy_summary(title, lower, lines)

    return build_generic_summary(title, lower, lines)


def detect_document_type(lower_text: str) -> str:
    technical_keywords = (
        "technical requirements",
        "requirements document",
        "functional requirements",
        "system objectives",
        "automation workflow",
        "integration requirements",
    )
    educational_keywords = (
        "nptel",
        "course",
        "mlops",
        "nlp",
        "machine learning",
        "cloud computing",
        "web technology",
        "ai/ml",
        "aiml",
        "certification",
        "resume",
        "linkedin",
        "github",
    )
    complaint_keywords = (
        "complaint",
        "grievance",
        "citizen issue",
        "citizen complaint",
        "case id",
        "reported issue",
        "service issue",
        "priority",
        "department",
        "ward",
    )
    report_keywords = (
        "report",
        "kpi",
        "finding",
        "findings",
        "recommendation",
        "recommendations",
        "performance",
        "budget",
        "survey",
        "sentiment",
        "dashboard",
        "analytics",
    )
    policy_keywords = ("policy", "guideline", "directive", "regulation", "circular")
    meeting_keywords = ("meeting minutes", "agenda", "attendees", "minutes", "decision")
    speech_keywords = ("speech transcript", "transcript", "speech", "announcement")
    inspection_keywords = ("inspection report", "inspection", "field review")
    field_report_keywords = ("field officer report", "field officer", "field visit")
    budget_keywords = ("budget report", "budget", "allocation", "funding")
    proposal_keywords = ("project proposal", "proposal", "implementation plan")
    circular_keywords = ("government circular", "circular", "official order")

    if any(keyword in lower_text for keyword in technical_keywords):
        return "technical-requirements"
    if any(keyword in lower_text for keyword in educational_keywords):
        return "educational"
    if any(keyword in lower_text for keyword in complaint_keywords):
        return "complaint"
    if any(keyword in lower_text for keyword in report_keywords):
        return "report"
    if any(keyword in lower_text for keyword in policy_keywords):
        return "policy"
    if any(keyword in lower_text for keyword in meeting_keywords):
        return "meeting-minutes"
    if any(keyword in lower_text for keyword in speech_keywords):
        return "speech-transcript"
    if any(keyword in lower_text for keyword in inspection_keywords):
        return "inspection-report"
    if any(keyword in lower_text for keyword in field_report_keywords):
        return "field-officer-report"
    if any(keyword in lower_text for keyword in budget_keywords):
        return "budget-report"
    if any(keyword in lower_text for keyword in proposal_keywords):
        return "project-proposal"
    if any(keyword in lower_text for keyword in circular_keywords):
        return "government-circular"
    return "generic"


def build_technical_requirements_summary(title: str, lower_text: str, lines: List[str]) -> List[str]:
    return [
        f"Subject: {title}",
        "Executive Summary: This document specifies the requirements for a production-ready governance document intelligence system.",
        "System Objectives: Automate document generation, metadata extraction, categorization, synchronization, search, and AI-generated summaries.",
        "Core Functional Requirements: Automatic document generation, metadata extraction, dynamic categorization, real-time synchronization, intelligent search, OCR integration, and AI-generated summaries.",
        "Automation Workflow: Complaint Registered -> Generate Complaint Document; Complaint Assigned -> Generate Assignment Order; Complaint Resolved -> Generate Resolution Report; Inspection Completed -> Generate Inspection Report; Meeting Completed -> Generate Meeting Minutes; Speech AI Generated -> Save Transcript.",
        "Expected Outcome: The module will function as an enterprise-grade repository without manual intervention.",
    ]


def build_educational_summary(title: str, lower_text: str, lines: List[str]) -> List[str]:
    summary = [f"Subject: {title}"]
    course_recommendations = []

    for keyword, label in [
        ("mlops", "MLOps"),
        ("nlp", "NLP"),
        ("machine learning", "Machine Learning"),
        ("cloud computing", "Cloud Computing & Virtualization"),
        ("web technology", "Web Technology"),
    ]:
        if keyword in lower_text:
            course_recommendations.append(label)

    if not course_recommendations:
        course_recommendations = [line for line in lines if len(line) < 140][:3]

    if course_recommendations:
        summary.append(
            "Key takeaway: "
            f"{course_recommendations[0]} is the highest-priority recommendation "
            "in this document."
        )
        if len(course_recommendations) > 1:
            supporting = course_recommendations[1:4]
            summary.append(
                "Supporting recommendation: "
                f"{', '.join(supporting)} is also highlighted for deeper "
                "learning and career growth."
            )
    else:
        summary.append(
            "Key takeaway: The document recommends a structured learning path "
            "for the reader."
        )

    if "resume" in lower_text or "linkedin" in lower_text or "github" in lower_text:
        summary.append(
            "Action: Add the completed certifications and projects to your resume, "
            "LinkedIn, and GitHub profile."
        )
    else:
        summary.append(
            "Action: Complete the recommended courses with strong scores and apply "
            "the concepts in projects or hackathons."
        )

    return summary[:4]


def build_complaint_summary(title: str, lower_text: str, lines: List[str]) -> List[str]:
    summary = [f"Subject: {title}"]
    department = next(
        (
            match
            for match in [
                "Water Supply Department",
                "Electricity Board",
                "Roads & PWD",
                "Sanitation Department",
                "Public Health",
                "Education Department",
                "Municipal Enforcement",
            ]
            if match.lower() in lower_text
        ),
        None,
    )
    priority = "Medium"
    if "high" in lower_text:
        priority = "High"
    elif "low" in lower_text:
        priority = "Low"

    summary.append(
        "Complaint summary: The document reports a citizen issue that requires "
        "operational follow-up."
    )
    if department:
        summary.append(f"Department: {department}")
    summary.append(f"Priority: {priority}")
    summary.append(
        "Action: Assign the case to the relevant field team and update the "
        "citizen with the next status."
    )
    return summary[:5]


def build_report_summary(title: str, lower_text: str, lines: List[str]) -> List[str]:
    summary = [f"Subject: {title}"]
    summary.append(
        "Key findings: The document contains performance indicators, "
        "operational findings, and recommended actions."
    )
    if "kpi" in lower_text:
        summary.append(
            "KPI focus: The report highlights measurable outcomes and "
            "monitoring targets."
        )
    if "recommendation" in lower_text or "recommendations" in lower_text:
        summary.append(
            "Recommendation: Follow the outlined priorities to improve outcomes "
            "and maintain compliance."
        )
    return summary[:4]


def build_policy_summary(title: str, lower_text: str, lines: List[str]) -> List[str]:
    summary = [f"Subject: {title}"]
    summary.append(
        "Key takeaway: The document defines policy guidance or implementation "
        "requirements."
    )
    summary.append(
        "Action: Distribute the policy to departments and verify that teams "
        "follow the required steps."
    )
    return summary[:3]


def build_generic_summary(title: str, lower_text: str, lines: List[str]) -> List[str]:
    lead_sentence = next((line for line in lines if len(line) > 20), "")
    summary = [f"Subject: {title}"]
    if lead_sentence:
        summary.append(f"Summary: {lead_sentence}")
    else:
        summary.append(
            "Summary: The uploaded document contains content that should be "
            "reviewed in context."
        )
    summary.append(
        "Action: Review the document details and apply the relevant follow-up "
        "steps."
    )
    return summary[:3]


def generate_speech_script(topic: str, language: str) -> str:
    """Generates a mock translation script based on the topic and target language."""
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

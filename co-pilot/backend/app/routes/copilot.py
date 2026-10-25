from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from app.database.db import get_db
from app.models.models import DbComplaint, DbOfficer, DbDepartment

router = APIRouter(prefix="/copilot", tags=["copilot"])

class CopilotQuery(BaseModel):
    query: str
    role: Optional[str] = "admin"
    dept: Optional[str] = None

@router.post("/query")
def process_copilot_query(req: CopilotQuery, db: Session = Depends(get_db)):
    q = req.query.lower().strip()

    # Fetch live database facts
    total_complaints = db.query(DbComplaint).count()
    open_complaints = db.query(DbComplaint).filter(DbComplaint.status.notin_(["Resolved", "Closed"])).count()
    high_priority = db.query(DbComplaint).filter(
        DbComplaint.priority == "High",
        DbComplaint.status.notin_(["Resolved", "Closed"])
    ).count()

    # Department breakdown
    depts = db.query(DbDepartment).filter(DbDepartment.active == True).all()
    dept_stats = []
    for d in depts:
        cnt = db.query(DbComplaint).filter(
            DbComplaint.dept == d.name,
            DbComplaint.status.notin_(["Resolved", "Closed"])
        ).count()
        dept_stats.append((d.name, cnt))
    dept_stats.sort(key=lambda x: x[1], reverse=True)

    # Ward breakdown
    complaints = db.query(DbComplaint).all()
    ward_counts: Dict[str, int] = {}
    for c in complaints:
        w = c.ward or "Unknown"
        ward_counts[w] = ward_counts.get(w, 0) + 1
    top_wards = sorted(ward_counts.items(), key=lambda x: x[1], reverse=True)[:3]

    response_markdown = ""
    suggested_actions = []

    if any(k in q for k in ["summary", "overview", "status", "brief", "how many"]):
        top_dept_str = ", ".join([f"{name}: {cnt}" for name, cnt in dept_stats[:3]])
        top_ward_str = ", ".join([f"{w}: {cnt}" for w, cnt in top_wards])

        response_markdown = f"""### 📊 District Grievance Executive Summary

* **Total Registered Grievances:** {total_complaints}
* **Active Open Cases:** {open_complaints}
* **Critical / High Priority Pending:** {high_priority}

#### Department Caseload:
{chr(10).join([f'- **{name}:** {cnt} active cases' for name, cnt in dept_stats[:4]])}

#### Top High-Volume Wards:
{chr(10).join([f'- **{w}:** {cnt} total grievances' for w, cnt in top_wards])}
"""
        suggested_actions = [
            "Review urgent High Priority water supply tickets",
            "Reallocate field officers to top volume wards",
            "Publish district advisory announcement"
        ]

    elif any(k in q for k in ["officer", "workload", "staff", "allocation"]):
        officers = db.query(DbOfficer).filter(DbOfficer.active == True).all()
        off_lines = [f"- **{o.name}** ({o.dept}): {o.current_workload}/{o.max_workload} active tasks ({'Available' if o.current_workload < o.max_workload else 'At Capacity'})" for o in officers]
        response_markdown = f"""### 👷 Field Officer Capacity & Workload

{chr(10).join(off_lines)}

**Recommendation:** Rebalance field tickets away from overburdened officers to maintain sub-24h response times.
"""
        suggested_actions = [
            "Assign pending complaints to available officers",
            "Check officer field resolution uploads"
        ]

    else:
        # Search matching complaints
        matched = []
        for c in complaints:
            if any(term in c.issue.lower() or term in (c.description or "").lower() or term in c.ward.lower() for term in q.split()):
                matched.append(c)

        if matched:
            items_str = "\n".join([f"- **[{c.id}]** ({c.ward} · {c.dept}) - {c.issue} *[Status: {c.status}]*" for c in matched[:5]])
            response_markdown = f"""### 🔍 Query Results ({len(matched)} relevant grievances found)

{items_str}

**Analysis:** Identified {len(matched)} matching civic grievances in active database records.
"""
            suggested_actions = [
                f"Inspect details for {matched[0].id}",
                "Filter dashboard view by this topic"
            ]
        else:
            response_markdown = f"""### 🤖 AI Co-Pilot Governance Insights

Currently tracking **{total_complaints} grievances** across **{len(depts)} municipal departments**.

* Active Open Cases: **{open_complaints}**
* Critical Attention Items: **{high_priority}**

You can ask me to:
- "Summarize department backlogs"
- "Show officer workloads"
- "Analyze water supply complaints in Ward 2"
- "Recommend urgent administrative actions"
"""
            suggested_actions = [
                "Summarize overall grievance health",
                "Review pending high-priority items"
            ]

    return {
        "reply": response_markdown,
        "suggested_actions": suggested_actions,
        "metrics": {
            "total": total_complaints,
            "open": open_complaints,
            "high_priority": high_priority
        }
    }

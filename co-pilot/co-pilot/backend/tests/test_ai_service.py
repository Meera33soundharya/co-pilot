import sys
import unittest
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.services.ai_service import summarize_document


class SummarizeDocumentTests(unittest.TestCase):
    def test_nptel_recommendation_document_is_summarized_contextually(self):
        text = """
        NPTEL Course Recommendations for AIML Students
        MLOps is the highest-priority course for AI/ML career growth.
        NLP is recommended for AI chatbots, RAG systems, AI agents, and LLM applications.
        Machine Learning strengthens AI fundamentals and placement preparation.
        Cloud Computing and Virtualization supports AI deployment and cloud infrastructure.
        Web Technology is useful but offers lower resume value for AIML students.
        """

        summary = summarize_document(text)
        joined = "\n".join(summary).lower()

        self.assertTrue(any("mlops" in item.lower() for item in summary))
        self.assertTrue(any("nlp" in item.lower() for item in summary))
        self.assertTrue(any("cloud" in item.lower() for item in summary))
        self.assertFalse(any("grievance" in item.lower() or "complaint" in item.lower() for item in summary))

    def test_complaint_document_is_summarized_as_a_complaint(self):
        text = """
        Complaint ID: CMP-1024
        Department: Water Supply Department
        Priority: High
        Issue: Water leakage near Block C, Sector 7.
        Citizen reported that the road is flooding and residents are affected.
        """

        summary = summarize_document(text)
        joined = "\n".join(summary).lower()

        self.assertTrue(any("complaint" in item.lower() for item in summary))
        self.assertTrue(any("water" in item.lower() for item in summary))
        self.assertTrue(any("priority" in item.lower() for item in summary))

    def test_technical_requirements_document_is_summarized_with_requirements_sections(self):
        text = """
        Technical Requirements Document
        System Objectives: Transform the Document Management module into a production-ready AI Governance Document Intelligence System.
        Core Functional Requirements: Automatic document generation after workflow completion, metadata extraction, dynamic categorization, and intelligent search.
        Automation Workflow: Complaint Registered -> Generate Complaint Document; Complaint Assigned -> Generate Assignment Order.
        Integration Requirements: API-driven data management and workflow synchronization.
        """

        summary = summarize_document(text)
        joined = "\n".join(summary).lower()

        self.assertTrue(any("executive summary" in item.lower() for item in summary))
        self.assertTrue(any("core functional requirements" in item.lower() for item in summary))
        self.assertTrue(any("automation workflow" in item.lower() for item in summary))
        self.assertFalse(any("identify the responsible department" in item.lower() for item in summary))
        self.assertFalse(any("the document describes a citizen complaint" in item.lower() for item in summary))


if __name__ == "__main__":
    unittest.main()

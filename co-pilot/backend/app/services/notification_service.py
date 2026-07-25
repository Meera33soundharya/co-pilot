import logging

logger = logging.getLogger(__name__)

def notify_field_officer(complaint_id: str, category: str, dept: str):
    """Placeholder to notify the field officer about a new complaint.
    In a real system this could send an email, SMS, or push notification.
    """
    logger.info(f"[Notification] New complaint {complaint_id} (category: {category}) sent to department '{dept}'.")

def notify_citizen(complaint_id: str, status: str, contact: str):
    """Placeholder to notify the citizen about status changes.
    `contact` could be a phone number or email.
    """
    logger.info(f"[Notification] Citizen {contact} notified: complaint {complaint_id} is now '{status}'.")
